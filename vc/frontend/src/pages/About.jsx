import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

const steps = [
  { n: '01', icon: 'search', title: 'Discover a cause', text: 'Browse community opportunities by category, date, and location to find work that fits your interests and schedule.' },
  { n: '02', icon: 'users', title: 'Join an activity', text: 'Review the event details and requirements, then sign up to let the organizing team know you can help.' },
  { n: '03', icon: 'heart', title: 'Make an impact', text: 'Show up, contribute your time, and keep track of completed activities and volunteer hours in your dashboard.' },
];
const values = [
  { icon: 'handshake', title: 'Community first', text: 'We bring local organizations and willing volunteers closer together.' },
  { icon: 'check', title: 'Clear expectations', text: 'Each listing should explain its location, schedule, slots, and requirements.' },
  { icon: 'chart', title: 'Impact you can track', text: 'Volunteers and organizers can review participation and recorded hours.' },
];

export default function About() {
  return <div className="about-page">
    <section className="about-hero">
      <span className="eyebrow"><Icon name="heart" /> SMALL ACTIONS, REAL CHANGE</span>
      <h1>Good things happen when <span>people connect.</span></h1>
      <p>Volunteer Connect helps community organizations share opportunities and makes it easier for people to find meaningful ways to give back.</p>
      <div className="row"><Link className="btn lg" to="/opportunities">Explore opportunities <Icon name="arrow" /></Link><Link className="btn g lg" to="/register">Join the community</Link></div>
      <div className="about-hero-art" aria-hidden="true"><div className="art-circle"><Icon name="heart" /></div><span className="art-dot dot-one"/><span className="art-dot dot-two"/><span className="art-dot dot-three"/></div>
    </section>

    <section className="about-section">
      <div className="section-intro"><span className="eyebrow">HOW IT WORKS</span><h2>From looking to doing in three steps.</h2><p className="mut">A simple path for volunteers and the organizations that need them.</p></div>
      <div className="step-grid">{steps.map((step) => <article className="step-card" key={step.n}><span className="step-num">{step.n}</span><div className="feature-icon"><Icon name={step.icon} /></div><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
    </section>

    <section className="about-section values-section">
      <div className="section-intro"><span className="eyebrow">WHAT MATTERS HERE</span><h2>Built around practical community impact.</h2></div>
      <div className="value-grid">{values.map((item) => <article className="value-item" key={item.title}><div className="feature-icon"><Icon name={item.icon} /></div><div><h3>{item.title}</h3><p className="mut">{item.text}</p></div></article>)}</div>
    </section>

    <section className="about-cta"><div><span className="eyebrow">YOUR TIME MATTERS</span><h2>Find the opportunity that feels right for you.</h2><p>Start with a cause you care about. Every hour can help strengthen a community.</p></div><Link className="btn lg" to="/opportunities">Find your next activity <Icon name="arrow" /></Link></section>
  </div>;
}
