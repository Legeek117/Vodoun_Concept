import { useMemo } from 'react';
import { Sparkline, LineChart, Donut, BarChart } from '../components/Charts';

const STATUS_COLORS = { pending:'#D4A017', confirmed:'#3E7CA8', shipped:'#9B4D8F', delivered:'#2d8050', cancelled:'#B03A31' };
const STATUS_LABELS = { pending:'En attente', confirmed:'Confirmée', shipped:'Expédiée', delivered:'Livrée', cancelled:'Annulée' };

function Panel({ title, action, children, style, className = '' }) {
  return (
    <div className={`ag-glass ${className}`} style={style}>
      {title && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.25em', fontWeight:900, color:'#F4F0E6', margin:0 }}>{title}</h2>
          {action}
        </div>
      )}
      <div style={{ padding:'18px 20px' }}>{children}</div>
    </div>
  );
}

function KpiCard({ label, value, sub, color, values, icon }) {
  return (
    <div className="ag-stat" style={{ padding:'18px 20px 0' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'8px' }}>
        <div>
          <p style={{ fontSize:'0.56rem', textTransform:'uppercase', letterSpacing:'0.3em', color:'rgba(244,240,230,0.4)', margin:0 }}>{label}</p>
          <p style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'1.7rem', color, margin:'10px 0 4px', lineHeight:1 }}>{value}</p>
          {sub && <p style={{ fontSize:'0.66rem', color:'rgba(244,240,230,0.3)', margin:0 }}>{sub}</p>}
        </div>
        {icon && <span style={{ fontSize:'1.1rem', opacity:0.3 }}>{icon}</span>}
      </div>
      <div style={{ margin:'12px -20px 0' }}>
        <Sparkline values={values} color={color} height={44} />
      </div>
    </div>
  );
}

// Série journalière sur les N derniers jours (CA hors annulées + nb commandes)
function dailySeries(orders, days = 14) {
  const now = new Date();
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
    const next = new Date(d); next.setDate(d.getDate() + 1);
    const day = orders.filter((o) => { const t = new Date(o._ts || o.date); return t >= d && t < next; });
    out.push({
      label: d.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit' }),
      revenue: day.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
      count: day.length,
    });
  }
  return out;
}

