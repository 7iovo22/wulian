package com.example.qiansan.config;

import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Configuration
@EnableScheduling
public class MqttConfig {

    @Value("${mqtt.host}")
    private String host;

    @Value("${mqtt.port}")
    private int port;

    @Value("${mqtt.client-id}")
    private String clientId;

    @Value("${mqtt.username}")
    private String username;

    @Value("${mqtt.password}")
    private String password;

    @Value("${mqtt.topic-subscribe}")
    private String topicSubscribe;

    @Value("${mqtt.timeout}")
    private int timeout;

    @Value("${mqtt.keepalive}")
    private int keepalive;

    @Autowired(required = false)
    private MqttPushCallback mqttPushCallback;

    private final AtomicInteger reconnectAttempts = new AtomicInteger(0);
    private final Map<String, Integer> topicMessageCount = new ConcurrentHashMap<>();
    private volatile MqttClient mqttClientInstance;

    @Bean
    public MqttClient mqttClient() {
        try {
            String brokerUrl = String.format("tcp://%s:%d", host, port);
            log.info("🔗 Connecting to MQTT Broker: {}", brokerUrl);

            MemoryPersistence persistence = new MemoryPersistence();
            MqttClient mqttClient = new MqttClient(brokerUrl, clientId, persistence);

            MqttConnectOptions options = new MqttConnectOptions();
            if (username != null && !username.trim().isEmpty()) {
                options.setUserName(username);
            }
            if (password != null && !password.trim().isEmpty()) {
                options.setPassword(password.toCharArray());
            }
            options.setConnectionTimeout(timeout);
            options.setKeepAliveInterval(keepalive);
            options.setCleanSession(true);
            options.setAutomaticReconnect(true);

            mqttClient.setCallback(mqttPushCallback);

            mqttClient.connect(options);

            String[] topics = topicSubscribe.split(",");
            int[] qos = new int[topics.length];
            for (int i = 0; i < qos.length; i++) {
                qos[i] = 1;
                topicMessageCount.put(topics[i].trim(), 0);
            }

            mqttClient.subscribe(topics, qos);

            reconnectAttempts.set(0);
            mqttClientInstance = mqttClient;
            log.info("✅ MQTT connection established: {}", brokerUrl);
            log.info("✅ Subscribed to topics: {}", topicSubscribe);

            return mqttClient;

        } catch (Exception e) {
            reconnectAttempts.incrementAndGet();
            log.error("⚠️ MQTT connection failed (application will continue): {}", e.getMessage());
            log.error("Please check the following:");
            log.error("  - MQTT Host: {}", host);
            log.error("  - MQTT Port: {}", port);
            log.error("  - Network connectivity");
            log.error("  - Firewall rules for port {}", port);
            e.printStackTrace();
            return null;
        }
    }

    @Scheduled(fixedRate = 60000)
    public void monitorMqttConnection() {
        log.info("📊 MQTT Connection Status Report:");
        log.info("  - Host: {}", host);
        log.info("  - Reconnect attempts: {}", reconnectAttempts.get());
        log.info("  - Subscribed topics:");

        topicMessageCount.forEach((topic, count) ->
                log.info("    - {}: {} messages", topic, count)
        );
    }

    public int getReconnectAttempts() {
        return reconnectAttempts.get();
    }

    public boolean isConnected() {
        try {
            return mqttClientInstance != null && mqttClientInstance.isConnected();
        } catch (Exception e) {
            return false;
        }
    }
}
