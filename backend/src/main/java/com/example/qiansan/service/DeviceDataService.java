package com.example.qiansan.service;

import com.example.qiansan.entity.DeviceData;

public interface DeviceDataService {
    /**
     * 保存设备数据
     */
    void saveDeviceData(DeviceData data);

    /**
     * 创建摔倒报警
     */
    void createFallAlarm(DeviceData data);
}
