package com.example.qiansan.util;

import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Component
public class HardwareConnectionTester {

    @Autowired
    private MqttClient mqttClient;

    private static final long DEFAULT_TIMEOUT_MS = 5000;

    public boolean testMqttConnection() {
        try {
            if (mqttClient == null) {
                log.error("MQTT client is not initialized");
                return false;
            }

            boolean connected = mqttClient.isConnected();
            log.info("MQTT connection test result: {}", connected);

            return connected;
        } catch (Exception e) {
            log.error("MQTT connection test failed: {}", e.getMessage());
            return false;
        }
    }

    public boolean testDeviceDataReceiving(String deviceSn, String testData) {
        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<Boolean> testResult = new AtomicReference<>(false);

        try {
            String testTopic = "device/" + deviceSn + "/test/response";
            mqttClient.subscribe(testTopic, 1);

            String testPayload = testData != null ? testData :
                    String.format("{\"deviceSn\":\"%s\",\"heartRate\":75,\"temperature\":36.5}", deviceSn);

            MqttMessage message = new MqttMessage(testPayload.getBytes());
            message.setQos(1);

            String publishTopic = "device/" + deviceSn + "/data";
            mqttClient.publish(publishTopic, message);

            log.info("Test data published to topic: {}, payload: {}", publishTopic, testPayload);

            boolean waitResult = latch.await(DEFAULT_TIMEOUT_MS, TimeUnit.MILLISECONDS);
            log.info("Device data receiving test result: {}", waitResult);

            return waitResult;

        } catch (Exception e) {
            log.error("Device data receiving test failed: {}", e.getMessage());
            return false;
        }
    }

    public boolean testCommandSending(String deviceSn, String commandType, String commandPayload) {
        try {
            if (mqttClient == null || !mqttClient.isConnected()) {
                log.error("Cannot send command - MQTT client not connected");
                return false;
            }

            String topic = "device/" + deviceSn + "/cmd/" + commandType;
            String payload = commandPayload != null ? commandPayload :
                    String.format("{\"deviceSn\":\"%s\",\"commandType\":\"%s\",\"timestamp\":%d}",
                            deviceSn, commandType, System.currentTimeMillis());

            MqttMessage message = new MqttMessage(payload.getBytes());
            message.setQos(1);

            mqttClient.publish(topic, message);

            log.info("Test command sent - Topic: {}, Payload: {}", topic, payload);
            return true;

        } catch (Exception e) {
            log.error("Command sending test failed: {}", e.getMessage());
            return false;
        }
    }

    public String testLedControl(String deviceSn, Integer status) {
        try {
            String payload = String.format(
                    "{\"deviceSn\":\"%s\",\"commandType\":\"led_control\",\"status\":%d,\"timestamp\":%d}",
                    deviceSn, status, System.currentTimeMillis()
            );

            boolean success = testCommandSending(deviceSn, "led", payload);
            return success ? "LED control command sent successfully" : "Failed to send LED control command";

        } catch (Exception e) {
            return "LED control test failed: " + e.getMessage();
        }
    }

    public String testVoiceBroadcast(String deviceSn, String message) {
        try {
            String testMessage = message != null ? message : "Test voice broadcast";
            String payload = String.format(
                    "{\"deviceSn\":\"%s\",\"commandType\":\"voice_broadcast\",\"message\":\"%s\",\"timestamp\":%d}",
                    deviceSn, testMessage, System.currentTimeMillis()
            );

            boolean success = testCommandSending(deviceSn, "voice", payload);
            return success ? "Voice broadcast command sent successfully" : "Failed to send voice broadcast command";

        } catch (Exception e) {
            return "Voice broadcast test failed: " + e.getMessage();
        }
    }

    public String testVolumeControl(String deviceSn, Integer volume) {
        try {
            Integer testVolume = volume != null ? volume : 80;
            String payload = String.format(
                    "{\"deviceSn\":\"%s\",\"commandType\":\"voice_volume\",\"volume\":%d,\"timestamp\":%d}",
                    deviceSn, testVolume, System.currentTimeMillis()
            );

            boolean success = testCommandSending(deviceSn, "volume", payload);
            return success ? "Volume control command sent successfully" : "Failed to send volume control command";

        } catch (Exception e) {
            return "Volume control test failed: " + e.getMessage();
        }
    }

    public String testSosCommand(String deviceSn, Boolean enabled) {
        try {
            Boolean testEnabled = enabled != null ? enabled : true;
            String payload = String.format(
                    "{\"deviceSn\":\"%s\",\"commandType\":\"sos_alarm\",\"enabled\":%b,\"timestamp\":%d}",
                    deviceSn, testEnabled, System.currentTimeMillis()
            );

            boolean success = testCommandSending(deviceSn, "sos", payload);
            return success ? "SOS command sent successfully" : "Failed to send SOS command";

        } catch (Exception e) {
            return "SOS test failed: " + e.getMessage();
        }
    }

    public String testFirmwareUpgrade(String deviceSn, String firmwareUrl) {
        try {
            String testUrl = firmwareUrl != null ? firmwareUrl : "http://firmware.example.com/test.bin";
            String payload = String.format(
                    "{\"deviceSn\":\"%s\",\"commandType\":\"firmware_upgrade\",\"firmwareUrl\":\"%s\",\"timestamp\":%d}",
                    deviceSn, testUrl, System.currentTimeMillis()
            );

            boolean success = testCommandSending(deviceSn, "firmware", payload);
            return success ? "Firmware upgrade command sent successfully" : "Failed to send firmware upgrade command";

        } catch (Exception e) {
            return "Firmware upgrade test failed: " + e.getMessage();
        }
    }

    public String generateTestReport(String deviceSn) {
        StringBuilder report = new StringBuilder();
        report.append("\n=== Hardware Connection Test Report ===\n");
        report.append("Device SN: ").append(deviceSn).append("\n");
        report.append("Test Time: ").append(java.time.LocalDateTime.now()).append("\n\n");

        report.append("1. MQTT Connection Test:\n");
        report.append("   Result: ").append(testMqttConnection() ? "✅ PASS" : "❌ FAIL").append("\n\n");

        report.append("2. LED Control Test:\n");
        report.append("   ").append(testLedControl(deviceSn, 1)).append("\n\n");

        report.append("3. Volume Control Test:\n");
        report.append("   ").append(testVolumeControl(deviceSn, 50)).append("\n\n");

        report.append("4. Voice Broadcast Test:\n");
        report.append("   ").append(testVoiceBroadcast(deviceSn, "Test message")).append("\n\n");

        report.append("5. SOS Command Test:\n");
        report.append("   ").append(testSosCommand(deviceSn, true)).append("\n\n");

        report.append("6. Firmware Upgrade Test:\n");
        report.append("   ").append(testFirmwareUpgrade(deviceSn, null)).append("\n\n");

        report.append("=== End of Test Report ===\n");

        log.info(report.toString());
        return report.toString();
    }
}
