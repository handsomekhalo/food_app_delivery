import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";

// Create an axios instance for backend API calls
const backendApi = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true, // Ensures cookies are sent with requests
});

const LoginForm = () => {
  const { login: authLogin } = useAuth();
  const [csrfToken, setCsrfToken] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Fetch CSRF Token on Component Mount
  useEffect(() => {
    console.log("Fetching CSRF token...");
    backendApi
      .get("/system_management/csrf/", { withCredentials: true })
      .then((response) => {
        if (response.data && response.data.csrfToken) {
          setCsrfToken(response.data.csrfToken);
          console.log("CSRF Token Set:", response.data.csrfToken);
        }
      })
      .catch((error) => {
        console.error("CSRF Token Fetch Error:", error);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      console.log("Submitting login form...");

      // Get CSRF token from cookies (as a backup)
      const csrfFromCookies = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))
        ?.split("=")[1];

      // Use token from state or cookies
      const tokenToUse = csrfToken || csrfFromCookies;

      if (!tokenToUse) {
        setError("CSRF token is missing. Please refresh and try again.");
        setIsSubmitting(false);
        return;
      }

      const response = await backendApi.post(
        "/system_management/login/",
        {
          email: formData.username,
          password: formData.password,
          rememberMe: formData.rememberMe,
        },
        {
          headers: {
            "X-CSRFToken": tokenToUse,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.status === "success") {
        console.log("Login successful!");

        const parsedData = JSON.parse(response.data.data);
        const { token, user } = parsedData;

        if (token) {
          authLogin(token, tokenToUse);
          localStorage.setItem("user", JSON.stringify(user));
          navigate("/dashboard");
        } else {
          setError("No token received from server.");
        }
      } else {
        setError(response.data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2 className="login-title">Sign In</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group form-check">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              className="form-check-input"
              checked={formData.rememberMe}
              onChange={handleInputChange}
            />
            <label htmlFor="rememberMe" className="form-check-label">Remember Me</label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
