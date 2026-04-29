import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SHIFTS = ['Morning', 'Night'];
const SHIFT_ICONS = { Morning: '🌅', Night: '🌙' };

const emptyForm = { name: '', email: '', password: '', role: 'operator', shift: 'Morning', isActive: true };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => { setForm(emptyForm); setModal('create'); };
  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, shift: u.shift || 'Morning', isActive: u.isActive });
    setEditId(u._id);
    setModal('edit');
  };

  const handleSave = async () => {
    try {
      if (modal === 'create') {
        await usersAPI.create(form);
        toast.success('User created');
      } else {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await usersAPI.update(editId, payload);
        toast.success('User updated');
      }
      fetchUsers();
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await usersAPI.delete(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Users</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage operators and admins</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Add User</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Name</th>
                <th className="table-th">Email</th>
                <th className="table-th">Role</th>
                <th className="table-th">Default Shift</th>
                <th className="table-th">Status</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading...</td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="table-td font-semibold text-slate-800 dark:text-white">{u.name}</td>
                  <td className="table-td text-slate-500">{u.email}</td>
                  <td className="table-td">
                    <span className={`badge ${u.role === 'admin' ? 'badge-blue' : 'badge-green'}`}>{u.role}</span>
                  </td>
                  <td className="table-td">
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 text-sm">
                      <span>{SHIFT_ICONS[u.shift] || '🌅'}</span>
                      <span>{u.shift || 'Morning'}</span>
                    </span>
                  </td>
                  <td className="table-td">
                    <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-td">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(u)} className="text-teal-600 hover:text-teal-800 text-sm font-semibold">Edit</button>
                      <button onClick={() => handleDelete(u._id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 scale-in">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5">
              {modal === 'create' ? 'Create User' : 'Edit User'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="label">{modal === 'edit' ? 'Password (leave blank to keep)' : 'Password'}</label>
                <input type="password" className="input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Role</label>
                  <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="label">Default Shift</label>
                  <select className="input" value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}>
                    {SHIFTS.map(s => <option key={s} value={s}>{SHIFT_ICONS[s]} {s}</option>)}
                  </select>
                </div>
              </div>
              {modal === 'edit' && (
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 text-teal-600" />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</label>
                </div>
              )}
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
