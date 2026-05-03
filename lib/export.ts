"use client"

import { YearlyData } from "@/hooks/use-calculator"

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function downloadJSON(data: YearlyData[], filename: string) {
  const json = JSON.stringify(data, null, 2)
  triggerDownload(json, filename, "application/json")
}

export function downloadCSV(
  data: YearlyData[],
  locale: string,
  filename: string,
  headers: string[],
) {
  const isGerman = locale === "de"
  const delimiter = isGerman ? ";" : ","
  const numberFormat = new Intl.NumberFormat(isGerman ? "de-DE" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const formatValue = (value: number) => {
    const formatted = numberFormat.format(value)
    if (!isGerman) {
      return formatted.replace(/,/g, "")
    }
    return formatted
  }

  const rows = data.map((row) => [
    row.year,
    formatValue(row.yearContributions),
    formatValue(row.yearGrossInterest),
    formatValue(row.yearTax),
    formatValue(row.yearNetInterest),
    formatValue(row.totalAmount),
    formatValue(row.realTotalAmount),
  ])

  const realTotalIndex = headers.findIndex((h) =>
    h.toLowerCase().includes("real") || h.toLowerCase().includes("real"),
  )
  const hasRealTotal = realTotalIndex !== -1

  const filteredRows = rows.map((row) => {
    if (!hasRealTotal) {
      return row.slice(0, -1)
    }
    return row
  })

  const csvContent = [headers.join(delimiter), ...filteredRows.map((row) => row.join(delimiter))].join("\n")

  triggerDownload(csvContent, filename, "text/csv;charset=utf-8;")
}
