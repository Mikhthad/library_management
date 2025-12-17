import { useContext, useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./login.css";

function Login() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Username and password are required");
            return;
        }

        try {
            setLoading(true);

            const res = await api.post("/api/users/login/", {
                username,
                password,
            });

            const userData = res.data.user;

            login(userData); // store in context

            // 🔐 Permission-based redirect
            if (userData.role === "admin" || userData.role === "librarian") {
                navigate("/admin/dashboard");
            } else {
                navigate("/member/home");
            }

        } catch (err) {
            console.log("LOGIN ERROR:", err.response?.data || err);
            setError("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h2 className="login-title">Login</h2>

                {error && <p className="error-text">{error}</p>}

                <form className="login-form" onSubmit={handleLogin}>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="register-link">
                    Don’t have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
