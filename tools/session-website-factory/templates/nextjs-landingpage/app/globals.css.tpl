@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
  --paper: #f4efe7;
  --ink: #1d1b19;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: "Segoe UI", Arial, sans-serif;
  background:
    radial-gradient(circle at top left, #fff5df 0%, var(--paper) 48%, #f0ebe3 100%);
  color: var(--ink);
}
