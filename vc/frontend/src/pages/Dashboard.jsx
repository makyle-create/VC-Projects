import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../Toast';
import Icon from '../components/Icon';
import OppCard, { fmt } from '../components/OppCard';
import { Empty, Skeletons, Stat, StatusBadge } from '../components/ui';

export default function Dashboard() {
  const { user } = useAuth();
  return user.role === 'organization' ? <OrgDashboard /> : <VolunteerDashboard user={user} />;
}

const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

function VolunteerDashboard({ user }) {
  const [d, setD] = useState(null);
  useEffect(() => { api.get('/me/signups').then((r) => setD(r.data)); }, []);
  const up = d?.data.filter((s) => s.status === 'joined') || [];
  return (
    <>
      <div className="page-head">
        <div><h1>{greet()}, {user.name.split(' ')[0]}</h1><p className="mut">Here is your volunteering overview.</p></div>
        <Link className="btn" to="/opportunities"><Icon name="search" />Find opportunities</Link>
      </div>
      {!d ? <Skeletons n={3} /> : <>
        <div className="stats">
          <Stat n={d.totals.hours} label="Total hours" icon="clock" />
          <Stat n={d.totals.completed} label="Completed activities" icon="check" tone="b" />
          <Stat n={d.totals.upcoming} label="Upcoming activities" icon="calendar" tone="a" />
        </div>
        <div className="sec-head"><h2>Upcoming opportunities</h2><Link to="/activities">View all activity</Link></div>
        {up.length ? <div className="grid">{up.map((s) => <OppCard key={s.id} o={s.opportunity} />)}</div>
          : <Empty icon="calendar" title="Nothing scheduled yet" text="Pick something that fits your schedule and sign up in a click." to="/opportunities" cta="Browse opportunities" />}
      </>}
    </>
  );
}

function OrgDashboard() {
  const toast = useToast();
  const [d, setD] = useState(null);
  const load = () => api.get('/org/opportunities').then((r) => setD(r.data));
  useEffect(() => { load(); }, []);
  const del = async (o) => {
    if (!confirm(`Delete "${o.title}" and its sign-ups? This can't be undone.`)) return;
    try { await api.delete(`/opportunities/${o.id}`); toast('Opportunity deleted.'); load(); } catch (e) { toast(errMsg(e), 'err'); }
  };
  const done = async (id) => { try { await api.post(`/signups/${id}/complete`); toast('Hours confirmed.'); load(); } catch (e) { toast(errMsg(e), 'err'); } };
  if (!d) return <><h1>Organization dashboard</h1><Skeletons n={3} /></>;
  const t = d.totals;
  return (
    <>
      <div className="page-head">
        <div><h1>Organization dashboard</h1><p className="mut">Manage your posted opportunities and volunteers.</p></div>
        <Link className="btn" to="/post"><Icon name="plus" />Post new opportunity</Link>
      </div>
      <div className="stats">
        <Stat n={t.posted} label="Posted opportunities" icon="list" />
        <Stat n={t.volunteers} label="Total volunteers" icon="users" tone="b" />
        <Stat n={t.hours} label="Volunteer hours" icon="clock" />
        <Stat n={t.pending} label="Pending confirmations" icon="activity" tone="a" />
      </div>

      <div className="sec-head"><h2>Posted opportunities</h2></div>
      {d.opportunities.length ? (
        <div className="card tw"><table>
          <thead><tr><th>Title</th><th>Date</th><th>Slots</th><th>Status</th><th><span className="sr">Actions</span></th></tr></thead>
          <tbody>{d.opportunities.map((o) => (
            <tr key={o.id}>
              <td><Link to={`/opportunities/${o.id}`} style={{ fontWeight: 700, color: 'var(--ink)', textDecoration: 'none' }}>{o.title}</Link></td>
              <td>{fmt(o.date)}</td><td>{o.signups_count}/{o.slots}</td><td><StatusBadge o={o} /></td>
              <td className="act"><div className="row" style={{ justifyContent: 'flex-end' }}>
                <Link className="btn g s" to={`/edit/${o.id}`}><Icon name="edit" />Edit</Link>
                <button className="btn d s" onClick={() => del(o)} aria-label={`Delete ${o.title}`}><Icon name="trash" /></button>
              </div></td>
            </tr>
          ))}</tbody></table></div>
      ) : <Empty icon="plus" title="No opportunities yet" text="Post your first event and volunteers can start signing up." to="/post" cta="Post an opportunity" />}

      <div className="sec-head"><h2>Volunteer sign-ups</h2></div>
      {d.signups.length ? (
        <div className="card tw"><table>
          <thead><tr><th>Volunteer</th><th>Opportunity</th><th>Status</th><th><span className="sr">Action</span></th></tr></thead>
          <tbody>{d.signups.map((s) => (
            <tr key={s.id}>
              <td><b>{s.user.name}</b></td><td>{s.opportunity.title}</td>
              <td>{s.status === 'completed' ? <span className="badge ok"><Icon name="check" />Completed · {s.hours} hrs</span> : <span className="badge warn">Awaiting confirmation</span>}</td>
              <td className="act" style={{ textAlign: 'right' }}>{s.status === 'joined' && <button className="btn s" onClick={() => done(s.id)}>Confirm hours</button>}</td>
            </tr>
          ))}</tbody></table></div>
      ) : <Empty icon="users" title="No sign-ups yet" text="Volunteers who join your events will appear here." />}
    </>
  );
}
