import { defineComponent, onActivated, onMounted, ref } from "vue";
import {getProxies as getProxiesApi, updateProxy, openProxy, closeProxy} from '@app/preload'
import type { IProxy } from "@app/shared";
import { ElMessage, ElTabPane, ElTabs } from "element-plus";
import ProxyItem from "./ProxyItem";
import debounce from "debounce";

export default defineComponent(() => {

  const proxies = ref<IProxy[]>([])
  const activeProxyName = ref<string | undefined>()

  const init = async () => {
    await getProxies()
    if (proxies.value.length > 0) {
      activeProxyName.value = proxies.value[0].name
    }
  }

  const getProxies = async () => {
    proxies.value = await getProxiesApi()
  }

  onMounted(init)
  onActivated(init)

  const onChangeUrl = async (name: string, url: string) => {
    try {
      await updateProxy({name, url})
      await getProxies()
    } catch (e) {
      console.log(`onChangeUrl error: `, e)
    }
  }
  const onChangeUrlDebounce = debounce(onChangeUrl, 300)

  const onOpen = async (name: string) => {
    try {
      const result =await openProxy(name)
      if (result.type === 'ok') {
        ElMessage.success('开启成功')
      } else {
        ElMessage.error(result.value)
      }
    } catch (e) {
      ElMessage.error('开启失败')
    }
  }

  const onClose = async (name: string) => {
    try {
      const result = await closeProxy(name)
      if (result.type === 'ok') {
        ElMessage.success('关闭成功')
      } else {
        ElMessage.error(result.value)
      }
    } catch (e) {
      ElMessage.error('关闭失败')
    }
  }

  return () => (
    <ElTabs class='w-full rounded-lg overflow-hidden' type="border-card" modelValue={activeProxyName.value} onTabClick={(params) => {
      activeProxyName.value = typeof params.paneName === 'string' ? params.paneName : undefined
    }}>
      {proxies.value.map((proxy) => (
        <ElTabPane label={proxy.name} name={proxy.name} key={proxy.name}>
          <ProxyItem
            config={{
              proxy,
              onChangeUrl: url => onChangeUrlDebounce(proxy.name, url),
              onOpen: () => onOpen(proxy.name),
              onClose: () => onClose(proxy.name),
            }}
          />
        </ElTabPane>
      ))}

    </ElTabs>
  )
})
