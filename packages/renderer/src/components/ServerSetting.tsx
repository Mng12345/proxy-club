import { UidUtils, type IServerProxy } from "@app/shared";
import { defineComponent, onActivated, onMounted, ref } from "vue";
import * as api from "@app/preload";
import { required } from "../utils/required";
import {
  ElButton,
  ElDialog,
  ElDivider,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElSwitch,
  ElTable,
  ElTableColumn,
  ElTag,
} from "element-plus";
import { ModuleResult, type Result } from "mng-base/dist/result";

export default defineComponent(() => {
  const proxies = ref<IServerProxy[]>([]);

  const getLoading = ref(false);
  const getProxies = async () => {
    getLoading.value = true;
    try {
      const result =await api.getServerProxies();
      if (result.type === "ok") {
        proxies.value = result.value
      } else {
        ElMessage.error(result.value);
      }
    } finally {
      getLoading.value = false;
    }
  };

  const delLoading = ref(false);
  const delProxy = async (uid: string) => {
    delLoading.value = true;
    try {
      await api.delServerProxy(uid);
      await getProxies();
    } finally {
      delLoading.value = false;
    }
  };

  onMounted(getProxies);
  onActivated(getProxies);

  const dialogType = ref<"add" | "edit">("add");
  const dialogVisible = ref(false);
  type AddForm = Partial<Omit<IServerProxy, "uid" | "proxyRules">> & {
    proxyRules: (Partial<Omit<IServerProxy["proxyRules"][number], "uid">> & {
      uid: string;
    })[];
  };
  type EditForm = AddForm & { uid: string };
  const addForm = ref<AddForm>({
    proxyRules: [],
  });
  const editForm = ref<EditForm | undefined>();

  const clickAdd = () => {
    dialogType.value = "add";
    addForm.value = {
      name: `代理服务器${proxies.value.length + 1}`,
      closed: false,
      proxyRules: [],
    };
    dialogVisible.value = true;
  };

  const clickEdit = (proxy: IServerProxy) => {
    dialogType.value = "edit";
    editForm.value = {
      uid: proxy.uid,
      name: proxy.name,
      port: proxy.port,
      closed: proxy.closed,
      proxyRules: proxy.proxyRules,
    };
    dialogVisible.value = true;
  };

  const rules = {
    name: [required],
    port: [required],
    proxyRules: [required],
  };

  const formRef = ref<InstanceType<typeof ElForm> | null>(null);

  const validateProxyRules = (
    proxyRules: AddForm["proxyRules"]
  ): Result<IServerProxy["proxyRules"], string> => {
    const result: IServerProxy["proxyRules"] = [];
    for (let i = 0; i < proxyRules.length; i++) {
      const rule = proxyRules[i];
      if (!rule.name) {
        return ModuleResult.err<IServerProxy["proxyRules"], string>(
          `第${i + 1}条代理规则名称不能为空`
        );
      }
      if (!rule.path) {
        return ModuleResult.err<IServerProxy["proxyRules"], string>(
          `第${i + 1}条代理规则路径不能为空`
        );
      }
      if (!rule.remoteServer) {
        return ModuleResult.err<IServerProxy["proxyRules"], string>(
          `第${i + 1}条代理规则远程服务器不能为空`
        );
      }
      const item: IServerProxy["proxyRules"][number] = {
        uid: rule.uid,
        name: rule.name,
        path: rule.path,
        remoteServer: rule.remoteServer,
        closed: rule.closed ?? false,
      };
      result.push(item);
    }
    return ModuleResult.ok<IServerProxy["proxyRules"], string>(result);
  };

  const submitLoading = ref(false);
  const submit = async () => {
    const handle = async () => {
      if (!formRef.value) {
        return;
      }
      const isValid = await formRef.value.validate();
      if (!isValid) {
        return;
      }
      const form = dialogType.value === "add" ? addForm.value : editForm.value;
      if (!form) {
        return;
      }
      if (!form.name || !form.port || !form.proxyRules) {
        return;
      }
      const proxyRulesResult = validateProxyRules(form.proxyRules);
      if (proxyRulesResult.type === "err") {
        ElMessage.error(proxyRulesResult.value);
        return;
      }
      if (proxyRulesResult.value.length === 0) {
        ElMessage.error("至少需要配置一个规则");
        return;
      }
      const data: Omit<IServerProxy, "uid"> = {
        name: form.name,
        port: form.port,
        closed: form.closed ?? false,
        proxyRules: proxyRulesResult.value,
      };
      if (dialogType.value === "add") {
        const result = await api.addServerProxy({ ...data, uid: UidUtils.uid() });
        if (result.type === "err") {
          ElMessage.error(result.value);
          return
        }
        ElMessage.success("添加成功");
      } else {
        if (!editForm.value) {
          return;
        }
        const result = await api.updateServerProxy({ ...data, uid: editForm.value.uid });
        if (result.type === "err") {
          ElMessage.error(result.value);
          return
        }
        ElMessage.success("修改成功");
      }
      dialogVisible.value = false;
      await getProxies();
    };
    try {
      submitLoading.value = true;
      await handle();
    } finally {
      submitLoading.value = false;
    }
  };

  const cancel = async () => {
    dialogVisible.value = false;
    addForm.value = {
      proxyRules: [],
    };
    editForm.value = undefined;
  };

  // const showRules = ref(false);
  // const activeProxy = ref<IServerProxy | undefined>();
  // const clickShowRules = (proxy: IServerProxy) => {
  //   activeProxy.value = proxy;
  //   showRules.value = true;
  // };

  const addRule = () => {
    if (dialogType.value === "add") {
      addForm.value.proxyRules.push({
        uid: UidUtils.uid(),
        name: `规则${addForm.value.proxyRules.length + 1}`,
        closed: false,
      });
    } else {
      if (editForm.value) {
        editForm.value.proxyRules.push({
          uid: UidUtils.uid(),
          name: `规则${editForm.value.proxyRules.length + 1}`,
          closed: false,
        });
      }
    }
  };

  const delRule = (ruleId: string) => {
    if (dialogType.value === "add") {
      addForm.value.proxyRules = addForm.value.proxyRules.filter(
        (rule) => rule.uid !== ruleId
      );
    } else {
      if (editForm.value) {
        editForm.value.proxyRules = editForm.value.proxyRules.filter(
          (rule) => rule.uid !== ruleId
        );
      }
    }
  };

  return () => (
    <div class={"w-full h-full"}>
      <div class={"mt-4"}>
        <ElButton type="primary" onClick={clickAdd}>
          新增代理服务器
        </ElButton>
      </div>
      <ElTable
        data={proxies.value}
        border
        class={"mt-4"}
        v-loading={getLoading.value}
      >
        <ElTableColumn
          label="序号"
          type="index"
          align="center"
          width={80}
        ></ElTableColumn>
        <ElTableColumn label="名称" prop="name" align="center"></ElTableColumn>
        <ElTableColumn label="端口" prop="port" align="center"></ElTableColumn>
        <ElTableColumn label="状态" prop="closed" align="center">
          {{
            default: ({ row }: { row: IServerProxy }) => (
              <ElTag type={row.closed ? "danger" : "success"}>
                {row.closed ? "已关闭" : "已开启"}
              </ElTag>
            ),
          }}
        </ElTableColumn>
        {/* <ElTableColumn label="代理规则" prop="proxyRules" align="center">
          {{
            default: ({ row }: { row: IServerProxy }) => {
              return (
                <ElButton type="text" onClick={() => clickShowRules(row)}>
                  查看规则列表
                </ElButton>
              );
            },
          }}
        </ElTableColumn> */}
        <ElTableColumn label="操作" align="center">
          {{
            default: ({ row }: { row: IServerProxy }) => (
              <div class={"flex justify-center items-center w-full flex-wrap"}>
                <ElButton type="text" onClick={() => clickEdit(row)}>
                  编辑
                </ElButton>
                <ElButton type="text" onClick={() => delProxy(row.uid)}>
                  删除
                </ElButton>
              </div>
            ),
          }}
        </ElTableColumn>
      </ElTable>
      <ElDialog
        title={dialogType.value === "add" ? "新增代理服务器" : "编辑代理服务器"}
        v-model={dialogVisible.value}
      >
        {{
          default: () => (
            <div class={"w-full"}>
              <ElForm
                ref={formRef}
                rules={rules}
                model={
                  dialogType.value === "add" ? addForm.value : editForm.value
                }
                labelPosition="right"
                labelWidth={"auto"}
              >
                <ElFormItem label="名称" prop="name">
                  {addForm.value !== undefined &&
                    dialogType.value === "add" && (
                      <ElInput
                        v-model={addForm.value.name}
                        placeholder="请输入名称"
                      />
                    )}
                  {editForm.value !== undefined &&
                    dialogType.value === "edit" && (
                      <ElInput
                        v-model={editForm.value.name}
                        placeholder="请输入名称"
                      />
                    )}
                </ElFormItem>
                <ElFormItem label="端口" prop="port">
                  {addForm.value !== undefined &&
                    dialogType.value === "add" && (
                      <ElInputNumber
                        class={"!w-[200px]"}
                        v-model={addForm.value.port}
                        placeholder="请输入端口"
                      />
                    )}
                  {editForm.value !== undefined &&
                    dialogType.value === "edit" && (
                      <ElInputNumber
                        class={"!w-[200px]"}
                        v-model={editForm.value.port}
                        placeholder="请输入端口"
                      />
                    )}
                </ElFormItem>
                <ElFormItem label="状态" prop="closed">
                  {addForm.value !== undefined &&
                    dialogType.value === "add" && (
                      <ElSwitch modelValue={!addForm.value.closed} onUpdate:modelValue={v => {addForm.value.closed = !v}} />
                    )}
                  {editForm.value !== undefined &&
                    dialogType.value === "edit" && (
                      <ElSwitch modelValue={!editForm.value.closed} onUpdate:modelValue={v => {editForm.value && (editForm.value.closed = !v)}} />
                    )}
                </ElFormItem>
                <ElFormItem label="代理规则">
                  <div class={"!w-full"}>
                    <ElButton type="primary" onClick={addRule}>
                      添加
                    </ElButton>
                    <div class={"mt-4"}>
                      {(
                        dialogType.value === 'add' ? addForm.value.proxyRules : (editForm.value?.proxyRules ?? [])
                      ).map((rule, index) => (
                        <div
                          class={
                            "mb-2 border border-solid border-gray-200 rounded p-2 box-border !w-full"
                          }
                          key={rule.uid}
                        >
                          <div
                            class={"w-full flex items-center justify-between"}
                          >
                            <div>规则{index + 1}</div>
                            <ElButton
                              type="danger"
                              onClick={() => delRule(rule.uid)}
                            >
                              删除
                            </ElButton>
                          </div>
                          <ElForm
                            labelPosition="right"
                            labelWidth={"auto"}
                            class={"mt-2"}
                          >
                            <ElFormItem label="名称" required class={"!mb-4"}>
                              <ElInput
                                v-model={rule.name}
                                placeholder="请输入名称"
                              />
                            </ElFormItem>
                            <ElFormItem label="路径" required class={"!mb-4"}>
                              <ElInput
                                v-model={rule.path}
                                placeholder="请输入路径"
                              />
                            </ElFormItem>
                            <ElFormItem
                              label="服务器地址"
                              required
                              class={"!mb-4"}
                            >
                              <ElInput
                                v-model={rule.remoteServer}
                                placeholder="请输入服务器地址"
                              />
                            </ElFormItem>
                            <ElFormItem label="状态" required>
                              <ElSwitch modelValue={!rule.closed} onUpdate:modelValue={v => {rule.closed = !v}} />
                            </ElFormItem>
                          </ElForm>
                        </div>
                      ))}
                    </div>
                  </div>
                </ElFormItem>
                <ElFormItem>
                  <ElButton
                    type="primary"
                    loading={submitLoading.value}
                    onClick={submit}
                  >
                    确定
                  </ElButton>
                  <ElButton type="default" onClick={cancel}>
                    取消
                  </ElButton>
                </ElFormItem>
              </ElForm>
            </div>
          ),
        }}
      </ElDialog>
    </div>
  );
});
