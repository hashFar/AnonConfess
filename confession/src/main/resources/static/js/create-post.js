const userEmail = localStorage.getItem("userEmail");

if (!userEmail) {
    window.location.href = "/login.html";
}

document.getElementById("logoutButton").addEventListener("click", function () {
    localStorage.removeItem("userEmail");
    window.location.href = "/";
});

document.getElementById("createPostForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const content = document.getElementById("content").value.trim();
    const category = document.getElementById("category").value;
    const message = document.getElementById("message");

    if (!content) {
        message.textContent = "Please write something first.";
        message.style.color = "#ef4444";
        return;
    }

    try {
        const response = await fetch(
            `/api/posts?email=${encodeURIComponent(userEmail)}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    content: content,
                    category: category || null
                })
            }
        );

        const result = await response.text();

        if (!response.ok) {
            throw new Error(result);
        }

        message.textContent = "Post created successfully! Redirecting...";
        message.style.color = "#22c55e";

        setTimeout(() => {
            window.location.href = "/";
        }, 1000);

    } catch (error) {
        console.error(error);
        message.textContent = "Failed to create post: " + error.message;
        message.style.color = "#ef4444";
    }
});