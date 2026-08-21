package com.careerpilot.modules.resume.storage;
import org.springframework.core.io.Resource;
public interface ResumeStorageService {
    String store(byte[] content, String extension);
    Resource load(String storageKey);
    void delete(String storageKey);
}
