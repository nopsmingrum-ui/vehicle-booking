import { useState } from "react";

// ─── DATA ───────────────────────────────────────────────────────────────────
const VEHICLES = [
  { id: "V01", name: "Toyota Fortuner", plate: "กข-1234", type: "SUV", seats: 7, icon: "🚙", color: "#0ea5e9" },
  { id: "V02", name: "Toyota Commuter", plate: "กข-5678", type: "Van", seats: 12, icon: "🚐", color: "#8b5cf6" },
  { id: "V03", name: "Honda Accord", plate: "กข-9012", type: "Sedan", seats: 5, icon: "🚗", color: "#10b981" },
  { id: "V04", name: "Toyota Hiace", plate: "กข-3456", type: "Van", seats: 15, icon: "🚌", color: "#f59e0b" },
  { id: "V05", name: "Ford Ranger", plate: "กข-7890", type: "Pickup", seats: 5, icon: "🛻", color: "#ef4444" },
  { id: "V06", name: "Toyota Camry", plate: "กข-2345", type: "Sedan", seats: 5, icon: "🚗", color: "#6366f1" },
  { id: "V07", name: "Isuzu D-Max", plate: "กข-6789", type: "Pickup", seats: 5, icon: "🛻", color: "#14b8a6" },
  { id: "V08", name: "Toyota Alphard", plate: "กข-0123", type: "MPV", seats: 7, icon: "🚐", color: "#ec4899" },
  { id: "V09", name: "Mitsubishi Pajero", plate: "กข-4567", type: "SUV", seats: 7, icon: "🚙", color: "#f97316" },
  { id: "V10", name: "Toyota Vios", plate: "กข-8901", type: "Sedan", seats: 5, icon: "🚗", color: "#84cc16" },
];

const DRIVERS = [
  { id: "D01", name: "นายสมศักดิ์ ขับดี", available: true },
  { id: "D02", name: "นายวิชัย รถเร็ว", available: true },
  { id: "D03", name: "นายประสิทธิ์ ปลอดภัย", available: false },
  { id: "D04", name: "นายอานนท์ ตรงเวลา", available: true },
  { id: "D05", name: "ขับเอง", available: true },
];

const STEPS = ["จองรถ", "หัวหน้า", "ผู้จัดการ", "Admin รถ"];
const ROLE_LABELS = ["พนักงาน", "หัวหน้างาน", "ผู้จัดการ", "Admin รถ"];

