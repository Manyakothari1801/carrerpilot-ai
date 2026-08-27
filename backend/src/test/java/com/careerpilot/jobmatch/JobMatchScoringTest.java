package com.careerpilot.jobmatch;
import com.careerpilot.config.*;import com.careerpilot.modules.jobmatch.embedding.UnavailableEmbeddingService;import com.careerpilot.modules.jobmatch.entity.*;import com.careerpilot.modules.jobmatch.scoring.*;import com.careerpilot.modules.profile.entity.*;import org.junit.jupiter.api.Test;import java.util.*;import static org.assertj.core.api.Assertions.*;
class JobMatchScoringTest{
 private final SkillNormalizer normalizer=new SkillNormalizer();private final JobSkillExtractor extractor=new JobSkillExtractor(normalizer);private final TextSimilarityService similarity=new TextSimilarityService();
 @Test void normalizesAliasesAndAvoidsSubstringFalsePositives(){assertThat(normalizer.normalize("JS")).isEqualTo("javascript");assertThat(normalizer.normalize("TS")).isEqualTo("typescript");assertThat(normalizer.normalize("Postgres")).isEqualTo("postgresql");assertThat(normalizer.extract("We need Java and TypeScript, not javascripted prose.")).contains("java","typescript").doesNotContain("javascript");}
 @Test void extractsImportanceFrequencyAndContextualSpring(){var skills=extractor.extract("Required: Java and Spring Boot. Must have Java. Nice to have Docker. Seasonal spring campaign.");assertThat(skills).anySatisfy(v->{assertThat(v.normalized()).isEqualTo("java");assertThat(v.importance()).isEqualTo(SkillImportance.REQUIRED);assertThat(v.frequency()).isEqualTo(2);}).anySatisfy(v->assertThat(v.normalized()).isEqualTo("spring boot"));}
 @Test void tfIdfAndCosineAreDeterministic(){assertThat(similarity.tfIdfScore("java spring postgres api","java spring docker api")).isBetween(40,100);assertThat(similarity.tfIdfScore("java spring","painting music")).isZero();assertThat(similarity.cosine(new double[]{1,0},new double[]{1,0})).isEqualTo(1);assertThat(similarity.cosine(new double[]{1,0},new double[]{0,1})).isZero();assertThat(similarity.normalizedCosine(new double[]{1,1},new double[]{1,1})).isEqualTo(100);}
 @Test void semanticUnavailableReturnsNoVectors(){var service=new UnavailableEmbeddingService(new EmbeddingProperties(false,"UNAVAILABLE",""));assertThat(service.embed("minimized text")).isEmpty();assertThat(service.provider()).isEqualTo("DISABLED");}
 @Test void experienceAndEducationReturnExplicitUnknownOrMatch(){var alignment=new AlignmentService();Profile profile=new Profile();profile.setExperienceLevel(ExperienceLevel.ENTRY_LEVEL);profile.setDegree("B.Tech Computer Science");assertThat(alignment.experience("Entry level backend role",profile,"").status()).isEqualTo(AlignmentStatus.MATCHED);assertThat(alignment.experience("Requires 5+ years",profile,"").status()).isEqualTo(AlignmentStatus.NOT_MATCHED);assertThat(alignment.education("B.Tech or related degree required",profile,"").status()).isEqualTo(AlignmentStatus.MATCHED);assertThat(alignment.education("Strong communication",profile,"").status()).isEqualTo(AlignmentStatus.NOT_REQUIRED);}
 @Test void prioritySignalsRequiredAndRepeatedSkills(){var required=extractor.extract("Required qualifications: Docker. Must use Docker in delivery.");assertThat(required).singleElement().satisfies(v->{assertThat(v.importance()).isEqualTo(SkillImportance.REQUIRED);assertThat(v.frequency()).isEqualTo(2);});}
 @Test void strongerSectionClassificationAlwaysWinsDuringDeduplication(){var skills=extractor.extract("Docker is used by the team.\nPreferred skills:\n- Git\n- Docker\nRequired skills:\n- Docker\n- Git");assertThat(skills).anySatisfy(v->{assertThat(v.normalized()).isEqualTo("docker");assertThat(v.importance()).isEqualTo(SkillImportance.REQUIRED);assertThat(v.frequency()).isEqualTo(3);}).anySatisfy(v->{assertThat(v.normalized()).isEqualTo("git");assertThat(v.importance()).isEqualTo(SkillImportance.REQUIRED);assertThat(v.frequency()).isEqualTo(2);});}
 @Test void classifiesExactSectionedBackendDeveloperDescription(){String jd="""
Backend Developer

We are looking for a Backend Developer with experience in Java, Spring Boot, PostgreSQL, REST APIs, Docker, Git, and Microservices.

Responsibilities:

- Build and maintain REST APIs using Java and Spring Boot.
- Design backend services using microservice architecture.
- Work with PostgreSQL databases.
- Containerize applications using Docker.
- Collaborate with development teams using Git.

Required skills:

- Java
- Spring Boot
- PostgreSQL
- REST APIs
- Git
- Docker

Preferred skills:

- AWS
- Kubernetes
- Microservices

Experience:
1-3 years of backend development experience preferred.

Education:
Bachelor's degree in Computer Science, Information Technology, or a related field.
""";Map<String,SkillImportance>classified=new HashMap<>();extractor.extract(jd).forEach(v->classified.put(v.display(),v.importance()));assertThat(classified).containsEntry("Java",SkillImportance.REQUIRED).containsEntry("Spring Boot",SkillImportance.REQUIRED).containsEntry("PostgreSQL",SkillImportance.REQUIRED).containsEntry("REST APIs",SkillImportance.REQUIRED).containsEntry("Git",SkillImportance.REQUIRED).containsEntry("Docker",SkillImportance.REQUIRED).containsEntry("AWS",SkillImportance.PREFERRED).containsEntry("Kubernetes",SkillImportance.PREFERRED).containsEntry("Microservices",SkillImportance.PREFERRED);}
}
