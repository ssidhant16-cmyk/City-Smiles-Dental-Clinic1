import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, subscribeToTable } from './lib/supabase';

// ══════════════════════════════════════════════════════════════════
//  DESIGN TOKENS
// ══════════════════════════════════════════════════════════════════
const C = {
  bg:        '#080F1E',
  surface:   '#0D1B35',
  surfaceHi: '#112240',
  border:    '#1A3055',
  borderHi:  '#1E4080',
  accent:    '#0EA5E9',
  accentHi:  '#38BDF8',
  accentDim: '#0369A1',
  success:   '#10B981',
  warning:   '#F59E0B',
  danger:    '#EF4444',
  text:      '#E2E8F0',
  textMid:   '#94A3B8',
  textDim:   '#475569',
};

const css = String.raw;

// ══════════════════════════════════════════════════════════════════
//  GLOBAL STYLES (injected into <head>)
// ══════════════════════════════════════════════════════════════════
const GLOBAL_CSS = css`
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 15px; }

  body {
    background: ${C.bg};
    color: ${C.text};
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    line-height: 1.6;
    min-height: 100vh;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: ${C.surface}; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: ${C.accentDim}; }

  h1, h2, h3, h4 {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    letter-spacing: 0.03em;
    line-height: 1.2;
  }

  input, select, textarea {
    background: ${C.surfaceHi};
    border: 1px solid ${C.border};
    border-radius: 8px;
    color: ${C.text};
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 300;
    outline: none;
    padding: 0.55rem 0.9rem;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
  }
  input:focus, select:focus, textarea:focus {
    border-color: ${C.accent};
    box-shadow: 0 0 0 2px ${C.accentDim}44;
  }
  input::placeholder, textarea::placeholder { color: ${C.textDim}; }
  select option { background: ${C.surface}; }

  label {
    color: ${C.textMid};
    display: block;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    margin-bottom: 0.3rem;
    text-transform: uppercase;
  }

  table { border-collapse: collapse; width: 100%; }
  thead tr { background: ${C.surfaceHi}; }
  th {
    color: ${C.textMid};
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    padding: 0.7rem 1rem;
    text-align: left;
    text-transform: uppercase;
    border-bottom: 1px solid ${C.border};
  }
  td {
    border-bottom: 1px solid ${C.border}20;
    color: ${C.text};
    font-size: 0.88rem;
    padding: 0.8rem 1rem;
    vertical-align: middle;
  }
  tbody tr:hover { background: ${C.surfaceHi}55; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

  .fade-in { animation: fadeIn 0.3s ease both; }

  .btn {
    align-items: center;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: inline-flex;
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    gap: 0.4rem;
    letter-spacing: 0.05em;
    padding: 0.55rem 1.2rem;
    transition: all 0.18s ease;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .btn-primary {
    background: linear-gradient(135deg, ${C.accent}, ${C.accentDim});
    box-shadow: 0 0 20px ${C.accent}33;
    color: #fff;
  }
  .btn-primary:hover {
    box-shadow: 0 0 28px ${C.accent}55;
    transform: translateY(-1px);
  }
  .btn-ghost {
    background: transparent;
    border: 1px solid ${C.border};
    color: ${C.textMid};
  }
  .btn-ghost:hover { background: ${C.surfaceHi}; border-color: ${C.accent}; color: ${C.accent}; }
  .btn-danger { background: ${C.danger}22; border: 1px solid ${C.danger}44; color: ${C.danger}; }
  .btn-danger:hover { background: ${C.danger}33; }
  .btn-sm { font-size: 0.78rem; padding: 0.35rem 0.8rem; }
  .btn-icon { border-radius: 8px; padding: 0.4rem; }

  .badge {
    border-radius: 4px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    padding: 0.2rem 0.6rem;
    text-transform: uppercase;
  }
  .badge-scheduled { background: ${C.accent}22; color: ${C.accent}; }
  .badge-completed { background: ${C.success}22; color: ${C.success}; }
  .badge-cancelled { background: ${C.danger}22; color: ${C.danger}; }
  .badge-no-show   { background: ${C.warning}22; color: ${C.warning}; }
  .badge-planned   { background: ${C.accentDim}33; color: ${C.accentHi}; }
  .badge-in-progress { background: ${C.warning}22; color: ${C.warning}; }
  .badge-low-stock { background: ${C.danger}22; color: ${C.danger}; }
  .badge-ok        { background: ${C.success}22; color: ${C.success}; }

  .modal-backdrop {
    align-items: center;
    animation: fadeIn 0.15s ease;
    backdrop-filter: blur(4px);
    background: rgba(0,0,0,0.7);
    display: flex;
    inset: 0;
    justify-content: center;
    padding: 1rem;
    position: fixed;
    z-index: 1000;
  }
  .modal {
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 16px;
    box-shadow: 0 40px 80px rgba(0,0,0,0.6);
    max-height: 90vh;
    overflow-y: auto;
    padding: 2rem;
    position: relative;
    width: 100%;
    max-width: 600px;
  }
  .modal-lg { max-width: 800px; }

  .card {
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 12px;
    padding: 1.5rem;
  }
  .card-header {
    border-bottom: 1px solid ${C.border};
    margin: -1.5rem -1.5rem 1.5rem;
    padding: 1.2rem 1.5rem;
  }

  .form-grid { display: grid; gap: 1rem; }
  .form-grid-2 { grid-template-columns: 1fr 1fr; }
  .form-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
  @media (max-width: 640px) {
    .form-grid-2, .form-grid-3 { grid-template-columns: 1fr; }
  }

  .stat-card {
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 12px;
    overflow: hidden;
    padding: 1.4rem;
    position: relative;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .stat-card::before {
    content: '';
    height: 3px;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }

  .sidebar-link {
    align-items: center;
    border-radius: 8px;
    color: ${C.textMid};
    cursor: pointer;
    display: flex;
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    gap: 0.7rem;
    letter-spacing: 0.04em;
    padding: 0.65rem 1rem;
    text-transform: uppercase;
    transition: all 0.18s ease;
    user-select: none;
  }
  .sidebar-link:hover { background: ${C.surfaceHi}; color: ${C.text}; }
  .sidebar-link.active { background: ${C.accent}18; color: ${C.accent}; }
  .sidebar-link.active .nav-icon { color: ${C.accent}; }

  .search-input {
    background: ${C.surfaceHi};
    border: 1px solid ${C.border};
    border-radius: 8px;
    color: ${C.text};
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 300;
    outline: none;
    padding: 0.55rem 1rem 0.55rem 2.4rem;
    transition: border-color 0.2s;
    width: 280px;
  }
  .search-input:focus { border-color: ${C.accent}; }

  @media (max-width: 900px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: none; }
    .main-content { margin-left: 0 !important; }
  }
  @media print {
    .no-print { display: none !important; }
    body { background: white; color: black; }
    .print-area { color: black; }
  }
`;

