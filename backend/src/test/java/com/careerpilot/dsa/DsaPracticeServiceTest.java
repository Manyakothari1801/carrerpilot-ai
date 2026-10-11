package com.careerpilot.dsa;

import com.careerpilot.modules.dsa.entity.*;
import com.careerpilot.modules.dsa.repository.DsaTopicProgressRepository;
import com.careerpilot.modules.dsa.service.DsaPracticeService;
import com.careerpilot.modules.dsa.taxonomy.DsaTopicTaxonomy;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class DsaPracticeServiceTest {
 private final DsaPracticeService service=new DsaPracticeService(mock(DsaTopicProgressRepository.class),new DsaTopicTaxonomy());
 @Test void untouchedTopicsHaveInsufficientEvidenceAndZeroProgress(){var result=service.build(List.of());assertThat(result.summary().overallProgress()).isZero();assertThat(result.topics()).allMatch(v->!v.enoughEvidence()&&v.readinessScore()==null);assertThat(result.summary().recommendedTopicId()).isEqualTo("arrays");}
 @Test void repeatedAttemptProducesDeterministicReadiness(){var row=row("graphs",DsaProgressStatus.ATTEMPTED,2,3);var first=service.build(List.of(row));var second=service.build(List.of(row));var topic=first.topics().stream().filter(v->v.topicId().equals("graphs")).findFirst().orElseThrow();assertThat(topic.readinessScore()).isEqualTo(35);assertThat(topic.readinessLabel()).isEqualTo("Needs Practice");assertThat(second).isEqualTo(first);}
 @Test void solvedTopicCountsAsEvidenceAndProgress(){var result=service.build(List.of(row("arrays",DsaProgressStatus.SOLVED,1,4)));var topic=result.topics().getFirst();assertThat(topic.enoughEvidence()).isTrue();assertThat(topic.readinessScore()).isEqualTo(90);assertThat(result.summary().solved()).isOne();assertThat(result.summary().overallProgress()).isEqualTo(7);}
 @Test void recommendationTieUsesStableTaxonomyOrder(){var result=service.build(List.of(row("strings",DsaProgressStatus.ATTEMPTED,2,3),row("arrays",DsaProgressStatus.ATTEMPTED,2,3)));assertThat(result.summary().recommendedTopicId()).isEqualTo("arrays");}
 @Test void revisionStatusIsTracked(){var result=service.build(List.of(row("heaps",DsaProgressStatus.REVISE,2,2)));assertThat(result.summary().revisionDue()).isOne();assertThat(result.topics().stream().filter(v->v.topicId().equals("heaps")).findFirst().orElseThrow().readinessScore()).isEqualTo(40);}
 private DsaTopicProgress row(String topic,DsaProgressStatus status,int attempts,Integer confidence){var value=new DsaTopicProgress();value.setTopicId(topic);value.setStatus(status);value.setAttemptCount(attempts);value.setSelfConfidence(confidence);return value;}
}
