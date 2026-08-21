package com.careerpilot.modules.resume.parser;
import com.careerpilot.modules.resume.entity.SectionType;
public record ParsedSection(SectionType type,String rawText,String normalizedText,int order) { }
