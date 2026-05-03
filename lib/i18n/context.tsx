"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

import en from "@/locales/en.json"
import de from "@/locales/de.json"

export type Locale = "en" | "de"

const dictionaries: Record<Locale, Record<string, unknown>> = {
  en,
  de,
}

function getBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "en"
  const lang = navigator.language.slice(0, 2)
  return lang === "de" ? "de" : "en"
}

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split(".")
  let current: unknown = obj
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }
  return typeof current === "string" ? current : undefined
}

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
  formatCurrency: (value: number) => string
  formatPercent: (value: number) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("zinsrechner-locale") as Locale | null
    const initial = stored && (stored === "en" || stored === "de") ? stored : getBrowserLocale()
    setLocaleState(initial)
    setMounted(true)
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("zinsrechner-locale", newLocale)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const dict = dictionaries[locale] as Record<string, unknown>
      let text = getNestedValue(dict, key) || key
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v))
        })
      }
      return text
    },
    [locale]
  )

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", options).format(value)
    },
    [locale]
  )

  const formatCurrency = useCallback(
    (value: number) => {
      return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
        style: "currency",
        currency: "EUR",
        notation: value >= 1e6 ? "compact" : "standard",
        compactDisplay: "long",
        maximumFractionDigits: value >= 1e6 ? 1 : 2,
      }).format(value)
    },
    [locale]
  )

  const formatPercent = useCallback(
    (value: number) => {
      return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value / 100)
    },
    [locale]
  )

  if (!mounted) {
    return (
      <I18nContext.Provider
        value={{
          locale: "en",
          setLocale: () => {},
          t: (key: string) => key,
          formatNumber: (n: number) => String(n),
          formatCurrency: (n: number) => String(n),
          formatPercent: (n: number) => String(n),
        }}
      >
        {children}
      </I18nContext.Provider>
    )
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, formatNumber, formatCurrency, formatPercent }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider")
  }
  return context
}
