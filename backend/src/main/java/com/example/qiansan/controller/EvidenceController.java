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
@RequestMapping("/api/evidence")
@RequiredArgsConstructor
public class EvidenceController {

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEvidenceList(@RequestHeader("X-User-Id") Long userId) {
        log.info("Get evidence list for user {}", userId);
        List<Map<String, Object>> evidenceList = List.of(
                new HashMap<String, Object>() {{
                    put("id", 1);
                    put("type", "photo");
                    put("title", "出发取餐照片");
                    put("time", "2024-01-15 09:30:00");
                    put("url", "/media/image/1.jpg");
                }},
                new HashMap<String, Object>() {{
                    put("id", 2);
                    put("type", "video");
                    put("title", "异常事件视频");
                    put("time", "2024-01-15 10:15:00");
                    put("url", "/media/video/1.mp4");
                }}
        );
        return ResponseEntity.ok(ApiResponse.success(evidenceList));
    }

    @PostMapping("/report")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateReport(@RequestHeader("X-User-Id") Long userId) {
        log.info("Generate evidence report for user {}", userId);
        Map<String, Object> report = new HashMap<>();
        report.put("reportId", "RPT-" + System.currentTimeMillis());
        report.put("riderId", userId);
        report.put("generateTime", java.time.LocalDateTime.now().toString());
        report.put("evidenceCount", 5);
        report.put("status", "generated");
        return ResponseEntity.ok(ApiResponse.success("证明报告已生成", report));
    }

    @GetMapping("/export/{id}")
    public ResponseEntity<ApiResponse<Void>> exportEvidence(@PathVariable Long id) {
        log.info("Export evidence with id {}", id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/claim")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitClaim(@RequestHeader("X-User-Id") Long userId) {
        log.info("Submit claim for user {}", userId);
        Map<String, Object> result = new HashMap<>();
        result.put("claimId", "CLM-" + System.currentTimeMillis());
        result.put("riderId", userId);
        result.put("status", "submitted");
        result.put("submitTime", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(ApiResponse.success("理赔申请已提交", result));
    }
}
