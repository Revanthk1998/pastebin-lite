import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createPaste() {
    setError(null);
    setResult(null);

    if (!content.trim()) {
      setError("Content cannot be empty");
      return;
    }

    const res = await fetch("/api/pastes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create paste");
      return;
    }

    setResult(data.url);
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Pastebin Lite</h1>

      <textarea
        rows={8}
        style={{ width: "100%", marginBottom: "1rem" }}
        placeholder="Enter your paste content here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button onClick={createPaste}>Create Paste</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <p>
          Paste created:{" "}
          <a href={result} target="_blank">
            {result}
          </a>
        </p>
      )}

      <hr />

      <p>
        Health check: <a href="/api/healthz">/api/healthz</a>
      </p>
    </main>
  );
}
