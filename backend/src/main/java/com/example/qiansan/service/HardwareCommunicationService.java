package com.example.qiansan.service;

/**
 * 硬件设备通信服务接口
 * 负责与头盔硬件设备进行真实数据通信
 */
public interface HardwareCommunicationService {

    /**
     * 向设备发送LED控制命令
     * @param deviceSn 设备序列号
     * @param status LED状态（0:关闭, 1:开启, 2:闪烁）
     * @return 是否发送成功
     */
    boolean sendLedControl(String deviceSn, Integer status);

    /**
     * 向设备发送语音播报命令
     * @param deviceSn 设备序列号
     * @param message 需要播报的消息内容
     * @return 是否发送成功
     */
    boolean sendVoiceBroadcast(String deviceSn, String message);

    /**
     * 向设备发送音量调节命令
     * @param deviceSn 设备序列号
     * @param volume 音量值（0-100）
     * @return 是否发送成功
     */
    boolean setVoiceVolume(String deviceSn, Integer volume);

    /**
     * 向设备发送SOS报警触发命令
     * @param deviceSn 设备序列号
     * @param enabled 是否启用（true:启用, false:取消）
     * @return 是否发送成功
     */
    boolean triggerSosAlarm(String deviceSn, Boolean enabled);

    /**
     * 检查设备连接状态
     * @param deviceSn 设备序列号
     * @return 设备是否在线
     */
    boolean isDeviceOnline(String deviceSn);
}
