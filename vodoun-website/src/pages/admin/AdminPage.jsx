/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ALL_PRODUCTS } from '../../store';
import { apiAdminMe, apiAdminOrders, apiAdminQuotes, apiGetProducts, apiAdminSetOrderStatus } from '../../api';
import AdminLogin from './AdminLogin';
import AdminDashboard from './sections/AdminDashboard';
import AdminProducts from './sections/AdminProducts';
import AdminOrders from './sections/AdminOrders';
import AdminUsers from './sections/AdminUsers';
import AdminSettings from './sections/AdminSettings';
import AdminProfile from './sections/AdminProfile';
import './admin.css';

// Statuts BDD (français) → statuts UI (anglais du panneau)
const STATUS_MAP = {
  'nouvelle': 'pending', 'confirmée': 'confirmed', 'expédiée': 'shipped',
  'livrée': 'delivered', 'annulée': 'cancelled',
};
const STATUS_REV = Object.fromEntries(Object.entries(STATUS_MAP).map(([k, v]) => [v, k]));

export const ROLE_META = {
  admin:   { label: 'Administrateur', color: '#D4A017' },
  gestion: { label: 'Gestion',        color: '#3E7CA8' },
};

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
  dashboard: <svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  products:  <svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  orders:    <svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  users:     <svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-2.13a4 4 0 10-4-4 4 4 0 004 4zm6-4a3 3 0 11-3-3m-9 3a3 3 0 11-3-3" /></svg>,
  profile:   <svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  settings:  <svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  logout:    <svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  eye:       <svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  menu:      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 6h16M4 12h16M4 18h16" /></svg>,
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: 'dashboard' },
  { id: 'products',  label: 'Produits',         icon: 'products' },
  { id: 'orders',    label: 'Commandes',         icon: 'orders' },
  { id: 'users',     label: 'Utilisateurs',      icon: 'users', adminOnly: true },
  { id: 'settings',  label: 'Paramètres',        icon: 'settings' },
  { id: 'profile',   label: 'Mon profil',        icon: 'profile' },
];

