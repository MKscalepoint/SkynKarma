'use client';

import { useState, useRef } from 'react';
import { UserProfile } from '@/types';

const ROSE = '#b5737a';
const ROSE_LIGHT = '#fdf2f3';
const ROSE_MID = '#f2d0d3';

const EXAMPLE_PRODUCT = 'GlowUp Pro Stem Cell Regenerating Serum';
const EXAMPLE_CLAIM = "'Clinically proven to reduce wrinkles by 87% in 7 days using patented stem cell technology. As seen on Dragon's Den. Used by celebrities worldwide.'";

interface ScamCheckProps {
  profile: UserProfile | null;
  onClose: () => void;
}

interface Verdict {
  score: number;
  verdict: 'legit' | 'overpriced' | 'misleading' | 'scam';
  summary: string;
  claimsVsReality: string;
  ingredientTruth: string;
  redFlags: string[];
  greenFlags: string[];
  alternatives: string;
  bottomLine: string;
}

const VERDICT_CONFIG = {
  legit: { label: 'Looks Legit', color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', icon: '✓' },
  overpriced: { label: 'Overpriced', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: '£' },
  misleading: { label: 'Misleading Claims', color: '#f97316', bg: '#fff7ed', border: '#fed7aa', icon: '!' },
  scam: { label: 'Likely a Scam', color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: '✕' },
};

const IconWarning = ({ size = 16, color = ROSE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconCamera = ({ size = 20, color = ROSE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const IconSearch = ({ size = 20, color = '#64748b' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconLightbulb = ({ size = 14, color = '#64748b' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6"/><path d="M10 22h4"/>
  </svg>
);

async function compressImage(base64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = 800;
      let { width, height } = img;
      if (width > height && width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
      else if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
    };
    img.src = `data:image/jpeg;base64,${base64}`;
  });
}

function extractJSON(text: string): Verdict | null {
  try { return JSON.parse(text) as Verdict; } catch { /* continue */ }
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) { try { return JSON.parse(match[1].trim()) as Verdict; } catch { /* continue */ } }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) { try { return JSON.parse(text.slice(start, end + 1)) as Verdict; } catch { /* continue */ } }
  return null;
}

export default function ScamCheck({ profile, onClose }: ScamCheckProps) {
  const [productName, setProductName] = useState(EXAMPLE_PRODUCT);
  const [brandClaim, setBrandClaim] = useState(EXAMPLE_CLAIM);
  const [ingredients, setIngredients] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'photo'>('text');
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [isExample, setIsExample] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    setIsExample(false);
    const reader = new FileReader();
    reader.onload = async () => {
      const raw = (reader.result as string).split(',')[1];
      setPhoto(await compressImage(raw));
    };
    reader.readAsDataURL(file);
  };

  const handleCheck = async () => {
    if (!productName.trim() && !photo) return;
    setLoading(true);
    setVerdict(null);
    setError('');
    setFollowUpAnswer('');

    const prompt = `You are Skyn Karma's product authenticity expert. Analyse this skincare product and respond ONLY with a valid JSON object — no markdown, no text outside the JSON.

Product name: ${productName || 'Unknown (see photo)'}
Brand claims: ${brandClaim || 'Not provided'}
Ingredient list: ${ingredients || 'Not provided'}
${profile ? `User skin type: ${profile.skinType}, concerns: ${profile.concerns?.join(', ')}` : ''}

JSON format (use exactly these keys):
{
  "score": <0-100, where 100=completely legitimate>,
  "verdict": <"legit"|"overpriced"|"misleading"|"scam">,
  "summary": "<1-2 sentence verdict>",
  "claimsVsReality": "<claims vs what ingredients actually do>",
  "ingredientTruth": "<key ingredient analysis>",
  "redFlags": ["<flag>"],
  "greenFlags": ["<flag>"],
  "alternatives": "<better alternatives if relevant>",
  "bottomLine": "<one punchy sentence>"
}`;

    try {
      let messages;
      if (inputMode === 'photo' && photo) {
        messages = [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: photo } },
            { type: 'text', text: prompt + '\n\nAlso extract relevant product info from the image.' }
          ]
        }];
      } else {
        messages = [{ role: 'user', content: prompt }];
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, profile }),
      });
      const data = await res.json();
      const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text || '';
      const parsed = extractJSON(text);
      if (!parsed) throw new Error('Could not parse response');
      setVerdict(parsed);
      setTimeout(() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async () => {
    if (!followUp.trim() || !verdict) return;
    setFollowUpLoading(true);
    try {
      const messages = [
        { role: 'user', content: `You assessed "${productName || 'a product'}" with verdict: ${verdict.verdict}. Summary: ${verdict.summary}` },
        { role: 'assistant', content: `${verdict.verdict}: ${verdict.summary} ${verdict.bottomLine}` },
        { role: 'user', content: followUp },
      ];
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, profile }),
      });
      const data = await res.json();
      const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text || 'Sorry, something went wrong.';
      setFollowUpAnswer(text);
      setFollowUp('');
    } catch {
      setFollowUpAnswer('Something went wrong. Please try again.');
    } finally {
      setFollowUpLoading(false);
    }
  };

  const reset = () => {
    setVerdict(null); setProductName(EXAMPLE_PRODUCT); setBrandClaim(EXAMPLE_CLAIM);
    setIngredients(''); setPhoto(null); setPhotoName('');
    setError(''); setFollowUpAnswer(''); setFollowUp(''); setIsExample(true);
    setTimeout(() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const canSubmit = productName.trim() || photo;
  const vc = verdict ? VERDICT_CONFIG[verdict.verdict] : null;

  function formatText(text: string) {
    return text.split('\n').map((line, i) => {
      const html = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      if (line.trim() === '') return <div key={i} style={{ height: 6 }} />;
      return <p key={i} style={{ margin: '0 0 4px' }} dangerouslySetInnerHTML={{ __html: html }} />;
    });
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px 24px 90px', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: ROSE_LIGHT, border: `1px solid ${ROSE_MID}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconWarning size={16} />
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Reality Check</h2>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Is that TikTok or Instagram product actually worth it?</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
        </div>

        {/* Scrollable content */}
        <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {!verdict ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 4, gap: 4 }}>
                {(['text', 'photo'] as const).map(mode => (
                  <button key={mode} onClick={() => setInputMode(mode)} style={{
                    flex: 1, padding: '8px', border: 'none', borderRadius: 8,
                    background: inputMode === mode ? '#fff' : 'transparent',
                    color: inputMode === mode ? '#0f172a' : '#64748b',
                    fontWeight: inputMode === mode ? 600 : 400,
                    fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: inputMode === mode ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    {mode === 'text' ? <><IconSearch size={14} color={inputMode === mode ? '#0f172a' : '#94a3b8'} /> Enter product details</> : <><IconCamera size={14} color={inputMode === mode ? '#0f172a' : '#94a3b8'} /> Photo the ad or product</>}
                  </button>
                ))}
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Product name {inputMode === 'text' && <span style={{ color: '#ef4444' }}>*</span>}
                  {inputMode === 'photo' && <span style={{ color: '#94a3b8', fontWeight: 400 }}> (optional if photo is clear)</span>}
                </label>
                <input value={productName} onChange={e => { setProductName(e.target.value); setIsExample(false); }}
                  placeholder="e.g. GlowLab Pro Stem Cell Regenerating Serum"
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 16, fontFamily: 'inherit', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = ROSE}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              {inputMode === 'photo' && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Photo of product or ad</label>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
                  {!photo ? (
                    <button onClick={() => fileRef.current?.click()} style={{
                      width: '100%', padding: '24px 20px', border: '2px dashed #e2e8f0', borderRadius: 12,
                      background: '#fafafa', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: 'inherit',
                    }}
                      onMouseEnter={e => { (e.currentTarget).style.borderColor = ROSE; (e.currentTarget).style.background = ROSE_LIGHT; }}
                      onMouseLeave={e => { (e.currentTarget).style.borderColor = '#e2e8f0'; (e.currentTarget).style.background = '#fafafa'; }}
                    >
                      <IconCamera size={28} color={ROSE} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Photo the product, packaging or ad</span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>Works with screenshots — auto compressed</span>
                    </button>
                  ) : (
                    <div style={{ border: `1.5px solid ${ROSE}44`, borderRadius: 12, padding: '14px 16px', background: ROSE_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 16, color: ROSE }}>✓</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Photo ready</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{photoName}</div>
                        </div>
                      </div>
                      <button onClick={() => { setPhoto(null); setPhotoName(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: ROSE, fontFamily: 'inherit', fontWeight: 600 }}>Change</button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                  What does the brand claim? <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional but helps)</span>
                </label>
                <textarea value={brandClaim} onChange={e => { setBrandClaim(e.target.value); setIsExample(false); }}
                  placeholder="e.g. 'Reduces wrinkles by 87% in 7 days', 'clinically proven'…"
                  rows={2} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 16, fontFamily: 'inherit', color: '#0f172a', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = ROSE}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Ingredient list <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional — makes analysis more accurate)</span>
                </label>
                <textarea value={ingredients} onChange={e => { setIngredients(e.target.value); setIsExample(false); }}
                  placeholder="Paste from packaging, website, or an app like INCI Beauty…"
                  rows={2} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 16, fontFamily: 'inherit', color: '#0f172a', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = ROSE}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#64748b', lineHeight: 1.5, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <IconLightbulb size={14} color={ROSE} />
                <span><strong>Tip:</strong> Screenshot a TikTok or Instagram ad and upload it — Skyn Karma will read the claims and cross-reference against skincare science.</span>
              </div>

              {error && <div style={{ color: '#ef4444', fontSize: 13 }}>{error}</div>}
            </div>

          ) : (
            <div>
              <div style={{ background: vc!.bg, border: `1px solid ${vc!.border}`, borderRadius: 16, padding: '20px', marginBottom: 20, borderLeft: `4px solid ${vc!.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: vc!.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700 }}>{vc!.icon}</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: vc!.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verdict</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{vc!.label}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: vc!.color }}>{verdict.score}</div>
                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>/ 100</div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{verdict.summary}</p>
              </div>

              {[
                { label: 'Claims vs Reality', content: verdict.claimsVsReality },
                { label: 'Ingredient Truth', content: verdict.ingredientTruth },
              ].map(({ label, content }) => (
                <div key={label} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{label}</div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{content}</div>
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: verdict.greenFlags?.length ? '1fr 1fr' : '1fr', gap: 12, marginBottom: 16 }}>
                {verdict.redFlags?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Red Flags</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {verdict.redFlags.map((f, i) => (
                        <div key={i} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{f}</div>
                      ))}
                    </div>
                  </div>
                )}
                {verdict.greenFlags?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Green Flags</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {verdict.greenFlags.map((f, i) => (
                        <div key={i} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{f}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {verdict.alternatives && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Better Alternatives</div>
                  <div style={{ background: ROSE_LIGHT, border: `1px solid ${ROSE_MID}`, borderRadius: 10, padding: '12px 14px', fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{verdict.alternatives}</div>
                </div>
              )}

              <div style={{ background: '#0f172a', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Bottom Line</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.5 }}>{verdict.bottomLine}</div>
              </div>

              {followUpAnswer && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', marginBottom: 16, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                  {formatText(followUpAnswer)}
                </div>
              )}

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Got a follow-up question?</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={followUp} onChange={e => setFollowUp(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleFollowUp()}
                    placeholder="e.g. What would you recommend instead?"
                    style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 16, fontFamily: 'inherit', color: '#0f172a', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = ROSE}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  <button onClick={handleFollowUp} disabled={!followUp.trim() || followUpLoading} style={{
                    padding: '10px 16px', background: followUp.trim() && !followUpLoading ? ROSE : '#e2e8f0',
                    color: followUp.trim() && !followUpLoading ? '#fff' : '#94a3b8',
                    border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: followUp.trim() && !followUpLoading ? 'pointer' : 'default', fontFamily: 'inherit', flexShrink: 0,
                  }}>
                    {followUpLoading ? '…' : '→'}
                  </button>
                </div>
              </div>

              <button onClick={reset} style={{ width: '100%', padding: '12px', background: ROSE_LIGHT, border: `1px solid ${ROSE_MID}`, borderRadius: 10, fontSize: 14, color: ROSE, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Check another product
              </button>
            </div>
          )}
        </div>

        {/* Sticky footer — input screen only */}
        {!verdict && (
          <div style={{ padding: '10px 24px 16px', borderTop: '1px solid #f1f5f9', background: '#fff', flexShrink: 0 }}>
            {isExample && inputMode === 'text' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 13, color: ROSE }}>
                <IconLightbulb size={13} color={ROSE} />
                <span>We&apos;ve pre-filled an example — hit the button to try it, replace with your own, or try the photo upload</span>
              </div>
            )}
            <button onClick={handleCheck} disabled={!canSubmit || loading} style={{
              width: '100%', padding: '14px', background: canSubmit && !loading ? ROSE : '#e2e8f0',
              color: canSubmit && !loading ? '#fff' : '#94a3b8',
              border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
              cursor: canSubmit && !loading ? 'pointer' : 'default',
              fontFamily: 'inherit', transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading ? 'Investigating…' : <><IconWarning size={16} color={canSubmit && !loading ? '#fff' : '#94a3b8'} /> Run reality check →</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}