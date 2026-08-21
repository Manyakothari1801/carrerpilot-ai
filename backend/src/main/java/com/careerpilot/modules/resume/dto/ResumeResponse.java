package com.careerpilot.modules.resume.dto;
import com.careerpilot.modules.resume.entity.ParseStatus;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
public record ResumeResponse(UUID id,String originalFilename,String mimeType,long fileSize,String checksum,boolean active,ParseStatus parseStatus,Instant uploadedAt,ResumeContactResponse contact,List<ResumeSectionResponse> sections) { }
