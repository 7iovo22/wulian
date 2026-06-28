<template>
  <div class="sidebar" :class="{ 'is-collapse': isCollapse }">
    <!-- Logo区域 -->
    <div class="logo-area">
      <div class="logo">
        <el-icon :size="28"><Helmet /></el-icon>
      </div>
      <span class="logo-text" v-show="!isCollapse">骑安智盔</span>
    </div>
    
    <!-- 菜单区域 -->
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      :collapse-transition="false"
      class="sidebar-menu"
      background-color="#1E2B4F"
      text-color="#FFFFFF"
      active-text-color="#F5A623"
      router
    >
      <el-menu-item index="/dashboard">
        <el-icon><DataAnalysis /></el-icon>
        <template #title>数据看板</template>
      </el-menu-item>
      
      <el-menu-item index="/device-monitor">
        <el-icon><Monitor /></el-icon>
        <template #title>设备监控</template>
      </el-menu-item>
      
      <el-menu-item index="/data-statistics">
        <el-icon><TrendCharts /></el-icon>
        <template #title>数据统计</template>
      </el-menu-item>
      
      <el-menu-item index="/alarm-management">
        <el-icon><Bell /></el-icon>
        <template #title>报警管理</template>
      </el-menu-item>
      
      <el-menu-item index="/user-management">
        <el-icon><User /></el-icon>
        <template #title>用户管理</template>
      </el-menu-item>
      
      <el-menu-item index="/system-config">
        <el-icon><Setting /></el-icon>
        <template #title>系统配置</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const appStore = useAppStore()

const activeMenu = computed(() => route.path)
const isCollapse = computed(() => appStore.isCollapse)
</script>

<style scoped>
.sidebar {
  width: 220px;
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar.is-collapse {
  width: 64px;
}

.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background-color: var(--primary-color);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  color: var(--accent-color);
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: #FFFFFF;
  margin-left: 10px;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
  height: calc(100% - 60px);
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.el-menu-item {
  height: 50px;
  line-height: 50px;
}

.el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.el-menu-item.is-active {
  background-color: rgba(245, 166, 35, 0.1) !important;
}
</style>