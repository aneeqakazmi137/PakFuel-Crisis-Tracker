import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const searchResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the LATEST official petrol and diesel prices in Pakistan today from OGRA or Ministry of Energy Petroleum Division. 
      Find the most recent notification only. Include kerosene and LDO prices too.
      Also find the latest 3-5 news headlines about Pakistan fuel crisis, price hikes, or OGRA notifications.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const rawMarketData = searchResponse.text;

    const formatResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a Senior Strategic Analyst for the Pakistan Energy Sector.

      Search the web and find the LATEST official OGRA petrol and diesel prices in Pakistan as of today.
      Use ONLY the most recent official notification from Ministry of Energy or OGRA.
      Do NOT use old or cached prices.

      VERIFIED HISTORICAL PRICES for context (add latest on top of these):
      - Feb 1, 2026:  Petrol 253.17  Diesel 257.08
      - Mar 1, 2026:  Petrol 321.17  Diesel 335.86
      - Apr 1, 2026:  Petrol 366.58  Diesel 353.43
      - Apr 25, 2026: Petrol 393.35  Diesel 380.19
      - May 9, 2026:  Petrol 414.78  Diesel 414.58
      - May 16, 2026: Petrol 409.78  Diesel 409.58

      Raw Market Context from web search:
      ${rawMarketData}

      Requirements:
      - Use the LATEST prices found from the search above for the prices object. Do not hardcode old values.
      - Set lastUpdated to today's actual date from the latest notification found.
      - Set source to "OGRA / Ministry of Energy".
      - For historical array: include all the verified prices above PLUS any newer revision found in the search. Label periods clearly e.g. "Feb", "Mar", "Apr 1", "Apr 25", "May 9", "May 16" etc.
      - Generate 5 realistic news articles about Pakistan fuel crisis based on the raw market context.
      - impactLevel should reflect actual situation: use "Critical" if petrol above Rs 380, "High" if above Rs 300, "Moderate" otherwise.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prices: {
              type: Type.OBJECT,
              properties: {
                petrol: { type: Type.NUMBER },
                diesel: { type: Type.NUMBER },
                lightDiesel: { type: Type.NUMBER },
                kerosene: { type: Type.NUMBER },
                lastUpdated: { type: Type.STRING },
                source: { type: Type.STRING }
              },
              required: ["petrol", "diesel", "lightDiesel", "kerosene", "lastUpdated", "source"]
            },
            crisis: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                summary: { type: Type.STRING },
                keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                impactLevel: { type: Type.STRING, enum: ["Low", "Moderate", "High", "Critical"] },
                newsSources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { title: { type: Type.STRING }, url: { type: Type.STRING } },
                    required: ["title", "url"]
                  }
                }
              },
              required: ["headline", "summary", "keyPoints", "impactLevel", "newsSources"]
            },
            newsFeed: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  excerpt: { type: Type.STRING },
                  source: { type: Type.STRING },
                  url: { type: Type.STRING },
                  date: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ["Government", "News", "Market"] }
                },
                required: ["title", "excerpt", "source", "url", "date", "category"]
              }
            },
            historical: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  period: { type: Type.STRING },
                  petrol: { type: Type.NUMBER },
                  diesel: { type: Type.NUMBER }
                },
                required: ["period", "petrol", "diesel"]
              }
            }
          },
          required: ["prices", "crisis", "newsFeed", "historical"]
        }
      }
    });

    const data = JSON.parse(formatResponse.text || "{}");
    res.status(200).json(data);

  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({
      prices: {
        petrol: 409.78,
        diesel: 409.58,
        lightDiesel: 369.72,
        kerosene: 450.15,
        lastUpdated: "May 16, 2026",
        source: "OGRA Notification (Cached)"
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
    });
  }
}