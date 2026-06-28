import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 侧边栏折叠状态
  const isCollapse = ref(false)

  // 未处理报警数
  const unhandledAlarmCount = ref(0)

  // 切换侧边栏折叠
  function toggleCollapse() {
    isCollapse.value = !isCollapse.value
  }

  // 设置未处理报警数
  function setUnhandledAlarmCount(count) {
    unhandledAlarmCount.value = count
  }

  return {
    isCollapse,
    unhandledAlarmCount,
    toggleCollapse,
    setUnhandledAlarmCount
  }
})