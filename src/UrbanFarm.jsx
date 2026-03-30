import { useState, useEffect } from "react";
import { api, getToken, setToken, clearToken } from "./api.js";

// ─── ICONS (inline SVG) ───────────────────────────────────────────────────────
const Icon = ({ d, size = 20, strokeWidth = 1.8, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d={d}/>
  </svg>
);
const Leaf      = (p) => <Icon {...p} d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>;
const Users     = (p) => <Icon {...p} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>;
const Calendar  = (p) => <Icon {...p} d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>;
const QrCode    = (p) => <Icon {...p} d="M3 3h6v6H3V3zM15 3h6v6h-6V3zM3 15h6v6H3v-6zM15 18h.01M18 15h.01M21 18h.01M18 21h.01M21 21h.01M15 15h.01"/>;
const LogOut    = (p) => <Icon {...p} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>;
const Plus      = (p) => <Icon {...p} d="M12 5v14M5 12h14"/>;
const Upload    = (p) => <Icon {...p} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>;
const Shuffle   = (p) => <Icon {...p} d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22M18 18l4-4-4-4M2 6h1.9c1.3 0 2.5.6 3.3 1.7l1.1 1.6M22 6l-4-4 4 4zM22 6l-4 4 4-4z"/>;
const ChevR     = (p) => <Icon {...p} d="M9 18l6-6-6-6"/>;
const ArrowLeft = (p) => <Icon {...p} d="M19 12H5M12 19l-7-7 7-7"/>;
const Camera    = (p) => <Icon {...p} d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>;
const Check     = (p) => <Icon {...p} d="M20 6L9 17l-5-5"/>;
const Bell      = (p) => <Icon {...p} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>;
const Star      = (p) => <Icon {...p} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>;
const Alert     = (p) => <Icon {...p} d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>;
const Drop      = (p) => <Icon {...p} d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3.1-6.3C14.5 6.9 12 3.5 12 3.5S9.5 6.9 8.1 8.7C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>;
const Sun       = (p) => <Icon {...p} d="M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>;
const X         = (p) => <Icon {...p} d="M18 6L6 18M6 6l12 12"/>;

// ─── HELPER ───────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  if (!ts) return "mai";
  const days = Math.floor((Date.now() - new Date(ts).getTime()) / 86400000);
  if (days === 0) return "oggi";
  if (days === 1) return "1 giorno fa";
  return `${days} giorni fa`;
}

// ─── STILI CONDIVISI ──────────────────────────────────────────────────────────
const statusConfig = {
  ok:        { dot: "#22c55e", bg: "rgba(34,197,94,0.12)",  text: "#15803d", label: "In salute"   },
  attention: { dot: "#f59e0b", bg: "rgba(245,158,11,0.12)", text: "#92400e", label: "Attenzione"  },
  critical:  { dot: "#ef4444", bg: "rgba(239,68,68,0.12)",  text: "#991b1b", label: "Critico"     },
  completed: { dot: "#9ca3af", bg: "rgba(156,163,175,0.12)",text: "#6b7280", label: "Completato"  },
  current:   { dot: "#3b82f6", bg: "rgba(59,130,246,0.12)", text: "#1e40af", label: "In corso"    },
  upcoming:  { dot: "#8b5cf6", bg: "rgba(139,92,246,0.12)", text: "#5b21b6", label: "Programmato" },
};

const Chip = ({ status }) => {
  const s = statusConfig[status] || statusConfig.ok;
  return (
    <span style={{ background: s.bg, color: s.text }}
      className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
      <span style={{ background: s.dot, width: 6, height: 6, borderRadius: "50%", display: "inline-block" }}/>
      {s.label}
    </span>
  );
};

