console.log("NEW APP.JS LOADED");

function updateNavbar() {
    const authNav = document.getElementById("authNav");

    if (!authNav) return;

    const userEmail = localStorage.getItem("userEmail");

    if (userEmail) {

        authNav.innerHTML = `
            <button id="postButton">Post</button>
            <button id="myPostsButton">My Posts</button>
            <button id="bookmarksButton">🔖 Bookmarks</button>

            <div class="notification-wrapper">
                <button id="notificationButton">
                    🔔
                    <span id="notificationCount"></span>
                </button>

                <div id="notificationBox" class="notification-box">
                </div>
            </div>

            <button id="logoutButton">Logout</button>
        `;

        document.getElementById("postButton").onclick = function () {
            window.location.href = "/create-post.html";
        };

        document.getElementById("myPostsButton").onclick = function () {
            window.location.href = "/my-posts.html";
        };

        document.getElementById("bookmarksButton").onclick = function () {
            window.location.href = "/bookmarks.html";
        };

        document.getElementById("logoutButton").onclick = function () {
            localStorage.removeItem("userEmail");
            window.location.reload();
        };

        document.getElementById("notificationButton").onclick =
            toggleNotifications;

        loadNotificationCount();

    } else {

        authNav.innerHTML = `
            <button id="loginButton">Login</button>
            <button id="registerButton">Register</button>
        `;

        document.getElementById("loginButton").onclick = function () {
            window.location.href = "/login.html";
        };

        document.getElementById("registerButton").onclick = function () {
            window.location.href = "/register.html";
        };
    }
}

/* =========================
   NOTIFICATIONS
========================= */

async function loadNotificationCount() {

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) return;

    try {

        const response = await fetch(
            `/api/notifications/unread-count?email=${encodeURIComponent(userEmail)}`
        );

        const count = await response.text();

        const notificationCount =
            document.getElementById("notificationCount");

        if (count > 0) {
            notificationCount.textContent = count;
            notificationCount.style.display = "inline";
        } else {
            notificationCount.style.display = "none";
        }

    } catch (error) {
        console.error("Notification count error:", error);
    }
}


async function toggleNotifications() {

    const box = document.getElementById("notificationBox");

    if (box.style.display === "block") {
        box.style.display = "none";
        return;
    }

    box.style.display = "block";

    await loadNotifications();
}


async function loadNotifications() {

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) return;

    const box = document.getElementById("notificationBox");

    box.innerHTML = "<p>Loading...</p>";

    try {

        const response = await fetch(
            `/api/notifications?email=${encodeURIComponent(userEmail)}`
        );

        const notifications = await response.json();

        if (notifications.length === 0) {

            box.innerHTML = `
                <p class="no-notifications">
                    No notifications
                </p>
            `;

            return;
        }

        box.innerHTML = "";

        notifications.forEach(notification => {

            const item = document.createElement("div");

            item.className =
                notification.read
                    ? "notification-item"
                    : "notification-item unread";

            item.innerHTML = `
                <p>${notification.message}</p>
                <small>
                    ${new Date(notification.createdAt).toLocaleString()}
                </small>
            `;

            item.onclick = async function () {

                if (!notification.read) {

                    await fetch(
                        `/api/notifications/${notification.id}/read?email=${encodeURIComponent(userEmail)}`,
                        {
                            method: "PUT"
                        }
                    );

                    loadNotificationCount();
                }

                item.classList.remove("unread");
            };

            box.appendChild(item);
        });

    } catch (error) {

        console.error("Notification error:", error);

        box.innerHTML =
            "<p>Could not load notifications.</p>";
    }
}


/* =========================
   LOAD POSTS
========================= */

