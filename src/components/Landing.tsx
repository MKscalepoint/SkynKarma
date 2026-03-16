'use client';

import { useState } from 'react';

const ROSE = '#b5737a';
const ROSE_LIGHT = '#fdf2f3';
const ROSE_MID = '#f2d0d3';

const FAQS = [
  {
    q: "How is advice personalised to me?",
    a: "When you first join, you answer 5 quick questions about your skin type, main concerns, experience level, age range, and any sensitivities. Skyn Karma uses that profile to tailor every single response — so if you have oily, acne-prone skin, you'll never get advice designed for dry or mature skin. The more you use it, the more context builds up, making recommendations increasingly specific to you."
  },
  {
    q: "How accurate is the ingredient analysis?",
    a: "Skyn Karma's ingredient knowledge is based on published dermatological research and widely accepted skincare science. It knows about ingredient interactions, pH sensitivities, active concentrations, and formulation considerations. That said, skincare science is always evolving and individual skin can be unpredictable — so we always recommend patch testing anything new, and seeing a dermatologist for persistent concerns. Think of Skyn Karma as a very well-read friend, not a replacement for a professional diagnosis."
  },
  {
    q: "Is my data private and safe?",
    a: "Your skin profile and routine are stored locally on your own device — we don't store them on our servers or share them with anyone. Conversations are processed via the Anthropic AI API to generate responses, but no personally identifiable information is attached to those requests. We'll always be transparent about how your data is used, and we'll never sell it."
  },
  {
    q: "Is it free? What does it cost?",
    a: "Skyn Karma is currently free to use while we're in early access. We're gathering feedback from real users before deciding how to structure things long-term. If a paid tier is introduced, core features will always remain accessible for free — we believe everyone deserves good skincare guidance, not just people who can afford a dermatologist."
  },
  {
    q: "Is this real medical advice?",
    a: "No — and we're upfront about that. Skyn Karma provides general skincare guidance based on ingredient science and best practices. It's not a substitute for a dermatologist, and it won't diagnose skin conditions. If you have a medical concern — persistent acne, rosacea, eczema, or anything that's getting worse — please see a qualified professional. What Skyn Karma is great at is helping you build a smart, safe routine and understand what you're putting on your skin."
  },
  {
    q: "Why not just use ChatGPT?",
    a: "Great question — and honestly, you could. But here's the difference: ChatGPT is a blank slate every single time. It doesn't know your skin type, your concerns, your sensitivities, or what products you're already using. Skyn Karma builds a profile around you and carries that context into every conversation. It also has dedicated tools — like the ingredient decoder and compatibility checker — built specifically for skincare. Think of it as the difference between googling your symptoms and talking to a doctor who already knows your history."
  },
];
function CookieBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999,
      background: '#0f172a', padding: '12px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, flexWrap: 'wrap',
    }}>
      <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
        We use cookies to keep you logged in. No tracking, no ads.{' '}
        <a href="#" style={{ color: ROSE, textDecoration: 'none' }}>Learn more</a>
      </p>
      <button onClick={() => setVisible(false)} style={{
        background: ROSE, border: 'none', borderRadius: 8,
        padding: '7px 18px', color: '#fff', fontSize: 13,
        fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
      }}>Got it</button>
    </div>
  );
}
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #f1f5f9', overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', padding: '20px 0', background: 'transparent', border: 'none',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        cursor: 'pointer', fontFamily: 'inherit', gap: 16, textAlign: 'left',
      }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', lineHeight: 1.4 }}>{q}</span>
        <span style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: open ? ROSE : '#f1f5f9', color: open ? '#fff' : '#64748b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 300, transition: 'all 0.2s ease',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
        }}>+</span>
      </button>
      {open && (
        <div style={{ fontSize: 15, color: '#475569', lineHeight: 1.75, paddingBottom: 20, paddingRight: 44 }}>{a}</div>
      )}
    </div>
  );
}

