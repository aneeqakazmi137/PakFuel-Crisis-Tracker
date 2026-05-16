# PakFuel Crisis Tracker

A real-time fuel price monitoring web application for Pakistan, built with React and powered by the Gemini AI API.

Live at: https://pakfuel-crisis-tracker.vercel.app

---

## What It Does

PakFuel Crisis Tracker displays current official fuel prices in Pakistan, recent news about the fuel crisis, historical price trends, and a trip cost calculator. The data is fetched and formatted using Google Gemini AI, which searches the web for the latest OGRA and Ministry of Energy notifications.

---

## Features

- Live fuel prices for Petrol, Diesel, Kerosene, and Light Diesel Oil
- Crisis feed with recent news articles about Pakistan fuel situation
- 6-month price history chart showing the trend from February to May 2026
- Trip cost calculator with vehicle type selection and mileage input
- Monthly impact stats showing extra spending due to price hikes
- Strategic analysis report with stability projections and risk factors

---

## Tech Stack

- React with TypeScript
- Vite
- Tailwind CSS
- Framer Motion for animations
- Recharts for the price history chart
- Google Gemini AI API for data fetching and formatting
- Vercel for deployment and serverless backend

---

## AI Module

The app uses the Gemini API through a Vercel serverless function located at api/fuel.ts. This function makes two calls to Gemini. The first call uses Gemini's Google Search tool to find the latest official fuel prices from OGRA. The second call formats that raw data into structured JSON including prices, news articles, crisis summary, and historical data. The API key is stored securely as a server-side environment variable and is never exposed to the browser.

---

## Project Structure

```
pakfuel-crisis-tracker/
  api/
    fuel.ts
  src/
    services/
      geminiService.ts
    App.tsx
    main.tsx
  index.html
  vite.config.ts
```

---

## Setup and Run Locally

1. Clone the repository

```
git clone https://github.com/aneeqakazmi137/PakFuel-Crisis-Tracker.git
cd PakFuel-Crisis-Tracker
```

2. Install dependencies

```
npm install
```

3. Create a .env file in the root folder and add your Gemini API key

```
VITE_GEMINI_API_KEY=your_key_here
```

Get a free API key at https://aistudio.google.com/apikey

4. Run the development server

```
npm run dev
```

---

## Data Sources

All fuel prices are sourced from official OGRA and Ministry of Energy (Petroleum Division) notifications. The AI formats and presents this data but does not generate or fabricate price values.
