<template>
  <div class="user-management-page">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="filterRole" placeholder="角色" clearable style="width: 150px">
        <el-option label="全部" value="" />
        <el-option label="管理员" value="admin" />
        <el-option label="运维人员" value="operator" />
        <el-option label="骑手" value="rider" />
        <el-option label="紧急联系人" value="contact" />
      </el-select>
      
      <el-select v-model="filterStatus" placeholder="账号状态" clearable style="width: 150px">
        <el-option label="全部" value="" />
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      
      <el-input 
        v-model="filterKeyword" 
        placeholder="关键词搜索" 
        clearable 
        style="width: 200px"
        :prefix-icon="Search"
      />
      
      <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
      <el-button :icon="Refresh" @click="handleReset">重置</el-button>
      
      <el-button type="primary" :icon="Plus" @click="addUser">新增用户</el-button>
      <el-button type="success" :icon="Upload" @click="batchImport">批量导入</el-button>
    </div>
    
    <!-- 用户列表表格 -->
    <div class="table-section">
      <el-table :data="userList" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar || defaultAvatar">
              <el-icon><UserFilled /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="roleMap[row.role]?.color || 'info'" size="small">
              {{ roleMap[row.role]?.label || row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deviceSn" label="绑定设备ID" width="180">
          <template #default="{ row }">
            {{ row.deviceSn || '未绑定' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="账号状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editUser(row)">
              编辑
            </el-button>
            <el-button 
              :type="row.status === 1 ? 'danger' : 'success'" 
              link 
              size="small" 
              @click="toggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="warning" link size="small" @click="resetPassword(row)">
              重置密码
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="userDialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="500px">
      <el-form ref="userFormRef" :model="userForm" :rules="userRules" label-width="80px">
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
          >
            <el-avatar :size="80" :src="userForm.avatar || defaultAvatar">
              <el-icon><Plus /></el-icon>
            </el-avatar>
          </el-upload>
        </el-form-item>
        <el-form-item prop="nickname" label="姓名">
          <el-input v-model="userForm.nickname" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item prop="phone" label="手机号">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item prop="role" label="角色">
          <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="运维人员" value="operator" />
            <el-option label="骑手" value="rider" />
            <el-option label="紧急联系人" value="contact" />
          </el-select>
        </el-form-item>
        <el-form-item label="绑定设备">
          <el-select v-model="userForm.deviceId" placeholder="请选择绑定设备" clearable style="width: 100%">
            <el-option 
              v-for="device in deviceList" 
              :key="device.id" 
              :label="device.deviceSn" 
              :value="device.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUser">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 批量导入弹窗 -->
    <el-dialog v-model="importDialogVisible" title="批量导入用户" width="500px">
      <el-upload
        class="upload-area"
        drag
        action="/api/user/batch-import"
        accept=".xlsx,.xls"
        :on-success="handleImportSuccess"
        :before-upload="beforeImportUpload"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将Excel文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传xlsx/xls文件，且文件大小不超过5MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Upload, UserFilled, UploadFilled } from '@element-plus/icons-vue'
import { getUserList, addUser as addUserApi, updateUser as updateUserApi, toggleUserStatus, resetPassword as resetPasswordApi } from '@/api/user'
import { getDeviceList } from '@/api/device'
import { formatDateTime, roleMap } from '@/utils/helpers'

const loading = ref(false)
const userList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)
const deviceList = ref([])

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 筛选条件
const filterRole = ref('')
const filterStatus = ref('')
const filterKeyword = ref('')

// 用户弹窗
const userDialogVisible = ref(false)
const isEdit = ref(false)
const userFormRef = ref(null)
const userForm = reactive({
  id: null,
  avatar: '',
  nickname: '',
  phone: '',
  role: '',
  deviceId: null
})

const userRules = {
  nickname: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 导入弹窗
const importDialogVisible = ref(false)

// 获取用户列表
async function fetchUserList() {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      role: filterRole.value,
      status: filterStatus.value,
      keyword: filterKeyword.value
    }
    
    const res = await getUserList(params)
    userList.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取设备列表
async function fetchDeviceList() {
  try {
    const res = await getDeviceList({ pageSize: 100 })
    deviceList.value = res.list || []
  } catch (error) {
    console.error('获取设备列表失败:', error)
  }
}

// 搜索
function handleSearch() {
  pageNum.value = 1
  fetchUserList()
}

// 重置
function handleReset() {
  filterRole.value = ''
  filterStatus.value = ''
  filterKeyword.value = ''
  pageNum.value = 1
  fetchUserList()
}

// 分页
function handleSizeChange(val) {
  pageSize.value = val
  fetchUserList()
}

function handleCurrentChange(val) {
  pageNum.value = val
  fetchUserList()
}

// 新增用户
function addUser() {
  isEdit.value = false
  userForm.id = null
  userForm.avatar = ''
  userForm.nickname = ''
  userForm.phone = ''
  userForm.role = ''
  userForm.deviceId = null
  userDialogVisible.value = true
}

// 编辑用户
function editUser(row) {
  isEdit.value = true
  userForm.id = row.id
  userForm.avatar = row.avatar
  userForm.nickname = row.nickname
  userForm.phone = row.phone
  userForm.role = row.role
  userForm.deviceId = row.deviceId
  userDialogVisible.value = true
}

// 上传头像成功
function handleAvatarSuccess(response) {
  userForm.avatar = response.url
}

// 提交用户
async function submitUser() {
  if (!userFormRef.value) return
  
  try {
    await userFormRef.value.validate()
    
    if (isEdit.value) {
      await updateUserApi(userForm.id, userForm)
      ElMessage.success('更新成功')
    } else {
      await addUserApi(userForm)
      ElMessage.success('添加成功')
    }
    
    userDialogVisible.value = false
    fetchUserList()
  } catch (error) {
    if (error !== false) {
      console.error('提交失败:', error)
    }
  }
}

// 切换状态
async function toggleStatus(row) {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 0 ? '禁用' : '启用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 ${row.nickname} 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await toggleUserStatus(row.id, newStatus)
    ElMessage.success(`${action}成功`)
    fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
    }
  }
}

// 重置密码
async function resetPassword(row) {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 ${row.nickname} 的密码吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await resetPasswordApi(row.id)
    ElMessage.success('密码已重置为默认密码')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error)
    }
  }
}

// 批量导入
function batchImport() {
  importDialogVisible.value = true
}

// 导入前校验
function beforeImportUpload(file) {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel'
  const isLt5M = file.size / 1024 / 1024 < 5
  
  if (!isExcel) {
    ElMessage.error('只能上传Excel文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('文件大小不能超过5MB!')
    return false
  }
  return true
}

// 导入成功
function handleImportSuccess(response) {
  if (response.code === 200) {
    ElMessage.success(`成功导入 ${response.data.successCount} 条数据`)
    importDialogVisible.value = false
    fetchUserList()
  } else {
    ElMessage.error(response.message || '导入失败')
  }
}

onMounted(() => {
  fetchUserList()
  fetchDeviceList()
})
</script>

<style scoped>
.user-management-page {
  min-height: 100%;
}

/* 筛选栏 */
.filter-bar {
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 表格区域 */
.table-section {
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 头像上传 */
.avatar-uploader {
  display: inline-block;
}

.avatar-uploader .el-avatar {
  cursor: pointer;
}

/* 上传区域 */
.upload-area {
  width: 100%;
}

.el-icon--upload {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 16px;
}

.el-upload__tip {
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}
</style>