'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile, ComputedMetrics } from '@/lib/types';

const NAV = [
  { section: 'OVERVIEW', items: [{ href: '/dashboard', label: 'Dashboard', icon: '🏠' }] },
  {
    section: 'NUTRITION',
    items: [
      { href: '/cuisine', label: 'By Cuisine', icon: '🍽️' },
      { href: '/ingredients', label: 'By Ingredients', icon: '🥗' },
      { href: '/planner', label: 'Meal Planner', icon: '📅' },
    ],
  },
  {
    section: 'TRAINING',
    items: [
      { href: '/training', label: 'Training Plan', icon: '💪', badge: 'AI' },
      { href: '/exercises', label: 'Exercise Library', icon: '🏋️' },
    ],
  },
  {
    section: 'PROGRESS',
    items: [
      { href: '/roadmap', label: 'Roadmap', icon: '🗺️' },
      { href: '/stats', label: 'Body Stats', icon: '📊' },
    ],
  },
  {
    section: 'ACCOUNT',
    items: [{ href: '/settings', label: 'Settings', icon: '⚙️' }],
  },
];

const GOAL_LABELS: Record<string, string> = {
  recomp: 'Recomposition',
  cut: 'Fat Loss',
  bulk: 'Muscle Gain',
};

export default function Sidebar({
  profile,
  metrics,
}: {
  profile: UserProfile;
  metrics: ComputedMetrics;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  const firstName = profile.fullName.split(' ')[0];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const SidebarContent = () => (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            background: 'var(--gold)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            flexShrink: 0,
          }}
        >
          💪
        </div>
        <span
          style={{
            fontFamily: 'Clash Display',
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text)',
          }}
        >
          FitOS
        </span>
      </div>

      {/* Profile summary card */}
      <div
        style={{
          background: 'var(--s2)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            fontFamily: 'Syne',
            fontWeight: 700,
            fontSize: '14px',
            color: 'var(--text)',
            marginBottom: '8px',
          }}
        >
          {firstName}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
          }}
        >
          {[
            { label: 'Goal', value: GOAL_LABELS[profile.goal] ?? profile.goal, color: 'var(--gold)' },
            { label: 'Weight', value: `${profile.weightKg}kg`, color: 'var(--muted2)' },
            { label: 'Calories', value: `${metrics.targetKcal}`, color: 'var(--gold)' },
            { label: 'Protein', value: `${metrics.proteinG}g`, color: 'var(--blue)' },
          ].map((item) => (
            <div key={item.label}>
              <div
                style={{
                  fontSize: '10px',
                  fontFamily: 'Syne',
                  fontWeight: 600,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: item.color,
                  fontFamily: 'Syne',
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {NAV.map((section) => (
          <div key={section.section} style={{ marginBottom: '20px' }}>
            <div className="section-label" style={{ marginBottom: '8px', paddingRight: '8px' }}>
              {section.section}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      background: active ? 'rgba(232,194,122,0.08)' : 'transparent',
                      color: active ? 'var(--gold)' : 'var(--muted2)',
                      fontFamily: 'Syne',
                      fontWeight: active ? 700 : 500,
                      fontSize: '14px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                    {item.label}
                    {'badge' in item && item.badge && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          background: 'rgba(45,212,191,0.15)',
                          color: 'var(--teal)',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '999px',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="btn-ghost"
        style={{
          width: '100%',
          justifyContent: 'center',
          marginTop: '8px',
          fontSize: '13px',
        }}
      >
        Sign out
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '260px',
          background: 'var(--s1)',
          borderRight: '1px solid var(--border)',
          zIndex: 40,
        }}
        className="desktop-sidebar"
      >
        <SidebarContent />
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 50,
          background: 'var(--s1)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '8px 10px',
          cursor: 'pointer',
          color: 'var(--text)',
          fontSize: '18px',
        }}
        className="mobile-menu-btn"
      >
        ☰
      </button>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'flex',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
            }}
          />
          {/* Drawer */}
          <div
            style={{
              position: 'relative',
              width: '260px',
              background: 'var(--s1)',
              height: '100%',
              overflowY: 'auto',
            }}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      <style>{`
        .desktop-sidebar { display: flex; flex-direction: column; }
        .mobile-menu-btn { display: none; }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
