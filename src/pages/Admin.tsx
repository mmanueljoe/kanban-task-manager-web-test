import { Button } from '@components/ui/Button';
import { PageCard } from '@components/ui/PageCard';
import { useAuth } from '@hooks/useAuth';
import { useNavigate } from 'react-router';

export function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    void navigate('/login', { replace: true });
  };

  return (
    <div className="app-main">
      <PageCard>
        <h1 className="heading-xl app-section-title">Admin</h1>
        <p className="body-l" style={{ marginBottom: 24 }}>
          Logged in as {user?.name ?? '—'}
        </p>
        <Button variant="secondary" size="large" onClick={handleLogout}>
          Log out
        </Button>
      </PageCard>
    </div>
  );
}
