'use client';

import { useState, useEffect } from 'react';
import { UserProfile, RoutineProduct, SavedProduct, PriceResult } from '@/types';
import { generateId, addSavedProduct, removeSavedProduct, updateSavedProduct, getSavedProducts } from '@/lib/storage';

const ROSE = '#b5737a';
const ROSE_LIGHT = '#fdf2f3';
const ROSE_MID = '#f2d0d3';

const PRODUCT_TYPES = ['Cleanser', 'Toner', 'Serum', 'Eye cream', 'Moisturiser', 'SPF', 'Oil', 'Exfoliant', 'Mask', 'Treatment', 'Other'];

interface MySpaceProps {
  profile: UserProfile | null;
  routine: RoutineProduct[];
  savedProducts: SavedProduct[];
  country?: string;
  onEditProfile: () => void;
  onRoutineUpdate: (r: RoutineProduct[]) => void;
  onSavedProductsChange: (products: SavedProduct[]) => void;
  onResetAll: () => void;
}

const IconUser = ({ size = 18, color = ROSE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconList = ({ size = 18, color = ROSE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const IconBookmark = ({ size = 18, color = ROSE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconSearch = ({ size = 16, color = '#64748b' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconExternalLink = ({ size = 14, color = ROSE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const IconTrash = ({ size = 14, color = '#94a3b8' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const SOURCE_LABELS: Record<SavedProduct['source'], string> = {
  manual: 'Added manually',
  'reality-check': 'From Reality Check',
  'check-products': 'From Check Products',
  'ingredient-decoder': 'From Ingredient Decoder',
  chat: 'From chat',
};

function PriceCard({ result }: { result: PriceResult }) {
  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', flexDirection: 'column', gap: 6,
        background: '#fff', border: '1.5px solid #e2e8f0',
        borderRadius: 12, padding: '14px',
        textDecoration: 'none', transition: 'all 0.15s', flex: 1, minWidth: 0,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = ROSE; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 12px rgba(181,115,122,0.12)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'; }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.retailer}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{result.price}</div>
      {result.note && <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.3 }}>{result.note}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 'auto' }}>
        {result.inStock
          ? <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>● In stock</span>
          : <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>○ Check availability</span>
        }
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: ROSE, fontSize: 12, fontWeight: 600 }}>
        Buy now <IconExternalLink size={12} />
      </div>
    </a>
  );
}

function ProductCard({
  product, country, onRemove, onPriceUpdate,
}: {
  product: SavedProduct;
  country?: string;
  onRemove: () => void;
  onPriceUpdate: (results: PriceResult[]) => void;
}) {
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleFindPrice = async () => {
    setSearching(true);
    setError('');
    try {
      const res = await fetch('/api/price-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: product.name, country }),
      });
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        onPriceUpdate(data.results);
        setExpanded(true);
      } else {
        setError('No prices found. Try a more specific product name.');
      }
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const hasCachedResults = product.lastPriceSearch && product.lastPriceSearch.results.length > 0;
  const searchedAgo = product.lastPriceSearch
    ? Math.round((Date.now() - new Date(product.lastPriceSearch.searchedAt).getTime()) / 60000)
    : null;

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4, lineHeight: 1.3 }}>{product.name}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            {SOURCE_LABELS[product.source]} · {new Date(product.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </div>
        </div>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0, color: '#94a3b8' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'}>
          <IconTrash size={15} />
        </button>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        {hasCachedResults && !expanded && (
          <button onClick={() => setExpanded(true)} style={{
            width: '100%', padding: '10px', background: ROSE_LIGHT,
            border: `1px solid ${ROSE_MID}`, borderRadius: 10,
            fontSize: 13, color: ROSE, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Show last prices {searchedAgo !== null && searchedAgo < 60 ? `(${searchedAgo}m ago)` : ''}
          </button>
        )}

        {expanded && hasCachedResults && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
              {product.lastPriceSearch!.results.map((r, i) => (
                <PriceCard key={i} result={r} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setExpanded(false)} style={{
                flex: 1, padding: '8px', background: 'transparent',
                border: '1px solid #e2e8f0', borderRadius: 8,
                fontSize: 12, color: '#64748b', cursor: 'pointer', fontFamily: 'inherit',
              }}>Done</button>
              <button onClick={handleFindPrice} disabled={searching} style={{
                flex: 1, padding: '8px', background: searching ? '#e2e8f0' : ROSE,
                border: 'none', borderRadius: 8,
                fontSize: 12, color: searching ? '#94a3b8' : '#fff',
                fontWeight: 600, cursor: searching ? 'default' : 'pointer', fontFamily: 'inherit',
              }}>
                {searching ? 'Searching…' : 'Refresh prices'}
              </button>
            </div>
          </div>
        )}

        {!hasCachedResults && (
          <button onClick={handleFindPrice} disabled={searching} style={{
            width: '100%', padding: '11px', background: searching ? '#e2e8f0' : ROSE,
            border: 'none', borderRadius: 10,
            fontSize: 13, color: searching ? '#94a3b8' : '#fff',
            fontWeight: 600, cursor: searching ? 'default' : 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {searching ? (
              <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Searching retailers…</>
            ) : (
              <><IconSearch size={14} color="#fff" /> Find best price</>
            )}
          </button>
        )}

        {error && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 8, textAlign: 'center' }}>{error}</div>}
      </div>
    </div>
  );
}

export default function MySpace({
  profile, routine, savedProducts: initialSavedProducts, country,
  onEditProfile, onRoutineUpdate, onSavedProductsChange, onResetAll,
}: MySpaceProps) {
  const [tab, setTab] = useState<'profile' | 'routine' | 'saved'>('profile');

  // Routine tab state
  const [addingProduct, setAddingProduct] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Serum');
  const [newTime, setNewTime] = useState<'AM' | 'PM' | 'Both'>('AM');
  const [routineTab, setRoutineTab] = useState<'AM' | 'PM'>('AM');

  // Saved tab state
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>(() => getSavedProducts());
  const [newProductName, setNewProductName] = useState('');
  const [addingSaved, setAddingSaved] = useState(false);

  useEffect(() => {
    setSavedProducts(getSavedProducts());
  }, [initialSavedProducts]);

  const amRoutine = routine.filter(p => p.timeOfDay === 'AM' || p.timeOfDay === 'Both');
  const pmRoutine = routine.filter(p => p.timeOfDay === 'PM' || p.timeOfDay === 'Both');
  const displayRoutine = routineTab === 'AM' ? amRoutine : pmRoutine;

  const handleAddProduct = () => {
    if (!newName.trim()) return;
    const updated = [...routine, {
      id: generateId(), name: newName.trim(), type: newType,
      timeOfDay: newTime, step: routine.length + 1,
    }];
    onRoutineUpdate(updated);
    setNewName(''); setNewType('Serum'); setNewTime('AM'); setAddingProduct(false);
  };

  const handleRemoveProduct = (id: string) => {
    onRoutineUpdate(routine.filter(p => p.id !== id));
  };

  const handleAddSaved = () => {
    if (!newProductName.trim()) return;
    addSavedProduct({ name: newProductName.trim(), source: 'manual' });
    const updated = getSavedProducts();
    setSavedProducts(updated);
    onSavedProductsChange(updated);
    setNewProductName('');
    setAddingSaved(false);
  };

  const handleRemoveSaved = (id: string) => {
    removeSavedProduct(id);
    const updated = getSavedProducts();
    setSavedProducts(updated);
    onSavedProductsChange(updated);
  };

  const handlePriceUpdate = (id: string, results: PriceResult[]) => {
    updateSavedProduct(id, { lastPriceSearch: { searchedAt: new Date().toISOString(), results } });
    const updated = getSavedProducts();
    setSavedProducts(updated);
    onSavedProductsChange(updated);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 40px' }}>

        <h1 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>My Space</h1>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {(['profile', 'routine', 'saved'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '8px 12px', borderRadius: 9,
              background: tab === t ? '#fff' : 'transparent',
              border: 'none', fontSize: 13, fontWeight: tab === t ? 700 : 500,
              color: tab === t ? '#0f172a' : '#94a3b8',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}>
              {t === 'profile' ? 'Profile' : t === 'routine' ? 'My Routine' : 'Saved'}
            </button>
          ))}
        </div>

        {/* ── Profile tab ── */}
        {tab === 'profile' && (
          <div>
            {profile?.completed ? (
              <>
                {/* Gradient summary card */}
                <div style={{
                  background: `linear-gradient(135deg, ${ROSE} 0%, #9a5a62 100%)`,
                  borderRadius: 18, padding: '22px', marginBottom: 16,
                  boxShadow: '0 4px 20px rgba(181,115,122,0.25)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IconUser size={24} color="#fff" />
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 3, letterSpacing: '-0.2px' }}>
                          {Array.isArray(profile.skinType) ? profile.skinType.join(', ') : profile.skinType} skin
                        </div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                          {profile.experience}
                        </div>
                      </div>
                    </div>
                    <button onClick={onEditProfile} style={{
                      background: 'rgba(255,255,255,0.2)', border: 'none',
                      borderRadius: 9, padding: '8px 16px',
                      color: '#fff', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                    }}>Edit</button>
                  </div>
                </div>

                {/* Info rows */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
                  {[
                    { label: 'Skin type', value: Array.isArray(profile.skinType) ? profile.skinType.join(', ') : profile.skinType },
                    { label: 'Concerns', value: profile.concerns?.join(', ') },
                    { label: 'Sensitivities', value: profile.sensitivities && profile.sensitivities !== 'None' ? profile.sensitivities : 'None listed' },
                    { label: 'Experience', value: profile.experience },
                    { label: 'Age range', value: profile.age },
                    { label: 'Country', value: profile.country },
                  ].filter(row => row.value).map((row, i, arr) => (
                    <div key={row.label} style={{
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                      padding: '13px 16px', gap: 12,
                      borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
                    }}>
                      <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500, flexShrink: 0 }}>{row.label}</div>
                      <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, textAlign: 'right' }}>{row.value}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div onClick={onEditProfile} style={{
                background: '#fff', border: `1.5px dashed ${ROSE_MID}`, borderRadius: 18,
                padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 16,
                cursor: 'pointer', marginBottom: 16,
              }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = ROSE}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = ROSE_MID}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: ROSE_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconUser size={26} color={ROSE} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>No profile yet</div>
                  <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                    Takes 2 minutes — unlocks personalised skincare advice tailored to your skin type and concerns.
                  </div>
                </div>
                <div style={{ fontSize: 14, color: ROSE, fontWeight: 700, flexShrink: 0 }}>Set up →</div>
              </div>
            )}

            <button onClick={onResetAll} style={{ background: 'none', border: 'none', padding: '6px 0', fontSize: 12, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit' }}>
              Reset everything
            </button>
          </div>
        )}

        {/* ── Routine tab ── */}
        {tab === 'routine' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <IconList size={14} color="#94a3b8" />
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8' }}>My Routine</span>
              </div>
              <button onClick={() => setAddingProduct(v => !v)} style={{
                background: addingProduct ? ROSE : 'none', border: 'none',
                cursor: 'pointer', fontSize: 12, color: addingProduct ? '#fff' : ROSE,
                fontWeight: 600, fontFamily: 'inherit',
                padding: addingProduct ? '4px 10px' : '0', borderRadius: 8,
              }}>
                {addingProduct ? '✕ Cancel' : '+ Add product'}
              </button>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              {/* AM/PM tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {(['AM', 'PM'] as const).map(t => (
                  <button key={t} onClick={() => setRoutineTab(t)} style={{
                    padding: '5px 16px', borderRadius: 20,
                    background: routineTab === t ? ROSE : '#f1f5f9',
                    color: routineTab === t ? '#fff' : '#64748b',
                    border: 'none', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    {t === 'AM' ? '☀ Morning' : '☾ Evening'}
                    {t === 'AM' && amRoutine.length > 0 && (
                      <span style={{ marginLeft: 6, background: routineTab === 'AM' ? 'rgba(255,255,255,0.3)' : ROSE, color: '#fff', borderRadius: 8, padding: '1px 5px', fontSize: 10 }}>{amRoutine.length}</span>
                    )}
                    {t === 'PM' && pmRoutine.length > 0 && (
                      <span style={{ marginLeft: 6, background: routineTab === 'PM' ? 'rgba(255,255,255,0.3)' : ROSE, color: '#fff', borderRadius: 8, padding: '1px 5px', fontSize: 10 }}>{pmRoutine.length}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Add product form */}
              {addingProduct && (
                <div style={{ background: ROSE_LIGHT, border: `1px solid ${ROSE_MID}`, borderRadius: 12, padding: '14px', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: ROSE, marginBottom: 10 }}>Add a product</div>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddProduct()}
                    placeholder="Product name (e.g. CeraVe Moisturising Cream)"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16, fontFamily: 'inherit', marginBottom: 8, boxSizing: 'border-box', outline: 'none', background: '#fff' }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <select value={newType} onChange={e => setNewType(e.target.value)} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16, fontFamily: 'inherit', background: '#fff', outline: 'none' }}>
                      {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select value={newTime} onChange={e => setNewTime(e.target.value as 'AM' | 'PM' | 'Both')} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16, fontFamily: 'inherit', background: '#fff', outline: 'none' }}>
                      <option value="AM">Morning (AM)</option>
                      <option value="PM">Evening (PM)</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                  <button onClick={handleAddProduct} disabled={!newName.trim()} style={{ width: '100%', padding: '9px', background: newName.trim() ? ROSE : '#e2e8f0', border: 'none', borderRadius: 8, color: newName.trim() ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: 600, cursor: newName.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                    Add to routine
                  </button>
                </div>
              )}

              {/* Product list */}
              {displayRoutine.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><IconList size={24} color="#cbd5e1" /></div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>No {routineTab === 'AM' ? 'morning' : 'evening'} products yet</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>Tap &ldquo;+ Add product&rdquo; above to build your routine</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {displayRoutine.map((p, i) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#f8fafc', borderRadius: 10 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: ROSE, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{p.type || ''}</div>
                      <button onClick={() => handleRemoveProduct(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: 16, padding: '0 2px', flexShrink: 0, lineHeight: 1 }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#cbd5e1'}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Saved tab ── */}
        {tab === 'saved' && (
          <div>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#64748b' }}>
              Save products you want to buy — then find the best price with one tap.
            </p>

            {/* Add product */}
            {addingSaved ? (
              <div style={{ background: '#fff', border: `1.5px solid ${ROSE_MID}`, borderRadius: 14, padding: '16px', marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: ROSE, marginBottom: 10 }}>Add a product</div>
                <input
                  value={newProductName}
                  onChange={e => setNewProductName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddSaved()}
                  placeholder="e.g. CeraVe Moisturising Cream 454g"
                  autoFocus
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 16, fontFamily: 'inherit', color: '#0f172a', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
                  onFocus={e => e.target.style.borderColor = ROSE}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setAddingSaved(false); setNewProductName(''); }} style={{
                    flex: 1, padding: '9px', background: 'transparent',
                    border: '1px solid #e2e8f0', borderRadius: 8,
                    fontSize: 13, color: '#64748b', cursor: 'pointer', fontFamily: 'inherit',
                  }}>Cancel</button>
                  <button onClick={handleAddSaved} disabled={!newProductName.trim()} style={{
                    flex: 2, padding: '9px', background: newProductName.trim() ? ROSE : '#e2e8f0',
                    border: 'none', borderRadius: 8,
                    fontSize: 13, color: newProductName.trim() ? '#fff' : '#94a3b8',
                    fontWeight: 600, cursor: newProductName.trim() ? 'pointer' : 'default', fontFamily: 'inherit',
                  }}>Add product</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingSaved(true)} style={{
                width: '100%', padding: '13px',
                background: ROSE, border: 'none', borderRadius: 12,
                fontSize: 14, color: '#fff', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginBottom: 20,
              }}>
                <IconBookmark size={16} color="#fff" /> Save a product
              </button>
            )}

            {/* Products list */}
            {savedProducts.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <IconBookmark size={32} color="#cbd5e1" />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>No saved products yet</div>
                <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
                  Save products from the tools or chat, or add them manually above. Then find the best price with one tap.
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {savedProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      country={country}
                      onRemove={() => handleRemoveSaved(product.id)}
                      onPriceUpdate={(results) => handlePriceUpdate(product.id, results)}
                    />
                  ))}
                </div>
                <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                  Prices are indicative and may vary. Always check the retailer for the current price.
                </div>
              </>
            )}
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
