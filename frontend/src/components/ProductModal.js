import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { productAPI } from '../api/axios';
import toast from 'react-hot-toast';

const INIT = { name:'', description:'', price:'', stockQuantity:'', category:'', hsnCode:'', taxRate:'18', isActive: true };
const CATS = ['Electronics','Food & Beverages','Clothing','Home & Kitchen','Health & Beauty','Stationery','Automotive','Other'];
const TAX_RATES = [0, 5, 12, 18, 28];

export default function ProductModal({ open, onClose, onSave, product }) {
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        stockQuantity: product.stockQuantity?.toString() || '0',
        category: product.category || '',
        hsnCode: product.hsnCode || '',
        taxRate: product.taxRate?.toString() || '18',
        isActive: product.isActive ?? true,
      });
    } else {
      setForm(INIT);
    }
    setErrors({});
  }, [product, open]);

  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Valid price required';
    if (form.stockQuantity === '' || isNaN(form.stockQuantity) || Number(form.stockQuantity) < 0) e.stockQuantity = 'Valid quantity required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity), taxRate: Number(form.taxRate) };
      if (product) {
        await productAPI.update(product.id, payload);
        toast.success('Product updated');
      } else {
        await productAPI.create(payload);
        toast.success('Product added');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal fade-in">
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add Product'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="e.g. LED Bulb 9W" value={form.name} onChange={e => set('name', e.target.value)} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={2} placeholder="Short description…" value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input className={`form-input ${errors.price ? 'error' : ''}`} type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e => set('price', e.target.value)} />
              {errors.price && <span className="form-error">{errors.price}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Stock Quantity *</label>
              <input className={`form-input ${errors.stockQuantity ? 'error' : ''}`} type="number" min="0" placeholder="0" value={form.stockQuantity} onChange={e => set('stockQuantity', e.target.value)} />
              {errors.stockQuantity && <span className="form-error">{errors.stockQuantity}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select category</option>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">GST Rate (%)</label>
              <select className="form-input form-select" value={form.taxRate} onChange={e => set('taxRate', e.target.value)}>
                {TAX_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">HSN Code</label>
            <input className="form-input" placeholder="e.g. 8539" value={form.hsnCode} onChange={e => set('hsnCode', e.target.value)} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
            Active product (visible in billing)
          </label>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : product ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
