/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ALL_PRODUCTS } from '../../store';
import { apiAdminOrders, apiAdminSetOrderStatus, apiAdminSetQuoteStatus, apiGetProducts } from '../../api';
import AdminLogin from './AdminLogin';
import AdminDashboard from './sections/AdminDashboard';
import AdminProducts from './sections/AdminProducts';
import AdminOrders from './sections/AdminOrders';
import AdminSettings from './sections/AdminSettings';
import './admin.css';

// Statuts BDD (français) → statuts UI (anglais du panneau)
const STATUS_MAP = {
  'nouvelle': 'pending', 'confirmée': 'confirmed', 'expédiée': 'shipped',
  'livrée': 'delivered', 'annulée': 'cancelled',
};
const STATUS_REV = Object.fromEntries(Object.entries(STATUS_MAP).map(([k, v]) => [v, k]));

function mapOrder(o) {
  const items = o.items || [];
  const first = items[0] || {};
  const opt = (first.options && Object.keys(first.options).length) ? JSON.stringify(first.options) : '';
  return {
    id: o.ref || `#${o.id}`,
    customer: o.customer_name || '—',
    email: o.customer_email || '',
    product: first.name || (items.length ? `${items.length} article(s)` : '—'),
    variant: opt || '—',
    qty: first.qty || items.length || 1,
    total: Number(o.total) || 0,
    date: o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : '—',
    _ts: o.created_at || '',
    status: STATUS_MAP[o.status] || o.status || 'pending',
    phone: o.customer_phone || '',
    address: [o.address, o.city, o.country].filter(Boolean).join(', ') || '—',
    note: o.note || '',
    items,
  };
}

export const Icon = {
  dashboard: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  products:  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  orders:    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  settings:  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  logout:    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  eye:       <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  menu:      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  close:     <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>,
  plus:      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: 'dashboard' },
  { id: 'products',  label: 'Produits',         icon: 'products' },
  { id: 'orders',    label: 'Commandes',         icon: 'orders' },
  { id: 'settings',  label: 'Paramètres',        icon: 'settings' },
];

