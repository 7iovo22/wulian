<template>
  <div class="login-page">
    <!-- 左侧品牌区域 -->
    <div class="brand-section">
      <div class="brand-content">
        <h1 class="brand-title">守护每一次配送</h1>
        <p class="brand-subtitle">骑安智盔 · 智能安全监护平台</p>
        
        <div class="feature-list">
          <div class="feature-item">
            <span class="feature-dot"></span>
            <span class="feature-text">实时设备监控</span>
          </div>
          <div class="feature-item">
            <span class="feature-dot"></span>
            <span class="feature-text">智能预警中心</span>
          </div>
          <div class="feature-item">
            <span class="feature-dot"></span>
            <span class="feature-text">数据驱动决策</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 右侧登录区域 -->
    <div class="login-section">
      <div class="login-card">
        <h2 class="login-title">登录管理平台</h2>
        
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>
        
        <p class="login-tip">仅限平台授权管理人员登录</p>
      </div>
      
      <!-- 底部版权信息 -->
      <div class="login-footer">
        <span>© 2024 骑安智盔 - 外卖骑手智能安全监护系统</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { adminLogin } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

async function handleLogin() {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    // 调用登录接口
    const res = await adminLogin({
      username: loginForm.username,
      password: loginForm.password
    })
    
    // 存储token和用户信息
    userStore.setToken(res.token)
    userStore.setUserInfo(res)
    
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (error) {
    if (error !== false) {
      console.error('登录失败:', error)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  width: 100%;
  height: 100vh;
  display: flex;
  overflow: hidden;
}

/* 左侧品牌区域 */
.brand-section {
  width: 60%;
  background: linear-gradient(135deg, #1E2B4F 0%, #2D4A7A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-content {
  text-align: center;
  padding: 40px;
}

.brand-title {
  font-size: 48px;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 20px;
  letter-spacing: 4px;
}

.brand-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 60px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.feature-dot {
  width: 12px;
  height: 12px;
  background-color: var(--accent-color);
  border-radius: 50%;
}

.feature-text {
  font-size: 18px;
  color: #FFFFFF;
}

/* 右侧登录区域 */
.login-section {
  width: 40%;
  background-color: var(--bg-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  width: 400px;
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.login-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 30px;
}

.login-form {
  width: 100%;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.login-btn:hover {
  background-color: var(--primary-light);
  border-color: var(--primary-light);
}

.login-tip {
  text-align: center;
  font-size: 12px;
  color: var(--text-light);
  margin-top: 20px;
}

.login-footer {
  position: absolute;
  bottom: 20px;
  text-align: center;
  font-size: 12px;
  color: var(--text-light);
}
</style>