import { getApp, getApps, initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

// Resolve credentials: prefer GOOGLE_APPLICATION_CREDENTIALS, fallback to local gcp-key.json, else ADC
function resolveCredential() {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const localKeyPath = path.join(process.cwd(), 'gcp-key.json');
  try {
    if (envPath && existsSync(envPath)) {
      const json = JSON.parse(readFileSync(envPath, 'utf8'));
      return cert(json);
    }
    if (existsSync(localKeyPath)) {
      const json = JSON.parse(readFileSync(localKeyPath, 'utf8'));
      return cert(json);
    }
  } catch {
    // fall through to ADC
  }
  return applicationDefault();
}

const app = getApps().length ? getApp() : initializeApp({ credential: resolveCredential() });
const dbAdmin = getFirestore(app);

export { dbAdmin };
