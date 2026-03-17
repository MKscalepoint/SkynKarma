'use client';

import { useState, useRef } from 'react';
import { UserProfile, ProductEntry, AnalysisReport } from '@/types';
import { generateId } from '@/lib/storage';

const ROSE = '#b5737a';
const ROSE_LIGHT = '#fdf2f3';
const ROSE_MID = '#f2d0d3';

const PRODUCT_TYPES = [
  'Cleanser', 'Toner', 'Essence', 'Serum', 'Eye Cream',
  'Moisturiser', 'Face Oil', 'SPF / Sunscreen', 'Exfoliant', 'Mask', 'Other'
];

interface CheckProductsProps {
  profile: UserProfile | null;
  onClose: () => void;
}

interface ProductEntryWithPhoto extends ProductEntry {
  photo?: string;
  photoName?: string;
}

const IconShieldCheck = ({ size = 16, color = ROSE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const IconCamera = ({ size = 14, color = ROSE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
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

export default function CheckProducts({ profile, onClose }: CheckProductsProps) {
  const [products, setProducts] = useState<ProductEntryWithPhoto[]>([
    { id: generateId(), name: '', type: 'Serum', ingredients: '' },
    { id: generateId(), name: '', type: 'Moisturiser', ingredients: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [showIngredients, setShowIngredients] = useState<Record<string, boolean>>({});
  const [followUp, setFollowUp] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const resultsTopRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const addProduct = () => setProducts(prev => [...prev, { id: generateId(), name: '', type: 'Serum', ingredients: '' }]);
  const removeProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));
  const updateProduct = (id: string, field: keyof ProductEntryWithPhoto, value: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handlePhotoSelect = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const raw = (reader.result as string).split(',')[1];
      const compressed = await compressImage(raw);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, photo: compressed, photoName: file.name } : p));
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyse = async () => {
    const filled = products.filter(p => p.name.trim());
    if (filled.length < 2) return;
    setLoading(true);
    setReport(null);
    setFollowUpAnswer('');
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: filled, profile }),
      });
      const data = await res.json();
      setReport(data);
      setTimeout(() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async () => {
    if (!followUp.trim() || !report) return;
    setFollowUpLoading(true);
    try {
      const productList = products.filter(p => p.name.trim()).map(p => p.name).join(', ');
      const messages = [
        { role: 'user', content: `You analysed these products: ${productList}. Summary: ${report.summary}` },
        { role: 'assistant', content: report.summary },
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

  // Name required — photo is supplementary only
  const filledCount = products.filter(p => p.name.trim()).length;

  const severityColor = (s: string) => s === 'high' ? '#ef4444' : s === 'medium' ? '#f59e0b' : '#10b981';
  const severityBg = (s: string) => s === 'high' ? '#fef2f2' : s === 'medium' ? '#fffbeb' : '#f0fdf4';
  const severityBorder = (s: string) => s === 'high' ? '#fecaca' : s === 'medium' ? '#fde68a' : '#bbf7d0';

  function formatText(text: string) {
    return text.split('\n').map((line, i) => {
      const html = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      if (line.trim() === '') return <div key={i} style={{ height: 6 }} />;
      return <p key={i} style={{ margin: '0 0 4px' }} dangerouslySetInnerHTML={{ __html: html }} />;
    });
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px 24px 90px', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 700, maxHeight: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: ROSE_LIGHT, border: `1px solid ${ROSE_MID}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconShieldCheck size={16} />
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Check My Products</h2>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Enter product names below — add photos or ingredients for more accuracy</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
        </div>

        <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {!report ? (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                {products.map((p, i) => (
                  <div key={p.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                    {/* Product name row — stacked on mobile */}
                    <div style={{ padding: '12px 14px', background: '#fafafa' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 6, background: ROSE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                        {products.length > 1 && (
                          <button onClick={() => removeProduct(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: 18, padding: 0, flexShrink: 0, marginLeft: 'auto' }}
                            onMouseEnter={e => (e.target as HTMLElement).style.color = '#ef4444'}
                            onMouseLeave={e => (e.target as HTMLElement).style.color = '#cbd5e1'}>×</button>
                        )}
                      </div>
                      <input value={p.name} onChange={e => updateProduct(p.id, 'name', e.target.value)}
                        placeholder="Product name e.g. The Ordinary Niacinamide 10%"
                        style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 14, fontFamily: 'inherit', color: '#0f172a', outline: 'none', fontWeight: 500, boxSizing: 'border-box', background: '#fff' }}
                        onFocus={e => e.target.style.borderColor = ROSE}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                      <select value={p.type} onChange={e => updateProduct(p.id, 'type', e.target.value)}
                        style={{ marginTop: 8, width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 10px', fontSize: 13, fontFamily: 'inherit', color: '#64748b', background: '#fff', outline: 'none' }}>
                        {PRODUCT_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <button onClick={() => setShowIngredients(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                        <span style={{ color: ROSE, fontSize: 14 }}>{showIngredients[p.id] ? '−' : '+'}</span>
                        {showIngredients[p.id] ? 'Hide ingredients' : 'Add ingredient list'}
                      </button>
                      <span style={{ color: '#e2e8f0' }}>|</span>
                      <input ref={el => { fileRefs.current[p.id] = el; }} type="file" accept="image/*"
                        onChange={e => handlePhotoSelect(p.id, e)} style={{ display: 'none' }} />
                      {!p.photo ? (
                        <button onClick={() => fileRefs.current[p.id]?.click()}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                          <IconCamera size={13} color={ROSE} /> Photo of ingredients
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, color: ROSE, fontWeight: 600 }}>✓ Photo added</span>
                          <button onClick={() => setProducts(prev => prev.map(pr => pr.id === p.id ? { ...pr, photo: undefined, photoName: undefined } : pr))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#94a3b8', fontFamily: 'inherit', padding: 0 }}>remove</button>
                        </div>
                      )}
                    </div>

                    {showIngredients[p.id] && (
                      <div style={{ borderTop: '1px solid #f1f5f9', padding: '10px 14px' }}>
                        <textarea value={p.ingredients} onChange={e => updateProduct(p.id, 'ingredients', e.target.value)}
                          placeholder="Paste ingredient list (optional — improves accuracy)"
                          rows={3} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', color: '#0f172a', outline: 'none', resize: 'vertical', lineHeight: 1.5, boxSizing: 'border-box' }}
                          onFocus={e => e.target.style.borderColor = ROSE}
                          onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={addProduct} style={{
                width: '100%', padding: '10px', background: 'transparent',
                border: '1.5px dashed #e2e8f0', borderRadius: 10,
                fontSize: 14, color: '#64748b', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 14, transition: 'all 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget).style.borderColor = ROSE; (e.currentTarget).style.color = ROSE; }}
                onMouseLeave={e => { (e.currentTarget).style.borderColor = '#e2e8f0'; (e.currentTarget).style.color = '#64748b'; }}
              >+ Add another product</button>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <IconLightbulb size={14} />
                <span><strong>Tip:</strong> Product names are required. Add ingredient lists or photos for more accurate conflict detection.</span>
              </div>

              <button onClick={handleAnalyse} disabled={filledCount < 2 || loading} style={{
                width: '100%', padding: '14px',
                background: filledCount >= 2 && !loading ? ROSE : '#e2e8f0',
                color: filledCount >= 2 && !loading ? '#fff' : '#94a3b8',
                border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
                cursor: filledCount >= 2 && !loading ? 'pointer' : 'default', fontFamily: 'inherit', transition: 'all 0.15s',
              }}>
                {loading ? 'Analysing your products…' : filledCount < 2 ? 'Enter at least 2 product names to analyse' : `Analyse ${filledCount} products →`}
              </button>
            </div>
          ) : (
            <div ref={resultsTopRef}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Your Compatibility Report</h3>
                <button onClick={() => { setReport(null); setFollowUpAnswer(''); setTimeout(() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50); }} style={{ padding: '6px 12px', background: ROSE_LIGHT, border: `1px solid ${ROSE_MID}`, borderRadius: 8, fontSize: 13, color: ROSE, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>← Edit products</button>
              </div>

              <div style={{ background: ROSE_LIGHT, border: `1px solid ${ROSE_MID}`, borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: ROSE, letterSpacing: '0.5px', marginBottom: 6, textTransform: 'uppercase' }}>Summary</div>
                <p style={{ margin: 0, fontSize: 15, color: '#0f172a', lineHeight: 1.6 }}>{report.summary}</p>
              </div>

              {report.conflicts && report.conflicts.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Conflicts & Cautions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {report.conflicts.map((c, i) => (
                      <div key={i} style={{ background: severityBg(c.severity), border: `1px solid ${severityBorder(c.severity)}`, borderRadius: 10, padding: '12px 14px', borderLeft: `4px solid ${severityColor(c.severity)}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: severityColor(c.severity), textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.severity} priority</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{c.products.join(' + ')}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{c.issue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.conflicts?.length === 0 && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>✓</span>
                  <span style={{ fontSize: 14, color: '#065f46', fontWeight: 500 }}>No conflicts detected — this is a compatible combination!</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {[{ label: 'Morning Routine', items: report.amRoutine }, { label: 'Evening Routine', items: report.pmRoutine }].map(({ label, items }) => (
                  <div key={label} style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                    <div style={{ padding: '12px 14px' }}>
                      {items?.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <div style={{ width: 20, height: 20, borderRadius: 5, background: ROSE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                          <span style={{ fontSize: 13, color: '#0f172a' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Recommended Layering Order</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {report.layeringOrder?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 14px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 10 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: ROSE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{item.step}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{item.product}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{item.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {report.recommendations?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Recommendations</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {report.recommendations.map((r, i) => (
                      <div key={i} style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 10, fontSize: 14, color: '#374151', lineHeight: 1.5, display: 'flex', gap: 8 }}>
                        <span style={{ color: ROSE, flexShrink: 0 }}>→</span>{r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {followUpAnswer && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', marginBottom: 16, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                  {formatText(followUpAnswer)}
                </div>
              )}

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Got a follow-up question?</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={followUp} onChange={e => setFollowUp(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleFollowUp()}
                    placeholder="e.g. Can I use these in the same routine?"
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
      </div>
    </div>
  );
}
