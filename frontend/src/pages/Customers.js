import React, { useEffect, useState, useCallback } from 'react';
import { customerAPI } from '../api/axios';
import { Plus, Search, Edit2, Trash2, Users, RefreshCw, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomerModal from '../components/CustomerModal';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, customer: null });
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await customerAPI.getAll(search || undefined);
      setCustomers(r.data.data || []);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"?`)) return;
    setDeleting(id);
    try {
      await customerAPI.delete(id);
      toast.success('Customer deleted');
      load();
    } catch {
      toast.error('Failed to delete customer');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{customers.length} registered customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true, customer: null })}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="search-bar" style={{ flex: 1, maxWidth: 360 }}>
          <Search size={16} />
          <input placeholder="Search by name, email, phone…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-ghost btn-icon" onClick={load} title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <h3>No customers yet</h3>
              <p>Add customers to link them to bills</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal({ open: true, customer: null })}>
                <Plus size={16} /> Add Customer
              </button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>GST Number</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: 'var(--primary-light)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--primary)', fontWeight: 700, fontSize: 13, flexShrink: 0,
                        }}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {c.email && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}><Mail size={12} color="var(--text-muted)" />{c.email}</div>}
                        {c.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}><Phone size={12} color="var(--text-muted)" />{c.phone}</div>}
                        {!c.email && !c.phone && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>}
                      </div>
                    </td>
                    <td><span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.address || '—'}</span></td>
                    <td>
                      {c.gstNumber
                        ? <span style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 4 }}>{c.gstNumber}</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal({ open: true, customer: c })}><Edit2 size={14} /></button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(c.id, c.name)} disabled={deleting === c.id}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CustomerModal
        open={modal.open}
        customer={modal.customer}
        onClose={() => setModal({ open: false, customer: null })}
        onSave={load}
      />
    </div>
  );
}
