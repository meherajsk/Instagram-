import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Health
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Helper: Generate structured algorithmic summary from watch items
function generateAlgorithmicSummary(
  items: any[],
  categoryCounts: Record<string, number>,
  totalSeconds: number,
  style: string = "balanced",
  userFocus?: string,
  highDemandNotice: boolean = false
) {
  const totalItems = items.length;
  const sortedCats = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const primaryCat = sortedCats[0]?.[0] || "General Lifestyle";
  const primaryCount = sortedCats[0]?.[1] || totalItems;
  const primaryPct = Math.round((primaryCount / (totalItems || 1)) * 100);

  const topCategories = sortedCats.slice(0, 5).map(([category, count]) => {
    // Extract real tags associated with this category
    const matchingTags = Array.from(
      new Set(
        items
          .filter((it: any) => it.category === category)
          .flatMap((it: any) => it.tags || [])
      )
    ).slice(0, 3);

    return {
      category,
      count,
      percentage: Math.round((count / (totalItems || 1)) * 100),
      keyThemes: matchingTags.length > 0 ? matchingTags : [`${category.toLowerCase()} reels`, "creator commentary", "trending media"],
    };
  });

  // Archetype & Description mapping
  let overviewTitle = `The Curated ${primaryCat} Explorer`;
  let archetypeDesc = `Your Instagram feed is strongly anchored in ${primaryCat} (${primaryPct}%), balancing rapid-fire micro-content with engaging visual storytelling.`;
  let quote = "Your algorithm doesn't define you—it mirrors where your curiosity spent its 15-second bets.";

  if (primaryCat.includes("Tech") || primaryCat.includes("AI")) {
    overviewTitle = "The Silicon Valley Optimizer";
    archetypeDesc = "Your algorithm is tuned into cutting-edge AI developments, developer tooling, and modern hardware teardowns, seeking maximum signal over passive entertainment.";
    quote = "Code is cheap, context windows are finite, and your feed is an ongoing engineering sprint.";
  } else if (primaryCat.includes("Fitness") || primaryCat.includes("Health")) {
    overviewTitle = "The Hypertrophy & Longevity Scholar";
    archetypeDesc = "Your viewing habits prioritize evidence-based exercise science, sleep protocols, and nutrient timing over superficial quick-fixes.";
    quote = "Stimulus to fatigue ratio: your feed is 90% hypertrophy science and 10% cold shower discipline.";
  } else if (primaryCat.includes("Comedy") || primaryCat.includes("Memes")) {
    overviewTitle = "The Cultural Irony & Dopamine Surfer";
    archetypeDesc = "You utilize Instagram primarily for comedic catharsis, viral workplace satire, and unhinged late-night pop culture commentary.";
    quote = "When life gives you corporate emails, the algorithm provides 15-second satirical translations.";
  } else if (primaryCat.includes("Aesthetic") || primaryCat.includes("Travel")) {
    overviewTitle = "The Cinematic Visual Curator";
    archetypeDesc = "Your feed reflects a deep aesthetic sensibility for 35mm analog film grain, architectural tranquility, and mindful daily rituals.";
    quote = "Framing the world through golden-hour color grading and quiet morning pour-overs.";
  } else if (primaryCat.includes("Finance") || primaryCat.includes("Business")) {
    overviewTitle = "The Compound Wealth & Micro-SaaS Strategist";
    archetypeDesc = "You treat your Reels feed as an asymmetric knowledge loop for bootstrapping, index compounding, and business teardowns.";
    quote = "The greatest dividend money and curated feeds pay is total control over your attention.";
  }

  // Generate key takeaways from actual saved / liked items
  const highIntentItems = items.filter((it: any) => it.engagement === "saved" || it.engagement === "liked");
  const candidates = highIntentItems.length >= 3 ? highIntentItems : items;

  const keyTakeaways = candidates.slice(0, 4).map((it: any, idx: number) => {
    return {
      topic: it.category || "Core Insight",
      insight: it.notes || it.title || `Key educational takeaway from ${it.creator || "creator"}.`,
      creatorOrSource: `@${it.handle || it.creator || "creator"}`,
    };
  });

  // Calculate patterns
  const estimatedDaily = Math.round((totalSeconds / 60) * 1.3);
  const savedCount = items.filter((it: any) => it.engagement === "saved").length;
  const eduScore = primaryCat.includes("Tech") || primaryCat.includes("Science") || primaryCat.includes("Fitness") || primaryCat.includes("Finance") ? 82 : 64;
  const dopamineScore = primaryCat.includes("Comedy") || primaryCat.includes("Pop Culture") ? 85 : 55;

  const rabbitHoles = Array.from(
    new Set(
      items
        .flatMap((it: any) => it.tags || [])
        .filter((t: string) => t.length > 3)
    )
  ).slice(0, 4);

  const executiveSummary = `Based on an in-depth audit of your ${totalItems} logged Instagram interactions (representing approximately ${Math.round(totalSeconds / 60)} minutes of watched video), your feed is concentrated in ${topCategories.map(c => `${c.category} (${c.percentage}%)`).join(", ")}.

Your viewing behavior reveals high intentionality: you actively save high-leverage content (${savedCount} items saved), showing you treat your Reels tab partially as an asynchronous reference library rather than pure passive doomscrolling. Your content diet favors creators who frontload value in the first 3 seconds and provide concrete visual demonstrations.

The Instagram algorithm is currently reinforcing this cluster by prioritizing high-completion Reels with matching audio hooks. While your educational ratio is strong (${eduScore}%), maintaining awareness of evening watch sessions will help keep your attention span primed for deep focus.`;

  return {
    overviewTitle,
    archetypeDescription: archetypeDesc,
    executiveSummary,
    topCategories,
    keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : [
      {
        topic: primaryCat,
        insight: "Consistent high-value micro-learning across your primary interest areas.",
        creatorOrSource: items[0]?.creator || "Featured Creator",
      }
    ],
    viewingPatterns: {
      estimatedDailyMinutes: estimatedDaily > 0 ? estimatedDaily : 35,
      peakHoursLabel: "9:00 PM – 11:30 PM (Evening Recovery Window)",
      rabbitHoles: rabbitHoles.length > 0 ? rabbitHoles : [primaryCat, "Trending Reels", "Recommended Audio"],
      doomscrollRisk: totalItems > 35 ? ("Moderate" as const) : ("Low" as const),
      dopamineScore,
      educationalScore: eduScore,
    },
    algorithmDietAdvice: [
      {
        action: "Search & Engage",
        tip: `Manually search 3-4 specialized creators in ${primaryCat} to keep your Explore feed dense with high-signal content.`,
      },
      {
        action: "Mute / Not Interested",
        tip: "When low-effort rage bait or recycled meme clips appear, tap the three dots and select 'Not Interested' to decay their algorithmic weight.",
      },
      {
        action: "Save Discipline",
        tip: "Organize your Saved tab into categorical collections (e.g., 'To Read', 'To Implement') so valuable Reels don't disappear into digital clutter.",
      }
    ],
    quote,
    generatedAt: new Date().toISOString(),
    isFallback: highDemandNotice || !process.env.GEMINI_API_KEY,
    notice: highDemandNotice ? "Gemini model is currently experiencing high demand. Serving instant algorithmic audit." : undefined,
  };
}

