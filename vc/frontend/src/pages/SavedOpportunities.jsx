import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import OppCard from '../components/OppCard';
import { Empty } from '../components/ui';
import { getSavedOpportunities } from '../savedOpportunities';

export default function SavedOpportunities() {
  const [saved, setSaved] = useState(() => getSavedOpportunities());
  useEffect(() => {
    const refresh = () => setSaved(getSavedOpportunities());
    window.addEventListener('saved-opportunities-changed', refresh);
    return () => window.removeEventListener('saved-opportunities-changed', refresh);
  }, []);

  return <>
    <div className="page-head">
      <div><p className="eyebrow"><Icon name="bookmark" /> YOUR SHORTLIST</p><h1>Saved opportunities</h1><p className="mut">Keep interesting events in one place and come back when you're ready.</p></div>
      <Link className="btn g" to="/opportunities"><Icon name="search" />Browse opportunities</Link>
    </div>
    {saved.length ? <>
      <p className="mut small" style={{ marginBottom: '1rem' }}>{saved.length} saved {saved.length === 1 ? 'opportunity' : 'opportunities'} · Saved on this browser</p>
      <div className="grid">{saved.map((o) => <OppCard key={o.id} o={o} />)}</div>
    </> : <Empty icon="bookmark" title="Your shortlist is empty" text="Tap the bookmark on any opportunity card to save it here for later." to="/opportunities" cta="Explore opportunities" />}
  </>;
}
