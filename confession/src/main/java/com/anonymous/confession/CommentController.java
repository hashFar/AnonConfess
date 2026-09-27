package com.anonymous.confession;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public CommentController(
        CommentRepository commentRepository,
        PostRepository postRepository,
        UserRepository userRepository,
        NotificationRepository notificationRepository) {

    this.commentRepository = commentRepository;
    this.postRepository = postRepository;
    this.userRepository = userRepository;
    this.notificationRepository = notificationRepository;
}

    @PostMapping
    public String addComment(
            @RequestParam Long postId,
            @RequestParam String email,
            @RequestBody Comment comment) {

        User user = userRepository.findByEmail(email)
                .orElse(null);

        Post post = postRepository.findById(postId)
                .orElse(null);

        if (user == null) {
            return "User not found";
        }

        if (post == null) {
            return "Post not found";
        }

        comment.setUser(user);
        comment.setPost(post);

        commentRepository.save(comment);

        // Create notification for post owner
if (!post.getUser().getId().equals(user.getId())) {

    Notification notification = new Notification();

    notification.setUser(post.getUser());

    notification.setMessage(
        "Someone commented on your confession."
    );

    notificationRepository.save(notification);
}

        return "Comment added successfully";
    }

    @GetMapping("/{postId}")
public List<CommentResponse> getComments(@PathVariable Long postId) {
    return commentRepository.findByPostId(postId)
            .stream()
            .map(CommentResponse::new)
            .toList();
}

@DeleteMapping("/{id}")
public String deleteComment(
        @PathVariable Long id,
        @RequestParam String email) {

    User user = userRepository.findByEmail(email)
            .orElse(null);

    if (user == null) {
        return "User not found";
    }

    Comment comment = commentRepository.findById(id)
            .orElse(null);

    if (comment == null) {
        return "Comment not found";
    }

    if (!comment.getUser().getId().equals(user.getId())) {
        return "You can only delete your own comments";
    }

    commentRepository.delete(comment);

    return "Comment deleted successfully";
}
}