const GreenBtn = ({ children, onClick, disabled, className = "" }) => (
  <button onClick={onClick} disabled={disabled}
    className={`w-full py-3.5 rounded-2xl font-semibold text-white text-sm transition-all active:scale-95 ${className}`}
    style={{ background: disabled ? "#d1d5db" : "linear-gradient(135deg,#34d399,#059669)", boxShadow: disabled ? "none" : "0 4px 15px rgba(5,150,105,0.35)" }}>
    {children}
  </button>
);

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectRole = (role) => {
    setSelectedRole(role);
    setUsername(role === "admin" ? "admin" : "operatore");
    setPassword("");
    setError("");
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api("/auth/login", { method: "POST", body: { username, password } });
      setToken(data.token);
      onLogin(data.role, data.name);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(160deg,#f0fdf4 0%,#dcfce7 50%,#bbf7d0 100%)" }}>

      <div className="text-center mb-10">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg"
          style={{ background: "linear-gradient(135deg,#34d399,#059669)" }}>
          <Leaf size={44} className="text-white"/>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-green-900"
          style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.04em" }}>UrbanFarm</h1>
        <p className="text-green-600 mt-1 font-medium">Gestione orti aziendali</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {[
          { role: "admin",     emoji: "🧑‍💼", label: "Amministratore", desc: "Gestisci piante, team e turni" },
          { role: "operatore", emoji: "🌿",   label: "Operatore",       desc: "Turni, scansioni e feedback" },
        ].map(opt => (
          <button key={opt.role}
            onClick={() => selectRole(opt.role)}
            className="w-full p-5 rounded-3xl text-left flex items-center gap-4 transition-all duration-200"
            style={{
              background: selectedRole === opt.role ? "white" : "rgba(255,255,255,0.7)",
              border: selectedRole === opt.role ? "2px solid #34d399" : "2px solid transparent",
              boxShadow: selectedRole === opt.role ? "0 8px 30px rgba(5,150,105,0.2)" : "0 2px 10px rgba(0,0,0,0.05)",
              transform: selectedRole === opt.role ? "translateY(-2px)" : "none",
            }}>
            <div className="text-3xl">{opt.emoji}</div>
            <div className="flex-1">
              <div className="font-bold text-gray-900">{opt.label}</div>
              <div className="text-sm text-gray-500">{opt.desc}</div>
            </div>
            {selectedRole === opt.role && <Check size={16} className="text-green-500"/>}
          </button>
        ))}

        {selectedRole && (
          <div className="bg-white rounded-3xl p-5 shadow-sm space-y-3" style={{ border: "2px solid #f0fdf4" }}>
            <input value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-green-400"/>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-green-400"/>
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <GreenBtn onClick={handleLogin} disabled={loading || !username || !password}>
              {loading ? "Accesso in corso…" : "Accedi →"}
            </GreenBtn>
          </div>
        )}
      </div>

      <p className="text-xs text-green-700 mt-8 opacity-60">
        🌱 Powered by Anthropic Claude AI
      </p>
    </div>
  );
}

