package com.example.qiansan.config;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.example.qiansan.entity.AlarmRecord;
import com.example.qiansan.entity.DeviceData;
import com.example.qiansan.mapper.AlarmRecordMapper;
import com.example.qiansan.mapper.DeviceDataMapper;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallbackExtended;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class MqttPushCallback implements MqttCallbackExtended {

    @Autowired
    private DeviceDataMapper deviceDataMapper;

    @Autowired
    private AlarmRecordMapper alarmRecordMapper;

    private final Map<String, Long> deviceHeartbeatMap = new ConcurrentHashMap<>();
    private static final long HEARTBEAT_TIMEOUT_MS = 30000;

    @Override
    public void connectComplete(boolean reconnect, String serverURI) {
        log.info("✅ MQTT connection established: {}, Reconnect: {}", serverURI, reconnect);
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) throws Exception {
        long receiveTime = System.currentTimeMillis();
        String payload = new String(message.getPayload());
        log.info("📨 Received MQTT message - Topic: {}, Payload: {}", topic, payload);

        try {
            if (topic.contains("/heartbeat")) {
                handleHeartbeat(topic, payload);
            } else if (topic.contains("/data")) {
                handleDeviceData(topic, payload, receiveTime);
            } else if (topic.contains("/alarm")) {
                handleAlarmMessage(topic, payload);
            } else if (topic.contains("/sos")) {
                handleSosMessage(topic, payload);
            } else {
                log.warn("Unknown message topic: {}", topic);
            }
        } catch (Exception e) {
            log.error("❌ Failed to process MQTT message: {}", e.getMessage(), e);
        }
    }

    private void handleHeartbeat(String topic, String payload) {
        try {
            String deviceSn = extractDeviceSn(topic);
            if (deviceSn != null) {
                deviceHeartbeatMap.put(deviceSn, System.currentTimeMillis());
                log.debug("💓 Heartbeat received from device: {}", deviceSn);
            }
        } catch (Exception e) {
            log.error("❌ Failed to handle heartbeat: {}", e.getMessage());
        }
    }

    private void handleDeviceData(String topic, String payload, long receiveTime) {
        try {
            JSONObject jsonObject = JSON.parseObject(payload);
            if (!validateDeviceData(jsonObject)) {
                log.error("❌ Invalid device data format");
                return;
            }

            DeviceData data = parseDeviceData(jsonObject);
            if (data == null) {
                log.error("❌ Failed to parse device data");
                return;
            }

            deviceDataMapper.insert(data);
            log.info("💾 Device data saved - Device: {}, HeartRate: {}, Temp: {}, Speed: {}",
                    data.getDeviceSn(), data.getHeartRate(), data.getTemperature(), data.getSpeed());

            String deviceSn = extractDeviceSn(topic);
            if (deviceSn != null) {
                deviceHeartbeatMap.put(deviceSn, receiveTime);
            }

            if (data.getFallStatus() != null && data.getFallStatus() == 1) {
                createFallAlarm(data);
                log.warn("🚨 Fall detected for device: {}", data.getDeviceSn());
            }

        } catch (Exception e) {
            log.error("❌ Failed to process device data: {}", e.getMessage(), e);
        }
    }

    private void handleAlarmMessage(String topic, String payload) {
        try {
            JSONObject jsonObject = JSON.parseObject(payload);
            String deviceSn = extractDeviceSn(topic);
            String alarmType = jsonObject.getString("alarmType");
            String alarmContent = jsonObject.getString("alarmContent");

            if (deviceSn != null && alarmType != null) {
                AlarmRecord alarm = new AlarmRecord();
                alarm.setDeviceSn(deviceSn);
                alarm.setRiderId(jsonObject.getLong("riderId"));
                alarm.setAlarmType(alarmType);
                alarm.setAlarmContent(alarmContent != null ? alarmContent : "设备报警");
                alarm.setLongitude(jsonObject.getString("longitude"));
                alarm.setLatitude(jsonObject.getString("latitude"));
                alarm.setHandleStatus(0);
                alarm.setCreateTime(LocalDateTime.now());

                alarmRecordMapper.insert(alarm);
                log.warn("🚨 Device alarm received and saved - Device: {}, Type: {}", deviceSn, alarmType);
            }
        } catch (Exception e) {
            log.error("❌ Failed to handle alarm message: {}", e.getMessage(), e);
        }
    }

    private void handleSosMessage(String topic, String payload) {
        try {
            JSONObject jsonObject = JSON.parseObject(payload);
            String deviceSn = extractDeviceSn(topic);
            Boolean sosStatus = jsonObject.getBoolean("sosStatus");

            if (deviceSn != null && sosStatus != null && sosStatus) {
                AlarmRecord alarm = new AlarmRecord();
                alarm.setDeviceSn(deviceSn);
                alarm.setRiderId(jsonObject.getLong("riderId"));
                alarm.setAlarmType("sos");
                alarm.setAlarmContent("骑手发起SOS紧急求助");
                alarm.setLongitude(jsonObject.getString("longitude"));
                alarm.setLatitude(jsonObject.getString("latitude"));
                alarm.setHandleStatus(0);
                alarm.setCreateTime(LocalDateTime.now());

                alarmRecordMapper.insert(alarm);
                log.error("🆘 SOS alert received - Device: {}", deviceSn);
            }
        } catch (Exception e) {
            log.error("❌ Failed to handle SOS message: {}", e.getMessage(), e);
        }
    }

    private boolean validateDeviceData(JSONObject jsonObject) {
        if (jsonObject == null) {
            return false;
        }

        String deviceSn = jsonObject.getString("deviceSn");
        if (deviceSn == null || deviceSn.trim().isEmpty()) {
            log.error("Device SN is missing");
            return false;
        }

        if (deviceSn.length() < 5 || deviceSn.length() > 32) {
            log.error("Invalid device SN length: {}", deviceSn);
            return false;
        }

        Integer heartRate = jsonObject.getInteger("heartRate");
        if (heartRate != null && (heartRate < 30 || heartRate > 250)) {
            log.warn("Abnormal heart rate value: {}", heartRate);
        }

        BigDecimal temperature = jsonObject.getBigDecimal("temperature");
        if (temperature != null) {
            double tempValue = temperature.doubleValue();
            if (tempValue < 30.0 || tempValue > 45.0) {
                log.warn("Abnormal temperature value: {}", tempValue);
            }
        }

        return true;
    }

    private DeviceData parseDeviceData(JSONObject jsonObject) {
        try {
            DeviceData data = new DeviceData();
            data.setDeviceSn(jsonObject.getString("deviceSn"));
            data.setRiderId(jsonObject.getLong("riderId"));
            data.setHeartRate(jsonObject.getInteger("heartRate"));
            data.setTemperature(jsonObject.getBigDecimal("temperature"));
            data.setPosture(jsonObject.getString("posture"));
            data.setSpeed(jsonObject.getBigDecimal("speed"));
            data.setLongitude(jsonObject.getString("longitude"));
            data.setLatitude(jsonObject.getString("latitude"));
            data.setFallStatus(jsonObject.getInteger("fallStatus"));
            data.setCreateTime(LocalDateTime.now());
            return data;
        } catch (Exception e) {
            log.error("Failed to parse device data: {}", e.getMessage());
            return null;
        }
    }

    private void createFallAlarm(DeviceData data) {
        AlarmRecord alarm = new AlarmRecord();
        alarm.setDeviceSn(data.getDeviceSn());
        alarm.setRiderId(data.getRiderId());
        alarm.setAlarmType("fall");
        alarm.setAlarmContent("骑手摔倒，触发安全报警");
        alarm.setLongitude(data.getLongitude());
        alarm.setLatitude(data.getLatitude());
        alarm.setHandleStatus(0);
        alarm.setCreateTime(LocalDateTime.now());

        alarmRecordMapper.insert(alarm);
        log.info("🚨 Fall alarm record created - ID: {}", alarm.getId());
    }

    private String extractDeviceSn(String topic) {
        if (topic == null || topic.isEmpty()) {
            return null;
        }

        String[] parts = topic.split("/");
        if (parts.length >= 2) {
            return parts[1];
        }
        return null;
    }

    public boolean isDeviceOnline(String deviceSn) {
        Long lastHeartbeat = deviceHeartbeatMap.get(deviceSn);
        if (lastHeartbeat == null) {
            return false;
        }
        return (System.currentTimeMillis() - lastHeartbeat) < HEARTBEAT_TIMEOUT_MS;
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        log.debug("Message delivery completed: {}", token.getMessageId());
    }

    @Override
    public void connectionLost(Throwable cause) {
        log.error("⚠️ MQTT connection lost: {}", cause.getMessage());
        if (cause != null) {
            log.error("Connection lost cause: ", cause);
        }
    }
}
