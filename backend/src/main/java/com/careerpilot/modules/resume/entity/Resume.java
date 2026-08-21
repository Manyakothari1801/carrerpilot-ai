package com.careerpilot.modules.resume.entity;

import com.careerpilot.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity @Table(name="resumes") @Getter @Setter @NoArgsConstructor
public class Resume {
    @Id private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id") private User user;
    @Column(name="original_filename", nullable=false, length=255) private String originalFilename;
    @Column(name="storage_key", nullable=false, unique=true, length=255) private String storageKey;
    @Column(name="mime_type", nullable=false, length=100) private String mimeType;
    @Column(name="file_size", nullable=false) private long fileSize;
    @Column(nullable=false, length=64) private String checksum;
    @Column(nullable=false) private boolean active;
    @Enumerated(EnumType.STRING) @Column(name="parse_status", nullable=false, length=20) private ParseStatus parseStatus;
    @Column(name="uploaded_at", nullable=false) private Instant uploadedAt;
    @Column(name="updated_at", nullable=false) private Instant updatedAt;
    @Version private long version;
    @OneToMany(mappedBy="resume", cascade=CascadeType.ALL, orphanRemoval=true)
    @OrderBy("sequenceOrder ASC") private List<ResumeSection> sections = new ArrayList<>();
    @PrePersist void create(){var now=Instant.now();if(id==null)id=UUID.randomUUID();uploadedAt=now;updatedAt=now;}
    @PreUpdate void update(){updatedAt=Instant.now();}
}
