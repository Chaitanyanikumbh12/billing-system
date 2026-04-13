import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Receipt, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const result = await register(form.name, form.email, form.password);
    if (!result.success) toast.error(result.message);
  };

  const Field = ({ name, label, type = 'text', icon: Icon, placeholder, extra }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          className={`form-input ${errors[name] ? 'error' : ''}`}
          style={{ paddingLeft: 36, ...(extra ? { paddingRight: 40 } : {}) }}
          type={name === 'password' || name === 'confirm' ? (showPw ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={form[name]}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        />
        {extra}
      </div>
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  );

  const eyeBtn = (
    <button
      type="button"
      onClick={() => setShowPw(s => !s)}
      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
    >
      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <Receipt size={28} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800 }}>Create Account</h1>
          <p style={{ color: '#a5b4fc', fontSize: 14, marginTop: 4 }}>Start managing your billing today</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: '32px 28px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field name="name" label="Full Name" icon={User} placeholder="John Doe" />
            <Field name="email" label="Email Address" type="email" icon={Mail} placeholder="you@example.com" />
            <Field name="password" label="Password" icon={Lock} placeholder="Min 6 characters" extra={eyeBtn} />
            <Field name="confirm" label="Confirm Password" icon={Lock} placeholder="Repeat password" />

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ justifyContent: 'center', marginTop: 4, background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}
            >
              {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating…</> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
