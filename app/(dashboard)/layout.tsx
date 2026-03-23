import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { computeMetrics } from '@/lib/macros';
import { mapProfileRow } from '@/lib/profile';
import Sidebar from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  const { data: row } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (!row) redirect('/onboarding');

  const profile = mapProfileRow(row);
  const metrics = computeMetrics(profile);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar profile={profile} metrics={metrics} />
      <main
        style={{
          flex: 1,
          marginLeft: '260px',
          minHeight: '100vh',
          padding: '32px',
          maxWidth: 'calc(100vw - 260px)',
        }}
        className="dashboard-main"
      >
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-main {
            margin-left: 0 !important;
            max-width: 100vw !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
