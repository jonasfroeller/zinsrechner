"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  TooltipProps,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { useCalculator, YearlyData } from "@/hooks/use-calculator"
import { readUrlParam, readUrlStringParam, useUrlState } from "@/hooks/use-url-state"
import React, { ReactNode } from "react"

interface ChartDataItem extends YearlyData {
  contributionsDisplay: number
  netInterestDisplay: number
}

type ValueType = number
type NameType = string

function getTickInterval(totalYears: number): number {
  if (totalYears <= 10) return 1
  if (totalYears <= 20) return 2
  if (totalYears <= 50) return 5
  if (totalYears <= 100) return 10
  return 20
}

function formatCompact(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value)
}

export default function ZinsRechner() {
  const { t, formatCurrency, locale } = useTranslation()

  // Initialize with defaults, then read URL in useEffect
  const [initialCapital, setInitialCapital] = useState(10000)
  const [monthlyContribution, setMonthlyContribution] = useState(250)
  const [years, setYears] = useState(30)
  const [interestRate, setInterestRate] = useState(8.6)
  const [annualContributionIncrease, setAnnualContributionIncrease] = useState(0)
  const [compoundFrequency, setCompoundFrequency] = useState<"monthly" | "quarterly" | "annually">("annually")
  const [inflationRate, setInflationRate] = useState(0)
  const [taxJurisdiction, setTaxJurisdiction] = useState<"germany" | "austria" | "custom">("germany")
  const [taxRate, setTaxRate] = useState(26.375)
  const [taxAllowance, setTaxAllowance] = useState(1000)
  const [annualBonus, setAnnualBonus] = useState(0)
  const [activeChart, setActiveChart] = useState<string>("bar")
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleJurisdictionChange = (value: "germany" | "austria" | "custom") => {
    setTaxJurisdiction(value)
    if (value === "germany") {
      setTaxRate(26.375)
      setTaxAllowance(1000)
    } else if (value === "austria") {
      setTaxRate(25)
      setTaxAllowance(1000)
    }
  }

  // Read URL params once on mount
  useEffect(() => {
    setInitialCapital(readUrlParam("ic", 10000))
    setMonthlyContribution(readUrlParam("mc", 250))
    setYears(readUrlParam("y", 30))
    setInterestRate(readUrlParam("r", 8.6))
    setAnnualContributionIncrease(readUrlParam("ai", 0))
    setCompoundFrequency(readUrlStringParam("cf", "annually") as "monthly" | "quarterly" | "annually")
    setInflationRate(readUrlParam("ir", 0))
    const tj = readUrlStringParam("tj", "germany")
    setTaxJurisdiction(tj === "austria" || tj === "custom" ? tj : "germany")
    setTaxRate(readUrlParam("tr", 26.375))
    setTaxAllowance(readUrlParam("ta", 1000))
    setAnnualBonus(readUrlParam("ab", 0))
  }, [])

  // Sync state to URL
  useUrlState({
    ic: initialCapital,
    mc: monthlyContribution,
    y: years,
    r: interestRate,
    ai: annualContributionIncrease,
    cf: compoundFrequency,
    ir: inflationRate,
    tj: taxJurisdiction,
    tr: taxRate,
    ta: taxAllowance,
    ab: annualBonus,
  })

  const rawData = useCalculator({
    initialCapital,
    monthlyContribution,
    years,
    interestRate,
    annualContributionIncrease,
    compoundFrequency,
    inflationRate,
    taxRate,
    taxAllowance,
    annualBonus,
  })

  // Prepend year 0 for line/area charts
  const chartData: ChartDataItem[] = useMemo(() => {
    const year0: ChartDataItem = {
      year: 0,
      totalAmount: initialCapital,
      realTotalAmount: initialCapital,
      totalContributions: initialCapital,
      totalGrossInterest: 0,
      totalTax: 0,
      totalNetInterest: 0,
      yearGrossInterest: 0,
      yearTax: 0,
      yearNetInterest: 0,
      yearContributions: 0,
      contributionsDisplay: initialCapital,
      netInterestDisplay: 0,
    }
    return [
      year0,
      ...rawData.map((d) => ({
        ...d,
        contributionsDisplay: d.totalContributions,
        netInterestDisplay: d.totalNetInterest,
      })),
    ]
  }, [rawData, initialCapital])

  const summary = useMemo(() => {
    if (rawData.length === 0) return ""
    const final = rawData[rawData.length - 1]

    let text = t("summary.base", {
      monthly: formatCurrency(monthlyContribution),
      rate: interestRate,
      years,
    })

    if (initialCapital > 0) {
      text += t("summary.withInitial", { initial: formatCurrency(initialCapital) })
    }

    if (annualContributionIncrease > 0) {
      text += t("summary.withIncrease", { increase: annualContributionIncrease })
    }

    if (annualBonus > 0) {
      text += t("summary.withBonus", { bonus: formatCurrency(annualBonus) })
    }

    if (taxRate > 0) {
      text += " " + t("summary.resultNet", { final: formatCurrency(final.totalAmount) })
      text += " " + t("summary.breakdownNet", {
        contributions: formatCurrency(final.totalContributions),
        grossInterest: formatCurrency(final.totalGrossInterest),
        tax: formatCurrency(final.totalTax),
        netInterest: formatCurrency(final.totalNetInterest),
      })
    } else {
      text += " " + t("summary.result", { final: formatCurrency(final.totalAmount) })
      text += " " + t("summary.breakdown", {
        contributions: formatCurrency(final.totalContributions),
        interest: formatCurrency(final.totalNetInterest),
      })
    }

    if (inflationRate > 0) {
      text += " " + t("summary.realValue", {
        inflation: inflationRate,
        real: formatCurrency(final.realTotalAmount),
      })
    }

    if (taxRate > 0) {
      if (taxJurisdiction === "germany") {
        text += " " + t("summary.taxNoteGermany", { allowance: formatCurrency(taxAllowance) })
      } else if (taxJurisdiction === "austria") {
        text += " " + t("summary.taxNoteAustria", { allowance: formatCurrency(taxAllowance) })
      } else {
        text += " " + t("summary.taxNote", { allowance: formatCurrency(taxAllowance) })
      }
    }

    return text
  }, [rawData, t, formatCurrency, monthlyContribution, interestRate, years, initialCapital, annualContributionIncrease, annualBonus, taxRate, inflationRate, taxAllowance, taxJurisdiction])

  const CustomBarTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>): ReactNode => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataItem
      return (
        <div className="bg-background p-3 border rounded shadow-lg text-xs">
          <p className="font-medium mb-1">{t("tooltip.year", { year: data.year })}</p>
          <div className="flex items-center mt-1">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
            <p>{t("tooltip.contributions", { value: formatCurrency(data.totalContributions) })}</p>
          </div>
          <div className="flex items-center mt-1">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
            <p>{t("tooltip.netInterest", { value: formatCurrency(data.totalNetInterest) })}</p>
          </div>
          {taxRate > 0 && (
            <div className="flex items-center mt-1">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
              <p>{t("tooltip.tax", { value: formatCurrency(data.totalTax) })}</p>
            </div>
          )}
          <p className="mt-1 font-medium">{t("tooltip.total", { value: formatCurrency(data.totalAmount) })}</p>
        </div>
      )
    }
    return null
  }

  const CustomLineTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>): ReactNode => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataItem
      return (
        <div className="bg-background p-3 border rounded shadow-lg text-xs">
          <p className="font-medium mb-1">{t("tooltip.year", { year: data.year })}</p>
          <div className="flex items-center mt-1">
            <div className="w-3 h-3 rounded-full bg-teal-500 mr-2" />
            <p>{t("tooltip.total", { value: formatCurrency(data.totalAmount) })}</p>
          </div>
          <div className="flex items-center mt-1">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
            <p>{t("tooltip.contributions", { value: formatCurrency(data.totalContributions) })}</p>
          </div>
          {taxRate > 0 && (
            <>
              <div className="flex items-center mt-1">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
                <p>{t("tooltip.grossInterest", { value: formatCurrency(data.totalGrossInterest) })}</p>
              </div>
              <div className="flex items-center mt-1">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                <p>{t("tooltip.tax", { value: formatCurrency(data.totalTax) })}</p>
              </div>
            </>
          )}
          {inflationRate > 0 && (
            <div className="flex items-center mt-1">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
              <p>{t("tooltip.realTotal", { value: formatCurrency(data.realTotalAmount) })}</p>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  const donutData = useMemo(() => {
    if (rawData.length === 0) return []
    const final = rawData[rawData.length - 1]
    return [
      { name: t("donut.yourDeposits"), value: final.totalContributions, color: "hsl(214, 100%, 60%)" },
      { name: t("donut.netInterest"), value: final.totalNetInterest, color: "hsl(165, 60%, 40%)" },
      ...(taxRate > 0 ? [{ name: t("donut.taxPaid"), value: final.totalTax, color: "hsl(0, 84%, 60%)" }] : []),
    ].filter((d) => d.value > 0)
  }, [rawData, t, taxRate])

  const DonutTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>): ReactNode => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-background p-3 border rounded shadow-lg text-xs">
          <p className="font-medium">{data.name}</p>
          <p>{formatCurrency(Number(data.value))}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>{t("app.title")}</CardTitle>
          <CardDescription>{t("app.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Inputs */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="initialCapital">{t("inputs.initialCapital")}</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="initialCapital"
                    type="number"
                    min={0}
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(Math.max(0, Number(e.target.value)))}
                  />
                  <span className="text-sm">{t("inputs.currency")}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyContribution">{t("inputs.monthlyContribution")}</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="monthlyContribution"
                    type="number"
                    min={0}
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Math.max(0, Number(e.target.value)))}
                  />
                  <span className="text-sm">{t("inputs.currency")}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="years">{t("inputs.yearsValue", { years })}</Label>
                <Slider
                  id="years"
                  min={1}
                  max={122}
                  step={1}
                  value={[years]}
                  onValueChange={(value) => setYears(value[0])}
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interestRate">{t("inputs.interestRate")}</Label>
                <div className="flex items-center space-x-2 mb-2">
                  <Input
                    id="interestRate"
                    type="number"
                    min={0}
                    max={100}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Math.max(0, Math.min(100, Number(e.target.value))))}
                    step="0.01"
                  />
                  <span className="text-sm">{t("inputs.percent")}</span>
                </div>
                <Slider
                  id="interestRateSlider"
                  min={0}
                  max={30}
                  step={0.01}
                  value={[interestRate]}
                  onValueChange={(value) => setInterestRate(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualIncrease">{t("inputs.annualIncreaseLabel", { value: annualContributionIncrease })}</Label>
                <Slider
                  id="annualIncrease"
                  min={0}
                  max={10}
                  step={0.1}
                  value={[annualContributionIncrease]}
                  onValueChange={(value) => setAnnualContributionIncrease(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compoundFrequency">{t("inputs.compoundFrequency")}</Label>
                <Select
                  value={compoundFrequency}
                  onValueChange={(value) => setCompoundFrequency(value as "monthly" | "quarterly" | "annually")}
                >
                  <SelectTrigger id="compoundFrequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{t("inputs.compoundMonthly")}</SelectItem>
                    <SelectItem value="quarterly">{t("inputs.compoundQuarterly")}</SelectItem>
                    <SelectItem value="annually">{t("inputs.compoundAnnually")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{showAdvanced ? t("inputs.advancedOpen") : t("inputs.advancedClosed")}</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 grid gap-6 md:grid-cols-2 border rounded-lg p-4 bg-muted/30">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inflationRate">{t("inputs.inflationLabel", { value: inflationRate })}</Label>
                    <Slider
                      id="inflationRate"
                      min={0}
                      max={10}
                      step={0.1}
                      value={[inflationRate]}
                      onValueChange={(value) => setInflationRate(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annualBonus">{t("inputs.annualBonus")}</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="annualBonus"
                        type="number"
                        min={0}
                        value={annualBonus}
                        onChange={(e) => setAnnualBonus(Math.max(0, Number(e.target.value)))}
                      />
                      <span className="text-sm">{t("inputs.currency")}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxJurisdiction">{t("inputs.taxJurisdiction")}</Label>
                    <Select
                      value={taxJurisdiction}
                      onValueChange={(value) => handleJurisdictionChange(value as "germany" | "austria" | "custom")}
                    >
                      <SelectTrigger id="taxJurisdiction">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="germany">{t("inputs.taxJurisdictionGermany")}</SelectItem>
                        <SelectItem value="austria">{t("inputs.taxJurisdictionAustria")}</SelectItem>
                        <SelectItem value="custom">{t("inputs.taxJurisdictionCustom")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxRate">{t("inputs.taxRate")}</Label>
                    <div className="flex items-center space-x-2 mb-2">
                      <Input
                        id="taxRate"
                        type="number"
                        min={0}
                        max={100}
                        value={taxRate}
                        onChange={(e) => setTaxRate(Math.max(0, Math.min(100, Number(e.target.value))))}
                        step="0.001"
                      />
                      <span className="text-sm">{t("inputs.percent")}</span>
                    </div>
                    <Slider
                      id="taxRateSlider"
                      min={0}
                      max={50}
                      step={0.1}
                      value={[taxRate]}
                      onValueChange={(value) => setTaxRate(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxAllowance">{t("inputs.taxAllowance")}</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="taxAllowance"
                        type="number"
                        min={0}
                        value={taxAllowance}
                        onChange={(e) => setTaxAllowance(Math.max(0, Number(e.target.value)))}
                      />
                      <span className="text-sm">{t("inputs.currency")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm md:text-base leading-relaxed">{summary}</p>
          </div>

          {/* Charts */}
          <div>
            <h3 className="text-lg font-medium mb-4">{t("charts.bar")}</h3>

            <Tabs defaultValue="bar" className="w-full" onValueChange={setActiveChart}>
              <div className="flex items-center mb-2 flex-wrap gap-4">
                {activeChart === "bar" ? (
                  <>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
                      <span className="text-sm">{t("charts.legend.netInterest")}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                      <span className="text-sm">{t("charts.legend.contributions")}</span>
                    </div>
                  </>
                ) : activeChart === "line" || activeChart === "area" ? (
                  <>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-teal-500 mr-2" />
                      <span className="text-sm">{t("charts.legend.totalCapital")}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                      <span className="text-sm">{t("charts.legend.contributions")}</span>
                    </div>
                    {inflationRate > 0 && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
                        <span className="text-sm">{t("charts.legend.realTotalCapital")}</span>
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              <TabsList className="mb-4 flex-wrap">
                <TabsTrigger value="bar">{t("charts.bar")}</TabsTrigger>
                <TabsTrigger value="line">{t("charts.line")}</TabsTrigger>
                <TabsTrigger value="area">{t("charts.area")}</TabsTrigger>
                <TabsTrigger value="breakdown">{t("charts.breakdown")}</TabsTrigger>
                <TabsTrigger value="table">{t("charts.table")}</TabsTrigger>
              </TabsList>

              <TabsContent value="bar" className="w-full overflow-hidden">
                <ChartContainer
                  config={{
                    netInterestDisplay: {
                      label: t("charts.legend.netInterest"),
                      color: "hsl(24, 100%, 60%)",
                    },
                    contributionsDisplay: {
                      label: t("charts.legend.contributions"),
                      color: "hsl(214, 100%, 60%)",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData.filter((item) => item.year > 0)}
                      margin={{ top: 20, right: 10, left: 0, bottom: 30 }}
                    >
                      <XAxis
                        dataKey="year"
                        tickLine={false}
                        axisLine={false}
                        ticks={chartData
                          .filter(
                            (item) =>
                              (item.year % getTickInterval(years) === 0 && item.year > 0) || item.year === years,
                          )
                          .map((item) => item.year)}
                        height={30}
                        dy={10}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => formatCompact(value, locale)}
                        width={70}
                      />
                      <ChartTooltip content={CustomBarTooltip} />
                      <Bar dataKey="contributionsDisplay" stackId="a" fill="var(--color-contributionsDisplay)" name={t("charts.legend.contributions")} />
                      <Bar dataKey="netInterestDisplay" stackId="a" fill="var(--color-netInterestDisplay)" name={t("charts.legend.netInterest")} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </TabsContent>

              <TabsContent value="line" className="w-full overflow-hidden">
                <ChartContainer
                  config={{
                    totalAmount: {
                      label: t("charts.legend.totalCapital"),
                      color: "hsl(165, 60%, 40%)",
                    },
                    contributionsDisplay: {
                      label: t("charts.legend.contributions"),
                      color: "hsl(214, 100%, 60%)",
                    },
                    ...(inflationRate > 0 ? {
                      realTotalAmount: {
                        label: t("charts.legend.realTotalCapital"),
                        color: "hsl(270, 60%, 50%)",
                      }
                    } : {}),
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 30 }}>
                      <XAxis
                        dataKey="year"
                        tickLine={false}
                        axisLine={false}
                        ticks={chartData
                          .filter((item) => item.year % getTickInterval(years) === 0 || item.year === years)
                          .map((item) => item.year)}
                        height={30}
                        dy={10}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => formatCompact(value, locale)}
                        width={70}
                      />
                      <ChartTooltip content={CustomLineTooltip} />
                      <Line
                        type="monotone"
                        dataKey="totalAmount"
                        stroke="var(--color-totalAmount)"
                        strokeWidth={2}
                        dot={false}
                        name={t("charts.legend.totalCapital")}
                      />
                      <Line
                        type="monotone"
                        dataKey="contributionsDisplay"
                        stroke="var(--color-contributionsDisplay)"
                        strokeWidth={2}
                        dot={false}
                        name={t("charts.legend.contributions")}
                      />
                      {inflationRate > 0 && (
                        <Line
                          type="monotone"
                          dataKey="realTotalAmount"
                          stroke="var(--color-realTotalAmount)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                          name={t("charts.legend.realTotalCapital")}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </TabsContent>

              <TabsContent value="area" className="w-full overflow-hidden">
                <ChartContainer
                  config={{
                    totalAmount: {
                      label: t("charts.legend.totalCapital"),
                      color: "hsl(165, 60%, 40%)",
                    },
                    contributionsDisplay: {
                      label: t("charts.legend.contributions"),
                      color: "hsl(214, 100%, 60%)",
                    },
                    ...(inflationRate > 0 ? {
                      realTotalAmount: {
                        label: t("charts.legend.realTotalCapital"),
                        color: "hsl(270, 60%, 50%)",
                      }
                    } : {}),
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 30 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(165, 60%, 40%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(165, 60%, 40%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="year"
                        tickLine={false}
                        axisLine={false}
                        ticks={chartData
                          .filter((item) => item.year % getTickInterval(years) === 0 || item.year === years)
                          .map((item) => item.year)}
                        height={30}
                        dy={10}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => formatCompact(value, locale)}
                        width={70}
                      />
                      <ChartTooltip content={CustomLineTooltip} />
                      <Area
                        type="monotone"
                        dataKey="totalAmount"
                        stroke="var(--color-totalAmount)"
                        fill="url(#colorTotal)"
                        strokeWidth={2}
                        name={t("charts.legend.totalCapital")}
                      />
                      <Line
                        type="monotone"
                        dataKey="contributionsDisplay"
                        stroke="var(--color-contributionsDisplay)"
                        strokeWidth={2}
                        dot={false}
                        name={t("charts.legend.contributions")}
                      />
                      {inflationRate > 0 && (
                        <Line
                          type="monotone"
                          dataKey="realTotalAmount"
                          stroke="var(--color-realTotalAmount)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                          name={t("charts.legend.realTotalCapital")}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </TabsContent>

              <TabsContent value="breakdown" className="w-full overflow-hidden">
                <div className="h-[400px] flex items-center justify-center">
                  {donutData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius="60%"
                          outerRadius="80%"
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="name"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={DonutTooltip} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground">{t("app.description")}</p>
                  )}
                </div>
                <div className="flex justify-center gap-6 mt-2 flex-wrap">
                  {donutData.map((entry) => (
                    <div key={entry.name} className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm">{entry.name}: {formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="table" className="w-full overflow-hidden">
                <ScrollArea className="h-[400px] w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky top-0 bg-background z-10">{t("table.year")}</TableHead>
                        <TableHead className="sticky top-0 bg-background z-10">{t("table.yearlyContribution")}</TableHead>
                        <TableHead className="sticky top-0 bg-background z-10">{t("table.grossInterest")}</TableHead>
                        <TableHead className="sticky top-0 bg-background z-10">{t("table.tax")}</TableHead>
                        <TableHead className="sticky top-0 bg-background z-10">{t("table.netInterest")}</TableHead>
                        <TableHead className="sticky top-0 bg-background z-10">{t("table.total")}</TableHead>
                        {inflationRate > 0 && (
                          <TableHead className="sticky top-0 bg-background z-10">{t("table.realTotal")}</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rawData.map((row) => (
                        <TableRow key={row.year}>
                          <TableCell className="font-medium">{row.year}</TableCell>
                          <TableCell>{formatCurrency(row.yearContributions)}</TableCell>
                          <TableCell>{formatCurrency(row.yearGrossInterest)}</TableCell>
                          <TableCell>{taxRate > 0 ? formatCurrency(row.yearTax) : "—"}</TableCell>
                          <TableCell>{formatCurrency(row.yearNetInterest)}</TableCell>
                          <TableCell>{formatCurrency(row.totalAmount)}</TableCell>
                          {inflationRate > 0 && (
                            <TableCell>{formatCurrency(row.realTotalAmount)}</TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
