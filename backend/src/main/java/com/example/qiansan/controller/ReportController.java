package com.example.qiansan.controller;

import com.example.qiansan.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

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

    @GetMapping("/daily/{date}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDailyReportByDate(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String date) {
        log.info("Get daily report for user {} on date {}", userId, date);
        
        Map<String, Object> report = new HashMap<>();
        report.put("id", "daily_" + date);
        report.put("date", date);
        report.put("reportType", "daily");
        report.put("title", date + " 骑行安全日报");
        report.put("generateTime", new Date().toLocaleString());
        report.put("safetyScore", 85);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRides", 5);
        stats.put("totalDistance", 45.6);
        stats.put("totalDuration", 180);
        stats.put("avgSpeed", 15.2);
        stats.put("maxSpeed", 32.5);
        stats.put("eventCount", 2);
        stats.put("warningCount", 1);
        stats.put("dangerCount", 1);
        report.put("stats", stats);
        
        List<Map<String, Object>> events = new ArrayList<>();
        Map<String, Object> event1 = new HashMap<>();
        event1.put("id", "evt001");
        event1.put("type", "fatigue");
        event1.put("content", "疲劳等级达到中度，建议休息");
        event1.put("time", "14:30");
        event1.put("location", "北京市海淀区***");
        event1.put("level", "warning");
        events.add(event1);
        
        Map<String, Object> event2 = new HashMap<>();
        event2.put("id", "evt002");
        event2.put("type", "speed");
        event2.put("content", "检测到超速行驶，当前速度35km/h");
        event2.put("time", "16:45");
        event2.put("location", "北京市朝阳区***");
        event2.put("level", "warning");
        events.add(event2);
        report.put("events", events);
        
        Map<String, Object> health = new HashMap<>();
        health.put("avgHeartRate", 78);
        health.put("maxHeartRate", 112);
        health.put("minHeartRate", 62);
        health.put("avgTemperature", 36.5);
        health.put("maxTemperature", 37.1);
        health.put("fatigueLevel", "light");
        report.put("health", health);
        
        Map<String, Object> device = new HashMap<>();
        device.put("onlineTime", 480);
        device.put("offlineTime", 0);
        device.put("batteryLevel", 75);
        device.put("firmwareVersion", "v2.1.0");
        device.put("sensorStatus", "normal");
        report.put("device", device);
        
        Map<String, Object> trend = new HashMap<>();
        trend.put("weekScore", new Integer[]{82, 85, 88, 80, 85, 83, 85});
        trend.put("weekLabels", new String[]{"周一", "周二", "周三", "周四", "周五", "周六", "今天"});
        report.put("trend", trend);
        
        report.put("aiSummary", "");
        report.put("recommendations", Arrays.asList(
                "今日骑行状态良好，继续保持安全骑行习惯",
                "午后出现轻度疲劳，建议调整骑行时间避开高温时段",
                "注意控制骑行速度，遵守交通规则",
                "建议定期检查头盔设备状态，确保传感器正常工作"
        ));
        
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @PostMapping("/daily/generate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateDailyReport(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Map<String, String> request) {
        String date = request.get("date");
        log.info("Generate daily report for user {} on date {}", userId, date);
        
        Map<String, Object> report = new HashMap<>();
        report.put("id", "daily_" + date);
        report.put("date", date);
        report.put("reportType", "daily");
        report.put("title", date + " 骑行安全日报");
        report.put("generateTime", new Date().toLocaleString());
        report.put("safetyScore", 88);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRides", 5);
        stats.put("totalDistance", 45.6);
        stats.put("totalDuration", 180);
        stats.put("avgSpeed", 15.2);
        stats.put("maxSpeed", 32.5);
        stats.put("eventCount", 2);
        stats.put("warningCount", 1);
        stats.put("dangerCount", 1);
        report.put("stats", stats);
        
        List<Map<String, Object>> events = new ArrayList<>();
        Map<String, Object> event1 = new HashMap<>();
        event1.put("id", "evt001");
        event1.put("type", "fatigue");
        event1.put("content", "疲劳等级达到中度，建议休息");
        event1.put("time", "14:30");
        event1.put("location", "北京市海淀区***");
        event1.put("level", "warning");
        events.add(event1);
        
        Map<String, Object> event2 = new HashMap<>();
        event2.put("id", "evt002");
        event2.put("type", "speed");
        event2.put("content", "检测到超速行驶，当前速度35km/h");
        event2.put("time", "16:45");
        event2.put("location", "北京市朝阳区***");
        event2.put("level", "warning");
        events.add(event2);
        report.put("events", events);
        
        Map<String, Object> health = new HashMap<>();
        health.put("avgHeartRate", 78);
        health.put("maxHeartRate", 112);
        health.put("minHeartRate", 62);
        health.put("avgTemperature", 36.5);
        health.put("maxTemperature", 37.1);
        health.put("fatigueLevel", "light");
        report.put("health", health);
        
        Map<String, Object> device = new HashMap<>();
        device.put("onlineTime", 480);
        device.put("offlineTime", 0);
        device.put("batteryLevel", 75);
        device.put("firmwareVersion", "v2.1.0");
        device.put("sensorStatus", "normal");
        report.put("device", device);
        
        Map<String, Object> trend = new HashMap<>();
        trend.put("weekScore", new Integer[]{82, 85, 88, 80, 85, 83, 88});
        trend.put("weekLabels", new String[]{"周一", "周二", "周三", "周四", "周五", "周六", "今天"});
        report.put("trend", trend);
        
        report.put("aiSummary", "根据今日骑行数据分析：骑手整体骑行状态良好，安全评分达到88分。主要风险点在于午后出现轻度疲劳信号，建议调整骑行节奏。骑行速度控制在合理范围内，但有一次超速记录，建议加强速度控制意识。设备运行状态正常，电池电量充足。");
        report.put("recommendations", Arrays.asList(
                "今日骑行状态良好，继续保持安全骑行习惯",
                "午后出现轻度疲劳，建议调整骑行时间避开高温时段",
                "注意控制骑行速度，遵守交通规则",
                "建议定期检查头盔设备状态，确保传感器正常工作"
        ));
        
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEventReport(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String eventId) {
        log.info("Get event report for user {} with eventId {}", userId, eventId);
        
        Map<String, Object> report = new HashMap<>();
        report.put("id", "event_" + eventId);
        report.put("eventId", eventId);
        report.put("title", "摔倒事件复盘报告");
        report.put("eventType", "fall");
        report.put("riskLevel", "high");
        report.put("riskScore", 85);
        report.put("eventTime", "2024-01-15 10:30:25");
        report.put("location", "北京市朝阳区***");
        
        List<Map<String, Object>> timeline = new ArrayList<>();
        Map<String, Object> t1 = new HashMap<>();
        t1.put("time", "10:30:20");
        t1.put("event", "检测到异常加速度");
        t1.put("type", "warning");
        t1.put("data", "X轴: 4.2g, Y轴: 1.8g, Z轴: -0.5g");
        timeline.add(t1);
        
        Map<String, Object> t2 = new HashMap<>();
        t2.put("time", "10:30:22");
        t2.put("event", "检测到剧烈旋转");
        t2.put("type", "warning");
        t2.put("data", "角速度: 125°/s");
        timeline.add(t2);
        
        Map<String, Object> t3 = new HashMap<>();
        t3.put("time", "10:30:24");
        t3.put("event", "头盔与地面接触");
        t3.put("type", "danger");
        t3.put("data", "撞击力: 1500N");
        timeline.add(t3);
        
        Map<String, Object> t4 = new HashMap<>();
        t4.put("time", "10:30:25");
        t4.put("event", "摔倒确认，自动触发SOS");
        t4.put("type", "danger");
        t4.put("data", "SOS已发送给紧急联系人");
        timeline.add(t4);
        
        Map<String, Object> t5 = new HashMap<>();
        t5.put("time", "10:30:30");
        t5.put("event", "心率监测恢复正常");
        t5.put("type", "normal");
        t5.put("data", "心率: 98bpm");
        timeline.add(t5);
        report.put("timeline", timeline);
        
        List<Map<String, Object>> riskFactors = new ArrayList<>();
        Map<String, Object> rf1 = new HashMap<>();
        rf1.put("name", "撞击力度");
        rf1.put("score", 92);
        riskFactors.add(rf1);
        
        Map<String, Object> rf2 = new HashMap<>();
        rf2.put("name", "头部保护");
        rf2.put("score", 78);
        riskFactors.add(rf2);
        
        Map<String, Object> rf3 = new HashMap<>();
        rf3.put("name", "事故严重程度");
        rf3.put("score", 85);
        riskFactors.add(rf3);
        
        Map<String, Object> rf4 = new HashMap<>();
        rf4.put("name", "环境风险");
        rf4.put("score", 45);
        riskFactors.add(rf4);
        report.put("riskFactors", riskFactors);
        
        Map<String, Object> telemetry = new HashMap<>();
        telemetry.put("maxAcceleration", 4.8);
        telemetry.put("maxRotation", 125);
        telemetry.put("heartRate", 98);
        telemetry.put("temperature", 36.8);
        telemetry.put("speed", 28.5);
        telemetry.put("deviceStatus", "正常");
        report.put("telemetry", telemetry);
        
        report.put("aiAnalysis", "");
        report.put("recommendations", Arrays.asList(
                "本次事故中头盔有效保护了头部，建议继续佩戴",
                "事发时速度较高，建议在城市道路骑行时控制速度在20km/h以内",
                "建议定期检查头盔内部缓冲材料状态",
                "建议在骑行前进行设备自检，确保传感器正常工作"
        ));
        
        report.put("generateTime", new Date().toLocaleString());
        
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @PostMapping("/event/generate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateEventReport(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Map<String, String> request) {
        String eventId = request.get("eventId");
        log.info("Generate event report for user {} with eventId {}", userId, eventId);
        
        Map<String, Object> report = new HashMap<>();
        report.put("id", "event_" + eventId);
        report.put("eventId", eventId);
        report.put("title", "摔倒事件复盘报告");
        report.put("eventType", "fall");
        report.put("riskLevel", "high");
        report.put("riskScore", 85);
        report.put("eventTime", "2024-01-15 10:30:25");
        report.put("location", "北京市朝阳区***");
        
        List<Map<String, Object>> timeline = new ArrayList<>();
        Map<String, Object> t1 = new HashMap<>();
        t1.put("time", "10:30:20");
        t1.put("event", "检测到异常加速度");
        t1.put("type", "warning");
        t1.put("data", "X轴: 4.2g, Y轴: 1.8g, Z轴: -0.5g");
        timeline.add(t1);
        
        Map<String, Object> t2 = new HashMap<>();
        t2.put("time", "10:30:22");
        t2.put("event", "检测到剧烈旋转");
        t2.put("type", "warning");
        t2.put("data", "角速度: 125°/s");
        timeline.add(t2);
        
        Map<String, Object> t3 = new HashMap<>();
        t3.put("time", "10:30:24");
        t3.put("event", "头盔与地面接触");
        t3.put("type", "danger");
        t3.put("data", "撞击力: 1500N");
        timeline.add(t3);
        
        Map<String, Object> t4 = new HashMap<>();
        t4.put("time", "10:30:25");
        t4.put("event", "摔倒确认，自动触发SOS");
        t4.put("type", "danger");
        t4.put("data", "SOS已发送给紧急联系人");
        timeline.add(t4);
        
        Map<String, Object> t5 = new HashMap<>();
        t5.put("time", "10:30:30");
        t5.put("event", "心率监测恢复正常");
        t5.put("type", "normal");
        t5.put("data", "心率: 98bpm");
        timeline.add(t5);
        report.put("timeline", timeline);
        
        List<Map<String, Object>> riskFactors = new ArrayList<>();
        Map<String, Object> rf1 = new HashMap<>();
        rf1.put("name", "撞击力度");
        rf1.put("score", 92);
        riskFactors.add(rf1);
        
        Map<String, Object> rf2 = new HashMap<>();
        rf2.put("name", "头部保护");
        rf2.put("score", 78);
        riskFactors.add(rf2);
        
        Map<String, Object> rf3 = new HashMap<>();
        rf3.put("name", "事故严重程度");
        rf3.put("score", 85);
        riskFactors.add(rf3);
        
        Map<String, Object> rf4 = new HashMap<>();
        rf4.put("name", "环境风险");
        rf4.put("score", 45);
        riskFactors.add(rf4);
        report.put("riskFactors", riskFactors);
        
        Map<String, Object> telemetry = new HashMap<>();
        telemetry.put("maxAcceleration", 4.8);
        telemetry.put("maxRotation", 125);
        telemetry.put("heartRate", 98);
        telemetry.put("temperature", 36.8);
        telemetry.put("speed", 28.5);
        telemetry.put("deviceStatus", "正常");
        report.put("telemetry", telemetry);
        
        report.put("aiAnalysis", "AI智能分析结果：本次事故属于高危摔倒事件，撞击力度达到1500N。头盔在事故中发挥了有效保护作用，头部保护评分78分。事故主要原因是骑行速度过快（28.5km/h），建议在城市道路骑行时控制速度在20km/h以内。事故后心率恢复正常（98bpm），身体状态良好。");
        report.put("recommendations", Arrays.asList(
                "本次事故中头盔有效保护了头部，建议继续佩戴",
                "事发时速度较高，建议在城市道路骑行时控制速度在20km/h以内",
                "建议定期检查头盔内部缓冲材料状态",
                "建议在骑行前进行设备自检，确保传感器正常工作"
        ));
        
        report.put("generateTime", new Date().toLocaleString());
        
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