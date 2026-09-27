package com.anonymous.confession;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public BookmarkController(
            BookmarkRepository bookmarkRepository,
            UserRepository userRepository,
            PostRepository postRepository) {

        this.bookmarkRepository = bookmarkRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    @PostMapping
    public String bookmarkPost(
            @RequestParam String email,
            @RequestParam Long postId) {

        User user = userRepository.findByEmail(email).orElse(null);
        Post post = postRepository.findById(postId).orElse(null);

        if (user == null) {
            return "User not found";
        }

        if (post == null) {
            return "Post not found";
        }

        if (bookmarkRepository.findByUserAndPost(user, post).isPresent()) {
            return "Post already bookmarked";
        }

        Bookmark bookmark = new Bookmark();
        bookmark.setUser(user);
        bookmark.setPost(post);

        bookmarkRepository.save(bookmark);

        return "Post bookmarked";
    }

    @DeleteMapping
    public String removeBookmark(
            @RequestParam String email,
            @RequestParam Long postId) {

        User user = userRepository.findByEmail(email).orElse(null);
        Post post = postRepository.findById(postId).orElse(null);

        if (user == null || post == null) {
            return "User or post not found";
        }

        Bookmark bookmark = bookmarkRepository
                .findByUserAndPost(user, post)
                .orElse(null);

        if (bookmark == null) {
            return "Bookmark not found";
        }

        bookmarkRepository.delete(bookmark);

        return "Bookmark removed";
    }

    @GetMapping
public List<PostResponse> getBookmarks(
        @RequestParam String email) {

    User user = userRepository.findByEmail(email).orElse(null);

    if (user == null) {
        return List.of();
    }

    return bookmarkRepository.findByUser(user)
            .stream()
            .map(bookmark -> new PostResponse(bookmark.getPost()))
            .toList();
}
}