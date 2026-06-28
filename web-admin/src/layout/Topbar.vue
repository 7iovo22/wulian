<template>
  <div class="topbar">
    <!-- 左侧 -->
    <div class="topbar-left">
      <el-icon 
        class="collapse-btn" 
        :size="20"
        @click="toggleCollapse"
      >
        <Fold v-if="!isCollapse" />
        <Expand v-else />
      </el-icon>
      
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentRoute.meta.title">
          {{ currentRoute.meta.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <!-- 右侧 -->
    <div class="topbar-right">
      <!-- 消息通知 -->
      <el-badge :value="unhandledAlarmCount" :hidden="unhandledAlarmCount === 0" class="notification-badge">
        <el-icon :size="20" class="notification-icon" @click="goToAlarm">
          <Bell />
        </el-icon>
      </el-badge>
      
      <!-- 用户信息 -->
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32" :src="userInfo.avatar || defaultAvatar">
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
          <span class="user-name">{{ userInfo.nickname || '管理员' }}</span>
          <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人设置
            </el-dropdown-item>
            <el-dropdown-item command="logout" divided>
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

const currentRoute = computed(() => route)
const isCollapse = computed(() => appStore.isCollapse)
const unhandledAlarmCount = computed(() => appStore.unhandledAlarmCount)
const userInfo = computed(() => userStore.userInfo)

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

function toggleCollapse() {
  appStore.toggleCollapse()
}

function goToAlarm() {
  router.push('/alarm-management')
}

function handleCommand(command) {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      router.push('/login')
    })
  } else if (command === 'profile') {
    // 可以跳转到个人设置页面
    router.push('/system-config')
  }
}
</script>

<style scoped>
.topbar {
  height: 60px;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-btn {
  color: #FFFFFF;
  cursor: pointer;
  transition: color 0.3s;
}

.collapse-btn:hover {
  color: var(--accent-color);
}

.el-breadcrumb {
  font-size: 14px;
}

.el-breadcrumb__item {
  color: rgba(255, 255, 255, 0.7);
}

.el-breadcrumb__inner {
  color: rgba(255, 255, 255, 0.7);
}

.el-breadcrumb__inner:hover {
  color: var(--accent-color);
}

.el-breadcrumb__item:last-child .el-breadcrumb__inner {
  color: #FFFFFF;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notification-badge {
  cursor: pointer;
}

.notification-icon {
  color: #FFFFFF;
  transition: color 0.3s;
}

.notification-icon:hover {
  color: var(--accent-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #FFFFFF;
}

.user-name {
  font-size: 14px;
}

.dropdown-icon {
  font-size: 12px;
  transition: transform 0.3s;
}

.user-info:hover .dropdown-icon {
  transform: rotate(180deg);
}
</style>