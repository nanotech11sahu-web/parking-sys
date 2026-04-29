import React, { useState, useEffect } from 'react';
import { parchiTypesAPI, membershipTypesAPI, membershipsAPI, ticketsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const SHIFTS = ['Morning', 'Night'];

const SHIFT_COLORS = {
  Morning: { bg: 'from-amber-400 to-orange-500', icon: '🌅', text: 'text-amber-700', light: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-800' },
  Night:   { bg: 'from-indigo-600 to-violet-700', icon: '🌙', text: 'text-indigo-700', light: 'bg-indigo-50 border-indigo-200', badge: 'bg-indigo-100 text-indigo-800' },
};

const today = () => new Date().toISOString().split('T')[0];

/* ───────────────── Shift Selector ───────────────── */
function ShiftSelector({ onSelect, defaultShift, selectedDate, onDateChange }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-400/30 mb-4">
            <span className="text-4xl">🎫</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Parchi System</h1>
          <p className="text-teal-300 text-xs font-medium tracking-widest uppercase">Select Date & Shift</p>
        </div>

        {/* Date picker */}
        <div className="mb-6">
          <label className="block text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">Work Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => onDateChange(e.target.value)}
            max={today()}
            className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
          />
        </div>

        {/* Shift buttons */}
        <div className="grid grid-cols-2 gap-4">
          {SHIFTS.map(shift => {
            const sc = SHIFT_COLORS[shift];
            return (
              <button
                key={shift}
                onClick={() => onSelect(shift)}
                className={`relative group p-6 rounded-2xl bg-gradient-to-br ${sc.bg} text-white font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex flex-col items-center gap-2 border border-white/20`}
              >
                <span className="text-4xl">{sc.icon}</span>
                <span>{shift}</span>
                {defaultShift === shift && (
                  <span className="absolute top-2 right-2 text-xs bg-white/30 rounded-full px-2 py-0.5">Default</span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-center text-teal-400/60 text-xs mt-6">
          Date: <span className="text-teal-300 font-semibold">{selectedDate}</span>
        </p>
      </div>
    </div>
  );
}

/* ───────────────── Membership Modal ───────────────── */
function MembershipModal({ shift, workDate, onClose, onSuccess }) {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({
    memberName: '', contactNumber: '', vehicleNumber: '',
    vehicleType: '2-wheeler', membershipTypeId: '',
    startDate: workDate,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    membershipTypesAPI.getAll().then(r => setTypes(r.data.data || []));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.memberName || !form.contactNumber || !form.vehicleNumber || !form.membershipTypeId) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await membershipsAPI.create({ ...form, shift, workDate });
      toast.success('Membership saved!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving membership');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-xl shrink-0">🎫</div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">New Membership</h2>
              <p className="text-xs text-slate-500">{SHIFT_COLORS[shift]?.icon} {shift} · {workDate}</p>
            </div>
            <button onClick={onClose} className="ml-auto w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 text-lg">×</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Membership Type *</label>
              <select className="input" value={form.membershipTypeId} onChange={e => set('membershipTypeId', e.target.value)}>
                <option value="">Select type...</option>
                {types.map(t => (
                  <option key={t._id} value={t._id}>{t.name} — ₹{t.amount} / {t.durationDays}d</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Member Name *</label>
              <input className="input" placeholder="Full name" value={form.memberName} onChange={e => set('memberName', e.target.value)} />
            </div>

            <div>
              <label className="label">Contact Number *</label>
              <input className="input" type="tel" placeholder="10-digit mobile" value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)} />
            </div>

            <div>
              <label className="label">Vehicle Number *</label>
              <input className="input" placeholder="MP09XX1234" value={form.vehicleNumber} onChange={e => set('vehicleNumber', e.target.value.toUpperCase())} />
            </div>

            <div>
              <label className="label">Vehicle Type *</label>
              <div className="flex gap-3">
                {['2-wheeler', '4-wheeler'].map(vt => (
                  <button
                    key={vt}
                    onClick={() => set('vehicleType', vt)}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${form.vehicleType === vt ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500'}`}
                  >
                    {vt === '2-wheeler' ? '🏍️ 2-Wheeler' : '🚗 4-Wheeler'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center py-3">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center py-3">
              {loading ? '⏳ Saving...' : '✅ Save Membership'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── Parchi Entry Row (mobile-first) ───────────────── */
function ParchiEntryRow({ parchiType, entry, onChange, onRemove }) {
  const from = Number(entry.fromSerial) || 0;
  const to = Number(entry.toSerial) || 0;
  const count = from && to && to >= from ? to - from + 1 : 0;
  const total = count * parchiType.amount;

  return (
    <div className="rounded-2xl border-2 border-slate-100 bg-white shadow-sm overflow-hidden fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100" style={{ borderLeftColor: parchiType.color, borderLeftWidth: 4 }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: parchiType.color }}>
          ₹{parchiType.amount}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate">{parchiType.name}</p>
          <p className="text-xs text-slate-400">{parchiType.prefix || 'No prefix'} · ₹{parchiType.amount} each</p>
        </div>
        {count > 0 && (
          <div className="text-right shrink-0">
            <p className="text-xs text-slate-400">{count} pcs</p>
            <p className="text-sm font-bold text-teal-700">₹{total.toLocaleString('en-IN')}</p>
          </div>
        )}
        <button onClick={onRemove} className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 text-sm shrink-0">×</button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3 p-3">
        <div>
          <label className="text-xs text-slate-400 font-semibold block mb-1.5">From Serial</label>
          <input
            type="number"
            inputMode="numeric"
            className="input text-center font-mono font-bold text-base"
            placeholder="1001"
            value={entry.fromSerial}
            onChange={e => onChange({ ...entry, fromSerial: e.target.value })}
            min="0"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-semibold block mb-1.5">To Serial</label>
          <input
            type="number"
            inputMode="numeric"
            className="input text-center font-mono font-bold text-base"
            placeholder="1100"
            value={entry.toSerial}
            onChange={e => onChange({ ...entry, toSerial: e.target.value })}
            min="0"
          />
        </div>
      </div>
    </div>
  );
}

/* ───────────────── Main OperatorPage ───────────────── */
export default function OperatorPage() {
  const { user, logout } = useAuth();
  const [shift, setShift] = useState(null);
  const [workDate, setWorkDate] = useState(today());
  const [parchiTypes, setParchiTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [showMembership, setShowMembership] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastBatch, setLastBatch] = useState(null);
  const [activeTab, setActiveTab] = useState('parchi'); // 'parchi' | 'membership'

  useEffect(() => {
    if (shift) {
      parchiTypesAPI.getAll().then(r => setParchiTypes(r.data.data || []));
    }
  }, [shift]);

  const toggleParchiType = (pt) => {
    setSelectedTypes(prev => {
      const exists = prev.find(s => s.parchiType._id === pt._id);
      if (exists) return prev.filter(s => s.parchiType._id !== pt._id);
      return [...prev, { parchiType: pt, entry: { fromSerial: '', toSerial: '' } }];
    });
  };

  const updateEntry = (id, entry) => {
    setSelectedTypes(prev => prev.map(s => s.parchiType._id === id ? { ...s, entry } : s));
  };

  const removeEntry = (id) => {
    setSelectedTypes(prev => prev.filter(s => s.parchiType._id !== id));
  };

  const grandTotal = selectedTypes.reduce((sum, s) => {
    const from = Number(s.entry.fromSerial) || 0;
    const to = Number(s.entry.toSerial) || 0;
    const count = from && to && to >= from ? to - from + 1 : 0;
    return sum + count * s.parchiType.amount;
  }, 0);

  const totalTickets = selectedTypes.reduce((sum, s) => {
    const from = Number(s.entry.fromSerial) || 0;
    const to = Number(s.entry.toSerial) || 0;
    const count = from && to && to >= from ? to - from + 1 : 0;
    return sum + count;
  }, 0);

  const handleSubmit = async () => {
    if (selectedTypes.length === 0) { toast.error('Select at least one parchi type'); return; }
    for (const s of selectedTypes) {
      const from = Number(s.entry.fromSerial);
      const to = Number(s.entry.toSerial);
      if (!from || !to) { toast.error(`Fill serial numbers for ${s.parchiType.name}`); return; }
      if (from > to) { toast.error(`From serial must be ≤ To serial for ${s.parchiType.name}`); return; }
    }
    setSubmitting(true);
    try {
      const entries = selectedTypes.map(s => ({
        parchiTypeId: s.parchiType._id,
        fromSerial: Number(s.entry.fromSerial),
        toSerial: Number(s.entry.toSerial),
      }));
      const res = await ticketsAPI.createBatch({ entries, shift, workDate });
      toast.success(`✅ ${res.data.totalTickets} tickets saved!`);
      setLastBatch(res.data);
      setSelectedTypes([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving tickets');
    } finally {
      setSubmitting(false);
    }
  };

  if (!shift) {
    return (
      <ShiftSelector
        onSelect={setShift}
        defaultShift={user?.shift}
        selectedDate={workDate}
        onDateChange={setWorkDate}
      />
    );
  }

  const sc = SHIFT_COLORS[shift];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className={`bg-gradient-to-r ${sc.bg} text-white shadow-lg sticky top-0 z-30`}>
        <div className="px-4 py-3 flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{sc.icon}</span>
            <div>
              <h1 className="font-bold text-base leading-tight">Parchi Entry</h1>
              <p className="text-white/70 text-xs">{user?.name} · {shift} · {workDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShift(null)}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
            >
              ↩ Shift
            </button>
            <button
              onClick={logout}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab bar inside header */}
        <div className="flex border-t border-white/20 max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab('parchi')}
            className={`flex-1 py-2.5 text-sm font-semibold transition-all ${activeTab === 'parchi' ? 'bg-white/20 text-white border-b-2 border-white' : 'text-white/60 hover:text-white'}`}
          >
            🎟️ Parchi Cutting
          </button>
          <button
            onClick={() => setActiveTab('membership')}
            className={`flex-1 py-2.5 text-sm font-semibold transition-all ${activeTab === 'membership' ? 'bg-white/20 text-white border-b-2 border-white' : 'text-white/60 hover:text-white'}`}
          >
            🎫 New Membership
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Last batch success */}
        {lastBatch && activeTab === 'parchi' && (
          <div className="card bg-emerald-50 border-2 border-emerald-200 p-4 fade-in">
            <div className="flex items-start justify-between mb-2">
              <p className="font-bold text-emerald-700 flex items-center gap-1.5">✅ Batch Saved!</p>
              <button onClick={() => setLastBatch(null)} className="text-emerald-400 hover:text-emerald-600 text-lg">×</button>
            </div>
            <p className="text-sm text-emerald-600 mb-2">{lastBatch.totalTickets} tickets · ₹{lastBatch.grandTotal?.toLocaleString('en-IN')} · Date: {workDate}</p>
            <div className="space-y-1">
              {lastBatch.summary?.map((s, i) => (
                <div key={i} className="text-sm text-emerald-700 flex justify-between bg-white/60 rounded-lg px-3 py-1.5">
                  <span className="font-medium">{s.parchiTypeName}</span>
                  <span>{s.fromSerial} → {s.toSerial} · <strong>{s.count} pcs · ₹{s.totalAmount}</strong></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PARCHI TAB ── */}
        {activeTab === 'parchi' && (
          <>
            {/* Date display chip */}
            <div className="flex items-center justify-between">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${sc.badge}`}>
                📅 {workDate} · {sc.icon} {shift}
              </div>
              <span className="text-xs text-slate-400">{parchiTypes.length} types available</span>
            </div>

            {/* Parchi type selector grid */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tap to Select Parchi Types</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {parchiTypes.map(pt => {
                  const isSelected = selectedTypes.some(s => s.parchiType._id === pt._id);
                  return (
                    <button
                      key={pt._id}
                      onClick={() => toggleParchiType(pt)}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 min-h-[110px] active:scale-95 ${
                        isSelected
                          ? 'shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                      style={isSelected ? { borderColor: pt.color, background: pt.color + '12' } : {}}
                    >
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm mb-2 shadow-sm" style={{ background: pt.color }}>
                        ₹{pt.amount}
                      </div>
                      <p className="font-bold text-slate-700 text-sm text-center leading-tight">{pt.name}</p>
                      {pt.prefix && <p className="text-xs text-slate-400 mt-0.5">{pt.prefix}</p>}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ background: pt.color }}>✓</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Serial entries */}
            {selectedTypes.length > 0 && (
              <div className="space-y-3 slide-down">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enter Serial Ranges</p>
                {selectedTypes.map(s => (
                  <ParchiEntryRow
                    key={s.parchiType._id}
                    parchiType={s.parchiType}
                    entry={s.entry}
                    onChange={entry => updateEntry(s.parchiType._id, entry)}
                    onRemove={() => removeEntry(s.parchiType._id)}
                  />
                ))}

                {/* Summary */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-0.5">Grand Total</p>
                      <p className="text-3xl font-extrabold text-teal-800">₹{grandTotal.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-sm">{totalTickets} tickets</p>
                      <p className="text-slate-400 text-xs">{selectedTypes.length} types</p>
                      <p className="text-teal-600 text-xs font-semibold mt-1">{workDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTypes.length === 0 && parchiTypes.length > 0 && (
              <div className="text-center py-12 text-slate-400">
                <div className="text-5xl mb-3">☝️</div>
                <p className="font-medium text-sm">Tap parchi types above to begin entry</p>
              </div>
            )}
          </>
        )}

        {/* ── MEMBERSHIP TAB ── */}
        {activeTab === 'membership' && (
          <MembershipInlineForm shift={shift} workDate={workDate} />
        )}
      </div>

      {/* Sticky Submit Button (parchi tab only) */}
      {activeTab === 'parchi' && selectedTypes.length > 0 && totalTickets > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur border-t border-slate-100 shadow-2xl z-20">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`btn-primary w-full justify-center py-4 text-base font-bold rounded-2xl ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {submitting
                ? '⏳ Saving...'
                : `💾 Save ${totalTickets} Tickets · ₹${grandTotal.toLocaleString('en-IN')}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────── Inline Membership Form ───────────────── */
function MembershipInlineForm({ shift, workDate }) {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({
    memberName: '', contactNumber: '', vehicleNumber: '',
    vehicleType: '2-wheeler', membershipTypeId: '',
    startDate: workDate,
  });
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    membershipTypesAPI.getAll().then(r => setTypes(r.data.data || []));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.memberName || !form.contactNumber || !form.vehicleNumber || !form.membershipTypeId) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await membershipsAPI.create({ ...form, shift, workDate });
      toast.success('Membership saved!');
      setLastSaved({ ...form, membershipTypeName: types.find(t => t._id === form.membershipTypeId)?.name });
      setForm({ memberName: '', contactNumber: '', vehicleNumber: '', vehicleType: '2-wheeler', membershipTypeId: '', startDate: workDate });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving membership');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Date/shift info */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span>📅 {workDate}</span>
        <span>·</span>
        <span>{SHIFT_COLORS[shift]?.icon} {shift} Shift</span>
      </div>

      {/* Last saved */}
      {lastSaved && (
        <div className="card bg-violet-50 border-2 border-violet-200 p-4 fade-in">
          <p className="text-sm font-bold text-violet-700 mb-1">✅ Membership Saved!</p>
          <p className="text-xs text-violet-600">{lastSaved.memberName} · {lastSaved.vehicleNumber} · {lastSaved.membershipTypeName}</p>
          <button onClick={() => setLastSaved(null)} className="text-xs text-violet-400 hover:text-violet-600 mt-1">Dismiss</button>
        </div>
      )}

      {/* Form */}
      <div className="card space-y-4">
        <div>
          <label className="label">Membership Type *</label>
          <select className="input" value={form.membershipTypeId} onChange={e => set('membershipTypeId', e.target.value)}>
            <option value="">Select type...</option>
            {types.map(t => (
              <option key={t._id} value={t._id}>{t.name} — ₹{t.amount} / {t.durationDays} days</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Member Name *</label>
          <input className="input" placeholder="Full name" value={form.memberName} onChange={e => set('memberName', e.target.value)} />
        </div>

        <div>
          <label className="label">Contact Number *</label>
          <input className="input" type="tel" inputMode="numeric" placeholder="10-digit mobile" value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)} />
        </div>

        <div>
          <label className="label">Vehicle Number *</label>
          <input className="input" placeholder="MP09XX1234" value={form.vehicleNumber} onChange={e => set('vehicleNumber', e.target.value.toUpperCase())} />
        </div>

        <div>
          <label className="label">Vehicle Type *</label>
          <div className="flex gap-3">
            {['2-wheeler', '4-wheeler'].map(vt => (
              <button
                key={vt}
                onClick={() => set('vehicleType', vt)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${form.vehicleType === vt ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500 bg-white'}`}
              >
                {vt === '2-wheeler' ? '🏍️ 2-Wheeler' : '🚗 4-Wheeler'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Start Date</label>
          <input type="date" className="input" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
        </div>

        <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base">
          {loading ? '⏳ Saving...' : '✅ Save Membership'}
        </button>
      </div>
    </div>
  );
}
