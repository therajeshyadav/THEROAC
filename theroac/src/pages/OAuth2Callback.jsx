import React, { useEffect, useState } from "react";

export default function OAuth2Callback() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Connecting Gmail... Please wait.");

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        setStatus("error");
        setMessage("❌ Authorization failed: Missing code.");
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
