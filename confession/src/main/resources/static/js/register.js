console.log("register.js loaded");

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("registerForm");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        console.log("Form submitted");

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const message = document.getElementById("message");

        try {
            const response = await fetch("/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.text();

            if (!response.ok) {
                throw new Error(data);
            }

            message.textContent = "Account created successfully! Redirecting to login...";
            message.style.color = "#22c55e";

            setTimeout(function () {
                window.location.href = "login.html";
            }, 1500);

        } catch (error) {
            console.error(error);
            message.textContent = "Registration failed: " + error.message;
            message.style.color = "#ef4444";
        }
    });
});