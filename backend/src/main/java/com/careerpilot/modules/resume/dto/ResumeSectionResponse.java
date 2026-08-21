package com.careerpilot.modules.resume.dto;
import com.careerpilot.modules.resume.entity.SectionType;
public record ResumeSectionResponse(SectionType type,String text,int sequenceOrder) { }
