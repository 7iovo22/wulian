<template>
  <div class="device-monitor-page">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="filterStatus" placeholder="设备状态" clearable style="width: 150px">
        <el-option label="全部" value="" />
        <el-option label="在线" :value="1" />
        <el-option label="离线" :value="0" />
      </el-select>
      
      <el-input 
        v-model="filterDeviceId" 
        placeholder="设备ID搜索" 
        clearable 
        style="width: 200px"
        :prefix-icon="Search"
      />
      
      <el-slider 
        v-model="filterBatteryRange" 
        range 
        :min="0" 
        :max="100" 
        style="width: 200px"
        :format-tooltip="(val) => `${val}%`"
      />
      <span class="battery-label">电量范围</span>
      
      <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
      <el-button :icon="Refresh" @click="handleReset">重置</el-button>
    </div>
    
    <!-- 设备列表表格 -->
    <div class="table-section">
      <el-table 
        :data="deviceList" 
        stripe 
        v-loading="loading"
        :row-class-name="getRowClassName"
        style="width: 100%"
      >
        <el-table-column prop="deviceSn" label="设备ID" width="180" />
        <el-table-column prop="riderName" label="绑定骑手" width="120" />
        <el-table-column prop="status" label="在线状态" width="100">
          <template #default="{ row }">
            <div class="status-cell">
              <span class="status-dot" :class="row.status === 1 ? 'online' : 'offline'"></span>
              <span>{{ row.status === 1 ? '在线' : '离线' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="battery" label="电量" width="150">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.battery || 0" 
              :color="getBatteryColor(row.battery)"
              :stroke-width="10"
            />
          </template>
        </el-table-column>
        <el-table-column prop="signalQuality" label="通信质量" width="100">
          <template #default="{ row }">
            <el-rate 
              v-model="row.signalQuality" 
              :max="5" 
              disabled 
              show-score 
              text-color="#ff9900"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lastReportTime" label="最后上报时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.lastReportTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="firmwareVersion" label="固件版本" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDeviceDetail(row)">
              查看详情
            </el-button>
            <el-button type="warning" link size="small" @click="restartDevice(row)">
              远程重启
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
    
    <!-- 设备详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="设备详情"
      direction="rtl"
      size="50%"
    >
      <div class="device-detail" v-if="currentDevice">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3 class="section-title">基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="设备ID">{{ currentDevice.deviceSn }}</el-descriptions-item>
            <el-descriptions-item label="绑定骑手">{{ currentDevice.riderName }}</el-descriptions-item>
            <el-descriptions-item label="在线状态">
              <el-tag :type="currentDevice.status === 1 ? 'success' : 'info'" size="small">
                {{ currentDevice.status === 1 ? '在线' : '离线' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="电量">{{ currentDevice.battery }}%</el-descriptions-item>
            <el-descriptions-item label="固件版本">{{ currentDevice.firmwareVersion }}</el-descriptions-item>
            <el-descriptions-item label="绑定时间">{{ formatDateTime(currentDevice.bindTime) }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <!-- 实时心率曲线 -->
        <div class="detail-section">
          <h3 class="section-title">实时心率曲线</h3>
          <div class="heart-rate-chart" ref="heartRateChartRef"></div>
        </div>
        
        <!-- 今日轨迹地图 -->
        <div class="detail-section">
          <h3 class="section-title">今日轨迹</h3>
          <div class="map-container" ref="mapContainerRef">
            <el-empty description="轨迹数据加载中..." />
          </div>
        </div>
        
        <!-- 设备日志 -->
        <div class="detail-section">
          <h3 class="section-title">设备日志</h3>
          <el-table :data="deviceLogs" stripe max-height="300">
            <el-table-column prop="time" label="时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.time) }}
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === 'error' ? 'danger' : 'info'" size="small">
                  {{ row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="消息" min-width="200" />
          </el-table>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getDeviceList, getDeviceDetail, restartDevice as restartDeviceApi, getDeviceDataHistory } from '@/api/device'
import { getHeartRateData } from '@/api/health'
import { getLocationHistory } from '@/api/location'
import { formatDateTime } from '@/utils/helpers'

const loading = ref(false)
const deviceList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)

// 筛选条件
const filterStatus = ref('')
const filterDeviceId = ref('')
const filterBatteryRange = ref([0, 100])

// 设备详情抽屉
const drawerVisible = ref(false)
const currentDevice = ref(null)
const deviceLogs = ref([])

// 图表
const heartRateChartRef = ref(null)
const mapContainerRef = ref(null)
let heartRateChart = null

// 获取设备列表
async function fetchDeviceList() {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      status: filterStatus.value,
      deviceSn: filterDeviceId.value,
      batteryMin: filterBatteryRange.value[0],
      batteryMax: filterBatteryRange.value[1]
    }
    
    const res = await getDeviceList(params)
    deviceList.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取设备列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  pageNum.value = 1
  fetchDeviceList()
}

// 重置
function handleReset() {
  filterStatus.value = ''
  filterDeviceId.value = ''
  filterBatteryRange.value = [0, 100]
  pageNum.value = 1
  fetchDeviceList()
}

// 分页
function handleSizeChange(val) {
  pageSize.value = val
  fetchDeviceList()
}

function handleCurrentChange(val) {
  pageNum.value = val
  fetchDeviceList()
}

// 获取行样式类名
function getRowClassName({ row }) {
  // 离线超过30分钟或电量低于20%
  const lastReportTime = new Date(row.lastReportTime)
  const now = new Date()
  const offlineMinutes = (now - lastReportTime) / (1000 * 60)
  
  if (row.status === 0 && offlineMinutes > 30) {
    return 'warning-row'
  }
  if (row.battery < 20) {
    return 'warning-row'
  }
  return ''
}

// 获取电量颜色
function getBatteryColor(battery) {
  if (battery < 20) return '#F56C6C'
  if (battery < 50) return '#E6A23C'
  return '#67C23A'
}

// 查看设备详情
async function viewDeviceDetail(row) {
  currentDevice.value = row
  drawerVisible.value = true
  
  // 获取心率数据
  try {
    const heartRateData = await getHeartRateData({
      riderId: row.riderId,
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date().toISOString()
    })
    
    initHeartRateChart(heartRateData)
  } catch (error) {
    console.error('获取心率数据失败:', error)
  }
  
  // 获取设备日志（模拟数据）
  deviceLogs.value = [
    { time: new Date(), type: 'info', message: '设备正常上报数据' },
    { time: new Date(Date.now() - 5 * 60 * 1000), type: 'info', message: '心率数据更新' },
    { time: new Date(Date.now() - 10 * 60 * 1000), type: 'info', message: '位置数据更新' },
    { time: new Date(Date.now() - 30 * 60 * 1000), type: 'warning', message: '电量低于30%' },
  ]
}

// 初始化心率图表
function initHeartRateChart(data) {
  if (!heartRateChartRef.value) return
  
  heartRateChart = echarts.init(heartRateChartRef.value)
  
  const times = data?.times || []
  const values = data?.values || []
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times.length > 0 ? times : ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
    },
    yAxis: {
      type: 'value',
      min: 40,
      max: 160
    },
    series: [{
      name: '心率',
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#F56C6C',
        width: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ]
        }
      },
      data: values.length > 0 ? values : [72, 75, 80, 85, 78, 82, 76]
    }]
  }
  
  heartRateChart.setOption(option)
}

// 远程重启设备
async function restartDevice(row) {
  try {
    await ElMessageBox.confirm(
      `确定要远程重启设备 ${row.deviceSn} 吗？`,
      '重启确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await restartDeviceApi(row.id)
    ElMessage.success('重启指令已发送')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重启设备失败:', error)
    }
  }
}

// 窗口大小变化
function handleResize() {
  heartRateChart?.resize()
}

onMounted(() => {
  fetchDeviceList()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  heartRateChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.device-monitor-page {
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

.battery-label {
  font-size: 14px;
  color: var(--text-light);
}

/* 表格区域 */
.table-section {
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background-color: #67C23A;
}

.status-dot.offline {
  background-color: #909399;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 设备详情 */
.device-detail {
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

.heart-rate-chart {
  height: 200px;
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