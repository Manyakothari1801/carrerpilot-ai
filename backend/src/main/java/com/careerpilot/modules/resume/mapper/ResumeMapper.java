package com.careerpilot.modules.resume.mapper;

import com.careerpilot.modules.resume.dto.*;
import com.careerpilot.modules.resume.entity.Resume;
import com.careerpilot.modules.resume.parser.ContactExtractor;
import org.springframework.stereotype.Component;

@Component
public class ResumeMapper {
    private final ContactExtractor contacts;
    public ResumeMapper(ContactExtractor contacts){this.contacts=contacts;}
    public ResumeSummaryResponse summary(Resume r){return new ResumeSummaryResponse(r.getId(),r.getOriginalFilename(),r.getMimeType(),r.getFileSize(),r.isActive(),r.getParseStatus(),r.getUploadedAt());}
    public ResumeResponse detail(Resume r){
        var sections=r.getSections().stream().map(s->new ResumeSectionResponse(s.getSectionType(),s.getRawText(),s.getSequenceOrder())).toList();
        String text=r.getSections().stream().map(s->s.getRawText()).reduce("",(a,b)->a+'\n'+b);var c=contacts.extract(text);
        return new ResumeResponse(r.getId(),r.getOriginalFilename(),r.getMimeType(),r.getFileSize(),r.getChecksum(),r.isActive(),r.getParseStatus(),r.getUploadedAt(),new ResumeContactResponse(c.email(),c.phone(),c.linkedin(),c.github()),sections);
    }
}
