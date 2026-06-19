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

let googleIdToken: string | null = null
let tokenObtainedAt: number = 0

export async function signInWithGoogle(): Promise<string> {
  const result = await signInWithPopup(auth, provider)
  const credential = GoogleAuthProvider.credentialFromResult(result)
  googleIdToken = credential?.idToken ?? null
  tokenObtainedAt = Date.now()
  return googleIdToken!
}

export function getValidToken(): string | null {
  const elapsed = Date.now() - tokenObtainedAt
  if (!googleIdToken || elapsed > 50 * 60 * 1000) {
    return null
  }
  return googleIdToken
}

export function signOutUser() {
  googleIdToken = null
  tokenObtainedAt = 0
  return signOut(auth)
}

export function onAuthChanged(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb)
}
