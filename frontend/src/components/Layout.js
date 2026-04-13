import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, Users, FileText, PlusCircle,
  LogOut, Menu, X, Receipt, ChevronRight
} from 'lucide-react';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products',  icon: Package,         label: 'Products' },
  { to: '/customers', icon: Users,           label: 'Customers' },
  { to: '/bills',     icon: FileText,        label: 'Bills' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = ({ mobile }) => (
    <aside
      style={{
        width: mobile ? '100%' : 240,
        background: '#1e1b4b',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 38, height: 38,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Receipt size={20} color="#fff" />
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>BillEase</div>
          <div style={{ color: '#a5b4fc', fontSize: 11 }}>Billing System</div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              textDecoration: 'none',
              color: isActive ? '#fff' : '#94a3b8',
              background: isActive ? 'rgba(99,102,241,0.25)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
              transition: 'all 0.15s',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
              </>
            )}
          </NavLink>
        ))}

        {/* Quick action */}
        <div style={{ marginTop: 12 }}>
          <button
            className="btn btn-primary w-full"
            onClick={() => { navigate('/bills/new'); setOpen(false); }}
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', justifyContent: 'center', width: '100%' }}
          >
            <PlusCircle size={16} /> New Bill
          </button>
        </div>
      </nav>

      {/* User info */}
      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14,
            flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ color: '#64748b', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          style={{ width: '100%', color: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center' }}
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Desktop sidebar */}
      <div style={{ display: 'none' }} className="desktop-sidebar">
        <Sidebar />
      </div>
      <div style={{ height: '100vh', flexShrink: 0 }} className="sidebar-wrapper">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
          }}
          onClick={() => setOpen(false)}
        >
          <div style={{ width: 260 }} onClick={e => e.stopPropagation()}>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mobile topbar */}
        <header style={{
          padding: '14px 20px',
          background: '#fff',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          display: 'none',
        }} className="mobile-header">
          <button onClick={() => setOpen(true)} className="btn btn-ghost btn-icon">
            <Menu size={20} />
          </button>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#1e1b4b' }}>BillEase</div>
          <div style={{ width: 36 }} />
        </header>

        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '28px 32px',
        }}>
          <div className="fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-wrapper { display: none !important; }
          .mobile-header { display: flex !important; }
          main { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
}
