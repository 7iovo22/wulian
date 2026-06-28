package com.example.qiansan.controller;

import com.example.qiansan.dto.request.SOSRequest;
import com.example.qiansan.dto.response.ApiResponse;
import com.example.qiansan.entity.AlarmRecord;
import com.example.qiansan.service.SosService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/sos")
@RequiredArgsConstructor
public class SosController {

    private final SosService sosService;

    @PostMapping("/trigger")
    public ResponseEntity<ApiResponse<AlarmRecord>> triggerSOS(@RequestBody SOSRequest request) {
        log.warn("SOS trigger request from rider {}", request.getRiderId());
        AlarmRecord alarm = sosService.triggerSOS(request);
        return ResponseEntity.ok(ApiResponse.success(alarm));
    }

    @PostMapping("/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelSOS(@RequestHeader("X-User-Id") Long userId) {
        log.info("SOS cancel request from rider {}", userId);
        sosService.cancelSOS(userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<Void>> confirmSOS(@RequestHeader("X-User-Id") Long userId) {
        log.info("SOS confirm request from rider {}", userId);
        sosService.confirmSOS(userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<AlarmRecord>>> getSOSHistory(@RequestHeader("X-User-Id") Long userId) {
        log.info("Get SOS history for rider {}", userId);
        List<AlarmRecord> history = sosService.getSOSHistory(userId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
