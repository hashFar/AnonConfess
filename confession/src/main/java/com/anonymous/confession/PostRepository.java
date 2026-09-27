package com.anonymous.confession;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByCategoryIgnoreCase(String category);

    List<Post> findTop10ByOrderByLikesDescSharesDesc();

    List<Post> findByUserOrderByCreatedAtDesc(User user);

    long countByUserAndCreatedAtBetween(
            User user,
            LocalDateTime start,
            LocalDateTime end
    );
}