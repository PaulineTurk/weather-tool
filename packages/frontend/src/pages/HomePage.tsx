import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { Greeting } from '../components/Greeting';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export function HomePage() {
  const { user, isLoading, error, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => fetchUser()} />;
  }

  if (!user) {
    return <ErrorMessage message="No user found" onRetry={() => fetchUser()} />;
  }

  return <Greeting userName={user.name} />;
}
