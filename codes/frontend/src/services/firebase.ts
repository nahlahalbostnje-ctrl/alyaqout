import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey:            'AIzaSyBoEXfztIae_nT3Prgzih_mX6VMsuQLrI',
  authDomain:        'yaqoot-study.firebaseapp.com',
  databaseURL:       'https://yaqoot-study-101ce-default-rtdb.firebaseio.com',
  projectId:         'yaqoot-study',
  storageBucket:     'yaqoot-study.firebasestorage.app',
  messagingSenderId: '167603104216',
  appId:             '1:167603104216:web:b69d979fd9f3d9c7be6aad',
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
