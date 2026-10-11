package com.careerpilot.modules.careerrecommendation.controller;

import com.careerpilot.modules.careerrecommendation.dto.CareerRecommendationDtos.*;
import com.careerpilot.modules.careerrecommendation.service.CareerRecommendationService;
import com.careerpilot.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/career-recommendations")
public class CareerRecommendationController {
    private final CareerRecommendationService service;
    public CareerRecommendationController(CareerRecommendationService service){this.service=service;}
    @GetMapping("/readiness") @Operation(summary="Check whether the authenticated student's profile has meaningful ML inputs")
    public ReadinessResponse readiness(){return service.readiness(CurrentUser.require());}
    @PostMapping @ResponseStatus(HttpStatus.CREATED) @Operation(summary="Generate and persist ranked ML career recommendations")
    public DetailResponse create(){return service.create(CurrentUser.require());}
    @GetMapping public List<SummaryResponse> history(){return service.history(CurrentUser.require());}
    @GetMapping("/{id}") public DetailResponse get(@PathVariable UUID id){return service.get(CurrentUser.require(),id);}
}
