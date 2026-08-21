package com.careerpilot.modules.resume.parser;
public interface ResumeTextExtractor { boolean supports(String mimeType); String extract(byte[] content); }
