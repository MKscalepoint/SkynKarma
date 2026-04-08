'use client';

import { useState, useEffect, useRef } from 'react';
import { UserProfile, RoutineProduct } from '@/types';
import { generateId } from '@/lib/storage';

const TEAL = '#b5737a';
const TEAL_LIGHT = '#fdf2f3';
const TEAL_MID = '#f2d0d3';

interface DashboardProps {
  profile: UserProfile;
  routine: RoutineProduct[];
  onOpenChat: (initialMessage?: string) => void;
  onOpenIngredients: () => void;
  onOpenCheckProducts: () => void;
  onOpenScamCheck: () => void;
  onEditProfile: () => void;
  onResetAll: () => void;
  onRoutineUpdate: (r: RoutineProduct[]) => void;
  onRegisterScrollToRoutine?: (fn: () => void) => void;
}

const SUGGESTIONS = [
  'Help me build my skin care routine',
  'Can I use retinol + vitamin C?',
  'What does niacinamide do?',
  'Is my routine causing breakouts?',
];

const PRODUCT_TYPES = ['Cleanser', 'Toner', 'Serum', 'Eye cream', 'Moisturiser', 'SPF', 'Oil', 'Exfoliant', 'Mask', 'Treatment', 'Other'];

// ── Inline SVG icons ──────────────────────────────────────────────
const IconFlask = ({ size = 18, color = TEAL }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/>
    <path d="M14 9.3a6.5 6.5 0 1 1-4 0"/>
  </svg>
);

