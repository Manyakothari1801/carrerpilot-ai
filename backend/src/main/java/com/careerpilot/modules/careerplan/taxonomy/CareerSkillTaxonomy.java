package com.careerpilot.modules.careerplan.taxonomy;
import com.careerpilot.modules.jobmatch.scoring.SkillNormalizer;import org.springframework.stereotype.Component;import java.util.*;
@Component public class CareerSkillTaxonomy{
 public static final String VERSION="career-skill-taxonomy-v1";private final SkillNormalizer normalizer;private final Map<String,CareerDefinition>definitions;
 public CareerSkillTaxonomy(SkillNormalizer normalizer){this.normalizer=normalizer;definitions=new LinkedHashMap<>();
  add("Backend Developer",List.of("Java","Spring Boot","REST APIs","PostgreSQL","Git"),List.of("Docker","Microservices","Maven"));
  add("Frontend Developer",List.of("JavaScript","TypeScript","React","HTML","CSS"),List.of("Git","REST APIs","Vite"));
  add("Data Analyst",List.of("SQL","Excel","Power BI","Statistics","Data Visualization"),List.of("Python","Pandas","Tableau"));
  add("Data Scientist",List.of("Python","Machine Learning","Statistics","Pandas","Scikit-learn"),List.of("NumPy","SQL","Data Visualization"));
  add("Cloud DevOps Engineer",List.of("Linux","Docker","CI/CD","AWS","Git"),List.of("Kubernetes","Terraform","Python"));
  add("Cybersecurity Analyst",List.of("Network Security","Linux","SIEM","Incident Response","Risk Assessment"),List.of("Python","Firewalls","Cryptography"));
  add("QA Automation Engineer",List.of("Test Automation","Selenium","API Testing","Java","Git"),List.of("JUnit","SQL","CI/CD"));
  add("Business Analyst",List.of("Requirements Analysis","Stakeholder Management","Business Process","SQL","Excel"),List.of("Agile","Power BI","Communication"));}
 private void add(String career,List<String>core,List<String>supporting){definitions.put(career.toLowerCase(Locale.ROOT),new CareerDefinition(career,skills(core,SkillCategory.CORE),skills(supporting,SkillCategory.SUPPORTING)));}
 private List<RequiredSkill>skills(List<String>values,SkillCategory category){return values.stream().map(v->new RequiredSkill(v,normalizer.normalize(v),category,category==SkillCategory.CORE?"Build working knowledge and demonstrate it in a practical example.":"Add this supporting capability when it strengthens role-specific work.")).toList();}
 public Optional<CareerDefinition>find(String career){return career==null?Optional.empty():Optional.ofNullable(definitions.get(career.strip().toLowerCase(Locale.ROOT)));}public Set<String>supportedCareers(){return definitions.values().stream().map(CareerDefinition::career).collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));}
 public Set<String>actionableSkills(){return definitions.values().stream().flatMap(v->v.all().stream()).map(RequiredSkill::displayName).collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));}
 public enum SkillCategory{CORE,SUPPORTING}public record RequiredSkill(String displayName,String normalizedName,SkillCategory category,String nextAction){}public record CareerDefinition(String career,List<RequiredSkill>coreSkills,List<RequiredSkill>supportingSkills){public List<RequiredSkill>all(){var all=new ArrayList<RequiredSkill>(coreSkills);all.addAll(supportingSkills);return all;}}
}

