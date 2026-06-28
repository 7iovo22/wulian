<template>
  <div class="system-config-page">
    <!-- MQTT配置 -->
    <el-card class="config-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Connection /></el-icon>
            MQTT配置
          </span>
        </div>
      </template>
      
      <el-form :model="mqttForm" label-width="120px" v-loading="mqttLoading">
        <el-form-item label="Broker地址">
          <el-input v-model="mqttForm.host" placeholder="请输入MQTT Broker地址" />
        </el-form-item>
        <el-form-item label="端口">
          <el-input-number v-model="mqttForm.port" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item label="心跳间隔">
          <el-input-number v-model="mqttForm.keepalive" :min="10" :max="300" />
          <span class="unit-label">秒</span>
        </el-form-item>
        <el-form-item label="QoS等级">
          <el-select v-model="mqttForm.qos" style="width: 200px">
            <el-option label="0 - 至多一次" :value="0" />
            <el-option label="1 - 至少一次" :value="1" />
            <el-option label="2 - 恰好一次" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveMqttConfig">保存配置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 报警规则配置 -->
    <el-card class="config-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Warning /></el-icon>
            报警规则配置
          </span>
        </div>
      </template>
      
      <el-form :model="alarmRuleForm" label-width="120px" v-loading="alarmRuleLoading">
        <el-form-item label="心率阈值上限">
          <el-slider 
            v-model="alarmRuleForm.maxHeartRate" 
            :min="100" 
            :max="200" 
            :format-tooltip="(val) => `${val} bpm`"
            style="width: 300px"
          />
          <el-input-number v-model="alarmRuleForm.maxHeartRate" :min="100" :max="200" style="margin-left: 20px" />
        </el-form-item>
        <el-form-item label="心率阈值下限">
          <el-slider 
            v-model="alarmRuleForm.minHeartRate" 
            :min="30" 
            :max="80" 
            :format-tooltip="(val) => `${val} bpm`"
            style="width: 300px"
          />
          <el-input-number v-model="alarmRuleForm.minHeartRate" :min="30" :max="80" style="margin-left: 20px" />
        </el-form-item>
        <el-form-item label="摔倒检测灵敏度">
          <el-slider 
            v-model="alarmRuleForm.fallSensitivity" 
            :min="1" 
            :max="10" 
            :format-tooltip="(val) => `灵敏度 ${val}`"
            style="width: 300px"
          />
          <el-input-number v-model="alarmRuleForm.fallSensitivity" :min="1" :max="10" style="margin-left: 20px" />
        </el-form-item>
        <el-form-item label="未确认超时时间">
          <el-input-number v-model="alarmRuleForm.unconfirmedTimeout" :min="10" :max="120" />
          <span class="unit-label">秒</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveAlarmRuleConfig">保存配置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 短信模板配置 -->
    <el-card class="config-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><ChatDotSquare /></el-icon>
            短信模板配置
          </span>
        </div>
      </template>
      
      <el-form :model="smsTemplateForm" label-width="120px" v-loading="smsTemplateLoading">
        <el-form-item label="紧急联系人模板">
          <el-input 
            v-model="smsTemplateForm.emergencyTemplate" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入紧急联系人短信模板"
          />
          <div class="template-tip">
            可用变量：{riderName} - 骑手姓名, {alarmType} - 报警类型, {location} - 位置信息, {time} - 报警时间
          </div>
        </el-form-item>
        <el-form-item label="报警通知模板">
          <el-input 
            v-model="smsTemplateForm.alarmTemplate" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入报警通知短信模板"
          />
          <div class="template-tip">
            可用变量：{riderName} - 骑手姓名, {alarmType} - 报警类型, {location} - 位置信息, {time} - 报警时间
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveSmsTemplateConfig">保存配置</el-button>
          <el-button @click="previewTemplate">预览模板</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 预览弹窗 -->
    <el-dialog v-model="previewDialogVisible" title="短信模板预览" width="500px">
      <div class="preview-content">
        <h4>紧急联系人短信预览：</h4>
        <div class="preview-text">
          {{ previewEmergencyText }}
        </div>
        
        <h4 style="margin-top: 20px">报警通知短信预览：</h4>
        <div class="preview-text">
          {{ previewAlarmText }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Connection, Warning, ChatDotSquare } from '@element-plus/icons-vue'
