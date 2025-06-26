import type { IProxy } from "@app/shared"
import { ElButton, ElForm, ElFormItem, ElInput } from "element-plus"
import { defineComponent, ref, watch } from "vue"

export default defineComponent((props: {
  config: {
    proxy: IProxy
    onChangeUrl: (url: string) => void
    onOpen: () => Promise<void>
    onClose: () => Promise<void>
  }
}) => {

  const url = ref<string | undefined>(props.config.proxy.url)
  watch(() => props.config.proxy.url, () => {
    url.value = props.config.proxy.url
  })

  const openLoading = ref(false)
  const open = async () => {
    openLoading.value = true
    try {
      await props.config.onOpen()
    } finally {
      openLoading.value = false
    }
  }
  const closeLoading = ref(false)
  const close = async () => {
    closeLoading.value = true
    try {
      await props.config.onClose()
    } finally {
      closeLoading.value = false
    }
  }

  return () => (
    <div class={'p-4 box-border'}>
      <ElForm labelPosition="top">
        <ElFormItem label="代理地址">
          <ElInput v-model={url.value} onChange={props.config.onChangeUrl} placeholder="请输入代理地址" />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" onClick={open} loading={openLoading.value}>开启</ElButton>
          <ElButton type="danger" onClick={close} loading={closeLoading.value}>关闭</ElButton>
        </ElFormItem>
      </ElForm>
    </div>
  )
}, {
  props: ['config']
})
