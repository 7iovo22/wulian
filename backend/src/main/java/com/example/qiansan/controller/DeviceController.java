package com.example.qiansan.controller;

import com.example.qiansan.dto.request.BindDeviceRequest;
import com.example.qiansan.dto.response.ApiResponse;
import com.example.qiansan.entity.Device;
import com.example.qiansan.entity.DeviceData;
import com.example.qiansan.service.DeviceService;
import com.example.qiansan.service.HardwareCommunicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/device")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;
    private final HardwareCommunicationService hardwareCommunicationService;

    @PostMapping("/bind")
    public ResponseEntity<ApiResponse<Device>> bindDevice(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody BindDeviceRequest request) {
        log.info("Bind device request for user {}: {}", userId, request.getDeviceSn());
        Device device = deviceService.bindDevice(userId, request);
        return ResponseEntity.ok(ApiResponse.success(device));
    }

    @DeleteMapping("/unbind/{id}")
    public ResponseEntity<ApiResponse<Void>> unbindDevice(@PathVariable Long id) {
        log.info("Unbind device request for id {}", id);
        deviceService.unbindDevice(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Device>> getDeviceStatus(@RequestHeader("X-User-Id") Long userId) {
        log.info("Get device status for user {}", userId);
        Device device = deviceService.getDeviceByRiderId(userId);

        if (device != null) {
            boolean isOnline = hardwareCommunicationService.isDeviceOnline(device.getDeviceSn());
            log.info("Device {} online status: {}", device.getDeviceSn(), isOnline);
        }

        return ResponseEntity.ok(ApiResponse.success(device));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Device>> getDeviceById(@PathVariable Long id) {
        Device device = deviceService.getDeviceById(id);
        return ResponseEntity.ok(ApiResponse.success(device));
    }

    @PutMapping("/led")
    public ResponseEntity<ApiResponse<Void>> controlLED(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Integer status) {
        Device device = deviceService.getDeviceByRiderId(userId);
        if (device == null) {
            log.error("Device not found for user {}", userId);
            return ResponseEntity.badRequest().body(ApiResponse.error("设备未绑定"));
        }

        log.info("Control LED for device {}: {}", device.getDeviceSn(), status);

        boolean success = hardwareCommunicationService.sendLedControl(device.getDeviceSn(), status);
        if (!success) {
            log.error("Failed to send LED control command to device {}", device.getDeviceSn());
            return ResponseEntity.status(500).body(ApiResponse.error("命令发送失败，请检查设备连接"));
        }

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/voice")
    public ResponseEntity<ApiResponse<Void>> setVoice(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Integer volume) {
        Device device = deviceService.getDeviceByRiderId(userId);
        if (device == null) {
            log.error("Device not found for user {}", userId);
            return ResponseEntity.badRequest().body(ApiResponse.error("设备未绑定"));
        }

        log.info("Set voice volume for device {}: {}", device.getDeviceSn(), volume);

        boolean success = hardwareCommunicationService.setVoiceVolume(device.getDeviceSn(), volume);
        if (!success) {
            log.error("Failed to send voice volume command to device {}", device.getDeviceSn());
            return ResponseEntity.status(500).body(ApiResponse.error("命令发送失败，请检查设备连接"));
        }

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/broadcast")
    public ResponseEntity<ApiResponse<Void>> sendVoiceBroadcast(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam String message) {
        Device device = deviceService.getDeviceByRiderId(userId);
        if (device == null) {
            log.error("Device not found for user {}", userId);
            return ResponseEntity.badRequest().body(ApiResponse.error("设备未绑定"));
        }

        log.info("Send voice broadcast to device {}: {}", device.getDeviceSn(), message);

        boolean success = hardwareCommunicationService.sendVoiceBroadcast(device.getDeviceSn(), message);
        if (!success) {
            log.error("Failed to send voice broadcast to device {}", device.getDeviceSn());
            return ResponseEntity.status(500).body(ApiResponse.error("广播发送失败，请检查设备连接"));
        }

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/sos")
    public ResponseEntity<ApiResponse<Void>> triggerSos(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Boolean enabled) {
        Device device = deviceService.getDeviceByRiderId(userId);
        if (device == null) {
            log.error("Device not found for user {}", userId);
            return ResponseEntity.badRequest().body(ApiResponse.error("设备未绑定"));
        }

        log.info("Trigger SOS for device {}: {}", device.getDeviceSn(), enabled);

        boolean success = hardwareCommunicationService.triggerSosAlarm(device.getDeviceSn(), enabled);
        if (!success) {
            log.error("Failed to trigger SOS for device {}", device.getDeviceSn());
            return ResponseEntity.status(500).body(ApiResponse.error("SOS命令发送失败，请检查设备连接"));
        }

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/online")
    public ResponseEntity<ApiResponse<Boolean>> checkDeviceOnline(@RequestHeader("X-User-Id") Long userId) {
        Device device = deviceService.getDeviceByRiderId(userId);
        if (device == null) {
            log.error("Device not found for user {}", userId);
            return ResponseEntity.badRequest().body(ApiResponse.error("设备未绑定"));
        }

        boolean isOnline = hardwareCommunicationService.isDeviceOnline(device.getDeviceSn());
        return ResponseEntity.ok(ApiResponse.success(isOnline));
    }

    @GetMapping("/data/latest")
    public ResponseEntity<ApiResponse<DeviceData>> getLatestDeviceData(@RequestHeader("X-User-Id") Long userId) {
        DeviceData data = deviceService.getLatestDeviceData(userId);
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
