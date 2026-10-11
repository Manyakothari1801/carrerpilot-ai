package com.careerpilot.modules.careerintelligence.controller;

import com.careerpilot.modules.careerintelligence.dto.CareerIntelligenceDtos.*;
import com.careerpilot.modules.careerintelligence.service.CareerIntelligenceService;
import com.careerpilot.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/career-intelligence")
public class CareerIntelligenceController {
    private final CareerIntelligenceService service;
    public CareerIntelligenceController(CareerIntelligenceService service){this.service=service;}

    @GetMapping("/explanation") public ExplainResponse explain(){return service.explain(CurrentUser.require());}
    @GetMapping("/options") public OptionsResponse options(){CurrentUser.require();return service.options();}
    @PostMapping("/simulate") public SimulationResponse simulate(@Valid @RequestBody SimulationRequest request){return service.simulate(CurrentUser.require(),request);}
    @PostMapping("/counterfactual") public CounterfactualResponse counterfactual(@Valid @RequestBody CounterfactualRequest request){return service.counterfactual(CurrentUser.require(),request);}
}
