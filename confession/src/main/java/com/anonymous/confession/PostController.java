package com.anonymous.confession;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostVoteRepository postVoteRepository;

    public PostController(
            PostRepository postRepository,
            UserRepository userRepository,
            PostVoteRepository postVoteRepository) {

        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.postVoteRepository = postVoteRepository;
    }

    @PostMapping
    public String createPost(
            @RequestParam String email,
            @RequestBody Post post) {

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null)
            return "User not found";

        LocalDateTime start =
                LocalDateTime.now().toLocalDate().atStartOfDay();

        LocalDateTime end = start.plusDays(1);

        long todayPosts =
                postRepository.countByUserAndCreatedAtBetween(
                        user, start, end);

        if (todayPosts >= 3)
            return "Daily post limit reached";

        post.setUser(user);

        postRepository.save(post);

        return "Post created successfully";
    }

    @GetMapping
    public List<PostResponse> getAllPosts() {

        return postRepository.findAll()
                .stream()
                .map(PostResponse::new)
                .toList();
    }

    @GetMapping("/category/{category}")
    public List<Post> getPostsByCategory(
            @PathVariable String category) {

        return postRepository.findByCategoryIgnoreCase(category);
    }

    @PutMapping("/{id}/like")
    public String likePost(
            @PathVariable Long id,
            @RequestParam String email) {

        User user =
                userRepository.findByEmail(email).orElse(null);

        Post post =
                postRepository.findById(id).orElse(null);

        if (user == null)
            return "User not found";

        if (post == null)
            return "Post not found";

        PostVote vote =
                postVoteRepository.findByUserAndPost(user, post)
                        .orElse(null);

        if (vote != null &&
                vote.getVoteType().equals("LIKE")) {

            post.setLikes(post.getLikes() - 1);

            postVoteRepository.delete(vote);

            postRepository.save(post);

            return "Like removed";
        }

        if (vote != null &&
                vote.getVoteType().equals("DISLIKE")) {

            post.setDislikes(post.getDislikes() - 1);
            post.setLikes(post.getLikes() + 1);

            vote.setVoteType("LIKE");

            postVoteRepository.save(vote);
            postRepository.save(post);

            return "Changed to like";
        }

        vote = new PostVote();

        vote.setUser(user);
        vote.setPost(post);
        vote.setVoteType("LIKE");

        post.setLikes(post.getLikes() + 1);

        postVoteRepository.save(vote);
        postRepository.save(post);

        return "Post liked";
    }

    @PutMapping("/{id}/dislike")
    public String dislikePost(
            @PathVariable Long id,
            @RequestParam String email) {

        User user =
                userRepository.findByEmail(email).orElse(null);

        Post post =
                postRepository.findById(id).orElse(null);

        if (user == null)
            return "User not found";

        if (post == null)
            return "Post not found";

        PostVote vote =
                postVoteRepository.findByUserAndPost(user, post)
                        .orElse(null);

        if (vote != null &&
                vote.getVoteType().equals("DISLIKE")) {

            post.setDislikes(post.getDislikes() - 1);

            postVoteRepository.delete(vote);

            postRepository.save(post);

            return "Dislike removed";
        }

        if (vote != null &&
                vote.getVoteType().equals("LIKE")) {

            post.setLikes(post.getLikes() - 1);
            post.setDislikes(post.getDislikes() + 1);

            vote.setVoteType("DISLIKE");

            postVoteRepository.save(vote);
            postRepository.save(post);

            return "Changed to dislike";
        }

        vote = new PostVote();

        vote.setUser(user);
        vote.setPost(post);
        vote.setVoteType("DISLIKE");

        post.setDislikes(post.getDislikes() + 1);

        postVoteRepository.save(vote);
        postRepository.save(post);

        return "Post disliked";
    }

    @PutMapping("/{id}/share")
    public String sharePost(@PathVariable Long id) {

        Post post =
                postRepository.findById(id).orElse(null);

        if (post == null)
            return "Post not found";

        post.setShares(post.getShares() + 1);

        postRepository.save(post);

        return "Share counted";
    }

    @GetMapping("/{id}")
public PostResponse getPostById(@PathVariable Long id) {

    Post post = postRepository.findById(id).orElse(null);

    if (post == null) {
        throw new RuntimeException("Post not found");
    }

    return new PostResponse(post);
}

    @GetMapping("/trending")
    public List<PostResponse> getTrendingPosts() {

        return postRepository
                .findTop10ByOrderByLikesDescSharesDesc()
                .stream()
                .map(PostResponse::new)
                .toList();
    }

    @GetMapping("/my-posts")
    public List<PostResponse> getMyPosts(
            @RequestParam String email) {

        User user =
                userRepository.findByEmail(email).orElse(null);

        if (user == null)
            return List.of();

        return postRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(PostResponse::new)
                .toList();
    }

    /*
     * EDIT POST
     * Only the owner can edit.
     * This endpoint is intended to be called
     * from My Posts.
     */
    @PutMapping("/{id}")
    public String editPost(
            @PathVariable Long id,
            @RequestParam String email,
            @RequestBody Post updatedPost) {

        User user =
                userRepository.findByEmail(email).orElse(null);

        if (user == null)
            return "User not found";

        Post post =
                postRepository.findById(id).orElse(null);

        if (post == null)
            return "Post not found";

        if (!post.getUser().getId().equals(user.getId())) {
            return "You can only edit your own posts";
        }

        if (updatedPost.getContent() == null ||
                updatedPost.getContent().trim().isEmpty()) {

            return "Content cannot be empty";
        }

        post.setContent(updatedPost.getContent().trim());

        post.setCategory(updatedPost.getCategory());

        postRepository.save(post);

        return "Post updated successfully";
    }

    @DeleteMapping("/{id}")
    public String deletePost(
            @PathVariable Long id,
            @RequestParam String email) {

        User user =
                userRepository.findByEmail(email).orElse(null);

        if (user == null)
            return "User not found";

        Post post =
                postRepository.findById(id).orElse(null);

        if (post == null)
            return "Post not found";

        if (!post.getUser().getId().equals(user.getId())) {
            return "You can only delete your own posts";
        }

        postRepository.delete(post);

        return "Post deleted successfully";
    }

    @GetMapping("/{id}/vote")
    public String getUserVote(
            @PathVariable Long id,
            @RequestParam String email) {

        User user =
                userRepository.findByEmail(email).orElse(null);

        Post post =
                postRepository.findById(id).orElse(null);

        if (user == null || post == null)
            return "NONE";

        return postVoteRepository
                .findByUserAndPost(user, post)
                .map(PostVote::getVoteType)
                .orElse("NONE");
    }
}