package com.careerpilot.modules.resume.analysis.controller;
import com.careerpilot.modules.resume.analysis.dto.AnalysisSummaryResponse;
import com.careerpilot.modules.resume.analysis.service.ResumeAnalysisService;
import com.careerpilot.security.CurrentUser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/resume-analyses")
public class LatestAnalysisController {
 private final ResumeAnalysisService service;public LatestAnalysisController(ResumeAnalysisService service){this.service=service;}
 @GetMapping("/latest-active") public ResponseEntity<AnalysisSummaryResponse> latest(){return ResponseEntity.ofNullable(service.latestActive(CurrentUser.require()));}
}
