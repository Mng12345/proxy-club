import { ElButton, ElMessage, ElOption, ElSelect, ElTooltip } from "element-plus";
import { defineComponent, ref } from "vue";
import { FileUtil } from "../utils/FileUtil";
import { getFilePath, rePkgDifyPlugin, type Platform } from "@app/preload"

export default defineComponent(() => {

  const filePath = ref<string | undefined>()
  const uploadFile = async () => {
    const file = await FileUtil.upload(['.difypkg'])
    filePath.value = getFilePath(file)
  }
  const convertLoading = ref(false)
  const errorInfo = ref<string | undefined>()
  const platform = ref<Platform>('amd64')

  const doConvert = async () => {
    if (!filePath.value) {
      ElMessage.error('请先上传文件')
      return
    }
    convertLoading.value = true
    try {
      const result = await rePkgDifyPlugin(filePath.value, platform.value)
      if (result.type === 'err') {
        errorInfo.value = result.value
        return
      } else {
        ElMessage.success('转换成功，请到原目录查看')
        errorInfo.value = undefined
      }
    } finally {
      convertLoading.value = false
    }
  }

  return () => (
    <div class={'w-full'}>
      {errorInfo.value && <div class={'text-red-500 border-red-500 border-solid border rounded p-4 text-center w-full'}>
        {errorInfo.value}
      </div>}
      <div class={'mt-4 flex items-center justify-center'}>
        打包平台:
        <ElSelect placeholder="请选择平台" v-model={platform.value} class="!w-[200px] ml-3">
          <ElOption label={'amd64'} value={'amd64'}></ElOption>
          <ElOption label={'arm64'} value={'arm64'}></ElOption>
        </ElSelect>
      </div>
      <div class={'mt-4 flex items-center justify-center'}>
        <ElTooltip content="请到dify插件市场下载离线插件">
          <ElButton type="primary" onClick={uploadFile}>选择本地文件</ElButton>
        </ElTooltip>
        {filePath.value && <ElButton onClick={doConvert} loading={convertLoading.value}>开始转换</ElButton>}
      </div>
      {filePath.value && <div class={'text-[#666] w-full text-center mt-4'}>当前文件路径: {filePath.value}</div>}
    </div>
  )
})
