import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createPaste() {
    setError(null);
    setResultUrl(null);

    if (!content.trim()) {
      setError("Content cannot be empty");
      return;
    }

    const body: any = { content };

    if (ttl) body.ttl_seconds = Number(ttl);
    if (maxViews) body.max_views = Number(maxViews);

    const res = await fetch("/api/pastes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create paste");
      return;
    }

    setResultUrl(data.url);
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Pastebin Lite</h1>

      <textarea
        rows={8}
        style={{ width: "100%" }}
        placeholder="Enter your paste content here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <br /><br />

      <label>
        TTL (seconds, optional):{" "}
        <input
          type="number"
          min="1"
          value={ttl}
          onChange={(e) => setTtl(e.target.value)}
        />
      </label>

      <br /><br />

      <label>
        Max views (optional):{" "}
        <input
          type="number"
          min="1"
          value={maxViews}
          onChange={(e) => setMaxViews(e.target.value)}
        />
      </label>

      <br /><br />

      <button onClick={createPaste}>Create Paste</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {resultUrl && (
        <p>
          Paste created:{" "}
          <a href={resultUrl} target="_blank">
            {resultUrl}
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
