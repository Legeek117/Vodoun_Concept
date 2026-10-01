import { useState, useEffect } from 'react';
import { apiAdminSettings, apiAdminUpdateSettings } from '../../../api';

const iStyle = { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', color:'#F4F0E6', padding:'9px 13px', fontSize:'0.85rem', outline:'none', fontFamily:"'Plus Jakarta Sans', sans-serif", transition:'border-color 0.2s, box-shadow 0.2s' };

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      position:'relative', display:'inline-flex', alignItems:'center',
      width:'44px', height:'24px', borderRadius:'999px', border:'none', cursor:'pointer',
      background: value ? 'linear-gradient(135deg,#B8860B,#D4A017)' : 'rgba(255,255,255,0.1)',
      boxShadow: value ? '0 0 12px rgba(184,134,11,0.3)' : 'none',
      transition:'all 0.25s ease',
    }}>
      <span style={{
        position:'absolute', left: value ? '22px' : '3px',
        width:'18px', height:'18px', borderRadius:'50%', background:'#F4F0E6',
        boxShadow:'0 1px 4px rgba(0,0,0,0.3)',
        transition:'left 0.25s ease',
      }} />
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div className="ag-glass" style={{ overflow:'hidden' }}>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <h2 style={{ fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.35em', fontWeight:900, color:'#B8860B', margin:0 }}>{title}</h2>
      </div>
      <div style={{ padding:'4px 0' }}>{children}</div>
    </div>
  );
}

function Row({ label, desc, children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:'0.85rem', fontWeight:600, color:'#F4F0E6', margin:0 }}>{label}</p>
        {desc && <p style={{ fontSize:'0.7rem', color:'rgba(244,240,230,0.35)', margin:'3px 0 0' }}>{desc}</p>}
      </div>
      <div style={{ flexShrink:0 }}>{children}</div>
    </div>
  );
}

