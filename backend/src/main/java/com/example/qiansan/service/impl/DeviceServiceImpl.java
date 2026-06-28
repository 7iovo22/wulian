package com.example.qiansan.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.qiansan.dto.request.BindDeviceRequest;
import com.example.qiansan.entity.Device;
import com.example.qiansan.entity.DeviceData;
import com.example.qiansan.mapper.DeviceDataMapper;
import com.example.qiansan.mapper.DeviceMapper;
import com.example.qiansan.service.DeviceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceServiceImpl implements DeviceService {

    private final DeviceMapper deviceMapper;
    private final DeviceDataMapper deviceDataMapper;

    @Override
    @Transactional
    public Device bindDevice(Long riderId, BindDeviceRequest request) {
        Device existingDevice = deviceMapper.selectOne(new LambdaQueryWrapper<Device>()
                .eq(Device::getDeviceSn, request.getDeviceSn()));
        
        if (existingDevice != null && existingDevice.getRiderId() != null) {
            throw new IllegalArgumentException("设备已被绑定");
        }

        Device device = new Device();
        device.setDeviceSn(request.getDeviceSn());
        device.setRiderId(riderId);
        device.setStatus(0);
        device.setBattery(100);
        device.setFirmwareVersion("1.0.0");
        device.setBindTime(LocalDateTime.now());
        device.setCreateTime(LocalDateTime.now());
        device.setUpdateTime(LocalDateTime.now());
        
        deviceMapper.insert(device);
        log.info("Device bound: {} to rider {}", request.getDeviceSn(), riderId);
        return device;
    }

    @Override
    @Transactional
    public void unbindDevice(Long deviceId) {
        Device device = getDeviceById(deviceId);
        if (device != null) {
            device.setRiderId(null);
            device.setBindTime(null);
            device.setUpdateTime(LocalDateTime.now());
            deviceMapper.updateById(device);
            log.info("Device unbound: {}", deviceId);
        }
    }

    @Override
    public Device getDeviceBySn(String deviceSn) {
        return deviceMapper.selectOne(new LambdaQueryWrapper<Device>()
                .eq(Device::getDeviceSn, deviceSn));
    }

    @Override
    public Device getDeviceById(Long id) {
        return deviceMapper.selectById(id);
    }

    @Override
    public Device getDeviceByRiderId(Long riderId) {
        return deviceMapper.selectOne(new LambdaQueryWrapper<Device>()
                .eq(Device::getRiderId, riderId));
    }

    @Override
    @Transactional
    public void updateDeviceStatus(String deviceSn, Integer status) {
        Device device = getDeviceBySn(deviceSn);
        if (device != null) {
            device.setStatus(status);
            device.setUpdateTime(LocalDateTime.now());
            deviceMapper.updateById(device);
        }
    }

    @Override
    @Transactional
    public void updateDeviceBattery(String deviceSn, Integer battery) {
        Device device = getDeviceBySn(deviceSn);
        if (device != null) {
            device.setBattery(battery);
            device.setUpdateTime(LocalDateTime.now());
            deviceMapper.updateById(device);
        }
    }

    @Override
    @Transactional
    public DeviceData saveDeviceData(DeviceData data) {
        data.setCreateTime(LocalDateTime.now());
        deviceDataMapper.insert(data);
        return data;
    }

    @Override
    public DeviceData getLatestDeviceData(Long riderId) {
        return deviceDataMapper.selectOne(new LambdaQueryWrapper<DeviceData>()
                .eq(DeviceData::getRiderId, riderId)
                .orderByDesc(DeviceData::getCreateTime)
                .last("LIMIT 1"));
    }
}
