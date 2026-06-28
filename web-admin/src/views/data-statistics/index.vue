<template>
  <div class="data-statistics-page">
    <!-- 时间范围选择器 -->
    <div class="time-selector">
      <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
        <el-radio-button label="today">今日</el-radio-button>
        <el-radio-button label="7days">近7天</el-radio-button>
        <el-radio-button label="30days">近30天</el-radio-button>
        <el-radio-button label="custom">自定义</el-radio-button>
      </el-radio-group>
      
      <el-date-picker
        v-if="timeRange === 'custom'"
        v-model="customDateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        @change="handleCustomDateChange"
      />
      
      <el-button type="primary" :icon="Download" @click="exportData">导出数据</el-button>
    </div>
    
    <!-- Tab切换 -->
    <el-tabs v-model="activeTab" class="statistics-tabs" @tab-change="handleTabChange">
      <!-- 骑手健康Tab -->
      <el-tab-pane label="骑手健康" name="health">
        <div class="chart-grid">
          <div class="chart-card">
            <div class="chart-title">心率分布直方图</div>
            <div class="chart-content" ref="heartRateHistogramRef"></div>
          </div>
          <div class="chart-card">
            <div class="chart-title">平均心率趋势图</div>
            <div class="chart-content" ref="heartRateTrendRef"></div>
          </div>
          <div class="chart-card full-width">
            <div class="chart-title">异常心率时段热力图</div>
            <div class="chart-content" ref="heartRateHeatmapRef"></div>
          </div>
        </div>
      </el-tab-pane>
      
      <!-- 骑行数据Tab -->
      <el-tab-pane label="骑行数据" name="riding">
        <div class="chart-grid">
          <div class="chart-card">
            <div class="chart-title">骑行时长分布</div>
            <div class="chart-content" ref="rideDurationRef"></div>
          </div>
          <div class="chart-card">
            <div class="chart-title">骑行里程统计</div>
            <div class="chart-content" ref="rideDistanceRef"></div>
          </div>
          <div class="chart-card full-width">
            <div class="chart-title">活跃时段分布</div>
            <div class="chart-content" ref="activeTimeRef"></div>
          </div>
        </div>
      </el-tab-pane>
      
      <!-- 报警分析Tab -->
      <el-tab-pane label="报警分析" name="alarm">
        <div class="chart-grid">
          <div class="chart-card">
            <div class="chart-title">报警类型占比</div>
            <div class="chart-content" ref="alarmTypePieRef"></div>
          </div>
          <div class="chart-card">
            <div class="chart-title">处理效率趋势</div>
            <div class="chart-content" ref="handleEfficiencyRef"></div>
          </div>
          <div class="chart-card full-width">
            <div class="chart-title">工单闭环率</div>
            <div class="chart-content" ref="closeRateRef"></div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getHeartRateData, getHealthHistory } from '@/api/health'
import { getAlarmTrend, getAlarmTypeDistribution, getAlarmStats } from '@/api/alarm'
import { getTrendData } from '@/api/report'
import { getRecent7DaysRange, getRecent30DaysRange, getTodayRange, exportCSV, formatDateTime } from '@/utils/helpers'

const timeRange = ref('7days')
const customDateRange = ref([])
const activeTab = ref('health')

// 图表refs
const heartRateHistogramRef = ref(null)
const heartRateTrendRef = ref(null)
const heartRateHeatmapRef = ref(null)
const rideDurationRef = ref(null)
const rideDistanceRef = ref(null)
const activeTimeRef = ref(null)
const alarmTypePieRef = ref(null)
const handleEfficiencyRef = ref(null)
const closeRateRef = ref(null)

// 图表实例
let charts = {}

// 获取时间范围参数
function getTimeParams() {
  let start, end
  if (timeRange.value === 'today') {
    const range = getTodayRange()
    start = range.start
    end = range.end
  } else if (timeRange.value === '7days') {
    const range = getRecent7DaysRange()
    start = range.start
    end = range.end
  } else if (timeRange.value === '30days') {
    const range = getRecent30DaysRange()
    start = range.start
    end = range.end
  } else if (timeRange.value === 'custom' && customDateRange.value) {
    start = new Date(customDateRange.value[0])
    end = new Date(customDateRange.value[1])
  }
  return {
    startTime: start?.toISOString(),
    endTime: end?.toISOString()
  }
}

