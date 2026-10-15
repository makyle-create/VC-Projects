import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { fieldErrors, errMsg } from '../api';
import Icon from '../components/Icon';
import { Logo } from '../components/Layout';

function Shell({ title, sub, children }) {
  return (
    <div className="split">
      <section className="pane">
        <Logo to="/opportunities" />
        <h1>Small hours. <span>Big impact.</span></h1>
        <p>Bridging community needs with the people ready to help.</p>
        <ul className="perks">
          <li><span className="dot"><Icon name="search" /></span>Discover opportunities near you</li>
          <li><span className="dot"><Icon name="clock" /></span>Track every volunteer hour</li>
          <li><span className="dot"><Icon name="users" /></span>Organizations manage sign-ups in one place</li>
        </ul>
      </section>
      <section className="form"><h2>{title}</h2><p className="mut">{sub}</p>{children}</section>
    </div>
  );
}

function Field({ label, name, type = 'text', form, set, errors, auto }) {
  const [show, setShow] = useState(false);
  const pw = type === 'password';
  return (
    <>
      <label htmlFor={name}>{label}</label>
      <div className={pw ? 'pw' : ''}>
        <input id={name} type={pw && show ? 'text' : type} autoComplete={auto} className={errors[name] ? 'invalid' : ''}
          aria-invalid={!!errors[name]} value={form[name] || ''} onChange={(e) => set({ ...form, [name]: e.target.value })} />
        {pw && <button type="button" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>}
      </div>
      {errors[name] && <div className="er" role="alert">{errors[name]}</div>}
    </>
  );
}

export function Login() {
  const { user, login } = useAuth(); const nav = useNavigate(); const from = useLocation().state?.from || '/';
  const [form, set] = useState({ email: '', password: '' }); const [errors, setErrors] = useState({}); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={from} replace />;
  const go = async (email, password) => {
    setBusy(true); setErrors({});
    try { await login(email, password); nav(from, { replace: true }); }
    catch (x) { setErrors(x.response?.data?.errors ? fieldErrors(x) : { email: errMsg(x) }); }
    finally { setBusy(false); }
  };
  return (
    <Shell title="Welcome back" sub="Log in to find and track your volunteering.">
      <form onSubmit={(e) => { e.preventDefault(); go(form.email, form.password); }}>
        <Field label="Email" name="email" type="email" auto="email" {...{ form, set, errors }} />
        <Field label="Password" name="password" type="password" auto="current-password" {...{ form, set, errors }} />
        <p style={{ marginTop: 18 }}><button className="btn full lg" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button></p>
      </form>
      <p className="mut">New here? <Link to="/register">Create an account</Link></p>
      <div className="demo">
        <p>Just exploring? Try a demo account</p>
        <div className="row">
          <button type="button" className="btn g s" disabled={busy} onClick={() => go('volunteer@demo.com', 'password123')}><Icon name="user" />Volunteer</button>
          <button type="button" className="btn g s" disabled={busy} onClick={() => go('org@demo.com', 'password123')}><Icon name="building" />Organization</button>
        </div>
      </div>
    </Shell>
  );
}

export function Register() {
  const { register } = useAuth(); const nav = useNavigate();
  const [form, set] = useState({ role: 'volunteer', name: '', email: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({}); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setMsg('');
    try { await register(form); nav('/'); }
    catch (x) { const fe = fieldErrors(x); setErrors(fe); if (!Object.keys(fe).length) setMsg(errMsg(x)); }
    finally { setBusy(false); }
  };
  const org = form.role === 'organization';
  return (
    <Shell title="Create your account" sub="Join our community and start making an impact.">
      <div className="tabs" role="tablist">
        {[['volunteer', 'Volunteer', 'user'], ['organization', 'Organization', 'building']].map(([r, t, ic]) => (
          <button key={r} type="button" role="tab" aria-selected={form.role === r} className={form.role === r ? 'on' : ''} onClick={() => set({ ...form, role: r })}><Icon name={ic} />{t}</button>
        ))}
      </div>
      <form onSubmit={submit}>
        <Field label={org ? 'Organization name' : 'Full name'} name="name" auto="name" {...{ form, set, errors }} />
        <Field label="Email" name="email" type="email" auto="email" {...{ form, set, errors }} />
        <Field label="Password" name="password" type="password" auto="new-password" {...{ form, set, errors }} />
        <Field label="Confirm password" name="password_confirmation" type="password" auto="new-password" {...{ form, set, errors }} />
        {msg && <div className="alert" role="alert">{msg}</div>}
        <p style={{ marginTop: 18 }}><button className="btn full lg" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button></p>
      </form>
      <p className="mut">Have an account? <Link to="/login">Log in</Link></p>
    </Shell>
  );
}
