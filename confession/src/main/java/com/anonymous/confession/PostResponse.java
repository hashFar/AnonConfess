package com.anonymous.confession;

import java.time.LocalDateTime;

public class PostResponse {

    private Long id;
    private String content;
    private String category;
    private LocalDateTime createdAt;
    private int likes;
    private int dislikes;
    private int shares;

    public PostResponse(Post post) {
        this.id = post.getId();
        this.content = post.getContent();
        this.category = post.getCategory();
        this.createdAt = post.getCreatedAt();
        this.likes = post.getLikes();
        this.dislikes = post.getDislikes();
        this.shares = post.getShares();
    }

    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public String getCategory() {
        return category;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public int getLikes() {
        return likes;
    }

    public int getDislikes() {
        return dislikes;
    }

    public int getShares() {
    return shares;
}
}