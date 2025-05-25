# Zinsrechner - Compound Interest Calculator

This is a React component that calculates and visualizes compound interest with regular monthly contributions.

## Features

-   **Initial Capital Input**: Allows users to set the starting amount of their investment.
-   **Monthly Contribution Input**: Users can specify how much they plan to contribute monthly.
-   **Investment Duration (Years)**: Users can set the number of years they plan to invest. This is implemented with a slider for easy adjustment.
-   **Interest Rate Input**: Allows users to input the expected annual interest rate.
-   **Dynamic Calculation**: The component recalculates the compound interest and updates the chart and summary whenever any of the input values change.
-   **Interactive Charts**:
    -   Displays the growth of the investment over time.
    -   Offers two chart types:
        -   **Bar Chart**: Shows the breakdown of total contributions and interest earned for each year.
        -   **Line Chart**: Illustrates the growth of total capital, total contributions, and total interest earned over the investment period.
    -   Custom tooltips provide detailed information for each data point on the chart (Year, Contributions, Interest, Total Amount).
    -   X-axis ticks are dynamically adjusted based on the total number of years for better readability.
-   **Summary Display**: Provides a textual summary of the investment outcome, including the final capital, total contributions, and total interest earned, formatted in Euros.
-   **Euro Formatting**: All monetary values are formatted according to German (de-DE) currency standards, with compact notation for large numbers (e.g., millions).

## Technical Details

-   Built with React and TypeScript.
-   Uses `recharts` for charting.
-   The compound interest calculation follows the standard formula: `FV = P(1+r)^n + PMT * [(1+r)^n - 1]/r`.
