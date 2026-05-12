package com.financetracker.exception;

/**
 * Custom exception for API errors
 */
public class ApiException extends RuntimeException {
    private int statusCode;
    private String errorCode;

    public ApiException(String message) {
        super(message);
        this.statusCode = 400;
        this.errorCode = "BAD_REQUEST";
    }

    public ApiException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = "ERROR";
    }

    public ApiException(String message, int statusCode, String errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
