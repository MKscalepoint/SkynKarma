'use client';

import { useState, useRef } from 'react';
import { UserProfile } from '@/types';

const ROSE = '#b5737a';
const ROSE_LIGHT = '#fdf2f3';
const ROSE_MID = '#f2d0d3';

interface IngredientDecoderProps {
  profile: UserProfile | null;
  onClose: () => void;
}

interface DecoderResult {
  productName: string;
  analysis: string;
}

const IconFlask = ({ size = 16, color = ROSE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/>
    <path d="M14 9.3a6.5 6.5 0 1 1-4 0"/>
  </svg>
);

const IconCamera = ({ size = 20, color = ROSE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const IconClipboard = ({ size = 20, color = '#64748b' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

const IconLightbulb = ({ size = 14, color = ROSE }: { size?: number; color?: string }) => (
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

export default function IngredientDecoder({ profile, onClose }: IngredientDecoderProps) {
  const [productName, setProductName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DecoderResult | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'photo'>('text');
  const [followUp, setFollowUp] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const resultsTopRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = async () => {
      const raw = (reader.result as string).split(',')[1];
      const compressed = await compressImage(raw);
      setPhoto(compressed);
    };
    reader.readAsDataURL(file);
  };

  const handleDecode = async () => {
    if (inputMode === 'text' && !ingredients.trim()) return;
    if (inputMode === 'photo' && !photo) return;
    setLoading(true);
    setResult(null);
    setFollowUpAnswer('');

    const profileContext = profile
      ? `User has ${profile.skinType} skin, concerns: ${profile.concerns?.join(', ')}, sensitivities: ${profile.sensitivities || 'none'}.`
      : '';

    try {
      let messages;
      if (inputMode === 'photo' && photo) {
        messages = [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: photo } },
            { type: 'text', text: `You are Skyn Karma, an expert skincare advisor. The user has uploaded a photo of a product ingredient list.\n\n${profileContext}\nProduct: ${productName || 'Unknown product'}\n\nFirst extract the ingredient list from the image, then provide a structured analysis:\n1. **Key active ingredients** — what they do\n2. **Ingredients to note** — issues for this skin type/sensitivities\n3. **Best for** — skin types and concerns\n4. **Overall verdict** — well-formulated?\n5. **Compatibility tip** — layering advice\n\nIf the image is unclear, say so. Bold key ingredient names.` }
          ]
        }];
      } else {
        messages = [{
          role: 'user',
          content: `You are Skyn Karma, an expert skincare advisor.\n\n${profileContext}\nProduct: ${productName || 'Unknown product'}\nIngredients: ${ingredients}\n\nProvide a structured analysis:\n1. **Key active ingredients** — what they do\n2. **Ingredients to note** — issues for this skin type/sensitivities\n3. **Best for** — skin types and concerns\n4. **Overall verdict** — well-formulated?\n5. **Compatibility tip** — layering advice\n\nBe honest, specific, practical. Bold key ingredient names.`
        }];
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, profile }),
      });
      const data = await res.json();
      const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text || 'Unable to analyse ingredients.';
      setResult({ productName: productName || 'Your product', analysis: text });
      setTimeout(() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    } catch {
      setResult({ productName: 'Error', analysis: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async () => {
    if (!followUp.trim() || !result) return;
    setFollowUpLoading(true);
    try {
      const messages = [
        { role: 'user', content: `You previously analysed: ${result.productName}. Analysis: ${result.analysis}` },
        { role: 'assistant', content: result.analysis },
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

  const resetForm = () => {
    setResult(null); setIngredients(''); setProductName('');
    setPhoto(null); setPhotoName(''); setFollowUpAnswer(''); setFollowUp('');
    setTimeout(() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  function formatAnalysis(text: string) {
    return text.split('\n').map((line, i) => {
      const html = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
      if (line.trim().startsWith('- ')) return <li key={i} style={{ marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: html.trim().slice(2) }} />;
      if (/^\d+\./.test(line.trim())) return <li key={i} style={{ marginBottom: 6 }} dangerouslySetInnerHTML={{ __html: html.trim().replace(/^\d+\.\s*/, '') }} />;
      if (line.trim() === '') return <div key={i} style={{ height: 8 }} />;
      return <p key={i} style={{ margin: '0 0 4px' }} dangerouslySetInnerHTML={{ __html: html }} />;
    });
  }

  const canSubmit = inputMode === 'text' ? !!ingredients.trim() : !!photo;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px 24px 90px', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 620, maxHeight: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: ROSE_LIGHT, border: `1px solid ${ROSE_MID}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconFlask size={16} />
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Ingredient Decoder</h2>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Paste an ingredient list or photograph the packaging</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
        </div>

        {/* Scrollable content */}
        <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {!result ? (
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
                    {mode === 'text'
                      ? <><IconClipboard size={14} color={inputMode === mode ? '#0f172a' : '#94a3b8'} /> Paste text</>
                      : <><IconCamera size={14} color={inputMode === mode ? '#0f172a' : '#94a3b8'} /> Upload photo</>}
                  </button>
                ))}
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Product name <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
                </label>
                <input value={productName} onChange={e => setProductName(e.target.value)}
                  placeholder="e.g. COSRX Snail 96 Mucin Essence"
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 16, fontFamily: 'inherit', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = ROSE}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              {inputMode === 'text' && (
                <>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                      Ingredient list <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea value={ingredients} onChange={e => setIngredients(e.target.value)}
                      placeholder="Paste the full ingredient list here…"
                      rows={5} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 16, fontFamily: 'inherit', color: '#0f172a', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = ROSE}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#64748b', lineHeight: 1.5, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <IconLightbulb size={14} />
                    <span><strong>Tip:</strong> Find ingredient lists on brand websites, packaging, or apps like INCI Beauty or CosDNA.</span>
                  </div>
                </>
              )}

              {inputMode === 'photo' && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                    Photo of ingredient list <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
                  {!photo ? (
                    <button onClick={() => fileRef.current?.click()} style={{
                      width: '100%', padding: '28px 20px', border: '2px dashed #e2e8f0', borderRadius: 12,
                      background: '#fafafa', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, fontFamily: 'inherit',
                    }}
                      onMouseEnter={e => { (e.currentTarget).style.borderColor = ROSE; (e.currentTarget).style.background = ROSE_LIGHT; }}
                      onMouseLeave={e => { (e.currentTarget).style.borderColor = '#e2e8f0'; (e.currentTarget).style.background = '#fafafa'; }}
                    >
                      <IconCamera size={32} color={ROSE} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Take a photo or upload from library</span>
                      <span style={{ fontSize: 13, color: '#94a3b8' }}>Photo will be compressed automatically</span>
                    </button>
                  ) : (
                    <div style={{ border: `1.5px solid ${ROSE}44`, borderRadius: 12, padding: '14px 16px', background: ROSE_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
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
            </div>
          ) : (
            <div ref={resultsTopRef}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{result.productName}</h3>
                <button onClick={resetForm} style={{ padding: '6px 12px', background: ROSE_LIGHT, border: `1px solid ${ROSE_MID}`, borderRadius: 8, fontSize: 13, color: ROSE, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Decode another</button>
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.7, color: '#1e293b', listStylePosition: 'inside', marginBottom: 24 }}>
                {formatAnalysis(result.analysis)}
              </div>
              {followUpAnswer && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', marginBottom: 16, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                  {formatAnalysis(followUpAnswer)}
                </div>
              )}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Got a follow-up question?</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={followUp} onChange={e => setFollowUp(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleFollowUp()}
                    placeholder="e.g. Is this safe for sensitive skin?"
                    style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', color: '#0f172a', outline: 'none' }}
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
            </div>
          )}
        </div>

        {/* Sticky action button — input screen only */}
        {!result && (
          <div style={{ padding: '12px 24px 16px', borderTop: '1px solid #f1f5f9', background: '#fff', flexShrink: 0 }}>
            <button onClick={handleDecode} disabled={!canSubmit || loading} style={{
              width: '100%', padding: '14px', background: canSubmit && !loading ? ROSE : '#e2e8f0',
              color: canSubmit && !loading ? '#fff' : '#94a3b8',
              border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
              cursor: canSubmit && !loading ? 'pointer' : 'default', fontFamily: 'inherit', transition: 'all 0.15s ease',
            }}>
              {loading ? 'Analysing ingredients…' : 'Decode ingredients →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
