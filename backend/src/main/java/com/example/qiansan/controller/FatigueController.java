package com.example.qiansan.controller;

import com.example.qiansan.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/fatigue")
@RequiredArgsConstructor
public class FatigueController {

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentFatigueLevel(@RequestHeader("X-User-Id") Long userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("riderId", userId);
        result.put("fatigueLevel", 1);
        result.put("fatigueLabel", "轻度疲劳");
        result.put("rideDuration", 180);
        result.put("suggestRest", false);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Object>> getFatigueHistory(@RequestHeader("X-User-Id") Long userId) {
        Map<String, Object> history = new HashMap<>();
        history.put("riderId", userId);
        history.put("records", new Object[]{
                new HashMap<String, Object>() {{
                    put("time", "2024-01-15 08:30:00");
                    put("level", 1);
                    put("duration", 120);
                }},
                new HashMap<String, Object>() {{
                    put("time", "2024-01-15 14:00:00");
                    put("level", 2);
                    put("duration", 240);
                }}
        });
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @PostMapping("/rest/start")
    public ResponseEntity<ApiResponse<Map<String, Object>>> startRest(@RequestHeader("X-User-Id") Long userId) {
        log.info("Start rest for rider {}", userId);
        Map<String, Object> result = new HashMap<>();
        result.put("riderId", userId);
        result.put("restStartTime", java.time.LocalDateTime.now().toString());
        result.put("requiredMinutes", 30);
        result.put("dispatchPaused", true);
        return ResponseEntity.ok(ApiResponse.success("休息计时已开始", result));
    }

    @PostMapping("/rest/complete")
    public ResponseEntity<ApiResponse<Map<String, Object>>> completeRest(@RequestHeader("X-User-Id") Long userId) {
        log.info("Complete rest for rider {}", userId);
        Map<String, Object> result = new HashMap<>();
        result.put("riderId", userId);
        result.put("restCompleted", true);
        result.put("dispatchPaused", false);
        return ResponseEntity.ok(ApiResponse.success("休息完成，已恢复接单", result));
    }

    @PutMapping("/dispatch")
    public ResponseEntity<ApiResponse<Map<String, Object>>> setDispatchStatus(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Integer status) {
        log.info("Set dispatch status for rider {}: {}", userId, status);
        Map<String, Object> result = new HashMap<>();
        result.put("riderId", userId);
        result.put("dispatchStatus", status == 0 ? "正常" : "暂停");
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
