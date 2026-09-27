const postId =
    new URLSearchParams(window.location.search).get("id");

const userEmail = localStorage.getItem("userEmail");


function updateNavbar() {

    const nav = document.getElementById("authNav");

    if (userEmail) {
        nav.innerHTML = `
            <button onclick="window.location.href='/'">Home</button>
            <button onclick="window.location.href='/create-post.html'">Post</button>
            <button onclick="window.location.href='/my-posts.html'">My Posts</button>
            <button onclick="window.location.href='/bookmarks.html'">Bookmarks</button>
            <button onclick="logout()">Logout</button>
        `;
    } else {
        nav.innerHTML = `
            <button onclick="window.location.href='/'">Home</button>
            <button onclick="window.location.href='/login.html'">Login</button>
            <button onclick="window.location.href='/register.html'">Register</button>
        `;
    }
}


function logout() {
    localStorage.removeItem("userEmail");
    window.location.href = "/";
}


async function loadPost() {

    const container = document.getElementById("singlePost");

    if (!postId) {
        container.innerHTML = "<p>Invalid confession link.</p>";
        return;
    }

    try {

        const response = await fetch(`/api/posts/${postId}`);

        if (!response.ok) {
            throw new Error("Post not found");
        }

        const post = await response.json();

        container.innerHTML = `
            <div class="post-card">

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

            </div>
        `;

        await loadVoteState(post.id);

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Could not load this confession.</p>";
    }
}


/* =========================
   LIKE
========================= */

async function likePost(id) {

    if (!userEmail) {
        window.location.href = "/login.html";
        return;
    }

    await fetch(
        `/api/posts/${id}/like?email=${encodeURIComponent(userEmail)}`,
        { method: "PUT" }
    );

    await loadPost();
}


/* =========================
   DISLIKE
========================= */

async function dislikePost(id) {

    if (!userEmail) {
        window.location.href = "/login.html";
        return;
    }

    await fetch(
        `/api/posts/${id}/dislike?email=${encodeURIComponent(userEmail)}`,
        { method: "PUT" }
    );

    await loadPost();
}


/* =========================
   VOTE STATE
========================= */

async function loadVoteState(id) {

    if (!userEmail) return;

    const response = await fetch(
        `/api/posts/${id}/vote?email=${encodeURIComponent(userEmail)}`
    );

    const vote = await response.text();

    if (vote === "LIKE") {
        document
            .querySelector(".like-button")
            ?.classList.add("active-like");
    }

    if (vote === "DISLIKE") {
        document
            .querySelector(".dislike-button")
            ?.classList.add("active-dislike");
    }
}


/* =========================
   BOOKMARK
========================= */

async function bookmarkPost(id) {

    if (!userEmail) {
        window.location.href = "/login.html";
        return;
    }

    try {

        const response = await fetch(
            `/api/bookmarks?postId=${id}&email=${encodeURIComponent(userEmail)}`,
            {
                method: "POST"
            }
        );

        const result = await response.text();

        showToast(result);

    } catch (error) {
        console.error(error);
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

        await fetch(`/api/posts/${id}/share`, {
            method: "PUT"
        });

        await loadPost();

    } catch (error) {

        if (error.name === "AbortError") {
            return;
        }

        try {

            await navigator.clipboard.writeText(shareUrl);

            showToast("Confession link copied!");

        } catch (copyError) {

            alert(
                "Copy this confession link:\n\n" +
                shareUrl
            );
        }
    }
}


/* =========================
   COMMENTS
========================= */

async function toggleComments(id) {

    const section =
        document.getElementById(`comments-${id}`);

    if (section.style.display === "none") {

        section.style.display = "block";

        await loadComments(id);

    } else {

        section.style.display = "none";
    }
}


async function loadComments(id) {

    const section =
        document.getElementById(`comments-${id}`);

    const response =
        await fetch(`/api/comments/${id}`);

    const comments =
        await response.json();

    let html = "";

    comments.forEach(comment => {

        html += `
            <div class="comment">

                <p>${comment.content}</p>

                <small>
                    ${new Date(comment.createdAt).toLocaleString()}
                </small>

            </div>
        `;
    });

    if (userEmail) {

        html += `
            <textarea
                id="comment-input-${id}"
                placeholder="Write a comment...">
            </textarea>

            <button onclick="addComment(${id})">
                Add Comment
            </button>
        `;

    } else {

        html += `
            <p>Login to comment.</p>
        `;
    }

    section.innerHTML = html;
}


async function addComment(id) {

    if (!userEmail) {
        window.location.href = "/login.html";
        return;
    }

    const input =
        document.getElementById(`comment-input-${id}`);

    const content =
        input.value.trim();

    if (!content) return;

    await fetch(
        `/api/comments?postId=${id}&email=${encodeURIComponent(userEmail)}`,
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

    await loadComments(id);
}


updateNavbar();
loadPost();