// ══════════════════════════════════════════════════════════════════
//  ICONS (inline SVG)
// ══════════════════════════════════════════════════════════════════
const Icon = ({ name, size = 18, color = 'currentColor' }) => {
  const paths = {
    dashboard: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    patients: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    calendar: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    treatment: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14v-4m0-4h4m-4 0H8',
    prescription: 'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z',
    inventory: 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm-9-4h4l2 4H7l2-4z',
    plus:  'M12 5v14m-7-7h14',
    edit:  'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
    trash: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    close: 'M18 6 6 18M6 6l12 12',
    alert: 'M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
    print: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8z',
    tooth: 'M12 2C8.5 2 6 5 6 8c0 2 .5 3.5 1 5s1 4 1 6h1c0-2 .5-4 1-5 .5-1 1-2 2-2s1.5 1 2 2 1 3 1 5h1c0-2 .5-4.5 1-6s1-3 1-5c0-3-2.5-6-6-6z',
    search: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
    menu:  'M3 12h18M3 6h18M3 18h18',
    check: 'M20 6 9 17l-5-5',
    pill:  'M10.5 3.5a5 5 0 0 1 7.07 7.07L6.43 21.64a5 5 0 0 1-7.07-7.07L10.5 3.5zM8.464 15.536l7.072-7.072',
    box:   'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12',
    clock: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2',
    dollar:'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name] || ''} />
    </svg>
  );
};

// ══════════════════════════════════════════════════════════════════
//  UTILITY HOOKS & HELPERS
// ══════════════════════════════════════════════════════════════════
function useTable(tableName, orderBy = 'created_at', orderDir = false) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order(orderBy, { ascending: orderDir });
    if (!error) setRows(data || []);
    setLoading(false);
  }, [tableName, orderBy, orderDir]);

  useEffect(() => {
    fetch();
    const unsub = subscribeToTable(tableName, () => fetch());
    return unsub;
  }, [fetch, tableName]);

  return { rows, loading, refresh: fetch, setRows };
}

function usePatients() {
  const [patients, setPatients] = useState([]);
  useEffect(() => {
    supabase.from('patients').select('id,first_name,last_name').order('last_name')
      .then(({ data }) => setPatients(data || []));
  }, []);
  return patients;
}

const fmt = {
  date: d => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—',
  currency: n => n != null ? `SAR ${Number(n).toLocaleString('en', { minimumFractionDigits: 2 })}` : '—',
  fullName: p => p ? `${p.first_name} ${p.last_name}` : '—',
};

