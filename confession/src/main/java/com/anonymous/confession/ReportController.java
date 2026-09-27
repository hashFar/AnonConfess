package com.anonymous.confession;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public ReportController(
            ReportRepository reportRepository,
            UserRepository userRepository,
            PostRepository postRepository) {

        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    @PostMapping
    public String reportPost(
            @RequestParam String email,
            @RequestParam Long postId,
            @RequestParam String reason) {

        User user = userRepository.findByEmail(email).orElse(null);
        Post post = postRepository.findById(postId).orElse(null);

        if (user == null) {
            return "User not found";
        }

        if (post == null) {
            return "Post not found";
        }

        if (reportRepository.existsByUserAndPost(user, post)) {
    return "You have already reported this post";
}

        Report report = new Report();
        report.setUser(user);
        report.setPost(post);
        report.setReason(reason);

        reportRepository.save(report);

        return "Post reported successfully";
    }
}