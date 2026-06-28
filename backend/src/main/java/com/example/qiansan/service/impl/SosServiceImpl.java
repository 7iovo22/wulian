package com.example.qiansan.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.qiansan.dto.request.SOSRequest;
import com.example.qiansan.entity.AlarmRecord;
import com.example.qiansan.mapper.AlarmRecordMapper;
import com.example.qiansan.service.SosService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SosServiceImpl implements SosService {

    private final AlarmRecordMapper alarmRecordMapper;

    @Override
    @Transactional
    public AlarmRecord triggerSOS(SOSRequest request) {
        AlarmRecord alarm = new AlarmRecord();
        alarm.setRiderId(request.getRiderId());
        alarm.setAlarmType("sos");
        alarm.setAlarmContent(request.getDescription() != null ? request.getDescription() : "骑手触发SOS求助");
        alarm.setLongitude(request.getLongitude());
        alarm.setLatitude(request.getLatitude());
        alarm.setHandleStatus(0);
        alarm.setCreateTime(LocalDateTime.now());
        alarm.setUpdateTime(LocalDateTime.now());
        
        alarmRecordMapper.insert(alarm);
        log.warn("SOS triggered by rider {} at location {},{}", 
                request.getRiderId(), request.getLongitude(), request.getLatitude());
        
        return alarm;
    }

    @Override
    @Transactional
    public void cancelSOS(Long riderId) {
        AlarmRecord alarm = alarmRecordMapper.selectOne(new LambdaQueryWrapper<AlarmRecord>()
                .eq(AlarmRecord::getRiderId, riderId)
                .eq(AlarmRecord::getAlarmType, "sos")
                .eq(AlarmRecord::getHandleStatus, 0)
                .orderByDesc(AlarmRecord::getCreateTime)
                .last("LIMIT 1"));
        
        if (alarm != null) {
            alarm.setHandleStatus(1);
            alarm.setUpdateTime(LocalDateTime.now());
            alarmRecordMapper.updateById(alarm);
            log.info("SOS cancelled by rider {}", riderId);
        }
    }

    @Override
    @Transactional
    public void confirmSOS(Long riderId) {
        AlarmRecord alarm = alarmRecordMapper.selectOne(new LambdaQueryWrapper<AlarmRecord>()
                .eq(AlarmRecord::getRiderId, riderId)
                .eq(AlarmRecord::getAlarmType, "sos")
                .eq(AlarmRecord::getHandleStatus, 0)
                .orderByDesc(AlarmRecord::getCreateTime)
                .last("LIMIT 1"));
        
        if (alarm != null) {
            alarm.setHandleStatus(1);
            alarm.setUpdateTime(LocalDateTime.now());
            alarmRecordMapper.updateById(alarm);
            log.info("SOS confirmed by rider {}", riderId);
        }
    }

    @Override
    public List<AlarmRecord> getSOSHistory(Long riderId) {
        return alarmRecordMapper.selectList(new LambdaQueryWrapper<AlarmRecord>()
                .eq(AlarmRecord::getRiderId, riderId)
                .eq(AlarmRecord::getAlarmType, "sos")
                .orderByDesc(AlarmRecord::getCreateTime));
    }
}