// 初始化心率分布直方图
function initHeartRateHistogram() {
  if (!heartRateHistogramRef.value) return
  
  charts.histogram = echarts.init(heartRateHistogramRef.value)
  
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['50-60', '60-70', '70-80', '80-90', '90-100', '100-110', '110-120', '>120'] },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: [5, 15, 35, 25, 12, 8, 3, 2],
      itemStyle: { color: '#F56C6C' }
    }]
  }
  charts.histogram.setOption(option)
}

// 初始化心率趋势图
function initHeartRateTrend() {
  if (!heartRateTrendRef.value) return
  
  charts.trend = echarts.init(heartRateTrendRef.value)
  
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: { type: 'value', min: 60, max: 100 },
    series: [{
      type: 'line',
      smooth: true,
      data: [72, 75, 78, 76, 80, 74, 77],
      lineStyle: { color: '#409EFF', width: 2 },
      areaStyle: { color: 'rgba(64, 158, 255, 0.2)' }
    }]
  }
  charts.trend.setOption(option)
}

// 初始化心率热力图
function initHeartRateHeatmap() {
  if (!heartRateHeatmapRef.value) return
  
  charts.heatmap = echarts.init(heartRateHeatmapRef.value)
  
  const hours = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22']
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  
  const data = []
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 12; j++) {
      data.push([j, i, Math.floor(Math.random() * 30 + 70)])
    }
  }
  
  const option = {
    tooltip: { position: 'top', formatter: (params) => `${days[params.data[1]]} ${hours[params.data[0]]}:00 心率 ${params.data[2]}` },
    grid: { left: '10%', right: '10%', bottom: '15%', top: '5%' },
    xAxis: { type: 'category', data: hours, splitArea: { show: true } },
    yAxis: { type: 'category', data: days, splitArea: { show: true } },
    visualMap: { min: 60, max: 120, calculable: true, orient: 'horizontal', left: 'center', bottom: '0%', inRange: { color: ['#67C23A', '#E6A23C', '#F56C6C'] } },
    series: [{
      type: 'heatmap',
      data: data,
      label: { show: true },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  }
  charts.heatmap.setOption(option)
}

// 初始化骑行时长分布
function initRideDuration() {
  if (!rideDurationRef.value) return
  
  charts.duration = echarts.init(rideDurationRef.value)
  
  const option = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: ['30%', '60%'],
      data: [
        { value: 20, name: '<1小时', itemStyle: { color: '#67C23A' } },
        { value: 35, name: '1-2小时', itemStyle: { color: '#409EFF' } },
        { value: 25, name: '2-3小时', itemStyle: { color: '#E6A23C' } },
        { value: 15, name: '3-4小时', itemStyle: { color: '#F56C6C' } },
        { value: 5, name: '>4小时', itemStyle: { color: '#909399' } }
      ]
    }]
  }
  charts.duration.setOption(option)
}

// 初始化骑行里程统计
function initRideDistance() {
  if (!rideDistanceRef.value) return
  
  charts.distance = echarts.init(rideDistanceRef.value)
  
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: { type: 'value', name: '公里' },
    series: [{
      type: 'bar',
      data: [35, 42, 38, 45, 50, 30, 25],
      itemStyle: { color: '#67C23A' }
    }]
  }
  charts.distance.setOption(option)
}

// 初始化活跃时段分布
function initActiveTime() {
  if (!activeTimeRef.value) return
  
  charts.active = echarts.init(activeTimeRef.value)
  
  const hours = []
  for (let i = 0; i < 24; i++) {
    hours.push(`${i}:00`)
  }
  
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: hours },
    yAxis: { type: 'value', name: '活跃骑手数' },
    series: [{
      type: 'line',
      smooth: true,
      data: [5, 3, 2, 1, 2, 5, 15, 30, 45, 55, 60, 65, 70, 75, 80, 85, 90, 85, 70, 50, 30, 20, 15, 10],
      lineStyle: { color: '#409EFF', width: 2 },
      areaStyle: { color: 'rgba(64, 158, 255, 0.2)' }
    }]
  }
  charts.active.setOption(option)
}

