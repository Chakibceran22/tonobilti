import { User, AuthError, Session } from '@supabase/supabase-js'


// Types
export interface UserData {
  firstName: string
  lastName: string
  phone: string
  email: string
}

export interface SignUpParams {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
}

export interface AuthResult {
  user: User | null
  error: AuthError | null
}

export interface SessionResult {
  session: Session | null
  error: AuthError | null
}