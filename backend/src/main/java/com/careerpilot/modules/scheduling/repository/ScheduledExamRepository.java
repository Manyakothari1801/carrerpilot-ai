package com.careerpilot.modules.scheduling.repository;

import com.careerpilot.modules.scheduling.entity.ScheduledExam;
import com.careerpilot.modules.scheduling.entity.ScheduledExamStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScheduledExamRepository extends JpaRepository<ScheduledExam, UUID> {
    List<ScheduledExam> findByOwnerIdOrderByScheduledStartDesc(UUID ownerId);
    Optional<ScheduledExam> findByIdAndOwnerId(UUID id, UUID ownerId);
    boolean existsByOwnerIdAndAssessmentIdAndScheduledStart(UUID owner, UUID assessment, Instant start);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from ScheduledExam e where e.id=:id and e.owner.id=:ownerId")
    Optional<ScheduledExam> lockOwned(UUID id, UUID ownerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select e from ScheduledExam e
            join fetch e.owner
            join fetch e.assessment
            where e.status = :status
              and e.attempt is null
              and e.cancelledAt is null
              and e.reminderSentAt is null
              and e.scheduledStart > :now
              and e.scheduledStart <= :cutoff
            order by e.scheduledStart
            """)
    List<ScheduledExam> lockDueReminders(@Param("status") ScheduledExamStatus status,
                                         @Param("now") Instant now,
                                         @Param("cutoff") Instant cutoff);
}
