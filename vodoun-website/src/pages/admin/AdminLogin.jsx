import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './admin.css';

const ADMIN_PASSWORD = 'vodun-admin-2024';
const ADMIN_EMAIL    = 'admin@vodun-concept.com';

export default function AdminLogin({ onLogin }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const cardRef  = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = '';
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 40, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'expo.out' }
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('vodun-admin-auth', 'true');
        onLogin();
      } else {
        setError('Email ou mot de passe incorrect.');
        if (errorRef.current) {
          gsap.fromTo(errorRef.current, { x: -10 },
            { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
        }
      }
      setLoading(false);
    }, 700);
  };

  return (
    <div className="ag-bg min-h-screen flex items-center justify-center px-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Halos décoratifs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{ position:'absolute', top:'15%', left:'50%', transform:'translateX(-50%)', width:'600px', height:'400px', background:'radial-gradient(ellipse, rgba(184,134,11,0.08) 0%, transparent 65%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'10%', right:'10%', width:'300px', height:'300px', background:'radial-gradient(ellipse, rgba(28,74,102,0.06) 0%, transparent 70%)', borderRadius:'50%' }} />
      </div>

      <div ref={cardRef} style={{ width:'100%', maxWidth:'420px' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <img
            src="/logo.jpeg"
            alt="Vodoun Concept Store"
            style={{ height:'80px', width:'auto', objectFit:'contain', margin:'0 auto', display:'block' }}
          />
          <p style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.5em', color:'rgba(244,240,230,0.25)', marginTop:'8px' }}>
            Panneau d'administration
          </p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginTop:'12px' }}>
            <span style={{ display:'block', height:'1px', width:'32px', background:'rgba(184,134,11,0.25)' }} />
            <span style={{ display:'block', width:'4px', height:'4px', borderRadius:'50%', background:'rgba(184,134,11,0.5)' }} />
            <span style={{ display:'block', height:'1px', width:'32px', background:'rgba(184,134,11,0.25)' }} />
          </div>
        </div>

        {/* Card glass */}
        <div className="ag-glass-dark" style={{ padding:'36px' }}>
          <h2 style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.35em', fontWeight:900, color:'rgba(244,240,230,0.5)', marginBottom:'28px' }}>
            Connexion
          </h2>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
            <div>
              <label style={{ display:'block', fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.35em', color:'rgba(244,240,230,0.35)', marginBottom:'8px' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="ag-input" placeholder="admin@vodun-concept.com" autoComplete="email" />
            </div>

            <div>
              <label style={{ display:'block', fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.35em', color:'rgba(244,240,230,0.35)', marginBottom:'8px' }}>Mot de passe</label>
              <div style={{ position:'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="ag-input" placeholder="••••••••" autoComplete="current-password"
                  style={{ paddingRight:'44px' }} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(244,240,230,0.3)', padding:0, display:'flex', alignItems:'center' }}>
                  {showPwd
                    ? <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                    : <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>

            {error && (
              <div ref={errorRef} style={{ padding:'10px 14px', background:'rgba(142,36,32,0.15)', border:'1px solid rgba(142,36,32,0.3)', borderRadius:'10px', color:'#f87171', fontSize:'0.75rem', letterSpacing:'0.05em' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="ag-btn-primary"
              style={{ marginTop:'4px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
              {loading
                ? <><span style={{ width:'14px', height:'14px', border:'2px solid rgba(0,0,0,0.2)', borderTop:'2px solid #0D0B08', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />Connexion...</>
                : 'Accéder au panneau'
              }
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', fontSize:'0.55rem', textTransform:'uppercase', letterSpacing:'0.4em', color:'rgba(244,240,230,0.15)', marginTop:'20px' }}>
          Accès restreint · Vodun Concept Store
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
