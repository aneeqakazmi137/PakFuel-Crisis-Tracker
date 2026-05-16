export interface FuelPrices {
  petrol: number;
  diesel: number;
  lightDiesel: number;
  kerosene: number;
  lastUpdated: string;
  source: string;
}

export interface CrisisSummary {
  headline: string;
  summary: string;
  keyPoints: string[];
  impactLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  newsSources: { title: string; url: string }[];
}

export interface NewsArticle {
  title: string;
  excerpt: string;
  source: string;
  url: string;
  date: string;
  category: 'Government' | 'News' | 'Market';
}

export interface HistoricalPrice {
  period: string;
  petrol: number;
  diesel: number;
}

export interface FuelDataResponse {
  prices: FuelPrices;
  crisis: CrisisSummary;
  newsFeed: NewsArticle[];
  historical: HistoricalPrice[];
}

const FALLBACK: FuelDataResponse = {
  prices: {
    petrol: 409.78,
    diesel: 409.58,
    lightDiesel: 369.72,
    kerosene: 450.15,
    lastUpdated: "May 16, 2026",
    source: "OGRA Notification"
  },
  crisis: {
    headline: "Govt Cuts Petrol by Rs 5 After Record High of Rs 414",
    summary: "Following last week's record-breaking hike to Rs 414.78, the government has provided slight relief with a Rs 5 cut effective May 16. Prices remain near historic highs driven by Iran War supply disruptions and PKR pressure.",
    keyPoints: [
      "Petrol reduced to Rs 409.78 per litre (was Rs 414.78)",
      "HSD reduced to Rs 409.58 per litre (was Rs 414.58)",
      "Prices up 62% since February 2026 (was Rs 253.17)",
      "Iran War cited as primary driver of supply disruption",
      "Next revision expected May 23, 2026"
    ],
    impactLevel: "Critical",
    newsSources: [
      { title: "Ministry of Energy (Petroleum Division)", url: "#" },
      { title: "OGRA Official Notification", url: "https://www.ogra.org.pk" }
    ]
  },
  newsFeed: [
    {
      title: "Govt Slashes Petrol Price by Rs 5 Effective May 16",
      excerpt: "The government announced a Rs 5 per litre reduction in petrol and diesel prices, bringing petrol to Rs 409.78 and diesel to Rs 409.58.",
      source: "ARY News",
      url: "https://arynews.tv",
      date: "May 16, 2026",
      category: "Government"
    },
    {
      title: "Pakistan Petrol Up 62% Since February — Iran War Impact",
      excerpt: "Official data confirms petrol has risen from Rs 253.17 in February to Rs 414.78 by May 9, a 64% surge driven by geopolitical tensions.",
      source: "ProPakistani",
      url: "https://propakistani.pk",
      date: "May 10, 2026",
      category: "Market"
    },
    {
      title: "OGRA Recommends Weekly Price Reviews Amid Volatility",
      excerpt: "With prices swinging Rs 20-30 per litre weekly, OGRA has proposed moving from fortnightly to weekly reviews.",
      source: "Business Recorder",
      url: "https://brecorder.com",
      date: "May 12, 2026",
      category: "Government"
    },
    {
      title: "Transport Fares Surge 40% Across Pakistan as Diesel Hits Rs 414",
      excerpt: "Inter-city bus fares and goods transport charges have jumped 35-40% since March as diesel prices crossed Rs 400.",
      source: "Geo News",
      url: "https://geo.tv",
      date: "May 11, 2026",
      category: "News"
    },
    {
      title: "IMF Backs No Fuel Subsidy Policy Despite Record Prices",
      excerpt: "The IMF has reaffirmed its position against fuel subsidies in Pakistan as part of the ongoing Extended Fund Facility conditions.",
      source: "Dawn",
      url: "https://dawn.com",
      date: "May 13, 2026",
      category: "Market"
    }
  ],
  historical: [
    { period: "Feb",    petrol: 253.17, diesel: 257.08 },
    { period: "Mar",    petrol: 321.17, diesel: 335.86 },
    { period: "Apr 1",  petrol: 366.58, diesel: 353.43 },
    { period: "Apr 25", petrol: 393.35, diesel: 380.19 },
    { period: "May 9",  petrol: 414.78, diesel: 414.58 },
    { period: "May 16", petrol: 409.78, diesel: 409.58 }
  ]
};

export async function fetchFuelCrisisData(): Promise<FuelDataResponse> {
  try {
    const response = await fetch('/api/fuel');
    if (!response.ok) throw new Error('API call failed');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching fuel data:", error);
    return FALLBACK;
  }
}

export async function fetchLatestFuelData(): Promise<{ prices: FuelPrices; crisis: CrisisSummary }> {
  const full = await fetchFuelCrisisData();
  return { prices: full.prices, crisis: full.crisis };
}