export default function AdminSettings({ onLogout, token }) {
  const [s, setS] = useState({
    siteName:'Vodun Concept Store', siteSlogan:"Là où le sacré devient désirable",
    adminEmail:'admin@vodun-concept.com', contactEmail:'contact@vodun-concept.com',
    maintenanceMode:false, showPrices:true, allowOrders:true, currency:'FCFA',
    whatsapp:'+229 97 00 00 00', instagram:'@vodun.concept',
  });
  const [saved,    setSaved]    = useState(false);
  const [pwdOpen,  setPwdOpen]  = useState(false);
  const [newPwd,   setNewPwd]   = useState('');
  const [confPwd,  setConfPwd]  = useState('');
  const [pwdMsg,   setPwdMsg]   = useState('');
  const [loaded,   setLoaded]   = useState(false);

  // Chargement des réglages depuis la BDD
  useEffect(() => {
    if (!token) return;
    apiAdminSettings(token)
      .then((data) => {
        if (!data) return;
        setS(prev => ({
          ...prev,
          siteName: data.siteName || prev.siteName,
          siteSlogan: data.siteSlogan || prev.siteSlogan,
          adminEmail: data.adminEmail || prev.adminEmail,
          contactEmail: data.contactEmail || prev.contactEmail,
          whatsapp: data.whatsapp || prev.whatsapp,
          instagram: data.instagram || prev.instagram,
          currency: data.currency || prev.currency,
          maintenanceMode: data.maintenanceMode === 'true',
          showPrices: data.showPrices === 'true',
          allowOrders: data.allowOrders === 'true',
        }));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [token]);

  const set = k => v => setS(p => ({...p, [k]:v}));
  const inp = k => e => setS(p => ({...p, [k]:e.target.value}));

  const save = async () => {
    try {
      await apiAdminUpdateSettings(token, {
        siteName: s.siteName, siteSlogan: s.siteSlogan, adminEmail: s.adminEmail,
        contactEmail: s.contactEmail, whatsapp: s.whatsapp, instagram: s.instagram,
        currency: s.currency,
        maintenanceMode: String(s.maintenanceMode), showPrices: String(s.showPrices),
        allowOrders: String(s.allowOrders),
      });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(false);
    }
  };

  const changePwd = () => {
    if (newPwd.length < 8) { setPwdMsg('8 caractères minimum.'); return; }
    if (newPwd !== confPwd) { setPwdMsg('Les mots de passe ne correspondent pas.'); return; }
    setPwdMsg('Modifiez ADMIN_PASSWORD dans les variables d\'environnement du serveur (Plesk) puis redémarrez l\'application.');
    setNewPwd(''); setConfPwd('');
    setTimeout(() => { setPwdMsg(''); setPwdOpen(false); }, 6000);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px', maxWidth:'760px' }}>
      <div>
        <h1 style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'1.8rem', textTransform:'uppercase', color:'#F4F0E6', margin:0 }}>Paramètres</h1>
        <p style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.3em', color:'rgba(244,240,230,0.3)', margin:'4px 0 0' }}>Configuration générale</p>
      </div>

      <Section title="Informations du site">
        <Row label="Nom du site" desc="Titre et emails">
          <input value={s.siteName} onChange={inp('siteName')} style={{ ...iStyle, width:'220px' }} onFocus={e=>{e.target.style.borderColor='rgba(184,134,11,0.6)';e.target.style.boxShadow='0 0 0 3px rgba(184,134,11,0.1)'}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)';e.target.style.boxShadow='none'}} />
        </Row>
        <Row label="Slogan" desc="Tagline principale">
          <input value={s.siteSlogan} onChange={inp('siteSlogan')} style={{ ...iStyle, width:'220px' }} onFocus={e=>{e.target.style.borderColor='rgba(184,134,11,0.6)';e.target.style.boxShadow='0 0 0 3px rgba(184,134,11,0.1)'}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)';e.target.style.boxShadow='none'}} />
        </Row>
        <Row label="Email contact public">
          <input value={s.contactEmail} onChange={inp('contactEmail')} style={{ ...iStyle, width:'220px' }} onFocus={e=>{e.target.style.borderColor='rgba(184,134,11,0.6)';e.target.style.boxShadow='0 0 0 3px rgba(184,134,11,0.1)'}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)';e.target.style.boxShadow='none'}} />
        </Row>
        <Row label="WhatsApp">
          <input value={s.whatsapp} onChange={inp('whatsapp')} style={{ ...iStyle, width:'180px' }} onFocus={e=>{e.target.style.borderColor='rgba(184,134,11,0.6)';}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)';}} />
        </Row>
        <Row label="Instagram">
          <input value={s.instagram} onChange={inp('instagram')} style={{ ...iStyle, width:'160px' }} onFocus={e=>{e.target.style.borderColor='rgba(184,134,11,0.6)';}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)';}} />
        </Row>
      </Section>

      <Section title="Boutique">
        <Row label="Mode maintenance" desc="Cache la boutique"><Toggle value={s.maintenanceMode} onChange={set('maintenanceMode')} /></Row>
        <Row label="Afficher les prix"><Toggle value={s.showPrices} onChange={set('showPrices')} /></Row>
        <Row label="Autoriser les commandes"><Toggle value={s.allowOrders} onChange={set('allowOrders')} /></Row>
        <Row label="Devise">
          <select value={s.currency} onChange={inp('currency')} style={{ ...iStyle, width:'auto', cursor:'pointer' }}>
            {['FCFA','EUR','USD'].map(c => <option key={c} style={{ background:'#1A1410' }}>{c}</option>)}
          </select>
        </Row>
      </Section>

      <Section title="Sécurité">
        <Row label="Email admin" desc="Identifiant de connexion">
          <input value={s.adminEmail} onChange={inp('adminEmail')} style={{ ...iStyle, width:'220px' }} onFocus={e=>{e.target.style.borderColor='rgba(184,134,11,0.6)';}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)';}} />
        </Row>
        <Row label="Mot de passe" desc="Modifier le mot de passe">
          <button onClick={() => setPwdOpen(v => !v)} className="ag-btn-ghost" style={{ fontSize:'0.65rem', padding:'8px 16px' }}>Modifier</button>
        </Row>
        {pwdOpen && (
          <div style={{ margin:'0 20px 12px', padding:'16px', background:'rgba(255,255,255,0.02)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', gap:'10px' }}>
            {[['newPwd',newPwd,setNewPwd,'Nouveau mot de passe'],['confPwd',confPwd,setConfPwd,'Confirmer']].map(([k,v,sv,ph]) => (
              <input key={k} type="password" value={v} onChange={e => sv(e.target.value)} placeholder={ph}
                style={{ ...iStyle }} onFocus={e=>{e.target.style.borderColor='rgba(184,134,11,0.5)';}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)';}} />
            ))}
            {pwdMsg && <p style={{ fontSize:'0.72rem', color: pwdMsg.includes('jour') ? '#2d8050':'#f87171', margin:0 }}>{pwdMsg}</p>}
            <button onClick={changePwd} className="ag-btn-primary" style={{ alignSelf:'flex-start' }}>Confirmer</button>
          </div>
        )}
        <Row label="Déconnexion" desc="Terminer la session">
          <button onClick={onLogout}
            style={{ padding:'9px 18px', borderRadius:'10px', fontSize:'0.65rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.2em', background:'rgba(142,36,32,0.2)', color:'#f87171', border:'1px solid rgba(142,36,32,0.4)', cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(142,36,32,0.35)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(142,36,32,0.2)'}>
            Déconnecter
          </button>
        </Row>
      </Section>

      {/* Notice backend */}
      <div style={{ borderRadius:'14px', border:'1px solid rgba(45,128,80,0.3)', background:'rgba(45,128,80,0.06)', padding:'16px 20px' }}>
        <p style={{ fontSize:'0.65rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.25em', color:'#2d8050', margin:'0 0 6px' }}>
          {loaded ? '✓ Connecté à la base de données' : 'Connexion à la base…'}
        </p>
        <p style={{ fontSize:'0.75rem', color:'rgba(244,240,230,0.4)', margin:0, lineHeight:1.6 }}>
          Réglages enregistrés dans PostgreSQL (serveur d'hébergement). Le mot de passe admin se modifie via la variable d'environnement <code style={{ color:'#B8860B' }}>ADMIN_PASSWORD</code> (Plesk → Node.js).
        </p>
      </div>

      {/* Save */}
      <div style={{ display:'flex', alignItems:'center', gap:'14px', paddingBottom:'12px' }}>
        <button onClick={save} className="ag-btn-primary">Sauvegarder</button>
        {saved && <span style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.3em', fontWeight:900, color:'#2d8050' }}>✓ Sauvegardé</span>}
      </div>
    </div>
  );
}
