package com.careerpilot.modules.resume.analysis.controller;
import com.careerpilot.modules.resume.analysis.dto.*;
import com.careerpilot.modules.resume.analysis.mapper.AnalysisMapper;
import com.careerpilot.modules.resume.analysis.service.ResumeAnalysisService;
import com.careerpilot.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/v1/resumes/{resumeId}/analyses")
public class ResumeAnalysisController {
 private final ResumeAnalysisService service;public ResumeAnalysisController(ResumeAnalysisService service){this.service=service;}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) @Operation(summary="Create an explainable resume analysis",description=AnalysisMapper.DISCLAIMER)
 public AnalysisResponse create(@PathVariable UUID resumeId){return service.create(CurrentUser.require(),resumeId);}
 @GetMapping @Operation(summary="List historical analyses newest first") public List<AnalysisSummaryResponse> history(@PathVariable UUID resumeId){return service.history(CurrentUser.require(),resumeId);}
 @GetMapping("/{analysisId}") public AnalysisResponse get(@PathVariable UUID resumeId,@PathVariable UUID analysisId){return service.get(CurrentUser.require(),resumeId,analysisId);}
}
