export type StateCategory =
  | "no-income-tax"
  | "flat-tax"
  | "progressive"
  | "special"

export interface USState {
  code: string
  name: string
  category: StateCategory
  defaultRate: number
}

export const usStates: USState[] = [
  // No State Income Tax
  { code: "AK", name: "Alaska", category: "no-income-tax", defaultRate: 0 },
  { code: "FL", name: "Florida", category: "no-income-tax", defaultRate: 0 },
  { code: "NV", name: "Nevada", category: "no-income-tax", defaultRate: 0 },
  { code: "SD", name: "South Dakota", category: "no-income-tax", defaultRate: 0 },
  { code: "TN", name: "Tennessee", category: "no-income-tax", defaultRate: 0 },
  { code: "TX", name: "Texas", category: "no-income-tax", defaultRate: 0 },
  { code: "WY", name: "Wyoming", category: "no-income-tax", defaultRate: 0 },

  // Flat Tax States
  { code: "AZ", name: "Arizona", category: "flat-tax", defaultRate: 2.5 },
  { code: "CO", name: "Colorado", category: "flat-tax", defaultRate: 4.4 },
  { code: "ID", name: "Idaho", category: "flat-tax", defaultRate: 5.8 },
  { code: "IL", name: "Illinois", category: "flat-tax", defaultRate: 4.95 },
  { code: "IN", name: "Indiana", category: "flat-tax", defaultRate: 3.05 },
  { code: "KY", name: "Kentucky", category: "flat-tax", defaultRate: 4.5 },
  { code: "MA", name: "Massachusetts", category: "flat-tax", defaultRate: 5.0 },
  { code: "MI", name: "Michigan", category: "flat-tax", defaultRate: 4.25 },
  { code: "MS", name: "Mississippi", category: "flat-tax", defaultRate: 5.0 },
  { code: "NC", name: "North Carolina", category: "flat-tax", defaultRate: 4.5 },
  { code: "NH", name: "New Hampshire", category: "flat-tax", defaultRate: 0 },
  { code: "OH", name: "Ohio", category: "flat-tax", defaultRate: 3.99 },
  { code: "PA", name: "Pennsylvania", category: "flat-tax", defaultRate: 3.07 },
  { code: "UT", name: "Utah", category: "flat-tax", defaultRate: 4.55 },

  // Special Cases
  { code: "WA", name: "Washington", category: "special", defaultRate: 0 },

  // Progressive Tax States
  { code: "AL", name: "Alabama", category: "progressive", defaultRate: 5.0 },
  { code: "AR", name: "Arkansas", category: "progressive", defaultRate: 4.4 },
  { code: "CA", name: "California", category: "progressive", defaultRate: 13.3 },
  { code: "CT", name: "Connecticut", category: "progressive", defaultRate: 6.99 },
  { code: "DC", name: "District of Columbia", category: "progressive", defaultRate: 10.75 },
  { code: "DE", name: "Delaware", category: "progressive", defaultRate: 6.6 },
  { code: "GA", name: "Georgia", category: "progressive", defaultRate: 5.49 },
  { code: "HI", name: "Hawaii", category: "progressive", defaultRate: 11.0 },
  { code: "IA", name: "Iowa", category: "progressive", defaultRate: 6.0 },
  { code: "KS", name: "Kansas", category: "progressive", defaultRate: 5.7 },
  { code: "LA", name: "Louisiana", category: "progressive", defaultRate: 4.25 },
  { code: "ME", name: "Maine", category: "progressive", defaultRate: 7.15 },
  { code: "MD", name: "Maryland", category: "progressive", defaultRate: 5.75 },
  { code: "MN", name: "Minnesota", category: "progressive", defaultRate: 9.85 },
  { code: "MO", name: "Missouri", category: "progressive", defaultRate: 4.95 },
  { code: "MT", name: "Montana", category: "progressive", defaultRate: 6.75 },
  { code: "ND", name: "North Dakota", category: "progressive", defaultRate: 2.5 },
  { code: "NE", name: "Nebraska", category: "progressive", defaultRate: 6.64 },
  { code: "NJ", name: "New Jersey", category: "progressive", defaultRate: 10.75 },
  { code: "NM", name: "New Mexico", category: "progressive", defaultRate: 5.9 },
  { code: "NY", name: "New York", category: "progressive", defaultRate: 10.9 },
  { code: "OK", name: "Oklahoma", category: "progressive", defaultRate: 4.75 },
  { code: "OR", name: "Oregon", category: "progressive", defaultRate: 9.9 },
  { code: "RI", name: "Rhode Island", category: "progressive", defaultRate: 5.99 },
  { code: "SC", name: "South Carolina", category: "progressive", defaultRate: 6.4 },
  { code: "VT", name: "Vermont", category: "progressive", defaultRate: 8.75 },
  { code: "VA", name: "Virginia", category: "progressive", defaultRate: 5.75 },
  { code: "WV", name: "West Virginia", category: "progressive", defaultRate: 5.12 },
  { code: "WI", name: "Wisconsin", category: "progressive", defaultRate: 7.65 },
]

export function getStateByCode(code: string): USState | undefined {
  return usStates.find((s) => s.code === code)
}

export function getStatesByCategory(category: StateCategory): USState[] {
  return usStates.filter((s) => s.category === category)
}
