package com.example.qiansan.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.qiansan.dto.response.ApiResponse;
import com.example.qiansan.entity.DeviceData;
import com.example.qiansan.entity.HealthRecord;
import com.example.qiansan.mapper.DeviceDataMapper;
import com.example.qiansan.mapper.HealthRecordMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final DeviceDataMapper deviceDataMapper;
    private final HealthRecordMapper healthRecordMapper;

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<DeviceData>> getCurrentHealthData(@RequestHeader("X-User-Id") Long userId) {
        DeviceData data = deviceDataMapper.selectOne(new LambdaQueryWrapper<DeviceData>()
                .eq(DeviceData::getRiderId, userId)
                .orderByDesc(DeviceData::getCreateTime)
                .last("LIMIT 1"));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<DeviceData>>> getHealthHistory(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        List<DeviceData> dataList = deviceDataMapper.selectList(new LambdaQueryWrapper<DeviceData>()
                .eq(DeviceData::getRiderId, userId)
                .ge(DeviceData::getCreateTime, startTime)
                .le(DeviceData::getCreateTime, endTime)
                .orderByAsc(DeviceData::getCreateTime));
        return ResponseEntity.ok(ApiResponse.success(dataList));
    }

    @GetMapping("/heartrate")
    public ResponseEntity<ApiResponse<List<DeviceData>>> getHeartRateData(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        List<DeviceData> dataList = deviceDataMapper.selectList(new LambdaQueryWrapper<DeviceData>()
                .eq(DeviceData::getRiderId, userId)
                .ge(DeviceData::getCreateTime, startTime)
                .le(DeviceData::getCreateTime, endTime)
                .orderByAsc(DeviceData::getCreateTime));
        return ResponseEntity.ok(ApiResponse.success(dataList));
    }

    @GetMapping("/bloodoxygen")
    public ResponseEntity<ApiResponse<List<DeviceData>>> getBloodOxygenData(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        List<DeviceData> dataList = deviceDataMapper.selectList(new LambdaQueryWrapper<DeviceData>()
                .eq(DeviceData::getRiderId, userId)
                .ge(DeviceData::getCreateTime, startTime)
                .le(DeviceData::getCreateTime, endTime)
                .orderByAsc(DeviceData::getCreateTime));
        return ResponseEntity.ok(ApiResponse.success(dataList));
    }

    @GetMapping("/temperature")
    public ResponseEntity<ApiResponse<List<DeviceData>>> getTemperatureData(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        List<DeviceData> dataList = deviceDataMapper.selectList(new LambdaQueryWrapper<DeviceData>()
                .eq(DeviceData::getRiderId, userId)
                .ge(DeviceData::getCreateTime, startTime)
                .le(DeviceData::getCreateTime, endTime)
                .orderByAsc(DeviceData::getCreateTime));
        return ResponseEntity.ok(ApiResponse.success(dataList));
    }

    @GetMapping("/daily-record")
    public ResponseEntity<ApiResponse<HealthRecord>> getDailyHealthRecord(@RequestHeader("X-User-Id") Long userId) {
        HealthRecord record = healthRecordMapper.selectOne(new LambdaQueryWrapper<HealthRecord>()
                .eq(HealthRecord::getRiderId, userId)
                .eq(HealthRecord::getRecordDate, LocalDate.now())
                .orderByDesc(HealthRecord::getCreateTime)
                .last("LIMIT 1"));
        return ResponseEntity.ok(ApiResponse.success(record));
    }
}