const IconFlask = ({ size = 28, color = ROSE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/>
    <path d="M14 9.3a6.5 6.5 0 1 1-4 0"/>
  </svg>
);

const IconShieldCheck = ({ size = 28, color = ROSE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const IconList = ({ size = 28, color = ROSE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const IconWarning = ({ size = 28, color = ROSE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconBook = ({ size = 28, color = ROSE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

interface LandingProps {
  onStart: () => void;
  hasProfile: boolean;
  onResume: () => void;
}

export default function Landing({ onStart, hasProfile, onResume }: LandingProps) {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'DM Sans', system-ui, sans-serif", overflowY: 'auto' }}>

      {/* Nav */}
      <nav style={{
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: '#ffffff', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: ROSE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 700,
          }}>SK</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>Skyn Karma</span>
        </div>
        {hasProfile && (
          <button onClick={onResume} style={{
            padding: '8px 16px', background: ROSE, color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            whiteSpace: 'nowrap', maxWidth: '55vw', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            <span className="hide-mobile-landing">Continue my consultation →</span>
            <span className="show-mobile-landing">Continue →</span>
          </button>
        )}
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 40px 60px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', background: ROSE_LIGHT, border: `1px solid ${ROSE_MID}`,
          borderRadius: 20, padding: '6px 16px', fontSize: 13, color: ROSE,
          fontWeight: 600, marginBottom: 28, letterSpacing: '0.3px',
        }}>AI-powered skincare intelligence</div>

        <h1 style={{ fontSize: 52, fontWeight: 800, color: '#0f172a', margin: '0 0 20px', lineHeight: 1.15, letterSpacing: '-1.5px' }}>
          Your skin, finally<br /><span style={{ color: ROSE }}>understood.</span>
        </h1>

        <p style={{ fontSize: 19, color: '#64748b', lineHeight: 1.7, margin: '0 auto 40px', maxWidth: 560 }}>
          Skyn Karma helps you build the right routine, understand your ingredients, and make confident choices — personalised to your skin type and concerns.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onStart} style={{
            padding: '14px 32px', background: ROSE, color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 20px rgba(181,115,122,0.35)',
          }}>
            {hasProfile ? 'Start new consultation' : 'Get started →'}
          </button>
          {hasProfile && (
            <button onClick={onResume} style={{
              padding: '14px 32px', background: '#ffffff', color: '#0f172a',
              border: '1.5px solid #e2e8f0', borderRadius: 10,
              fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>Resume consultation</button>
          )}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: '#fafafa', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '64px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 700, color: '#0f172a', margin: '0 0 48px', letterSpacing: '-0.5px' }}>
            How Skyn Karma works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {[
              { step: '01', title: 'Build your skin profile', desc: 'Answer 5 quick questions about your skin type, concerns, and experience level. Takes under 2 minutes.' },
              { step: '02', title: 'Chat with your advisor', desc: 'Ask anything — ingredient compatibility, routine order, product recommendations, or what an ingredient actually does.' },
              { step: '03', title: 'Build your routine', desc: 'Save products to your personal AM/PM routine as you go. Everything is stored so you can come back anytime.' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '28px 24px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: ROSE, letterSpacing: '1px', marginBottom: 12 }}>{step}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>{title}</div>
                <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tools — 4 columns */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            Powerful tools included
          </h2>
          <p style={{ color: '#64748b', fontSize: 16, margin: 0 }}>
            Features usually locked behind a paywall — free while we&apos;re in early access.
          </p>
        </div>
        <div className="tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { icon: <IconFlask />, title: 'Ingredient Decoder', desc: 'Paste or photograph any ingredient list and get a plain-English breakdown — what each ingredient does, whether anything is irritating, and red flags to watch out for.' },
            { icon: <IconShieldCheck />, title: 'Check Products', desc: 'Add multiple products by name or photo and get a full compatibility report — conflicts highlighted by severity, correct layering order, and AM vs PM split.' },
            { icon: <IconList />, title: 'My Routine Builder', desc: 'Build and save your personalised AM and PM routine as you go. Every product stored, ordered, and ready to reference whenever you need it.' },
            { icon: <IconWarning />, title: 'Reality Check', desc: "Seen it on TikTok or Instagram? Paste a product claim or upload a screenshot and find out if it's backed by science or just clever marketing." },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: 16, padding: '24px 20px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 14, right: 14,
                background: ROSE_LIGHT, border: `1px solid ${ROSE_MID}`,
                borderRadius: 20, padding: '3px 9px',
                fontSize: 10, fontWeight: 600, color: ROSE,
              }}>Free now</div>
              <div style={{ marginBottom: 14 }}>{icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* Roadmap strip — sits below tools */}
        <div style={{
          background: ROSE_LIGHT, border: `1px solid ${ROSE_MID}`,
          borderRadius: 12, padding: '14px 24px', textAlign: 'center',
          fontSize: 14, color: ROSE, marginTop: 24,
        }}>
          <strong>On the roadmap:</strong> skin journey tracking, monthly insight recaps, conversation memory and more — Skyn Karma gets smarter the longer you use it.
        </div>
      </div>

      {/* What you can ask */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 40px 64px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 700, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
          What you can ask
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 16, margin: '0 0 40px' }}>
          Skyn Karma covers everything from basics to advanced skincare science.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {[
            'Can I use retinol and vitamin C together?',
            'Build me a routine for acne-prone skin',
            'What order should I layer my products?',
            'Is this product worth the hype?',
            'What does niacinamide actually do?',
            'How do I start skin cycling?',
            "What's a good budget alternative to [product]?",
            'Is purging normal with a new serum?',
            'Morning vs evening — what goes where?',
            'Explain ceramides to me',
          ].map((q, i) => (
            <div key={i} style={{
              padding: '9px 16px',
              background: i % 3 === 0 ? ROSE_LIGHT : '#f8fafc',
              border: `1px solid ${i % 3 === 0 ? ROSE_MID : '#e2e8f0'}`,
              borderRadius: 20, fontSize: 13,
              color: i % 3 === 0 ? ROSE : '#475569', fontWeight: 500,
            }}>{q}</div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: '#fafafa', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '64px 40px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 700, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Questions you probably have
          </h2>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: 16, margin: '0 0 40px' }}>
            Honest answers, no marketing fluff.
          </p>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '0 28px' }}>
            {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </div>

      {/* Journal coming soon */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '64px 40px' }}>
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 20, padding: '48px 40px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, ${ROSE}, #c9a0a6)`,
          }} />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, background: ROSE_LIGHT,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconBook size={26} />
            </div>
          </div>
          <div style={{
            display: 'inline-block', background: ROSE_LIGHT, border: `1px solid ${ROSE_MID}`,
            borderRadius: 20, padding: '4px 14px', fontSize: 12, color: ROSE,
            fontWeight: 700, marginBottom: 16, letterSpacing: '0.5px', textTransform: 'uppercase',
          }}>Coming soon</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            The Skyn Karma Journal
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, margin: '0 auto', maxWidth: 480 }}>
            Ingredient deep-dives, how-to guides, routine inspiration, and skincare science — written in plain English for real people.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}>
            {['Ingredient deep-dives', 'Routine guides', 'How-to articles', 'Skincare science'].map(tag => (
              <div key={tag} style={{
                padding: '6px 14px', background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: 20, fontSize: 13, color: '#64748b', fontWeight: 500,
              }}>{tag}</div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: ROSE, padding: '64px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', margin: '0 0 16px', letterSpacing: '-0.5px' }}>
          Ready to know your skin?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, margin: '0 0 32px' }}>
          Build your profile in 2 minutes and start getting personalised advice.
        </p>
        <button onClick={onStart} style={{
          padding: '14px 36px', background: '#ffffff', color: ROSE,
          border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {hasProfile ? 'Start new consultation' : 'Get started →'}
        </button>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .hide-mobile-landing { display: none !important; }
          .show-mobile-landing { display: inline !important; }
          .tools-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (min-width: 481px) and (max-width: 768px) {
          .tools-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (min-width: 481px) {
          .show-mobile-landing { display: none !important; }
        }
        @media (max-width: 768px) {
          .tools-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .tools-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <CookieBanner />
      {/* Footer */}
      <div style={{ padding: '24px 40px', textAlign: 'center', fontSize: 12, color: '#94a3b8', borderTop: '1px solid #f1f5f9' }}>
        Skyn Karma provides general skincare guidance and is not a substitute for professional dermatological advice.<br /><br />
        Got feedback? We&apos;d love to hear it — <a href="mailto:martinandmirella@gmail.com" style={{ color: ROSE, textDecoration: 'none' }}>martinandmirella@gmail.com</a>
      </div>

    </div>
  );
}
