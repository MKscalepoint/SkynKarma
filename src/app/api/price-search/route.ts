import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { productName, country } = await req.json();

    if (!productName) {
      return NextResponse.json({ error: 'Product name required' }, { status: 400 });
    }

    const countryText = country && country !== 'Other' ? country : 'the UK';

    const prompt = `Search for "${productName}" at major skincare and beauty retailers in ${countryText}.

Search broadly for this product across any reputable beauty, pharmacy, or general retailers available in ${countryText}. Start with well-known retailers like Boots, Superdrug, LookFantastic, Amazon, Sephora, but don't limit yourself — find whichever retailers currently have the product available and at the best prices.

For each retailer where you find the product, return what you know — even if the price is approximate or shown as a range. If you find the product page URL, include it even if you cannot confirm the exact current price.

Respond ONLY with a JSON array. Include up to 3 results. Use "Check site for price" if you cannot confirm the exact price:

[
  {
    "retailer": "Boots",
    "price": "£12.99",
    "currency": "£",
    "url": "https://www.boots.com/...",
    "inStock": true,
    "note": "Free delivery over £25"
  }
]

Return the array even if prices are approximate. Never return an empty array if you found any retailer pages.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Price search API error:', JSON.stringify(data));
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
    if (!textBlock) {
      return NextResponse.json({ error: 'No results found' }, { status: 404 });
    }

    const text = textBlock.text;

    let results;
    try { results = JSON.parse(text); } catch { /* continue */ }

    if (!results) {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) { try { results = JSON.parse(match[1].trim()); } catch { /* continue */ } }
    }

    if (!results) {
      const start = text.indexOf('[');
      const end = text.lastIndexOf(']');
      if (start !== -1 && end !== -1) {
        try { results = JSON.parse(text.slice(start, end + 1)); } catch { /* continue */ }
      }
    }

    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: 'No prices found. Try a more specific product name.' }, { status: 404 });
    }

    return NextResponse.json({ results: results.slice(0, 3) });
  } catch (error) {
    console.error('Price search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}