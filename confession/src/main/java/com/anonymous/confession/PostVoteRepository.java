package com.anonymous.confession;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostVoteRepository extends JpaRepository<PostVote, Long> {

    Optional<PostVote> findByUserAndPost(User user, Post post);
}