CREATE TABLE IF NOT EXISTS contact_relation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    rider_id BIGINT NOT NULL COMMENT '骑手ID',
    contact_user_id BIGINT DEFAULT NULL COMMENT '联系人用户ID',
    contact_name VARCHAR(50) NOT NULL COMMENT '联系人姓名',
    contact_phone VARCHAR(20) NOT NULL COMMENT '联系人手机号',
    relation VARCHAR(20) DEFAULT NULL COMMENT '关系（父母/配偶/子女/朋友）',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_rider_id (rider_id),
    INDEX idx_contact_phone (contact_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='紧急联系人关系表';