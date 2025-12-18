import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuth2Callback() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Processing authorization...");
  const navigate = useNavigate();
  const { updateUser } = useAuth(); // Assuming useAuth exposes a way to update state or we just rely on localStorage

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const code = params.get("code");

      // Handle Social Login Token
      if (token) {
        try {
          localStorage.setItem('token', token);
          // Fetch user data to update context immediately
          // Note: using direct fetch here to avoid circular dependency or context issues, 
          // or ideally use a method from context if available.
          // For now, simpler to reload or let AuthProvider check localStorage on mount/update.

          // Force a small delay or reload to ensure AuthContext picks it up?
          // AuthContext listens to nothing but on mount it checks.
          // We can call window.location.href = '/' to force full reload and auth check.

          setStatus("success");
          setMessage("Login successful! Redirecting...");
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
          return;
        } catch (e) {
          setStatus("error");
          setMessage("Login failed. Please try again.");
          return;
        }
      }

      // Handle Gmail Code (Previous Logic)
      if (!code) {
        setStatus("error");
        setMessage("❌ Authorization failed: Missing code or token.");
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/gmail/callback?code=${code}`);
        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage("✅ Gmail Connected Successfully! You can now send emails through The ROAC system.");
        } else {
          setStatus("error");
          setMessage("❌ Authorization failed. Please try again.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("❌ Something went wrong. Please try again later.");
      }
    };

    handleAuth();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={status === "success" ? styles.success : status === "error" ? styles.error : styles.neutral}>
          {status === "loading" ? "🔄 Connecting Gmail..." : message.split("!")[0] + "!"}
        </h1>
        {status !== "loading" && (
          <p style={styles.text}>{message.replace(message.split("!")[0] + "!", "").trim()}</p>
        )}
        {status === "loading" && <p style={styles.text}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    marginTop: "80px",
  },
  card: {
    display: "inline-block",
    padding: "30px",
    borderRadius: "12px",
    background: "#f8f8f8",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    maxWidth: "480px",
  },
  text: {
    color: "#333",
    fontSize: "16px",
    lineHeight: "1.6",
  },
  success: {
    color: "#2E7D32",
  },
  error: {
    color: "#C62828",
  },
  neutral: {
    color: "#333",
  },
};
