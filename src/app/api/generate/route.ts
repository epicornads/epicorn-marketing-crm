import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/utils/cloudinary';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: Request) {
  try {
    const { prompt, brandName, brandTone, mode } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // ----------------------------------------------------
    // POLLINATIONS AI IMAGE GENERATION PIPELINE
    // ----------------------------------------------------
    if (mode === 'image-generation') {
      console.log('Generating image using Pollinations for prompt:', prompt);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1350&nologo=true&private=true&model=flux`;
      
      // Upload to Cloudinary so we get CORS-safe delivery and caching
      const cloudinaryUrl = await uploadToCloudinary(pollinationsUrl, 'epicorn/ai-images');
      
      // If Cloudinary isn't configured, fall back to proxying the Pollinations URL locally
      let finalUrl = cloudinaryUrl;
      if (finalUrl && !finalUrl.includes('cloudinary.com')) {
        finalUrl = `/api/proxy-image?url=${encodeURIComponent(pollinationsUrl)}`;
      }
      
      return NextResponse.json({
        text: finalUrl,
        source: finalUrl.includes('cloudinary.com') ? 'cloudinary-pollinations' : 'proxy-pollinations'
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    // If API key is missing, return a smart mock response
    if (!geminiApiKey) {
      console.warn('GEMINI_API_KEY not set. Returning mock AI response.');
      return NextResponse.json({
        text: generateMockResponse(prompt, brandName || 'Brand', mode || 'rewrite'),
        source: 'mock'
      });
    }

    // Build the system instruction based on mode
    let systemInstruction = '';
    if (mode === 'ad-copy') {
      systemInstruction = `You are an expert marketing copywriter. You write short, punchy, high-converting ad copy for brands. 
Your output must be ONLY the requested text — no explanations, no quotes around it, no markdown.
Brand name: "${brandName || 'the brand'}". 
Brand tone: "${brandTone || 'professional and modern'}".`;
    } else if (mode === 'rewrite') {
      systemInstruction = `You are an expert marketing copywriter. Rewrite the given ad text according to the user's direction.
Your output must be ONLY the rewritten text — no explanations, no quotes around it, no markdown. Keep it concise (under 15 words ideally).
Brand name: "${brandName || 'the brand'}".
Brand tone: "${brandTone || 'professional and modern'}".`;
    } else {
      systemInstruction = `You are a helpful marketing AI assistant for the brand "${brandName || 'the brand'}".
Respond concisely. No markdown formatting.`;
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 256,
          topP: 0.95
        }
      }),
      signal: AbortSignal.timeout(12000) // 12s timeout
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Gemini API error (${response.status}):`, errorBody);
      // Fallback to mock on API error
      return NextResponse.json({
        text: generateMockResponse(prompt, brandName || 'Brand', mode || 'rewrite'),
        source: 'mock-fallback'
      });
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedText) {
      return NextResponse.json({
        text: generateMockResponse(prompt, brandName || 'Brand', mode || 'rewrite'),
        source: 'mock-fallback'
      });
    }

    return NextResponse.json({
      text: generatedText,
      source: 'gemini'
    });

  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json({ error: error.message || 'AI generation error' }, { status: 500 });
  }
}

// Smart mock response generator for when API key is absent
function generateMockResponse(prompt: string, brandName: string, mode: string): string {
  const promptLower = prompt.toLowerCase();

  if (mode === 'ad-copy') {
    if (promptLower.includes('headline') || promptLower.includes('offer')) {
      return `Unlock Exclusive Savings at ${brandName} Today!`;
    }
    if (promptLower.includes('cta') || promptLower.includes('button')) {
      return `Shop ${brandName} Now →`;
    }
    if (promptLower.includes('benefit')) {
      return `Premium Quality. Unmatched Value. Only at ${brandName}.`;
    }
    if (promptLower.includes('testimonial')) {
      return `"${brandName} completely transformed my workflow. Highly recommended!" — Verified Customer`;
    }
    return `Discover What Makes ${brandName} Different.`;
  }

  // Rewrite mode
  if (promptLower.includes('discount') || promptLower.includes('sale') || promptLower.includes('off')) {
    return `MEGA SALE: Up to 50% Off ${brandName}!`;
  }
  if (promptLower.includes('premium') || promptLower.includes('luxury')) {
    return `Experience Pure Luxury With ${brandName}.`;
  }
  if (promptLower.includes('short') || promptLower.includes('brief')) {
    return `${brandName}: Simply Better.`;
  }
  if (promptLower.includes('urgent') || promptLower.includes('hurry')) {
    return `Last Chance! Don't Miss Out on ${brandName}.`;
  }
  if (promptLower.includes('fun') || promptLower.includes('playful')) {
    return `Life's Better With ${brandName} 🎉`;
  }
  return `Upgrade your daily routine with ${brandName} now.`;
}
