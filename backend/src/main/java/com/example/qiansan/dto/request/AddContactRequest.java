package com.example.qiansan.dto.request;

import lombok.Data;

@Data
public class AddContactRequest {
    private Long riderId;
    private String contactName;
    private String contactPhone;
}
