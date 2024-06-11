import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyATuFE0lXiS-gIvOzrArMLaD1kSCnM4y2s",
  authDomain: "blog-application-999.firebaseapp.com",
  projectId: "blog-application-999",
  storageBucket: "blog-application-999.appspot.com",
  messagingSenderId: "894729147987",
  appId: "1:894729147987:web:779419d750c605ed2198a6",
};

const app = initializeApp(firebaseConfig);

//google auth

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {
  let user = null;

  try {
    const result = await signInWithPopup(auth, provider);
    user = result.user;
  } catch (error) {
    console.log(error);
  }

  //   const result = await signInWithPopup(auth, provider)
  //     .then((result) => {
  //       console.log(result);
  //       user = result.user;
  //       console.log(user);
  //     })
  //     .catch((err) => console.log(err));

  return user;
};

