import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { fieldErrors, errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../Toast';
import Icon from '../components/Icon';
import { Stat } from '../components/ui';

const initialsOf = (n = '') => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

function Field({ k, label, form, set, errors, type = 'text', ph, auto }) {
  return (
    <div>
      <label htmlFor={k}>{label}</label>
      <input id={k} type={type} placeholder={ph} autoComplete={auto} className={errors[k] ? 'invalid' : ''} aria-invalid={!!errors[k]}
        value={form[k] || ''} onChange={(e) => set({ ...form, [k]: e.target.value })} />
      {errors[k] && <div className="er" role="alert">{errors[k]}</div>}
    </div>
  );
}

export default function Profile() {
  const { user, setUser } = useAuth(); const toast = useToast();
  const org = user.role === 'organization';
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '', location: user.location || '', website: user.website || '', bio: user.bio || '' });
  const [errors, setErrors] = useState({}); const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [pwErrors, setPwErrors] = useState({}); const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    if (user.role === 'admin') return; // admins have no volunteer/organization stats
    const load = org
      ? api.get('/org/opportunities').then((r) => setStats([[r.data.totals.posted, 'Posted opportunities', 'list'], [r.data.totals.volunteers, 'Volunteers', 'users', 'b'], [r.data.totals.hours, 'Volunteer hours', 'clock', 'a']]))
      : api.get('/me/signups').then((r) => setStats([[r.data.totals.hours, 'Total hours', 'clock'], [r.data.totals.completed, 'Completed', 'check', 'b'], [r.data.totals.upcoming, 'Upcoming', 'calendar', 'a']]));
    load.catch(() => setStats(null)); // the stat cards are optional; the form still works
  }, [org, user.role]);

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErrors({});
    try { const { data } = await api.put('/me', form); setUser(data); toast('Profile saved.'); }
    catch (x) { const fe = fieldErrors(x); setErrors(fe); if (!Object.keys(fe).length) toast(errMsg(x), 'err'); }
    finally { setBusy(false); }
  };
  const changePw = async (e) => {
    e.preventDefault(); setPwBusy(true); setPwErrors({});
    try { await api.put('/me/password', pw); setPw({ current_password: '', password: '', password_confirmation: '' }); toast('Password updated.'); }
    catch (x) { const fe = fieldErrors(x); setPwErrors(fe); if (!Object.keys(fe).length) toast(errMsg(x), 'err'); }
    finally { setPwBusy(false); }
  };
  const since = user.created_at ? new Date(user.created_at).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) : null;

  return (
    <>
      <div className="page-head"><div><h1>My profile</h1><p className="mut">{org ? 'This is how volunteers get to know your organization.' : 'Keep your details up to date.'}</p></div></div>
      {stats && <div className="stats">{stats.map(([n, l, ic, tone]) => <Stat key={l} n={n} label={l} icon={ic} tone={tone} />)}</div>}

      <div className="two">
        <div>
          <form className="card" onSubmit={save}>
            <h2>{org ? 'Organization details' : 'Personal details'}</h2>
            <Field k="name" label={org ? 'Organization name' : 'Full name'} auto="name" {...{ form, set: setForm, errors }} />
            <label htmlFor="email">Email</label>
            <input id="email" value={user.email} disabled aria-describedby="email-note" />
            <div id="email-note" className="mut small" style={{ marginTop: 4 }}>Your email is your login and can't be changed here.</div>
            <div className="form-grid">
              <Field k="phone" label="Contact number" type="tel" ph="e.g. 0917 123 4567" auto="tel" {...{ form, set: setForm, errors }} />
              <Field k="location" label="Location" ph="e.g. Manila, Philippines" {...{ form, set: setForm, errors }} />
            </div>
            {org && <Field k="website" label="Website (optional)" type="url" ph="https://example.org" {...{ form, set: setForm, errors }} />}
            <label htmlFor="bio">{org ? 'About our organization' : 'About me'}</label>
            <textarea id="bio" rows="4" maxLength="1000" className={errors.bio ? 'invalid' : ''} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder={org ? 'What does your organization do and who do you help?' : 'Tell organizations a bit about yourself and what you like to help with.'} />
            <div className="row sp">{errors.bio ? <div className="er" role="alert">{errors.bio}</div> : <span />}<span className="mut small">{form.bio.length}/1000</span></div>
            <p style={{ marginTop: 16 }}><button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button></p>
          </form>

          <form className="card" style={{ marginTop: '1.2rem' }} onSubmit={changePw}>
            <h2>Change password</h2>
            <Field k="current_password" label="Current password" type="password" auto="current-password" form={pw} set={setPw} errors={pwErrors} />
            <div className="form-grid">
              <Field k="password" label="New password" type="password" auto="new-password" form={pw} set={setPw} errors={pwErrors} />
              <Field k="password_confirmation" label="Confirm new password" type="password" auto="new-password" form={pw} set={setPw} errors={pwErrors} />
            </div>
            <p style={{ marginTop: 16 }}><button className="btn g" disabled={pwBusy}>{pwBusy ? 'Updating…' : 'Update password'}</button></p>
          </form>
        </div>

        <aside className="card profile-aside">
          <div className="avatar xl" aria-hidden="true">{initialsOf(user.name)}</div>
          <h2>{user.name}</h2>
          <span className="badge pri"><Icon name={org ? 'building' : 'user'} />{org ? 'Organization' : 'Volunteer'}</span>
          <div className="meta">
            <div><Icon name="user" />{user.email}</div>
            {user.phone && <div><Icon name="activity" />{user.phone}</div>}
            {user.location && <div><Icon name="pin" />{user.location}</div>}
            {since && <div><Icon name="calendar" />Member since {since}</div>}
          </div>
          {user.bio && <p className="bio">{user.bio}</p>}
          <Link className="btn g full" to={org ? '/post' : '/activities'}>{org ? 'Post an opportunity' : 'View my activities'}</Link>
        </aside>
      </div>
    </>
  );
}