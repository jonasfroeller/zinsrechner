"use client"

import { useCallback, useEffect, useRef } from "react"

export interface UrlParams {
  [key: string]: string | number | undefined
}

export function useUrlState(params: UrlParams) {
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== 0) {
        searchParams.set(key, String(value))
      }
    })

    const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
    window.history.replaceState({}, "", newUrl)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)])
}

export function readUrlParam(key: string, defaultValue: number): number {
  if (typeof window === "undefined") return defaultValue
  const searchParams = new URLSearchParams(window.location.search)
  const value = searchParams.get(key)
  if (value === null) return defaultValue
  const parsed = parseFloat(value)
  return isNaN(parsed) ? defaultValue : parsed
}

export function readUrlStringParam(key: string, defaultValue: string): string {
  if (typeof window === "undefined") return defaultValue
  const searchParams = new URLSearchParams(window.location.search)
  const value = searchParams.get(key)
  return value === null ? defaultValue : value
}