const IconShieldCheck = ({ size = 18, color = TEAL }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const IconWarning = ({ size = 18, color = TEAL }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconList = ({ size = 18, color = TEAL }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const IconUser = ({ size = 18, color = TEAL }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function Dashboard({
  profile, routine, onOpenChat, onOpenIngredients,
  onOpenCheckProducts, onOpenScamCheck, onEditProfile, onResetAll, onRoutineUpdate, onRegisterScrollToRoutine,
}: DashboardProps) {

  const routineSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onRegisterScrollToRoutine) {
      onRegisterScrollToRoutine(() => {
        routineSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [onRegisterScrollToRoutine]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const [addingProduct, setAddingProduct] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Serum');
  const [newTime, setNewTime] = useState<'AM' | 'PM' | 'Both'>('AM');
  const [routineTab, setRoutineTab] = useState<'AM' | 'PM'>('AM');

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

  const IconBox = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      width: 36, height: 36, borderRadius: 9, background: TEAL_LIGHT,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>{children}</div>
  );

  const FreeBadge = () => (
    <span style={{
      background: TEAL_LIGHT, border: `1px solid ${TEAL_MID}`,
      color: TEAL, fontSize: 9, fontWeight: 700,
      padding: '2px 7px', borderRadius: 8, letterSpacing: '0.2px',
    }}>FREE</span>
  );

  const cardBase: React.CSSProperties = {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
    cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.15s',
  };

  const onCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget as HTMLDivElement;
    el.style.borderColor = TEAL;
    el.style.boxShadow = '0 4px 16px rgba(13,148,136,0.12)';
    el.style.transform = 'translateY(-1px)';
  };
  const onCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget as HTMLDivElement;
    el.style.borderColor = '#e2e8f0';
    el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
    el.style.transform = 'translateY(0)';
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 40px' }}>

        {/* Greeting */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
            {greeting} 👋
          </h1>
          {profile.completed ? (
            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>What do you want to work on today?</p>
          ) : (
            <div style={{ marginTop: 10, background: TEAL_LIGHT, border: `1px solid ${TEAL_MID}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Set up your skin profile</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>Takes 2 minutes — unlocks personalised advice</div>
              </div>
              <button onClick={onEditProfile} style={{ background: TEAL, border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Start →</button>
            </div>
          )}
        </div>

        {/* Chat card */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18,
          padding: '20px', marginBottom: 20, position: 'relative', overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, ${TEAL}, #06b6d4)`, borderRadius: '18px 18px 0 0',
          }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: TEAL, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 17,
            }}>S</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>Ask Skyn Karma</div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14, lineHeight: 1.5 }}>
                {profile.completed
                  ? `Personalised advice based on your ${Array.isArray(profile.skinType) ? profile.skinType.join(', ').toLowerCase() : profile.skinType?.toLowerCase()} skin profile`
                  : "Ask me anything — I'm your AI advisor — set up your profile for personalised advice"}
              </div>
              <div onClick={() => onOpenChat()} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#f8fafc', border: '1.5px solid #e2e8f0',
                borderRadius: 12, padding: '11px 14px', cursor: 'text', marginBottom: 12,
              }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = TEAL}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'}
              >
                <span style={{ flex: 1, fontSize: 14, color: '#94a3b8' }}>Ask about ingredients, routines, products…</span>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, background: TEAL,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 14, flexShrink: 0,
                }}>→</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => onOpenChat(s)} style={{
                    background: TEAL_LIGHT, border: `1px solid ${TEAL_MID}`,
                    color: TEAL, fontSize: 12, fontWeight: 500,
                    padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
                    fontFamily: 'inherit', whiteSpace: 'nowrap',
                  }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tools ── */}
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', marginBottom: 10 }}>
          Tools
        </div>

        {/* Hero: Ingredient Decoder */}
        <div onClick={onOpenIngredients} style={{ ...cardBase, padding: '16px', marginBottom: 10 }}
          onMouseEnter={onCardEnter} onMouseLeave={onCardLeave}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <IconBox><IconFlask size={18} /></IconBox>
            <FreeBadge />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>Ingredient Decoder</div>
          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
            Photograph or paste any product label — get a plain-English breakdown of every ingredient and what it actually does for your skin.
          </div>
          <div style={{ fontSize: 12, color: TEAL, fontWeight: 600, marginTop: 10 }}>Open →</div>
        </div>

        {/* 2-col: Check Products + Reality Check */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <div onClick={onOpenCheckProducts}
            style={{ ...cardBase, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}
            onMouseEnter={onCardEnter} onMouseLeave={onCardLeave}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <IconBox><IconShieldCheck size={16} /></IconBox>
              <FreeBadge />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Check Products</div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>Find conflicts & layering order</div>
            <div style={{ fontSize: 12, color: TEAL, fontWeight: 600, marginTop: 'auto' }}>Open →</div>
          </div>

          <div onClick={onOpenScamCheck}
            style={{ ...cardBase, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}
            onMouseEnter={onCardEnter} onMouseLeave={onCardLeave}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <IconBox><IconWarning size={16} /></IconBox>
              <FreeBadge />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Reality Check</div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>Seen it on TikTok or Instagram? Find out if it&apos;s worth your money.</div>
            <div style={{ fontSize: 12, color: TEAL, fontWeight: 600, marginTop: 'auto' }}>Open →</div>
          </div>
        </div>

        {/* ── Routine ── */}
        <div ref={routineSectionRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <IconList size={13} color="#94a3b8" />
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8' }}>My Routine</div>
          </div>
          <button onClick={() => setAddingProduct(v => !v)} style={{
            background: addingProduct ? TEAL : 'none', border: 'none',
            cursor: 'pointer', fontSize: 12, color: addingProduct ? '#fff' : TEAL,
            fontWeight: 600, fontFamily: 'inherit',
            padding: addingProduct ? '4px 10px' : '0', borderRadius: 8,
          }}>
            {addingProduct ? '✕ Cancel' : '+ Add product'}
          </button>
        </div>

        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
          padding: '16px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {(['AM', 'PM'] as const).map(tab => (
              <button key={tab} onClick={() => setRoutineTab(tab)} style={{
                padding: '5px 16px', borderRadius: 20,
                background: routineTab === tab ? TEAL : '#f1f5f9',
                color: routineTab === tab ? '#fff' : '#64748b',
                border: 'none', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {tab === 'AM' ? '☀ Morning' : '☾ Evening'}
                {tab === 'AM' && amRoutine.length > 0 && (
                  <span style={{ marginLeft: 6, background: routineTab === 'AM' ? 'rgba(255,255,255,0.3)' : TEAL, color: '#fff', borderRadius: 8, padding: '1px 5px', fontSize: 10 }}>{amRoutine.length}</span>
                )}
                {tab === 'PM' && pmRoutine.length > 0 && (
                  <span style={{ marginLeft: 6, background: routineTab === 'PM' ? 'rgba(255,255,255,0.3)' : TEAL, color: '#fff', borderRadius: 8, padding: '1px 5px', fontSize: 10 }}>{pmRoutine.length}</span>
                )}
              </button>
            ))}
          </div>

          {addingProduct && (
            <div style={{ background: TEAL_LIGHT, border: `1px solid ${TEAL_MID}`, borderRadius: 12, padding: '14px', marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TEAL, marginBottom: 10 }}>Add a product</div>
              <input value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddProduct()}
                placeholder="Product name (e.g. CeraVe Moisturising Cream)"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, fontFamily: 'inherit', marginBottom: 8, boxSizing: 'border-box', outline: 'none', background: '#fff' }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <select value={newType} onChange={e => setNewType(e.target.value)} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, fontFamily: 'inherit', background: '#fff', outline: 'none' }}>
                  {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={newTime} onChange={e => setNewTime(e.target.value as 'AM' | 'PM' | 'Both')} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, fontFamily: 'inherit', background: '#fff', outline: 'none' }}>
                  <option value="AM">Morning (AM)</option>
                  <option value="PM">Evening (PM)</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <button onClick={handleAddProduct} disabled={!newName.trim()} style={{ width: '100%', padding: '9px', background: newName.trim() ? TEAL : '#e2e8f0', border: 'none', borderRadius: 8, color: newName.trim() ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: 600, cursor: newName.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                Add to routine
              </button>
            </div>
          )}

          {displayRoutine.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><IconList size={24} color="#cbd5e1" /></div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>No {routineTab === 'AM' ? 'morning' : 'evening'} products yet</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Tap &ldquo;+ Add product&rdquo; above to build your routine</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {displayRoutine.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#f8fafc', borderRadius: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
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

        {/* ── Profile card ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          <IconUser size={13} color="#94a3b8" />
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8' }}>My Profile</div>
        </div>
        {profile.completed ? (
          <div style={{
            background: `linear-gradient(135deg, ${TEAL} 0%, #9a5a62 100%)`,
            borderRadius: 16, padding: '18px', display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 4px 16px rgba(181,115,122,0.2)',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconUser size={22} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
                {profile.skinType} skin · {profile.concerns?.slice(0, 2).join(', ')}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
                {profile.experience} · {profile.age}{profile.sensitivities && profile.sensitivities !== 'None' ? ` · ${profile.sensitivities}` : ''}
              </div>
            </div>
            <button onClick={onEditProfile} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '7px 14px', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Edit</button>
          </div>
        ) : (
          <div onClick={onEditProfile} style={{
            background: '#fff', border: `1.5px dashed ${TEAL_MID}`, borderRadius: 16,
            padding: '20px', display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'pointer',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = TEAL}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = TEAL_MID}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: TEAL_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconUser size={22} color={TEAL} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>No profile yet</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Set up your skin profile for tailored advice</div>
            </div>
            <div style={{ fontSize: 13, color: TEAL, fontWeight: 600, flexShrink: 0 }}>Set up →</div>
          </div>
        )}
        <button onClick={onResetAll} style={{ background: 'none', border: 'none', padding: '6px 0 0', fontSize: 12, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>Reset everything</button>

      </div>
    </div>
  );
}
