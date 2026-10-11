package com.careerpilot.modules.resume.analysis.controller;
import com.careerpilot.modules.resume.analysis.dto.*;
import com.careerpilot.modules.resume.analysis.mapper.AnalysisMapper;
import com.careerpilot.modules.resume.analysis.service.ResumeAnalysisService;
import com.careerpilot.modules.resume.analysis.report.ResumeAnalysisReportService;
import com.careerpilot.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
@RestController @RequestMapping("/api/v1/resumes/{resumeId}/analyses")
public class ResumeAnalysisController {
 private final ResumeAnalysisService service;private final ResumeAnalysisReportService reports;public ResumeAnalysisController(ResumeAnalysisService service,ResumeAnalysisReportService reports){this.service=service;this.reports=reports;}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) @Operation(summary="Create an explainable resume analysis",description=AnalysisMapper.DISCLAIMER)
 public AnalysisResponse create(@PathVariable UUID resumeId){return service.create(CurrentUser.require(),resumeId);}
 @GetMapping @Operation(summary="List historical analyses newest first") public List<AnalysisSummaryResponse> history(@PathVariable UUID resumeId){return service.history(CurrentUser.require(),resumeId);}
 @GetMapping("/{analysisId}") public AnalysisResponse get(@PathVariable UUID resumeId,@PathVariable UUID analysisId){return service.get(CurrentUser.require(),resumeId,analysisId);}
 @GetMapping(value="/{analysisId}/report.pdf",produces=MediaType.APPLICATION_PDF_VALUE) @Operation(summary="Download the persisted resume analysis as a PDF report")
 public ResponseEntity<byte[]> report(@PathVariable UUID resumeId,@PathVariable UUID analysisId){var report=reports.generate(CurrentUser.require(),resumeId,analysisId);var disposition=ContentDisposition.attachment().filename(report.filename(),StandardCharsets.UTF_8).build();return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).contentLength(report.content().length).header(HttpHeaders.CONTENT_DISPOSITION,disposition.toString()).body(report.content());}
}
