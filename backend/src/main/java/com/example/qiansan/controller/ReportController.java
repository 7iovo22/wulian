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
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDailyReport(@RequestHeader("X-User-Id") Long userId) {
        log.info("Get daily report for user {}", userId);
        Map<String, Object> report = new HashMap<>();
        report.put("riderId", userId);
        report.put("date", java.time.LocalDate.now().toString());
        report.put("rideDistance", 35.5);
        report.put("avgSpeed", 25.3);
        report.put("safetyScore", 85);
        report.put("warningCount", 2);
        report.put("behaviorAnalysis", "今日骑行状态良好，建议注意休息");
        report.put("suggestion", "建议每2小时休息一次");
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWeeklyReport(@RequestHeader("X-User-Id") Long userId) {
        log.info("Get weekly report for user {}", userId);
        Map<String, Object> report = new HashMap<>();
        report.put("riderId", userId);
        report.put("weekStart", java.time.LocalDate.now().minusDays(7).toString());
        report.put("weekEnd", java.time.LocalDate.now().toString());
        report.put("totalDistance", 245.8);
        report.put("avgDailyDistance", 35.1);
        report.put("avgSpeed", 24.8);
        report.put("safetyScore", 82);
        report.put("warningCount", 12);
        report.put("trend", "本周安全评分较上周提升3分");
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMonthlyReport(@RequestHeader("X-User-Id") Long userId) {
        log.info("Get monthly report for user {}", userId);
        Map<String, Object> report = new HashMap<>();
        report.put("riderId", userId);
        report.put("month", java.time.LocalDate.now().getMonth().name());
        report.put("year", java.time.LocalDate.now().getYear());
        report.put("totalDistance", 986.5);
        report.put("totalOrders", 423);
        report.put("avgSafetyScore", 84);
        report.put("warningCount", 45);
        report.put("achievements", new String[]{"安全骑行30天", "连续7天无违规"});
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/trend")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTrendData(@RequestHeader("X-User-Id") Long userId) {
        log.info("Get trend data for user {}", userId);
        Map<String, Object> trend = new HashMap<>();
        trend.put("labels", new String[]{"周一", "周二", "周三", "周四", "周五", "周六", "周日"});
        trend.put("safetyScores", new Integer[]{80, 82, 78, 85, 88, 83, 86});
        trend.put("distances", new Double[]{32.5, 38.2, 28.8, 42.1, 35.6, 45.3, 38.9});
        return ResponseEntity.ok(ApiResponse.success(trend));
    }
}
