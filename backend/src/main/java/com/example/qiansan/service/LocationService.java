package com.example.qiansan.service;

import com.example.qiansan.dto.request.LocationUpdateRequest;
import com.example.qiansan.entity.RiderLocation;

import java.util.List;

public interface LocationService {
    RiderLocation updateLocation(LocationUpdateRequest request);
    RiderLocation getRealtimeLocation(Long riderId);
    List<RiderLocation> getHistoryLocation(Long riderId, String startTime, String endTime);
}
