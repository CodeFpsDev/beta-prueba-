import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import type { OrderRecord } from '../types';

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCoIVVXK3csLvtg9E7wDCjGt--fam_szzQ",
  authDomain: "admin-de-zory.firebaseapp.com",
  projectId: "admin-de-zory",
  storageBucket: "admin-de-zory.firebasestorage.app",
  messagingSenderId: "199468715480",
  appId: "1:199468715480:web:2a7a188258237c0b5db6ad",
  measurementId: "G-WKGL0G4WK4",
};

let db: Firestore | null = null;

try {
  const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase no se pudo inicializar en este entorno:', error);
}

export async function registrarPedidoEnFirebase(pedido: Omit<OrderRecord, 'creado'>): Promise<string | null> {
  if (!db) {
    console.warn('Firestore no está disponible, guardando solo localmente');
    return null;
  }

  try {
    const docRef = await addDoc(collection(db, 'pedidos'), {
      ...pedido,
      creado: serverTimestamp(),
    });
    console.log('Pedido guardado exitosamente en Firebase Firestore con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error al guardar pedido en Firestore:', error);
    return null;
  }
}