export default function AdminPage() {
  const [isAuth,        setIsAuth]        = useState(() => sessionStorage.getItem('vodun-admin-auth') === 'true');
  const [token,         setToken]         = useState(() => sessionStorage.getItem('vodun-admin-token') || null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [apiError,      setApiError]      = useState(null);
  const [products,      setProducts]      = useState(ALL_PRODUCTS);
  const [orders,        setOrders]        = useState([]);

  // Chargement des données réelles depuis la BDD
  useEffect(() => {
    if (!isAuth) return;
    let active = true;
    Promise.allSettled([apiGetProducts(), apiAdminOrders(token)])
      .then(([p, o]) => {
        if (!active) return;
        if (p.status === 'fulfilled' && Array.isArray(p.value) && p.value.length) setProducts(p.value);
        if (o.status === 'fulfilled' && Array.isArray(o.value)) setOrders(o.value.map(mapOrder));
        if (p.status === 'rejected' && o.status === 'rejected') setApiError('Impossible de joindre l\'API. Vérifiez que le serveur Node est démarré.');
      });
    return () => { active = false; };
  }, [isAuth, token]);

  // Changement de statut → API + mise à jour locale
  const handleStatusChange = async (collection, id, status) => {
    const fr = STATUS_REV[status] || status;
    if (collection === 'orders') {
      try { await apiAdminSetOrderStatus(token, id, fr); } catch { /* ignore */ }
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } else {
      try { await apiAdminSetQuoteStatus(token, id, fr); } catch { /* ignore */ }
    }
  };

  // Verrouille le scroll de la page pendant que le panneau est ouvert
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (window.lenis) { try { window.lenis.destroy(); } catch { /* ignore */ } delete window.lenis; }
    return () => { document.body.style.overflow = ''; document.documentElement.style.overflow = ''; };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('vodun-admin-auth');
    sessionStorage.removeItem('vodun-admin-token');
    setToken(null);
    setIsAuth(false);
  };

  if (!isAuth) return <AdminLogin onLogin={() => { setToken(sessionStorage.getItem('vodun-admin-token') || null); setIsAuth(true); }} />;

  const renderSection = () => {
    switch(activeSection) {
      case 'dashboard': return <AdminDashboard products={products} orders={orders} setActiveSection={setActiveSection} />;
      case 'products':  return <AdminProducts  products={products} setProducts={setProducts} token={token} />;
      case 'orders':    return <AdminOrders    orders={orders}     setOrders={setOrders} onStatusChange={(id, st) => handleStatusChange('orders', id, st)} />;
      case 'settings':  return <AdminSettings  onLogout={handleLogout} token={token} />;
      default:          return <AdminDashboard products={products} orders={orders} setActiveSection={setActiveSection} />;
    }
  };

  const S = { fontFamily:"'Plus Jakarta Sans', sans-serif", color:'#F4F0E6' };

  return (
    <div style={{ ...S, display:'flex', height:'100vh', overflow:'hidden', background:'#080604' }}>

      {/* Halos de fond */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', top:'20%', left:'18%', width:'400px', height:'400px', background:'radial-gradient(circle, rgba(184,134,11,0.04) 0%, transparent 65%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'15%', right:'15%', width:'350px', height:'350px', background:'radial-gradient(circle, rgba(28,74,102,0.04) 0%, transparent 65%)', borderRadius:'50%' }} />
      </div>

      {/* Overlay mobile sidebar */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:30, backdropFilter:'blur(4px)' }} />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="ag-sidebar" style={{
        width:'240px', flexShrink:0, display:'flex', flexDirection:'column',
        position:'fixed', top:0, left:0, height:'100%', zIndex:40,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition:'transform 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ padding:'28px 20px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <img src="/logo_vodoun.webp" alt="Vodun Concept Store" style={{ height:'40px', width:'auto', objectFit:'contain', display:'block' }} />
              <span style={{ fontSize:'0.5rem', textTransform:'uppercase', letterSpacing:'0.4em', color:'rgba(244,240,230,0.25)', display:'block', marginTop:'5px' }}>Admin Panel</span>
            </div>
            {/* Dot décoratif */}
            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'rgba(184,134,11,0.5)', boxShadow:'0 0 8px rgba(184,134,11,0.4)' }} />
          </div>
        </div>

        {/* Nav */}
        <nav className="ag-scroll" style={{ flex:1, padding:'12px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'4px' }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
              className={`ag-nav-item ${activeSection === item.id ? 'active' : ''}`}
              style={{
                width:'100%', display:'flex', alignItems:'center', gap:'12px',
                padding:'11px 14px', border:'none', cursor:'pointer', textAlign:'left',
                fontSize:'0.72rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em',
                color: activeSection === item.id ? '#1A1410' : 'rgba(244,240,230,0.45)',
                background:'transparent',
              }}>
              <span style={{ opacity: activeSection === item.id ? 1 : 0.7 }}>{Icon[item.icon]}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bas */}
        <div style={{ padding:'12px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <Link to="/accueil" target="_blank"
            style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', borderRadius:'10px', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'rgba(244,240,230,0.35)', textDecoration:'none', transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color='#B8860B'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(244,240,230,0.35)'}>
            {Icon.eye} Voir le site
          </Link>
          <button onClick={handleLogout}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', borderRadius:'10px', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'rgba(244,240,230,0.35)', background:'none', border:'none', cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color='#f87171'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(244,240,230,0.35)'}>
            {Icon.logout} Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Contenu principal ─────────────────────────────────────────── */}
      <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden', marginLeft:'240px', position:'relative', zIndex:1 }}>
        {/* Topbar mobile */}
        <header style={{
          display:'none', // caché sur desktop via @media dans admin.css
          alignItems:'center', justifyContent:'space-between',
          padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)',
          backdropFilter:'blur(20px)', background:'rgba(8,6,4,0.8)',
          position:'sticky', top:0, zIndex:20,
        }} className="ag-topbar-mobile">
          <button onClick={() => setSidebarOpen(true)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(244,240,230,0.6)', padding:0 }}>{Icon.menu}</button>
          <img src="/logo_vodoun.webp" alt="Vodun Concept Store" style={{ height:'32px', width:'auto', objectFit:'contain' }} />
          <div style={{ width:'22px' }} />
        </header>

        {/* Section */}
        <main className="ag-scroll" style={{ flex:1, overflowY:'auto', padding:'28px 28px 48px' }}>
          {apiError && (
            <div style={{ marginBottom:'20px', padding:'14px 18px', borderRadius:'12px', border:'1px solid rgba(142,36,32,0.4)', background:'rgba(142,36,32,0.12)', color:'#f87171', fontSize:'0.8rem', letterSpacing:'0.04em' }}>
              ⚠ {apiError}
            </div>
          )}
          {renderSection()}
        </main>
      </div>

      {/* Responsive sidebar mobile */}
      <style>{`
        @media (max-width: 1023px) {
          .ag-topbar-mobile { display: flex !important; }
        }
        @media (max-width: 1023px) {
          aside.ag-sidebar {
            transform: translateX(-100%);
          }
          aside.ag-sidebar[data-open="true"] {
            transform: translateX(0);
          }
          div[style*="marginLeft: 240px"] {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
