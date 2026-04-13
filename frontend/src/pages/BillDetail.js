import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { billAPI } from '../api/axios';
import { ArrowLeft, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

export default function BillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billAPI.getById(id)
      .then(r => setBill(r.data.data))
      .catch(() => { toast.error('Bill not found'); navigate('/bills'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!bill) return null;

  return (
    <div>
      {/* Toolbar — hidden on print */}
      <div className="page-header" style={{ marginBottom: 20 }} id="no-print">
        <button className="btn btn-ghost" onClick={() => navigate('/bills')}>
          <ArrowLeft size={16} /> Back to Bills
        </button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Printer size={16} /> Print Invoice
        </button>
      </div>

      {/* Invoice card */}
      <div className="card print-area" id="invoice" style={{ maxWidth: 800, margin: '0 auto', padding: 40 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1e1b4b', letterSpacing: -0.5 }}>BillEase</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Professional Billing System</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>INVOICE</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 15, marginTop: 4 }}>{bill.billNumber}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{fmtDate(bill.createdAt)}</div>
          </div>
        </div>

        {/* Bill To + Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Bill To</div>
            {bill.customer ? (
              <>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{bill.customer.name}</div>
                {bill.customer.email && <div style={{ fontSize: 13, marginTop: 3 }}>{bill.customer.email}</div>}
                {bill.customer.phone && <div style={{ fontSize: 13, marginTop: 2 }}>{bill.customer.phone}</div>}
                {bill.customer.address && <div style={{ fontSize: 13, marginTop: 2, color: 'var(--text-muted)' }}>{bill.customer.address}</div>}
                {bill.customer.gstNumber && (
                  <div style={{ fontSize: 12, marginTop: 4, fontFamily: 'monospace', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 4, display: 'inline-block' }}>
                    GST: {bill.customer.gstNumber}
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontWeight: 600, fontSize: 15 }}>Walk-in Customer</div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Payment Info</div>
            <InfoRow label="Payment" value={bill.paymentMethod?.replace('_', ' ')} />
            <InfoRow label="GST Type" value={bill.gstType === 'IGST' ? 'IGST' : 'CGST + SGST'} />
            <InfoRow label="Status" value={bill.status} />
            <InfoRow label="Billed by" value={bill.createdBy?.name} />
          </div>
        </div>

        {/* Items table */}
        <div style={{ marginBottom: 24 }}>
          <table style={{ fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#1e1b4b' }}>
                <th style={{ color: '#fff', borderBottom: 'none', padding: '10px 14px' }}>#</th>
                <th style={{ color: '#fff', borderBottom: 'none' }}>Product</th>
                <th style={{ color: '#fff', borderBottom: 'none' }}>HSN</th>
                <th style={{ color: '#fff', borderBottom: 'none', textAlign: 'right' }}>Price</th>
                <th style={{ color: '#fff', borderBottom: 'none', textAlign: 'center' }}>Qty</th>
                <th style={{ color: '#fff', borderBottom: 'none', textAlign: 'right' }}>GST</th>
                <th style={{ color: '#fff', borderBottom: 'none', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {bill.items?.map((item, idx) => (
                <tr key={item.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 500 }}>{item.productName}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{item.hsnCode || '—'}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(item.unitPrice)}</td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{item.taxRate}%<br /><span style={{ fontSize: 11 }}>{fmt(item.taxAmount)}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ minWidth: 280 }}>
            <TotalRow label="Subtotal" value={fmt(bill.subtotal)} />
            {bill.gstType === 'CGST_SGST' ? (
              <>
                <TotalRow label="CGST" value={fmt(bill.cgstAmount)} muted />
                <TotalRow label="SGST" value={fmt(bill.sgstAmount)} muted />
              </>
            ) : (
              <TotalRow label="IGST" value={fmt(bill.igstAmount)} muted />
            )}
            {bill.discount > 0 && <TotalRow label="Discount" value={`−${fmt(bill.discount)}`} color="var(--success)" />}
            <div style={{ borderTop: '2px solid #1e1b4b', marginTop: 8, paddingTop: 10 }}>
              <TotalRow label="Grand Total" value={fmt(bill.totalAmount)} bold />
            </div>
          </div>
        </div>

        {/* Notes */}
        {bill.notes && (
          <div style={{ marginTop: 28, padding: '12px 16px', background: 'var(--bg)', borderRadius: 8, borderLeft: '3px solid var(--primary)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Notes</div>
            <div style={{ fontSize: 13 }}>{bill.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          Generated by BillEase · Thank you for your business!
        </div>
      </div>

      <style>{`
        @media print {
          #no-print { display: none !important; }
          body { background: white; }
          .card { box-shadow: none; border: none; }
        }
      `}</style>
    </div>
  );
}

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 13 }}>
    <span style={{ color: 'var(--text-muted)', minWidth: 72 }}>{label}:</span>
    <span style={{ fontWeight: 500 }}>{value || '—'}</span>
  </div>
);

const TotalRow = ({ label, value, muted, bold, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: bold ? 16 : 14 }}>
    <span style={{ color: muted ? 'var(--text-muted)' : 'var(--text)', fontWeight: bold ? 700 : 400 }}>{label}</span>
    <span style={{ fontWeight: bold ? 800 : 500, color: color || (bold ? '#1e1b4b' : 'var(--text)') }}>{value}</span>
  </div>
);
