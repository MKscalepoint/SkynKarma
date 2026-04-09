'use client';

import { useEffect, useRef } from 'react';
import { UserProfile, RoutineProduct, ChatSession } from '@/types';

const TEAL = '#b5737a';
const TEAL_LIGHT = '#fdf2f3';
const TEAL_MID = '#f2d0d3';

interface DashboardProps {
  profile: UserProfile;
  routine: RoutineProduct[];
  sessions: ChatSession[];
  onOpenChat: (initialMessage?: string) => void;
  onOpenSession: (session: ChatSession) => void;
  onOpenIngredients: () => void;
  onOpenCheckProducts: () => void;
  onOpenScamCheck: () => void;
  onEditProfile: () => void;
  onResetAll: () => void;
  onRoutineUpdate: (r: RoutineProduct[]) => void;
  onOpenMySpace: () => void;
  onRegisterScrollToRoutine?: (fn: () => void) => void;
}

const SUGGESTIONS = [
  'Help me build my skin care routine',
  'Can I use retinol + vitamin C?',
  'What does niacinamide do?',
  'Is my routine causing breakouts?',
];

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

const IconUser = ({ size = 18, color = TEAL }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconList = ({ size = 18, color = TEAL }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const IconBookmark = ({ size = 18, color = TEAL }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);

export default function Dashboard({
  profile, routine, sessions, onOpenChat, onOpenSession, onOpenIngredients,
  onOpenCheckProducts, onOpenScamCheck, onEditProfile, onResetAll, onOpenMySpace,
  onRegisterScrollToRoutine,
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

  const amRoutine = routine.filter(p => p.timeOfDay === 'AM' || p.timeOfDay === 'Both');
  const pmRoutine = routine.filter(p => p.timeOfDay === 'PM' || p.timeOfDay === 'Both');

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
    el.style.boxShadow = '0 4px 16px rgba(181,115,122,0.12)';
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

        {/* ── Chat card ── */}
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
              color: '#fff', fontWeight: 800, fontSize: 13,
            }}>SK</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>Ask skynkarma</div>
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
              {sessions.length > 0 && (
                <div style={{ marginTop: 14, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Recent</div>
                  {sessions.slice(0, 3).map(s => (
                    <div key={s.id} onClick={() => onOpenSession(s)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f8fafc', cursor: 'pointer', gap: 8 }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = '0.7'}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = '1'}>
                      <span style={{ fontSize: 13, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{s.title}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{new Date(s.updatedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── My Space summary card ── */}
        <div onClick={onOpenMySpace} style={{ ...cardBase, padding: '18px', marginBottom: 20 }}
          onMouseEnter={onCardEnter} onMouseLeave={onCardLeave}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8' }}>My Space</div>
            <span style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>View all →</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {/* Profile */}
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: TEAL_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconUser size={14} color={TEAL} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Profile</div>
              <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.3 }}>
                {profile.completed
                  ? (Array.isArray(profile.skinType) ? profile.skinType[0] : profile.skinType) + ' skin'
                  : 'Not set up'}
              </div>
            </div>

            {/* Routine */}
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: TEAL_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconList size={14} color={TEAL} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Routine</div>
              <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.3 }}>
                {routine.length > 0
                  ? `${amRoutine.length} AM · ${pmRoutine.length} PM`
                  : 'No products yet'}
              </div>
            </div>

            {/* Saved */}
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: TEAL_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconBookmark size={14} color={TEAL} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Saved</div>
              <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.3 }}>
                Tap to find best prices
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

      </div>
    </div>
  );
}