// ══════════════════════════════════════════════════════════════════
//  SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════════
function Modal({ open, onClose, title, children, size = '' }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`} style={{ animation: 'fadeIn .2s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h3 style={{ fontSize:'1.3rem', color: C.text }}>{title}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon name="close" size={16}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmDialog({ open, onClose, onConfirm, message }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 400 }}>
        <div style={{ textAlign:'center', padding:'1rem 0' }}>
          <Icon name="alert" size={40} color={C.warning}/>
          <p style={{ marginTop:'1rem', color: C.textMid }}>{message}</p>
        </div>
        <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end', marginTop:'1.5rem' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={() => { onConfirm(); onClose(); }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ padding:'4rem 2rem', textAlign:'center' }}>
      <Icon name={icon} size={48} color={C.textDim}/>
      <h3 style={{ color: C.textMid, marginTop:'1rem', fontSize:'1.2rem' }}>{title}</h3>
      <p style={{ color: C.textDim, fontSize:'0.88rem', marginTop:'0.4rem' }}>{sub}</p>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ padding:'3rem', display:'flex', justifyContent:'center' }}>
      <div style={{ width:36, height:36, border:`3px solid ${C.border}`, borderTop:`3px solid ${C.accent}`,
        borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
    </div>
  );
}

function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.8rem', flexWrap:'wrap', gap:'1rem' }}>
      <div>
        <h2 style={{ fontSize:'1.8rem', color: C.text, letterSpacing:'0.03em' }}>{title}</h2>
        {sub && <p style={{ color: C.textMid, fontSize:'0.88rem', marginTop:'0.2rem' }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function FieldGroup({ label, children, span }) {
  return (
    <div style={span ? { gridColumn: `span ${span}` } : {}}>
      <label>{label}</label>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════════════════════
function Dashboard() {
  const [stats, setStats] = useState({ patients:0, todayAppts:0, totalRevenue:0, lowStock:0 });
  const [recentAppts, setRecentAppts] = useState([]);
  const [lowItems, setLowItems] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    Promise.all([
      supabase.from('patients').select('id', { count:'exact', head:true }),
      supabase.from('appointments').select('*').eq('appointment_date', today),
      supabase.from('treatments').select('cost').eq('status','completed'),
      supabase.from('inventory').select('*').then(r => r),
      supabase.from('appointments').select(`*, patients(first_name,last_name)`).order('appointment_date', { ascending:false }).limit(5),
    ]).then(([p, a, t, inv, ra]) => {
      const lowStock = (inv.data || []).filter(i => i.quantity <= i.low_stock_threshold);
      const rev = (t.data || []).reduce((s, r) => s + Number(r.cost || 0), 0);
      setStats({
        patients: p.count || 0,
        todayAppts: (a.data || []).length,
        totalRevenue: rev,
        lowStock: lowStock.length,
      });
      setRecentAppts(ra.data || []);
      setLowItems(lowStock);
    });
  }, []);

  const statCards = [
    { label:'Total Patients', value: stats.patients, icon:'patients', color: C.accent },
    { label:"Today's Appointments", value: stats.todayAppts, icon:'calendar', color: C.success },
    { label:'Total Revenue', value: fmt.currency(stats.totalRevenue), icon:'dollar', color: '#A78BFA' },
    { label:'Low Stock Alerts', value: stats.lowStock, icon:'alert', color: C.warning },
  ];

  return (
    <div className="fade-in">
      <PageHeader title="Dashboard" sub="City Smiles Dental Clinic — Overview"/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card" style={{ '--accent': s.color }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background: s.color, borderRadius:'12px 12px 0 0' }}/>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ color: C.textMid, fontSize:'0.75rem', fontFamily:'Rajdhani', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>{s.label}</div>
                <div style={{ color: s.color, fontFamily:'Rajdhani', fontSize:'2rem', fontWeight:700, marginTop:'0.3rem', lineHeight:1 }}>{s.value}</div>
              </div>
              <div style={{ background: s.color+'22', borderRadius:8, padding:'0.5rem' }}>
                <Icon name={s.icon} size={20} color={s.color}/>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize:'1rem', display:'flex', gap:'0.5rem', alignItems:'center' }}>
              <Icon name="calendar" size={16} color={C.accent}/> Recent Appointments
            </h3>
          </div>
          {recentAppts.length === 0 ? <EmptyState icon="calendar" title="No appointments" sub=""/> :
            <table>
              <thead><tr><th>Patient</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {recentAppts.map(a => (
                  <tr key={a.id}>
                    <td>{a.patients ? fmt.fullName(a.patients) : '—'}</td>
                    <td style={{ color: C.textMid }}>{fmt.date(a.appointment_date)}</td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize:'1rem', display:'flex', gap:'0.5rem', alignItems:'center' }}>
              <Icon name="alert" size={16} color={C.warning}/> Low Stock Items
            </h3>
          </div>
          {lowItems.length === 0
            ? <div style={{ padding:'2rem', textAlign:'center', color: C.success, fontFamily:'Rajdhani', fontSize:'0.95rem' }}>
                <Icon name="check" size={32} color={C.success}/><div style={{ marginTop:'0.5rem' }}>All items are well stocked</div>
              </div>
            : <table>
                <thead><tr><th>Item</th><th>Qty</th><th>Min</th></tr></thead>
                <tbody>
                  {lowItems.map(i => (
                    <tr key={i.id}>
                      <td>{i.item_name}</td>
                      <td style={{ color: C.danger, fontWeight:600 }}>{i.quantity} {i.unit}</td>
                      <td style={{ color: C.textDim }}>{i.low_stock_threshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  PATIENTS
// ══════════════════════════════════════════════════════════════════
const PATIENT_DEFAULTS = { first_name:'', last_name:'', date_of_birth:'', gender:'', phone:'', email:'', address:'', blood_group:'', allergies:'', medical_notes:'' };

function PatientForm({ initial={}, onSave, onClose }) {
  const [form, setForm] = useState({ ...PATIENT_DEFAULTS, ...initial });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.first_name || !form.last_name) return alert('First and last name are required.');
    setSaving(true);
    const { id, created_at, updated_at, ...data } = form;
    const op = id
      ? supabase.from('patients').update(data).eq('id', id)
      : supabase.from('patients').insert(data);
    const { error } = await op;
    setSaving(false);
    if (error) return alert(error.message);
    onSave();
    onClose();
  };

  return (
    <div className="form-grid">
      <div className="form-grid form-grid-2">
        <FieldGroup label="First Name *"><input value={form.first_name} onChange={set('first_name')} placeholder="Ahmed"/></FieldGroup>
        <FieldGroup label="Last Name *"><input value={form.last_name} onChange={set('last_name')} placeholder="Hassan"/></FieldGroup>
        <FieldGroup label="Date of Birth"><input type="date" value={form.date_of_birth||''} onChange={set('date_of_birth')}/></FieldGroup>
        <FieldGroup label="Gender">
          <select value={form.gender} onChange={set('gender')}>
            <option value="">Select…</option>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        </FieldGroup>
        <FieldGroup label="Phone"><input value={form.phone} onChange={set('phone')} placeholder="05x xxx xxxx"/></FieldGroup>
        <FieldGroup label="Email"><input type="email" value={form.email} onChange={set('email')} placeholder="patient@email.com"/></FieldGroup>
        <FieldGroup label="Blood Group">
          <select value={form.blood_group} onChange={set('blood_group')}>
            <option value="">Select…</option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
          </select>
        </FieldGroup>
        <FieldGroup label="Allergies"><input value={form.allergies} onChange={set('allergies')} placeholder="e.g. Penicillin"/></FieldGroup>
      </div>
      <FieldGroup label="Address"><input value={form.address} onChange={set('address')} placeholder="Full address"/></FieldGroup>
      <FieldGroup label="Medical Notes">
        <textarea rows={3} value={form.medical_notes} onChange={set('medical_notes')} placeholder="Relevant medical history, chronic conditions…"/>
      </FieldGroup>
      <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end' }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : form.id ? 'Update Patient' : 'Add Patient'}
        </button>
      </div>
    </div>
  );
}

function Patients() {
  const { rows, loading, refresh } = useTable('patients', 'last_name', true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | patient obj
  const [confirm, setConfirm] = useState(null);

  const filtered = rows.filter(p =>
    `${p.first_name} ${p.last_name} ${p.phone} ${p.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const del = async (id) => {
    await supabase.from('patients').delete().eq('id', id);
    refresh();
  };

  return (
    <div className="fade-in">
      <PageHeader title="Patients" sub={`${rows.length} total patients`}
        action={<button className="btn btn-primary" onClick={() => setModal('add')}><Icon name="plus" size={15}/>Add Patient</button>}/>

      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.2rem', flexWrap:'wrap', gap:'0.8rem' }}>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color: C.textDim }}>
              <Icon name="search" size={15}/>
            </span>
            <input className="search-input" placeholder="Search patients…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>

        {loading ? <Spinner/> : filtered.length === 0
          ? <EmptyState icon="patients" title="No patients found" sub={search ? 'Try a different search' : 'Add your first patient'}/>
          : (
            <table>
              <thead>
                <tr><th>Patient</th><th>D.O.B</th><th>Phone</th><th>Blood</th><th>Allergies</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.7rem' }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background: C.accent+'22', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Rajdhani', fontWeight:700, color: C.accent, fontSize:'0.9rem', flexShrink:0 }}>
                          {p.first_name[0]}{p.last_name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight:500 }}>{fmt.fullName(p)}</div>
                          <div style={{ color: C.textDim, fontSize:'0.78rem' }}>{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: C.textMid }}>{fmt.date(p.date_of_birth)}</td>
                    <td style={{ color: C.textMid }}>{p.phone || '—'}</td>
                    <td>{p.blood_group ? <span className="badge badge-scheduled">{p.blood_group}</span> : '—'}</td>
                    <td style={{ color: p.allergies ? C.warning : C.textDim }}>{p.allergies || '—'}</td>
                    <td>
                      <div style={{ display:'flex', gap:'0.4rem' }}>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => setModal(p)}><Icon name="edit" size={14}/></button>
                        <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => setConfirm(p.id)}><Icon name="trash" size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add New Patient' : 'Edit Patient'}>
        <PatientForm initial={modal !== 'add' ? modal : {}} onSave={refresh} onClose={() => setModal(null)}/>
      </Modal>
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        onConfirm={() => del(confirm)} message="Delete this patient? All related records will also be deleted."/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  APPOINTMENTS
// ══════════════════════════════════════════════════════════════════
const APPT_DEFAULTS = { patient_id:'', title:'', appointment_date:'', appointment_time:'', duration_mins:30, status:'scheduled', notes:'' };

