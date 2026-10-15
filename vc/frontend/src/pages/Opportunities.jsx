import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import Icon from '../components/Icon';
import OppCard, { CATEGORIES, catOf } from '../components/OppCard';
import { Empty, Skeletons } from '../components/ui';

export default function Opportunities() {
  const { user } = useAuth();
  const [f, setF] = useState({ q: '', category: '', date: '', sort: 'date' });
  const [page, setPage] = useState(1);
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoading(true); setFailed(false);
    // debounce so we don't hit the API on every keystroke
    const t = setTimeout(() => {
      const params = Object.fromEntries(Object.entries({ ...f, page }).filter(([, v]) => v));
      api.get('/opportunities', { params }).then((r) => setRes(r.data)).catch(() => setFailed(true)).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [f, page]);

  const upd = (k, v) => { setPage(1); setF({ ...f, [k]: v }); };
  const dirty = f.q || f.category || f.date;
  return (
    <>
      <section className="hero">
        <h1>Find a way to <span>give back</span> this week.</h1>
        <p>Browse community events from local organizations, sign up in a click, and watch your volunteer hours add up.</p>
        <div className="search">
          <Icon name="search" />
          <input placeholder="Search by title, place, or keyword" aria-label="Search" value={f.q} onChange={(e) => upd('q', e.target.value)} />
        </div>
        {!user && <div className="row" style={{ marginTop: 16 }}><Link className="btn lg" style={{ background: 'var(--acc)', color: '#2e2200' }} to="/register">Become a volunteer</Link></div>}
        {res && <div className="hero-stats"><div><b>{res.total}</b><span>open opportunities</span></div><div><b>{CATEGORIES.length}</b><span>causes to support</span></div></div>}
      </section>

      <div className="chips" role="group" aria-label="Filter by category">
        <button className={`fchip ${f.category ? '' : 'on'}`} onClick={() => upd('category', '')}>All</button>
        {CATEGORIES.map((c) => <button key={c} className={`fchip ${f.category === c ? 'on' : ''}`} aria-pressed={f.category === c} onClick={() => upd('category', f.category === c ? '' : c)}><Icon name={catOf(c).icon} />{c}</button>)}
      </div>
      <div className="toolbar">
        <div className="field"><input type="date" aria-label="On or after date" value={f.date} onChange={(e) => upd('date', e.target.value)} /></div>
        <div className="field"><select aria-label="Sort" value={f.sort} onChange={(e) => upd('sort', e.target.value)}>
          <option value="date">Soonest first</option><option value="newest">Newest posted</option><option value="title">Title A to Z</option>
        </select></div>
        {dirty && <button className="link" onClick={() => { setPage(1); setF({ q: '', category: '', date: '', sort: f.sort }); }}>Clear filters</button>}
        {res && <span className="count">{res.total} result{res.total === 1 ? '' : 's'}</span>}
      </div>

      {failed ? <Empty icon="activity" title="Couldn't load opportunities" text="The server may be waking up (free hosting sleeps). Give it a few seconds and try again." />
        : loading && !res ? <Skeletons />
        : res?.data.length === 0 ? <Empty icon="search" title="No matches found" text="Try a different keyword or clear a filter." />
        : <div className="grid" style={{ opacity: loading ? .6 : 1, transition: 'opacity .2s' }}>{res?.data.map((o) => <OppCard key={o.id} o={o} />)}</div>}

      {res && res.last_page > 1 && (
        <nav className="pager" aria-label="Pagination">
          <button className="btn g s" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
          {Array.from({ length: res.last_page }, (_, i) => (
            <button key={i} className={`btn s ${page === i + 1 ? '' : 'g'}`} aria-current={page === i + 1 ? 'page' : undefined} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button className="btn g s" disabled={page === res.last_page} onClick={() => setPage(page + 1)}>Next</button>
        </nav>
      )}
    </>
  );
}
