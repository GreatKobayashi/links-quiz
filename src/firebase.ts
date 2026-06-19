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

// GIS token (iss: https://accounts.google.com) for Cloud Run auth
const GIS_CLIENT_ID = '999418370792-efsgns67rn9qsbh38aauf6sguh4boklh.apps.googleusercontent.com'
const GIS_TOKEN_KEY = 'gis_token'
const GIS_TOKEN_TIME_KEY = 'gis_token_time'
const TOKEN_TTL_MS = 55 * 60 * 1000 // 55 minutes

let gisToken: string | null = sessionStorage.getItem(GIS_TOKEN_KEY)
let gisTokenTime: number = Number(sessionStorage.getItem(GIS_TOKEN_TIME_KEY) ?? 0)

function isTokenValid(): boolean {
  return !!gisToken && Date.now() - gisTokenTime < TOKEN_TTL_MS
}

function saveGisToken(token: string) {
  gisToken = token
  gisTokenTime = Date.now()
  sessionStorage.setItem(GIS_TOKEN_KEY, token)
  sessionStorage.setItem(GIS_TOKEN_TIME_KEY, String(gisTokenTime))
}

function requestGisTokenSilent(): Promise<string> {
  return new Promise((resolve, reject) => {
    const g = (window as any).google
    if (!g?.accounts?.id) { reject(new Error('GIS not loaded')); return }

    let resolved = false
    g.accounts.id.initialize({
      client_id: GIS_CLIENT_ID,
      auto_select: true,
      callback: (resp: { credential: string }) => {
        resolved = true
        saveGisToken(resp.credential)
        resolve(resp.credential)
      },
    })
    g.accounts.id.prompt((notification: any) => {
      if (!resolved && (notification.isNotDisplayed() || notification.isSkippedMoment())) {
        reject(new Error('GIS skipped'))
      }
    })
    setTimeout(() => { if (!resolved) reject(new Error('GIS timeout')) }, 5000)
  })
}

export function getCloudRunToken(): string | null {
  return isTokenValid() ? gisToken : null
}

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(auth, provider)
  // After Firebase sign-in, try GIS silent token acquisition
  try {
    await requestGisTokenSilent()
  } catch {
    // GIS silent failed; token will be fetched on next call if needed
  }
}

export async function ensureCloudRunToken(): Promise<string | null> {
  if (isTokenValid()) return gisToken
  try {
    return await requestGisTokenSilent()
  } catch {
    return null
  }
}

export function signOutUser() {
  gisToken = null
  gisTokenTime = 0
  sessionStorage.removeItem(GIS_TOKEN_KEY)
  sessionStorage.removeItem(GIS_TOKEN_TIME_KEY)
  const g = (window as any).google
  g?.accounts?.id?.disableAutoSelect()
  return signOut(auth)
}

export function onAuthChanged(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb)
}
