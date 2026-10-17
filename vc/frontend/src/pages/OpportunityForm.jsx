
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { fieldErrors, errMsg } from '../api';
import { useToast } from '../Toast';
import Icon from '../components/Icon';
import { CATEGORIES, catOf } from '../components/OppCard';

const empty = {
  title: '',
  category: 'Environment',
  date: '',
  start_time: '',
  end_time: '',
  hours: '',
  slots: '',
  skills: '',
  location: '',
  description: '',
  requirements: ''
};

function calculateHours(start, end) {
  if (!start || !end) return '';
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const minutes = endH * 60 + endM - (startH * 60 + startM);

  if (minutes <= 0) return '';
  return Math.ceil(minutes / 60);
}

function Input({ k, label, f, setF, errors, type = 'text', ph, hint, readOnly = false }) {
  return (
    <div>
      <label htmlFor={k}>{label}</label>
      <input
        id={k}
        type={type}
        placeholder={ph}
        min={type === 'number' ? 1 : undefined}
        readOnly={readOnly}
        className={errors[k] ? 'invalid' : ''}
        aria-invalid={!!errors[k]}
        value={f[k] ?? ''}
        onChange={(e) => setF({ ...f, [k]: e.target.value })}
      />
      {hint && !errors[k] && (
        <div className="mut small" style={{ marginTop: 4 }}>{hint}</div>
      )}
      {errors[k] && <div className="er" role="alert">{errors[k]}</div>}
    </div>
  );
}

export default function OpportunityForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();

  const [f, setF] = useState(empty);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;

    api.get(`/opportunities/${id}`).then((r) => {
      setF({
        ...empty,
        ...r.data,
        start_time: r.data.start_time?.slice(0, 5) || '',
        end_time: r.data.end_time?.slice(0, 5) || '',
        requirements: r.data.requirements || '',
        skills: r.data.skills || ''
      });
    }).catch(() => {
      toast('Could not load this opportunity.', 'err');
    });
  }, [id]);

  const updateTime = (key, value) => {
    const updated = { ...f, [key]: value };
    updated.hours = calculateHours(updated.start_time, updated.end_time);
    setF(updated);
  };

  const save = async (status) => {
    setBusy(true);
    setErrors({});
    setMsg('');

    try {
      const body = {
        ...f,
        hours: calculateHours(f.start_time, f.end_time),
        status
      };

      id
        ? await api.put(`/opportunities/${id}`, body)
        : await api.post('/opportunities', body);

      toast(status === 'draft' ? 'Saved as draft.' : id ? 'Changes saved.' : 'Opportunity posted!');
      nav('/');
    } catch (e) {
      setErrors(fieldErrors(e));
      setMsg(
        e.response?.status === 422
          ? 'Please fix the highlighted fields.'
          : errMsg(e)
      );
    } finally {
      setBusy(false);
    }
  };

  const p = { f, setF, errors };

  return (
    <>
      <Link className="back" to="/">
        <Icon name="back" />Back to dashboard
      </Link>

      <div className="page-head">
        <div>
          <h1>{id ? 'Edit' : 'Create new'} opportunity</h1>
          <p className="mut">Give volunteers everything they need to decide.</p>
        </div>
      </div>

      <form
        className="card"
        style={{ maxWidth: 760 }}
        onSubmit={(e) => {
          e.preventDefault();
          save('active');
        }}
      >
        <div className="fieldset">
          <h3>The basics</h3>
          <Input k="title" label="Opportunity title" ph="e.g. Coastal Cleanup Day" {...p} />

          <label htmlFor="category">Category</label>
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <span
              className="opp-ico"
              style={{
                '--h': catOf(f.category).h,
                '--c': `hsl(${catOf(f.category).h} 55% 40%)`,
                width: 42,
                height: 42,
                borderRadius: 11,
                background: 'var(--c)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                flex: 'none'
              }}
            >
              <Icon name={catOf(f.category).icon} />
            </span>
            <select
              id="category"
              value={f.category}
              onChange={(e) => setF({ ...f, category: e.target.value })}
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="fieldset">
          <h3>When, where and how many</h3>

          <div className="form-grid">
            <Input k="date" label="Event date" type="date" {...p} />

            <div>
              <label htmlFor="start_time">Start time</label>
              <input
                id="start_time"
                type="time"
                value={f.start_time}
                className={errors.start_time ? 'invalid' : ''}
                aria-invalid={!!errors.start_time}
                onChange={(e) => updateTime('start_time', e.target.value)}
              />
              {errors.start_time && <div className="er" role="alert">{errors.start_time}</div>}
            </div>

            <div>
              <label htmlFor="end_time">End time</label>
              <input
                id="end_time"
                type="time"
                value={f.end_time}
                className={errors.end_time ? 'invalid' : ''}
                aria-invalid={!!errors.end_time}
                onChange={(e) => updateTime('end_time', e.target.value)}
              />
              {errors.end_time && <div className="er" role="alert">{errors.end_time}</div>}
            </div>

            <Input
              k="hours"
              label="Estimated hours"
              type="number"
              {...p}
              readOnly
              hint="Calculated from the start and end times, rounded up to whole hours."
            />

            <Input k="slots" label="Slots available" type="number" ph="50" {...p} />
          </div>

          <Input k="location" label="Location" ph="e.g. Manila Bay, Roxas Blvd." {...p} />
        </div>

        <div className="fieldset">
          <h3>Details</h3>

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows="4"
            className={errors.description ? 'invalid' : ''}
            value={f.description}
            onChange={(e) => setF({ ...f, description: e.target.value })}
            placeholder="What will volunteers do, and why does it matter?"
          />
          <div className="row sp">
            {errors.description
              ? <div className="er" role="alert">{errors.description}</div>
              : <span />}
            <span className="mut small">{f.description.length} characters (min 10)</span>
          </div>

          <Input k="skills" label="Skills needed (optional)" ph="e.g. Teamwork" {...p} />

          <label htmlFor="requirements">Requirements (optional)</label>
          <textarea
            id="requirements"
            rows="3"
            value={f.requirements}
            onChange={(e) => setF({ ...f, requirements: e.target.value })}
            placeholder={'One per line, e.g.\nWear closed shoes\nBring a water bottle'}
          />
        </div>

        {msg && <div className="alert" role="alert">{msg}</div>}

        <div className="row sp fieldset">
          <Link className="btn g" to="/">Cancel</Link>
          <div className="row">
            <button
              type="button"
              className="btn g"
              disabled={busy}
              onClick={() => save('draft')}
            >
              Save as draft
            </button>
            <button className="btn" disabled={busy}>
              {busy ? 'Saving…' : id ? 'Save changes' : 'Post opportunity'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
