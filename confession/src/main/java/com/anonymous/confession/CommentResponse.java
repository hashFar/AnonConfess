package com.anonymous.confession;

import java.time.LocalDateTime;

public class CommentResponse {

    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private String userEmail;

    public CommentResponse(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.createdAt = comment.getCreatedAt();
        this.userEmail = comment.getUser().getEmail();
    }

    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getUserEmail() {
        return userEmail;
    }
}