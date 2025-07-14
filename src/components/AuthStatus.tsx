import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function AuthStatus() {
  const { session, status, signOut } = useAuth();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="text-gray-500">Not signed in</div>;
  }

  return (
    <div className="flex items-center gap-4">
      {session?.user?.image && (
        <img
          src={session.user.image}
          alt={session.user.name || session.user.email || 'User'}
          className="w-8 h-8 rounded-full object-cover"
        />
      )}
      <div className="flex flex-col">
        <span className="font-medium">{session?.user?.name || session?.user?.email}</span>
        {session?.user?.email && (
          <span className="text-xs text-gray-500">{session.user.email}</span>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/auth/signin' })}>
        Sign out
      </Button>
    </div>
  );
} 