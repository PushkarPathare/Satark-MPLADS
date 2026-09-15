import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily if API key exists
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn("Failed to initialize GoogleGenAI client:", err);
      aiClient = null;
    }
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "SATARK-MPLADS",
    feature: "Contractor Network Intelligence",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// API endpoint for AI-assisted Officer Briefing / Verification Recommendation
app.post("/api/generate-brief", async (req, res) => {
  try {
    const { contractorName, riskScore, riskFactors, signals, projects, district } = req.body;

    const client = getAIClient();
    if (!client) {
      // Deterministic government-formatted intelligence brief fallback
      const summaryText = `SATARK Decision-Support Brief for ${contractorName || "Contractor"}:
- Overall Network Risk Index: ${riskScore || 0}/100
- Primary Observations: Identified ${signals?.length || 0} distinct relationship patterns across ${district || "assigned districts"}.
- Key Signals: ${(signals || []).map((s: any) => s.title || s).join("; ")}.
- Statistical Context: Projects handled by this contractor exhibit a ${riskFactors?.delayPattern ? `${riskFactors.delayPattern}% delay weight` : "measurable delay profile"} and ${riskFactors?.agencyConcentration ? `${riskFactors.agencyConcentration}% agency concentration index` : "specific agency alignment"}.
- Standard Operating Guidance: This assessment serves strictly as an exploratory decision-support signal for the District Level Monitoring Committee (DLMC). It does NOT constitute an allegation of irregularity. Recommended action: Order an on-site milestone audit and cross-verify Measurement Book (MB) records with geotagged photographic logs.`;

      return res.json({
        success: true,
        source: "algorithmic_engine",
        brief: summaryText,
        recommendedChecklist: [
          "Cross-examine physical Progress Measurement Book (MB) with contractor invoice submissions.",
          "Dispatch Junior Engineer (JE) for geotagged milestone verification.",
          "Verify implementing agency tender allocation procedures and comparative bidding logs.",
          "Check whether milestone release certificates comply with MoSPI MPLADS Guidelines."
        ]
      });
    }

    const prompt = `You are the lead analytical assistant for SATARK-MPLADS (System for Advanced Tracking, Anomaly Recognition & Knowledge-graph for Members of Parliament Local Area Development Scheme, Government of India).

Draft a formal, objective, decision-support briefing note for the District Nodal Officer regarding contractor "${contractorName}".

Data Context:
- Network Risk Score: ${riskScore}/100
- District: ${district}
- Flagged Signals: ${JSON.stringify(signals)}
- Risk Factors: ${JSON.stringify(riskFactors)}
- Associated Projects Count: ${projects?.length || 0}

STRICT GUIDELINES:
1. Tone: Neutral, factual, rigorous administrative language.
2. NEVER use accusatory words like "fraud", "corruption", "guilty", or "criminal". Use terms like "statistical anomaly", "concentration pattern", "verification required", "divergence from district average".
3. Provide:
   a) Executive Summary (2-3 sentences explaining why the network pattern was highlighted)
   b) Observed Anomalies & Context
   c) Standard MoSPI-compliant Verification Checklist for field officers.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      source: "gemini_ai",
      brief: response.text || "No briefing generated.",
      recommendedChecklist: [
        "Cross-examine physical Progress Measurement Book (MB) with contractor invoice submissions.",
        "Dispatch Junior Engineer (JE) for geotagged milestone verification.",
        "Verify implementing agency tender allocation procedures and comparative bidding logs.",
        "Check whether milestone release certificates comply with MoSPI MPLADS Guidelines."
      ]
    });
  } catch (error: any) {
    console.error("AI Brief generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate brief",
      brief: "Algorithmic decision-support brief generated based on SATARK statistical deviation models. Please proceed with standard manual verification protocol."
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SATARK-MPLADS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
