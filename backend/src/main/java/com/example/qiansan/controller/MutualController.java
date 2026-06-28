package com.example.qiansan.controller;

import com.example.qiansan.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/mutual")
@RequiredArgsConstructor
public class MutualController {

    @PostMapping("/help/request")
    public ResponseEntity<ApiResponse<Map<String, Object>>> requestHelp(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam String type,
            @RequestParam String longitude,
            @RequestParam String latitude) {
        log.warn("Mutual help request from rider {}: {}", userId, type);
        Map<String, Object> result = new HashMap<>();
        result.put("requestId", "HELP-" + System.currentTimeMillis());
        result.put("riderId", userId);
        result.put("type", type);
        result.put("longitude", longitude);
        result.put("latitude", latitude);
        result.put("status", "pending");
        return ResponseEntity.ok(ApiResponse.success("求助请求已发布", result));
    }

    @PostMapping("/help/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelHelp(@RequestHeader("X-User-Id") Long userId, @RequestParam String requestId) {
        log.info("Cancel help request from rider {}: {}", userId, requestId);
        return ResponseEntity.ok(ApiResponse.success((Void) null));
    }

    @PostMapping("/help/respond")
    public ResponseEntity<ApiResponse<Map<String, Object>>> respondHelp(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam String requestId) {
        log.info("Rider {} responding to help request {}", userId, requestId);
        Map<String, Object> result = new HashMap<>();
        result.put("requestId", requestId);
        result.put("responderId", userId);
        result.put("status", "responding");
        return ResponseEntity.ok(ApiResponse.success("已响应求助", result));
    }

    @GetMapping("/help/nearby")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNearbyHelp(@RequestHeader("X-User-Id") Long userId) {
        log.info("Get nearby help requests for rider {}", userId);
        List<Map<String, Object>> requests = List.of(
                new HashMap<String, Object>() {{
                    put("requestId", "HELP-001");
                    put("type", "emergency");
                    put("longitude", "120.123456");
                    put("latitude", "30.654321");
                    put("distance", 1.2);
                    put("time", "2分钟前");
                }},
                new HashMap<String, Object>() {{
                    put("requestId", "HELP-002");
                    put("type", "mechanical");
                    put("longitude", "120.123456");
                    put("latitude", "30.654321");
                    put("distance", 2.5);
                    put("time", "5分钟前");
                }}
        );
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/help/history")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getHelpHistory(@RequestHeader("X-User-Id") Long userId) {
        log.info("Get help history for rider {}", userId);
        List<Map<String, Object>> history = List.of(
                new HashMap<String, Object>() {{
                    put("requestId", "HELP-001");
                    put("type", "emergency");
                    put("status", "completed");
                    put("time", "2024-01-15 10:30:00");
                }}
        );
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
