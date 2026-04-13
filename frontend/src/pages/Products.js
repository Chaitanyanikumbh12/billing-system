import React, { useEffect, useState, useCallback } from 'react';
import { productAPI } from '../api/axios';
import { Plus, Search, Edit2, Trash2, Package, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductModal from '../components/ProductModal';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, product: null });
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await productAPI.getAll(search || undefined);
      setProducts(r.data.data || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This will mark it inactive.`)) return;
    setDeleting(id);
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      load();
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const fmt = n => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product catalogue</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true, product: null })}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="search-bar" style={{ flex: 1, maxWidth: 360 }}>
          <Search size={16} />
          <input placeholder="Search by name or category…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-ghost btn-icon" onClick={load} title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <h3>No products found</h3>
              <p>Add your first product to get started</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal({ open: true, product: null })}>
                <Plus size={16} /> Add Product
              </button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>HSN</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>GST</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                      {p.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.description.substring(0, 50)}{p.description.length > 50 ? '…' : ''}</div>}
                    </td>
                    <td><span style={{ fontSize: 13 }}>{p.category || '—'}</span></td>
                    <td><span style={{ fontSize: 13, fontFamily: 'monospace' }}>{p.hsnCode || '—'}</span></td>
                    <td><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{fmt(p.price)}</span></td>
                    <td>
                      <span style={{
                        fontWeight: 600,
                        color: p.stockQuantity <= 5 ? 'var(--danger)' : p.stockQuantity <= 15 ? 'var(--warning)' : 'var(--success)',
                      }}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td><span className="badge badge-purple">{p.taxRate}%</span></td>
                    <td>
                      <span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal({ open: true, product: p })} title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deleting === p.id}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ProductModal
        open={modal.open}
        product={modal.product}
        onClose={() => setModal({ open: false, product: null })}
        onSave={load}
      />
    </div>
  );
}
