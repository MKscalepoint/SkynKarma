'use client';

import { useState, useEffect} from 'react';
import { SavedProduct, PriceResult } from '@/types';
import { addSavedProduct, removeSavedProduct, updateSavedProduct, generateId, getSavedProducts } from '@/lib/storage';

const ROSE = '#b5737a';
const ROSE_LIGHT = '#fdf2f3';
const ROSE_MID = '#f2d0d3';

interface SavedProductsProps {
  products: SavedProduct[];
  country?: string;
  onProductsChange: (products: SavedProduct[]) => void;
}

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
  product,
  country,
  onRemove,
  onPriceUpdate,
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
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
      overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      {/* Product header */}
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

      {/* Price search area */}
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
export default function SavedProducts({ products: initialProducts, country, onProductsChange }: SavedProductsProps) {
  const [products, setProducts] = useState<SavedProduct[]>(() => getSavedProducts());
  const [newProductName, setNewProductName] = useState('');
  const [adding, setAdding] = useState(false);
  useEffect(() => {
    setProducts(getSavedProducts());
  }, [initialProducts]);

  const handleAdd = () => {
  if (!newProductName.trim()) return;
  addSavedProduct({ name: newProductName.trim(), source: 'manual' });
  const updated = getSavedProducts();
  setProducts(updated);
  onProductsChange(updated);
  setNewProductName('');
  setAdding(false);
};

  const handleRemove = (id: string) => {
  removeSavedProduct(id);
  const updated = getSavedProducts();
  setProducts(updated);
  onProductsChange(updated);
};

const handlePriceUpdate = (id: string, results: PriceResult[]) => {
  updateSavedProduct(id, {
    lastPriceSearch: { searchedAt: new Date().toISOString(), results },
  });
  const updated = getSavedProducts();
  setProducts(updated);
  onProductsChange(updated);
};

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <IconBookmark size={22} color={ROSE} />
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
              Saved Products
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
            Save products you want to buy — then find the best price with one tap.
          </p>
        </div>

        {/* Add product */}
        {adding ? (
          <div style={{ background: '#fff', border: `1.5px solid ${ROSE_MID}`, borderRadius: 14, padding: '16px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: ROSE, marginBottom: 10 }}>Add a product</div>
            <input
              value={newProductName}
              onChange={e => setNewProductName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="e.g. CeraVe Moisturising Cream 454g"
              autoFocus
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 16, fontFamily: 'inherit', color: '#0f172a', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
              onFocus={e => e.target.style.borderColor = ROSE}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setAdding(false); setNewProductName(''); }} style={{
                flex: 1, padding: '9px', background: 'transparent',
                border: '1px solid #e2e8f0', borderRadius: 8,
                fontSize: 13, color: '#64748b', cursor: 'pointer', fontFamily: 'inherit',
              }}>Cancel</button>
              <button onClick={handleAdd} disabled={!newProductName.trim()} style={{
                flex: 2, padding: '9px', background: newProductName.trim() ? ROSE : '#e2e8f0',
                border: 'none', borderRadius: 8,
                fontSize: 13, color: newProductName.trim() ? '#fff' : '#94a3b8',
                fontWeight: 600, cursor: newProductName.trim() ? 'pointer' : 'default', fontFamily: 'inherit',
              }}>Add product</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} style={{
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
        {products.length === 0 ? (
          <div style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
            padding: '40px 24px', textAlign: 'center',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <IconBookmark size={32} color="#cbd5e1" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>No saved products yet</div>
            <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
              Save products from the tools or chat, or add them manually above. Then find the best price with one tap.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                country={country}
                onRemove={() => handleRemove(product.id)}
                onPriceUpdate={(results) => handlePriceUpdate(product.id, results)}
              />
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
            Prices are indicative and may vary. Always check the retailer for the current price.
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}