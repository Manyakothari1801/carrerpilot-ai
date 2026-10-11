package com.careerpilot.modules.scheduling.dto;import jakarta.validation.constraints.NotNull;import java.time.Instant;public record RescheduleExamRequest(@NotNull Instant scheduledStart){}