async function loadPosts(category = "all") {

    const postsContainer = document.getElementById("posts");

    postsContainer.innerHTML = "<p>Loading posts...</p>";

    

    try {

        let url = "/api/posts";

        if (category !== "all") {
            url = `/api/posts/category/${category}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to load posts");
        }

        const posts = await response.json();

        if (posts.length === 0) {
            postsContainer.innerHTML = "<p>No posts found.</p>";
            return;
        }

        postsContainer.innerHTML = "";

        posts.forEach(post => {

            const postCard = document.createElement("div");

            postCard.className = "post-card";

            postCard.innerHTML = `
                <div class="post-category">
                    ${post.category || "General"}
                </div>

                <p class="post-content">
                    ${post.content}
                </p>

                <small>
                    ${new Date(post.createdAt).toLocaleString()}
                </small>

                <div class="post-actions">

                    <button class="vote-button like-button"
        onclick="likePost(${post.id})">
    👍 ${post.likes}
</button>

<button class="vote-button dislike-button"
        onclick="dislikePost(${post.id})">
    👎 ${post.dislikes}
</button>

                    <button onclick="toggleComments(${post.id})">
                        💬 Comment
                    </button>

                    <button onclick="bookmarkPost(${post.id})">
                        🔖 Bookmark
                    </button>

                    <button onclick="sharePost(${post.id})">
                        ↗ Share ${post.shares || 0}
                    </button>

                    <button onclick="reportPost(${post.id})">
                        🚩 Report
                    </button>

                </div>

                <div
                    id="comments-${post.id}"
                    class="comments-section"
                    style="display: none;"
                >
                </div>
            `;

            postsContainer.appendChild(postCard);

            const userEmail = localStorage.getItem("userEmail");

if (userEmail) {
    fetch(
        `/api/posts/${post.id}/vote?email=${encodeURIComponent(userEmail)}`
    )
    .then(response => response.text())
    .then(vote => {

        const likeButton = document.querySelector(
            `button[onclick="likePost(${post.id})"]`
        );

        const dislikeButton = document.querySelector(
            `button[onclick="dislikePost(${post.id})"]`
        );

        if (vote === "LIKE") {
            likeButton.classList.add("active-like");
        }

        if (vote === "DISLIKE") {
            dislikeButton.classList.add("active-dislike");
        }
    })
    .catch(error => console.error(error));
}
        });

    } catch (error) {

        postsContainer.innerHTML =
            "<p>Could not load posts. Make sure Spring Boot is running.</p>";

        console.error(error);
    }
}


/* =========================
   LIKE
========================= */

async function likePost(id) {

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        window.location.href = "/login.html";
        return;
    }

    try {
        const response = await fetch(
            `/api/posts/${id}/like?email=${encodeURIComponent(userEmail)}`,
            { method: "PUT" }
        );

        const result = await response.text();

        if (!response.ok) {
            throw new Error(result);
        }

        const likeButton = document.querySelector(
            `button[onclick="likePost(${id})"]`
        );

        const dislikeButton = document.querySelector(
            `button[onclick="dislikePost(${id})"]`
        );

        if (result === "Post liked") {
            likeButton.textContent = "👍 " + (getCount(likeButton) + 1);
            likeButton.classList.add("active-like");
        }

        else if (result === "Like removed") {
            likeButton.textContent =
                "👍 " + Math.max(0, getCount(likeButton) - 1);

            likeButton.classList.remove("active-like");
        }

        else if (result === "Changed to like") {
            likeButton.textContent =
                "👍 " + (getCount(likeButton) + 1);

            dislikeButton.textContent =
                "👎 " + Math.max(0, getCount(dislikeButton) - 1);

            dislikeButton.classList.remove("active-dislike");
            likeButton.classList.add("active-like");
        }

        showToast(result);

    } catch (error) {
        console.error(error);
        showToast("Like failed: " + error.message, true);
    }
}


/* =========================
   DISLIKE
========================= */

async function dislikePost(id) {

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        window.location.href = "/login.html";
        return;
    }

    try {
        const response = await fetch(
            `/api/posts/${id}/dislike?email=${encodeURIComponent(userEmail)}`,
            { method: "PUT" }
        );

        const result = await response.text();

        if (!response.ok) {
            throw new Error(result);
        }

        const dislikeButton = document.querySelector(
            `button[onclick="dislikePost(${id})"]`
        );

        const likeButton = document.querySelector(
            `button[onclick="likePost(${id})"]`
        );

        if (result === "Post disliked") {
            dislikeButton.textContent =
                "👎 " + (getCount(dislikeButton) + 1);

            dislikeButton.classList.add("active-dislike");
        }

        else if (result === "Dislike removed") {
            dislikeButton.textContent =
                "👎 " + Math.max(0, getCount(dislikeButton) - 1);

            dislikeButton.classList.remove("active-dislike");
        }

        else if (result === "Changed to dislike") {
            dislikeButton.textContent =
                "👎 " + (getCount(dislikeButton) + 1);

            likeButton.textContent =
                "👍 " + Math.max(0, getCount(likeButton) - 1);

            likeButton.classList.remove("active-like");
            dislikeButton.classList.add("active-dislike");
        }

        showToast(result);

    } catch (error) {
        console.error(error);
        showToast("Dislike failed: " + error.message, true);
    }
}
function getCount(button) {
    return parseInt(button.textContent.replace(/\D/g, "")) || 0;
}


/* =========================
   COMMENTS
========================= */

async function toggleComments(postId) {

    const section = document.getElementById(`comments-${postId}`);

    if (section.style.display === "none") {

        section.style.display = "block";

        await loadComments(postId);

    } else {

        section.style.display = "none";
    }
}


async function loadComments(postId) {

    const section = document.getElementById(`comments-${postId}`);

    section.innerHTML = "<p>Loading comments...</p>";

    try {

        const response = await fetch(`/api/comments/${postId}`);

        if (!response.ok) {
            throw new Error("Failed to load comments");
        }

        const comments = await response.json();

        const userEmail = localStorage.getItem("userEmail");

        let html = "";

        if (comments.length === 0) {

            html += `
                <p class="no-comments">
                    No comments yet.
                </p>
            `;

        } else {

            comments.forEach(comment => {

                const isOwner =
                    userEmail &&
                    comment.userEmail === userEmail;

                html += `
                    <div class="comment">

                        <p>${comment.content}</p>

                        <small>
                            ${new Date(comment.createdAt).toLocaleString()}
                        </small>

                        ${
                            isOwner
                            ? `
                                <button
                                    class="delete-comment-button"
                                    onclick="deleteComment(${comment.id}, ${postId})">
                                    🗑️ Delete
                                </button>
                              `
                            : ""
                        }

                    </div>
                `;
            });
        }

        if (userEmail) {

            html += `
                <div class="comment-form">

                    <textarea
                        id="comment-input-${postId}"
                        placeholder="Write a comment..."
                    ></textarea>

                    <button onclick="addComment(${postId})">
                        Add Comment
                    </button>

                </div>
            `;

        } else {

            html += `
                <p class="login-comment-message">
                    Login to comment.
                </p>
            `;
        }

        section.innerHTML = html;

    } catch (error) {

        console.error("COMMENT ERROR:", error);

        section.innerHTML =
            "<p>Could not load comments.</p>";
    }
}


async function addComment(postId) {

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        window.location.href = "/login.html";
        return;
    }

    const input =
        document.getElementById(`comment-input-${postId}`);

    const content = input.value.trim();

    if (!content) {
        alert("Please write a comment.");
        return;
    }

    try {

        const response = await fetch(
            `/api/comments?postId=${postId}&email=${encodeURIComponent(userEmail)}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    content: content
                })
            }
        );

        const result = await response.text();

        if (!response.ok) {
            throw new Error(result);
        }

        await loadComments(postId);

    } catch (error) {

        console.error(error);

        alert("Failed to add comment: " + error.message);
    }
}


