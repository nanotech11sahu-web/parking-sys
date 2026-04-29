import React, { useState, useEffect } from 'react';
import { parchiTypesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const PRESET_COLORS = ['#0d9488','#0891b2','#7c3aed','#dc2626','#d97706','#16a34a','#db2777','#ea580c'];

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md scale-in">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-white text-lg">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

export default function ParchiTypesPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', amount: '', prefix: '', color: '#0d9488', description: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    parchiTypesAPI.getAll().then(r => setTypes(r.data.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ name: '', amount: '', prefix: '', color: '#0d9488', description: '' });
    setEditing(null);
    setModal('form');
  };

  const openEdit = (t) => {
    setForm({ name: t.name, amount: t.amount, prefix: t.prefix || '', color: t.color || '#0d9488', description: t.description || '' });
    setEditing(t);
    setModal('form');
  };

  const handleSave = async () => {
    if (!form.name || !form.amount) return toast.error('Name and amount required');
    setSaving(true);
    try {
      if (editing) {
        await parchiTypesAPI.update(editing._id, form);
        toast.success('Updated!');
      } else {
        await parchiTypesAPI.create(form);
        toast.success('Created!');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (t) => {
    try {
      await parchiTypesAPI.toggle(t._id);
      toast.success(`${t.isActive ? 'Deactivated' : 'Activated'}!`);
      load();
    } catch { toast.error('Failed'); }
  };

  const handleReset = async (t) => {
    if (!window.confirm(`Reset serial counter for "${t.name}" to 0? This cannot be undone.`)) return;
    try {
      await parchiTypesAPI.resetSerial(t._id);
      toast.success('Serial reset to 0');
      load();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete "${t.name}"? This cannot be undone.`)) return;
    try {
      await parchiTypesAPI.delete(t._id);
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Parchi Types</h1>
          <p className="text-slate-500 text-sm mt-1">Manage ticket categories and pricing</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Parchi Type
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {types.map(t => (
            <div key={t._id} className={`card relative overflow-hidden transition-all ${!t.isActive ? 'opacity-60' : ''}`}>
              {/* Color bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: t.color }} />
              <div className="flex items-start justify-between mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm" style={{ backgroundColor: t.color }}>
                    ₹
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{t.name}</h3>
                    <p className="text-sm text-slate-500">{t.prefix || 'No prefix'}</p>
                  </div>
                </div>
                <span className={t.isActive ? 'badge-green' : 'badge-red'}>{t.isActive ? 'Active' : 'Inactive'}</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-0.5">Amount</p>
                  <p className="font-extrabold text-teal-700 dark:text-teal-400 text-xl">₹{t.amount}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-0.5">Issued</p>
                  <p className="font-extrabold text-slate-700 dark:text-slate-200 text-xl font-mono">{t.currentSerial.toLocaleString()}</p>
                </div>
              </div>

              {t.description && <p className="text-slate-500 text-xs mt-3">{t.description}</p>}

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => openEdit(t)} className="btn-secondary py-1.5 px-3 text-xs flex-1 justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit
                </button>
                <button onClick={() => handleToggle(t)} className={`py-1.5 px-3 text-xs rounded-xl font-semibold flex items-center gap-1.5 transition-all ${t.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                  {t.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleReset(t)} title="Reset serial" className="py-1.5 px-2.5 text-xs rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold">↺</button>
                <button onClick={() => handleDelete(t)} className="py-1.5 px-2.5 text-xs rounded-xl bg-red-100 text-red-700 hover:bg-red-200 font-semibold">✕</button>
              </div>
            </div>
          ))}
          {types.length === 0 && (
            <div className="col-span-3 card text-center py-16">
              <p className="text-slate-400 text-lg font-medium">No parchi types yet</p>
              <p className="text-slate-300 text-sm mt-1">Create your first ticket type to get started</p>
            </div>
          )}
        </div>
      )}

      {modal === 'form' && (
        <Modal title={editing ? 'Edit Parchi Type' : 'New Parchi Type'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="label">Name *</label>
              <input className="input" placeholder="e.g. Medium Parchi" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Amount (₹) *</label>
                <input className="input" type="number" min="0" placeholder="10" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div>
                <label className="label">Prefix</label>
                <input className="input" placeholder="e.g. T10" value={form.prefix} onChange={e => setForm(f => ({ ...f, prefix: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${form.color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
                <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-8 h-8 rounded-lg border-2 border-slate-200 cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <input className="input" placeholder="Optional description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : null}
                {editing ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
