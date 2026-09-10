import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile, signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';
import { firebaseStorageService } from '../services/firebaseStorageService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (n: string, e: string, p: string, phone?: string) => Promise<void>;
  resetPassword: (e: string) => Promise<void>;
  loginAnonymously: () => Promise<void>;
  googleToken: string | null;
  connectGoogleCalendar: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // Ensure user document exists in Firestore on every state change if user is present
        firebaseStorageService.ensureUserExists().catch(e => console.error("Critical: Failed to sync user document", e));
      } else {
        setGoogleToken(null);
      }
      if (firebaseUser) { window.localStorage.setItem('apses_user_uid', firebaseUser.uid); } else { window.localStorage.removeItem('apses_user_uid'); }
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        firebaseStorageService.ensureUserExists().catch(e => console.error(e));
      }
    } catch (error: any) {
      console.error("Login failed", error);
      // Improve error message for common issues in AI Studio
      if (error.code === 'auth/popup-blocked') {
        throw new Error("O popup de login foi bloqueado. Por favor, habilite popups para este site.");
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error(`O domínio '${window.location.hostname}' não está autorizado. Adicione-o no Firebase Console (Authentication > Settings > Authorized domains).`);
      }
      throw error;
    }
  };
  
  const loginAnonymously = async () => {
    try {
      const result = await signInAnonymously(auth);
      if (result.user) {
        firebaseStorageService.ensureUserExists().catch(e => console.error(e));
      }
    } catch (error: any) {
      console.error("Anonymous login failed", error);
      if (error && error.code === "auth/operation-not-allowed") {
        console.log("Anonymous auth not enabled. Falling back to mock guest user.");
        const dummyUser = {
          uid: 'guest-' + Date.now(),
          isAnonymous: true,
          displayName: 'Visitante',
          email: '',
          emailVerified: false,
          phoneNumber: null,
          photoURL: null,
          providerId: 'firebase',
          providerData: [],
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => '',
          getIdTokenResult: async () => ({ token: '', expirationTime: '', authTime: '', issuedAtTime: '', signInProvider: '', claims: {} }),
          reload: async () => {},
          toJSON: () => ({}),
        } as unknown as User;
        
        window.localStorage.setItem('apses_user_uid', dummyUser.uid);
        setUser(dummyUser);
        setLoading(false);
        return;
      }
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        firebaseStorageService.ensureUserExists().catch(e => console.error(e));
      }
    } catch (error) {
       console.error("Email login failed", error);
      throw new Error("Credenciais inválidas. Verifique seu e-mail e senha.");
    }
  };
  
  const registerWithEmail = async (name: string, email: string, pass: string, phone?: string) => {
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(newUser, { displayName: name });
      // Create user document immediately
            if (phone) {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('./firebase');
        await setDoc(doc(db, "users", newUser.uid), { 
           uid: newUser.uid,
           email: email,
           displayName: name,
           phone: phone,
           planStatus: 'free',
           dailyQuestionsCount: 0,
           aiFlashcardsUsedCount: 0,
           createdAt: new Date().toISOString()
        }, { merge: true });
      }
      await firebaseStorageService.ensureUserExists().catch(e => console.error(e));
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  };
  
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.warn("Password reset attempt for non-existent email or error.");
      // Do nothing to prevent user enumeration
    }
  };

  const logout = async () => {
    try {
      if (auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
          });
        } catch (e) {
          console.error("Failed to revoke token on backend", e);
        }
      }
      await signOut(auth);
      setGoogleToken(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const connectGoogleCalendar = async (): Promise<string> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/calendar');
      provider.addScope('https://www.googleapis.com/auth/calendar.events');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (!token) {
        throw new Error("Não foi possível obter o token de acesso do Google.");
      }
      setGoogleToken(token);
      return token;
    } catch (error: any) {
      console.error("Failed to connect Google Calendar", error);
      if (error.code === 'auth/popup-blocked') {
        throw new Error("O popup de conexão foi bloqueado. Por favor, habilite popups para este site.");
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      loginWithGoogle, 
      logout, 
      loginWithEmail, 
      registerWithEmail, 
      resetPassword, 
      loginAnonymously,
      googleToken,
      connectGoogleCalendar
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