function AppointmentForm({ initial={}, onSave, onClose }) {
  const patients = usePatients();
  const [form, setForm] = useState({ ...APPT_DEFAULTS, ...initial });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.patient_id || !form.title || !form.appointment_date || !form.appointment_time)
      return alert('Please fill all required fields.');
    setSaving(true);
    const { id, created_at, updated_at, patients: _p, ...data } = form;
    const op = id
      ? supabase.from('appointments').update(data).eq('id', id)
      : supabase.from('appointments').insert(data);
    const { error } = await op;
    setSaving(false);
    if (error) return alert(error.message);
    onSave(); onClose();
  };

  return (
    <div className="form-grid">
      <div className="form-grid form-grid-2">
        <FieldGroup label="Patient *" span={2}>
          <select value={form.patient_id} onChange={set('patient_id')}>
            <option value="">Select patient…</option>
            {patients.map(p => <option key={p.id} value={p.id}>{fmt.fullName(p)}</option>)}
          </select>
        </FieldGroup>
        <FieldGroup label="Title / Procedure *" span={2}><input value={form.title} onChange={set('title')} placeholder="e.g. Routine Checkup"/></FieldGroup>
        <FieldGroup label="Date *"><input type="date" value={form.appointment_date} onChange={set('appointment_date')}/></FieldGroup>
        <FieldGroup label="Time *"><input type="time" value={form.appointment_time} onChange={set('appointment_time')}/></FieldGroup>
        <FieldGroup label="Duration (min)">
          <select value={form.duration_mins} onChange={set('duration_mins')}>
            {[15,30,45,60,90,120].map(d => <option key={d} value={d}>{d} min</option>)}
          </select>
        </FieldGroup>
        <FieldGroup label="Status">
          <select value={form.status} onChange={set('status')}>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No-Show</option>
          </select>
        </FieldGroup>
      </div>
      <FieldGroup label="Notes"><textarea rows={2} value={form.notes} onChange={set('notes')} placeholder="Any notes…"/></FieldGroup>
      <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end' }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : form.id ? 'Update Appointment' : 'Book Appointment'}
        </button>
      </div>
    </div>
  );
}

function Appointments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const q = supabase.from('appointments').select(`*, patients(first_name,last_name)`).order('appointment_date', { ascending:false });
    const { data } = await q;
    setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); const u = subscribeToTable('appointments', fetch); return u; }, [fetch]);

  const filtered = filter === 'all' ? rows : rows.filter(r => r.status === filter);

  const del = async id => { await supabase.from('appointments').delete().eq('id', id); fetch(); };

  const today = new Date().toISOString().split('T')[0];
  const todayCount = rows.filter(r => r.appointment_date === today).length;

  return (
    <div className="fade-in">
      <PageHeader title="Appointments" sub={`${todayCount} scheduled today`}
        action={<button className="btn btn-primary" onClick={() => setModal('add')}><Icon name="plus" size={15}/>New Appointment</button>}/>

      <div className="card">
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.2rem', flexWrap:'wrap' }}>
          {['all','scheduled','completed','cancelled','no-show'].map(s => (
            <button key={s} className={`btn btn-sm ${filter===s?'btn-primary':'btn-ghost'}`} onClick={() => setFilter(s)}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <Spinner/> : filtered.length === 0
          ? <EmptyState icon="calendar" title="No appointments" sub="Book your first appointment"/>
          : (
            <table>
              <thead><tr><th>Patient</th><th>Title</th><th>Date</th><th>Time</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight:500 }}>{a.patients ? fmt.fullName(a.patients) : '—'}</td>
                    <td>{a.title}</td>
                    <td style={{ color: C.textMid, whiteSpace:'nowrap' }}>{fmt.date(a.appointment_date)}</td>
                    <td style={{ color: C.textMid }}>{a.appointment_time?.slice(0,5)}</td>
                    <td style={{ color: C.textDim }}>{a.duration_mins} min</td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:'0.4rem' }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(a)}><Icon name="edit" size={14}/></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setConfirm(a.id)}><Icon name="trash" size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'New Appointment' : 'Edit Appointment'}>
        <AppointmentForm initial={modal !== 'add' ? modal : {}} onSave={fetch} onClose={() => setModal(null)}/>
      </Modal>
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => del(confirm)} message="Cancel and delete this appointment?"/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  TREATMENTS
// ══════════════════════════════════════════════════════════════════
const TX_DEFAULTS = { patient_id:'', procedure_name:'', tooth_number:'', description:'', status:'planned', cost:0, visit_notes:'', performed_at: new Date().toISOString().split('T')[0] };

