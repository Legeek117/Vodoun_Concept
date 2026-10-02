import { useEffect, useState, useCallback } from 'react';
import { apiAdminUsers, apiAdminCreateUser, apiAdminUpdateUser, apiAdminDeleteUser } from '../../../api';

const ROLE_META = {
  admin:   { label:'Administrateur', color:'#D4A017' },
  gestion: { label:'Gestion',        color:'#3E7CA8' },
};

const initials = (name) => (name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

function Modal({ title, onClose, children }) {
  return (
    <div className="ag-modal-overlay" onClick={onClose}
      style={{ position:'fixed', inset:0, zIndex:60, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div className="ag-glass-dark" onClick={(e) => e.stopPropagation()}
        style={{ width:'100%', maxWidth:'480px', padding:'26px', maxHeight:'92vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'22px' }}>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'1.15rem', color:'#F4F0E6', margin:0 }}>{title}</h2>
          <button onClick={onClose} className="ag-icon-btn" aria-label="Fermer">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <label style={{ display:'block' }}>
      <span style={{ display:'block', fontSize:'0.56rem', textTransform:'uppercase', letterSpacing:'0.3em', color:'rgba(244,240,230,0.4)', marginBottom:'7px' }}>{label}</span>
      {children}
      {hint && <span style={{ display:'block', fontSize:'0.65rem', color:'rgba(244,240,230,0.3)', marginTop:'5px' }}>{hint}</span>}
    </label>
  );
}

function Alert({ kind = 'error', children }) {
  const c = kind === 'error' ? '#f87171' : '#37b46e';
  return (
    <div style={{ padding:'11px 14px', borderRadius:'10px', border:`1px solid ${c}55`, background:`${c}14`, color:c, fontSize:'0.75rem', lineHeight:1.5 }}>
      {children}
    </div>
  );
}

export default function AdminUsers({ token, admin }) {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice,  setNotice]  = useState(null);
  const [modal,   setModal]   = useState(null); // null | { mode:'create' } | { mode:'edit', user }
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [formErr, setFormErr] = useState('');

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    apiAdminUsers(token)
      .then((data) => { if (active) setUsers(Array.isArray(data) ? data : []); })
      .catch((e) => { if (active) setNotice({ kind:'error', msg: e.message }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, reloadKey]);

  const reload = useCallback(() => { setLoading(true); setReloadKey((k) => k + 1); }, []);

  const flash = (msg, kind = 'ok') => { setNotice({ kind, msg }); setTimeout(() => setNotice(null), 3500); };

  const openCreate = () => { setForm({ username:'', display_name:'', password:'', role:'gestion' }); setFormErr(''); setModal({ mode:'create' }); };
  const openEdit   = (u) => { setForm({ display_name:u.display_name || '', role:u.role, password:'' }); setFormErr(''); setModal({ mode:'edit', user:u }); };

  const submit = async (e) => {
    e.preventDefault();
    setFormErr(''); setSaving(true);
    try {
      if (modal.mode === 'create') {
        await apiAdminCreateUser(token, form);
        flash(`Utilisateur « ${form.username} » créé.`);
      } else {
        const payload = { display_name: form.display_name, role: form.role };
        if (form.password) payload.password = form.password;
        await apiAdminUpdateUser(token, modal.user.id, payload);
        flash('Utilisateur mis à jour.');
      }
      setModal(null); reload();
    } catch (err) {
      setFormErr(err.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const remove = async (u) => {
    if (!window.confirm(`Supprimer le compte « ${u.username} » ? Cette action est définitive.`)) return;
    try {
      await apiAdminDeleteUser(token, u.id);
      flash('Utilisateur supprimé.');
      reload();
    } catch (err) { flash(err.message, 'error'); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:'16px', flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'1.9rem', color:'#F4F0E6', margin:0 }}>Utilisateurs</h1>
          <p style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.3em', color:'rgba(244,240,230,0.3)', marginTop:'6px' }}>
            Comptes & accès au panneau
          </p>
        </div>
        <button onClick={openCreate} className="ag-btn-primary" style={{ display:'inline-flex', alignItems:'center', gap:'8px' }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Nouvel utilisateur
        </button>
      </div>

      {notice && <Alert kind={notice.kind}>{notice.msg}</Alert>}

      <div style={{ borderRadius:'12px', border:'1px solid rgba(62,124,168,0.3)', background:'rgba(62,124,168,0.07)', padding:'13px 16px', fontSize:'0.74rem', color:'rgba(244,240,230,0.55)', lineHeight:1.6 }}>
        <b style={{ color:'#7FB3D5' }}>Administrateur</b> : accès total, dont cette page.
        &nbsp;·&nbsp; <b style={{ color:'#7FB3D5' }}>Gestion</b> : accès à tout le panneau <i>sauf</i> la gestion des utilisateurs.
      </div>

      {loading ? (
        <p style={{ fontSize:'0.78rem', color:'rgba(244,240,230,0.35)' }}>Chargement…</p>
      ) : (
        <div className="ag-glass" style={{ padding:'6px 8px' }}>
          {users.map((u) => {
            const meta = ROLE_META[u.role] || ROLE_META.gestion;
            const self = admin && u.id === admin.id;
            return (
              <div key={u.id} className="ag-user-row">
                <div style={{ display:'flex', alignItems:'center', gap:'13px', minWidth:0, flex:1 }}>
                  <div className="ag-avatar" style={{ background:`${meta.color}22`, borderColor:`${meta.color}66`, color:meta.color }}>
                    {initials(u.display_name || u.username)}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'0.9rem', fontWeight:700, color:'#F4F0E6', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {u.display_name || u.username}
                      </span>
                      {self && <span style={{ fontSize:'0.55rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(244,240,230,0.4)' }}>(vous)</span>}
                      {u.online && <span title="Connecté" style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#37b46e', boxShadow:'0 0 8px #37b46e' }} />}
                    </div>
                    <span style={{ fontSize:'0.7rem', color:'rgba(244,240,230,0.4)' }}>@{u.username}</span>
                  </div>
                </div>

                <span className="ag-badge" style={{ color:meta.color, background:`${meta.color}1A`, borderColor:`${meta.color}55` }}>{meta.label}</span>

                <span className="ag-user-date">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'}
                </span>

                <div style={{ display:'flex', gap:'6px' }}>
                  <button onClick={() => openEdit(u)} className="ag-icon-btn" title="Modifier">
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => remove(u)} disabled={self} className="ag-icon-btn danger" title={self ? 'Vous ne pouvez pas vous supprimer' : 'Supprimer'} style={{ opacity: self ? 0.3 : 1, cursor: self ? 'not-allowed' : 'pointer' }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
          {!users.length && <p style={{ fontSize:'0.78rem', color:'rgba(244,240,230,0.35)', padding:'20px' }}>Aucun utilisateur.</p>}
        </div>
      )}

      {modal && (
        <Modal title={modal.mode === 'create' ? 'Nouvel utilisateur' : `Modifier ${modal.user.username}`} onClose={() => setModal(null)}>
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {formErr && <Alert>{formErr}</Alert>}

            {modal.mode === 'create' && (
              <Field label="Identifiant de connexion" hint="3 à 64 caractères : lettres, chiffres, . _ -">
                <input className="ag-input" value={form.username || ''} required autoComplete="off"
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="gestion2" />
              </Field>
            )}

            <Field label="Nom de profil">
              <input className="ag-input" value={form.display_name || ''} required
                onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))} placeholder="Marie Dossou" />
            </Field>

            <Field label={modal.mode === 'create' ? 'Mot de passe' : 'Nouveau mot de passe (laisser vide pour ne pas changer)'} hint="8 caractères minimum">
              <input className="ag-input" type="password" value={form.password || ''} required={modal.mode === 'create'} autoComplete="new-password"
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
            </Field>

            <Field label="Rôle" hint={modal.mode === 'edit' && admin && modal.user.id === admin.id ? 'Vous ne pouvez pas modifier votre propre rôle.' : undefined}>
              <select className="ag-input" value={form.role} disabled={modal.mode === 'edit' && admin && modal.user.id === admin.id}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} style={{ cursor:'pointer' }}>
                <option value="gestion" style={{ background:'#1A1410' }}>Gestion — tout sauf la gestion des utilisateurs</option>
                <option value="admin" style={{ background:'#1A1410' }}>Administrateur — accès total</option>
              </select>
            </Field>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'4px' }}>
              <button type="button" onClick={() => setModal(null)} className="ag-btn-ghost">Annuler</button>
              <button type="submit" disabled={saving} className="ag-btn-primary">{saving ? '…' : 'Enregistrer'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
