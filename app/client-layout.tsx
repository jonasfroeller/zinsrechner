"use client"

import { useEffect } from "react"
import { I18nProvider, useTranslation } from "@/lib/i18n/context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function Header() {
  const { t, locale, setLocale } = useTranslation()

  return (
    <header className="bg-gray-800 text-white p-4 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="text-xl font-semibold">{t("header.title")}</div>
        <div className="flex items-center space-x-4">
          <Select value={locale} onValueChange={(value) => setLocale(value as "en" | "de")}>
            <SelectTrigger className="w-[130px] bg-gray-700 border-gray-600 text-white focus:ring-gray-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t("language.en")}</SelectItem>
              <SelectItem value="de">{t("language.de")}</SelectItem>
            </SelectContent>
          </Select>
          <a
            href="https://github.com/jonasfroeller/zinsrechner"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-300 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M12 0C5.36 0 0 5.5 0 12.3c0 5.44 3.44 10 8.21 11.7c.597.122.815-.265.815-.59c0-.285-.02-1.26-.02-2.28c-3.34.734-4.04-1.47-4.04-1.47c-.537-1.43-1.33-1.79-1.33-1.79c-1.09-.754.08-.754.08-.754c1.21.082 1.85 1.26 1.85 1.26c1.07 1.87 2.8 1.34 3.5 1.02c.1-.794.418-1.34.756-1.65c-2.66-.285-5.47-1.34-5.47-6.07c0-1.34.477-2.44 1.23-3.3c-.12-.306-.537-1.57.119-3.26c0 0 1.01-.326 3.3 1.26c.979-.269 1.99-.406 3-.407s2.05.143 3 .407c2.29-1.59 3.3-1.26 3.3-1.26c.656 1.69.238 2.95.119 3.26c.776.855 1.23 1.96 1.23 3.3c0 4.73-2.8 5.76-5.49 6.07c.438.387.815 1.12.815 2.28c0 1.65-.02 2.97-.02 3.38c0 .326.22.713.815.591c4.77-1.63 8.21-6.23 8.21-11.7c.02-6.8-5.37-12.3-12-12.3z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-gray-100 text-gray-700 p-4 text-center text-sm">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <img
            src="https://avatars.githubusercontent.com/u/121523551?v=4"
            alt="Jonas Fröller"
            className="w-6 h-6 rounded-full"
          />
          <span>
            {t("footer.madeBy")}{" "}
            <a
              href="https://jonasfroeller.is-a.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Jonas Fröller
            </a>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <img src="https://merginit.com/favicon.png" alt="Imprint" className="w-6 h-6" />
          <a
            href="https://merginit.com/legal/imprint"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {t("footer.imprint")}
          </a>
        </div>
      </div>
    </footer>
  )
}

function HtmlLangUpdater() {
  const { locale } = useTranslation()

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return null
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <HtmlLangUpdater />
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </I18nProvider>
  )
}
