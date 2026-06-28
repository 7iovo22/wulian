package com.example.qiansan.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.qiansan.dto.request.LocationUpdateRequest;
import com.example.qiansan.entity.RiderLocation;
import com.example.qiansan.mapper.RiderLocationMapper;
import com.example.qiansan.service.LocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {

    private final RiderLocationMapper riderLocationMapper;

    @Override
    @Transactional
    public RiderLocation updateLocation(LocationUpdateRequest request) {
        RiderLocation location = new RiderLocation();
        location.setRiderId(request.getRiderId());
        location.setDeviceSn(request.getDeviceSn());
        location.setLongitude(request.getLongitude());
        location.setLatitude(request.getLatitude());
        location.setCreateTime(LocalDateTime.now());
        
        riderLocationMapper.insert(location);
        log.debug("Location updated for rider {}: {},{}", 
                request.getRiderId(), request.getLongitude(), request.getLatitude());
        
        return location;
    }

    @Override
    public RiderLocation getRealtimeLocation(Long riderId) {
        return riderLocationMapper.selectOne(new LambdaQueryWrapper<RiderLocation>()
                .eq(RiderLocation::getRiderId, riderId)
                .orderByDesc(RiderLocation::getCreateTime)
                .last("LIMIT 1"));
    }

    @Override
    public List<RiderLocation> getHistoryLocation(Long riderId, String startTime, String endTime) {
        return riderLocationMapper.selectList(new LambdaQueryWrapper<RiderLocation>()
                .eq(RiderLocation::getRiderId, riderId)
                .ge(RiderLocation::getCreateTime, startTime)
                .le(RiderLocation::getCreateTime, endTime)
                .orderByAsc(RiderLocation::getCreateTime));
    }
}
