import React, { useState, useEffect } from 'react';
import { membershipTypesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const emptyForm = { name: '', amount: '', durationDays: 30, color: '#7c3aed', description: '', isActive: true };

export default function MembershipTypesPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await membershipTypesAPI.getAll();
      setTypes(res.data.data);
    } catch (err) {
      toast.error('Failed to load membership types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTypes(); }, []);

  const openCreate = () => { setForm(emptyForm); setModal('create'); };
  const openEdit = (t) => {
    setForm({ name: t.name, amount: t.amount, durationDays: t.durationDays, color: t.color, description: t.description || '', isActive: t.isActive });
    setEditId(t._id);
    setModal('edit');
  };

  const handleSave = async () => {
    try {
      if (modal === 'create') {
        await membershipTypesAPI.create(form);
        toast.success('Membership type created');
      } else {
        await membershipTypesAPI.update(editId, form);
        toast.success('Updated');
      }
      fetchTypes();
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleToggle = async (id) => {
    try {
      await membershipTypesAPI.toggle(id);
      fetchTypes();
    } catch (err) {
      toast.error('Error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try {
      await membershipTypesAPI.delete(id);
      toast.success('Deleted');
      fetchTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Membership Types</h1>
          <p className="text-slate-500 text-sm mt-0.5">Define membership plans available to operators</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Add Type</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400">Loading...</div>
        ) : types.map(t => (
          <div key={t._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: t.color }}>
                ₹{t.amount >= 1000 ? `${t.amount/1000}k` : t.amount}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 dark:text-white truncate">{t.name}</h3>
                <p className="text-xs text-slate-500">{t.durationDays} days</p>
              </div>
              <span className={`badge shrink-0 ${t.isActive ? 'badge-green' : 'badge-red'}`}>{t.isActive ? 'Active' : 'Off'}</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mb-1">₹{t.amount}</p>
            {t.description && <p className="text-xs text-slate-500 mb-3">{t.description}</p>}
            <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => openEdit(t)} className="text-teal-600 hover:text-teal-800 text-sm font-semibold">Edit</button>
              <button onClick={() => handleToggle(t._id)} className="text-slate-500 hover:text-slate-700 text-sm font-semibold">
                {t.isActive ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => handleDelete(t._id)} className="text-red-500 hover:text-red-700 text-sm font-semibold ml-auto">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 scale-in">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5">
              {modal === 'create' ? 'New Membership Type' : 'Edit Membership Type'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input className="input" placeholder="e.g. Monthly - 2 Wheeler" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Amount (₹)</label>
                  <input type="number" className="input" placeholder="500" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Duration (days)</label>
                  <input type="number" className="input" placeholder="30" value={form.durationDays} onChange={e => setForm(f => ({ ...f, durationDays: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
                    <input className="input flex-1" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Description</label>
                  <input className="input" placeholder="Optional note" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}