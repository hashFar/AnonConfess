document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    try {
        const response = await fetch("/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const result = await response.text();

        if (!response.ok) {
            throw new Error(result);
        }

        if (result === "Login successful") {
            localStorage.setItem("userEmail", email);

            message.textContent = "Login successful! Redirecting...";
            message.style.color = "green";

            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
        } else {
            message.textContent = result;
            message.style.color = "red";
        }

    } catch (error) {
        message.textContent = "Login failed: " + error.message;
        message.style.color = "red";
    }
});