import { getSystemConfig, updateMqttConfig, updateAlarmRuleConfig, updateSmsTemplateConfig } from '@/api/config'

// MQTT配置
const mqttLoading = ref(false)
const mqttForm = reactive({
  host: 'broker.emqx.io',
  port: 1883,
  keepalive: 60,
  qos: 1
})

// 报警规则配置
const alarmRuleLoading = ref(false)
const alarmRuleForm = reactive({
  maxHeartRate: 120,
  minHeartRate: 50,
  fallSensitivity: 5,
  unconfirmedTimeout: 30
})

// 短信模板配置
const smsTemplateLoading = ref(false)
const smsTemplateForm = reactive({
  emergencyTemplate: '【骑安智盔】紧急通知：您的联系人{riderName}触发{alarmType}报警，位置：{location}，时间：{time}。请立即关注！',
  alarmTemplate: '【骑安智盔】报警通知：骑手{riderName}触发{alarmType}报警，位置：{location}，时间：{time}。平台正在处理中。'
})

// 预览弹窗
const previewDialogVisible = ref(false)
const previewEmergencyText = ref('')
const previewAlarmText = ref('')

// 获取系统配置
async function fetchSystemConfig() {
  try {
    const config = await getSystemConfig()
    if (config.mqtt) {
      Object.assign(mqttForm, config.mqtt)
    }
    if (config.alarmRule) {
      Object.assign(alarmRuleForm, config.alarmRule)
    }
    if (config.smsTemplate) {
      Object.assign(smsTemplateForm, config.smsTemplate)
    }
  } catch (error) {
    console.error('获取系统配置失败:', error)
  }
}

// 保存MQTT配置
async function saveMqttConfig() {
  mqttLoading.value = true
  try {
    await updateMqttConfig(mqttForm)
    ElMessage.success('MQTT配置保存成功')
  } catch (error) {
    console.error('保存MQTT配置失败:', error)
  } finally {
    mqttLoading.value = false
  }
}

// 保存报警规则配置
async function saveAlarmRuleConfig() {
  alarmRuleLoading.value = true
  try {
    await updateAlarmRuleConfig(alarmRuleForm)
    ElMessage.success('报警规则配置保存成功')
  } catch (error) {
    console.error('保存报警规则配置失败:', error)
  } finally {
    alarmRuleLoading.value = false
  }
}

// 保存短信模板配置
async function saveSmsTemplateConfig() {
  smsTemplateLoading.value = true
  try {
    await updateSmsTemplateConfig(smsTemplateForm)
    ElMessage.success('短信模板配置保存成功')
  } catch (error) {
    console.error('保存短信模板配置失败:', error)
  } finally {
    smsTemplateLoading.value = false
  }
}

// 预览模板
function previewTemplate() {
  // 替换变量显示预览
  const sampleData = {
    riderName: '张三',
    alarmType: '摔倒检测',
    location: '北京市朝阳区望京街道',
    time: '2024-01-15 10:30:00'
  }
  
  previewEmergencyText.value = smsTemplateForm.emergencyTemplate
    .replace('{riderName}', sampleData.riderName)
    .replace('{alarmType}', sampleData.alarmType)
    .replace('{location}', sampleData.location)
    .replace('{time}', sampleData.time)
  
  previewAlarmText.value = smsTemplateForm.alarmTemplate
    .replace('{riderName}', sampleData.riderName)
    .replace('{alarmType}', sampleData.alarmType)
    .replace('{location}', sampleData.location)
    .replace('{time}', sampleData.time)
  
  previewDialogVisible.value = true
}

onMounted(() => {
  fetchSystemConfig()
})
</script>

<style scoped>
.system-config-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 配置卡片 */
.config-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  color: var(--text-dark);
}

.card-title .el-icon {
  color: var(--accent-color);
}

/* 单位标签 */
.unit-label {
  font-size: 14px;
  color: var(--text-light);
  margin-left: 10px;
}

/* 模板提示 */
.template-tip {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #F5F7FA;
  border-radius: 4px;
}

/* 预览内容 */
.preview-content {
  padding: 10px;
}

.preview-content h4 {
  font-size: 14px;
  font-weight: bold;
  color: var(--text-dark);
  margin-bottom: 10px;
}

.preview-text {
  padding: 16px;
  background-color: #F5F7FA;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-dark);
  line-height: 1.6;
}
</style>