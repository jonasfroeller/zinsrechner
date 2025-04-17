"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, TooltipProps } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React, { ReactNode } from "react"

interface ChartDataItem {
  year: number
  totalAmount: number
  contributions: number
  interest: number
}

type ValueType = number
type NameType = string

export default function ZinsRechner() {
  const [initialCapital, setInitialCapital] = useState<number>(10000)
  const [monthlyContribution, setMonthlyContribution] = useState<number>(250)
  const [years, setYears] = useState<number>(30)
  const [interestRate, setInterestRate] = useState<number>(8.6)
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [summary, setSummary] = useState<string>("")
  const [activeChart, setActiveChart] = useState<string>("bar")

  useEffect(() => {
    calculateCompoundInterest()
  }, [initialCapital, monthlyContribution, years, interestRate])

  const calculateCompoundInterest = () => {
    // Standard formula for compound interest with regular contributions
    // FV = P(1+r)^n + PMT * [(1+r)^n - 1]/r

    const r = interestRate / 100
    const annualContribution = monthlyContribution * 12
    const yearlyData: ChartDataItem[] = []

    // Calculate each year's total
    for (let year = 0; year <= years; year++) {
      // Calculate future value using the formula
      const principalWithInterest = initialCapital * Math.pow(1 + r, year)

      // For year 0, there are no contributions yet
      let contributionWithInterest = 0
      if (year > 0) {
        // When interest rate is 0, simply multiply by the number of years
        if (r === 0) {
          contributionWithInterest = annualContribution * year
        } else {
          contributionWithInterest = annualContribution * ((Math.pow(1 + r, year) - 1) / r)
        }
      }

      const totalAmount = principalWithInterest + contributionWithInterest
      const totalContributions = initialCapital + year * annualContribution
      const interestEarned = totalAmount - totalContributions

      yearlyData.push({
        year,
        totalAmount: Math.round(totalAmount),
        contributions: Math.round(totalContributions),
        interest: Math.round(interestEarned),
      })
    }

    setChartData(yearlyData)

    const finalAmount = yearlyData[years].totalAmount
    const totalContributionsAmount = initialCapital + monthlyContribution * 12 * years
    const interestEarned = finalAmount - totalContributionsAmount

    setSummary(
      `Wenn du über ${years} Jahre, monatlich ${monthlyContribution}€ zu ${interestRate}% investierst, ` +
        `kommst du am Ende auf ein Endkapital von ${formatEuro(finalAmount)}. ` +
        `Diese setzen sich zusammen aus ${formatEuro(totalContributionsAmount)} Einzahlungen ` +
        `und ${formatEuro(interestEarned)} an Zinsen oder Kapitalerträgen.`,
    )
  }

  const formatEuro = (value: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      notation: value >= 1e6 ? 'compact' : 'standard',
      compactDisplay: 'long',
      maximumFractionDigits: value >= 1e6 ? 1 : 2
    }).format(value)
  }

  // Function to determine which years to show on x-axis based on total years
  const getTickInterval = (totalYears: number): number => {
    if (totalYears <= 10) return 1
    if (totalYears <= 20) return 2
    if (totalYears <= 50) return 5
    if (totalYears <= 100) return 10
    return 20
  }

  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value)) {
      setInterestRate(value)
    }
  }

  const CustomBarTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>): ReactNode => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataItem
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">Jahr {data.year}</p>
          <div className="flex items-center mt-1">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <p>Einzahlungen: {formatEuro(data.contributions)}</p>
          </div>
          <div className="flex items-center mt-1">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
            <p>Zinsen: {formatEuro(data.interest)}</p>
          </div>
          <p className="mt-1 font-medium">Gesamt: {formatEuro(data.contributions + data.interest)}</p>
        </div>
      )
    }
    return null
  }

  const CustomLineTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>): ReactNode => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataItem
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">Jahr {data.year}</p>
          <div className="flex items-center mt-1">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <p>Einzahlungen: {formatEuro(data.contributions)}</p>
          </div>
          <div className="flex items-center mt-1">
            <div className="w-3 h-3 rounded-full bg-teal-500 mr-2"></div>
            <p>Gesamtkapital: {formatEuro(data.totalAmount)}</p>
          </div>
          <div className="flex items-center mt-1">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
            <p>Zinsen: {formatEuro(data.interest)}</p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Zinsrechner</CardTitle>
          <CardDescription>Berechne dein Vermögen mit Zinseszins und monatlichen Einzahlungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="initialCapital">Anfangskapital</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="initialCapital"
                    type="number"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(Number(e.target.value))}
                  />
                  <span className="text-sm">€</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyContribution">Monatliche Sparrate</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="monthlyContribution"
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  />
                  <span className="text-sm">€</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="years">Spardauer in Jahren: {years}</Label>
                </div>
                <Slider
                  id="years"
                  min={1}
                  max={122}
                  step={1}
                  value={[years]}
                  onValueChange={(value) => setYears(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestRate">Jährlicher Zinssatz</Label>
                <div className="flex items-center space-x-2 mb-2">
                  <Input
                    id="interestRate"
                    type="number"
                    value={interestRate}
                    onChange={handleInterestRateChange}
                    step="0.01"
                  />
                  <span className="text-sm">%</span>
                </div>
                <Slider
                  id="interestRateSlider"
                  min={0}
                  max={100}
                  step={0.01}
                  value={[interestRate]}
                  onValueChange={(value) => setInterestRate(value[0])}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm md:text-base">{summary}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Diagramm</h3>

            <Tabs defaultValue="bar" className="w-full" onValueChange={setActiveChart}>
              <div className="flex items-center mb-2">
                {activeChart === "bar" ? (
                  <>
                    <div className="flex items-center mr-4">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                      <span className="text-sm">Zinsen</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm">Einzahlungen</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center mr-4">
                      <div className="w-3 h-3 rounded-full bg-teal-500 mr-2"></div>
                      <span className="text-sm">Gesamtkapital</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm">Einzahlungen</span>
                    </div>
                  </>
                )}
              </div>

              <TabsList className="mb-4">
                <TabsTrigger value="bar">Balkendiagramm</TabsTrigger>
                <TabsTrigger value="line">Liniendiagramm</TabsTrigger>
              </TabsList>

              <TabsContent value="bar" className="w-full overflow-hidden">
                <ChartContainer
                  config={{
                    interest: {
                      label: "Zinsen",
                      color: "hsl(24, 100%, 60%)",
                    },
                    contributions: {
                      label: "Einzahlungen",
                      color: "hsl(214, 100%, 60%)",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="99%" height="100%">
                    <BarChart
                      data={chartData.filter((item) => item.year > 0)}
                      margin={{ top: 20, right: 10, left: 0, bottom: 30 }}
                      stackOffset="none"
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
                        tickFormatter={(value) => 
                          new Intl.NumberFormat('de-DE', {
                            notation: 'compact',
                            compactDisplay: 'short',
                          }).format(value)
                        }
                        width={60}
                      />
                      <ChartTooltip content={CustomBarTooltip} />
                      <Bar dataKey="contributions" stackId="a" fill="var(--color-contributions)" name="Einzahlungen" />
                      <Bar dataKey="interest" stackId="a" fill="var(--color-interest)" name="Zinsen" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </TabsContent>

              <TabsContent value="line" className="w-full overflow-hidden">
                <ChartContainer
                  config={{
                    totalAmount: {
                      label: "Gesamtkapital",
                      color: "hsl(165, 60%, 40%)",
                    },
                    contributions: {
                      label: "Einzahlungen",
                      color: "hsl(214, 100%, 60%)",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="99%" height="100%">
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
                        tickFormatter={(value) => 
                          new Intl.NumberFormat('de-DE', {
                            notation: 'compact',
                            compactDisplay: 'short',
                          }).format(value)
                        }
                        width={60}
                      />
                      <ChartTooltip content={CustomLineTooltip} />
                      <Line
                        type="monotone"
                        dataKey="totalAmount"
                        stroke="var(--color-totalAmount)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="contributions"
                        stroke="var(--color-contributions)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
