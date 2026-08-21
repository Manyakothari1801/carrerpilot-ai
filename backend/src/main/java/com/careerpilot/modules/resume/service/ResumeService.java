package com.careerpilot.modules.resume.service;

import com.careerpilot.exception.NotFoundException;
import com.careerpilot.modules.auth.entity.User;
import com.careerpilot.modules.resume.dto.*;
import com.careerpilot.modules.resume.entity.*;
import com.careerpilot.modules.resume.exception.ResumeException;
import com.careerpilot.modules.resume.mapper.ResumeMapper;
import com.careerpilot.modules.resume.parser.*;
import com.careerpilot.modules.resume.repository.ResumeRepository;
import com.careerpilot.modules.resume.storage.ResumeStorageService;
import com.careerpilot.modules.resume.validation.ResumeFileValidator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

@Service
public class ResumeService {
    private final ResumeRepository resumes;private final ResumeFileValidator validator;private final List<ResumeTextExtractor> extractors;private final ResumeSectionParser parser;private final ResumeStorageService storage;private final ResumeMapper mapper;
    public ResumeService(ResumeRepository resumes,ResumeFileValidator validator,List<ResumeTextExtractor> extractors,ResumeSectionParser parser,ResumeStorageService storage,ResumeMapper mapper){this.resumes=resumes;this.validator=validator;this.extractors=extractors;this.parser=parser;this.storage=storage;this.mapper=mapper;}

    @Transactional public ResumeResponse upload(User user, MultipartFile file){
        var valid=validator.validate(file);var duplicate=resumes.findByUserIdAndChecksum(user.getId(),valid.checksum());if(duplicate.isPresent())return mapper.detail(duplicate.get());
        String text=extractors.stream().filter(e->e.supports(valid.mimeType())).findFirst().orElseThrow(()->new ResumeException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,"Unsupported resume format")).extract(valid.content());
        var parsed=parser.parse(text);String key=storage.store(valid.content(),valid.extension());
        try{
            Resume resume=new Resume();resume.setUser(user);resume.setOriginalFilename(valid.originalFilename());resume.setStorageKey(key);resume.setMimeType(valid.mimeType());resume.setFileSize(valid.content().length);resume.setChecksum(valid.checksum());resume.setActive(!resumes.existsByUserId(user.getId()));resume.setParseStatus(ParseStatus.PARSED);
            for(var value:parsed){ResumeSection section=new ResumeSection();section.setResume(resume);section.setSectionType(value.type());section.setRawText(value.rawText());section.setNormalizedText(value.normalizedText());section.setSequenceOrder(value.order());resume.getSections().add(section);}
            return mapper.detail(resumes.saveAndFlush(resume));
        }catch(RuntimeException e){storage.delete(key);throw e;}
    }
    @Transactional(readOnly=true) public List<ResumeSummaryResponse> list(User user){return resumes.findByUserIdOrderByUploadedAtDesc(user.getId()).stream().map(mapper::summary).toList();}
    @Transactional(readOnly=true) public ResumeResponse get(User user,UUID id){return mapper.detail(owned(user,id));}
    @Transactional public ResumeResponse activate(User user,UUID id){Resume selected=resumes.lockOwned(id,user.getId()).orElseThrow(()->notFound());resumes.deactivateAll(user.getId());selected.setActive(true);return mapper.detail(resumes.save(selected));}
    @Transactional public void delete(User user,UUID id){Resume resume=resumes.lockOwned(id,user.getId()).orElseThrow(()->notFound());boolean active=resume.isActive();storage.delete(resume.getStorageKey());resumes.delete(resume);resumes.flush();if(active)resumes.findFirstByUserIdOrderByUploadedAtDesc(user.getId()).ifPresent(next->{next.setActive(true);resumes.save(next);});}
    @Transactional(readOnly=true) public ResumeDownload download(User user,UUID id){Resume resume=owned(user,id);var resource=storage.load(resume.getStorageKey());return new ResumeDownload(resource,resume.getOriginalFilename(),resume.getMimeType(),resume.getFileSize());}
    private Resume owned(User user,UUID id){return resumes.findByIdAndUserId(id,user.getId()).orElseThrow(()->notFound());}
    private NotFoundException notFound(){return new NotFoundException("Resume not found");}
}
