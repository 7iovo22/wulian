package com.example.qiansan.config;

import com.example.qiansan.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        log.warn("Validation error: {}", errors);
        return ApiResponse.error(400, "参数校验失败");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());
        return ApiResponse.error(400, ex.getMessage());
    }

    @ExceptionHandler(SQLException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleSQLException(SQLException ex) {
        log.error("SQL error: ", ex);
        
        String errorMsg = "数据库操作失败";
        String sqlState = ex.getSQLState();
        String message = ex.getMessage();
        
        if (sqlState != null) {
            if (sqlState.startsWith("42")) {
                errorMsg = "数据库表或字段不存在，请检查数据库迁移";
            } else if (sqlState.startsWith("23")) {
                errorMsg = "数据约束冲突，请检查数据";
            } else if (sqlState.startsWith("S1")) {
                errorMsg = "数据库连接问题";
            }
        }
        
        if (message != null) {
            if (message.contains("Table") && message.contains("doesn't exist")) {
                errorMsg = "数据表不存在，请执行数据库迁移";
                log.error("Table not found in SQL error: {}", message);
            } else if (message.contains("Unknown column")) {
                errorMsg = "数据库字段不存在";
            }
        }
        
        return ApiResponse.error(500, errorMsg);
    }

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime exception: ", ex);
        
        String message = ex.getMessage();
        if (message != null) {
            if (message.contains("微信") || message.contains("wechat")) {
                log.error("WeChat related error, returning specific message to frontend: {}", message);
                return ApiResponse.error(500, message);
            }
            if (message.contains("Table") && message.contains("doesn't exist")) {
                return ApiResponse.error(500, "数据表不存在，请执行数据库迁移");
            }
            if (message.contains("Connection refused") || message.contains("Cannot connect")) {
                return ApiResponse.error(500, "数据库连接失败");
            }
        }
        
        return ApiResponse.error(500, "服务器内部错误");
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleAllExceptions(Exception ex) {
        log.error("Unexpected error: ", ex);
        
        String message = ex.getMessage();
        if (message != null) {
            if (message.contains("Table") && message.contains("doesn't exist")) {
                return ApiResponse.error(500, "数据表不存在，请执行数据库迁移");
            }
        }
        
        return ApiResponse.error(500, "服务器内部错误");
    }
}