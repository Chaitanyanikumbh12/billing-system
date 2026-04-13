import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { billAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp, ShoppingCart, Users, Package,
  AlertTriangle, PlusCircle, FileText, ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const mockMonthly = [
  { month: 'Jan', revenue: 42000 }, { month: 'Feb', revenue: 58000 },
  { month: 'Mar', revenue: 45000 }, { month: 'Apr', revenue: 71000 },
  { month: 'May', revenue: 63000 }, { month: 'Jun', revenue: 89000 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billAPI.getDashboard()
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
      <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading dashboard…</span>
    </div>
  );

  const cards = [
    {
      label: 'Total Revenue', value: fmt(stats?.totalRevenue),
      icon: TrendingUp, color: '#6366f1', bg: '#ede9fe',
      sub: `Today: ${fmt(stats?.todayRevenue)}`,
    },
    {
      label: "Today's Bills", value: stats?.todayBills ?? 0,
      icon: ShoppingCart, color: '#06b6d4', bg: '#cffafe',
      sub: `Monthly: ${fmt(stats?.monthlyRevenue)}`,
    },
    {
      label: 'Total Customers', value: stats?.totalCustomers ?? 0,
      icon: Users, color: '#10b981', bg: '#d1fae5',
      sub: 'Registered customers',
    },
    {
      label: 'Products', value: stats?.totalProducts ?? 0,
      icon: Package, color: '#f59e0b', bg: '#fef3c7',
      sub: `${stats?.lowStockProducts ?? 0} low stock`,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your business today.</p>
        </div>
        <Link to="/bills/new" className="btn btn-primary">
          <PlusCircle size={16} /> New Bill
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {cards.map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div className="stat-info">
              <div className="stat-label">{label}</div>
              <div className="stat-value" style={{ fontSize: 20 }}>{value}</div>
              <div className="stat-change text-muted">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Recent Bills */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Revenue chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: 15 }}>Revenue Overview</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Monthly revenue trend</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockMonthly}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent bills */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 600, fontSize: 15 }}>Recent Bills</h3>
            <Link to="/bills" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowUpRight size={12} />
            </Link>
          </div>

          {!stats?.recentBills?.length ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '30px 0' }}>
              No bills yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.recentBills.map(bill => (
                <Link
                  key={bill.id}
                  to={`/bills/${bill.id}`}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', borderRadius: 8, background: 'var(--bg)',
                    textDecoration: 'none', color: 'inherit',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{bill.billNumber}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {bill.customer?.name || 'Walk-in Customer'}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                    {fmt(bill.totalAmount)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low stock warning */}
      {stats?.lowStockProducts > 0 && (
        <div style={{
          marginTop: 20, padding: '14px 18px',
          background: '#fef3c7', border: '1px solid #fde68a',
          borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <AlertTriangle size={18} color="#f59e0b" />
          <span style={{ fontSize: 14, color: '#92400e' }}>
            <strong>{stats.lowStockProducts} products</strong> are running low on stock.{' '}
            <Link to="/products" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Manage Products →</Link>
          </span>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