// 初始化报警类型饼图
function initAlarmTypePie() {
  if (!alarmTypePieRef.value) return
  
  charts.alarmPie = echarts.init(alarmTypePieRef.value)
  
  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 35, name: '摔倒检测', itemStyle: { color: '#F56C6C' } },
        { value: 25, name: 'SOS求助', itemStyle: { color: '#E6A23C' } },
        { value: 20, name: '疲劳预警', itemStyle: { color: '#409EFF' } },
        { value: 15, name: '中暑预警', itemStyle: { color: '#67C23A' } },
        { value: 5, name: '危险驾驶', itemStyle: { color: '#909399' } }
      ]
    }]
  }
  charts.alarmPie.setOption(option)
}

// 初始化处理效率趋势
function initHandleEfficiency() {
  if (!handleEfficiencyRef.value) return
  
  charts.efficiency = echarts.init(handleEfficiencyRef.value)
  
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['平均响应时长'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: { type: 'value', name: '分钟' },
    series: [{
      name: '平均响应时长',
      type: 'line',
      smooth: true,
      data: [15, 12, 10, 8, 9, 11, 13],
      lineStyle: { color: '#E6A23C', width: 2 }
    }]
  }
  charts.efficiency.setOption(option)
}

// 初始化工单闭环率
function initCloseRate() {
  if (!closeRateRef.value) return
  
  charts.closeRate = echarts.init(closeRateRef.value)
  
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['闭环率'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: { type: 'value', name: '%', max: 100 },
    series: [{
      name: '闭环率',
      type: 'line',
      smooth: true,
      data: [85, 88, 90, 92, 95, 93, 91],
      lineStyle: { color: '#67C23A', width: 2 },
      areaStyle: { color: 'rgba(103, 194, 58, 0.2)' }
    }]
  }
  charts.closeRate.setOption(option)
}

// 初始化当前Tab的图表
function initCurrentTabCharts() {
  nextTick(() => {
    if (activeTab.value === 'health') {
      initHeartRateHistogram()
      initHeartRateTrend()
      initHeartRateHeatmap()
    } else if (activeTab.value === 'riding') {
      initRideDuration()
      initRideDistance()
      initActiveTime()
    } else if (activeTab.value === 'alarm') {
      initAlarmTypePie()
      initHandleEfficiency()
      initCloseRate()
    }
  })
}

// 时间范围变化
function handleTimeRangeChange() {
  // 重新加载图表数据
  initCurrentTabCharts()
}

// 自定义日期变化
function handleCustomDateChange() {
  initCurrentTabCharts()
}

// Tab切换
function handleTabChange() {
  initCurrentTabCharts()
}

// 导出数据
function exportData() {
  // 模拟导出数据
  const data = [
    { 日期: '2024-01-15', 心率平均值: 75, 骑行里程: 35.5, 报警数: 2 },
    { 日期: '2024-01-16', 心率平均值: 78, 骑行里程: 42.3, 报警数: 1 }
  ]
  exportCSV(data, `统计数据_${activeTab.value}`)
  ElMessage.success('数据导出成功')
}

// 窗口大小变化
function handleResize() {
  Object.values(charts).forEach(chart => chart?.resize())
}

onMounted(() => {
  initCurrentTabCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  Object.values(charts).forEach(chart => chart?.dispose())
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.data-statistics-page {
  min-height: 100%;
}

/* 时间选择器 */
.time-selector {
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Tab区域 */
.statistics-tabs {
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 图表网格 */
.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  background-color: #F8F9FA;
  border-radius: 8px;
  padding: 16px;
}

.chart-card.full-width {
  grid-column: span 2;
}

.chart-title {
  font-size: 14px;
  font-weight: bold;
  color: var(--text-dark);
  margin-bottom: 12px;
}

.chart-content {
  height: 250px;
}

.chart-card.full-width .chart-content {
  height: 300px;
}
</style>