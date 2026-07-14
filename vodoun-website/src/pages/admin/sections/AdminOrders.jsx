import { useState } from 'react';

const SC = {
  pending:   { label:'En attente',  color:'#B8860B' },
  confirmed: { label:'Confirmée',   color:'#1C4A66' },
  shipped:   { label:'Expédiée',    color:'#6B2A5E' },
  delivered: { label:'Livrée',      color:'#20603C' },
  cancelled: { label:'Annulée',     color:'#8E2420' },
};

function StatusBadge({ status }) {
  const c = SC[status] || SC.pending;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:'999px', fontSize:'0.55rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.12em', color:c.color, background:c.color+'18', border:`1px solid ${c.color}40` }}>
      {c.label}
    </span>
  );
}

const iStyle = { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', color:'#F4F0E6', padding:'10px 14px', fontSize:'0.875rem', outline:'none', fontFamily:"'Plus Jakarta Sans', sans-serif" };

export default function AdminOrders({ orders, setOrders }) {
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('Tous');
  const [sel,     setSel]     = useState(null);

  const filtered = orders.filter(o => {
    const s = search.toLowerCase();
    return (o.customer.toLowerCase().includes(s) || o.id.toLowerCase().includes(s) || o.product.toLowerCase().includes(s))
      && (filter === 'Tous' || o.status === filter);
  });

  const updateStatus = (id, status) => {
    setOrders(prev => prev.map(o => o.id===id ? {...o, status} : o));
    if (sel?.id===id) setSel(p => ({...p, status}));
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'1.8rem', textTransform:'uppercase', color:'#F4F0E6', margin:0 }}>Commandes</h1>
          <p style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.3em', color:'rgba(244,240,230,0.3)', margin:'4px 0 0' }}>
            {orders.length} commandes · {orders.filter(o => o.status==='pending').length} en attente
          </p>
        </div>
        {filtered.length > 0 && (
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.3em', color:'rgba(244,240,230,0.35)', margin:0 }}>Total affiché</p>
            <p style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'1.4rem', color:'#B8860B', margin:'2px 0 0' }}>
              {filtered.reduce((s,o)=>s+o.total,0).toLocaleString('fr-FR')} F
            </p>
          </div>
        )}
      </div>

      {/* Filtres */}
      <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Client, référence, produit..."
          style={{ ...iStyle, flex:1, minWidth:'200px' }}
          onFocus={e => e.target.style.borderColor='rgba(184,134,11,0.5)'}
          onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'} />
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...iStyle, cursor:'pointer', width:'auto' }}>
          <option>Tous</option>
          {Object.entries(SC).map(([k,v]) => <option key={k} value={k} style={{ background:'#1A1410' }}>{v.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="ag-glass" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                {['Réf.','Client','Produit','Total','Date','Statut',''].map((h,i) => (
                  <th key={i} style={{ padding:'12px 16px', textAlign:'left', fontSize:'0.55rem', textTransform:'uppercase', letterSpacing:'0.35em', fontWeight:900, color:'rgba(244,240,230,0.35)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="ag-table-row">
                  <td style={{ padding:'13px 16px', fontSize:'0.75rem', fontWeight:900, color:'#B8860B', whiteSpace:'nowrap' }}>{o.id}</td>
                  <td style={{ padding:'13px 16px' }}>
                    <p style={{ fontSize:'0.85rem', fontWeight:700, color:'#F4F0E6', margin:0 }}>{o.customer}</p>
                    <p style={{ fontSize:'0.68rem', color:'rgba(244,240,230,0.33)', margin:'2px 0 0' }}>{o.email}</p>
                  </td>
                  <td style={{ padding:'13px 16px' }}>
                    <p style={{ fontSize:'0.82rem', color:'rgba(244,240,230,0.75)', margin:0 }}>{o.product}</p>
                    <p style={{ fontSize:'0.68rem', color:'rgba(244,240,230,0.33)', margin:'2px 0 0' }}>{o.variant} · ×{o.qty}</p>
                  </td>
                  <td style={{ padding:'13px 16px', fontSize:'0.85rem', fontWeight:900, color:'#B8860B', whiteSpace:'nowrap' }}>{o.total.toLocaleString('fr-FR')} F</td>
                  <td style={{ padding:'13px 16px', fontSize:'0.72rem', color:'rgba(244,240,230,0.38)', whiteSpace:'nowrap' }}>{o.date}</td>
                  <td style={{ padding:'13px 16px' }}><StatusBadge status={o.status} /></td>
                  <td style={{ padding:'13px 16px' }}>
                    <button onClick={() => setSel(o)} className="ag-btn-ghost" style={{ padding:'7px 14px', fontSize:'0.62rem' }}>Détail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding:'48px', textAlign:'center', color:'rgba(244,240,230,0.25)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.3em' }}>
              Aucune commande trouvée
            </div>
          )}
        </div>
      </div>

      {/* Modal détail */}
      {sel && (
        <div className="ag-modal-overlay" style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }} onClick={() => setSel(null)}>
          <div className="ag-glass-dark" style={{ width:'100%', maxWidth:'520px', maxHeight:'90vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
            {/* Header modal */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontWeight:900, fontSize:'0.9rem', color:'#B8860B' }}>{sel.id}</span>
                <p style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.3em', color:'rgba(244,240,230,0.3)', margin:'3px 0 0' }}>{sel.date}</p>
              </div>
              <button onClick={() => setSel(null)}
                style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(244,240,230,0.5)' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'18px' }}>
              {/* Client */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.06)', padding:'14px' }}>
                  <p style={{ fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.35em', color:'rgba(244,240,230,0.3)', margin:'0 0 8px' }}>Client</p>
                  <p style={{ fontSize:'0.88rem', fontWeight:700, color:'#F4F0E6', margin:'0 0 3px' }}>{sel.customer}</p>
                  <p style={{ fontSize:'0.72rem', color:'rgba(244,240,230,0.4)', margin:'0 0 2px' }}>{sel.email}</p>
                  <p style={{ fontSize:'0.72rem', color:'rgba(244,240,230,0.4)', margin:0 }}>{sel.phone}</p>
                </div>
                <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.06)', padding:'14px' }}>
                  <p style={{ fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.35em', color:'rgba(244,240,230,0.3)', margin:'0 0 8px' }}>Adresse</p>
                  <p style={{ fontSize:'0.85rem', color:'rgba(244,240,230,0.65)', margin:0, lineHeight:1.5 }}>{sel.address}</p>
                </div>
              </div>

              {/* Produit */}
              <div style={{ background:'rgba(184,134,11,0.06)', borderRadius:'12px', border:'1px solid rgba(184,134,11,0.2)', padding:'16px' }}>
                <p style={{ fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.35em', color:'rgba(184,134,11,0.6)', margin:'0 0 8px' }}>Commande</p>
                <p style={{ fontSize:'1rem', fontWeight:700, color:'#F4F0E6', margin:'0 0 4px' }}>{sel.product}</p>
                <p style={{ fontSize:'0.72rem', color:'rgba(244,240,230,0.45)', margin:'0 0 10px' }}>{sel.variant} · Qté : {sel.qty}</p>
                <p style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'1.6rem', color:'#B8860B', margin:0 }}>
                  {sel.total.toLocaleString('fr-FR')} FCFA
                </p>
              </div>

              {/* Changer statut */}
              <div>
                <p style={{ fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.35em', color:'rgba(244,240,230,0.3)', margin:'0 0 10px' }}>Statut de la commande</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {Object.entries(SC).map(([k,v]) => (
                    <button key={k} onClick={() => updateStatus(sel.id, k)}
                      style={{
                        padding:'8px 14px', borderRadius:'999px', fontSize:'0.6rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer', border:`1px solid ${v.color}50`, transition:'all 0.2s',
                        color: sel.status===k ? '#0D0B08' : v.color,
                        background: sel.status===k ? v.color : `${v.color}12`,
                      }}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:'flex', gap:'10px', paddingTop:'4px' }}>
                <a href={`mailto:${sel.email}?subject=Commande ${sel.id}`}
                  className="ag-btn-primary" style={{ flex:1, textAlign:'center', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  Contacter →
                </a>
                <button onClick={() => setSel(null)} className="ag-btn-ghost">Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
