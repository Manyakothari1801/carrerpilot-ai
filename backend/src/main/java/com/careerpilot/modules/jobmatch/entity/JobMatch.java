package com.careerpilot.modules.jobmatch.entity;
import com.careerpilot.modules.auth.entity.User;import com.careerpilot.modules.resume.entity.Resume;import jakarta.persistence.*;import lombok.*;import java.time.Instant;import java.util.*;
@Entity @Table(name="job_matches") @Getter @Setter @NoArgsConstructor
public class JobMatch{
 @Id private UUID id;@ManyToOne(fetch=FetchType.LAZY,optional=false)@JoinColumn(name="user_id")private User user;@ManyToOne(fetch=FetchType.LAZY,optional=false)@JoinColumn(name="resume_id")private Resume resume;
 @Column(name="job_title",nullable=false,length=160)private String jobTitle;@Column(name="company_name",length=160)private String companyName;@Column(name="job_description",nullable=false,columnDefinition="text")private String jobDescription;
 @Column(name="overall_match_score",nullable=false)private int overallMatchScore;@Column(name="keyword_match_score",nullable=false)private int keywordMatchScore;@Column(name="skill_match_score",nullable=false)private int skillMatchScore;@Column(name="semantic_match_score")private Integer semanticMatchScore;@Column(name="experience_match_score")private Integer experienceMatchScore;@Column(name="education_match_score")private Integer educationMatchScore;
 @Enumerated(EnumType.STRING)@Column(name="semantic_status",nullable=false,length=30)private SemanticStatus semanticStatus;@Enumerated(EnumType.STRING)@Column(name="experience_status",nullable=false,length=30)private AlignmentStatus experienceStatus;@Enumerated(EnumType.STRING)@Column(name="education_status",nullable=false,length=30)private AlignmentStatus educationStatus;
 @Column(name="scoring_version",nullable=false,length=60)private String scoringVersion;@Column(name="created_at",nullable=false)private Instant createdAt;@OneToMany(mappedBy="jobMatch",cascade=CascadeType.ALL,orphanRemoval=true)private List<JobMatchSkill>skills=new ArrayList<>();
 @PrePersist void create(){if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=Instant.now();}
}
