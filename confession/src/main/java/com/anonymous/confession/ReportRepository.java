package com.anonymous.confession;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {

    boolean existsByUserAndPost(User user, Post post);
}