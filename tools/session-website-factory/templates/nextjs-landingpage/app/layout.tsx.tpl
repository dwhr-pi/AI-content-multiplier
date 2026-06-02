import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "{{PROJECT_NAME}}",
  description: "{{DE_SUBHEADLINE}}",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
