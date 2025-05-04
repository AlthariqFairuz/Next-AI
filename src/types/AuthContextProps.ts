import { Session, User } from "@supabase/supabase-js";

export interface AuthContextProps{
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}