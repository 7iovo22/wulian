package com.example.qiansan.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.qiansan.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