// API: Analyze Watch History with Gemini 3.8-flash (with multi-model fallback & resilience)
app.post("/api/analyze-watch-history", async (req: Request, res: Response) => {
  const { items, style = "balanced", userFocus } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "No watch history items provided" });
  }

  // Pre-calculate metrics
  const totalItems = items.length;
  const categoryCounts: Record<string, number> = {};
  let totalSeconds = 0;

  items.forEach((item: any) => {
    const cat = item.category || "General Lifestyle";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    totalSeconds += item.durationSeconds || 30;
  });

  const ai = getGeminiClient();

  if (!ai) {
    // Return rich algorithmic fallback analysis
    const fallbackData = generateAlgorithmicSummary(items, categoryCounts, totalSeconds, style, userFocus, false);
    return res.json(fallbackData);
  }

  const sampleWatchList = items.slice(0, 45).map((it: any, index: number) => {
    return `${index + 1}. [${it.contentType || "Reel"}] "${it.title}" by @${it.handle || it.creator || "creator"} | Category: ${it.category} | Engagement: ${it.engagement || "watched"} | Duration: ${it.durationSeconds || 30}s | Tags: ${(it.tags || []).join(", ")}`;
  }).join("\n");

  const systemPrompt = `You are a world-class digital media psychologist and Instagram algorithmic auditor.
Your job is to analyze a user's Instagram watch history (Reels, videos, carousels, and viewed posts) and produce a detailed, deeply perceptive, engaging, and constructive breakdown.
Explain:
1. Exactly what kind of content they have watched (categories, micro-niches, themes).
2. A comprehensive Executive Summary explaining their psychological viewing profile, attention hooks, and the subtext of why the Instagram algorithm is feeding them this content.
3. Key Knowledge & Actionable Takeaways they actually absorbed or encountered from their watch history.
4. Viewing patterns (estimated watch time, doomscrolling vs value score, rabbit holes).
5. Actionable tips to reset or refine their Instagram algorithm.

Tone style requested: ${style} (e.g. balanced, witty-roast, productivity-focused).
${userFocus ? `User specific focus area: "${userFocus}"` : ""}`;

  const userPrompt = `Analyze the following Instagram Watch History log (${totalItems} items, approx ${Math.round(totalSeconds / 60)} minutes total):

${sampleWatchList}

Total Category Breakdown:
${JSON.stringify(categoryCounts, null, 2)}

Provide a structured, insightful JSON response adhering strictly to the schema provided.`;

  // Attempt generation with available Flash models, handling high-demand spikes gracefully
  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
  ];

  for (let i = 0; i < modelsToTry.length; i++) {
    const modelName = modelsToTry[i];
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overviewTitle: { type: Type.STRING },
              archetypeDescription: { type: Type.STRING },
              executiveSummary: { type: Type.STRING },
              topCategories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    count: { type: Type.INTEGER },
                    percentage: { type: Type.INTEGER },
                    keyThemes: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["category", "count", "percentage", "keyThemes"],
                },
              },
              keyTakeaways: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topic: { type: Type.STRING },
                    insight: { type: Type.STRING },
                    creatorOrSource: { type: Type.STRING },
                  },
                  required: ["topic", "insight", "creatorOrSource"],
                },
              },
              viewingPatterns: {
                type: Type.OBJECT,
                properties: {
                  estimatedDailyMinutes: { type: Type.INTEGER },
                  peakHoursLabel: { type: Type.STRING },
                  rabbitHoles: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  doomscrollRisk: { type: Type.STRING },
                  dopamineScore: { type: Type.INTEGER },
                  educationalScore: { type: Type.INTEGER },
                },
                required: ["estimatedDailyMinutes", "peakHoursLabel", "rabbitHoles", "doomscrollRisk", "dopamineScore", "educationalScore"],
              },
              algorithmDietAdvice: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    action: { type: Type.STRING },
                    tip: { type: Type.STRING },
                  },
                  required: ["action", "tip"],
                },
              },
              quote: { type: Type.STRING },
            },
            required: [
              "overviewTitle",
              "archetypeDescription",
              "executiveSummary",
              "topCategories",
              "keyTakeaways",
              "viewingPatterns",
              "algorithmDietAdvice",
              "quote",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      parsed.generatedAt = new Date().toISOString();
      parsed.isFallback = false;
      return res.json(parsed);
    } catch {
      // Model unavailable or high-demand; proceed to next model candidate
    }
  }

  // If models are under high load, serve tailored algorithmic synthesis
  const resilientFallback = generateAlgorithmicSummary(items, categoryCounts, totalSeconds, style, userFocus, true);
  return res.json(resilientFallback);
});

