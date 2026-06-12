// Public Firebase web config. Shares the project with snu-graduate but stores
// courses in a separate document so the two trackers never mix data.
export const firebaseSettings = {
  enabled: true,
  collectionPath: 'snuGraduateTrackers',
  documentId: 'jiwon-park'
};

export const firebaseConfig = {
  apiKey: 'AIzaSyC7HAki4G2xLaYPY3U4SdVxGpQOT55NU94',
  authDomain: 'snu-graduate-ebfdd.firebaseapp.com',
  projectId: 'snu-graduate-ebfdd',
  storageBucket: 'snu-graduate-ebfdd.firebasestorage.app',
  messagingSenderId: '1079152141425',
  appId: '1:1079152141425:web:f754cf9831f336ef3b27d0'
};
