'use client';

import { useState } from 'react';
import { UserProfile, ONBOARDING_QUESTIONS } from '@/types';

const ROSE = '#b5737a';
const ROSE_LIGHT = '#fdf2f3';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onHome: () => void;
  initialProfile?: UserProfile | null;
  editMode?: boolean;
}

// Skin type quiz questions shown when user selects "I'm not sure"
const SKIN_QUIZ = [
  {
    question: 'How does your skin feel about an hour after washing your face?',
    options: [
      { label: 'Tight and dry', points: { dry: 2 } },
      { label: 'Comfortable and normal', points: { normal: 2 } },
      { label: 'Shiny all over', points: { oily: 2 } },
      { label: 'Shiny in some areas but dry elsewhere', points: { combination: 2 } },
      { label: 'Red, irritated or reactive', points: { sensitive: 2 } },
    ],
  },
  {
    question: 'By midday, how does your skin look?',
    options: [
      { label: 'Still feels dry or tight', points: { dry: 2 } },
      { label: 'Pretty much the same as the morning', points: { normal: 2 } },
      { label: 'Noticeably oily or shiny all over', points: { oily: 2 } },
      { label: 'Oily in the T-zone only', points: { combination: 2 } },
      { label: 'Often looks red or feels uncomfortable', points: { sensitive: 2 } },
    ],
  },
  {
    question: 'How does your skin react to new products?',
    options: [
      { label: 'Often reacts — gets red or breaks out easily', points: { sensitive: 2 } },
      { label: 'Rarely reacts to anything', points: { normal: 2 } },
      { label: 'Gets oily faster', points: { oily: 2 } },
      { label: 'Sometimes dries out or flakes', points: { dry: 2 } },
      { label: 'Depends on the area — mixed reactions', points: { combination: 2 } },
    ],
  },
];

type SkinScores = { dry: number; oily: number; combination: number; normal: number; sensitive: number };

