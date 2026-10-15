import { Link } from 'react-router-dom';
import Icon from './Icon';
import { useEffect, useState } from 'react';
import { isOpportunitySaved, toggleSavedOpportunity } from '../savedOpportunities';

export const CATEGORIES = ['Community Service', 'Education', 'Health & Wellness', 'Environment', 'Animal Care', 'Food Assistance'];
export const CAT = {
  'Community Service': { h: 170, icon: 'users' },
  Education: { h: 220, icon: 'book' },
  'Health & Wellness': { h: 345, icon: 'activity' },
  Environment: { h: 130, icon: 'leaf' },
  'Animal Care': { h: 28, icon: 'paw' },
  'Food Assistance': { h: 45, icon: 'utensils' },
};
export const catOf = (c) => CAT[c] || { h: 170, icon: 'heart' };
const D = (d) => new Date(d + 'T00:00');
export const fmt = (d) => D(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
export const fmtLong = (d) => D(d).toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

export function Meter({ filled, slots }) {
  const pct = Math.min(100, (filled / slots) * 100);
  const left = slots - filled;
  return (
    <div>
      <div className="slots"><span>{filled}/{slots} filled</span><span className="mut">{left <= 0 ? 'No spots left' : `${left} spot${left === 1 ? '' : 's'} left`}</span></div>
      <div className={`meter ${left <= 0 ? 'full' : left <= 3 ? 'warn' : ''}`} role="progressbar" aria-valuenow={filled} aria-valuemin="0" aria-valuemax={slots}><i style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export default function OppCard({ o }) {
  const c = catOf(o.category); const d = D(o.date);
  const [saved, setSaved] = useState(() => isOpportunitySaved(o.id));
  useEffect(() => {
    const sync = () => setSaved(isOpportunitySaved(o.id));
    window.addEventListener('saved-opportunities-changed', sync);
    return () => window.removeEventListener('saved-opportunities-changed', sync);
  }, [o.id]);
  const toggleSaved = () => setSaved(toggleSavedOpportunity(o));
  return (
    <article className="card opp" style={{ '--h': c.h }}>
      <button type="button" className={`save-opp ${saved ? 'saved' : ''}`} onClick={toggleSaved} aria-label={saved ? `Remove ${o.title} from saved opportunities` : `Save ${o.title}`} aria-pressed={saved} title={saved ? 'Remove from saved' : 'Save opportunity'}><Icon name="bookmark" /></button>
      <div className="opp-top">
        <div className="opp-ico"><Icon name={c.icon} /></div>
        <span className="opp-cat">{o.category}</span>
        <div className="datebox"><b>{d.getDate()}</b><span>{d.toLocaleDateString('en-PH', { month: 'short' })}</span></div>
      </div>
      <div className="opp-body">
        <h3><Link to={`/opportunities/${o.id}`}>{o.title}</Link></h3>
        <div className="meta">
          {o.organization?.name && <div><Icon name="building" />{o.organization.name}</div>}
          <div><Icon name="pin" />{o.location}</div>
          <div><Icon name="clock" />{o.hours} hr{o.hours > 1 ? 's' : ''}</div>
        </div>
        <p>{o.description.slice(0, 95)}{o.description.length > 95 ? '…' : ''}</p>
        {o.signups_count != null && o.signups_count !== '' && <div className="opp-foot"><Meter filled={o.signups_count} slots={o.slots} /></div>}
      </div>
    </article>
  );
}
