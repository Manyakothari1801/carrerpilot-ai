package com.careerpilot.modules.resume.service;
import org.springframework.core.io.Resource;
public record ResumeDownload(Resource resource,String filename,String mimeType,long size) { }
