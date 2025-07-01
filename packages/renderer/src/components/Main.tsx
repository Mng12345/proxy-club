import { ElTabPane, ElTabs } from "element-plus";
import { defineComponent, ref } from "vue";
import ProxySetting from "./ProxySetting";
import ServerSetting from "./ServerSetting";

export default defineComponent(() => {
  const tab = ref<'utils' | 'servers'>('utils')

  return () => (
    <div class={'w-full'}>
      <ElTabs v-model={tab.value} class={'rounded-lg overflow-hidden'} type="border-card">
        <ElTabPane label="代理设置" name="utils">
          <ProxySetting />
        </ElTabPane>
        <ElTabPane label="代理服务器" name="servers">
          <ServerSetting />
        </ElTabPane>
      </ElTabs>
    </div>
  )
})