const initials = (name) => (name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const readAdmin = () => {
  try { return JSON.parse(sessionStorage.getItem('vodun-admin-user') || 'null'); } catch { return null; }
};

export default function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem('vodun-admin-token') || null);
  const [admin, setAdmin] = useState(readAdmin);
  const [booting, setBooting] = useState(() => !!sessionStorage.getItem('vodun-admin-token'));
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [products, setProducts] = useState(ALL_PRODUCTS);
  const [orders,   setOrders]   = useState([]);
  const [quotes,   setQuotes]   = useState([]);

  const isAuth = !!token && !!admin;

  const persistAdmin = useCallback((a) => {
    setAdmin(a);
    if (a) sessionStorage.setItem('vodun-admin-user', JSON.stringify(a));
    else sessionStorage.removeItem('vodun-admin-user');
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('vodun-admin-token');
    sessionStorage.removeItem('vodun-admin-user');
    setToken(null);
    setBooting(false);
    persistAdmin(null);
  }, [persistAdmin]);

  // Validation de la session + récupération du rôle à jour
  useEffect(() => {
    if (!token) return;
    let active = true;
    apiAdminMe(token)
      .then((me) => { if (active) persistAdmin({ id:me.id, username:me.username, display_name:me.display_name, role:me.role }); })
      .catch(() => { if (active) logout(); })
      .finally(() => { if (active) setBooting(false); });
    return () => { active = false; };
  }, [token, persistAdmin, logout]);

  // Chargement des données du panneau
  useEffect(() => {
    if (!isAuth) return;
    let active = true;
    Promise.allSettled([apiGetProducts(), apiAdminOrders(token), apiAdminQuotes(token)])
      .then(([p, o, q]) => {
        if (!active) return;
        if (p.status === 'fulfilled' && Array.isArray(p.value) && p.value.length) setProducts(p.value);
        if (o.status === 'fulfilled' && Array.isArray(o.value)) setOrders(o.value.map(mapOrder));
        if (q.status === 'fulfilled' && Array.isArray(q.value)) setQuotes(q.value);
        if (p.status === 'rejected' && o.status === 'rejected') setApiError('Impossible de joindre l\'API. Réessayez dans un instant.');
      });
    return () => { active = false; };
  }, [isAuth, token]);

  // Verrouille le scroll global pendant que le panneau est ouvert
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (window.lenis) { try { window.lenis.destroy(); } catch { /* ignore */ } delete window.lenis; }
    return () => { document.body.style.overflow = ''; document.documentElement.style.overflow = ''; };
  }, []);

  const handleStatusChange = async (id, status) => {
    const fr = STATUS_REV[status] || status;
    try { await apiAdminSetOrderStatus(token, id, fr); } catch { /* ignore */ }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const visibleNav = NAV_ITEMS.filter((it) => !it.adminOnly || admin?.role === 'admin');

  // Section effective : garde par rôle (« Utilisateurs » réservé au rôle admin)
  const section = (activeSection === 'users' && admin?.role !== 'admin') ? 'dashboard' : activeSection;

  if (booting) {
    return (
      <div className="ag-bg" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ width:'26px', height:'26px', border:'2px solid rgba(184,134,11,0.25)', borderTopColor:'#D4A017', borderRadius:'50%', display:'inline-block', animation:'ag-spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!isAuth) {
    return (
      <AdminLogin
        onLogin={(res) => {
          sessionStorage.setItem('vodun-admin-token', res.token);
          setToken(res.token);
          persistAdmin({ id:res.id, username:res.username, display_name:res.display_name, role:res.role });
        }}
      />
    );
  }

  const meta = ROLE_META[admin.role] || ROLE_META.gestion;

  const renderSection = () => {
    switch (section) {
      case 'dashboard': return <AdminDashboard products={products} orders={orders} quotes={quotes} admin={admin} setActiveSection={setActiveSection} />;
      case 'products':  return <AdminProducts products={products} setProducts={setProducts} token={token} />;
      case 'orders':    return <AdminOrders orders={orders} setOrders={setOrders} onStatusChange={handleStatusChange} />;
      case 'users':     return <AdminUsers token={token} admin={admin} />;
      case 'settings':  return <AdminSettings onLogout={logout} token={token} onGoProfile={() => setActiveSection('profile')} />;
      case 'profile':   return <AdminProfile token={token} admin={admin} onProfileUpdate={persistAdmin} />;
      default:          return <AdminDashboard products={products} orders={orders} quotes={quotes} admin={admin} setActiveSection={setActiveSection} />;
    }
  };

  const go = (id) => { setActiveSection(id); setSidebarOpen(false); };

  return (
    <div className="ag-shell">
      {/* Halos de fond */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', top:'18%', left:'14%', width:'420px', height:'420px', background:'radial-gradient(circle, rgba(184,134,11,0.05) 0%, transparent 65%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'12%', right:'12%', width:'380px', height:'380px', background:'radial-gradient(circle, rgba(28,74,102,0.05) 0%, transparent 65%)', borderRadius:'50%' }} />
      </div>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="ag-overlay" />}

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className={`ag-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding:'24px 20px 18px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <img src="/logo_vodoun.webp" alt="Vodun Concept Store" style={{ height:'38px', width:'auto', objectFit:'contain', display:'block' }} />
            <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'rgba(184,134,11,0.5)', boxShadow:'0 0 10px rgba(184,134,11,0.5)' }} />
          </div>
          <span style={{ fontSize:'0.5rem', textTransform:'uppercase', letterSpacing:'0.4em', color:'rgba(244,240,230,0.25)', display:'block', marginTop:'6px' }}>Espace de gestion</span>
        </div>

        <nav className="ag-scroll ag-nav">
          {visibleNav.map((item) => (
            <button key={item.id} onClick={() => go(item.id)} className={`ag-nav-item ${section === item.id ? 'active' : ''}`}>
              <span style={{ opacity: section === item.id ? 1 : 0.75, display:'flex' }}>{Icon[item.icon]}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding:'12px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          {/* Carte utilisateur */}
          <button onClick={() => go('profile')} className="ag-usercard">
            <span className="ag-avatar" style={{ width:'36px', height:'36px', fontSize:'0.78rem', background:`${meta.color}22`, borderColor:`${meta.color}66`, color:meta.color }}>
              {initials(admin.display_name || admin.username)}
            </span>
            <span style={{ minWidth:0, textAlign:'left', flex:1 }}>
              <span style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#F4F0E6', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {admin.display_name || admin.username}
              </span>
              <span style={{ display:'block', fontSize:'0.6rem', color:meta.color, letterSpacing:'0.05em' }}>{meta.label}</span>
            </span>
          </button>

          <Link to="/accueil" target="_blank" className="ag-side-action">{Icon.eye} Voir le site</Link>
          <button onClick={logout} className="ag-side-action danger">{Icon.logout} Déconnexion</button>
        </div>
      </aside>

      {/* ── Contenu principal ────────────────────────────────────────────── */}
      <div className="ag-main">
        <header className="ag-topbar">
          <button onClick={() => setSidebarOpen(true)} className="ag-icon-btn" aria-label="Ouvrir le menu">{Icon.menu}</button>
          <img src="/logo_vodoun.webp" alt="Vodun Concept Store" style={{ height:'30px', width:'auto', objectFit:'contain' }} />
          <span className="ag-avatar" style={{ width:'32px', height:'32px', fontSize:'0.72rem', background:`${meta.color}22`, borderColor:`${meta.color}66`, color:meta.color }}>
            {initials(admin.display_name || admin.username)}
          </span>
        </header>

        <main className="ag-scroll ag-content">
          {apiError && (
            <div style={{ marginBottom:'20px', padding:'14px 18px', borderRadius:'12px', border:'1px solid rgba(142,36,32,0.4)', background:'rgba(142,36,32,0.12)', color:'#f87171', fontSize:'0.8rem' }}>
              ⚠ {apiError}
            </div>
          )}
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
