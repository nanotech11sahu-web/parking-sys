import React, { useState, useEffect, useCallback } from 'react';
import { reportsAPI, membershipsAPI, ticketsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TABS = ['Overview', 'Shift-wise', 'Batch Records', 'Memberships', 'Daily'];
const SHIFTS = ['Morning', 'Night'];
const SHIFT_ICONS = { Morning: '🌅', Night: '🌙' };

function StatCard({ label, value, sub, color = 'teal' }) {
  const colors = {
    teal:   'from-teal-50 to-emerald-50 border-teal-100 text-teal-700',
    violet: 'from-violet-50 to-purple-50 border-violet-100 text-violet-700',
    amber:  'from-amber-50 to-yellow-50 border-amber-100 text-amber-700',
    blue:   'from-blue-50 to-sky-50 border-blue-100 text-blue-700',
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${colors[color]}`}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs mt-0.5 opacity-60">{sub}</p>}
    </div>
  );
}

// Unique key for a batch row (batchId + parchiTypeId combo)
const rowKey = (row) => `${row._id?.batchId}__${row._id?.parchiTypeId}`;

export default function ReportsPage() {
  const [tab, setTab] = useState('Overview');
  const [dashboard, setDashboard] = useState(null);
  const [shiftData, setShiftData] = useState([]);
  const [batchData, setBatchData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');

  // ── Multi-select state ──
  const [selected, setSelected] = useState(new Set()); // Set of rowKey strings
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await reportsAPI.getDashboard();
      setDashboard(res.data.data);
    } catch { toast.error('Failed to load dashboard'); }
  };

  const fetchShift = async () => {
    setLoading(true);
    try {
      const res = await reportsAPI.getShift({ startDate, endDate });
      setShiftData(res.data.data);
    } catch { toast.error('Failed to load shift report'); }
    finally { setLoading(false); }
  };

  const fetchBatch = useCallback(async () => {
    setLoading(true);
    setSelected(new Set()); // clear selection on reload
    try {
      const res = await reportsAPI.getBatch({ startDate, endDate, shift: shiftFilter });
      setBatchData(res.data.data);
    } catch { toast.error('Failed to load batch report'); }
    finally { setLoading(false); }
  }, [startDate, endDate, shiftFilter]);

  const fetchDaily = async () => {
    setLoading(true);
    try {
      const res = await reportsAPI.getDaily({ startDate, endDate, shift: shiftFilter });
      setDailyData(res.data.data);
    } catch { toast.error('Failed to load daily report'); }
    finally { setLoading(false); }
  };

  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const res = await membershipsAPI.getAll({ startDate, endDate, shift: shiftFilter });
      setMemberships(res.data.data);
    } catch { toast.error('Failed to load memberships'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboard(); }, []);

  useEffect(() => {
    setSelected(new Set());
    if (tab === 'Shift-wise') fetchShift();
    if (tab === 'Batch Records') fetchBatch();
    if (tab === 'Daily') fetchDaily();
    if (tab === 'Memberships') fetchMemberships();
  }, [tab]);

  const handleApplyFilters = () => {
    if (tab === 'Shift-wise') fetchShift();
    if (tab === 'Batch Records') fetchBatch();
    if (tab === 'Daily') fetchDaily();
    if (tab === 'Memberships') fetchMemberships();
  };

  // ── Selection helpers ──
  const allKeys = batchData.map(rowKey);
  const allSelected = allKeys.length > 0 && allKeys.every(k => selected.has(k));
  const someSelected = selected.size > 0;

  const toggleRow = (key) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allKeys));
    }
  };

  // ── Delete selected batches ──
  const handleDeleteSelected = async () => {
    setDeleting(true);
    setConfirmOpen(false);
    try {
      // Build payload: array of { batchId, parchiTypeId }
      const batches = batchData
        .filter(row => selected.has(rowKey(row)))
        .map(row => ({
          batchId: row._id?.batchId,
          parchiTypeId: row._id?.parchiTypeId,
        }));

      await ticketsAPI.deleteBatches({ batches });
      toast.success(`${selected.size} batch(es) deleted successfully`);
      await fetchBatch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  // Summary of selected batches
  const selectedRows = batchData.filter(row => selected.has(rowKey(row)));
  const selectedTicketCount = selectedRows.reduce((s, r) => s + (r.count || 0), 0);
  const selectedRevenue = selectedRows.reduce((s, r) => s + (r.revenue || 0), 0);

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reports</h1>
        <p className="text-slate-500 text-sm">Shift-wise, batch, membership & daily analytics</p>
      </div>

      {/* Tab Bar */}
      <div className="overflow-x-auto -mx-1 pb-1">
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 w-fit min-w-full sm:min-w-0">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${tab === t ? 'bg-white dark:bg-slate-700 text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {tab !== 'Overview' && (
        <div className="card p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            {tab !== 'Shift-wise' && (
              <div>
                <label className="label">Shift</label>
                <select className="input" value={shiftFilter} onChange={e => setShiftFilter(e.target.value)}>
                  <option value="">All Shifts</option>
                  {SHIFTS.map(s => <option key={s} value={s}>{SHIFT_ICONS[s]} {s}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleApplyFilters} className="btn-primary py-2">Apply</button>
            <button onClick={() => { setStartDate(''); setEndDate(''); setShiftFilter(''); }} className="btn-secondary py-2">Clear</button>
          </div>
        </div>
      )}

      {/* ── OVERVIEW ── */}
      {tab === 'Overview' && dashboard && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard label="Today Tickets" value={dashboard.todayTickets} sub={`₹${dashboard.todayRevenue?.toLocaleString('en-IN')}`} color="teal" />
            <StatCard label="Month Tickets" value={dashboard.monthTickets} sub={`₹${dashboard.monthRevenue?.toLocaleString('en-IN')}`} color="blue" />
            <StatCard label="Today Members" value={dashboard.todayMemberships} sub={`₹${dashboard.todayMembershipRevenue?.toLocaleString('en-IN')}`} color="violet" />
            <StatCard label="Month Members" value={dashboard.monthMemberships} sub={`₹${dashboard.monthMembershipRevenue?.toLocaleString('en-IN')}`} color="amber" />
          </div>

          {dashboard.shiftStats?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-slate-700 dark:text-white mb-4">Today's Shift-wise Breakdown</h3>
              <div className="grid grid-cols-2 gap-3">
                {dashboard.shiftStats
                  .filter(s => ['Morning', 'Night'].includes(s._id))
                  .map(s => (
                    <div key={s._id} className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-700">
                      <p className="text-2xl">{SHIFT_ICONS[s._id] || '⏰'}</p>
                      <p className="font-bold text-slate-700 dark:text-white text-sm mt-1">{s._id}</p>
                      <p className="text-teal-600 font-bold">{s.count} tickets</p>
                      <p className="text-slate-500 text-xs">₹{s.revenue?.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="font-bold text-slate-700 dark:text-white mb-4">Last 7 Days Revenue</h3>
            <div className="overflow-x-auto -mx-2">
              <div className="min-w-[320px] px-2">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dashboard.last7Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `₹${v?.toLocaleString('en-IN')}`} />
                    <Legend />
                    <Bar dataKey="revenue" name="Ticket Revenue" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-slate-700 dark:text-white mb-4">All-time by Parchi Type</h3>
            <div className="overflow-x-auto -mx-6">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th first:pl-6">Type</th>
                    <th className="table-th">Count</th>
                    <th className="table-th last:pr-6">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.ticketsByType?.map(t => (
                    <tr key={t._id} className="hover:bg-slate-50">
                      <td className="table-td pl-6 font-medium">{t.name}</td>
                      <td className="table-td">{t.count}</td>
                      <td className="table-td pr-6 font-bold text-teal-700">₹{t.revenue?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SHIFT-WISE ── */}
      {tab === 'Shift-wise' && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr>
                  <th className="table-th">Date</th>
                  <th className="table-th">Shift</th>
                  <th className="table-th">Operators</th>
                  <th className="table-th">Tickets</th>
                  <th className="table-th">Ticket Rev.</th>
                  <th className="table-th">Members</th>
                  <th className="table-th">Total Rev.</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading...</td></tr>
                ) : shiftData.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-400">No data found</td></tr>
                ) : shiftData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="table-td font-mono text-xs">{row._id?.date}</td>
                    <td className="table-td">
                      <span className="flex items-center gap-1 text-sm">
                        {SHIFT_ICONS[row._id?.shift] || '⏰'} {row._id?.shift}
                      </span>
                    </td>
                    <td className="table-td text-xs text-slate-500">{row.operators?.join(', ')}</td>
                    <td className="table-td font-bold">{row.count}</td>
                    <td className="table-td text-teal-700 font-bold">₹{row.revenue?.toLocaleString('en-IN')}</td>
                    <td className="table-td text-violet-700">{row.membershipCount}</td>
                    <td className="table-td font-bold text-slate-800">₹{row.totalRevenue?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BATCH RECORDS ── */}
      {tab === 'Batch Records' && (
        <div className="space-y-3">

          {/* Action bar — appears when rows are selected */}
          <div className={`flex items-center justify-between gap-4 px-4 py-3 rounded-2xl border transition-all duration-200 ${
            someSelected
              ? 'bg-red-50 border-red-200 opacity-100 scale-100'
              : 'bg-slate-50 border-slate-100 opacity-60'
          }`}>
            <div className="flex items-center gap-3">
              {/* Master checkbox */}
              <input
                type="checkbox"
                checked={allSelected}
                ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                onChange={toggleAll}
                className="w-4 h-4 rounded accent-teal-600 cursor-pointer"
              />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {someSelected
                  ? `${selected.size} batch${selected.size > 1 ? 'es' : ''} selected · ${selectedTicketCount} tickets · ₹${selectedRevenue.toLocaleString('en-IN')}`
                  : `${batchData.length} batch record${batchData.length !== 1 ? 's' : ''}`
                }
              </span>
            </div>

            {someSelected && (
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={deleting}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                {deleting ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                Delete Selected
              </button>
            )}
          </div>

          {/* Table */}
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr>
                    <th className="table-th w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded accent-teal-600 cursor-pointer"
                      />
                    </th>
                    <th className="table-th">Work Date</th>
                    <th className="table-th">Shift</th>
                    <th className="table-th">Operator</th>
                    <th className="table-th">Parchi Type</th>
                    <th className="table-th">Serial Range</th>
                    <th className="table-th">Count</th>
                    <th className="table-th">Revenue</th>
                    <th className="table-th">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} className="text-center py-8 text-slate-400">
                      <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent" /></div>
                    </td></tr>
                  ) : batchData.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-10 text-slate-400">No batch data found</td></tr>
                  ) : batchData.map((row, i) => {
                    const key = rowKey(row);
                    const isSelected = selected.has(key);
                    return (
                      <tr
                        key={i}
                        onClick={() => toggleRow(key)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                      >
                        <td className="table-td" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(key)}
                            className="w-4 h-4 rounded accent-teal-600 cursor-pointer"
                          />
                        </td>
                        <td className="table-td font-mono text-xs font-bold">
                          {row.workDate || new Date(row.date).toISOString().split('T')[0]}
                        </td>
                        <td className="table-td">
                          <span className="flex items-center gap-1 text-sm whitespace-nowrap">
                            {SHIFT_ICONS[row.shift] || '⏰'} {row.shift}
                          </span>
                        </td>
                        <td className="table-td font-medium">{row.operatorName}</td>
                        <td className="table-td">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{row.parchiTypeName}</span>
                        </td>
                        <td className="table-td font-mono text-xs text-slate-500">
                          {row.fromSerial} → {row.toSerial}
                        </td>
                        <td className="table-td font-bold text-teal-700 dark:text-teal-400">{row.count}</td>
                        <td className="table-td font-bold">₹{row.revenue?.toLocaleString('en-IN')}</td>
                        <td className="table-td" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelected(new Set([key]));
                              setConfirmOpen(true);
                            }}
                            className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MEMBERSHIPS ── */}
      {tab === 'Memberships' && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr>
                  <th className="table-th">Work Date</th>
                  <th className="table-th">Member</th>
                  <th className="table-th">Contact</th>
                  <th className="table-th">Vehicle</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Shift</th>
                  <th className="table-th">Operator</th>
                  <th className="table-th">Valid Till</th>
                  <th className="table-th">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-8 text-slate-400">Loading...</td></tr>
                ) : memberships.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-8 text-slate-400">No memberships found</td></tr>
                ) : memberships.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50">
                    <td className="table-td font-mono text-xs">
                      {m.workDate || new Date(m.createdAt).toISOString().split('T')[0]}
                    </td>
                    <td className="table-td font-medium">{m.memberName}</td>
                    <td className="table-td text-slate-500">{m.contactNumber}</td>
                    <td className="table-td">
                      <span className="font-mono text-xs">{m.vehicleNumber}</span>
                      <span className="ml-1 text-xs">{m.vehicleType === '2-wheeler' ? '🏍️' : '🚗'}</span>
                    </td>
                    <td className="table-td text-sm">{m.membershipTypeName}</td>
                    <td className="table-td text-sm">
                      <span className="flex items-center gap-1">{SHIFT_ICONS[m.shift] || '⏰'} {m.shift}</span>
                    </td>
                    <td className="table-td text-sm">{m.operatorName}</td>
                    <td className="table-td text-sm text-slate-500 font-mono">
                      {new Date(m.endDate).toISOString().split('T')[0]}
                    </td>
                    <td className="table-td font-bold text-violet-700">₹{m.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── DAILY ── */}
      {tab === 'Daily' && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr>
                  <th className="table-th">Date</th>
                  <th className="table-th">Tickets</th>
                  <th className="table-th">Ticket Rev.</th>
                  <th className="table-th">Members</th>
                  <th className="table-th">Member Rev.</th>
                  <th className="table-th">Total Rev.</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-slate-400">Loading...</td></tr>
                ) : dailyData.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-slate-400">No data found</td></tr>
                ) : dailyData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="table-td font-mono text-xs font-bold">{row._id}</td>
                    <td className="table-td font-bold">{row.count}</td>
                    <td className="table-td text-teal-700 font-bold">₹{row.revenue?.toLocaleString('en-IN')}</td>
                    <td className="table-td text-violet-700">{row.membershipCount}</td>
                    <td className="table-td text-violet-700 font-bold">₹{row.membershipRevenue?.toLocaleString('en-IN')}</td>
                    <td className="table-td font-bold text-slate-800 text-base">₹{row.totalRevenue?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CONFIRM DELETE MODAL ── */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 scale-in">
            <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-2xl mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white text-center mb-1">Delete Batch Records?</h3>
            <p className="text-sm text-slate-500 text-center mb-4">
              This will permanently delete{' '}
              <span className="font-bold text-red-600">{selected.size} batch{selected.size > 1 ? 'es' : ''}</span>{' '}
              containing{' '}
              <span className="font-bold text-red-600">{selectedTicketCount} ticket{selectedTicketCount !== 1 ? 's' : ''}</span>{' '}
              worth{' '}
              <span className="font-bold text-red-600">₹{selectedRevenue.toLocaleString('en-IN')}</span>.
              This action cannot be undone.
            </p>

            {/* Selected batch summary */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 mb-5 max-h-36 overflow-y-auto space-y-1">
              {selectedRows.map((row, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {SHIFT_ICONS[row.shift]} {row.workDate} · {row.parchiTypeName}
                  </span>
                  <span className="text-red-600 font-bold ml-2 shrink-0">{row.count} tickets</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="btn-secondary flex-1 justify-center"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex-1 justify-center flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}