const STATUS_CFG = {
  pending_supervisor: { label: "รอหัวหน้า", color: "#d97706", bg: "#fef3c7" },
  pending_manager:    { label: "รอผจก.", color: "#7c3aed", bg: "#ede9fe" },
  pending_admin:      { label: "รอ Admin รถ", color: "#0284c7", bg: "#e0f2fe" },
  approved:           { label: "อนุมัติแล้ว", color: "#059669", bg: "#d1fae5" },
  rejected:           { label: "ไม่อนุมัติ", color: "#dc2626", bg: "#fee2e2" },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const c = STATUS_CFG[status] || { label: status, color: "#6b7280", bg: "#f3f4f6" };
  return <span style={{ background: c.bg, color: c.color, padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{c.label}</span>;
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, maxWidth: "60%", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function ProgressBar({ currentStep }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {STEPS.map((step, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: i < currentStep ? "#1a4f6e" : i === currentStep ? "#0ea5e9" : "#e2e8f0",
              color: i <= currentStep ? "#fff" : "#94a3b8", fontWeight: 800, fontSize: 13,
              boxShadow: i === currentStep ? "0 0 0 5px rgba(14,165,233,0.18)" : "none", transition: "all 0.3s"
            }}>
              {i < currentStep ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 10, color: i === currentStep ? "#0ea5e9" : "#94a3b8", fontWeight: i === currentStep ? 700 : 400, whiteSpace: "nowrap" }}>
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 3, margin: "0 3px", marginBottom: 18, background: i < currentStep ? "#1a4f6e" : "#e2e8f0", borderRadius: 2, transition: "background 0.3s" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── BOOKING FORM ─────────────────────────────────────────────────────────────
function BookingForm({ onSubmit }) {
  const [form, setForm] = useState({
    vehicleId: "", driverId: "", startDate: "", startTime: "", endDate: "", endTime: "",
    destination: "", passengers: 1, purpose: ""
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.vehicleId) e.vehicleId = "กรุณาเลือกรถ";
    if (!form.driverId) e.driverId = "กรุณาเลือกพนักงานขับรถ";
    if (!form.startDate || !form.startTime) e.startDate = "กรุณาระบุวันเวลาออกเดินทาง";
    if (!form.endDate || !form.endTime) e.endDate = "กรุณาระบุวันเวลากลับ";
    if (!form.destination.trim()) e.destination = "กรุณาระบุจุดหมาย";
    if (!form.purpose.trim()) e.purpose = "กรุณาระบุวัตถุประสงค์";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const v = VEHICLES.find(x => x.id === form.vehicleId);
    const d = DRIVERS.find(x => x.id === form.driverId);
    onSubmit({ ...form, vehicle: v, driver: d });
  };

  const selV = VEHICLES.find(v => v.id === form.vehicleId);

  return (
    <div>
      {/* Employee Card */}
      <div style={{ background: "linear-gradient(135deg,#1a4f6e,#0ea5e9)", borderRadius: 14, padding: "18px 20px", marginBottom: 22, color: "#fff" }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>ผู้ขอใช้รถ</div>
        <div style={{ fontSize: 17, fontWeight: 800, marginTop: 3 }}>นายสมชาย ใจดี</div>
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>แผนก IT · EMP001</div>
      </div>

      {/* Vehicle Selection */}
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>เลือกรถ</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {VEHICLES.map(v => (
            <button key={v.id} onClick={() => set("vehicleId", v.id)}
              style={{
                padding: "10px 8px", borderRadius: 12, border: `2px solid ${form.vehicleId === v.id ? v.color : "#e2e8f0"}`,
                background: form.vehicleId === v.id ? v.color + "18" : "#fff",
                cursor: "pointer", textAlign: "left", transition: "all 0.18s"
              }}>
              <div style={{ fontSize: 20, marginBottom: 2 }}>{v.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: form.vehicleId === v.id ? v.color : "#1e293b", lineHeight: 1.3 }}>{v.name}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{v.plate} · {v.seats} ที่นั่ง</div>
            </button>
          ))}
        </div>
        {errors.vehicleId && <div style={err}>{errors.vehicleId}</div>}
      </div>

      {/* Driver */}
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>พนักงานขับรถ</label>
        <select value={form.driverId} onChange={e => set("driverId", e.target.value)} style={{ ...inp, borderColor: errors.driverId ? "#ef4444" : "#e2e8f0" }}>
          <option value="">— เลือกพนักงานขับรถ —</option>
          {DRIVERS.map(d => (
            <option key={d.id} value={d.id} disabled={!d.available}>
              {d.name}{!d.available ? " (ไม่ว่าง)" : ""}
            </option>
          ))}
        </select>
        {errors.driverId && <div style={err}>{errors.driverId}</div>}
      </div>

      {/* Dates */}
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>วันเวลาออกเดินทาง</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)}
            style={{ ...inp, borderColor: errors.startDate ? "#ef4444" : "#e2e8f0" }} />
          <input type="time" value={form.startTime} onChange={e => set("startTime", e.target.value)}
            style={{ ...inp, borderColor: errors.startDate ? "#ef4444" : "#e2e8f0" }} />
        </div>
        {errors.startDate && <div style={err}>{errors.startDate}</div>}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>วันเวลากลับ</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)}
            style={{ ...inp, borderColor: errors.endDate ? "#ef4444" : "#e2e8f0" }} />
          <input type="time" value={form.endTime} onChange={e => set("endTime", e.target.value)}
            style={{ ...inp, borderColor: errors.endDate ? "#ef4444" : "#e2e8f0" }} />
        </div>
        {errors.endDate && <div style={err}>{errors.endDate}</div>}
      </div>

      {/* Destination */}
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>จุดหมายปลายทาง</label>
        <input type="text" value={form.destination} onChange={e => set("destination", e.target.value)}
          placeholder="ระบุสถานที่ปลายทาง..." style={{ ...inp, borderColor: errors.destination ? "#ef4444" : "#e2e8f0" }} />
        {errors.destination && <div style={err}>{errors.destination}</div>}
      </div>

      {/* Passengers */}
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>จำนวนผู้โดยสาร</label>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => set("passengers", Math.max(1, form.passengers - 1))}
            style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #e2e8f0", background: "#fff", fontSize: 20, cursor: "pointer", fontWeight: 700 }}>−</button>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#0ea5e9", minWidth: 40, textAlign: "center" }}>{form.passengers}</span>
          <button onClick={() => set("passengers", Math.min(selV?.seats || 15, form.passengers + 1))}
            style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #0ea5e9", background: "#0ea5e9", color: "#fff", fontSize: 20, cursor: "pointer", fontWeight: 700 }}>+</button>
          {selV && <span style={{ fontSize: 13, color: "#94a3b8" }}>/ {selV.seats} ที่นั่ง</span>}
        </div>
      </div>

      {/* Purpose */}
      <div style={{ marginBottom: 28 }}>
        <label style={lbl}>วัตถุประสงค์การเดินทาง</label>
        <textarea rows={3} value={form.purpose} onChange={e => set("purpose", e.target.value)}
          placeholder="ระบุวัตถุประสงค์..." style={{ ...inp, resize: "none", borderColor: errors.purpose ? "#ef4444" : "#e2e8f0" }} />
        {errors.purpose && <div style={err}>{errors.purpose}</div>}
      </div>

      <button onClick={handleSubmit} style={btnP}>ส่งคำขอจองรถ →</button>
    </div>
  );
}

