package com.careerpilot.modules.resume.controller;

import com.careerpilot.modules.auth.dto.MessageResponse;
import com.careerpilot.modules.resume.dto.*;
import com.careerpilot.modules.resume.service.ResumeService;
import com.careerpilot.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/resumes")
public class ResumeController {
    private final ResumeService service;public ResumeController(ResumeService service){this.service=service;}
    @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE) @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary="Upload and deterministically parse a PDF or DOCX resume",requestBody=@RequestBody(required=true,content=@Content(mediaType=MediaType.MULTIPART_FORM_DATA_VALUE)))
    public ResumeResponse upload(@RequestPart("file") MultipartFile file){return service.upload(CurrentUser.require(),file);}
    @GetMapping public List<ResumeSummaryResponse> list(){return service.list(CurrentUser.require());}
    @GetMapping("/{id}") public ResumeResponse detail(@PathVariable UUID id){return service.get(CurrentUser.require(),id);}
    @PatchMapping("/{id}/active") public ResumeResponse active(@PathVariable UUID id){return service.activate(CurrentUser.require(),id);}
    @DeleteMapping("/{id}") public MessageResponse delete(@PathVariable UUID id){service.delete(CurrentUser.require(),id);return new MessageResponse("Resume deleted");}
    @GetMapping("/{id}/download") public ResponseEntity<Resource> download(@PathVariable UUID id){var value=service.download(CurrentUser.require(),id);var disposition=ContentDisposition.attachment().filename(value.filename(),StandardCharsets.UTF_8).build();return ResponseEntity.ok().contentType(MediaType.parseMediaType(value.mimeType())).contentLength(value.size()).header(HttpHeaders.CONTENT_DISPOSITION,disposition.toString()).body(value.resource());}
}
