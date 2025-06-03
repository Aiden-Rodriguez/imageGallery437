import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import "./LoginPage.css";

interface LoginPageProps {
  isRegistering?: boolean;
  setToken: (token: string) => void;
}

export function LoginPage({ isRegistering = false, setToken }: LoginPageProps) {
  const usernameInputId = React.useId();
  const passwordInputId = React.useId();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    setIsPending(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const endpoint = isRegistering ? "/auth/register" : "/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        let errorMsg = "Request failed";
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch {}

        if (response.status === 400) {
          setError("Missing username or password");
        } else if (response.status === 409 && isRegistering) {
          setError("Username already taken");
        } else if (response.status === 401 && !isRegistering) {
          setError("Invalid username or password");
        } else {
          setError(errorMsg);
        }

        return;
      }

      const result = await response.json();
      if (result.token) {
        setToken(result.token);
        setSuccessMessage(
          isRegistering
            ? "Account created! Logging in..."
            : "Login successful!",
        );

        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setError("Unexpected response: no token returned");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Server unreachable. Please try again later.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
      <form className="LoginPage-form" onSubmit={handleSubmit}>
        <label htmlFor={usernameInputId}>Username</label>
        <input
          id={usernameInputId}
          name="username"
          required
          disabled={isPending}
        />

        <label htmlFor={passwordInputId}>Password</label>
        <input
          id={passwordInputId}
          name="password"
          type="password"
          required
          disabled={isPending}
        />

        <input
          type="submit"
          value={isRegistering ? "Register" : "Login"}
          disabled={isPending}
        />

        {error && (
          <p style={{ color: "red" }} aria-live="polite">
            {error}
          </p>
        )}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      </form>

      {!isRegistering && (
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      )}
    </div>
  );
}
