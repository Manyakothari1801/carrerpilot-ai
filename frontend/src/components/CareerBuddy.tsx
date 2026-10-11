import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import cosmoImage from '../assets/Cheerful Kawaii Astronaut Mascot.png';

export type CareerBuddyLink = {
  label: string;
  to: string;
};

type CareerBuddyProps = {
  collapsed: boolean;
  hoveredSection?: string;
  targetElement?: HTMLElement;
  sidebarElement?: HTMLElement | null;
  navElement?: HTMLElement | null;
  links: CareerBuddyLink[];
  onNavigate?: () => void;
};

const INTRODUCTION = "Hey! I'm Cosmo. Hover over any section and I'll guide you!";
const STORAGE_KEY = 'career-guidance-cosmo-minimized';
type MotionKind = 'hover' | 'click' | 'nav';
const GUIDANCE_BY_SECTION: Record<string, string> = {
  Overview: 'See your progress, recommendations, and the best next action.',
  Profile: 'Review your personal details and account preferences.',
  'Career Discovery': 'Explore career directions matched to your profile and evidence.',
  'CareerTwin AI': 'Simulate career choices and understand why they may fit you.',
  'Career Plan': 'Turn your goal into a practical, step-by-step learning roadmap.',
  'Job Match': 'Compare your resume with a job description and find skill gaps.',
  'DSA Practice': 'Build problem-solving confidence with focused coding practice.',
  Assessments: 'Measure your skills and review detailed performance feedback.',
  'Scheduled Exams': 'Plan, reschedule, and start your upcoming assessments.',
  'AI Interview': 'Practice interview answers and receive structured coaching.',
  'Career Copilot': 'Ask grounded questions about your profile, goals, and progress.',
  Resumes: 'Upload, analyze, and improve your resumes with explainable feedback.',
};

type BuddyPosition = {
  x: number;
  y: number;
  bubbleBelow: boolean;
  following: boolean;
  ready: boolean;
};

