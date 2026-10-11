import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { Logo } from '../pages/AuthPage';
import { AppIcon, type IconName } from '../components/AppIcon';
import { CareerBuddy } from '../components/CareerBuddy';
import { useTheme, type ThemePreference } from '../components/ThemeProvider';

type NavItem = { to: string; label: string; icon: IconName };
const sections: { label: string; items: NavItem[] }[] = [
  { label: 'Main', items: [{ to: '/student/dashboard', label: 'Overview', icon: 'overview' }, { to: '/student/profile', label: 'Profile', icon: 'profile' }] },
  { label: 'Career intelligence', items: [{ to: '/student/careers', label: 'Career Discovery', icon: 'careers' }, { to: '/student/career-twin', label: 'CareerTwin AI', icon: 'twin' }, { to: '/student/career-plan', label: 'Career Plan', icon: 'plan' }, { to: '/student/job-match', label: 'Job Match', icon: 'match' }] },
  { label: 'Preparation', items: [{ to: '/student/dsa-practice', label: 'DSA Practice', icon: 'dsa' }, { to: '/student/assessments', label: 'Assessments', icon: 'assessment' }, { to: '/student/scheduled-exams', label: 'Scheduled Exams', icon: 'calendar' }] },
  { label: 'AI tools', items: [{ to: '/student/ai-interview', label: 'AI Interview', icon: 'interview' }, { to: '/student/career-copilot', label: 'Career Copilot', icon: 'copilot' }] },
  { label: 'Documents', items: [{ to: '/student/resumes', label: 'Resumes', icon: 'resume' }] },
];
const allItems = sections.flatMap((section) => section.items);
const buddyItems = allItems;

function pageContext(pathname: string) {
  const match = [...allItems].sort((a, b) => b.to.length - a.to.length).find((item) => pathname.startsWith(item.to));
  if (pathname.includes('/attempts/')) return { title: 'Assessment attempt', parent: 'Assessments' };
  if (pathname.includes('/results/')) return { title: 'Job match result', parent: 'Job Match' };
  if (pathname.includes('/analysis/')) return { title: 'Resume analysis', parent: 'Resumes' };
  return { title: match?.label ?? 'Student workspace', parent: sections.find((section) => section.items.includes(match as NavItem))?.label };
}

