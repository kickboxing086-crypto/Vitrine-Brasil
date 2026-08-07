import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Listing } from '../data';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Listing[];

      const planOrder: Record<string, number> = {
        'diamante': 4,
        'ouro': 3,
        'prata': 2,
        'bronze': 1
      };

      data.sort((a, b) => {
        const planA = planOrder[a.plan || 'bronze'] || 0;
        const planB = planOrder[b.plan || 'bronze'] || 0;
        if (planA !== planB) return planB - planA;
        return 0; // The query already sorts by createdAt desc
      });

      setListings(data);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addListing = async (listing: Omit<Listing, 'id'>) => {
    try {
      await addDoc(collection(db, 'listings'), {
        ...listing,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'listings');
    }
  };

  const removeListing = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'listings', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `listings/${id}`);
    }
  };

  const updateListing = async (id: string, data: Partial<Listing>) => {
    try {
      await updateDoc(doc(db, 'listings', id), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `listings/${id}`);
    }
  };

  const incrementClicks = async (id: string) => {
    try {
      await updateDoc(doc(db, 'listings', id), {
        clicks: increment(1)
      });
    } catch (error) {
      console.error("Erro ao incrementar cliques", error);
    }
  };

  return { listings, loading, addListing, removeListing, updateListing, incrementClicks };
}
