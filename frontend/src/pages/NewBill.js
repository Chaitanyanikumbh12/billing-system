import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, customerAPI, billAPI } from '../api/axios';
import { Plus, Trash2, Search, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const PAY_METHODS = ['CASH','UPI','CARD','BANK_TRANSFER','CHEQUE'];
const GST_TYPES = [{ value:'CGST_SGST', label:'CGST + SGST (Intra-state)' }, { value:'IGST', label:'IGST (Inter-state)' }];

export default function NewBill() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [discount, setDiscount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [gstType, setGstType] = useState('CGST_SGST');
  const [notes, setNotes] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductDrop, setShowProductDrop] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    productAPI.getAll().then(r => setProducts(r.data.data || [])).catch(() => {});
    customerAPI.getAll().then(r => setCustomers(r.data.data || [])).catch(() => {});
  }, []);

  // Filter products by search
  const filteredProducts = products.filter(p =>
    !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addItem = (product) => {
    const exists = items.find(i => i.productId === product.id);
    if (exists) {
      setItems(items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        taxRate: product.taxRate,
        quantity: 1,
        hsnCode: product.hsnCode,
      }]);
    }
    setProductSearch('');
    setShowProductDrop(false);
  };

  const updateItem = (idx, field, val) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  };

  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  // Live calculations
  const calcItem = (item) => {
    const subtotal = Number(item.unitPrice) * Number(item.quantity);
    const taxAmount = subtotal * (Number(item.taxRate) / 100);
    return { subtotal, taxAmount, total: subtotal + taxAmount };
  };

  const subtotal = items.reduce((s, item) => s + calcItem(item).subtotal, 0);
  const totalTax = items.reduce((s, item) => s + calcItem(item).taxAmount, 0);
  const disc = Number(discount) || 0;
  const grandTotal = subtotal + totalTax - disc;

  const cgst = gstType === 'CGST_SGST' ? totalTax / 2 : 0;
  const sgst = gstType === 'CGST_SGST' ? totalTax / 2 : 0;
  const igst = gstType === 'IGST' ? totalTax : 0;

  const fmt = n => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const handleSubmit = async () => {
    if (items.length === 0) { toast.error('Add at least one product'); return; }
    setSaving(true);
    try {
      const payload = {
        customerId: customerId || null,
        items: items.map(i => ({ productId: i.productId, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
        discount: disc,
        paymentMethod: payMethod,
        gstType,
        notes,
      };
      const r = await billAPI.create(payload);
      toast.success('Bill created successfully!');
      navigate(`/bills/${r.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create bill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Bill</h1>
          <p className="page-subtitle">Create a new invoice with automatic GST calculation</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/bills')}>Cancel</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        {/* Left — items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Customer + options */}
          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Bill Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Customer (optional)</label>
                <select className="form-input form-select" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                  <option value="">Walk-in Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` — ${c.phone}` : ''}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-input form-select" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                  {PAY_METHODS.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row" style={{ marginTop: 12 }}>
              <div className="form-group">
                <label className="form-label">GST Type</label>
                <select className="form-input form-select" value={gstType} onChange={e => setGstType(e.target.value)}>
                  {GST_TYPES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Discount (₹)</label>
                <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00" value={discount} onChange={e => setDiscount(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Add products */}
          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Add Products</h3>
            <div style={{ position: 'relative' }}>
              <div className="search-bar">
                <Search size={16} />
                <input
                  placeholder="Search and add products…"
                  value={productSearch}
                  onChange={e => { setProductSearch(e.target.value); setShowProductDrop(true); }}
                  onFocus={() => setShowProductDrop(true)}
                />
              </div>
              {showProductDrop && productSearch && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
                  background: '#fff', border: '1px solid var(--border)',
                  borderRadius: 8, boxShadow: 'var(--shadow-md)',
                  maxHeight: 220, overflowY: 'auto', marginTop: 4,
                }}>
                  {filteredProducts.length === 0 ? (
                    <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 13 }}>No products found</div>
                  ) : filteredProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => addItem(p)}
                      style={{
                        padding: '10px 16px', cursor: 'pointer', fontSize: 14,
                        display: 'flex', justifyContent: 'space-between',
                        borderBottom: '1px solid var(--border)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      <div>
                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Stock: {p.stockQuantity} · GST: {p.taxRate}%</div>
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{p.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Items table */}
            {items.length > 0 && (
              <div className="table-wrap" style={{ marginTop: 16 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style={{ width: 100 }}>Price (₹)</th>
                      <th style={{ width: 80 }}>Qty</th>
                      <th style={{ width: 60 }}>GST%</th>
                      <th style={{ width: 110 }}>Total</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const { subtotal: iSub, taxAmount, total } = calcItem(item);
                      return (
                        <tr key={idx}>
                          <td>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>{item.productName}</div>
                            {item.hsnCode && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>HSN: {item.hsnCode}</div>}
                          </td>
                          <td>
                            <input
                              className="form-input"
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                              style={{ padding: '6px 8px', fontSize: 13 }}
                            />
                          </td>
                          <td>
                            <input
                              className="form-input"
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={e => updateItem(idx, 'quantity', e.target.value)}
                              style={{ padding: '6px 8px', fontSize: 13 }}
                            />
                          </td>
                          <td><span className="badge badge-purple">{item.taxRate}%</span></td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{fmt(total)}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{fmt(taxAmount)} tax</div>
                          </td>
                          <td>
                            <button className="btn btn-danger btn-icon btn-sm" onClick={() => removeItem(idx)}>
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {items.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                Search and select products above to add them to the bill
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="card">
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-input" rows={2} placeholder="Any additional notes for this bill…" value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {/* Right — summary */}
        <div style={{ position: 'sticky', top: 0 }}>
          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Bill Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SummaryRow label="Subtotal" value={fmt(subtotal)} />
              {gstType === 'CGST_SGST' ? (
                <>
                  <SummaryRow label="CGST" value={fmt(cgst)} muted />
                  <SummaryRow label="SGST" value={fmt(sgst)} muted />
                </>
              ) : (
                <SummaryRow label="IGST" value={fmt(igst)} muted />
              )}
              {disc > 0 && <SummaryRow label="Discount" value={`−${fmt(disc)}`} color="var(--success)" />}

              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <SummaryRow label="Grand Total" value={fmt(grandTotal)} bold />
              </div>
            </div>

            <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--bg)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              <div>Items: {items.length} | Total Tax: {fmt(totalTax)}</div>
              <div>Payment: {payMethod.replace('_',' ')} | GST: {gstType === 'CGST_SGST' ? 'CGST+SGST' : 'IGST'}</div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: 16, background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}
              onClick={handleSubmit}
              disabled={saving || items.length === 0}
            >
              {saving ? 'Generating…' : '🧾 Generate Bill'}
            </button>
          </div>
        </div>
      </div>

      {/* Close dropdown on outside click */}
      {showProductDrop && <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowProductDrop(false)} />}
    </div>
  );
}

function SummaryRow({ label, value, muted, bold, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 14, color: muted ? 'var(--text-muted)' : 'var(--text)', fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontSize: bold ? 18 : 14, fontWeight: bold ? 700 : 500, color: color || (bold ? 'var(--primary)' : 'var(--text)') }}>{value}</span>
    </div>
  );
}
