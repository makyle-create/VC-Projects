import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Icon from './Icon';

export function Logo({ to = '/' }) {
  return <Link to={to} className="logo"><span className="logo-mark"><Icon name="heart" /></span><span className="lt">Volunteer <em>Connect</em></span></Link>;
}

function ThemeToggle() {
  const [t, setT] = useState(() => localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'));
  useEffect(() => { document.documentElement.dataset.theme = t; localStorage.setItem('theme', t); }, [t]);
  return <button className="icon-btn" onClick={() => setT(t === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${t === 'dark' ? 'light' : 'dark'} mode`}><Icon name={t === 'dark' ? 'sun' : 'moon'} /></button>;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const links = !user ? [['/opportunities', 'Opportunities', 'search'], ['/saved', 'Saved', 'bookmark'], ['/about', 'About', 'info']]
    : user.role === 'admin'
      ? [['/admin','Admin','shield'], ['/opportunities','Browse','search'], ['/notifications','Notifications','bell']]
      : user.role === 'organization'
      ? [['/','Dashboard','home'], ['/opportunities','Browse','search'], ['/saved','Saved','bookmark'], ['/post','Post','plus'], ['/reports','Reports','chart'], ['/notifications','Notifications','bell']]
      : [['/','Dashboard','home'], ['/opportunities','Browse','search'], ['/saved','Saved','bookmark'], ['/activities','Activities','list'], ['/reports','Reports','chart'], ['/notifications','Notifications','bell']];
  const initials = user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="top">
        <div className="top-in">
          <Logo to={user ? '/' : '/opportunities'} />
          <nav className="nav" aria-label="Main">
            {links.map(([to, t, ic]) => <NavLink key={to} to={to} end={to === '/'}><Icon name={ic} />{t}</NavLink>)}
          </nav>
          <div className="who">
            <ThemeToggle />
            {user ? (<>
              <NavLink to="/profile" className="who-link" title="View your profile">
                <div className="avatar" aria-hidden="true">{initials}</div>
                <div className="who-t"><b>{user.name}</b><span>{user.role}</span></div>
              </NavLink>
              <button className="icon-btn" aria-label="Log out" title="Log out" onClick={async () => { await logout(); nav('/login'); }}><Icon name="logout" /></button>
            </>) : <><NavLink className="btn g s" to="/login">Log in</NavLink><NavLink className="btn s" to="/register">Sign up</NavLink></>}
          </div>
        </div>
      </header>
      <main id="main"><Outlet /></main>
      <footer className="foot"><span>Volunteer Connect — bridging community needs with people ready to help.</span><span className="foot-links"><Link to="/about">About us</Link><Link to="/opportunities">Explore opportunities</Link><Link to="/saved">Saved opportunities</Link></span><span>Made in Manila</span></footer>
    </>
  );
}