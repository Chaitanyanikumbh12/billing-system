import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { customerAPI } from '../api/axios';
import toast from 'react-hot-toast';

const INIT = { name: '', email: '', phone: '', address: '', gstNumber: '' };

export default function CustomerModal({ open, onClose, onSave, customer }) {
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(customer ? {
      name: customer.name || '', email: customer.email || '',
      phone: customer.phone || '', address: customer.address || '',
      gstNumber: customer.gstNumber || '',
    } : INIT);
    setErrors({});
  }, [customer, open]);

  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (customer) {
        await customerAPI.update(customer.id, form);
        toast.success('Customer updated');
      } else {
        await customerAPI.create(form);
        toast.success('Customer added');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal fade-in">
        <div className="modal-header">
          <h2>{customer ? 'Edit Customer' : 'Add Customer'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Customer name" value={form.name} onChange={e => set('name', e.target.value)} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className={`form-input ${errors.email ? 'error' : ''}`} type="email" placeholder="email@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-input" rows={2} placeholder="Full address…" value={form.address} onChange={e => set('address', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group">
            <label className="form-label">GST Number</label>
            <input className="form-input" placeholder="e.g. 27AAPFU0939F1ZV" value={form.gstNumber} onChange={e => set('gstNumber', e.target.value.toUpperCase())} maxLength={15} style={{ fontFamily: 'monospace', letterSpacing: 1 }} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : customer ? 'Update Customer' : 'Add Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}