// ─── APPROVAL VIEW ────────────────────────────────────────────────────────────
function ApprovalView({ request, role, onDecision }) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (action) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    onDecision(action, comment);
    setLoading(false);
  };

  return (
    <div>
      <div style={{ background: "#f8fafc", borderRadius: 12, padding: 18, marginBottom: 18, border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>รายละเอียดคำขอ</div>
        <Row label="รถ" value={`${request.vehicle?.icon} ${request.vehicle?.name}`} />
        <Row label="ทะเบียน" value={request.vehicle?.plate} />
        <Row label="พนักงานขับ" value={request.driver?.name} />
        <Row label="ออกเดินทาง" value={`${request.startDate} ${request.startTime} น.`} />
        <Row label="กลับ" value={`${request.endDate} ${request.endTime} น.`} />
        <Row label="จุดหมาย" value={request.destination} />
        <Row label="ผู้โดยสาร" value={`${request.passengers} คน`} />
        <Row label="วัตถุประสงค์" value={request.purpose} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>ความเห็น / หมายเหตุ</label>
        <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
          placeholder={`ความเห็นของ${role}...`} style={{ ...inp, resize: "none" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <button onClick={() => handle("reject")} disabled={loading}
          style={{ padding: 14, borderRadius: 12, border: "2px solid #fca5a5", background: "#fff", color: "#dc2626", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>
          {loading ? "⏳" : "✕ ไม่อนุมัติ"}
        </button>
        <button onClick={() => handle("approve")} disabled={loading}
          style={{ ...btnP, background: "linear-gradient(135deg,#059669,#10b981)" }}>
          {loading ? "⏳" : "✓ อนุมัติ"}
        </button>
      </div>
    </div>
  );
}

// ─── ADMIN VIEW ───────────────────────────────────────────────────────────────
function AdminView({ request, onComplete }) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    onComplete();
    setLoading(false);
  };

  return (
    <div>
      <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: 16, marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>🚗</div>
        <div style={{ fontWeight: 700, color: "#166534", fontSize: 16 }}>ผ่านการอนุมัติทุกขั้นตอน</div>
        <div style={{ fontSize: 13, color: "#4ade80" }}>รอ Admin ยืนยันรถและคนขับ</div>
      </div>

      <div style={{ background: "#f8fafc", borderRadius: 12, padding: 18, marginBottom: 20, border: "1px solid #e2e8f0" }}>
        <Row label="รถ" value={`${request.vehicle?.icon} ${request.vehicle?.name} (${request.vehicle?.plate})`} />
        <Row label="พนักงานขับ" value={request.driver?.name} />
        <Row label="ออกเดินทาง" value={`${request.startDate} ${request.startTime} น.`} />
        <Row label="กลับ" value={`${request.endDate} ${request.endTime} น.`} />
        <Row label="จุดหมาย" value={request.destination} />
        <Row label="ผู้โดยสาร" value={`${request.passengers} คน`} />
      </div>

      <button onClick={handle} disabled={loading}
        style={{ ...btnP, background: "linear-gradient(135deg,#1a4f6e,#0ea5e9)" }}>
        {loading ? "⏳ กำลังยืนยัน..." : "🚗 ยืนยันการจองรถ"}
      </button>
    </div>
  );
}

// ─── DONE ─────────────────────────────────────────────────────────────────────
function Done({ request }) {
  return (
    <div style={{ textAlign: "center", padding: "16px 0" }}>
      <div style={{ fontSize: 60, marginBottom: 12 }}>🎉</div>
      <div style={{ fontSize: 21, fontWeight: 800, color: "#1a4f6e", marginBottom: 6 }}>จองรถสำเร็จ!</div>
      <div style={{ fontSize: 14, color: "#64748b", marginBottom: 22 }}>รถพร้อมให้บริการตามที่จอง</div>

      <div style={{ background: `${request.vehicle?.color}12`, border: `2px solid ${request.vehicle?.color}40`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 48 }}>{request.vehicle?.icon}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: request.vehicle?.color, marginTop: 6 }}>{request.vehicle?.name}</div>
        <div style={{ fontSize: 14, color: "#64748b" }}>{request.vehicle?.plate}</div>
      </div>

      <div style={{ background: "#f8fafc", borderRadius: 14, padding: 18, textAlign: "left", border: "1px solid #e2e8f0" }}>
        <Row label="พนักงานขับ" value={request.driver?.name} />
        <Row label="ออกเดินทาง" value={`${request.startDate} ${request.startTime} น.`} />
        <Row label="กลับ" value={`${request.endDate} ${request.endTime} น.`} />
        <Row label="จุดหมาย" value={request.destination} />
        <Row label="ผู้โดยสาร" value={`${request.passengers} คน`} />
        <Row label="สถานะ" value={<Badge status="approved" />} />
      </div>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const lbl = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 };
const inp = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff" };
const btnP = { width: "100%", padding: 15, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#1a4f6e,#0ea5e9)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" };
const err = { fontSize: 12, color: "#ef4444", marginTop: 4 };

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [request, setRequest] = useState(null);
  const [history, setHistory] = useState([]);

  const addHistory = (actor, action, comment = "") => {
    setHistory(h => [...h, { actor, action, comment, time: new Date().toLocaleTimeString("th-TH") }]);
  };

  const handleSubmit = (data) => {
    setRequest({ ...data, status: "pending_supervisor", id: "VB" + Date.now().toString().slice(-6) });
    addHistory("พนักงาน", "ยื่นคำขอจองรถ");
    setStep(1);
  };

  const handleDecision = (action, comment) => {
    if (action === "reject") {
      setRequest(r => ({ ...r, status: "rejected" }));
      addHistory(ROLE_LABELS[step], "ไม่อนุมัติ", comment);
      setStep(5);
    } else {
      const nextStatus = step === 1 ? "pending_manager" : step === 2 ? "pending_admin" : "approved";
      setRequest(r => ({ ...r, status: nextStatus }));
      addHistory(ROLE_LABELS[step], "อนุมัติ", comment);
      setStep(s => s + 1);
    }
  };

  const handleAdmin = () => {
    setRequest(r => ({ ...r, status: "approved" }));
    addHistory("Admin รถ", "ยืนยันการจอง");
    setStep(4);
  };

  const reset = () => { setStep(0); setRequest(null); setHistory([]); };

  return (
    <div style={{ fontFamily: "'Sarabun','Noto Sans Thai',sans-serif", minHeight: "100vh", background: "linear-gradient(160deg,#e0f2fe 0%,#f0f9ff 60%,#f8fafc 100%)", display: "flex", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 460 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg,#1a4f6e,#0ea5e9)", borderRadius: 16, padding: "10px 22px", color: "#fff", marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>🚗</span>
            <span style={{ fontSize: 17, fontWeight: 800 }}>ระบบจองรถออนไลน์</span>
          </div>
          <div>
            {request && <Badge status={request.status} />}
            {request && <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>#{request.id}</span>}
          </div>
        </div>

        {/* Progress */}
        {step < 4 && step !== 5 && <ProgressBar currentStep={Math.min(step, 3)} />}

        {/* Role indicator */}
        {step > 0 && step < 4 && (
          <div style={{ background: "#fff", borderRadius: 12, padding: "10px 14px", marginBottom: 18, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#1a4f6e,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>
              {ROLE_LABELS[step][0]}
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>ขั้นตอนปัจจุบัน</div>
              <div style={{ fontWeight: 700, color: "#1a4f6e", fontSize: 15 }}>{ROLE_LABELS[step]}</div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 4px 28px rgba(14,165,233,0.10)", border: "1px solid #e0f2fe" }}>
          {step === 0 && <BookingForm onSubmit={handleSubmit} />}
          {step === 1 && <ApprovalView request={request} role="หัวหน้างาน" onDecision={handleDecision} />}
          {step === 2 && <ApprovalView request={request} role="ผู้จัดการ" onDecision={handleDecision} />}
          {step === 3 && <AdminView request={request} onComplete={handleAdmin} />}
          {step === 4 && <Done request={request} />}
          {step === 5 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 52, marginBottom: 10 }}>❌</div>
              <div style={{ fontWeight: 800, color: "#dc2626", fontSize: 20, marginBottom: 6 }}>ไม่อนุมัติ</div>
              <div style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>คำขอจองรถถูกปฏิเสธ</div>
              <button onClick={reset} style={btnP}>จองรถใหม่</button>
            </div>
          )}
        </div>

        {/* Timeline */}
        {history.length > 0 && (
          <div style={{ marginTop: 18, background: "#fff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 12 }}>📋 ประวัติดำเนินการ</div>
            {history.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0ea5e9", marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{h.actor}</span>
                  <span style={{ fontSize: 13, color: "#64748b" }}> — {h.action}</span>
                  {h.comment && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>"{h.comment}"</div>}
                </div>
                <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>{h.time}</span>
              </div>
            ))}
          </div>
        )}

        {/* Back button */}
        {(step === 4 || step === 5) && (
          <button onClick={reset} style={{ ...btnP, marginTop: 12, background: "transparent", border: "2px solid #e2e8f0", color: "#64748b" }}>
            ← กลับหน้าแรก
          </button>
        )}
      </div>
    </div>
  );
}
