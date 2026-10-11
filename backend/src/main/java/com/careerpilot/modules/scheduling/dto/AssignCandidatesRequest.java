package com.careerpilot.modules.scheduling.dto;import jakarta.validation.constraints.*;import java.util.*;public record AssignCandidatesRequest(@NotEmpty List<UUID>candidateIds){}
