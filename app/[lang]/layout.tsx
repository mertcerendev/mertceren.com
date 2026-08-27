import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { Syne, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { GrainOverlay } from "@/components/ui/grain-overlay";
import { ScrollChroma } from "@/components/ui/scroll-chroma";
import { Preloader } from "@/components/ui/preloader";
import { Cursor } from "@/components/ui/cursor";
import { IdleMode } from "@/components/ui/idle-mode";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { AiAssistant } from "@/components/ui/ai-assistant";
import { ContextMenu } from "@/components/ui/context-menu";
import { defaultLocale, getContent, isLocale, localePath, locales } from "@/lib/content";
import "../globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin", "latin-ext"],
  /* No weight list, so next/font serves Syne's variable file rather than
     three static cuts. The hero interpolates the axis between words as the
     pointer passes, which static instances cannot do — and one variable file
     is smaller than the three it replaces. */
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

/** Stable, redirect-free path to the generated social card. */
const OG_IMAGE = "/opengraph-image";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { site, profile } = getContent(lang);

  return {
    metadataBase: new URL(site.url),
    title: site.title,
    description: site.description,
    keywords: ["creative developer", "frontend engineer", "portfolio", profile.name],
    authors: [{ name: profile.name }],
    alternates: {
      canonical: localePath(lang, "/"),
      languages: { tr: localePath("tr", "/"), en: localePath("en", "/") },
    },
    openGraph: {
      title: site.title,
      description: site.description,
      url: localePath(lang, "/"),
      siteName: profile.name,
      locale: lang === "tr" ? "tr_TR" : "en_US",
      type: "website",
      // Referenced explicitly: app/opengraph-image.tsx sits in the root
      // segment while every page renders from app/[lang], so the file
      // convention never attaches it on its own. A root-level path also
      // dodges the /tr → / redirect that a locale-scoped image would hit.
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: site.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.description,
      images: [OG_IMAGE],
    },
    robots: { index: true, follow: true },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon-48.png", type: "image/png", sizes: "48x48" },
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
        { url: "/icon.png", type: "image/png", sizes: "512x512" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: ["/favicon.ico"],
    },
    verification: {
      google: "ritwe6f3XsnpHr7JNveLqu_-yCIRypKoDU9texqIOzY",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const { site, profile } = getContent(lang);
  /**
   * Two entities, linked by @id.
   *
   * The WebSite one is what puts a name above the result in Google instead of
   * "mertceren.com". Google reads the site name from this type and falls back
   * to the bare domain when it is missing — which it was; only Person was
   * here. og:site_name already said "Mert Ceren" and was not enough on its
   * own.
   *
   * The name stays the plain one. This field is the name of the site, not a
   * headline, and Google drops values that read as a tagline; the role
   * already appears on the line below, which comes from <title>.
   *
   * No alternateName. Google says it leans on that field whenever it is not
   * confident about the name, and the wordmark — "mertceren" — is the domain
   * with the dot taken out. Offering it hands Google the very string the name
   * is meant to replace.
   *
   * Root locale only. Site names are a domain-root feature: Google does not
   * support them for subdirectories, so the copy of this entity that /en was
   * publishing could not win the name, and a second home page claiming the
   * root URL is one of the documented reasons the whole thing gets ignored.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      ...(lang === defaultLocale
        ? [
            {
              "@type": "WebSite",
              "@id": `${site.url}#website`,
              "name": profile.name,
              "url": site.url,
              "inLanguage": lang,
              "publisher": { "@id": `${site.url}#person` },
            },
          ]
        : []),
      {
        "@type": "Person",
        "@id": `${site.url}#person`,
        "name": profile.name,
        "jobTitle": profile.role,
        "description": site.description,
        "url": site.url,
        "alumniOf": {
          "@type": "EducationalOrganization",
          "name": "Bandırma Onyedi Eylül Üniversitesi",
        },
        "sameAs": [
          "https://github.com/mertcerendev",
          "https://www.linkedin.com/in/mert-ceren-1a7b10297",
        ],
      },
    ],
  };

  return (
    <html
      lang={lang}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${syne.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Runs before the body paints: the opening overlay is part of the
            server HTML now, so a second visit in the same tab has to be told
            to skip it here rather than after hydration. data-cfasync keeps
            Cloudflare's Rocket Loader from deferring it along with the
            bundle, which would defeat the point. */}
        <script
          data-cfasync="false"
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("intro-seen"))document.documentElement.dataset.introSeen="1"}catch(e){}`,
          }}
        />
      </head>
      <body>
        <LocaleProvider locale={lang}>
          <ThemeProvider>
            {/* First element in the body so it is parsed — and painted — before
                the page behind it, which incremental rendering would otherwise
                show first. */}
            <Preloader />
            <SmoothScroll>
              {children}
              <ScrollProgress />
              <AiAssistant />
              {/* Under the grain: the grain is the film, this is the lens. */}
              <ScrollChroma />
              <GrainOverlay />
              <Cursor />
              <IdleMode />
              <ContextMenu />
            </SmoothScroll>
          </ThemeProvider>
        </LocaleProvider>
        {/* Cookieless page counts. In production the script and its beacons
            are first-party — /_vercel/insights/* on this same host — so the
            existing 'self' CSP already covers them and nothing had to be
            opened up.

            Left out of development entirely: there the package reaches for
            va.vercel-scripts.com instead, which this CSP blocks, and the
            only result was four console errors on every page load. Local
            page views are not data anyone wants counted either way. */}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