export default function AdminDashboard({ products = [], orders = [], quotes = [], setActiveSection, admin }) {
  const totalRevenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const pending      = orders.filter((o) => o.status === 'pending').length;
  const delivered    = orders.filter((o) => o.status === 'delivered').length;
  const avgBasket    = orders.length ? totalRevenue / orders.filter((o) => o.status !== 'cancelled').length || 0 : 0;

  const series   = useMemo(() => dailySeries(orders, 14), [orders]);
  const recent   = useMemo(() => [...orders].sort((a, b) => new Date(b._ts || b.date) - new Date(a._ts || a.date)).slice(0, 6), [orders]);
  const recentQ  = useMemo(() => [...quotes].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 4), [quotes]);

  const statusData = useMemo(() => Object.keys(STATUS_LABELS)
    .map((k) => ({ label: STATUS_LABELS[k], value: orders.filter((o) => o.status === k).length, color: STATUS_COLORS[k] }))
    .filter((d) => d.value > 0), [orders]);

  const categoryData = useMemo(() => {
    const counts = products.reduce((acc, p) => { acc[p.category || 'Autre'] = (acc[p.category || 'Autre'] || 0) + 1; return acc; }, {});
    return Object.entries(counts).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [products]);

  const today = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const firstname = (admin?.display_name || admin?.username || 'Admin').split(' ')[0];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      {/* En-tête */}
      <div>
        <h1 style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'1.9rem', color:'#F4F0E6', margin:0 }}>
          Bonjour, {firstname}
        </h1>
        <p style={{ fontSize:'0.65rem', textTransform:'capitalize', letterSpacing:'0.2em', color:'rgba(244,240,230,0.35)', marginTop:'6px' }}>
          {today}
        </p>
      </div>

      {/* KPI */}
      <div className="ag-grid-kpi">
        <KpiCard icon="💰" label="Chiffre d'affaires" color="#D4A017" value={`${totalRevenue.toLocaleString('fr-FR')} F`}
          sub={`${orders.length} commande(s)`} values={series.map((s) => s.revenue)} />
        <KpiCard icon="🧾" label="Commandes" color="#3E7CA8" value={orders.length}
          sub={`${pending} en attente · ${delivered} livrée(s)`} values={series.map((s) => s.count)} />
        <KpiCard icon="🛍️" label="Panier moyen" color="#2d8050"
          value={`${Math.round(avgBasket).toLocaleString('fr-FR')} F`} sub="hors commandes annulées" values={series.map((s) => s.revenue)} />
        <KpiCard icon="📐" label="Devis B2B" color="#9B4D8F" value={quotes.length}
          sub={`${quotes.filter((q) => q.status === 'nouvelle').length} nouveau(x)`} values={series.map((s) => s.count)} />
      </div>

      {/* Courbe CA + Donut statuts */}
      <div className="ag-grid-main">
        <Panel title="Chiffre d'affaires · 14 derniers jours"
          action={<span style={{ fontSize:'0.62rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(244,240,230,0.3)' }}>FCFA</span>}>
          <LineChart
            labels={series.map((s) => s.label)}
            series={[{ name:'Chiffre d\'affaires', color:'#D4A017', values: series.map((s) => s.revenue) }]}
            height={300}
          />
        </Panel>
        <Panel title="Statuts des commandes">
          {statusData.length ? (
            <Donut data={statusData} centerLabel="commandes" centerValue={orders.length} />
          ) : (
            <p style={{ fontSize:'0.75rem', color:'rgba(244,240,230,0.35)', textAlign:'center', padding:'40px 0' }}>Aucune commande pour le moment.</p>
          )}
        </Panel>
      </div>

      {/* Barres catégories + Commandes récentes */}
      <div className="ag-grid-2">
        <Panel title="Produits par catégorie">
          {categoryData.length
            ? <BarChart data={categoryData} color="#B8860B" height={260} />
            : <p style={{ fontSize:'0.75rem', color:'rgba(244,240,230,0.35)', textAlign:'center', padding:'40px 0' }}>Aucun produit.</p>}
        </Panel>

        <Panel title="Commandes récentes"
          action={<button onClick={() => setActiveSection('orders')} className="ag-link">Tout voir →</button>}>
          {recent.length ? recent.map((o) => (
            <div key={o.id} className="ag-table-row" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', padding:'11px 0' }}>
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:'0.82rem', fontWeight:700, color:'#F4F0E6', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.customer}</p>
                <p style={{ fontSize:'0.68rem', color:'rgba(244,240,230,0.38)', margin:'2px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.id} · {o.product}</p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <p style={{ fontSize:'0.8rem', fontWeight:900, color:'#D4A017', margin:0 }}>{o.total.toLocaleString('fr-FR')} F</p>
                <span className="ag-badge" style={{ color:STATUS_COLORS[o.status], background:`${STATUS_COLORS[o.status]}1A`, borderColor:`${STATUS_COLORS[o.status]}44`, marginTop:'4px' }}>
                  {STATUS_LABELS[o.status]}
                </span>
              </div>
            </div>
          )) : <p style={{ fontSize:'0.75rem', color:'rgba(244,240,230,0.35)', textAlign:'center', padding:'40px 0' }}>Aucune commande.</p>}
        </Panel>
      </div>

      {/* Devis B2B récents */}
      {recentQ.length > 0 && (
        <Panel title="Devis B2B récents">
          <div className="ag-grid-2" style={{ gap:'10px' }}>
            {recentQ.map((q) => (
              <div key={q.id} style={{ padding:'12px 14px', borderRadius:'12px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', gap:'10px' }}>
                  <p style={{ fontSize:'0.8rem', fontWeight:700, color:'#F4F0E6', margin:0 }}>{q.client_name}</p>
                  <span className="ag-badge" style={{ color:'#9B4D8F', background:'#9B4D8F1A', borderColor:'#9B4D8F44' }}>{q.ref}</span>
                </div>
                <p style={{ fontSize:'0.7rem', color:'rgba(244,240,230,0.4)', margin:'4px 0 0' }}>{q.project_title || q.domain || '—'}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
