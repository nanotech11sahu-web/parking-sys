import React, { useState, useEffect, useCallback } from 'react';
import { ticketsAPI, usersAPI, parchiTypesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SHIFTS = ['Morning', 'Night'];
const SHIFT_ICONS = { Morning: '🌅', Night: '🌙' };

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operators, setOperators] = useState([]);
  const [parchiTypes, setParchiTypes] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filters, setFilters] = useState({ operatorId: '', parchiTypeId: '', startDate: '', endDate: '', shift: '' });
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    ticketsAPI.getAll({ ...filters, page, limit: 25 })
      .then(r => { setTickets(r.data.data); setPagination(r.data.pagination); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    usersAPI.getAll().then(r => setOperators(r.data.data.filter(u => u.role === 'operator')));
    parchiTypesAPI.getAll().then(r => setParchiTypes(r.data.data));
  }, []);

  const handleFilter = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setPage(1); };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">All Tickets</h1>
        <p className="text-slate-500 text-sm mt-1">{pagination.total.toLocaleString()} total tickets</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <div>
            <label className="label">Operator</label>
            <select className="input" value={filters.operatorId} onChange={e => handleFilter('operatorId', e.target.value)}>
              <option value="">All Operators</option>
              {operators.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Parchi Type</label>
            <select className="input" value={filters.parchiTypeId} onChange={e => handleFilter('parchiTypeId', e.target.value)}>
              <option value="">All Types</option>
              {parchiTypes.map(t => <option key={t._id} value={t._id}>{t.name} (₹{t.amount})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Shift</label>
            <select className="input" value={filters.shift} onChange={e => handleFilter('shift', e.target.value)}>
              <option value="">All Shifts</option>
              {SHIFTS.map(s => <option key={s} value={s}>{SHIFT_ICONS[s]} {s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Work Date From</label>
            <input className="input" type="date" value={filters.startDate} onChange={e => handleFilter('startDate', e.target.value)} />
          </div>
          <div>
            <label className="label">Work Date To</label>
            <input className="input" type="date" value={filters.endDate} onChange={e => handleFilter('endDate', e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={load} className="btn-primary py-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Search
          </button>
          <button onClick={() => { setFilters({ operatorId: '', parchiTypeId: '', startDate: '', endDate: '', shift: '' }); setPage(1); }} className="btn-secondary py-2">
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {['#', 'Serial No.', 'Type', 'Amount', 'Operator', 'Shift', 'Work Date'].map(h => (
                      <th key={h} className="table-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t, i) => (
                    <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <td className="table-td text-slate-400 text-xs">{(page - 1) * 25 + i + 1}</td>
                      <td className="table-td font-mono font-bold text-teal-700 dark:text-teal-400">{t.serialNumber}</td>
                      <td className="table-td">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.parchiTypeId?.color || '#0d9488' }} />
                          {t.parchiTypeName}
                        </span>
                      </td>
                      <td className="table-td font-semibold text-green-700 dark:text-green-400">₹{t.amount}</td>
                      <td className="table-td">{t.operatorName}</td>
                      <td className="table-td">
                        <span className="flex items-center gap-1 text-sm">
                          {SHIFT_ICONS[t.shift] || '⏰'} {t.shift}
                        </span>
                      </td>
                      <td className="table-td font-mono text-xs text-slate-600 dark:text-slate-300">{t.workDate}</td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr><td colSpan={7} className="table-td text-center text-slate-400 py-12">No tickets found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-500">Page {pagination.page} of {pagination.pages} · {pagination.total} records</p>
                <div className="flex items-center gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">← Prev</button>
                  <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
