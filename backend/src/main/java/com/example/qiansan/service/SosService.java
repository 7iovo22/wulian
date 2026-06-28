package com.example.qiansan.service;

import com.example.qiansan.dto.request.SOSRequest;
import com.example.qiansan.entity.AlarmRecord;

import java.util.List;

public interface SosService {
    AlarmRecord triggerSOS(SOSRequest request);
    void cancelSOS(Long riderId);
    void confirmSOS(Long riderId);
    List<AlarmRecord> getSOSHistory(Long riderId);
}
