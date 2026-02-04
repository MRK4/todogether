import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientSidebarLayout from "@/components/client-sidebar-layout";
import { AlertProvider } from "@/components/alert-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ToDoGether",
  description: "Gestion de tâches collaborative en temps réel",
};

const FALLBACK_LOCALE = "fr";

async function getMessages(locale: string) {
  try {
    const messages = await import(`../messages/${locale}.json`);
    return messages.default;
  } catch {
    const fallback = await import(`../messages/${FALLBACK_LOCALE}.json`);
    return fallback.default;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || FALLBACK_LOCALE;
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AlertProvider>
            <ClientSidebarLayout>{children}</ClientSidebarLayout>
          </AlertProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