async function deleteComment(commentId, postId) {

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        window.location.href = "/login.html";
        return;
    }

    if (!confirm("Delete this comment?")) {
        return;
    }

    try {

        const response = await fetch(
            `/api/comments/${commentId}?email=${encodeURIComponent(userEmail)}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.text();

        if (!response.ok) {
            throw new Error(result);
        }

        showToast(result);

        await loadComments(postId);

    } catch (error) {

        console.error(error);

        showToast(
            "Delete failed: " + error.message,
            true
        );
    }
}


/* =========================
   SHARE
========================= */

async function sharePost(id) {

    const shareUrl =
        `${window.location.origin}/post.html?id=${id}`;

    try {

        if (navigator.share) {

            await navigator.share({
                title: "AnonConfess",
                text: "Check out this anonymous confession!",
                url: shareUrl
            });

        } else {

            await navigator.clipboard.writeText(shareUrl);

            showToast("Confession link copied!");
        }

        const response = await fetch(`/api/posts/${id}/share`, {
            method: "PUT"
        });

        if (!response.ok) {
            throw new Error("Could not count share");
        }

        await loadPosts();

    } catch (error) {

        // User cancelled native share
        if (error.name === "AbortError") {
            return;
        }

        console.error(error);

        // Clipboard fallback
        try {

            await navigator.clipboard.writeText(shareUrl);

            showToast("Confession link copied!");

        } catch (copyError) {

            console.error(copyError);

            alert(
                "Copy this confession link:\n\n" +
                shareUrl
            );
        }
    }
}

/* =========================
   BOOKMARK
========================= */
async function bookmarkPost(postId) {

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        window.location.href = "/login.html";
        return;
    }

    try {
        const response = await fetch(
            `/api/bookmarks?email=${encodeURIComponent(userEmail)}&postId=${postId}`,
            {
                method: "POST"
            }
        );

        const result = await response.text();

        if (!response.ok) {
            throw new Error(result);
        }

        showToast(result);

    } catch (error) {

        console.error(error);
        showToast("Bookmark failed", true);
    }
}


/* =========================
   REPORT
========================= */

function reportPost(postId) {

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        window.location.href = "/login.html";
        return;
    }

    const existing = document.getElementById(`report-${postId}`);

    if (existing) {
        existing.remove();
        return;
    }

    const reportBox = document.createElement("div");

    reportBox.id = `report-${postId}`;
    reportBox.className = "report-box";

    reportBox.innerHTML = `
        <h4>Report this confession</h4>

        <select id="report-reason-${postId}">
            <option value="">Select a reason</option>
            <option value="Spam">Spam</option>
            <option value="Harassment">Harassment</option>
            <option value="Hate Speech">Hate Speech</option>
            <option value="Inappropriate Content">Inappropriate Content</option>
            <option value="Other">Other</option>
        </select>

        <div class="report-buttons">
            <button onclick="submitReport(${postId})">
                Submit Report
            </button>

            <button onclick="document.getElementById('report-${postId}').remove()">
                Cancel
            </button>
        </div>
    `;

    const postCard = document
        .querySelector(`button[onclick="reportPost(${postId})"]`)
        .closest(".post-card");

    postCard.appendChild(reportBox);
}


async function submitReport(postId) {

    const userEmail = localStorage.getItem("userEmail");

    const reasonElement =
        document.getElementById(`report-reason-${postId}`);

    const reason = reasonElement.value;

    if (!reason) {
        showToast("Please select a reason", true);
        return;
    }

    try {

        const response = await fetch(
            `/api/reports?email=${encodeURIComponent(userEmail)}&postId=${postId}&reason=${encodeURIComponent(reason)}`,
            {
                method: "POST"
            }
        );

        const result = await response.text();

        if (!response.ok) {
            throw new Error(result);
        }

        const reportBox =
            document.getElementById(`report-${postId}`);

        if (reportBox) {
            reportBox.remove();
        }

        showToast(result);

    } catch (error) {

        console.error(error);

        showToast("Report failed: " + error.message, true);
    }
}




function showToast(message, isError = false) {

    const oldToast = document.getElementById("toast");

    if (oldToast) {
        oldToast.remove();
    }

    const toast = document.createElement("div");

    toast.id = "toast";
    toast.textContent = message;

    if (isError) {
        toast.classList.add("toast-error");
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast-hide");

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 2000);
}

async function deleteComment(commentId, postId) {

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        window.location.href = "/login.html";
        return;
    }

    if (!confirm("Delete this comment?")) {
        return;
    }

    try {

        const response = await fetch(
            `/api/comments/${commentId}?email=${encodeURIComponent(userEmail)}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.text();

        if (!response.ok) {
            throw new Error(result);
        }

        showToast(result);

        await loadComments(postId);

    } catch (error) {

        console.error(error);
        showToast("Delete failed: " + error.message, true);
    }
}