// ─── PLANT DETAIL MODAL ───────────────────────────────────────────────────────
function PlantDetailModal({ plant, onClose, fromAdmin = false }) {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [reported, setReported] = useState(false);

  const getAdvice = async () => {
    setLoading(true);
    try {
      const data = await api("/ai/advice", {
        method: "POST",
        body: { plant: { ...plant, lastWatered: timeAgo(plant.last_watered) } },
      });
      setAdvice(data.advice);
    } catch {
      setAdvice("❌ Errore di connessione. Verifica la rete e riprova.");
    }
    setLoading(false);
  };

  const s = statusConfig[plant.status] || statusConfig.ok;

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        <div className="p-6 rounded-t-3xl text-white relative"
          style={{ background: `linear-gradient(135deg, ${s.dot}, ${s.dot}cc)` }}>
          <button onClick={onClose} className="absolute top-5 right-5 bg-white/20 rounded-full p-1">
            <X size={18} className="text-white"/>
          </button>
          <div className="text-4xl mb-2">🌱</div>
          <h2 className="text-2xl font-black">{plant.name}</h2>
          <p className="text-white/80 font-medium">{plant.location}</p>
          <div className="flex gap-4 mt-3 text-sm text-white/90">
            <span>💧 {timeAgo(plant.last_watered)}</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full">{s.label}</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {plant.notes && (
            <div className="flex gap-3 p-4 rounded-2xl" style={{ background: statusConfig[plant.status].bg }}>
              <Alert size={16} style={{ color: s.dot, flexShrink: 0, marginTop: 2 }}/>
              <p className="text-sm" style={{ color: s.text }}>{plant.notes}</p>
            </div>
          )}

          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center">
            <QrCode size={44} className="mx-auto text-gray-300 mb-2"/>
            <p className="text-xs text-gray-400 font-mono">ID: PLT-{String(plant.id).padStart(4, "0")} · {plant.location}</p>
            <button className="mt-2 text-xs font-semibold" style={{ color: "#059669" }}>
              ↓ Scarica QR Code
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-2xl p-3 text-center">
              <Drop size={20} className="mx-auto text-blue-500 mb-1"/>
              <div className="text-xs text-gray-500">Irrigazione</div>
              <div className="text-sm font-bold text-gray-700">{timeAgo(plant.last_watered)}</div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-3 text-center">
              <Sun size={20} className="mx-auto text-orange-400 mb-1"/>
              <div className="text-xs text-gray-500">Stato</div>
              <div className="text-sm font-bold" style={{ color: s.text }}>{s.label}</div>
            </div>
          </div>

          {!fromAdmin && (
            <button onClick={() => setReported(!reported)}
              className="w-full py-3 rounded-2xl text-sm font-semibold border-2 transition-all"
              style={reported
                ? { background: "#f0fdf4", borderColor: "#86efac", color: "#15803d" }
                : { background: "#fef2f2", borderColor: "#fca5a5", color: "#dc2626" }}>
              {reported ? "✅ Segnalazione inviata — verrai sostituito" : "⚠️ Non posso fare questo turno"}
            </button>
          )}

          <div className="rounded-2xl overflow-hidden border border-green-100">
            <div className="flex items-center gap-3 p-4 bg-green-50">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#34d399,#059669)" }}>
                <Leaf size={14} className="text-white"/>
              </div>
              <div>
                <div className="font-bold text-green-900 text-sm">Consigli Claude AI</div>
                <div className="text-xs text-green-600">Agronomia personalizzata</div>
              </div>
            </div>
            <div className="p-4">
              {advice ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{advice}</p>
              ) : (
                <GreenBtn onClick={getAdvice} disabled={loading}>
                  {loading ? "⏳ Analisi in corso…" : "🌿 Genera consigli agronomici"}
                </GreenBtn>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN: PIANTE ────────────────────────────────────────────────────────────
function PlantRegistry({ plants, loading }) {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = plants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-16 text-gray-400">Caricamento piante…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-gray-900">Registro Piante</h2>
        <button className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#34d399,#059669)" }}>
          <Plus size={14}/> Aggiungi
        </button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Cerca pianta o posizione…"
        className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm mb-4 outline-none focus:border-green-400 bg-white"/>

      <div className="space-y-2.5">
        {filtered.map(p => {
          const s = statusConfig[p.status];
          return (
            <div key={p.id} onClick={() => setSelected(p)}
              className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm cursor-pointer active:scale-98 transition-all"
              style={{ border: "1.5px solid #f0fdf4" }}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.bg }}>
                <Leaf size={18} style={{ color: s.dot }}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-sm">{p.name}</div>
                <div className="text-xs text-gray-500">{p.location} · {timeAgo(p.last_watered)}</div>
              </div>
              <div className="flex items-center gap-2">
                <Chip status={p.status}/>
                <ChevR size={14} className="text-gray-300"/>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">Nessuna pianta trovata</div>
        )}
      </div>

      {selected && (
        <PlantDetailModal plant={selected} onClose={() => setSelected(null)} fromAdmin/>
      )}
    </div>
  );
}

