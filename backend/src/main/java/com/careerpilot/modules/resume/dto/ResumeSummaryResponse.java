package com.careerpilot.modules.resume.dto;
import com.careerpilot.modules.resume.entity.ParseStatus;
import java.time.Instant;
import java.util.UUID;
public record ResumeSummaryResponse(UUID id,String originalFilename,String mimeType,long fileSize,boolean active,ParseStatus parseStatus,Instant uploadedAt) { }
