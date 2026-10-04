let firebaseApp = null;
let authInstance = null;
let currentUser = null;
let authListeners = [];
let authReady = false;

function initFirebase() {
  if (firebaseApp || typeof firebase === 'undefined') return;
  if (typeof window.__FIREBASE_CONFIG__ === 'undefined') return;
  firebaseApp = firebase.initializeApp(window.__FIREBASE_CONFIG__);
  authInstance = firebase.auth();

  authInstance.onAuthStateChanged((user) => {
    currentUser = user;
    authReady = true;
    authListeners.forEach((fn) => fn(user));
  });
}

function isAuthReady() {
  return authReady;
}

function onAuthChange(fn) {
  authListeners.push(fn);
  if (currentUser !== null) fn(currentUser);
}

function getCurrentUser() {
  return currentUser;
}

function isAuthenticated() {
  return currentUser !== null;
}

function signIn(email, password) {
  if (!authInstance) return Promise.reject(new Error('Auth not initialized'));
  return authInstance.signInWithEmailAndPassword(email, password);
}

function signUp(email, password) {
  if (!authInstance) return Promise.reject(new Error('Auth not initialized'));
  return authInstance.createUserWithEmailAndPassword(email, password);
}

function signInWithGoogle() {
  if (!authInstance) return Promise.reject(new Error('Auth not initialized'));
  const provider = new firebase.auth.GoogleAuthProvider();
  return authInstance.signInWithPopup(provider);
}

function signOut() {
  if (!authInstance) return Promise.reject(new Error('Auth not initialized'));
  return authInstance.signOut();
}
