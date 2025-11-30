export function useAuth() {
  return { 
    user: null, 
    loading: false, 
    signIn: async () => {}, 
    signUp: async () => {}, 
    signOut: async () => {}
  };
}