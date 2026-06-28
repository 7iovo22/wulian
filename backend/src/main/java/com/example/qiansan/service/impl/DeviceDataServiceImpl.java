package com.example.qiansan.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.qiansan.entity.AlarmRecord;
import com.example.qiansan.entity.DeviceData;
import com.example.qiansan.mapper.AlarmRecordMapper;
import com.example.qiansan.mapper.DeviceDataMapper;
import com.example.qiansan.service.DeviceDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DeviceDataServiceImpl extends ServiceImpl<DeviceDataMapper, DeviceData> implements DeviceDataService {

    @Autowired
    private AlarmRecordMapper alarmRecordMapper;

    @Override
    public void saveDeviceData(DeviceData data) {
        this.save(data);
    }

    @Override
    public void createFallAlarm(DeviceData data) {
        AlarmRecord alarm = new AlarmRecord();
        alarm.setDeviceSn(data.getDeviceSn());
        alarm.setRiderId(data.getRiderId());
        alarm.setAlarmType("fall");
        alarm.setAlarmContent("骑手摔倒，触发安全报警");
        alarm.setLongitude(data.getLongitude());
        alarm.setLatitude(data.getLatitude());
        alarm.setHandleStatus(0);
        alarmRecordMapper.insert(alarm);
    }
}
