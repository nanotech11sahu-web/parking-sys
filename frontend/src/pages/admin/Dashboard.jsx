import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="card flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const COLORS = ['#0d9488', '#0891b2', '#7c3aed', '#dc2626', '#d97706', '#16a34a'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsAPI.getDashboard().then(r => setStats(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent" />
    </div>
  );

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Total Tickets" value={(stats?.totalTickets || 0).toLocaleString()} icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>} color="bg-teal-600" sub="All time" />
        <StatCard label="Total Revenue" value={fmt(stats?.totalRevenue)} icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="bg-green-600" sub="All time" />
        <StatCard label="Today's Tickets" value={(stats?.todayTickets || 0).toLocaleString()} icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} color="bg-blue-600" sub={fmt(stats?.todayRevenue) + ' today'} />
        <StatCard label="Month Tickets" value={(stats?.monthTickets || 0).toLocaleString()} icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} color="bg-purple-600" sub={fmt(stats?.monthRevenue) + ' this month'} />
        <StatCard label="Active Types" value={stats?.ticketsByType?.length || 0} icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>} color="bg-amber-500" sub="Parchi categories" />
        <StatCard label="Avg. per Ticket" value={stats?.totalTickets ? fmt(Math.round(stats.totalRevenue / stats.totalTickets)) : '₹0'} icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} color="bg-rose-500" sub="Average ticket value" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="card xl:col-span-2">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4">Last 7 Days Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.last7Days || []} barSize={32}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(val, name) => [name === 'revenue' ? `₹${val}` : val, name === 'revenue' ? 'Revenue' : 'Tickets']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontFamily: 'Plus Jakarta Sans' }} />
              <Bar dataKey="count" name="Tickets" fill="#0d9488" radius={[6, 6, 0, 0]} />
              <Bar dataKey="revenue" name="Revenue" fill="#ccfbf1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4">By Parchi Type</h3>
          {stats?.ticketsByType?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.ticketsByType} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {stats.ticketsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend formatter={(val) => <span style={{ fontSize: 11, color: '#64748b' }}>{val}</span>} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontFamily: 'Plus Jakarta Sans' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm text-center py-16">No data yet</p>}
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="card">
        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4">Recent Tickets</h3>
        <div className="overflow-x-auto -mx-6">
          <table className="w-full">
            <thead>
              <tr>
                {['Serial #', 'Type', 'Amount', 'Operator', 'Time'].map(h => (
                  <th key={h} className="table-th first:pl-6 last:pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats?.recentTickets?.length ? stats.recentTickets.map(t => (
                <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="table-td pl-6 font-mono font-semibold text-teal-700">{t.serialNumber}</td>
                  <td className="table-td">{t.parchiTypeName}</td>
                  <td className="table-td font-semibold text-green-700">₹{t.amount}</td>
                  <td className="table-td">{t.operatorName}</td>
                  <td className="table-td text-slate-400 pr-6">{new Date(t.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="table-td text-center text-slate-400 py-8">No tickets yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
