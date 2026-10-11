package com.careerpilot.modules.careerrecommendation.service;

import com.careerpilot.config.CareerRecommendationProperties;
import com.careerpilot.exception.ApiException;
import com.careerpilot.exception.NotFoundException;
import com.careerpilot.modules.auth.entity.User;
import com.careerpilot.modules.careerrecommendation.client.CareerPredictionClient;
import com.careerpilot.modules.careerrecommendation.dto.CareerRecommendationDtos.*;
import com.careerpilot.modules.careerrecommendation.entity.*;
import com.careerpilot.modules.careerrecommendation.repository.CareerRecommendationRepository;
import com.careerpilot.modules.profile.entity.Profile;
import com.careerpilot.modules.profile.entity.UserSkill;
import com.careerpilot.modules.profile.repository.ProfileRepository;
import com.careerpilot.modules.profile.repository.UserSkillRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class CareerRecommendationService {
    private final ProfileRepository profiles; private final UserSkillRepository userSkills; private final CareerPredictionClient client;
    private final CareerRecommendationRepository recommendations; private final CareerRecommendationProperties properties; private final ObjectMapper json;
    public CareerRecommendationService(ProfileRepository profiles,UserSkillRepository userSkills,CareerPredictionClient client,
      CareerRecommendationRepository recommendations,CareerRecommendationProperties properties,ObjectMapper json){this.profiles=profiles;this.userSkills=userSkills;this.client=client;this.recommendations=recommendations;this.properties=properties;this.json=json;}

    @Transactional(readOnly=true) public ReadinessResponse readiness(User user){Input input=input(user);return new ReadinessResponse(input.missing().isEmpty(),input.missing(),input.skills().size());}
    @Transactional public DetailResponse create(User user){
        Input input=input(user);if(!input.missing().isEmpty())throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"Add at least two profile skills and complete degree, experience level, and target role before generating recommendations");
        var request=new CareerPredictionClient.PredictionRequest(input.profile().getDegree(),input.profile().getGraduationYear(),input.profile().getExperienceLevel().name(),input.profile().getTargetRole(),input.skills().stream().map(s->new CareerPredictionClient.SkillInput(s.getSkill().getDisplayName(),s.getProficiencyLevel().name())).toList(),properties.topN());
        var predicted=client.predict(request);validate(predicted);
        CareerRecommendation entity=new CareerRecommendation();entity.setUser(user);entity.setModelVersion(predicted.modelVersion());entity.setFeatureSchemaVersion(predicted.featureSchemaVersion());entity.setDegree(input.profile().getDegree());entity.setExperienceLevel(input.profile().getExperienceLevel().name());entity.setTargetRole(input.profile().getTargetRole());
        for(int index=0;index<predicted.recommendations().size();index++){var value=predicted.recommendations().get(index);CareerRecommendationItem item=new CareerRecommendationItem();item.setRecommendation(entity);item.setRecommendationRank(index+1);item.setCareer(value.career().trim());item.setConfidence(BigDecimal.valueOf(value.confidence()));item.setProfileSignals(writeSignals(value.profileSignals()));entity.getItems().add(item);}
        return detail(recommendations.save(entity));
    }
    @Transactional(readOnly=true) public List<SummaryResponse> history(User user){return recommendations.findByUserIdOrderByCreatedAtDesc(user.getId()).stream().map(this::summary).toList();}
    @Transactional(readOnly=true) public DetailResponse get(User user,UUID id){return detail(recommendations.findByIdAndUserId(id,user.getId()).orElseThrow(()->new NotFoundException("Career recommendation not found")));}

    private Input input(User user){Profile profile=profiles.findByUserId(user.getId()).orElseThrow(()->new NotFoundException("Student profile not found"));List<UserSkill> skills=userSkills.findByUserIdOrderBySkillDisplayName(user.getId());List<String> missing=new ArrayList<>();if(blank(profile.getDegree()))missing.add("degree");if(profile.getExperienceLevel()==null)missing.add("experienceLevel");if(blank(profile.getTargetRole()))missing.add("targetRole");if(skills.size()<2)missing.add("skills");return new Input(profile,skills,List.copyOf(missing));}
    private void validate(CareerPredictionClient.PredictionResponse response){if(response==null||blank(response.modelVersion())||blank(response.featureSchemaVersion())||response.recommendations()==null||response.recommendations().isEmpty()||response.recommendations().size()>properties.topN())throw unavailable();Set<String> careers=new HashSet<>();for(var item:response.recommendations()){if(item==null||blank(item.career())||!Double.isFinite(item.confidence())||item.confidence()<0||item.confidence()>1||!careers.add(item.career().trim().toLowerCase(Locale.ROOT))||item.profileSignals()==null)throw unavailable();}}
    private ApiException unavailable(){return new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"Career recommendation service returned an invalid response");}
    private String writeSignals(List<String> signals){try{return json.writeValueAsString(signals.stream().filter(Objects::nonNull).map(String::trim).filter(v->!v.isEmpty()).limit(4).toList());}catch(JsonProcessingException e){throw unavailable();}}
    private List<String> readSignals(String value){try{return json.readerForListOf(String.class).readValue(value);}catch(JsonProcessingException e){return List.of();}}
    private DetailResponse detail(CareerRecommendation entity){return new DetailResponse(entity.getId(),entity.getModelVersion(),entity.getFeatureSchemaVersion(),entity.getDegree(),entity.getExperienceLevel(),entity.getTargetRole(),entity.getCreatedAt(),entity.getItems().stream().map(i->new ItemResponse(i.getRecommendationRank(),i.getCareer(),i.getConfidence().doubleValue(),readSignals(i.getProfileSignals()))).toList());}
    private SummaryResponse summary(CareerRecommendation entity){CareerRecommendationItem first=entity.getItems().stream().min(Comparator.comparingInt(CareerRecommendationItem::getRecommendationRank)).orElseThrow();return new SummaryResponse(entity.getId(),first.getCareer(),first.getConfidence().doubleValue(),entity.getModelVersion(),entity.getCreatedAt());}
    private boolean blank(String value){return value==null||value.isBlank();}
    private record Input(Profile profile,List<UserSkill>skills,List<String>missing){}
}

