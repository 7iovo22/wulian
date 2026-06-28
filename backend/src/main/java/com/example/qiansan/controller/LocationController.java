package com.example.qiansan.controller;

import com.example.qiansan.dto.request.LocationUpdateRequest;
import com.example.qiansan.dto.response.ApiResponse;
import com.example.qiansan.entity.RiderLocation;
import com.example.qiansan.service.LocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<RiderLocation>> updateLocation(@RequestBody LocationUpdateRequest request) {
        RiderLocation location = locationService.updateLocation(request);
        return ResponseEntity.ok(ApiResponse.success(location));
    }

    @GetMapping("/realtime/{riderId}")
    public ResponseEntity<ApiResponse<RiderLocation>> getRealtimeLocation(@PathVariable Long riderId) {
        RiderLocation location = locationService.getRealtimeLocation(riderId);
        return ResponseEntity.ok(ApiResponse.success(location));
    }

    @GetMapping("/history/{riderId}")
    public ResponseEntity<ApiResponse<List<RiderLocation>>> getHistoryLocation(
            @PathVariable Long riderId,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        log.info("Get history location for rider {}: {} - {}", riderId, startTime, endTime);
        List<RiderLocation> locations = locationService.getHistoryLocation(riderId, startTime, endTime);
        return ResponseEntity.ok(ApiResponse.success(locations));
    }

    @PostMapping("/share")
    public ResponseEntity<ApiResponse<Void>> shareLocation(@RequestHeader("X-User-Id") Long userId) {
        log.info("Share location request from user {}", userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
