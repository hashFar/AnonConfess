const userEmail = localStorage.getItem("userEmail");

if (!userEmail) {
    window.location.href = "/login.html";
}


/* =========================
   LOGOUT
========================= */

document.getElementById("logoutButton").addEventListener("click", function () {

    localStorage.removeItem("userEmail");

    window.location.href = "/";
});


/* =========================
   LOAD BOOKMARKS
========================= */

async function loadBookmarks() {

    const container = document.getElementById("bookmarks");

    container.innerHTML = "<p>Loading bookmarks...</p>";

    try {

        const response = await fetch(
            `/api/bookmarks?email=${encodeURIComponent(userEmail)}`
        );

        if (!response.ok) {
            throw new Error("Failed to load bookmarks");
        }

        const posts = await response.json();

        if (posts.length === 0) {

            container.innerHTML = `
                <div class="empty-bookmarks">
                    <h3>No bookmarks yet</h3>
                    <p>Save confessions you want to read later.</p>

                    <button onclick="window.location.href='/'">
                        Explore Confessions
                    </button>
                </div>
            `;

            return;
        }

        container.innerHTML = "";

        posts.forEach(post => {

            const card = document.createElement("div");

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

                    <button onclick="removeBookmark(${post.id})">
                        🔖 Remove Bookmark
                    </button>

                    <button onclick="window.location.href='/'">
                        ← Back to Posts
                    </button>

                </div>
            `;

            container.appendChild(card);
        });

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <p>
                Could not load bookmarks.
                Make sure Spring Boot is running.
            </p>
        `;
    }
}


/* =========================
   REMOVE BOOKMARK
========================= */

async function removeBookmark(postId) {

    try {

        const response = await fetch(
            `/api/bookmarks?email=${encodeURIComponent(userEmail)}&postId=${postId}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.text();

        if (!response.ok) {
            throw new Error(result);
        }

        showToast(result);

        loadBookmarks();

    } catch (error) {

        console.error(error);

        showToast("Failed to remove bookmark", true);
    }
}


/* =========================
   TOAST
========================= */

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


/* =========================
   START
========================= */

loadBookmarks();