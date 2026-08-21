package com.careerpilot.modules.resume.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="resume_sections") @Getter @Setter @NoArgsConstructor
public class ResumeSection {
    @Id private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="resume_id") private Resume resume;
    @Enumerated(EnumType.STRING) @Column(name="section_type", nullable=false, length=30) private SectionType sectionType;
    @Column(name="raw_text", nullable=false, columnDefinition="text") private String rawText;
    @Column(name="normalized_text", nullable=false, columnDefinition="text") private String normalizedText;
    @Column(name="sequence_order", nullable=false) private int sequenceOrder;
    @Column(name="created_at", nullable=false) private Instant createdAt;
    @PrePersist void create(){if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=Instant.now();}
}
