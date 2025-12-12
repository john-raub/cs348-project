import React, { useState, useEffect } from "react";
import "./AuthPage.css";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);
  const navigate = useNavigate();


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/${isLogin ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Request failed");

      // Save JWT securely (frontend side)
      localStorage.setItem("token", data.token);
      setToken(data.token);
      alert(`${isLogin ? "Logged in" : "Registered"} successfully!`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };


useEffect(() => {
  // Change 2: Verification hook now reads from localStorage directly
  const storedToken = localStorage.getItem("token");
  if (!storedToken) return; // No token, do nothing

  const checkToken = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      console.log("Token verification response:", res);
      if (res.ok) {
        // Token is valid! Set it in state.
        // This will trigger the *other* useEffect to navigate.
        setToken(storedToken);
      } else {
        // Token is invalid, just remove it and stay on the auth page
        localStorage.removeItem("token");
      }
    } catch (err) {
      // Network error, assume invalid
      localStorage.removeItem("token");
    }
  };

  checkToken();
}, []); // This empty dependency array is correct, it should only run once on mount


  useEffect(() => {
    if (token) {
      navigate("/profile");
    }
  }, [token, navigate]);


  return (
    <div className="auth-container">
      <h2>{isLogin ? "Login" : "Register"}</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>

      <p>
        {isLogin ? "Don't have an account?" : "Already registered?"}{" "}
        <button type="button" className="link" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
}