// ─── ADMIN: TEAM BUILDER ──────────────────────────────────────────────────────
function TeamBuilder({ employees, loading }) {
  const [team, setTeam] = useState([]);
  const [csvDone, setCsvDone] = useState(false);
  const [saved, setSaved] = useState(false);

  const generate = () => {
    setSaved(false);
    const available = employees.filter(e => e.available);
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const selected = [];
    const usedDepts = new Set();
    for (const e of shuffled) {
      if (!usedDepts.has(e.dept)) { selected.push(e); usedDepts.add(e.dept); }
      if (selected.length === 4) break;
    }
    for (const e of shuffled) {
      if (selected.length >= 4) break;
      if (!selected.find(s => s.id === e.id)) selected.push(e);
    }
    setTeam(selected.slice(0, 4));
  };

  const deptColors = {
    IT: "#3b82f6", HR: "#f59e0b", Marketing: "#ec4899",
    Finance: "#8b5cf6", Operations: "#059669", Sales: "#f97316"
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Caricamento dipendenti…</div>;

  return (
    <div>
      <h2 className="text-xl font-black text-gray-900 mb-4">Team Builder</h2>

      <div className="flex gap-2 mb-5">
        <button onClick={() => setCsvDone(true)}
          className="flex-1 rounded-2xl p-3.5 flex items-center justify-center gap-2 text-sm font-semibold transition-all"
          style={{ border: `2px dashed ${csvDone ? "#34d399" : "#d1d5db"}`, color: csvDone ? "#059669" : "#6b7280", background: csvDone ? "#f0fdf4" : "white" }}>
          <Upload size={15}/> {csvDone ? "CSV importato ✓" : "Importa CSV"}
        </button>
        <button onClick={generate}
          className="flex-1 rounded-2xl p-3.5 flex items-center justify-center gap-2 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#34d399,#059669)", boxShadow: "0 4px 15px rgba(5,150,105,0.3)" }}>
          <Shuffle size={15}/> Genera team
        </button>
      </div>

      {team.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm p-5 mb-5" style={{ border: "1.5px solid #f0fdf4" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-gray-800">Team generato</p>
            <span className="text-xs text-gray-400">{team.length} persone · {new Set(team.map(m => m.dept)).size} reparti</span>
          </div>
          <div className="space-y-2.5">
            {team.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "#f8fafc" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                  style={{ background: deptColors[m.dept] || "#6b7280" }}>
                  {m.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">{m.name}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                  style={{ background: deptColors[m.dept] || "#6b7280" }}>
                  {m.dept}
                </span>
              </div>
            ))}
          </div>
          <button onClick={() => setSaved(true)}
            className="mt-4 w-full py-3 rounded-2xl text-sm font-semibold text-white"
            style={{ background: saved ? "#86efac" : "linear-gradient(135deg,#34d399,#059669)" }}>
            {saved ? "✅ Team salvato!" : "Salva e assegna turno →"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm p-5" style={{ border: "1.5px solid #f0fdf4" }}>
        <p className="font-bold text-gray-800 mb-3">Tutti i dipendenti</p>
        <div className="space-y-2">
          {employees.map(e => (
            <div key={e.id} className="flex items-center gap-3 py-1.5">
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: e.available ? "#22c55e" : "#d1d5db", display: "inline-block", flexShrink: 0 }}/>
              <span className="text-sm text-gray-700 flex-1">{e.name}</span>
              <span className="text-xs text-gray-400">{e.dept}</span>
              {!e.available && <span className="text-xs text-red-400">Non disp.</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN: TURNI ─────────────────────────────────────────────────────────────
function ScheduleView({ schedules, loading, compact = false }) {
  if (loading) return <div className="text-center py-10 text-gray-400">Caricamento turni…</div>;

  return (
    <div>
      {!compact && <h2 className="text-xl font-black text-gray-900 mb-4">Turni di Manutenzione</h2>}
      <div className="space-y-3">
        {schedules.map(s => (
          <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm"
            style={{ border: `1.5px solid ${s.status === "current" ? "#86efac" : "#f0fdf4"}` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-900 text-sm">{s.week}</span>
              <Chip status={s.status}/>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
              <Leaf size={12}/>
              {Array.isArray(s.plants) ? s.plants.join(", ") : "—"}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(Array.isArray(s.team) ? s.team : []).map(m => (
                <span key={m} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{m}</span>
              ))}
            </div>
          </div>
        ))}
        {schedules.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">Nessun turno pianificato</div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState("plants");
  const [plants, setPlants] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const [loadingEmp, setLoadingEmp] = useState(true);
  const [loadingSch, setLoadingSch] = useState(true);

  useEffect(() => {
    api("/plants").then(setPlants).finally(() => setLoadingPlants(false));
    api("/employees").then(setEmployees).finally(() => setLoadingEmp(false));
    api("/schedules").then(setSchedules).finally(() => setLoadingSch(false));
  }, []);

  const tabs = [
    { id: "plants",   label: "Piante",  Icon: Leaf },
    { id: "team",     label: "Team",    Icon: Users },
    { id: "schedule", label: "Turni",   Icon: Calendar },
  ];
  const critical = plants.filter(p => p.status !== "ok").length;

  return (
    <div className="min-h-screen" style={{ background: "#f8fafb" }}>
      <div style={{ background: "linear-gradient(135deg,#059669,#047857)", paddingTop: 48, paddingBottom: 24, paddingLeft: 16, paddingRight: 16 }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-black text-white">UrbanFarm Admin</h1>
            <p className="text-green-300 text-xs">Dashboard amministratore</p>
          </div>
          <button onClick={onLogout} className="bg-white/20 p-2 rounded-xl">
            <LogOut size={18} className="text-white"/>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Piante",     value: plants.length, emoji: "🌱" },
            { label: "Team attivi",value: 4,             emoji: "👥" },
            { label: "Allerte",    value: critical,       emoji: critical > 0 ? "⚠️" : "✅" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
              <div className="text-lg">{s.emoji}</div>
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-green-300 text-xs font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-sm flex">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 flex flex-col items-center py-3 gap-0.5 border-b-2 transition-all text-xs font-semibold"
            style={{ borderColor: tab === t.id ? "#059669" : "transparent", color: tab === t.id ? "#059669" : "#9ca3af" }}>
            <t.Icon size={17}/>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 pb-8">
        {tab === "plants"   && <PlantRegistry plants={plants} loading={loadingPlants}/>}
        {tab === "team"     && <TeamBuilder employees={employees} loading={loadingEmp}/>}
        {tab === "schedule" && <ScheduleView schedules={schedules} loading={loadingSch}/>}
      </div>
    </div>
  );
}

// ─── OPERATORE: QR SCANNER ───────────────────────────────────────────────────
function QRScanner({ plants, onScan }) {
  const [phase, setPhase] = useState("idle");
  const [result, setResult] = useState(null);

  const simulate = () => {
    setPhase("scanning");
    setTimeout(() => {
      const plant = plants[Math.floor(Math.random() * plants.length)];
      setResult(plant);
      setPhase("done");
    }, 2200);
  };

  return (
    <div className="flex flex-col items-center p-6 py-10">
      <h2 className="text-xl font-black text-gray-900 mb-2">Scansiona QR</h2>
      <p className="text-sm text-gray-500 mb-8">Punta la fotocamera sul QR code della pianta</p>

      <div className="relative w-60 h-60 mb-8">
        {[["top-0 left-0","border-t-4 border-l-4"],["top-0 right-0","border-t-4 border-r-4"],
          ["bottom-0 left-0","border-b-4 border-l-4"],["bottom-0 right-0","border-b-4 border-r-4"]
        ].map(([pos, cls]) => (
          <div key={pos} className={`absolute ${pos} w-8 h-8 rounded-sm ${cls}`}
            style={{ borderColor: phase === "scanning" ? "#34d399" : phase === "done" ? "#22c55e" : "#d1d5db" }}/>
        ))}
        <div className="absolute inset-2 rounded-2xl flex items-center justify-center"
          style={{ background: phase === "scanning" ? "rgba(52,211,153,0.08)" : "rgba(0,0,0,0.03)" }}>
          {phase === "idle" && <QrCode size={52} className="text-gray-300"/>}
          {phase === "scanning" && (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-green-400 border-t-transparent mx-auto animate-spin mb-3"/>
              <p className="text-green-600 text-sm font-semibold">Scansionando…</p>
            </div>
          )}
          {phase === "done" && result && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <Check size={28} className="text-green-500"/>
              </div>
              <p className="text-green-700 font-bold text-sm">{result.name}</p>
              <p className="text-green-500 text-xs">{result.location}</p>
            </div>
          )}
        </div>
      </div>

      {phase !== "done" && (
        <GreenBtn onClick={simulate} disabled={phase === "scanning" || plants.length === 0} className="max-w-xs">
          {phase === "scanning" ? "Scansionando…" : "📷 Simula Scansione"}
        </GreenBtn>
      )}
      {phase === "done" && result && (
        <div className="flex gap-3 w-full max-w-xs">
          <button onClick={() => { setPhase("idle"); setResult(null); }}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm">
            Scansiona altro
          </button>
          <button onClick={() => onScan(result)}
            className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm"
            style={{ background: "linear-gradient(135deg,#34d399,#059669)" }}>
            Apri dettagli →
          </button>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-4">Demo: seleziona pianta casuale</p>
    </div>
  );
}

// ─── OPERATORE: FEEDBACK ──────────────────────────────────────────────────────
function FeedbackScreen() {
  const [step, setStep] = useState(0);
  const [nps, setNps] = useState(null);
  const [cats, setCats] = useState([]);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [photoAdded, setPhotoAdded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const CATS = ["Irrigazione", "Raccolta", "Pulizia", "Composting", "Potatura", "Semina", "Trattamenti", "Monitoraggio"];
  const toggleCat = c => setCats(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  const npsColor = (i) => i <= 6 ? "#ef4444" : i <= 8 ? "#f59e0b" : "#22c55e";

  const submit = async () => {
    setSubmitting(true);
    try {
      await api("/feedback", { method: "POST", body: { nps, categories: cats, note } });
      setDone(true);
    } catch {
      // fallback: show done anyway
      setDone(true);
    }
    setSubmitting(false);
  };

  if (done) return (
    <div className="flex flex-col items-center justify-center h-full py-24 text-center px-6">
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
        <span className="text-4xl">🌱</span>
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">Grazie!</h2>
      <p className="text-gray-500 text-sm mb-8">Il tuo feedback aiuta a migliorare l'esperienza nell'orto aziendale.</p>
      <button onClick={() => { setDone(false); setStep(0); setNps(null); setCats([]); setNote(""); setPhotoAdded(false); }}
        className="text-green-600 font-semibold text-sm">
        Invia altro feedback →
      </button>
    </div>
  );

  return (
    <div className="p-5">
      <h2 className="text-xl font-black text-gray-900 mb-1">Feedback</h2>
      <p className="text-gray-500 text-sm mb-5">Condividi la tua esperienza nell'orto</p>

      <div className="flex gap-2 mb-7">
        {[0,1,2].map(i => (
          <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
            style={{ background: step >= i ? "#34d399" : "#e5e7eb" }}/>
        ))}
      </div>

      {step === 0 && (
        <div>
          <p className="font-bold text-gray-800 mb-5">Quanto ti piace lavorare all'orto?</p>
          <div className="grid grid-cols-6 gap-1.5 mb-2">
            {[...Array(11)].map((_, i) => (
              <button key={i} onClick={() => setNps(i)}
                className="aspect-square rounded-xl font-bold text-sm transition-all active:scale-90"
                style={{
                  background: nps === i ? npsColor(i) : nps !== null && i <= nps ? npsColor(i) + "22" : "#f8fafc",
                  color: nps === i ? "white" : npsColor(i),
                  border: `2px solid ${nps === i ? npsColor(i) : "#e5e7eb"}`,
                }}>
                {i}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mb-6">
            <span>😕 Per niente</span><span>🤩 Assolutamente!</span>
          </div>
          <GreenBtn onClick={() => nps !== null && setStep(1)} disabled={nps === null}>
            Avanti →
          </GreenBtn>
        </div>
      )}

      {step === 1 && (
        <div>
          <p className="font-bold text-gray-800 mb-4">Che attività hai svolto?</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {CATS.map(c => (
              <button key={c} onClick={() => toggleCat(c)}
                className="px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all"
                style={cats.includes(c)
                  ? { background: "#059669", borderColor: "#059669", color: "white" }
                  : { background: "white", borderColor: "#e5e7eb", color: "#374151" }}>
                {c}
              </button>
            ))}
          </div>
          <button onClick={() => setPhotoAdded(!photoAdded)}
            className="w-full mb-5 py-3.5 rounded-2xl border-2 border-dashed text-sm font-semibold flex items-center justify-center gap-2"
            style={{ borderColor: photoAdded ? "#34d399" : "#d1d5db", color: photoAdded ? "#059669" : "#6b7280", background: photoAdded ? "#f0fdf4" : "white" }}>
            <Camera size={16}/> {photoAdded ? "📸 Foto aggiunta!" : "Aggiungi foto (opzionale)"}
          </button>
          <GreenBtn onClick={() => setStep(2)}>Avanti →</GreenBtn>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="font-bold text-gray-800 mb-4">Vuoi aggiungere una nota?</p>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={4}
            placeholder="Hai osservato qualcosa? Suggerimenti per migliorare l'orto…"
            className="w-full border-2 border-gray-200 rounded-2xl p-4 text-sm resize-none outline-none focus:border-green-400 mb-4"/>
          <div className="bg-gray-50 rounded-2xl p-4 text-sm mb-5 space-y-1.5">
            <p className="font-bold text-gray-700 mb-2">📋 Riepilogo</p>
            <p>⭐ <span className="font-medium">Score:</span> {nps}/10
              <span className="ml-2 font-semibold" style={{ color: npsColor(nps) }}>
                {nps <= 6 ? "(Detractor)" : nps <= 8 ? "(Passive)" : "(Promoter)"}
              </span>
            </p>
            {cats.length > 0 && <p>🌿 <span className="font-medium">Attività:</span> {cats.join(", ")}</p>}
            {photoAdded && <p>📸 1 foto allegata</p>}
          </div>
          <GreenBtn onClick={submit} disabled={submitting}>
            {submitting ? "Invio in corso…" : "Invia Feedback ✓"}
          </GreenBtn>
        </div>
      )}
    </div>
  );
}

// ─── OPERATORE: HOME ──────────────────────────────────────────────────────────
function OperatorHome({ plants, schedules, onNav }) {
  const turno = schedules.find(s => s.status === "current");
  const healthy = plants.filter(p => p.status === "ok").length;
  const needsCare = plants.filter(p => p.status !== "ok").length;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xl font-black text-gray-900">Ciao! 👋</h2>
        <p className="text-sm text-gray-500">Il tuo orto aziendale ti aspetta</p>
      </div>

      {turno && (
        <div className="rounded-3xl p-5 text-white"
          style={{ background: "linear-gradient(135deg,#059669,#047857)", boxShadow: "0 8px 25px rgba(5,150,105,0.35)" }}>
          <div className="text-xs font-semibold opacity-70 mb-1 flex items-center gap-1">
            <Calendar size={11}/> TURNO ATTIVO
          </div>
          <h3 className="text-xl font-black mb-1">
            {Array.isArray(turno.plants) ? turno.plants.join(" & ") : "—"}
          </h3>
          <p className="text-green-200 text-sm mb-4">{turno.week}</p>
          <div className="flex gap-2">
            <button onClick={() => onNav("scan")}
              className="bg-white text-green-700 px-4 py-2 rounded-xl text-sm font-bold">
              📷 Scansiona QR
            </button>
            <button className="bg-green-800/50 text-white px-4 py-2 rounded-xl text-sm font-semibold">
              Non posso
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1.5px solid #f0fdf4" }}>
          <div className="text-3xl font-black text-green-600">{healthy}</div>
          <div className="text-xs text-gray-500 mt-0.5">Piante in salute</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1.5px solid #fef2f2" }}>
          <div className="text-3xl font-black text-red-500">{needsCare}</div>
          <div className="text-xs text-gray-500 mt-0.5">Richiedono cura</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-4" style={{ border: "1.5px solid #f0fdf4" }}>
        <h3 className="font-bold text-gray-800 mb-3 text-sm">Stato piante</h3>
        <div className="space-y-2.5">
          {plants.map(p => {
            const s = statusConfig[p.status];
            return (
              <div key={p.id} className="flex items-center gap-2.5">
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, display: "inline-block", flexShrink: 0 }}/>
                <span className="text-sm text-gray-700 flex-1 font-medium">{p.name}</span>
                <span className="text-xs text-gray-400">{p.location}</span>
              </div>
            );
          })}
          {plants.length === 0 && <div className="text-sm text-gray-400">Caricamento…</div>}
        </div>
      </div>
    </div>
  );
}

// ─── OPERATORE DASHBOARD ──────────────────────────────────────────────────────
function OperatorDashboard({ onLogout }) {
  const [tab, setTab] = useState("home");
  const [scanned, setScanned] = useState(null);
  const [plants, setPlants] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    api("/plants").then(setPlants).catch(() => {});
    api("/schedules").then(setSchedules).catch(() => {});
  }, []);

  const handleScan = (plant) => {
    setScanned(plant);
    setTab("detail");
  };

  const NAV = [
    { id: "home",     label: "Home",     Icon: Leaf },
    { id: "scan",     label: "Scansiona",Icon: QrCode },
    { id: "schedule", label: "Turni",    Icon: Calendar },
    { id: "feedback", label: "Feedback", Icon: Star },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#f8fafb" }}>
      <div style={{ background: "linear-gradient(135deg,#059669,#047857)", paddingTop: 44, paddingBottom: 12, paddingLeft: 16, paddingRight: 16 }}
        className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf size={18} className="text-green-300"/>
          <span className="font-black text-white">UrbanFarm</span>
        </div>
        <div className="flex gap-2">
          <button className="bg-white/20 p-2 rounded-xl relative">
            <Bell size={15} className="text-white"/>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full border border-green-700"/>
          </button>
          <button onClick={onLogout} className="bg-white/20 p-2 rounded-xl">
            <LogOut size={15} className="text-white"/>
          </button>
        </div>
      </div>

      <div className="overflow-y-auto" style={{ paddingBottom: 72 }}>
        {tab === "home"     && <OperatorHome plants={plants} schedules={schedules} onNav={setTab}/>}
        {tab === "scan"     && <QRScanner plants={plants} onScan={handleScan}/>}
        {tab === "detail"   && scanned && (
          <div className="pt-2">
            <button onClick={() => setTab("scan")} className="flex items-center gap-1.5 text-green-700 font-semibold text-sm px-4 py-3">
              <ArrowLeft size={16}/> Indietro
            </button>
            <PlantDetailModal plant={scanned} onClose={() => setTab("scan")} fromAdmin={false}/>
          </div>
        )}
        {tab === "schedule" && <div className="p-4"><ScheduleView schedules={schedules} loading={false}/></div>}
        {tab === "feedback" && <FeedbackScreen/>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white flex"
        style={{ borderTop: "1px solid #f0fdf4", boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)}
            className="flex-1 flex flex-col items-center py-3 gap-0.5 transition-all text-xs font-semibold"
            style={{ color: tab === n.id || (tab === "detail" && n.id === "scan") ? "#059669" : "#9ca3af" }}>
            <n.Icon size={19}/>
            {n.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function UrbanFarm() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp * 1000 > Date.now()) setRole(payload.role);
      else clearToken();
    } catch {
      clearToken();
    }
  }, []);

  const handleLogin = (role) => setRole(role);
  const handleLogout = () => { clearToken(); setRole(null); };

  if (!role)            return <LoginScreen onLogin={handleLogin}/>;
  if (role === "admin") return <AdminDashboard onLogout={handleLogout}/>;
  return                       <OperatorDashboard onLogout={handleLogout}/>;
}