function TreatmentForm({ initial={}, onSave, onClose }) {
  const patients = usePatients();
  const [form, setForm] = useState({ ...TX_DEFAULTS, ...initial });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.patient_id || !form.procedure_name) return alert('Patient and procedure are required.');
    setSaving(true);
    const { id, created_at, patients: _p, ...data } = form;
    const op = id
      ? supabase.from('treatments').update(data).eq('id', id)
      : supabase.from('treatments').insert(data);
    const { error } = await op;
    setSaving(false);
    if (error) return alert(error.message);
    onSave(); onClose();
  };

  const procs = ['Consultation','Cleaning','Scaling','Filling (Composite)','Filling (Amalgam)','Root Canal','Crown','Bridge','Extraction','Implant','Teeth Whitening','Orthodontics','Dentures','X-Ray','Other'];

  return (
    <div className="form-grid">
      <div className="form-grid form-grid-2">
        <FieldGroup label="Patient *" span={2}>
          <select value={form.patient_id} onChange={set('patient_id')}>
            <option value="">Select patient…</option>
            {patients.map(p => <option key={p.id} value={p.id}>{fmt.fullName(p)}</option>)}
          </select>
        </FieldGroup>
        <FieldGroup label="Procedure *">
          <select value={form.procedure_name} onChange={set('procedure_name')}>
            <option value="">Select…</option>
            {procs.map(pr => <option key={pr}>{pr}</option>)}
          </select>
        </FieldGroup>
        <FieldGroup label="Tooth #"><input value={form.tooth_number} onChange={set('tooth_number')} placeholder="e.g. 16, 21, UR6"/></FieldGroup>
        <FieldGroup label="Status">
          <select value={form.status} onChange={set('status')}>
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </FieldGroup>
        <FieldGroup label="Cost (SAR)"><input type="number" value={form.cost} onChange={set('cost')} min={0} step="0.01"/></FieldGroup>
        <FieldGroup label="Date Performed"><input type="date" value={form.performed_at} onChange={set('performed_at')}/></FieldGroup>
      </div>
      <FieldGroup label="Description"><textarea rows={2} value={form.description} onChange={set('description')} placeholder="Procedure details…"/></FieldGroup>
      <FieldGroup label="Visit Notes"><textarea rows={2} value={form.visit_notes} onChange={set('visit_notes')} placeholder="Clinical notes, observations…"/></FieldGroup>
      <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end' }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : form.id ? 'Update' : 'Add Treatment'}</button>
      </div>
    </div>
  );
}

