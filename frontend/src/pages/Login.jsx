
import { useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");

    async function handleLogin(event) {
        event.preventDefault();

        try {
            const response = await fetch(`${API}/api/users/login`, {
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

                setMessage("Login successful! Redirecting...");
                setMessageColor("green");

                setTimeout(() => {
                    window.location.href = "/";
                }, 1000);
            } else {
                setMessage(result);
                setMessageColor("red");
            }
        } catch (error) {
            setMessage("Login failed: " + error.message);
            setMessageColor("red");
        }
    }

    return (
        <>
            <header>
                <h1
                    onClick={() => window.location.href = "/"}
                    style={{ cursor: "pointer" }}
                >
                    AnonConfess
                </h1>

                <nav>
                    <button onClick={() => window.location.href = "/register"}>
                        Register
                    </button>
                </nav>
            </header>

            <main>
                <section className="auth-container">
                    <h2>Welcome Back</h2>
                    <p>Login to post and interact.</p>

                    <form onSubmit={handleLogin}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />

                        <button type="submit">Login</button>
                    </form>

                    <p style={{ color: messageColor }}>{message}</p>

                    <p>
                        Don't have an account?{" "}
                        <a href="/register">Register</a>
                    </p>
                </section>
            </main>
        </>
    );
}

export default Login;
