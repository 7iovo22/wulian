-- Add device_info column to user table for WeChat login device tracking
-- Migration: V1__add_device_info_to_user.sql

ALTER TABLE user
ADD COLUMN device_info TEXT COMMENT '设备信息JSON' AFTER rider_id;

-- Optional: Create index for faster queries on device info (if needed for analytics)
-- CREATE INDEX idx_user_device_info ON user(device_info(255));
