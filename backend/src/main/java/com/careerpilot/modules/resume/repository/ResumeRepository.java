package com.careerpilot.modules.resume.repository;

import com.careerpilot.modules.resume.entity.Resume;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ResumeRepository extends JpaRepository<Resume, UUID> {
    List<Resume> findByUserIdOrderByUploadedAtDesc(UUID userId);
    Optional<Resume> findByIdAndUserId(UUID id, UUID userId);
    Optional<Resume> findByUserIdAndChecksum(UUID userId, String checksum);
    boolean existsByUserId(UUID userId);
    Optional<Resume> findFirstByUserIdOrderByUploadedAtDesc(UUID userId);
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select r from Resume r where r.id=:id and r.user.id=:userId")
    Optional<Resume> lockOwned(UUID id, UUID userId);
    @Modifying @Query("update Resume r set r.active=false where r.user.id=:userId and r.active=true")
    int deactivateAll(UUID userId);
}
