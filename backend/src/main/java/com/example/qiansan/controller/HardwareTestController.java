package com.example.qiansan.controller;

import com.example.qiansan.dto.response.ApiResponse;
import com.example.qiansan.service.DeviceService;
import com.example.qiansan.util.HardwareConnectionTester;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/hardware")
@RequiredArgsConstructor
public class HardwareTestController {

    private final HardwareConnectionTester hardwareConnectionTester;
    private final DeviceService deviceService;

    @GetMapping("/test/connection")
    public ResponseEntity<ApiResponse<String>> testConnection() {
        log.info("Hardware connection test requested");

        boolean connected = hardwareConnectionTester.testMqttConnection();
        String message = connected ? "MQTT connection is healthy" : "MQTT connection failed";

        return ResponseEntity.ok(ApiResponse.success(message));
    }

    @PostMapping("/test/device/{deviceSn}")
    public ResponseEntity<ApiResponse<String>> testDevice(
            @PathVariable String deviceSn,
            @RequestParam(required = false) String testType) {
        log.info("Device test requested - Device: {}, Type: {}", deviceSn, testType);

        try {
            if (testType == null || testType.isEmpty()) {
                String report = hardwareConnectionTester.generateTestReport(deviceSn);
                return ResponseEntity.ok(ApiResponse.success(report));
            }

            String result;
            switch (testType.toLowerCase()) {
                case "led":
                    result = hardwareConnectionTester.testLedControl(deviceSn, 1);
                    break;
                case "voice":
                    result = hardwareConnectionTester.testVoiceBroadcast(deviceSn, "Test broadcast");
                    break;
                case "volume":
                    result = hardwareConnectionTester.testVolumeControl(deviceSn, 80);
                    break;
                case "sos":
                    result = hardwareConnectionTester.testSosCommand(deviceSn, true);
                    break;
                case "firmware":
                    result = hardwareConnectionTester.testFirmwareUpgrade(deviceSn, null);
                    break;
                case "data":
                    boolean dataTest = hardwareConnectionTester.testDeviceDataReceiving(deviceSn, null);
                    result = dataTest ? "Data receiving test successful" : "Data receiving test failed";
                    break;
                default:
                    result = "Unknown test type: " + testType;
                    return ResponseEntity.badRequest().body(ApiResponse.error(result));
            }

            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (Exception e) {
            log.error("Device test failed: {}", e.getMessage());
            return ResponseEntity.status(500).body(ApiResponse.error("Test failed: " + e.getMessage()));
        }
    }

    @PostMapping("/test/led")
    public ResponseEntity<ApiResponse<String>> testLedControl(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Integer status) {
        log.info("LED control test requested - User: {}, Status: {}", userId, status);

        try {
            var device = deviceService.getDeviceByRiderId(userId);
            if (device == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Device not bound"));
            }

            String result = hardwareConnectionTester.testLedControl(device.getDeviceSn(), status);
            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (Exception e) {
            log.error("LED test failed: {}", e.getMessage());
            return ResponseEntity.status(500).body(ApiResponse.error("Test failed: " + e.getMessage()));
        }
    }

    @PostMapping("/test/voice")
    public ResponseEntity<ApiResponse<String>> testVoiceBroadcast(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam String message) {
        log.info("Voice broadcast test requested - User: {}", userId);

        try {
            var device = deviceService.getDeviceByRiderId(userId);
            if (device == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Device not bound"));
            }

            String result = hardwareConnectionTester.testVoiceBroadcast(device.getDeviceSn(), message);
            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (Exception e) {
            log.error("Voice test failed: {}", e.getMessage());
            return ResponseEntity.status(500).body(ApiResponse.error("Test failed: " + e.getMessage()));
        }
    }

    @PostMapping("/test/volume")
    public ResponseEntity<ApiResponse<String>> testVolumeControl(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Integer volume) {
        log.info("Volume control test requested - User: {}, Volume: {}", userId, volume);

        try {
            var device = deviceService.getDeviceByRiderId(userId);
            if (device == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Device not bound"));
            }

            String result = hardwareConnectionTester.testVolumeControl(device.getDeviceSn(), volume);
            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (Exception e) {
            log.error("Volume test failed: {}", e.getMessage());
            return ResponseEntity.status(500).body(ApiResponse.error("Test failed: " + e.getMessage()));
        }
    }

    @PostMapping("/test/sos")
    public ResponseEntity<ApiResponse<String>> testSosCommand(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Boolean enabled) {
        log.info("SOS test requested - User: {}, Enabled: {}", userId, enabled);

        try {
            var device = deviceService.getDeviceByRiderId(userId);
            if (device == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Device not bound"));
            }

            String result = hardwareConnectionTester.testSosCommand(device.getDeviceSn(), enabled);
            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (Exception e) {
            log.error("SOS test failed: {}", e.getMessage());
            return ResponseEntity.status(500).body(ApiResponse.error("Test failed: " + e.getMessage()));
        }
    }

    @GetMapping("/test/report/{deviceSn}")
    public ResponseEntity<ApiResponse<String>> generateTestReport(@PathVariable String deviceSn) {
        log.info("Generating test report for device: {}", deviceSn);

        try {
            String report = hardwareConnectionTester.generateTestReport(deviceSn);
            return ResponseEntity.ok(ApiResponse.success(report));

        } catch (Exception e) {
            log.error("Report generation failed: {}", e.getMessage());
            return ResponseEntity.status(500).body(ApiResponse.error("Report generation failed: " + e.getMessage()));
        }
    }

    @GetMapping("/test/report/me")
    public ResponseEntity<ApiResponse<String>> generateMyDeviceTestReport(@RequestHeader("X-User-Id") Long userId) {
        log.info("Generating test report for user: {}", userId);

        try {
            var device = deviceService.getDeviceByRiderId(userId);
            if (device == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Device not bound"));
            }

            String report = hardwareConnectionTester.generateTestReport(device.getDeviceSn());
            return ResponseEntity.ok(ApiResponse.success(report));

        } catch (Exception e) {
            log.error("Report generation failed: {}", e.getMessage());
            return ResponseEntity.status(500).body(ApiResponse.error("Report generation failed: " + e.getMessage()));
        }
    }
}
