import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/layout',
    name: 'Layout',
    component: () => import('@/layout/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '数据看板', icon: 'DataAnalysis' }
      },
      {
        path: '/device-monitor',
        name: 'DeviceMonitor',
        component: () => import('@/views/device-monitor/index.vue'),
        meta: { title: '设备监控', icon: 'Monitor' }
      },
      {
        path: '/data-statistics',
        name: 'DataStatistics',
        component: () => import('@/views/data-statistics/index.vue'),
        meta: { title: '数据统计', icon: 'TrendCharts' }
      },
      {
        path: '/alarm-management',
        name: 'AlarmManagement',
        component: () => import('@/views/alarm-management/index.vue'),
        meta: { title: '报警管理', icon: 'Bell' }
      },
      {
        path: '/user-management',
        name: 'UserManagement',
        component: () => import('@/views/user-management/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: '/system-config',
        name: 'SystemConfig',
        component: () => import('@/views/system-config/index.vue'),
        meta: { title: '系统配置', icon: 'Setting' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token || localStorage.getItem('token')

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 骑安智盔` : '骑安智盔管理平台'

  // 未登录访问非登录页 -> 重定向到登录页
  if (!token && to.path !== '/login') {
    next('/login')
  }
  // 已登录访问登录页 -> 重定向到首页
  else if (token && to.path === '/login') {
    next('/dashboard')
  }
  else {
    next()
  }
})

export default router