function determineSkinType(scores: SkinScores): string {
  const max = Math.max(...Object.values(scores));
  const winners = Object.entries(scores).filter(([, v]) => v === max);
  if (winners.length === 1) {
    const type = winners[0][0];
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
  // Tie-break logic
  if (scores.sensitive > 0) return 'Sensitive';
  if (scores.combination > 0) return 'Combination';
  return 'Normal';
}

interface SkinQuizProps {
  onResult: (skinType: string) => void;
  onBack: () => void;
}

function SkinTypeQuiz({ onResult, onBack }: SkinQuizProps) {
  const [quizStep, setQuizStep] = useState(0);
  const [scores, setScores] = useState<SkinScores>({ dry: 0, oily: 0, combination: 0, normal: 0, sensitive: 0 });
  const [result, setResult] = useState<string | null>(null);

  const handleQuizAnswer = (points: Partial<SkinScores>) => {
    const updated = { ...scores };
    Object.entries(points).forEach(([k, v]) => {
      updated[k as keyof SkinScores] += v as number;
    });
    setScores(updated);

    if (quizStep < SKIN_QUIZ.length - 1) {
      setQuizStep(q => q + 1);
    } else {
      const skinType = determineSkinType(updated);
      setResult(skinType);
    }
  };

  const q = SKIN_QUIZ[quizStep];

  if (result) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: ROSE_LIGHT, border: `1.5px solid ${ROSE}44`, borderRadius: 16, padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: ROSE, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Based on your answers</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>You likely have</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: ROSE, marginBottom: 16 }}>{result} skin</div>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
            You can always update this in your profile settings if you feel it doesn&apos;t quite fit.
          </p>
        </div>
        <button onClick={() => onResult(result)} style={{
          width: '100%', padding: '14px', background: ROSE, color: '#fff',
          border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Use {result} skin → Continue
        </button>
        <button onClick={onBack} style={{
          width: '100%', padding: '10px', background: 'transparent',
          color: '#94a3b8', border: 'none', fontSize: 14,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          ← Go back and choose manually instead
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: ROSE_LIGHT, borderRadius: 12, padding: '12px 16px', marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: ROSE, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          Quick skin type quiz — question {quizStep + 1} of {SKIN_QUIZ.length}
        </div>
        <div style={{ height: 3, background: `${ROSE}22`, borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${((quizStep + 1) / SKIN_QUIZ.length) * 100}%`, background: ROSE, borderRadius: 2, transition: 'width 0.3s ease' }} />
        </div>
      </div>

      <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{q.question}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => handleQuizAnswer(opt.points as Partial<SkinScores>)} style={{
            padding: '13px 20px', background: '#fafafa',
            border: '1.5px solid #e2e8f0', borderRadius: 12,
            textAlign: 'left', fontSize: 15, color: '#0f172a',
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
            transition: 'all 0.15s ease',
          }}
            onMouseEnter={e => { (e.currentTarget).style.borderColor = ROSE; (e.currentTarget).style.background = ROSE_LIGHT; }}
            onMouseLeave={e => { (e.currentTarget).style.borderColor = '#e2e8f0'; (e.currentTarget).style.background = '#fafafa'; }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button onClick={onBack} style={{
        marginTop: 4, background: 'none', border: 'none',
        color: '#94a3b8', fontSize: 14, cursor: 'pointer',
        fontFamily: 'inherit', textAlign: 'center',
      }}>
        ← Back
      </button>
    </div>
  );
}

export default function Onboarding({ onComplete, onHome, initialProfile, editMode }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<UserProfile>>(initialProfile || {});
  const [multiSelected, setMultiSelected] = useState<string[]>(
    Array.isArray(initialProfile?.skinType)
      ? initialProfile.skinType
      : initialProfile?.concerns as string[] || []
  );
  const [textValue, setTextValue] = useState(initialProfile?.sensitivities || '');
  const [showSkinQuiz, setShowSkinQuiz] = useState(false);

  const question = ONBOARDING_QUESTIONS[step];
  const isLast = step === ONBOARDING_QUESTIONS.length - 1;
  const progress = (step / ONBOARDING_QUESTIONS.length) * 100;

  const advance = (updated: Partial<UserProfile>) => {
    if (!isLast) {
      setStep(s => s + 1);
      const nextQ = ONBOARDING_QUESTIONS[step + 1];
      if (nextQ.type === 'multi') setMultiSelected((updated[nextQ.field] as string[]) || []);
      if (nextQ.type === 'text') setTextValue((updated[nextQ.field] as string) || '');
    } else {
      onComplete({ ...updated, completed: true } as UserProfile);
    }
  };

  const handleSingle = (option: string) => {
    // Intercept "I'm not sure" on skin type question
if (question.field === 'skinType' && option.includes('not sure')) {
      setShowSkinQuiz(true);
      return;
    }
    const updated = { ...answers, [question.field]: option };
    setAnswers(updated);
    setTimeout(() => advance(updated), 250);
  };

  const handleSkinQuizResult = (skinType: string) => {
    const updated = { ...answers, skinType };
    setAnswers(updated);
    setShowSkinQuiz(false);
    setTimeout(() => advance(updated), 250);
  };

  const handleMultiNext = () => {
    const updated = { ...answers, [question.field]: multiSelected };
    setAnswers(updated);
    advance(updated);
  };

  const handleTextNext = (skip = false) => {
    const updated = { ...answers, [question.field]: skip ? 'None' : (textValue.trim() || 'None') };
    setAnswers(updated);
    advance(updated);
  };

  const currentValue = answers[question.field];

  return (
    <div style={{
      minHeight: '100vh', background: '#ffffff',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      {/* Nav */}
      <nav style={{
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <button onClick={onHome} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: ROSE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 700,
          }}>SK</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>Skyn Karma</span>
        </button>
        <span style={{ fontSize: 13, color: '#94a3b8' }}>
          {editMode ? 'Editing your profile' : 'Building your skin profile'}
        </span>
      </nav>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 520 }}>

          {/* Show skin quiz if triggered */}
          {showSkinQuiz ? (
            <SkinTypeQuiz
              onResult={handleSkinQuizResult}
              onBack={() => setShowSkinQuiz(false)}
            />
          ) : (
            <>
              {/* Progress */}
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
                    QUESTION {step + 1} OF {ONBOARDING_QUESTIONS.length}
                  </span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{Math.round(progress)}% complete</span>
                </div>
                <div style={{ height: 3, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${progress}%`,
                    background: ROSE, borderRadius: 2,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  {ONBOARDING_QUESTIONS.map((_, i) => (
                    <div key={i} style={{
                      height: 4, flex: 1, borderRadius: 2,
                      background: i < step ? ROSE : i === step ? ROSE : '#e2e8f0',
                      opacity: i === step ? 1 : i < step ? 0.5 : 1,
                      transition: 'all 0.3s ease',
                    }} />
                  ))}
                </div>
              </div>

              {/* Question */}
              <div style={{ marginBottom: 32 }}>
                <h2 style={{
                  fontSize: 26, fontWeight: 700, color: '#0f172a',
                  margin: '0 0 8px', lineHeight: 1.3, letterSpacing: '-0.3px',
                }}>
                  {question.question}
                </h2>
                {question.subtitle && (
                  <p style={{ fontSize: 15, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    {question.subtitle}
                  </p>
                )}
              </div>

              {/* Single select */}
              {question.type === 'single' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {question.options?.map(opt => {
                    const selected = currentValue === opt;
                    return (
                      <button key={opt} onClick={() => handleSingle(opt)} style={{
                        padding: '14px 20px',
                        background: selected ? ROSE_LIGHT : '#fafafa',
                        border: `1.5px solid ${selected ? ROSE : '#e2e8f0'}`,
                        borderRadius: 12, textAlign: 'left',
                        fontSize: 15, color: selected ? ROSE : '#1a1a2e',
                        cursor: 'pointer', transition: 'all 0.15s ease',
                        fontFamily: 'inherit', fontWeight: selected ? 600 : 500,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                        onMouseEnter={e => { if (!selected) { (e.currentTarget).style.borderColor = ROSE; (e.currentTarget).style.background = ROSE_LIGHT; } }}
                        onMouseLeave={e => { if (!selected) { (e.currentTarget).style.borderColor = '#e2e8f0'; (e.currentTarget).style.background = '#fafafa'; } }}
                      >
                        {opt}
                        {opt === "I'm not sure" && (
                          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>Take a quick quiz →</span>
                        )}
                        {selected && opt !== "I'm not sure" && <span style={{ color: ROSE, fontSize: 16 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Multi select */}
              {question.type === 'multi' && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {question.options?.map(opt => {
                      const sel = multiSelected.includes(opt);
                      return (
                        <button key={opt} onClick={() => {
                        if (opt.includes('not sure')) {
                          setShowSkinQuiz(true);
                          return;
                        }
                        setMultiSelected(prev =>
                          prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
                        );
                      }}style={{
                          padding: '13px 20px',
                          background: sel ? ROSE_LIGHT : '#fafafa',
                          border: `1.5px solid ${sel ? ROSE : '#e2e8f0'}`,
                          borderRadius: 12, textAlign: 'left',
                          fontSize: 15, color: sel ? ROSE : '#1a1a2e',
                          cursor: 'pointer', transition: 'all 0.15s ease',
                          fontFamily: 'inherit', fontWeight: sel ? 600 : 500,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                     {opt}
                    {opt.includes('not sure') && (
                      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>Take a quick quiz →</span>
                    )}
                    {sel && !opt.includes('not sure') && <span style={{ color: ROSE, fontSize: 16 }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={handleMultiNext} disabled={multiSelected.length === 0} style={{
                    width: '100%', padding: '14px',
                    background: multiSelected.length > 0 ? ROSE : '#e2e8f0',
                    color: multiSelected.length > 0 ? '#fff' : '#94a3b8',
                    border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600,
                    cursor: multiSelected.length > 0 ? 'pointer' : 'default',
                    fontFamily: 'inherit', transition: 'all 0.15s ease',
                  }}>
                    Continue → {multiSelected.length > 0 && `(${multiSelected.length} selected)`}
                  </button>
                </div>
              )}

              {/* Text */}
              {question.type === 'text' && (
                <div>
                  <textarea
                    value={textValue}
                    onChange={e => setTextValue(e.target.value)}
                    placeholder="e.g. fragrance, lanolin, retinol — or leave blank if none"
                    rows={3}
                    style={{
                      width: '100%', padding: '14px 16px',
                      border: '1.5px solid #e2e8f0', borderRadius: 12,
                      fontSize: 15, color: '#0f172a', fontFamily: 'inherit',
                      resize: 'none', outline: 'none', background: '#fafafa',
                      boxSizing: 'border-box', marginBottom: 12, lineHeight: 1.6,
                    }}
                    onFocus={e => e.target.style.borderColor = ROSE}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                  <button onClick={() => handleTextNext(false)} style={{
                    width: '100%', padding: '14px',
                    background: ROSE, color: '#fff',
                    border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8,
                  }}>
                    {isLast ? 'Complete my profile →' : 'Continue →'}
                  </button>
                  <button onClick={() => handleTextNext(true)} style={{
                    width: '100%', padding: '10px', background: 'transparent',
                    color: '#94a3b8', border: 'none', fontSize: 14,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    Skip — no known sensitivities
                  </button>
                </div>
              )}

              {/* Back */}
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} style={{
                  marginTop: 20, background: 'none', border: 'none',
                  color: '#94a3b8', fontSize: 14, cursor: 'pointer',
                  fontFamily: 'inherit', display: 'block', width: '100%', textAlign: 'center',
                }}>
                  ← Back
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}