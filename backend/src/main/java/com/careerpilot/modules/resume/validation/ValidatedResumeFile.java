package com.careerpilot.modules.resume.validation;
public record ValidatedResumeFile(byte[] content,String originalFilename,String mimeType,String extension,String checksum) { }
