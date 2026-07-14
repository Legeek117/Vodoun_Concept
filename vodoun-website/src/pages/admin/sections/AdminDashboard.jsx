const STATUS_COLORS = { pending:'#B8860B', confirmed:'#1C4A66', shipped:'#6B2A5E', delivered:'#20603C', cancelled:'#8E2420' };
const STATUS_LABELS = { pending:'En attente', confirmed:'Confirmée', shipped:'Expédiée', delivered:'Livrée', cancelled:'Annulée' };

function StatCard({ label, value, sub, color = '#B8860B', icon }) {
  return (
    <div className="ag-stat" style={{ padding:'22px 24px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'16px' }}>
        <p style={{ fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.35em', color:'rgba(244,240,230,0.4)', margin:0 }}>{label}</p>
        {icon && <span style={{ fontSize:'1.2rem', opacity:0.35 }}>{icon}</span>}
      </div>
      <p style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'1.9rem', color, margin:'0 0 6px', lineHeight:1 }}>{value}</p>
      {sub && <p style={{ fontSize:'0.68rem', color:'rgba(244,240,230,0.3)', margin:0 }}>{sub}</p>}
    </div>
  );
}

function GlassPanel({ children, style = {} }) {
  return (
    <div className="ag-glass" style={{ ...style }}>
      {children}
    </div>
  );
}

export default function AdminDashboard({ products, orders, setActiveSection }) {
  const totalRevenue  = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const pending       = orders.filter(o => o.status === 'pending').length;
  const delivered     = orders.filter(o => o.status === 'delivered').length;
  const recent        = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const categoryCounts = products.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
      {/* Titre */}
      <div>
        <h1 style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'1.8rem', textTransform:'uppercase', letterSpacing:'-0.01em', color:'#F4F0E6', margin:0 }}>
          Tableau de bord
        </h1>
        <p style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.3em', color:'rgba(244,240,230,0.3)', marginTop:'6px' }}>
          Vue d'ensemble · Vodun Concept Store
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'14px' }}>
        <StatCard icon="💰" label="Chiffre d'affaires" value={`${totalRevenue.toLocaleString('fr-FR')}`} sub="FCFA · commandes actives" color="#B8860B" />
        <StatCard icon="📦" label="Commandes totales"  value={orders.length} sub={`${pending} en attente`} color="#F4F0E6" />
        <StatCard icon="✦"  label="Produits actifs"    value={products.filter(p => p.available !== false).length} sub={`${products.length} au total`} color="#F4F0E6" />
        <StatCard icon="✅" label="Livrées"             value={delivered} sub={`${orders.length ? Math.round(delivered/orders.length*100) : 0}% du total`} color="#2d8050" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'14px' }}>
        {/* Commandes récentes */}
        <GlassPanel>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.25em', fontWeight:900, color:'#F4F0E6', margin:0 }}>Commandes récentes</h2>
            <button onClick={() => setActiveSection('orders')}
              style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.25em', fontWeight:900, color:'#B8860B', background:'none', border:'none', cursor:'pointer' }}>
              Tout voir →
            </button>
          </div>
          <div>
            {recent.map((order, i) => (
              <div key={order.id} className="ag-table-row" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', gap:'12px' }}>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:'0.85rem', fontWeight:700, color:'#F4F0E6', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{order.customer}</p>
                  <p style={{ fontSize:'0.7rem', color:'rgba(244,240,230,0.38)', margin:'2px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{order.product}</p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontSize:'0.82rem', fontWeight:900, color:'#B8860B', margin:0 }}>{order.total.toLocaleString('fr-FR')} F</p>
                  <span className="ag-badge" style={{ color:STATUS_COLORS[order.status], background:STATUS_COLORS[order.status]+'18', borderColor:STATUS_COLORS[order.status]+'40', marginTop:'4px', display:'inline-flex' }}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Catégories */}
        <GlassPanel>
          <div style={{ padding:'18px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.25em', fontWeight:900, color:'#F4F0E6', margin:0 }}>Par catégorie</h2>
          </div>
          <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:'14px' }}>
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <div key={cat}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                  <span style={{ fontSize:'0.72rem', color:'rgba(244,240,230,0.55)' }}>{cat}</span>
                  <span style={{ fontSize:'0.72rem', fontWeight:900, color:'#B8860B' }}>{count}</span>
                </div>
                <div className="ag-progress-track">
                  <div className="ag-progress-fill" style={{ width:`${(count/products.length)*100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
