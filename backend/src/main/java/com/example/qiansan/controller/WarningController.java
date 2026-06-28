package com.example.qiansan.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.qiansan.dto.response.ApiResponse;
import com.example.qiansan.entity.AlarmRecord;
import com.example.qiansan.mapper.AlarmRecordMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/warning")
@RequiredArgsConstructor
public class WarningController {

    private final AlarmRecordMapper alarmRecordMapper;

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<AlarmRecord>>> getWarningList(@RequestHeader("X-User-Id") Long userId) {
        List<AlarmRecord> alarms = alarmRecordMapper.selectList(new LambdaQueryWrapper<AlarmRecord>()
                .eq(AlarmRecord::getRiderId, userId)
                .orderByDesc(AlarmRecord::getCreateTime));
        return ResponseEntity.ok(ApiResponse.success(alarms));
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<ApiResponse<AlarmRecord>> getWarningDetail(@PathVariable Long id) {
        AlarmRecord alarm = alarmRecordMapper.selectById(id);
        return ResponseEntity.ok(ApiResponse.success(alarm));
    }

    @PutMapping("/handle/{id}")
    public ResponseEntity<ApiResponse<Void>> handleWarning(@PathVariable Long id) {
        AlarmRecord alarm = alarmRecordMapper.selectById(id);
        if (alarm != null) {
            alarm.setHandleStatus(1);
            alarm.setUpdateTime(LocalDateTime.now());
            alarmRecordMapper.updateById(alarm);
        }
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getWarningStats(@RequestHeader("X-User-Id") Long userId) {
        long totalCount = alarmRecordMapper.selectCount(new LambdaQueryWrapper<AlarmRecord>()
                .eq(AlarmRecord::getRiderId, userId));
        long unhandledCount = alarmRecordMapper.selectCount(new LambdaQueryWrapper<AlarmRecord>()
                .eq(AlarmRecord::getRiderId, userId)
                .eq(AlarmRecord::getHandleStatus, 0));
        
        return ResponseEntity.ok(ApiResponse.success(new java.util.HashMap<String, Long>() {{
            put("total", totalCount);
            put("unhandled", unhandledCount);
        }}));
    }
}
