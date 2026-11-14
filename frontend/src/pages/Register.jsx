
import { useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");

    async function handleRegister(event) {
        event.preventDefault();

        try {
            const response = await fetch(`${API}/api/users/register`, {
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

            setMessage("Account created successfully! Redirecting to login...");
            setMessageColor("#22c55e");

            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);

        } catch (error) {
            console.error(error);
            setMessage("Registration failed: " + error.message);
            setMessageColor("#ef4444");
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
                    <button onClick={() => window.location.href = "/login"}>
                        Login
                    </button>
                </nav>
            </header>

            <main>
                <section className="auth-container">
                    <h2>Create Account</h2>
                    <p>Join AnonConfess to post and interact.</p>

                    <form onSubmit={handleRegister}>
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

                        <button type="submit">Create Account</button>
                    </form>

                    <p style={{ color: messageColor }}>{message}</p>

                    <p>
                        Already have an account?{" "}
                        <a href="/login">Login</a>
                    </p>
                </section>
            </main>
        </>
    );
}

export default Register;
