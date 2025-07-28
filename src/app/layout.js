import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import "../styles/i18n.css";
import { ClerkProvider } from '@clerk/nextjs';
import { AppProvider } from '../context/AppContext';
import { FloatingNexieProvider } from '../context/FloatingNexieContext';
import { I18nProvider } from './i18n/client';
import DirectionProvider from '../components/DirectionProvider';
import MainLayout from '../components/Layout/MainLayout';
import ClientHydrationWrapper from '../components/ClientHydrationWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata = {
  title: "NextGen.tn - Study with NextGen",
  description: "Complete study platform with Pomodoro timer, Lofi music, AI chat, document analysis, and productivity tools for enhanced learning.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} antialiased min-h-screen`}
          suppressHydrationWarning
        >
          {/* Force English by default */}
          <I18nProvider initialLocale="en">
            <DirectionProvider>
              <AppProvider>
                <FloatingNexieProvider>
                  <ClientHydrationWrapper>
                    <MainLayout>
                      {children}
                    </MainLayout>
                  </ClientHydrationWrapper>
                </FloatingNexieProvider>
              </AppProvider>
            </DirectionProvider>
          </I18nProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
