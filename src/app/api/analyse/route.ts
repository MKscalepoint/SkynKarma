import { NextRequest, NextResponse } from 'next/server';
import { UserProfile, ProductEntry } from '@/types';

function extractJSON(text: string): object | null {
  // Try direct parse first
  try { return JSON.parse(text); } catch { /* continue */ }
  // Strip markdown code blocks
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) { try { return JSON.parse(match[1].trim()); } catch { /* continue */ } }
  // Find outermost { }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) { try { return JSON.parse(text.slice(start, end + 1)); } catch { /* continue */ } }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { products, profile }: { products: ProductEntry[]; profile?: UserProfile } = await req.json();

    const profileContext = profile ? `
USER PROFILE:
- Skin type: ${profile.skinType || 'unknown'}
- Concerns: ${profile.concerns?.join(', ') || 'none'}
- Experience: ${profile.experience || 'unknown'}
- Age: ${profile.age || 'not specified'}
- Sensitivities: ${profile.sensitivities || 'none'}
` : '';

    const productList = products.map((p, i) =>
      `${i + 1}. ${p.name} (${p.type})${p.ingredients ? `\n   Ingredients: ${p.ingredients}` : ''}`
    ).join('\n\n');

    const prompt = `You are skynkarma, an expert skincare advisor. Analyse the following skincare products and provide a comprehensive compatibility report.
${profileContext}
PRODUCTS TO ANALYSE:
${productList}

KNOWN CONFLICTS TO CHECK FOR (be thorough — flag any that apply):
- Vitamin C (ascorbic acid, L-ascorbic acid) + Retinol/Retinoids — should not be used in the same session; use vitamin C AM and retinol PM
- Vitamin C (high concentration, >10%) + Niacinamide — can reduce efficacy of both, better used separately
- AHA/BHA (glycolic, salicylic, lactic acid) + Retinol — increases irritation risk significantly, especially for sensitive skin
- Benzoyl Peroxide + Retinol — benzoyl peroxide oxidises and deactivates retinol
- Multiple exfoliants (AHA + BHA together, or multiple AHAs) — over-exfoliation risk
- High pH products used before low pH products — can interfere with active ingredient efficacy
- SPF + actives like retinol or strong AHAs in PM — SPF should only be used AM
- Retinol + Vitamin C in same session — always flag this as high severity

When in doubt, flag it. It is better to over-caution than to miss a real incompatibility.

Respond ONLY with a valid JSON object — no markdown, no backticks, no text outside the JSON:
{
  "summary": "2-3 sentence overall assessment of this product combination for the user's skin type",
  "layeringOrder": [
    { "step": 1, "product": "product name", "reason": "why this goes first" }
  ],
  "conflicts": [
    { "products": ["product A", "product B"], "issue": "clear explanation of the conflict and what to do instead", "severity": "high|medium|low" }
  ],
  "recommendations": [
    "specific actionable recommendation"
  ],
  "amRoutine": ["product name in order"],
  "pmRoutine": ["product name in order"]
}

Rules:
- layeringOrder must list ALL products in the correct application order (thinnest to thickest, pH order)
- conflicts: only genuine issues, but err on the side of caution — if uncertain, include it as medium severity
- If no conflicts exist, return an empty array
- recommendations: max 5, specific and actionable
- amRoutine and pmRoutine: split products appropriately (SPF always AM only, retinol always PM only)
- Tailor everything to the user's skin type and concerns`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    console.log('STATUS:', response.status);
    console.log('FULL:', JSON.stringify(data));
    const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text || '';
    console.log('FULL API RESPONSE:', JSON.stringify(data));
    console.log('RAW RESPONSE:', text);


    const report = extractJSON(text);
    if (!report) {
      console.error('Failed to parse analyse response:', text);
      return NextResponse.json({ error: 'Failed to parse analysis' }, { status: 500 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Analyse API error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}