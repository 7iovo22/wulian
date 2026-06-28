package com.example.qiansan.service.impl;

import com.alibaba.fastjson2.JSON;
import com.example.qiansan.service.HardwareCommunicationService;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
public class HardwareCommunicationServiceImpl implements HardwareCommunicationService {

    @Autowired
    private MqttClient mqttClient;

    private final Map<String, Long> deviceLastHeartbeat = new ConcurrentHashMap<>();
    private static final long HEARTBEAT_TIMEOUT_MS = 30000;

    private static final int MAX_RETRY_COUNT = 3;
    private static final long RETRY_DELAY_MS = 1000;

    @Override
    public boolean sendLedControl(String deviceSn, Integer status) {
        if (!validateDeviceSn(deviceSn)) {
            log.error("Invalid device SN: {}", deviceSn);
            return false;
        }

        if (status == null || status < 0 || status > 2) {
            log.error("Invalid LED status: {}", status);
            return false;
        }

        Map<String, Object> command = createCommand(deviceSn, "led_control");
        command.put("status", status);
        command.put("timestamp", System.currentTimeMillis());

        return sendCommandWithRetry(deviceSn, "cmd/led", command);
    }

    @Override
    public boolean sendVoiceBroadcast(String deviceSn, String message) {
        if (!validateDeviceSn(deviceSn)) {
            log.error("Invalid device SN: {}", deviceSn);
            return false;
        }

        if (message == null || message.trim().isEmpty()) {
            log.error("Voice message cannot be empty");
            return false;
        }

        if (message.length() > 200) {
            log.error("Voice message too long: {}", message.length());
            return false;
        }

        Map<String, Object> command = createCommand(deviceSn, "voice_broadcast");
        command.put("message", message);
        command.put("timestamp", System.currentTimeMillis());

        return sendCommandWithRetry(deviceSn, "cmd/voice", command);
    }

    @Override
    public boolean setVoiceVolume(String deviceSn, Integer volume) {
        if (!validateDeviceSn(deviceSn)) {
            log.error("Invalid device SN: {}", deviceSn);
            return false;
        }

        if (volume == null || volume < 0 || volume > 100) {
            log.error("Invalid volume value: {}", volume);
            return false;
        }

        Map<String, Object> command = createCommand(deviceSn, "voice_volume");
        command.put("volume", volume);
        command.put("timestamp", System.currentTimeMillis());

        return sendCommandWithRetry(deviceSn, "cmd/volume", command);
    }

    @Override
    public boolean triggerSosAlarm(String deviceSn, Boolean enabled) {
        if (!validateDeviceSn(deviceSn)) {
            log.error("Invalid device SN: {}", deviceSn);
            return false;
        }

        if (enabled == null) {
            log.error("SOS enabled parameter cannot be null");
            return false;
        }

        Map<String, Object> command = createCommand(deviceSn, "sos_alarm");
        command.put("enabled", enabled);
        command.put("timestamp", System.currentTimeMillis());

        return sendCommandWithRetry(deviceSn, "cmd/sos", command);
    }

    @Override
    public boolean isDeviceOnline(String deviceSn) {
        Long lastHeartbeat = deviceLastHeartbeat.get(deviceSn);
        if (lastHeartbeat == null) {
            log.debug("No heartbeat record for device: {}", deviceSn);
            return false;
        }

        boolean online = (System.currentTimeMillis() - lastHeartbeat) < HEARTBEAT_TIMEOUT_MS;
        log.debug("Device {} online status: {}", deviceSn, online);
        return online;
    }

    public void updateDeviceHeartbeat(String deviceSn) {
        deviceLastHeartbeat.put(deviceSn, System.currentTimeMillis());
        log.debug("Updated heartbeat for device: {}", deviceSn);
    }

    private Map<String, Object> createCommand(String deviceSn, String commandType) {
        Map<String, Object> command = new ConcurrentHashMap<>();
        command.put("deviceSn", deviceSn);
        command.put("commandType", commandType);
        command.put("requestId", generateRequestId());
        return command;
    }

    private String generateRequestId() {
        return System.currentTimeMillis() + "_" + (int) (Math.random() * 10000);
    }

    private boolean sendCommandWithRetry(String deviceSn, String topicSuffix, Map<String, Object> command) {
        AtomicInteger retryCount = new AtomicInteger(0);

        while (retryCount.get() < MAX_RETRY_COUNT) {
            try {
                if (mqttClient == null || !mqttClient.isConnected()) {
                    log.error("MQTT client is not connected");
                    return false;
                }

                String topic = "device/" + deviceSn + "/" + topicSuffix;
                String jsonPayload = JSON.toJSONString(command);

                MqttMessage message = new MqttMessage(jsonPayload.getBytes());
                message.setQos(1);
                message.setRetained(false);

                mqttClient.publish(topic, message);

                log.info("Command sent successfully - Device: {}, Type: {}, Topic: {}, Payload: {}",
                        deviceSn, command.get("commandType"), topic, jsonPayload);

                return true;

            } catch (Exception e) {
                retryCount.incrementAndGet();
                log.warn("Failed to send command to device {} (attempt {}/{}): {}",
                        deviceSn, retryCount.get(), MAX_RETRY_COUNT, e.getMessage());

                if (retryCount.get() < MAX_RETRY_COUNT) {
                    try {
                        Thread.sleep(RETRY_DELAY_MS * retryCount.get());
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.error("Retry interrupted for device: {}", deviceSn);
                        return false;
                    }
                }
            }
        }

        log.error("Failed to send command to device {} after {} attempts", deviceSn, MAX_RETRY_COUNT);
        return false;
    }

    private boolean validateDeviceSn(String deviceSn) {
        if (deviceSn == null || deviceSn.trim().isEmpty()) {
            return false;
        }
        if (deviceSn.length() < 5 || deviceSn.length() > 32) {
            log.error("Device SN length must be between 5 and 32 characters: {}", deviceSn);
            return false;
        }
        return deviceSn.matches("^[A-Za-z0-9_-]+$");
    }
}
