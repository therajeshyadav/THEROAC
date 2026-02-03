import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { redirectToDashboard } from "../utils/roleRedirect";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

export default function OAuth2Callback() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Processing authorization...");
  const navigate = useNavigate();
  const { setAuthFromToken } = useAuth();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const code = params.get("code");
      if (token) {
        try {
          localStorage.setItem("token", token);

          const res = await fetch(`${API_BASE_URL}auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) throw new Error("User fetch failed");

          const user = await res.json();
          localStorage.setItem("user", JSON.stringify(user));
          setAuthFromToken(token, user);

          setStatus("success");
          setMessage("Login successful! Redirecting...");

          setTimeout(() => {
            redirectToDashboard(user.role);
          }, 800);

          return;
        } catch (err) {
          console.error(err);
          setStatus("error");
          setMessage("Login failed. Please try again.");
          return;
        }
      }

      if (code) {
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/gmail/callback?code=${encodeURIComponent(code)}`
          );

          const data = await res.json();

          if (data?.success) {
            setStatus("success");
            setMessage(
              "Gmail connected successfully! You can now send emails."
            );
          } else {
            throw new Error("Gmail auth failed");
          }
        } catch (err) {
          console.error(err);
          setStatus("error");
          setMessage("Gmail authorization failed. Please try again.");
        }
        return;
      }
      setStatus("error");
      setMessage("Authorization failed. Missing token or code.");
    };

    run();
  }, [navigate, setAuthFromToken]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2
          style={
            status === "success"
              ? styles.success
              : status === "error"
              ? styles.error
              : styles.neutral
          }
        >
          {status === "loading" ? "🔄 Processing..." : message}
        </h2>
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
    padding: "32px",
    borderRadius: "12px",
    background: "#f8f8f8",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    maxWidth: "520px",
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
