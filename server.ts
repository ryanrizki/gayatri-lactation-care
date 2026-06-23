import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Minbee AI will operate in fallback mode.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API endpoint for Minbee AI Assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { contents } = req.body;

      if (!contents || !Array.isArray(contents)) {
        return res.status(400).json({ error: "Invalid request. 'contents' array is required." });
      }

      if (!ai) {
        // Fallback response if API key is not configured
        return res.json({
          text: "Halo Mama! Minbee sangat ingin membantu Mama sekarang. Namun, Gemini API Key belum terkonfigurasi. Silakan konfigurasikan GEMINI_API_KEY di menu Secrets agar Minbee bisa memberikan edukasi laktasi terbaik untuk Mama! 🐝\n\nUntuk sementara, silakan gunakan fitur kalkulator pumping dan tracker menyusui kami yang dapat berjalan offline secara utuh ya Ma!",
        });
      }

      const systemInstruction = 
        "Anda adalah Minbee, maskot lebah lucu sekaligus asisten & konsultan laktasi AI yang ramah, hangat, dan suportif dari Gayatri Lactation Care (klinik bantuan menyusui & laktasi terkemuka di Indonesia).\n" +
        "Tugas Anda: Mendampingi Mama dalam perjalanan laktasi — dari masa hamil, persiapan menyusui, teknik latch-on (pelekatan) yang benar, mengatasi payudara bengkak (engorgement/plugged ducts/mastitis), tips memompa (pumping), manajemen ASI perah (ASIP) untuk ibu bekerja, jadwal pumping, hingga masa menyapih (weaning).\n" +
        "Bahasa: Gunakan Bahasa Indonesia yang santun, hangat, suportif, penuh empati, dan mudah dimengerti. Selalu sapa pengguna dengan sebutan 'Mama'.\n" +
        "Gaya Bicara: Gunakan emoji sesekali yang cocok (seperti 🌸, 🍼, 👶, ❤️, ✨). Berikan kalimat penyemangat seperti 'Semangat Mama!', 'Mama adalah ibu yang luar biasa!', atau 'Tenang ya Ma, kita hadapi bersama.'.\n" +
        "Pemberitahuan Medis: Berikan tips berbasis sains dan medis (laktasi ilmiah). Namun, selalu ingatkan Mama di akhir tanggapan bahwa jika masalah berlanjut (seperti demam tinggi, nyeri payudara parah, atau dehidrasi pada bayi), Mama disarankan berkonsultasi langsung dengan Dokter Konsultan Laktasi atau Bidan Konsultan Laktasi profesional dari Gayatri Lactation Care melalui halaman Hubungi Kami.";

      // Send chat request to Gemini 3.5 Flash (standard model for general Q&A)
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents, // Expect [{ role: "user", parts: [{ text: "..." }] }, { role: "model", parts: [{ text: "..." }] }]
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ 
        error: "Terjadi kesalahan saat memproses permintaan Mama. Mohon coba beberapa saat lagi ya Ma.",
        details: error.message 
      });
    }
  });

  // Dynamic service fee calculator API
  app.post("/api/estimator", (req, res) => {
    const { packageId, locationDistance = 0, isHomecare = false } = req.body;
    
    // Base prices for Gayatri Services
    const basePrices: Record<string, { name: string; price: number }> = {
      laktasi_homecare: { name: "Konsultasi Laktasi Homecare", price: 350000 },
      laktasi_klinik: { name: "Konsultasi Laktasi Klinik", price: 250000 },
      kelas_bekerja: { name: "Private Class Persiapan Bekerja", price: 400000 },
      kelas_menyusui: { name: "Private Class Persiapan Menyusui", price: 300000 }
    };

    const selected = basePrices[packageId];
    if (!selected) {
      return res.status(400).json({ error: "Layanan tidak ditemukan." });
    }

    let transportFee = 0;
    if (isHomecare) {
      // Calculate transportation dynamic fee: 5000 IDR per km above 5km
      if (locationDistance > 5) {
        transportFee = Math.round((locationDistance - 5) * 6000);
      } else {
        transportFee = 15000; // Base transport fee
      }
    }

    const total = selected.price + transportFee;
    res.json({
      serviceName: selected.name,
      basePrice: selected.price,
      transportFee,
      total,
      currency: "IDR"
    });
  });

  // Serve Vite app based on environments
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
    console.log(`[Gayatri Care Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
