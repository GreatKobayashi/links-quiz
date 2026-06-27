import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyBy9DFLFOKuIJUicKCj7E2RYSDa_E7xH_0',
  authDomain: 'question-agent-ytt.firebaseapp.com',
  projectId: 'question-agent-ytt',
  storageBucket: 'question-agent-ytt.firebasestorage.app',
  messagingSenderId: '999418370792',
  appId: '1:999418370792:web:bd3943f4a89f006271875d',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

const provider = new GoogleAuthProvider()
provider.addScope('https://www.googleapis.com/auth/cloud-platform')
provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly')

const INVOKER_SA = import.meta.env.VITE_INVOKER_SA as string
const CLOUD_RUN_URL = import.meta.env.VITE_CLOUD_RUN_URL as string
const IAM_ENDPOINT = `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${INVOKER_SA}:generateIdToken`

const KEY_ACCESS = 'g_access_token'
const KEY_CR_TOKEN = 'cr_token'
const KEY_CR_EXPIRY = 'cr_token_expiry'

let accessToken: string | null = sessionStorage.getItem(KEY_ACCESS)
let crToken: string | null = sessionStorage.getItem(KEY_CR_TOKEN)
let crExpiry: number = Number(sessionStorage.getItem(KEY_CR_EXPIRY) ?? 0)

async function fetchCloudRunToken(oauthToken: string): Promise<string | null> {
  try {
    const res = await fetch(IAM_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${oauthToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audience: CLOUD_RUN_URL, includeEmail: true }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const token: string = data.token
    const expiry = Date.now() + 55 * 60 * 1000
    crToken = token
    crExpiry = expiry
    sessionStorage.setItem(KEY_CR_TOKEN, token)
    sessionStorage.setItem(KEY_CR_EXPIRY, String(expiry))
    return token
  } catch {
    return null
  }
}

export function getAccessToken(): string | null {
  return accessToken
}

export async function getCloudRunToken(): Promise<string | null> {
  if (crToken && Date.now() < crExpiry) return crToken
  if (!accessToken) return null
  return fetchCloudRunToken(accessToken)
}

export async function signInWithGoogle(): Promise<void> {
  const result = await signInWithPopup(auth, provider)
  const credential = GoogleAuthProvider.credentialFromResult(result)
  if (credential?.accessToken) {
    accessToken = credential.accessToken
    sessionStorage.setItem(KEY_ACCESS, accessToken)
    await fetchCloudRunToken(accessToken)
  }
}

export function signOutUser() {
  accessToken = null
  crToken = null
  crExpiry = 0
  sessionStorage.removeItem(KEY_ACCESS)
  sessionStorage.removeItem(KEY_CR_TOKEN)
  sessionStorage.removeItem(KEY_CR_EXPIRY)
  return signOut(auth)
}

export function onAuthChanged(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb)
}
