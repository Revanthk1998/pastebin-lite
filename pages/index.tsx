export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Pastebin Lite</h1>
      <p>Your Pastebin Lite service is running.</p>

      <ul>
        <li>Health check: <code>/api/healthz</code></li>
        <li>Create paste: <code>POST /api/pastes</code></li>
        <li>View paste: <code>/p/&lt;id&gt;</code></li>
      </ul>
    </main>
  );
}
