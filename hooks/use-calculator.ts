"use client"

import { useMemo } from "react"

export interface CalculatorInputs {
  initialCapital: number
  monthlyContribution: number
  years: number
  interestRate: number
  annualContributionIncrease: number
  compoundFrequency: "monthly" | "quarterly" | "annually"
  inflationRate: number
  taxRate: number
  taxAllowance: number
  annualBonus: number
}

export interface YearlyData {
  year: number
  totalAmount: number
  realTotalAmount: number
  totalContributions: number
  totalGrossInterest: number
  totalTax: number
  totalNetInterest: number
  yearGrossInterest: number
  yearTax: number
  yearNetInterest: number
  yearContributions: number
}

export function useCalculator(inputs: CalculatorInputs): YearlyData[] {
  return useMemo(() => {
    const {
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
    } = inputs

    const r = interestRate / 100
    const inflation = inflationRate / 100
    const tax = taxRate / 100
    const increase = annualContributionIncrease / 100

    const stepsPerYear =
      compoundFrequency === "monthly" ? 12 : compoundFrequency === "quarterly" ? 4 : 1
    const monthsPerStep = 12 / stepsPerYear

    const data: YearlyData[] = []
    let capital = initialCapital
    let currentMonthlyContribution = monthlyContribution
    let cumulativeContributions = initialCapital
    let cumulativeGrossInterest = 0
    let cumulativeTax = 0
    let cumulativeNetInterest = 0

    for (let year = 1; year <= years; year++) {
      let yearGrossInterest = 0
      let yearTax = 0
      let yearNetInterest = 0
      let yearContributions = 0
      let remainingAllowance = taxAllowance

      for (let step = 1; step <= stepsPerYear; step++) {
        // Add monthly contributions for this step
        const stepContribution = currentMonthlyContribution * monthsPerStep
        capital += stepContribution
        yearContributions += stepContribution

        // Add annual bonus at the end of the year (last step)
        if (step === stepsPerYear && annualBonus > 0) {
          capital += annualBonus
          yearContributions += annualBonus
        }

        // Calculate interest for this step
        const stepRate = r / stepsPerYear
        const interest = capital * stepRate
        yearGrossInterest += interest

        // Apply tax year-by-year with strict allowance
        const allowanceUsed = Math.min(interest, remainingAllowance)
        remainingAllowance -= allowanceUsed
        const taxableInterest = interest - allowanceUsed
        const stepTax = taxableInterest * tax
        yearTax += stepTax

        const netInterest = interest - stepTax
        yearNetInterest += netInterest
        capital += netInterest
      }

      cumulativeContributions += yearContributions
      cumulativeGrossInterest += yearGrossInterest
      cumulativeTax += yearTax
      cumulativeNetInterest += yearNetInterest

      // Real value = nominal discounted by inflation
      const realTotalAmount = capital / Math.pow(1 + inflation, year)

      data.push({
        year,
        totalAmount: capital,
        realTotalAmount,
        totalContributions: cumulativeContributions,
        totalGrossInterest: cumulativeGrossInterest,
        totalTax: cumulativeTax,
        totalNetInterest: cumulativeNetInterest,
        yearGrossInterest,
        yearTax,
        yearNetInterest,
        yearContributions,
      })

      // Increase monthly contribution for next year
      currentMonthlyContribution *= 1 + increase
    }

    return data
  }, [
    inputs.initialCapital,
    inputs.monthlyContribution,
    inputs.years,
    inputs.interestRate,
    inputs.annualContributionIncrease,
    inputs.compoundFrequency,
    inputs.inflationRate,
    inputs.taxRate,
    inputs.taxAllowance,
    inputs.annualBonus,
  ])
}
