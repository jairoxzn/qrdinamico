import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NFC Smart QR Manager | XhionSoft Technologies",
  description: "Plataforma profesional de gestión de códigos QR dinámicos y tecnología NFC para XhionSoft Technologies.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#F8FAFC] antialiased text-[#111827]">
        {children}
      </body>
    </html>
  );
}

