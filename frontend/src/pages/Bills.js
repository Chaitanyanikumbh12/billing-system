import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { billAPI } from '../api/axios';
import { Plus, FileText, Eye, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const PAY_BADGE = {
  CASH: 'badge-green', UPI: 'badge-blue', CARD: 'badge-purple',
  BANK_TRANSFER: 'badge-yellow', CHEQUE: 'badge-red',
};

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    billAPI.getAll()
      .then(r => setBills(r.data.data || []))
      .catch(() => toast.error('Failed to load bills'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bills</h1>
          <p className="page-subtitle">{bills.length} total invoices</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-icon" onClick={load}><RefreshCw size={16} /></button>
          <Link to="/bills/new" className="btn btn-primary"><Plus size={16} /> New Bill</Link>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : bills.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <h3>No bills yet</h3>
              <p>Create your first bill to get started</p>
              <Link to="/bills/new" className="btn btn-primary" style={{ marginTop: 16 }}>
                <Plus size={16} /> New Bill
              </Link>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Bill No.</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                  <tr key={bill.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)', fontSize: 13 }}>
                        {bill.billNumber}
                      </span>
                    </td>
                    <td><span style={{ fontSize: 13 }}>{fmtDate(bill.createdAt)}</span></td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{bill.customer?.name || 'Walk-in Customer'}</div>
                      {bill.customer?.phone && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{bill.customer.phone}</div>}
                    </td>
                    <td><span style={{ fontSize: 13 }}>{bill.items?.length || 0} item(s)</span></td>
                    <td><span style={{ fontSize: 13 }}>{fmt(bill.subtotal)}</span></td>
                    <td>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{fmt(bill.totalTax)}</span>
                    </td>
                    <td><span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>{fmt(bill.totalAmount)}</span></td>
                    <td>
                      <span className={`badge ${PAY_BADGE[bill.paymentMethod] || 'badge-blue'}`}>
                        {bill.paymentMethod?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${bill.status === 'PAID' ? 'badge-green' : 'badge-yellow'}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/bills/${bill.id}`} className="btn btn-secondary btn-sm btn-icon" title="View">
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
