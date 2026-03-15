import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            // Create new user record if it doesn't exist
            const isAdminEmail = fUser.email?.toLowerCase() === 'rumalfernando@luxeboutique.lk' || fUser.email?.toLowerCase() === 'nirwanisthe@gmail.com';
            
            const newUser: User = {
              id: fUser.uid,
              name: fUser.displayName || fUser.email?.split('@')[0] || 'Guest',
              email: fUser.email || '',
              role: isAdminEmail ? 'admin' : 'customer',
              createdAt: new Date().toISOString(),
            };
            try {
              await setDoc(doc(db, 'users', fUser.uid), newUser);
              setUser(newUser);
            } catch (setErr) {
              console.error('Error auto-creating user doc:', setErr);
              // Fallback to local user object even if Firestore fails
              setUser(newUser);
            }
          }
        } catch (err) {
          console.error('Error fetching user doc in AuthContext:', err);
          // Fallback for hardcoded admins
          const isAdminEmail = fUser.email?.toLowerCase() === 'rumalfernando@luxeboutique.lk' || fUser.email?.toLowerCase() === 'nirwanisthe@gmail.com';
          if (isAdminEmail) {
            setUser({
              id: fUser.uid,
              name: fUser.email?.split('@')[0] || 'Admin',
              email: fUser.email || '',
              role: 'admin',
              createdAt: new Date().toISOString(),
            });
          } else {
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