/* =========================
   SEARCH
========================= */

function setupSearch() {

    const input = document.getElementById("searchInput");
    const button = document.getElementById("searchButton");

    if (!input || !button) return;

    button.addEventListener("click", function () {
        searchPosts();
    });

    input.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            event.preventDefault();
            searchPosts();
        }

    });
}


async function searchPosts() {

    const input =
        document.getElementById("searchInput");

    const query =
        input.value.trim().toLowerCase();

    if (!query) {
        loadPosts();
        return;
    }

    try {

        const response =
            await fetch("/api/posts");

        if (!response.ok) {
            throw new Error("Failed to load posts");
        }

        const posts =
            await response.json();

        const filteredPosts =
            posts.filter(post => {

                const content =
                    (post.content || "").toLowerCase();

                const category =
                    (post.category || "").toLowerCase();

                return content.includes(query) ||
                       category.includes(query);
            });

        renderSearchResults(filteredPosts);

    } catch (error) {

        console.error("SEARCH ERROR:", error);

        document.getElementById("posts").innerHTML =
            "<p>Could not search confessions.</p>";
    }
}


function renderSearchResults(posts) {

    const container =
        document.getElementById("posts");

    if (posts.length === 0) {

        container.innerHTML = `
            <div class="empty-bookmarks">
                <h3>No confessions found</h3>
                <p>Try another keyword.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = "";

    posts.forEach(post => {

        const card =
            document.createElement("div");

        card.className = "post-card";

        card.innerHTML = `
            <div class="post-category">
                ${post.category || "General"}
            </div>

            <p class="post-content">
                ${post.content}
            </p>

            <small>
                ${new Date(post.createdAt).toLocaleString()}
            </small>

            <div class="post-actions">

                <button
                    class="vote-button like-button"
                    onclick="likePost(${post.id})">
                    👍 ${post.likes}
                </button>

                <button
                    class="vote-button dislike-button"
                    onclick="dislikePost(${post.id})">
                    👎 ${post.dislikes}
                </button>

                <button onclick="toggleComments(${post.id})">
                    💬 Comments
                </button>

                <button onclick="bookmarkPost(${post.id})">
                    🔖 Bookmark
                </button>

                <button onclick="sharePost(${post.id})">
                    ↗ Share ${post.shares || 0}
                </button>

            </div>

            <div
                id="comments-${post.id}"
                class="comments-section"
                style="display:none;">
            </div>
        `;

        container.appendChild(card);
    });
}


setupSearch();

/* =========================
   START
========================= */

updateNavbar();
loadPosts();