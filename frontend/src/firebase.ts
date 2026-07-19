import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

// TODO: Replace these with your actual Firebase project config
// 1. Go to console.firebase.google.com
// 2. Create a project and add a Web App
// 3. Copy the config values here:
const firebaseConfig = {
  apiKey: "AIzaSyBwsRMn-S3TnpX3KIzVsBj4PkPhyHlU2dI",
  authDomain: "klasspay-v2.firebaseapp.com",
  projectId: "klasspay-v2",
  storageBucket: "klasspay-v2.firebasestorage.app",
  messagingSenderId: "818201195767",
  appId: "1:818201195767:web:5708e99c5d0f3fa52dcff2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper functions for KlassPay
export const saveBillMetadata = async (billId: number, name: string, description: string) => {
  try {
    await setDoc(doc(db, "bills", billId.toString()), {
      name,
      description,
      createdAt: new Date().toISOString()
    });
  } catch (e) {
    console.error("Error saving bill metadata:", e);
  }
};

export const getBillMetadata = async (billId: number) => {
  try {
    const docRef = doc(db, "bills", billId.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (e) {
    console.error("Error fetching bill metadata:", e);
  }
  return null;
};
