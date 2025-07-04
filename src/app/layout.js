import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from '../context/AppContext';
import { PomodoroProvider } from './contexts/PomodoroTimer';
import { I18nProvider } from './i18n/client';
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

export const metadata = {
  title: "NextGen.tn - Study with NextGen",
  description: "Complete study platform with Pomodoro timer, Lofi music, AI chat, document analysis, and productivity tools for enhanced learning.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        suppressHydrationWarning
      >
        <I18nProvider locale="fr">
          <AppProvider>
            <PomodoroProvider>
              <ClientHydrationWrapper>
                <MainLayout>
                  {children}
                </MainLayout>
              </ClientHydrationWrapper>
            </PomodoroProvider>
          </AppProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
