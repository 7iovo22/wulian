<template>
  <div class="alarm-management-page">
    <!-- 筛选条件 -->
    <div class="filter-bar">
      <el-select v-model="filterAlarmType" placeholder="报警类型" clearable style="width: 150px">
        <el-option label="全部" value="" />
        <el-option label="摔倒检测" value="fall" />
        <el-option label="SOS求助" value="sos" />
        <el-option label="疲劳预警" value="fatigue" />
        <el-option label="中暑预警" value="heat" />
        <el-option label="危险驾驶" value="danger" />
      </el-select>
      
      <el-select v-model="filterHandleStatus" placeholder="处理状态" clearable style="width: 150px">
        <el-option label="全部" value="" />
        <el-option label="待处理" :value="0" />
        <el-option label="处理中" :value="1" />
        <el-option label="已完成" :value="2" />
      </el-select>
      
      <el-date-picker
        v-model="filterDateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="width: 240px"
      />
      
      <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
      <el-button :icon="Refresh" @click="handleReset">重置</el-button>
    </div>
    
    <!-- 工单列表表格 -->
    <div class="table-section">
      <el-table 
        :data="alarmList" 
        stripe 
        v-loading="loading"
        :row-class-name="getRowClassName"
        style="width: 100%"
      >
        <el-table-column prop="id" label="工单编号" width="100" />
        <el-table-column prop="riderName" label="骑手姓名" width="120" />
        <el-table-column prop="alarmType" label="报警类型" width="120">
          <template #default="{ row }">
            <el-tag :type="alarmTypeMap[row.alarmType]?.color || 'info'" size="small">
              {{ alarmTypeMap[row.alarmType]?.label || row.alarmType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="报警时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" min-width="200">
          <template #default="{ row }">
            {{ row.longitude && row.latitude ? `${row.longitude}, ${row.latitude}` : '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="handleStatus" label="处理状态" width="100">
          <template #default="{ row }">
            <el-tag :type="handleStatusMap[row.handleStatus]?.color || 'info'" size="small">
              {{ handleStatusMap[row.handleStatus]?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="assignAlarm(row)" v-if="row.handleStatus === 0">
              分配
            </el-button>
            <el-button type="warning" link size="small" @click="handleAlarm(row)" v-if="row.handleStatus === 0 || row.handleStatus === 1">
              处理
            </el-button>
            <el-button type="info" link size="small" @click="viewAlarmDetail(row)">
              查看详情
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
    
    <!-- 分配弹窗 -->
    <el-dialog v-model="assignDialogVisible" title="分配工单" width="400px">
      <el-form :model="assignForm" label-width="80px">
        <el-form-item label="运维人员">
          <el-select v-model="assignForm.operatorId" placeholder="请选择运维人员" style="width: 100%">
            <el-option 
              v-for="operator in operatorList" 
              :key="operator.id" 
              :label="operator.nickname" 
              :value="operator.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssign">确定分配</el-button>
      </template>
    </el-dialog>
    
    <!-- 处理弹窗 -->
    <el-dialog v-model="handleDialogVisible" title="处理工单" width="500px">
      <el-form :model="handleForm" label-width="80px">
        <el-form-item label="处理备注">
          <el-input 
            v-model="handleForm.remark" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入处理备注"
          />
        </el-form-item>
        <el-form-item label="上传截图">
          <el-upload
            action="/api/upload"
            list-type="picture-card"
            :limit="3"
            :on-success="handleUploadSuccess"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="处理结果">
          <el-radio-group v-model="handleForm.status">
            <el-radio :label="1">处理中</el-radio>
            <el-radio :label="2">已完成</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitHandle">提交处理</el-button>
      </template>
    </el-dialog>
    
    <!-- 详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="工单详情"
      direction="rtl"
      size="50%"
    >
      <div class="alarm-detail" v-if="currentAlarm">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3 class="section-title">基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="工单编号">{{ currentAlarm.id }}</el-descriptions-item>
            <el-descriptions-item label="骑手姓名">{{ currentAlarm.riderName }}</el-descriptions-item>
            <el-descriptions-item label="报警类型">
              <el-tag :type="alarmTypeMap[currentAlarm.alarmType]?.color || 'info'" size="small">
                {{ alarmTypeMap[currentAlarm.alarmType]?.label || currentAlarm.alarmType }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="报警时间">{{ formatDateTime(currentAlarm.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="报警内容" :span="2">{{ currentAlarm.alarmContent }}</el-descriptions-item>
            <el-descriptions-item label="报警位置" :span="2">
              {{ currentAlarm.longitude && currentAlarm.latitude ? `${currentAlarm.longitude}, ${currentAlarm.latitude}` : '未知' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
        <!-- 位置地图 -->
        <div class="detail-section">
          <h3 class="section-title">骑手位置</h3>
          <div class="map-container">
            <el-empty description="地图加载中..." />
          </div>
        </div>
        
        <!-- 处理流转记录 -->
        <div class="detail-section">
          <h3 class="section-title">处理流转记录</h3>
          <el-timeline>
            <el-timeline-item
              v-for="(record, index) in handleRecords"
              :key="index"
              :timestamp="formatDateTime(record.time)"
              :type="record.type"
              placement="top"
            >
              <el-card>
                <h4>{{ record.title }}</h4>
                <p>{{ record.content }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { getAlarmList, getAlarmDetail, handleAlarm as handleAlarmApi, assignAlarm as assignAlarmApi } from '@/api/alarm'
import { getUserList } from '@/api/user'
import { formatDateTime, alarmTypeMap, handleStatusMap } from '@/utils/helpers'

const loading = ref(false)
const alarmList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)

// 筛选条件
const filterAlarmType = ref('')
const filterHandleStatus = ref('')
const filterDateRange = ref([])

// 分配弹窗
const assignDialogVisible = ref(false)
const assignForm = reactive({
  alarmId: null,
  operatorId: null
})
const operatorList = ref([])

// 处理弹窗
const handleDialogVisible = ref(false)
const handleForm = reactive({
  alarmId: null,
  remark: '',
  screenshots: [],
  status: 2
})

// 详情抽屉
const detailDrawerVisible = ref(false)
const currentAlarm = ref(null)
const handleRecords = ref([])

// 获取报警列表
async function fetchAlarmList() {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      alarmType: filterAlarmType.value,
      handleStatus: filterHandleStatus.value,
      startTime: filterDateRange.value?.[0],
      endTime: filterDateRange.value?.[1]
    }
    
    const res = await getAlarmList(params)
    alarmList.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取报警列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取运维人员列表
async function fetchOperatorList() {
  try {
    const res = await getUserList({ role: 'operator', status: 1 })
    operatorList.value = res.list || []
  } catch (error) {
    console.error('获取运维人员列表失败:', error)
  }
}

// 搜索
function handleSearch() {
  pageNum.value = 1
  fetchAlarmList()
}

// 重置
function handleReset() {
  filterAlarmType.value = ''
  filterHandleStatus.value = ''
  filterDateRange.value = []
  pageNum.value = 1
  fetchAlarmList()
}

// 分页
function handleSizeChange(val) {
  pageSize.value = val
  fetchAlarmList()
}

function handleCurrentChange(val) {
  pageNum.value = val
  fetchAlarmList()
}

// 获取行样式类名
function getRowClassName({ row }) {
  if (row.handleStatus === 0) {
    return 'warning-row'
  }
  return ''
}

// 分配工单
function assignAlarm(row) {
  assignForm.alarmId = row.id
  assignForm.operatorId = null
  assignDialogVisible.value = true
}

// 提交分配
async function submitAssign() {
  if (!assignForm.operatorId) {
    ElMessage.warning('请选择运维人员')
    return
  }
  
  try {
    await assignAlarmApi(assignForm.alarmId, assignForm.operatorId)
    ElMessage.success('分配成功')
    assignDialogVisible.value = false
    fetchAlarmList()
  } catch (error) {
    console.error('分配失败:', error)
  }
}

// 处理工单
function handleAlarm(row) {
  handleForm.alarmId = row.id
  handleForm.remark = ''
  handleForm.screenshots = []
  handleForm.status = 2
  handleDialogVisible.value = true
}

// 上传成功
function handleUploadSuccess(response) {
  handleForm.screenshots.push(response.url)
}

// 提交处理
async function submitHandle() {
  if (!handleForm.remark) {
    ElMessage.warning('请输入处理备注')
    return
  }
  
  try {
    await handleAlarmApi(handleForm.alarmId, {
      remark: handleForm.remark,
      screenshots: handleForm.screenshots,
      status: handleForm.status
    })
    ElMessage.success('处理成功')
    handleDialogVisible.value = false
    fetchAlarmList()
  } catch (error) {
    console.error('处理失败:', error)
  }
}

// 查看详情
async function viewAlarmDetail(row) {
  currentAlarm.value = row
  detailDrawerVisible.value = true
  
  // 获取处理流转记录（模拟数据）
  handleRecords.value = [
    {
      time: row.createTime,
      type: 'primary',
      title: '报警产生',
      content: `骑手 ${row.riderName} 触发 ${alarmTypeMap[row.alarmType]?.label || row.alarmType} 报警`
    },
    {
      time: new Date(row.createTime).getTime() + 5 * 60 * 1000,
      type: 'warning',
      title: '工单分配',
      content: '已分配给运维人员张三'
    },
    {
      time: new Date(row.createTime).getTime() + 15 * 60 * 1000,
      type: 'success',
      title: '处理完成',
      content: '已联系骑手确认安全，报警解除'
    }
  ]
}

onMounted(() => {
  fetchAlarmList()
  fetchOperatorList()
})
</script>

<style scoped>
.alarm-management-page {
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

/* 详情抽屉 */
.alarm-detail {
  padding: 20px;
}

.detail-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-dark);
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 3px solid var(--accent-color);
}

.map-container {
  height: 300px;
  background-color: #F5F5F5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>