import { Link } from 'react-router';
import { Button } from '@components/ui/Button';
import { PageCard } from '@components/ui/PageCard';

export function NotFound() {
  return (
    <div className="app-main">
      <PageCard>
        <h1 className="heading-xl app-section-title">Page not found</h1>
        <p className="body-l" style={{ marginBottom: 24 }}>
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link to="/">
          <Button variant="primary" size="large">
            Go to Dashboard
          </Button>
        </Link>
      </PageCard>
    </div>
  );
}
