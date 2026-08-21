package com.careerpilot.modules.resume.validation;

import com.careerpilot.config.ResumeProperties;
import com.careerpilot.modules.resume.exception.ResumeException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Component
public class ResumeFileValidator {
    public static final String PDF="application/pdf";
    public static final String DOCX="application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    private final ResumeProperties properties;
    public ResumeFileValidator(ResumeProperties properties){this.properties=properties;}
    public ValidatedResumeFile validate(MultipartFile file){
        if(file==null||file.isEmpty())throw new ResumeException(HttpStatus.BAD_REQUEST,"Resume file must not be empty");
        if(file.getSize()>properties.maxFileSizeBytes())throw new ResumeException(HttpStatus.PAYLOAD_TOO_LARGE,"Resume exceeds the "+properties.maxFileSizeMb()+" MB limit");
        byte[] bytes;try{bytes=file.getBytes();}catch(IOException e){throw new ResumeException(HttpStatus.BAD_REQUEST,"Resume file could not be read");}
        String declared=file.getContentType();String ext;
        if(isPdf(bytes)){if(!PDF.equalsIgnoreCase(declared))throw new ResumeException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,"PDF MIME type does not match file content");ext=".pdf";declared=PDF;}
        else if(isDocx(bytes)){if(!DOCX.equalsIgnoreCase(declared))throw new ResumeException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,"DOCX MIME type does not match file content");ext=".docx";declared=DOCX;}
        else throw new ResumeException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,"Only valid PDF and DOCX resumes are supported");
        String name=safeFilename(file.getOriginalFilename(),ext);
        if(!name.toLowerCase().endsWith(ext))throw new ResumeException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,"Filename extension does not match resume content");
        return new ValidatedResumeFile(bytes,name,declared,ext,sha256(bytes));
    }
    private boolean isPdf(byte[] b){return b.length>=5&&b[0]=='%'&&b[1]=='P'&&b[2]=='D'&&b[3]=='F'&&b[4]=='-';}
    private boolean isDocx(byte[] b){return b.length>=4&&b[0]=='P'&&b[1]=='K'&&b[2]==3&&b[3]==4;}
    private String safeFilename(String value,String ext){String name=value==null?"resume"+ext:value.replace('\\','/');name=name.substring(name.lastIndexOf('/')+1).replaceAll("[\\r\\n\\u0000]","").trim();if(name.isBlank())name="resume"+ext;if(name.length()>255)name=name.substring(name.length()-255);return name;}
    private String sha256(byte[] bytes){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));}catch(NoSuchAlgorithmException e){throw new IllegalStateException(e);}}
}
