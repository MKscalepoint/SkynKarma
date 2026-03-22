'use client';

import { useState } from 'react';
import { addSavedProduct, getSavedProducts } from '@/lib/storage';
import { SavedProduct } from '@/types';

const ROSE = '#b5737a';
const ROSE_LIGHT = '#fdf2f3';
const ROSE_MID = '#f2d0d3';

interface SaveProductButtonProps {
  productName: string;
  source: SavedProduct['source'];
  onSaved?: () => void;
}

export default function SaveProductButton({ productName, source, onSaved }: SaveProductButtonProps) {
  const alreadySaved = getSavedProducts().some(
    p => p.name.toLowerCase() === productName.toLowerCase()
  );
  const [saved, setSaved] = useState(alreadySaved);

  const handleSave = () => {
    if (saved) return;
    addSavedProduct({ name: productName, source });
    setSaved(true);
    onSaved?.();
  };

  return (
    <button onClick={handleSave} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 14px',
      background: saved ? '#f0fdf4' : ROSE_LIGHT,
      border: `1px solid ${saved ? '#bbf7d0' : ROSE_MID}`,
      borderRadius: 8, cursor: saved ? 'default' : 'pointer',
      fontSize: 13, fontWeight: 600,
      color: saved ? '#10b981' : ROSE,
      fontFamily: 'inherit', transition: 'all 0.15s',
    }}>
      {saved ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Saved
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ROSE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          Save product
        </>
      )}
    </button>
  );
}