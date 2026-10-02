import { useState } from 'react';
import { apiAdminUpdateProfile, apiAdminChangePassword } from '../../../api';

const ROLE_META = {
  admin:   { label:'Administrateur', color:'#D4A017' },
  gestion: { label:'Gestion',        color:'#3E7CA8' },
};

function Card({ title, subtitle, children }) {
  return (
    <div className="ag-glass">
      <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <h2 style={{ fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.32em', fontWeight:900, color:'#B8860B', margin:0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize:'0.68rem', color:'rgba(244,240,230,0.35)', margin:'5px 0 0' }}>{subtitle}</p>}
      </div>
      <div style={{ padding:'20px' }}>{children}</div>
    </div>
  );
}

const initials = (name) => (name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

function Msg({ m }) {
  if (!m) return null;
  return (
    <div style={{ padding:'10px 14px', borderRadius:'10px', fontSize:'0.74rem', lineHeight:1.5,
      border:`1px solid ${m.kind === 'ok' ? '#37b46e' : '#f87171'}55`,
      background:`${m.kind === 'ok' ? '#37b46e' : '#f87171'}14`,
      color: m.kind === 'ok' ? '#37b46e' : '#f87171' }}>
      {m.msg}
    </div>
  );
}

export default function AdminProfile({ token, admin, onProfileUpdate }) {
  const [displayName, setDisplayName] = useState(admin?.display_name || '');
  const [nameMsg, setNameMsg] = useState(null);
  const [pwd, setPwd] = useState({ current:'', next:'', confirm:'' });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [savingName, setSavingName] = useState(false);
  const [savingPwd,  setSavingPwd]  = useState(false);

  const meta = ROLE_META[admin?.role] || ROLE_META.gestion;

  const saveName = async (e) => {
    e.preventDefault();
    setNameMsg(null); setSavingName(true);
    try {
      await apiAdminUpdateProfile(token, { display_name: displayName.trim() });
      setNameMsg({ kind:'ok', msg:'Nom de profil mis à jour.' });
      onProfileUpdate?.({ ...admin, display_name: displayName.trim() });
    } catch (err) {
      setNameMsg({ kind:'error', msg: err.message || 'Erreur' });
    } finally { setSavingName(false); }
  };

  const savePwd = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    if (pwd.next.length < 8) { setPwdMsg({ kind:'error', msg:'8 caractères minimum.' }); return; }
    if (pwd.next !== pwd.confirm) { setPwdMsg({ kind:'error', msg:'Les mots de passe ne correspondent pas.' }); return; }
    setSavingPwd(true);
    try {
      await apiAdminChangePassword(token, { current_password: pwd.current, new_password: pwd.next });
      setPwdMsg({ kind:'ok', msg:'Mot de passe modifié avec succès.' });
      setPwd({ current:'', next:'', confirm:'' });
    } catch (err) {
      setPwdMsg({ kind:'error', msg: err.message || 'Erreur' });
    } finally { setSavingPwd(false); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px', maxWidth:'720px' }}>
      <div>
        <h1 style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'1.9rem', color:'#F4F0E6', margin:0 }}>Mon profil</h1>
        <p style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.3em', color:'rgba(244,240,230,0.3)', marginTop:'6px' }}>
          Informations du compte & sécurité
        </p>
      </div>

      {/* Identité */}
      <div className="ag-glass" style={{ padding:'20px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
        <div className="ag-avatar" style={{ width:'56px', height:'56px', fontSize:'1.15rem', background:`${meta.color}22`, borderColor:`${meta.color}66`, color:meta.color }}>
          {initials(admin?.display_name || admin?.username)}
        </div>
        <div style={{ minWidth:0, flex:1 }}>
          <p style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'1.2rem', color:'#F4F0E6', margin:0 }}>
            {admin?.display_name || admin?.username}
          </p>
          <p style={{ fontSize:'0.72rem', color:'rgba(244,240,230,0.4)', margin:'3px 0 0' }}>@{admin?.username}</p>
        </div>
        <span className="ag-badge" style={{ color:meta.color, background:`${meta.color}1A`, borderColor:`${meta.color}55` }}>{meta.label}</span>
      </div>

      {/* Nom de profil */}
      <Card title="Nom de profil" subtitle="Ce nom s'affiche dans le panneau et l'accueil du tableau de bord.">
        <form onSubmit={saveName} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {nameMsg && <Msg m={nameMsg} />}
          <input className="ag-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required placeholder="Votre nom" />
          <button type="submit" disabled={savingName} className="ag-btn-primary" style={{ alignSelf:'flex-start' }}>
            {savingName ? 'Enregistrement…' : 'Enregistrer le nom'}
          </button>
        </form>
      </Card>

      {/* Mot de passe */}
      <Card title="Mot de passe" subtitle="Choisissez un mot de passe d'au moins 8 caractères.">
        <form onSubmit={savePwd} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {pwdMsg && <Msg m={pwdMsg} />}
          <input className="ag-input" type="password" value={pwd.current} onChange={(e) => setPwd((p) => ({ ...p, current:e.target.value }))} required autoComplete="current-password" placeholder="Mot de passe actuel" />
          <input className="ag-input" type="password" value={pwd.next} onChange={(e) => setPwd((p) => ({ ...p, next:e.target.value }))} required autoComplete="new-password" placeholder="Nouveau mot de passe" />
          <input className="ag-input" type="password" value={pwd.confirm} onChange={(e) => setPwd((p) => ({ ...p, confirm:e.target.value }))} required autoComplete="new-password" placeholder="Confirmer le nouveau mot de passe" />
          <button type="submit" disabled={savingPwd} className="ag-btn-primary" style={{ alignSelf:'flex-start' }}>
            {savingPwd ? 'Modification…' : 'Modifier le mot de passe'}
          </button>
        </form>
      </Card>
    </div>
  );
}
