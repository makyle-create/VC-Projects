import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';
import { catOf, fmt } from '../components/OppCard';
import { Empty, Skeletons, Stat } from '../components/ui';

const GOAL = 40;
export default function MyActivities() {
  const [d, setD] = useState(null); const [tab, setTab] = useState('joined');
  useEffect(() => { api.get('/me/signups').then((r) => setD(r.data)); }, []);
  if (!d) return <><h1>My activities and hours</h1><Skeletons n={3} /></>;
  const T = d.totals; const list = d.data.filter((s) => s.status === tab);
  const pct = Math.min(100, (T.hours / GOAL) * 100);
  return (
    <>
      <div className="page-head"><div><h1>My activities and hours</h1><p className="mut">Everything you've joined and completed.</p></div></div>
      <div className="stats">
        <Stat n={d.data.length} label="Joined and completed" icon="list" />
        <Stat n={T.hours} label="Volunteer hours" icon="clock" />
        <Stat n={T.completed} label="Completed" icon="check" tone="b" />
        <Stat n={T.upcoming} label="Upcoming" icon="calendar" tone="a" />
      </div>
      <div className="two">
        <div>
          <div className="seg" role="tablist">
            {[['joined', `Upcoming (${T.upcoming})`], ['completed', `Completed (${T.completed})`]].map(([t, l]) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{l}</button>)}
          </div>
          <div className="stack">
            {list.map((s) => { const c = catOf(s.opportunity.category); return (
              <div key={s.id} className="card act-item" style={{ '--h': c.h }}>
                <div className="opp-ico"><Icon name={c.icon} /></div>
                <div className="grow">
                  <b>{s.opportunity.title}</b>
                  <div className="mut small">{s.opportunity.organization?.name} · {fmt(s.opportunity.date)}{s.status === 'completed' && ` · ${s.hours} hrs`}</div>
                </div>
                <Link className="btn g s" to={`/opportunities/${s.opportunity_id}`}>Details</Link>
              </div>); })}
            {!list.length && (tab === 'joined'
              ? <Empty icon="calendar" title="No upcoming activities" text="Sign up for an opportunity to see it here." to="/opportunities" cta="Browse opportunities" />
              : <Empty icon="check" title="No completed activities yet" text="Hours appear once an organization confirms your attendance." />)}
          </div>
        </div>
        <aside className="card center-t">
          <h3>Progress to {GOAL} hours</h3>
          <div className="ring" style={{ '--p': pct }} role="img" aria-label={`${T.hours} of ${GOAL} hours`}><i><span>{T.hours}<small>of {GOAL} hrs</small></span></i></div>
          <p className="mut small">{T.hours >= GOAL ? 'Goal reached. Amazing work!' : `${GOAL - T.hours} more hour${GOAL - T.hours === 1 ? '' : 's'} to go. Every hour counts.`}</p>
          <Link className="btn full" to="/reports">View volunteer report</Link>
        </aside>
      </div>
    </>
  );
}
