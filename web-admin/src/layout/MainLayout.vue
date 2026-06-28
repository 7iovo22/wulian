<template>
  <div class="main-layout">
    <!-- 侧边栏 -->
    <Sidebar />
    
    <!-- 右侧内容区 -->
    <div class="content-wrapper">
      <!-- 顶部栏 -->
      <Topbar />
      
      <!-- 主内容区 -->
      <div class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
      
      <!-- 底部版权信息 -->
      <div class="footer">
        <span>© 2024 骑安智盔 - 外卖骑手智能安全监护系统</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
import { useAppStore } from '@/stores/app'
import { getAlarmStats } from '@/api/alarm'

const appStore = useAppStore()

onMounted(async () => {
  // 获取未处理报警数
  try {
    const stats = await getAlarmStats()
    appStore.setUnhandledAlarmCount(stats.unhandled || 0)
  } catch (error) {
    console.error('获取报警统计失败:', error)
  }
})
</script>

<style scoped>
.main-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  background-color: var(--bg-color);
  padding: 20px;
  overflow-y: auto;
}

.footer {
  height: 40px;
  background-color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-light);
  border-top: 1px solid #E8E8E8;
}
</style>