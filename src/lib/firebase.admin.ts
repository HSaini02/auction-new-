import * as admin from "firebase-admin";

let isReady = false;

export function getAdmin() {
  if (!isReady) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT env var is missing");
    const svc = JSON.parse(raw);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: svc.project_id,
          clientEmail: svc.client_email,
          privateKey: svc.private_key,
        }),
      });
    }
    isReady = true;
  }
  return { adminDb: admin.firestore(), adminAuth: admin.auth() };
}
