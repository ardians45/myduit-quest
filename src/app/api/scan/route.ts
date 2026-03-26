import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key Gemini tidak dikonfigurasi. Harap tambahkan GEMINI_API_KEY ke environment variables.' },
        { status: 500 }
      );
    }

    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Gambar tidak ditemukan dalam request' },
        { status: 400 }
      );
    }

    // Strip the "data:image/jpeg;base64," part
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Inject exact current date to prevent AI hallucination
    const todayStr = new Date().toISOString().split('T')[0];

    // Get the Gemini 2.5 Flash model via Native Fetch
    // Strict prompt to ensure valid JSON output
    const prompt = `
      Anda adalah asisten keuangan AI spesialis OCR struk belanja.
      Analisis gambar struk yang diberikan dan ekstrak informasi berikut.
      
      KEMBALIKAN HANYA OBJEK JSON YANG VALID TANPA FORMATTING MARKDOWN, TANPA TEKS LAIN.
      Gunakan format persis seperti ini:
      {
        "shopName": "Nama Toko (TBA jika tidak ada)",
        "date": "${todayStr}",
        "totalAmount": angka_tanpa_rp_atau_titik (contoh: 50000),
        "category": "makanan" | "transport" | "shopping" | "entertainment" | "education" | "health" | "utilities" | "other" (pilih kategori pengeluaran yang paling sesuai)
      }
    `;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
       const errorData = await response.text();
       console.error("Gemini API Error:", errorData);
       throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract text from standard Gemini REST response
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("Tidak ada respons dari AI.");
    }
    
    const responseText = data.candidates[0].content.parts[0].text;

    // Clean up potential markdown formatting from Gemini response
    let cleanedJson = responseText.trim();
    if (cleanedJson.startsWith('```json')) {
      cleanedJson = cleanedJson.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedJson.startsWith('```')) {
      cleanedJson = cleanedJson.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const parsedData = JSON.parse(cleanedJson);

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('Error scanning receipt:', error);
    
    // Check if it's a JSON parsing error
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Gagal memproses respons dari AI. Silakan coba gambar yang lebih jelas.' },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan saat memproses gambar.' },
      { status: 500 }
    );
  }
}