function Treatments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('treatments').select(`*, patients(first_name,last_name)`).order('performed_at', { ascending:false });
    setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); const u = subscribeToTable('treatments', fetch); return u; }, [fetch]);

  const filtered = rows.filter(r =>
    `${r.patients?.first_name} ${r.patients?.last_name} ${r.procedure_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const del = async id => { await supabase.from('treatments').delete().eq('id', id); fetch(); };
  const totalRev = rows.filter(r => r.status === 'completed').reduce((s, r) => s + Number(r.cost||0), 0);

  return (
    <div className="fade-in">
      <PageHeader title="Treatments" sub={`${rows.length} records • Completed revenue: ${fmt.currency(totalRev)}`}
        action={<button className="btn btn-primary" onClick={() => setModal('add')}><Icon name="plus" size={15}/>Add Treatment</button>}/>

      <div className="card">
        <div style={{ position:'relative', width:280, marginBottom:'1.2rem' }}>
          <span style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color: C.textDim }}><Icon name="search" size={15}/></span>
          <input className="search-input" style={{ width:'100%' }} placeholder="Search patient or procedure…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>

        {loading ? <Spinner/> : filtered.length === 0
          ? <EmptyState icon="treatment" title="No treatments" sub="Record your first treatment plan"/>
          : (
            <table>
              <thead><tr><th>Patient</th><th>Procedure</th><th>Tooth</th><th>Date</th><th>Status</th><th>Cost</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight:500 }}>{r.patients ? fmt.fullName(r.patients) : '—'}</td>
                    <td>{r.procedure_name}</td>
                    <td style={{ color: C.textMid }}>{r.tooth_number || '—'}</td>
                    <td style={{ color: C.textMid, whiteSpace:'nowrap' }}>{fmt.date(r.performed_at)}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    <td style={{ color: C.accentHi, fontFamily:'Rajdhani', fontWeight:600 }}>{fmt.currency(r.cost)}</td>
                    <td>
                      <div style={{ display:'flex', gap:'0.4rem' }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(r)}><Icon name="edit" size={14}/></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setConfirm(r.id)}><Icon name="trash" size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'New Treatment' : 'Edit Treatment'}>
        <TreatmentForm initial={modal !== 'add' ? modal : {}} onSave={fetch} onClose={() => setModal(null)}/>
      </Modal>
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => del(confirm)} message="Delete this treatment record?"/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  PRESCRIPTIONS
// ══════════════════════════════════════════════════════════════════
function PrescriptionView({ rx }) {
  const print = () => window.print();
  return (
    <div id="rx-print">
      <div style={{ borderBottom:`2px solid ${C.border}`, paddingBottom:'1rem', marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h2 style={{ color: C.accent, fontSize:'1.4rem' }}>CITY SMILES DENTAL CLINIC</h2>
            <p style={{ color: C.textMid, fontSize:'0.82rem', marginTop:'0.2rem' }}>Professional Dental Care</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ color: C.textMid, fontSize:'0.78rem' }}>PRESCRIPTION</div>
            <div style={{ fontFamily:'Rajdhani', fontSize:'1.1rem', fontWeight:700 }}>{fmt.date(rx.prescribed_date)}</div>
          </div>
        </div>
      </div>
      <div style={{ marginBottom:'1.5rem' }}>
        <div style={{ color: C.textMid, fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.3rem' }}>Patient</div>
        <div style={{ fontFamily:'Rajdhani', fontSize:'1.1rem', fontWeight:700 }}>{rx.patients ? fmt.fullName(rx.patients) : '—'}</div>
      </div>
      {rx.items?.length > 0 && (
        <div style={{ marginBottom:'1.5rem' }}>
          <table>
            <thead><tr><th>#</th><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>
            <tbody>
              {rx.items.map((item, i) => (
                <tr key={item.id}>
                  <td style={{ color: C.textDim }}>{i+1}</td>
                  <td style={{ fontWeight:500 }}>{item.medicine_name}</td>
                  <td>{item.dosage}</td>
                  <td>{item.frequency}</td>
                  <td>{item.duration}</td>
                  <td style={{ color: C.textMid }}>{item.instructions||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rx.notes && <div style={{ background: C.surfaceHi, borderRadius:8, padding:'0.8rem 1rem', color: C.textMid, fontSize:'0.88rem' }}><strong>Notes:</strong> {rx.notes}</div>}
      <div style={{ borderTop:`1px solid ${C.border}`, marginTop:'2rem', paddingTop:'1rem', display:'flex', justifyContent:'flex-end' }}>
        <button className="btn btn-primary no-print" onClick={print}><Icon name="print" size={15}/>Print</button>
      </div>
    </div>
  );
}

function PrescriptionForm({ onSave, onClose }) {
  const patients = usePatients();
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ medicine_name:'', dosage:'', frequency:'', duration:'', instructions:'' }]);
  const [saving, setSaving] = useState(false);

  const setItem = (i, k) => e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [k]: e.target.value } : it));
  const addItem = () => setItems(prev => [...prev, { medicine_name:'', dosage:'', frequency:'', duration:'', instructions:'' }]);
  const removeItem = i => setItems(prev => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!patientId) return alert('Select a patient.');
    if (items.some(it => !it.medicine_name || !it.dosage)) return alert('Fill medicine name and dosage for all items.');
    setSaving(true);
    const { data: rx, error } = await supabase.from('prescriptions').insert({ patient_id: patientId, prescribed_date: date, notes }).select().single();
    if (error) { setSaving(false); return alert(error.message); }
    await supabase.from('prescription_items').insert(items.map(it => ({ ...it, prescription_id: rx.id })));
    setSaving(false);
    onSave(); onClose();
  };

  return (
    <div className="form-grid">
      <div className="form-grid form-grid-2">
        <FieldGroup label="Patient *">
          <select value={patientId} onChange={e => setPatientId(e.target.value)}>
            <option value="">Select patient…</option>
            {patients.map(p => <option key={p.id} value={p.id}>{fmt.fullName(p)}</option>)}
          </select>
        </FieldGroup>
        <FieldGroup label="Date"><input type="date" value={date} onChange={e => setDate(e.target.value)}/></FieldGroup>
      </div>
      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:'1rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.8rem' }}>
          <label style={{ margin:0 }}>Medications</label>
          <button className="btn btn-ghost btn-sm" onClick={addItem}><Icon name="plus" size={13}/>Add Medicine</button>
        </div>
        {items.map((it, i) => (
          <div key={i} style={{ background: C.surfaceHi, borderRadius:8, padding:'0.8rem', marginBottom:'0.6rem', position:'relative' }}>
            {items.length > 1 && (
              <button className="btn btn-danger btn-icon btn-sm" style={{ position:'absolute', top:'0.5rem', right:'0.5rem' }} onClick={() => removeItem(i)}><Icon name="close" size={12}/></button>
            )}
            <div className="form-grid form-grid-2">
              <FieldGroup label="Medicine *"><input value={it.medicine_name} onChange={setItem(i,'medicine_name')} placeholder="e.g. Amoxicillin 500mg"/></FieldGroup>
              <FieldGroup label="Dosage *"><input value={it.dosage} onChange={setItem(i,'dosage')} placeholder="e.g. 1 capsule"/></FieldGroup>
              <FieldGroup label="Frequency"><input value={it.frequency} onChange={setItem(i,'frequency')} placeholder="e.g. 3x daily"/></FieldGroup>
              <FieldGroup label="Duration"><input value={it.duration} onChange={setItem(i,'duration')} placeholder="e.g. 5 days"/></FieldGroup>
              <FieldGroup label="Instructions" span={2}><input value={it.instructions} onChange={setItem(i,'instructions')} placeholder="e.g. Take after food"/></FieldGroup>
            </div>
          </div>
        ))}
      </div>
      <FieldGroup label="General Notes"><textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional instructions…"/></FieldGroup>
      <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end' }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Prescription'}</button>
      </div>
    </div>
  );
}

function Prescriptions() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | rx obj (view)
  const [confirm, setConfirm] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rxs } = await supabase.from('prescriptions').select(`*, patients(first_name,last_name)`).order('prescribed_date', { ascending:false });
    if (!rxs) { setLoading(false); return; }
    const ids = rxs.map(r => r.id);
    const { data: items } = await supabase.from('prescription_items').select('*').in('prescription_id', ids.length ? ids : ['none']);
    const merged = rxs.map(r => ({ ...r, items: (items||[]).filter(it => it.prescription_id === r.id) }));
    setRows(merged);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); const u = subscribeToTable('prescriptions', fetch); return u; }, [fetch]);

  const del = async id => { await supabase.from('prescriptions').delete().eq('id', id); fetch(); };

  return (
    <div className="fade-in">
      <PageHeader title="Prescriptions" sub={`${rows.length} total prescriptions`}
        action={<button className="btn btn-primary" onClick={() => setModal('add')}><Icon name="plus" size={15}/>New Prescription</button>}/>

      <div className="card">
        {loading ? <Spinner/> : rows.length === 0
          ? <EmptyState icon="prescription" title="No prescriptions" sub="Create your first prescription"/>
          : (
            <table>
              <thead><tr><th>Patient</th><th>Date</th><th>Medicines</th><th>Notes</th><th>Actions</th></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight:500 }}>{r.patients ? fmt.fullName(r.patients) : '—'}</td>
                    <td style={{ color: C.textMid }}>{fmt.date(r.prescribed_date)}</td>
                    <td style={{ color: C.textMid }}>{r.items?.length || 0} item{r.items?.length !== 1 ? 's' : ''}</td>
                    <td style={{ color: C.textDim, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.notes||'—'}</td>
                    <td>
                      <div style={{ display:'flex', gap:'0.4rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal(r)}><Icon name="print" size={13}/>View</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setConfirm(r.id)}><Icon name="trash" size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>

      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="New Prescription">
        <PrescriptionForm onSave={fetch} onClose={() => setModal(null)}/>
      </Modal>

      <Modal open={modal && modal !== 'add'} onClose={() => setModal(null)} title="Prescription" size="modal-lg">
        {modal && modal !== 'add' && <PrescriptionView rx={modal}/>}
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => del(confirm)} message="Delete this prescription?"/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  INVENTORY
// ══════════════════════════════════════════════════════════════════
const INV_DEFAULTS = { item_name:'', category:'', quantity:0, unit:'pcs', low_stock_threshold:10, cost_per_unit:0, supplier:'', notes:'' };

function InventoryForm({ initial={}, onSave, onClose }) {
  const [form, setForm] = useState({ ...INV_DEFAULTS, ...initial });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.item_name) return alert('Item name is required.');
    setSaving(true);
    const { id, created_at, updated_at, ...data } = form;
    const op = id
      ? supabase.from('inventory').update(data).eq('id', id)
      : supabase.from('inventory').insert(data);
    const { error } = await op;
    setSaving(false);
    if (error) return alert(error.message);
    onSave(); onClose();
  };

  const cats = ['Consumables','Materials','Medication','Imaging','Instruments','Equipment','Other'];

  return (
    <div className="form-grid">
      <div className="form-grid form-grid-2">
        <FieldGroup label="Item Name *" span={2}><input value={form.item_name} onChange={set('item_name')} placeholder="e.g. Dental Gloves (M)"/></FieldGroup>
        <FieldGroup label="Category">
          <select value={form.category} onChange={set('category')}>
            <option value="">Select…</option>
            {cats.map(c => <option key={c}>{c}</option>)}
          </select>
        </FieldGroup>
        <FieldGroup label="Unit">
          <select value={form.unit} onChange={set('unit')}>
            {['pcs','box','roll','syringe','bottle','sheet','set','pack'].map(u => <option key={u}>{u}</option>)}
          </select>
        </FieldGroup>
        <FieldGroup label="Quantity"><input type="number" value={form.quantity} onChange={set('quantity')} min={0}/></FieldGroup>
        <FieldGroup label="Low Stock Alert (qty)"><input type="number" value={form.low_stock_threshold} onChange={set('low_stock_threshold')} min={0}/></FieldGroup>
        <FieldGroup label="Cost per Unit (SAR)"><input type="number" value={form.cost_per_unit} onChange={set('cost_per_unit')} min={0} step="0.01"/></FieldGroup>
        <FieldGroup label="Supplier"><input value={form.supplier} onChange={set('supplier')} placeholder="Supplier name"/></FieldGroup>
      </div>
      <FieldGroup label="Notes"><textarea rows={2} value={form.notes} onChange={set('notes')} placeholder="Any additional notes…"/></FieldGroup>
      <div style={{ display:'flex', gap:'0.8rem', justifyContent:'flex-end' }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : form.id ? 'Update Item' : 'Add Item'}</button>
      </div>
    </div>
  );
}

function Inventory() {
  const { rows, loading, refresh } = useTable('inventory', 'item_name', true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [filterLow, setFilterLow] = useState(false);

  let filtered = rows.filter(r => r.item_name.toLowerCase().includes(search.toLowerCase()));
  if (filterLow) filtered = filtered.filter(r => r.quantity <= r.low_stock_threshold);

  const del = async id => { await supabase.from('inventory').delete().eq('id', id); refresh(); };
  const lowCount = rows.filter(r => r.quantity <= r.low_stock_threshold).length;
  const totalValue = rows.reduce((s, r) => s + Number(r.quantity) * Number(r.cost_per_unit||0), 0);

  return (
    <div className="fade-in">
      <PageHeader title="Inventory" sub={`${rows.length} items • Total value: ${fmt.currency(totalValue)}`}
        action={<button className="btn btn-primary" onClick={() => setModal('add')}><Icon name="plus" size={15}/>Add Item</button>}/>

      {lowCount > 0 && (
        <div style={{ background: C.danger+'15', border:`1px solid ${C.danger}33`, borderRadius:10, padding:'0.8rem 1.2rem', marginBottom:'1.2rem', display:'flex', gap:'0.8rem', alignItems:'center' }}>
          <Icon name="alert" size={18} color={C.danger}/>
          <span style={{ color: C.danger, fontFamily:'Rajdhani', fontWeight:600 }}>{lowCount} item{lowCount>1?'s':''} below minimum stock level</span>
          <button className="btn btn-danger btn-sm" style={{ marginLeft:'auto' }} onClick={() => setFilterLow(f => !f)}>
            {filterLow ? 'Show All' : 'View Low Stock'}
          </button>
        </div>
      )}

      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.2rem', flexWrap:'wrap', gap:'0.8rem' }}>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color: C.textDim }}><Icon name="search" size={15}/></span>
            <input className="search-input" placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>

        {loading ? <Spinner/> : filtered.length === 0
          ? <EmptyState icon="inventory" title="No items found" sub={filterLow ? 'No low stock items' : 'Add your first item'}/>
          : (
            <table>
              <thead><tr><th>Item</th><th>Category</th><th>Quantity</th><th>Unit</th><th>Stock</th><th>Cost/Unit</th><th>Supplier</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(r => {
                  const isLow = r.quantity <= r.low_stock_threshold;
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight:500 }}>{r.item_name}</td>
                      <td style={{ color: C.textMid }}>{r.category||'—'}</td>
                      <td style={{ fontFamily:'Rajdhani', fontWeight:700, fontSize:'1rem', color: isLow ? C.danger : C.success }}>{r.quantity}</td>
                      <td style={{ color: C.textDim }}>{r.unit}</td>
                      <td><span className={`badge ${isLow ? 'badge-low-stock' : 'badge-ok'}`}>{isLow ? `Low (min ${r.low_stock_threshold})` : 'OK'}</span></td>
                      <td style={{ color: C.textMid }}>{r.cost_per_unit ? fmt.currency(r.cost_per_unit) : '—'}</td>
                      <td style={{ color: C.textDim }}>{r.supplier||'—'}</td>
                      <td>
                        <div style={{ display:'flex', gap:'0.4rem' }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(r)}><Icon name="edit" size={14}/></button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => setConfirm(r.id)}><Icon name="trash" size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        }
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Inventory Item' : 'Edit Item'}>
        <InventoryForm initial={modal !== 'add' ? modal : {}} onSave={refresh} onClose={() => setModal(null)}/>
      </Modal>
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => del(confirm)} message="Delete this inventory item?"/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  LAYOUT — SIDEBAR + HEADER
// ══════════════════════════════════════════════════════════════════
const NAV = [
  { id:'dashboard', label:'Dashboard', icon:'dashboard' },
  { id:'patients',  label:'Patients',  icon:'patients' },
  { id:'appointments', label:'Appointments', icon:'calendar' },
  { id:'treatments', label:'Treatments', icon:'treatment' },
  { id:'prescriptions', label:'Prescriptions', icon:'prescription' },
  { id:'inventory', label:'Inventory', icon:'inventory' },
];

function App() {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pages = {
    dashboard:    <Dashboard/>,
    patients:     <Patients/>,
    appointments: <Appointments/>,
    treatments:   <Treatments/>,
    prescriptions:<Prescriptions/>,
    inventory:    <Inventory/>,
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{
        background: C.surface,
        borderRight:`1px solid ${C.border}`,
        bottom:0,
        display:'flex',
        flexDirection:'column',
        left:0,
        padding:'0',
        position:'fixed',
        top:0,
        transition:'transform 0.25s ease',
        width:230,
        zIndex:100,
      }}>
        {/* Logo */}
        <div style={{ padding:'1.5rem 1.2rem 1rem', borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.2rem' }}>
            <div style={{ width:32, height:32, background:`linear-gradient(135deg,${C.accent},${C.accentDim})`, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon name="tooth" size={18} color="#fff"/>
            </div>
            <div>
              <div style={{ fontFamily:'Rajdhani', fontWeight:700, fontSize:'0.9rem', lineHeight:1.1, color: C.text }}>CITY SMILES</div>
              <div style={{ fontFamily:'Rajdhani', fontWeight:400, fontSize:'0.7rem', color: C.textMid, letterSpacing:'0.1em' }}>DENTAL CLINIC</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, overflowY:'auto', padding:'1rem 0.8rem' }}>
          <div style={{ color: C.textDim, fontSize:'0.65rem', fontFamily:'Rajdhani', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', padding:'0 0.5rem', marginBottom:'0.5rem' }}>Navigation</div>
          {NAV.map(n => (
            <div key={n.id} className={`sidebar-link ${page === n.id ? 'active' : ''}`}
              onClick={() => { setPage(n.id); setSidebarOpen(false); }}>
              <span className="nav-icon"><Icon name={n.icon} size={17}/></span>
              {n.label}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding:'1rem 1.2rem', borderTop:`1px solid ${C.border}`, color: C.textDim, fontSize:'0.72rem' }}>
          <div style={{ fontFamily:'Rajdhani', fontWeight:600, color: C.accent, fontSize:'0.75rem' }}>LIVE SYNC ACTIVE</div>
          <div>Powered by Supabase Realtime</div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="main-content" style={{ marginLeft:230, minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        {/* Header */}
        <header style={{
          alignItems:'center',
          background: C.surface,
          borderBottom:`1px solid ${C.border}`,
          display:'flex',
          gap:'1rem',
          height:58,
          padding:'0 1.5rem',
          position:'sticky',
          top:0,
          zIndex:99,
        }}>
          <button className="btn btn-ghost btn-icon" style={{ display:'none' }} onClick={() => setSidebarOpen(o => !o)} id="menu-btn">
            <Icon name="menu" size={18}/>
          </button>
          <div style={{ flex:1 }}>
            <span style={{ fontFamily:'Rajdhani', fontWeight:700, fontSize:'1.1rem', color: C.accent, letterSpacing:'0.05em' }}>
              CITY SMILES DENTAL CLINIC
            </span>
            <span style={{ color: C.textDim, fontSize:'0.78rem', marginLeft:'1rem' }}>
              {NAV.find(n => n.id === page)?.label}
            </span>
          </div>
          <div style={{ color: C.textDim, fontSize:'0.78rem', fontFamily:'Rajdhani' }}>
            {new Date().toLocaleDateString('en-GB', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, padding:'1.8rem 2rem', maxWidth:1400, width:'100%' }}>
          {pages[page]}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ background:'rgba(0,0,0,0.5)', inset:0, position:'fixed', zIndex:99 }}/>
      )}
    </>
  );
}

export default App;
