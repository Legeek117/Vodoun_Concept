import { useState } from 'react';
import { Icon } from '../AdminPage';

const CATEGORIES = ['Décorations Festives','Mode','Accessoires','Décoration','Mobilier'];
const DEITIES    = ['Dan','Legba','Sakpata','Mami Wata','Xevioso','Ogu','Tous'];
const EMPTY      = { id:'', name:'', category:'Mode', price:'', image:'', description:'', story:'', deity:'Tous', variants:'', delay:'', isCustomOrder:false, available:true };

const iStyle = {
  background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
  borderRadius:'10px', color:'#F4F0E6', padding:'10px 14px', fontSize:'0.875rem',
  width:'100%', outline:'none', fontFamily:"'Plus Jakarta Sans', sans-serif",
  transition:'border-color 0.2s, box-shadow 0.2s',
};

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.35em', color:'rgba(244,240,230,0.35)', marginBottom:'8px' }}>{label}</label>
      {children}
    </div>
  );
}

function GlassInput({ label, ...props }) {
  return (
    <Field label={label}>
      <input {...props} style={iStyle}
        onFocus={e => { e.target.style.borderColor='rgba(184,134,11,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(184,134,11,0.1)'; }}
        onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; }}
      />
    </Field>
  );
}

function GlassSelect({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select value={value} onChange={onChange} style={{ ...iStyle, cursor:'pointer' }}>
        {options.map(o => <option key={o} value={o} style={{ background:'#1A1410' }}>{o}</option>)}
      </select>
    </Field>
  );
}

function GlassTextarea({ label, ...props }) {
  return (
    <Field label={label}>
      <textarea {...props} style={{ ...iStyle, resize:'none' }}
        onFocus={e => { e.target.style.borderColor='rgba(184,134,11,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(184,134,11,0.1)'; }}
        onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; }}
      />
    </Field>
  );
}

