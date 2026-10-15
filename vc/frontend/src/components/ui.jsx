import { Link } from 'react-router-dom';
import Icon from './Icon';

export const Empty = ({ icon = 'inbox', title, text, to, cta }) => (
  <div className="empty">
    <div className="ei"><Icon name={icon} /></div>
    <h3>{title}</h3>
    {text && <p>{text}</p>}
    {to && <Link className="btn" to={to}>{cta}</Link>}
  </div>
);

export const Stat = ({ n, label, icon = 'activity', tone = '' }) => (
  <div className="card stat">
    <div className={`stat-ico ${tone}`}><Icon name={icon} /></div>
    <div><b>{n}</b><span>{label}</span></div>
  </div>
);

export const Skeletons = ({ n = 6 }) => (
  <div className="grid">{Array.from({ length: n }, (_, i) => <div key={i} className="skel" />)}</div>
);

export const StatusBadge = ({ o }) => {
  if (o.status === 'draft') return <span className="badge">Draft</span>;
  if (o.signups_count >= o.slots) return <span className="badge err">Full</span>;
  if (o.slots - o.signups_count <= 3) return <span className="badge warn">Almost full</span>;
  return <span className="badge ok">Open</span>;
};