export function StudentLayout() {
  const { user, logout } = useAuth();
  const { preference, resolvedTheme, setPreference } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('career-guidance-sidebar') === 'collapsed');
  const [accountOpen, setAccountOpen] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string>();
  const [buddyTarget, setBuddyTarget] = useState<HTMLElement>();
  const [sidebarElement, setSidebarElement] = useState<HTMLElement | null>(null);
  const [navElement, setNavElement] = useState<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const context = useMemo(() => pageContext(location.pathname), [location.pathname]);
  const initials = user?.fullName?.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'ST';
  useEffect(() => { setDrawerOpen(false); setAccountOpen(false); setHoveredSection(undefined); setBuddyTarget(undefined); }, [location.pathname]);
  useEffect(() => { localStorage.setItem('career-guidance-sidebar', collapsed ? 'collapsed' : 'expanded'); }, [collapsed]);
  useEffect(() => { const dismiss = (event: MouseEvent) => { if (!menuRef.current?.contains(event.target as Node)) setAccountOpen(false); }; document.addEventListener('mousedown', dismiss); return () => document.removeEventListener('mousedown', dismiss); }, []);
  const signOut = async (all = false) => { await logout(all); navigate('/login'); };

  return <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    {drawerOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setDrawerOpen(false)} />}
    <aside ref={setSidebarElement} className={`app-sidebar ${drawerOpen ? 'drawer-open' : ''}`}>
      <div className="sidebar-brand"><Logo compact={collapsed} /><button className="icon-button lg:hidden" aria-label="Close navigation" onClick={() => setDrawerOpen(false)}><AppIcon name="close" /></button></div>
      <nav
        aria-label="Student navigation"
        className="sidebar-nav"
        ref={setNavElement}
        onMouseLeave={(event) => {
          if (!event.currentTarget.contains(document.activeElement)) {
            setHoveredSection(undefined);
            setBuddyTarget(undefined);
          }
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setHoveredSection(undefined);
            setBuddyTarget(undefined);
          }
        }}
      >
        {sections.map((section) => <div className="nav-section" key={section.label}><p className="nav-section-label">{section.label}</p>{section.items.map((item) => <NavLink className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`} to={item.to} key={item.to} title={collapsed ? item.label : undefined} onMouseEnter={(event) => { setHoveredSection(item.label); setBuddyTarget(event.currentTarget); }} onFocus={(event) => { setHoveredSection(item.label); setBuddyTarget(event.currentTarget); }}><AppIcon name={item.icon} className="nav-icon"/><span>{item.label}</span></NavLink>)}</div>)}
      </nav>
      <CareerBuddy collapsed={collapsed} hoveredSection={hoveredSection} targetElement={buddyTarget} sidebarElement={sidebarElement} navElement={navElement} links={buddyItems} onNavigate={() => setDrawerOpen(false)} />
      <button className="sidebar-collapse" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}><AppIcon name="collapse" className={collapsed ? 'rotate-180' : ''}/><span>Collapse</span></button>
    </aside>
    <div className="app-main">
      <header className="app-topbar">
        <div className="flex min-w-0 items-center gap-3"><button className="icon-button lg:hidden" aria-label="Open navigation" onClick={() => setDrawerOpen(true)}><AppIcon name="menu" /></button><div className="min-w-0"><p className="topbar-crumb">{context.parent ?? 'Career Guidance AI'}</p><h1 className="topbar-title">{context.title}</h1></div></div>
        <div className="flex items-center gap-2"><ThemeMenu preference={preference} resolvedTheme={resolvedTheme} setPreference={setPreference}/><button className="icon-button hidden sm:grid" aria-label="Notifications"><AppIcon name="bell" /></button><div className="relative" ref={menuRef}><button className="account-button" onClick={() => setAccountOpen((value) => !value)} aria-expanded={accountOpen} aria-haspopup="menu"><span className="avatar">{initials}</span><span className="hidden max-w-36 truncate text-sm font-medium sm:block">{user?.fullName}</span><AppIcon name="chevron" className="h-4 w-4 rotate-90" /></button>{accountOpen && <div className="account-menu" role="menu"><button role="menuitem" onClick={() => navigate('/student/profile')}><AppIcon name="profile"/>Profile</button><button role="menuitem" onClick={() => void signOut()}><AppIcon name="logout"/>Sign out</button><button role="menuitem" onClick={() => void signOut(true)}><AppIcon name="logout"/>Sign out everywhere</button></div>}</div></div>
      </header>
      <main id="main-content"><Outlet /></main>
    </div>
  </div>;
}

function ThemeMenu({ preference, resolvedTheme, setPreference }: { preference: ThemePreference; resolvedTheme: 'light' | 'dark'; setPreference: (value: ThemePreference) => void }) { const [open, setOpen] = useState(false); return <div className="relative"><button className="icon-button" aria-label="Change appearance" aria-expanded={open} onClick={() => setOpen((value) => !value)}><AppIcon name={resolvedTheme === 'dark' ? 'moon' : 'sun'} /></button>{open && <div className="theme-menu" role="menu" aria-label="Appearance">{(['system','light','dark'] as ThemePreference[]).map((value) => <button role="menuitemradio" aria-checked={preference === value} className={preference === value ? 'selected' : ''} key={value} onClick={() => { setPreference(value); setOpen(false); }}><AppIcon name={value === 'system' ? 'system' : value === 'light' ? 'sun' : 'moon'} />{value[0].toUpperCase() + value.slice(1)}</button>)}</div>}</div>; }
