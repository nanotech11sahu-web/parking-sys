import React, { useState, useEffect } from 'react';
import { reportsAPI, membershipsAPI } from '../../services/api';
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

  const fetchBatch = async () => {
    setLoading(true);
    try {
      const res = await reportsAPI.getBatch({ startDate, endDate, shift: shiftFilter });
      setBatchData(res.data.data);
    } catch { toast.error('Failed to load batch report'); }
    finally { setLoading(false); }
  };

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

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reports</h1>
        <p className="text-slate-500 text-sm">Shift-wise, batch, membership & daily analytics</p>
      </div>

      {/* Tab Bar - scrollable on mobile */}
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
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr>
                  <th className="table-th">Work Date</th>
                  <th className="table-th">Operator</th>
                  <th className="table-th">Shift</th>
                  <th className="table-th">Parchi Type</th>
                  <th className="table-th">Serial Range</th>
                  <th className="table-th">Count</th>
                  <th className="table-th">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading...</td></tr>
                ) : batchData.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-400">No batch data</td></tr>
                ) : batchData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="table-td font-mono text-xs">
                      {row.workDate || new Date(row.date).toISOString().split('T')[0]}
                    </td>
                    <td className="table-td font-medium">{row.operatorName}</td>
                    <td className="table-td">
                      <span className="flex items-center gap-1 text-sm">
                        {SHIFT_ICONS[row.shift] || '⏰'} {row.shift}
                      </span>
                    </td>
                    <td className="table-td">{row.parchiTypeName}</td>
                    <td className="table-td font-mono text-xs">{row.fromSerial} → {row.toSerial}</td>
                    <td className="table-td font-bold text-teal-700">{row.count}</td>
                    <td className="table-td font-bold">₹{row.revenue?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
}
