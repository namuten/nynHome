import * as admin from 'firebase-admin';

let firebaseAdmin: typeof admin | null = null;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (projectId && clientEmail && privateKey) {
  try {
    // Replace literal \n with actual newline character for key parsing
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    
    firebaseAdmin = admin;
    console.log('🔥 Firebase Admin SDK initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
  }
} else {
  console.warn('⚠️ Firebase credentials are not fully configured in environment variables. FCM native push sending will be disabled.');
}

export { firebaseAdmin };
