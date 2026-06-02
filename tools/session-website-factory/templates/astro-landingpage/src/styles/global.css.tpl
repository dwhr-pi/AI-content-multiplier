@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
  --paper: #f4efe7;
  --ink: #1d1b19;
  --accent: #145f47;
  --surface: rgba(255, 255, 255, 0.78);
}

body {
  margin: 0;
  font-family: "Segoe UI", Arial, sans-serif;
  background:
    radial-gradient(circle at top left, #fff5df 0%, var(--paper) 48%, #f0ebe3 100%);
  color: var(--ink);
}

.shell {
  min-height: 100vh;
  padding: 2rem 1rem 4rem;
}

.hero-card,
.content-card,
.legal-card {
  border-radius: 2rem;
  border: 1px solid rgba(29, 27, 25, 0.1);
  background: var(--surface);
  backdrop-filter: blur(12px);
}
