package com.careerpilot.modules.resume.storage;

import com.careerpilot.config.ResumeProperties;
import com.careerpilot.modules.resume.exception.ResumeException;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class LocalResumeStorageService implements ResumeStorageService {
    private final Path root;
    public LocalResumeStorageService(ResumeProperties properties){
        root=Path.of(properties.storagePath()).toAbsolutePath().normalize();
        try{Files.createDirectories(root);}catch(IOException e){throw new IllegalStateException("Cannot initialize resume storage",e);}
    }
    @Override public String store(byte[] content,String extension){
        String key=UUID.randomUUID()+extension;
        Path target=resolve(key);
        try{Files.write(target,content,StandardOpenOption.CREATE_NEW);}catch(IOException e){throw new ResumeException(HttpStatus.INTERNAL_SERVER_ERROR,"Resume storage failed");}
        return key;
    }
    @Override public Resource load(String key){
        Path file=resolve(key);if(!Files.isRegularFile(file))throw new ResumeException(HttpStatus.NOT_FOUND,"Stored resume file was not found");return new FileSystemResource(file);
    }
    @Override public void delete(String key){
        try{Files.deleteIfExists(resolve(key));}catch(IOException e){throw new ResumeException(HttpStatus.INTERNAL_SERVER_ERROR,"Stored resume file could not be deleted");}
    }
    private Path resolve(String key){
        if(key==null||!key.matches("[0-9a-fA-F-]{36}\\.(pdf|docx)"))throw new ResumeException(HttpStatus.BAD_REQUEST,"Invalid storage key");
        Path value=root.resolve(key).normalize();if(!value.startsWith(root))throw new ResumeException(HttpStatus.BAD_REQUEST,"Invalid storage key");return value;
    }
}
