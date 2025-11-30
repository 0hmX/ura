import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

export function useLogout() {
  const { signOut } = useAuth();
  const router = useRouter();

  const logout = async () => {
    try {
      await signOut();
      router.replace('/auth/signin');
    } catch (error) {
      console.error('Logout error:', error);
      router.replace('/auth/signin');
    }
  };

  return logout;
}