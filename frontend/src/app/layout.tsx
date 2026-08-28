import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AnalyticsProvider } from "@/components/analytics-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GuiaSense — Suas finanças com clareza",
  description:
    "Organize entradas e saídas, defina orçamentos e receba alertas e orientações para cuidar do seu dinheiro com simplicidade.",
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {GTM_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){ window.dataLayer.push(arguments); }
                  gtag('consent','default',{
                    analytics_storage: 'denied',
                    ad_storage: 'denied',
                    ad_user_data: 'denied',
                    ad_personalization: 'denied',
                    functionality_storage: 'granted',
                    personalization_storage: 'denied',
                    security_storage: 'granted',
                    wait_for_update: 500
                  });
                  window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
                `,
              }}
            />
            <Script
              id="gtm-loader"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
            />
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        )}
        <Providers>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </Providers>
      </body>
    </html>
  );
}