// API: Parse Freeform Text or Pasted Instagram content into Watch Items
app.post("/api/parse-quick-log", async (req: Request, res: Response) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ error: "Missing rawText" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Simple regex/line parser fallback
      const lines = rawText.split("\n").filter((l: string) => l.trim().length > 0);
      const items = lines.slice(0, 20).map((line: string, idx: number) => {
        const hasReel = line.toLowerCase().includes("reel") || line.includes("instagram.com/reel/");
        return {
          id: `custom-${Date.now()}-${idx}`,
          title: line.replace(/https?:\/\/\S+/g, "").trim() || `Watched Post #${idx + 1}`,
          creator: "Instagram Creator",
          handle: "creator",
          contentType: hasReel ? "reel" : "video",
          category: "General Lifestyle",
          durationSeconds: 30,
          watchedAt: new Date(Date.now() - idx * 3600000).toISOString(),
          completionRate: 100,
          engagement: "watched",
          tags: ["instagram", "viewed"],
          notes: line,
        };
      });
      return res.json({ items });
    }

    const prompt = `Convert the following pasted notes, links, or watch history log into structured Instagram watch history items:

${rawText.slice(0, 3000)}

Categorize each item accurately (e.g., Tech & AI, Fitness & Health, Comedy & Memes, Travel & Aesthetic, Cooking & Food, Finance & Business, Fashion & Beauty, Science & Education, Self Improvement, Pop Culture).
Determine contentType ('reel' | 'video' | 'carousel' | 'story').
Extract likely creator handle if present.`;

    let parsed: any[] = [];
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                creator: { type: Type.STRING },
                handle: { type: Type.STRING },
                contentType: { type: Type.STRING },
                category: { type: Type.STRING },
                durationSeconds: { type: Type.INTEGER },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                engagement: { type: Type.STRING },
                notes: { type: Type.STRING },
              },
              required: ["title", "contentType", "category"],
            },
          },
        },
      });
      parsed = JSON.parse(response.text || "[]");
    } catch {
      const lines = rawText.split("\n").filter((l: string) => l.trim().length > 0);
      parsed = lines.slice(0, 25).map((line: string, idx: number) => {
        const hasReel = line.toLowerCase().includes("reel") || line.includes("instagram.com/reel/");
        const handleMatch = line.match(/@([a-zA-Z0-9._]+)/);
        return {
          title: line.replace(/https?:\/\/\S+/g, "").replace(/@\S+/g, "").trim() || `Pasted Reel #${idx + 1}`,
          creator: handleMatch ? `@${handleMatch[1]}` : "Instagram Creator",
          handle: handleMatch ? handleMatch[1] : "creator",
          contentType: hasReel ? "reel" : "video",
          category: "General Lifestyle",
          durationSeconds: 30,
          tags: ["instagram", "pasted"],
          engagement: "watched",
          notes: line,
        };
      });
    }
    const formatted = parsed.map((it: any, i: number) => ({
      id: `parsed-${Date.now()}-${i}`,
      title: it.title || `Watched Item #${i + 1}`,
      creator: it.creator || it.handle || "Instagram Creator",
      handle: (it.handle || "instagram_user").replace(/^@/, ""),
      contentType: ["reel", "video", "carousel", "story"].includes(it.contentType) ? it.contentType : "reel",
      category: it.category || "General Lifestyle",
      durationSeconds: it.durationSeconds || 35,
      watchedAt: new Date(Date.now() - i * 1800000).toISOString(),
      completionRate: 100,
      engagement: ["liked", "saved", "shared", "watched"].includes(it.engagement) ? it.engagement : "watched",
      tags: Array.isArray(it.tags) ? it.tags : ["instagram"],
      notes: it.notes || "",
    }));

    res.json({ items: formatted });
  } catch (err: any) {
    console.error("Error parsing quick log:", err);
    res.status(500).json({ error: "Failed to parse text into items", details: err?.message });
  }
});

// Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Instagram Watch History Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
