package com.careerpilot.modules.dsa.entity;

import com.careerpilot.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="dsa_topic_progress", uniqueConstraints=@UniqueConstraint(columnNames={"user_id","topic_id"}))
@Getter @Setter @NoArgsConstructor
public class DsaTopicProgress {
    @Id private UUID id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) private User user;
    @Column(name="topic_id",nullable=false,length=60) private String topicId;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private DsaProgressStatus status;
    @Column(name="attempt_count",nullable=false) private int attemptCount;
    @Column(name="self_confidence") private Integer selfConfidence;
    @Column(name="last_practiced_at") private Instant lastPracticedAt;
    @Column(name="solved_at") private Instant solvedAt;
    @Column(name="created_at",nullable=false) private Instant createdAt;
    @Column(name="updated_at",nullable=false) private Instant updatedAt;
    @PrePersist void create(){if(id==null)id=UUID.randomUUID();var now=Instant.now();if(createdAt==null)createdAt=now;updatedAt=now;if(status==null)status=DsaProgressStatus.NOT_STARTED;}
    @PreUpdate void update(){updatedAt=Instant.now();}
}
