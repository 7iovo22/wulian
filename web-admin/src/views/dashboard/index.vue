<template>
  <div class="dashboard-page" v-loading="loading">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card" v-for="item in statCards" :key="item.key">
        <div class="stat-icon" :style="{ backgroundColor: item.color }">
          <el-icon :size="24"><component :is="item.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
          <div class="stat-change" :class="item.changeClass">
            <el-icon :size="12"><component :is="item.changeIcon" /></el-icon>
            <span>{{ item.changeText }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="chart-section">
      <!-- 左侧报警趋势图 -->
      <div class="chart-card left-chart">
        <div class="chart-header">
          <span class="chart-title">近7天报警趋势</span>
        </div>
        <div class="chart-content" ref="trendChartRef"></div>
      </div>
      
      <!-- 右侧报警类型分布图 -->
      <div class="chart-card right-chart">
        <div class="chart-header">
          <span class="chart-title">报警类型分布</span>
        </div>
        <div class="chart-content" ref="pieChartRef"></div>
      </div>
    </div>
    
    <!-- 最新报警列表 -->
    <div class="alarm-list-section">
      <div class="section-header">
        <span class="section-title">最新报警事件</span>
        <el-button type="primary" link @click="goToAlarm">查看全部</el-button>
      </div>
      
      <el-table :data="alarmList" stripe style="width: 100%">
        <el-table-column prop="createTime" label="报警时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="riderName" label="骑手姓名" width="120" />
        <el-table-column prop="alarmType" label="报警类型" width="120">
          <template #default="{ row }">
            <el-tag :type="alarmTypeMap[row.alarmType]?.color || 'info'" size="small">
              {{ alarmTypeMap[row.alarmType]?.label || row.alarmType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="alarmContent" label="报警内容" min-width="200" />
        <el-table-column prop="handleStatus" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="handleStatusMap[row.handleStatus]?.color || 'info'" size="small">
              {{ handleStatusMap[row.handleStatus]?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewAlarmDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { 
  DataAnalysis, Monitor, User, DocumentChecked,
  ArrowUp, ArrowDown
} from '@element-plus/icons-vue'
import { getAlarmStats, getAlarmList, getAlarmTrend, getAlarmTypeDistribution } from '@/api/alarm'
import { getDeviceList } from '@/api/device'
import { getUserList } from '@/api/user'
import { formatDateTime, alarmTypeMap, handleStatusMap } from '@/utils/helpers'

const router = useRouter()
const loading = ref(false)

// 统计卡片数据
const statCards = reactive([
  { 
    key: 'onlineDevices', 
    label: '在线设备数', 
    value: 0, 
    icon: markRaw(Monitor), 
    color: '#409EFF',
    change: 0,
    changeText: '较昨日',
    changeClass: '',
    changeIcon: markRaw(ArrowUp)
  },
  { 
    key: 'todayAlarms', 
    label: '今日报警数', 
    value: 0, 
    icon: markRaw(DataAnalysis), 
    color: '#F5A623',
    change: 0,
    changeText: '较昨日',
    changeClass: '',
    changeIcon: markRaw(ArrowUp)
  },
  { 
    key: 'activeRiders', 
    label: '活跃骑手数', 
    value: 0, 
    icon: markRaw(User), 
    color: '#67C23A',
    change: 0,
    changeText: '较昨日',
    changeClass: '',
    changeIcon: markRaw(ArrowUp)
  },
  { 
    key: 'pendingTickets', 
    label: '待处理工单', 
    value: 0, 
    icon: markRaw(DocumentChecked), 
    color: '#F56C6C',
    change: 0,
    changeText: '较昨日',
    changeClass: '',
    changeIcon: markRaw(ArrowDown)
  }
])

// 报警列表
const alarmList = ref([])

// 图表实例
const trendChartRef = ref(null)
const pieChartRef = ref(null)
let trendChart = null
let pieChart = null

// 获取统计数据
async function fetchStats() {
  try {
    // 获取报警统计
    const alarmStats = await getAlarmStats()
    const todayAlarmsCard = statCards.find(c => c.key === 'todayAlarms')
    todayAlarmsCard.value = alarmStats.total || 0
    
    const pendingTicketsCard = statCards.find(c => c.key === 'pendingTickets')
    pendingTicketsCard.value = alarmStats.unhandled || 0
    
    // 获取设备列表统计在线设备
    const deviceRes = await getDeviceList({ status: 1 })
    const onlineDevicesCard = statCards.find(c => c.key === 'onlineDevices')
    onlineDevicesCard.value = deviceRes.total || 0
    
    // 获取用户列表统计活跃骑手
    const userRes = await getUserList({ role: 'rider', status: 1 })
    const activeRidersCard = statCards.find(c => c.key === 'activeRiders')
    activeRidersCard.value = userRes.total || 0
    
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取报警列表
async function fetchAlarmList() {
  try {
    const res = await getAlarmList({ pageNum: 1, pageSize: 10 })
    alarmList.value = res.list || []
  } catch (error) {
    console.error('获取报警列表失败:', error)
  }
}

// 初始化趋势图表
async function initTrendChart() {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  
  try {
    const trendData = await getAlarmTrend({ days: 7 })
    
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
        data: trendData?.dates || ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        name: '报警数',
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#F5A623',
          width: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 166, 35, 0.3)' },
              { offset: 1, color: 'rgba(245, 166, 35, 0.05)' }
            ]
          }
        },
        data: trendData?.values || [12, 15, 10, 18, 14, 8, 16]
      }]
    }
    
    trendChart.setOption(option)
  } catch (error) {
    console.error('获取趋势数据失败:', error)
  }
}

// 初始化饼图
async function initPieChart() {
  if (!pieChartRef.value) return
  
  pieChart = echarts.init(pieChartRef.value)
  
  try {
    const distributionData = await getAlarmTypeDistribution()
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center'
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: distributionData || [
          { value: 35, name: '摔倒检测', itemStyle: { color: '#F56C6C' } },
          { value: 25, name: 'SOS求助', itemStyle: { color: '#E6A23C' } },
          { value: 20, name: '疲劳预警', itemStyle: { color: '#409EFF' } },
          { value: 15, name: '中暑预警', itemStyle: { color: '#67C23A' } },
          { value: 5, name: '危险驾驶', itemStyle: { color: '#909399' } }
        ]
      }]
    }
    
    pieChart.setOption(option)
  } catch (error) {
    console.error('获取分布数据失败:', error)
  }
}

// 查看报警详情
function viewAlarmDetail(row) {
  router.push(`/alarm-management?id=${row.id}`)
}

// 跳转报警管理
function goToAlarm() {
  router.push('/alarm-management')
}

// 窗口大小变化时重新调整图表
function handleResize() {
  trendChart?.resize()
  pieChart?.resize()
}

onMounted(async () => {
  loading.value = true
  try {
    await fetchStats()
    await fetchAlarmList()
    await initTrendChart()
    await initPieChart()
  } finally {
    loading.value = false
  }
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  trendChart?.dispose()
  pieChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100%;
}

/* 统计卡片 */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--text-dark);
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: var(--text-light);
  margin-top: 4px;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  margin-top: 8px;
}

.stat-change.up {
  color: #67C23A;
}

.stat-change.down {
  color: #F56C6C;
}

/* 图表区域 */
.chart-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.left-chart {
  flex: 6;
}

.right-chart {
  flex: 4;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-dark);
}

.chart-content {
  height: 300px;
}

/* 报警列表 */
.alarm-list-section {
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-dark);
}
</style>