import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Safe Firestore initialization with iframe fallback
export let db: any;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, firebaseConfig.firestoreDatabaseId);
  console.log("Firestore initialized successfully with persistent local cache.");
} catch (cacheError) {
  console.warn("Could not enable Firestore persistent cache inside iframe sandbox, falling back to basic setup:", cacheError);
  try {
    // Calling getFirestore(app, databaseId) is the absolute safest fallback since it doesn't throw the "already initialized" error if initializeFirestore already started registration.
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } catch (fallbackError) {
    console.error("Secondary getFirestore fallback also failed, attempting standard initializeFirestore:", fallbackError);
    try {
      db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);
    } catch (lastResortError) {
      console.error("Critical: All Firestore initialization configurations failed.", lastResortError);
      // Last chance absolute recovery
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    }
  }
}
export const auth = getAuth(app);

export interface UserInsights {
  accountType: 'Google Auth (Verificada)' | 'E-mail criado na hora (Padrão)' | 'E-mail Suspeito (Descartável)';
  isRealGoogle: boolean;
  trustScore: number;
  verificationReason: string;
}

export function analyzeAccountIntelligence(email: string, providerId: string): UserInsights {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (providerId === 'google.com' || providerId === 'google') {
    return {
      accountType: 'Google Auth (Verificada)',
      isRealGoogle: true,
      trustScore: 100,
      verificationReason: 'Login em tempo real auditado por oAuth 2.0 da Google. Autenticidade 100% garantida.'
    };
  }

  const suspiciousList = [
    'yopmail.com', 'mailinator.com', 'tempmail.com', 'dispostable.com', 
    'guerrillamail.com', 'sharklasers.com', 'boun.cr', 'trashmail.com'
  ];
  const emailDomain = normalizedEmail.split('@')[1] || '';
  const isSuspicious = suspiciousList.some(domain => emailDomain.includes(domain));
  
  if (isSuspicious) {
    return {
      accountType: 'E-mail Suspeito (Descartável)',
      isRealGoogle: false,
      trustScore: 15,
      verificationReason: 'Detectado domínio de e-mail temporário ou descartável. Conta insegura criada na hora.'
    };
  }

  if (normalizedEmail.endsWith('@gmail.com')) {
    return {
      accountType: 'E-mail criado na hora (Padrão)',
      isRealGoogle: false,
      trustScore: 70,
      verificationReason: 'E-mail Google (Gmail) registrado na hora por senha comum. Não utiliza oAuth oficial.'
    };
  }

  return {
    accountType: 'E-mail criado na hora (Padrão)',
    isRealGoogle: false,
    trustScore: 85,
    verificationReason: 'E-mail corporativo ou personalizado de alta confiança criado na hora com senha comum.'
  };
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Evitando O, I, 0, 1 para evitar confusões de leitura dos clientes
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const syncUserToFirestore = async (user: any, providerId: string) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const insights = analyzeAccountIntelligence(user.email || '', providerId);
  const isMasterAdmin = (user.email || '').trim().toLowerCase() === 'elitestreambr1@gmail.com';
  
  try {
    const docSnap = await getDoc(userRef);
    let referralCode = isMasterAdmin ? 'SAM777' : generateReferralCode();
    let referredBy = '';
    let referralsCount = 0;
    let unlockedSharing = isMasterAdmin;

    if (docSnap.exists()) {
      const data = docSnap.data();
      referralCode = isMasterAdmin ? (data.referralCode && data.referralCode !== 'PROMO1' && data.referralCode.length === 6 ? data.referralCode : 'SAM777') : (data.referralCode || generateReferralCode());
      // Force SAM777 if the admin has a random-looking code or has no code
      if (isMasterAdmin && (!referralCode || referralCode === 'PROMO1' || referralCode.startsWith('GEN-') || referralCode === '---')) {
        referralCode = 'SAM777';
      }
      referredBy = data.referredBy || '';
      referralsCount = data.referralsCount !== undefined ? data.referralsCount : 0;
      unlockedSharing = isMasterAdmin ? true : (data.unlockedSharing !== undefined ? data.unlockedSharing : false);
    }

    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || 'Cliente',
      email: user.email || '',
      providerId: providerId,
      lastLoginAt: new Date(),
      createdAt: user.metadata?.creationTime ? new Date(user.metadata.creationTime) : new Date(),
      referralCode,
      referredBy,
      referralsCount,
      unlockedSharing,
      isMasterAdmin,
      ...insights
    }, { merge: true });
    console.log('User metadata successfully synced to Firestore!');
  } catch (err) {
    console.error('Error syncing user metadata to Firestore:', err);
  }
};



export const loginWithEmail = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    await syncUserToFirestore(credential.user, 'password');
    return credential.user;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials' || error.code === 'auth/wrong-password') {
      throw new Error('Email ou senha inválidos.');
    } else {
      throw new Error('Ocorreu um erro ao fazer login. Verifique seus dados.');
    }
  }
};

export const registerWithEmail = async (firstName: string, lastName: string, email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!firstName.trim() || !lastName.trim()) {
    throw new Error('Por favor, preencha o nome e o sobrenome.');
  }
  if (password.length < 6) {
    throw new Error('A senha deve ter no mínimo 6 caracteres.');
  }
  try {
    const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    await updateProfile(credential.user, {
      displayName: fullName
    });
    // Create actual synced document inside Firestore collection
    await syncUserToFirestore(credential.user, 'password');
    return credential.user;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Este e-mail já está em uso por outro usuário.');
    } else {
      throw new Error('Erro ao criar conta: ' + error.message);
    }
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
  }
};
