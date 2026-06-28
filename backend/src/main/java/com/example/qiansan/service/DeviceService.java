package com.example.qiansan.service;

import com.example.qiansan.dto.request.BindDeviceRequest;
import com.example.qiansan.entity.Device;
import com.example.qiansan.entity.DeviceData;

public interface DeviceService {
    Device bindDevice(Long riderId, BindDeviceRequest request);
    void unbindDevice(Long deviceId);
    Device getDeviceBySn(String deviceSn);
    Device getDeviceById(Long id);
    Device getDeviceByRiderId(Long riderId);
    void updateDeviceStatus(String deviceSn, Integer status);
    void updateDeviceBattery(String deviceSn, Integer battery);
    DeviceData saveDeviceData(DeviceData data);
    DeviceData getLatestDeviceData(Long riderId);
}