export function CareerBuddy({ collapsed, hoveredSection, targetElement, sidebarElement, navElement, links, onNavigate }: CareerBuddyProps) {
  const [minimized, setMinimized] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');
  const [menuOpen, setMenuOpen] = useState(false);
  const [motion, setMotion] = useState<{ kind: MotionKind; id: number }>();
  const [position, setPosition] = useState<BuddyPosition>({ x: 8, y: 0, bubbleBelow: false, following: false, ready: false });
  const motionSequence = useRef(0);
  const previousHoveredSection = useRef(hoveredSection);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(minimized));
    if (minimized) setMenuOpen(false);
  }, [minimized]);

  const triggerMotion = useCallback((kind: MotionKind) => {
    motionSequence.current += 1;
    setMotion({ kind, id: motionSequence.current });
  }, []);

  useEffect(() => {
    if (hoveredSection && hoveredSection !== previousHoveredSection.current) triggerMotion('nav');
    previousHoveredSection.current = hoveredSection;
  }, [hoveredSection, triggerMotion]);

  const updatePosition = useCallback(() => {
    if (!sidebarElement) return;

    const sidebarRect = sidebarElement.getBoundingClientRect();
    const navRect = navElement?.getBoundingClientRect();
    const mascotSize = collapsed ? 48 : 52;
    const horizontalInset = collapsed ? Math.max(0, (sidebarRect.width - mascotSize) / 2) : sidebarRect.width - mascotSize - 12;
    const restingY = Math.max(12, sidebarRect.height - mascotSize - 76);
    const canFollow = !minimized && targetElement && navRect
      && targetElement.getBoundingClientRect().bottom > navRect.top
      && targetElement.getBoundingClientRect().top < navRect.bottom;

    if (!canFollow || !targetElement) {
      setPosition({ x: horizontalInset, y: restingY, bubbleBelow: false, following: false, ready: true });
      return;
    }

    const targetRect = targetElement.getBoundingClientRect();
    const desiredY = targetRect.top - sidebarRect.top + (targetRect.height - mascotSize) / 2;
    const topBound = Math.max(8, (navRect?.top ?? sidebarRect.top) - sidebarRect.top);
    const bottomBound = Math.min(
      sidebarRect.height - mascotSize - 8,
      (navRect?.bottom ?? sidebarRect.bottom) - sidebarRect.top - mascotSize,
    );
    const y = Math.min(Math.max(desiredY, topBound), Math.max(topBound, bottomBound));

    setPosition({
      x: horizontalInset,
      y,
      bubbleBelow: y < 118,
      following: true,
      ready: true,
    });
  }, [collapsed, minimized, navElement, sidebarElement, targetElement]);

  useLayoutEffect(() => {
    updatePosition();
  }, [updatePosition]);

  useEffect(() => {
    if (!sidebarElement) return;
    let frame = 0;
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updatePosition);
    };
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(sidebarElement);
    if (navElement) {
      observer.observe(navElement);
      navElement.addEventListener('scroll', scheduleUpdate, { passive: true });
    }
    if (targetElement) observer.observe(targetElement);
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      navElement?.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [navElement, sidebarElement, targetElement, updatePosition]);

  const guidance = hoveredSection ? GUIDANCE_BY_SECTION[hoveredSection] : undefined;
  const travelStyle = {
    '--cosmo-x': `${position.x}px`,
    '--cosmo-y': `${position.y}px`,
  } as CSSProperties;

  const toggleMenu = () => {
    triggerMotion('click');
    setMenuOpen((value) => !value);
  };

  if (minimized) {
    return (
      <section className="career-buddy is-minimized" aria-label="Cosmo career guide">
        <div className={`cosmo-travel-layer ${position.ready ? 'is-ready' : ''}`} style={travelStyle}>
          <button
            className="cosmo-restore"
            type="button"
            onClick={() => setMinimized(false)}
            aria-label="Restore Cosmo career guide"
            title="Restore Cosmo"
          >
            <img src={cosmoImage} alt="" />
            {!collapsed && <span>Ask Cosmo</span>}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={`career-buddy ${position.following ? 'is-following' : 'is-resting'} ${position.bubbleBelow ? 'bubble-below' : 'bubble-above'}`} aria-label="Cosmo career guide">
      <div className={`cosmo-travel-layer ${position.ready ? 'is-ready' : ''}`} style={travelStyle}>
      {!menuOpen && <div className="cosmo-bubble" role="status" aria-live="polite">
        <button
          className="cosmo-minimize"
          type="button"
          onClick={() => setMinimized(true)}
          aria-label="Minimize Cosmo career guide"
          title="Minimize Cosmo"
        >
          −
        </button>
        <strong>Cosmo</strong>
        <span>{guidance ?? INTRODUCTION}</span>
      </div>}

      {menuOpen && (
        <div className="cosmo-help-menu" id="cosmo-help-menu">
          <p>Where can I guide you?</p>
          <div>
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate?.();
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <button
        className="cosmo-button"
        type="button"
        onClick={toggleMenu}
        onMouseEnter={() => triggerMotion('hover')}
        aria-expanded={menuOpen}
        aria-controls={menuOpen ? 'cosmo-help-menu' : undefined}
        aria-label={menuOpen ? 'Close Cosmo help menu' : 'Open Cosmo help menu'}
      >
        <span className="cosmo-float-layer">
          <span className="cosmo-tilt-layer">
            <span
              key={motion?.id ?? 'idle'}
              className={`cosmo-motion-layer ${motion ? `cosmo-motion-${motion.kind}` : ''}`}
              onAnimationEnd={(event) => {
                if (event.currentTarget === event.target) setMotion(undefined);
              }}
            >
              <span className="cosmo-orbit" aria-hidden="true" />
              <img src={cosmoImage} alt="Cosmo, the career guidance astronaut" />
            </span>
          </span>
        </span>
      </button>
      </div>
    </section>
  );
}