export default function AdminProducts({ products, setProducts }) {
  const [search,  setSearch]  = useState('');
  const [cat,     setCat]     = useState('Tous');
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [isNew,   setIsNew]   = useState(false);
  const [delId,   setDelId]   = useState(null);

  const filtered = products.filter(p => {
    return p.name.toLowerCase().includes(search.toLowerCase()) && (cat === 'Tous' || p.category === cat);
  });

  const openEdit = (p) => { setEditing(p.id); setForm({ ...p, variants: Array.isArray(p.variants) ? p.variants.join(', ') : '' }); setIsNew(false); };
  const openNew  = () => { setEditing('__new__'); setForm(EMPTY); setIsNew(true); };
  const close    = () => { setEditing(null); };
  const f        = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = () => {
    const prod = { ...form, price: Number(form.price), variants: form.variants.split(',').map(v => v.trim()).filter(Boolean) };
    if (isNew) {
      prod.id = prod.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setProducts(prev => [...prev, prod]);
    } else {
      setProducts(prev => prev.map(p => p.id === editing ? prod : p));
    }
    close();
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'1.8rem', textTransform:'uppercase', color:'#F4F0E6', margin:0 }}>Produits</h1>
          <p style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.3em', color:'rgba(244,240,230,0.3)', margin:'4px 0 0' }}>{products.length} produits</p>
        </div>
        <button onClick={openNew} className="ag-btn-primary" style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          {Icon.plus} Ajouter
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
          style={{ ...iStyle, flex:1, minWidth:'200px' }}
          onFocus={e => e.target.style.borderColor='rgba(184,134,11,0.5)'}
          onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'} />
        <select value={cat} onChange={e => setCat(e.target.value)}
          style={{ ...iStyle, width:'auto', cursor:'pointer' }}>
          <option>Tous</option>
          {CATEGORIES.map(c => <option key={c} style={{ background:'#1A1410' }}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="ag-glass" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                {['','Produit','Catégorie','Prix','Statut',''].map((h,i) => (
                  <th key={i} style={{ padding:'12px 16px', textAlign:'left', fontSize:'0.55rem', textTransform:'uppercase', letterSpacing:'0.35em', fontWeight:900, color:'rgba(244,240,230,0.35)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="ag-table-row">
                  <td style={{ padding:'12px 16px', width:'52px' }}>
                    <div style={{ width:'44px', height:'44px', borderRadius:'10px', overflow:'hidden', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
                      {p.image && <img src={p.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <p style={{ fontSize:'0.85rem', fontWeight:700, color:'#F4F0E6', margin:0 }}>{p.name}</p>
                    <p style={{ fontSize:'0.68rem', color:'rgba(244,240,230,0.33)', margin:'2px 0 0' }}>{p.deity || '—'}</p>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span className="ag-badge" style={{ color:'#B8860B', background:'rgba(184,134,11,0.12)', borderColor:'rgba(184,134,11,0.25)' }}>{p.category}</span>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:'0.85rem', fontWeight:900, color:'#B8860B', whiteSpace:'nowrap' }}>
                    {Number(p.price).toLocaleString('fr-FR')} F
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <button onClick={() => setProducts(prev => prev.map(x => x.id===p.id ? {...x, available:!x.available} : x))}>
                      <span className="ag-badge" style={{
                        color: p.available!==false ? '#2d8050' : '#8E2420',
                        background: p.available!==false ? 'rgba(45,128,80,0.15)' : 'rgba(142,36,32,0.15)',
                        borderColor: p.available!==false ? 'rgba(45,128,80,0.3)' : 'rgba(142,36,32,0.3)',
                        cursor:'pointer',
                      }}>{p.available!==false ? 'Disponible' : 'Indisponible'}</span>
                    </button>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button onClick={() => openEdit(p)} className="ag-btn-ghost" style={{ padding:'7px 14px', fontSize:'0.62rem' }}>Éditer</button>
                      <button onClick={() => setDelId(p.id)} className="ag-btn-ghost"
                        style={{ padding:'7px 14px', fontSize:'0.62rem', borderColor:'rgba(142,36,32,0.3)', color:'rgba(248,113,113,0.6)' }}
                        onMouseEnter={e => e.currentTarget.style.color='#f87171'}
                        onMouseLeave={e => e.currentTarget.style.color='rgba(248,113,113,0.6)'}>
                        Suppr.
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding:'48px', textAlign:'center', color:'rgba(244,240,230,0.25)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.3em' }}>
              Aucun produit trouvé
            </div>
          )}
        </div>
      </div>

      {/* Panneau édition */}
      {editing && (
        <div className="ag-modal-overlay" style={{ position:'fixed', inset:0, zIndex:50, display:'flex', justifyContent:'flex-end' }} onClick={close}>
          <div className="ag-glass-dark ag-scroll" style={{ width:'100%', maxWidth:'500px', height:'100%', overflowY:'auto', borderRadius:'0', borderLeft:'1px solid rgba(255,255,255,0.08)' }} onClick={e => e.stopPropagation()}>
            {/* Header panneau */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)', position:'sticky', top:0, background:'rgba(8,6,4,0.92)', backdropFilter:'blur(20px)', zIndex:10 }}>
              <h2 style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'1.1rem', textTransform:'uppercase', color:'#F4F0E6', margin:0 }}>
                {isNew ? 'Nouveau produit' : 'Modifier'}
              </h2>
              <button onClick={close} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(244,240,230,0.5)' }}>
                {Icon.close}
              </button>
            </div>

            <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'18px' }}>
              <GlassInput label="Nom du produit *" value={form.name} onChange={f('name')} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <GlassSelect label="Catégorie *" value={form.category} onChange={f('category')} options={CATEGORIES} />
                <GlassSelect label="Divinité"    value={form.deity||'Tous'} onChange={f('deity')} options={DEITIES} />
              </div>
              <GlassInput label="Prix (FCFA) *" value={form.price} onChange={f('price')} type="number" placeholder="8000" />
              <GlassInput label="Chemin image" value={form.image} onChange={f('image')} placeholder="/mon-image.png" />
              <GlassInput label="Variantes (virgule)" value={form.variants} onChange={f('variants')} placeholder="S, M, L, XL" />
              <GlassInput label="Délai" value={form.delay} onChange={f('delay')} placeholder="En stock · 3 à 5 jours" />
              <GlassTextarea label="Description" value={form.description} onChange={f('description')} rows={2} />
              <GlassTextarea label="Histoire" value={form.story} onChange={f('story')} rows={4} />
              <div style={{ display:'flex', gap:'20px' }}>
                {[['isCustomOrder','Sur mesure'],['available','Disponible']].map(([k,l]) => (
                  <label key={k} style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'0.8rem', color:'rgba(244,240,230,0.6)' }}>
                    <input type="checkbox"
                      checked={k==='available' ? form.available!==false : !!form[k]}
                      onChange={e => setForm(p => ({ ...p, [k]: e.target.checked }))}
                      style={{ accentColor:'#B8860B', width:'15px', height:'15px' }} />
                    {l}
                  </label>
                ))}
              </div>
              <div style={{ display:'flex', gap:'10px', paddingTop:'8px' }}>
                <button onClick={save} className="ag-btn-primary" style={{ flex:1 }}>
                  {isNew ? 'Créer' : 'Enregistrer'}
                </button>
                <button onClick={close} className="ag-btn-ghost">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm suppression */}
      {delId && (
        <div className="ag-modal-overlay" style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
          <div className="ag-glass-dark" style={{ width:'100%', maxWidth:'380px', padding:'32px' }}>
            <h3 style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'1.1rem', color:'#F4F0E6', margin:'0 0 10px' }}>Supprimer ce produit ?</h3>
            <p style={{ fontSize:'0.8rem', color:'rgba(244,240,230,0.45)', marginBottom:'24px' }}>Cette action est irréversible.</p>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => { setProducts(p => p.filter(x => x.id!==delId)); setDelId(null); }}
                style={{ flex:1, padding:'12px', borderRadius:'10px', fontWeight:900, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.2em', background:'rgba(142,36,32,0.8)', color:'#F4F0E6', border:'1px solid rgba(142,36,32,0.6)', cursor:'pointer' }}>
                Supprimer
              </button>
              <button onClick={() => setDelId(null)} className="ag-btn-ghost" style={{ flex:1 }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
