package com.careerpilot.modules.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MessageResponse(String message, String developmentResetToken) {
    public MessageResponse(String message) { this(message, null); }
}
