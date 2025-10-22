"use client";
import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { auth } from "@/lib/firebase.client";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { user } = useAuth();
  const r = useRouter();
  const [email,setEmail] = useState("");
  const [pw,setPw] = useState("");

  const signup = async () => { await createUserWithEmailAndPassword(auth,email,pw); r.push("/"); };
  const signin = async () => { await signInWithEmailAndPassword(auth,email,pw); r.push("/"); };
  const logout = async () => { await signOut(auth); r.push("/"); };

  return (
    <main>
      <h2>Login</h2>
      {user ? (
        <>
          <p>Signed in as {user.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input placeholder="password" type="password" value={pw} onChange={e=>setPw(e.target.value)} />
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button onClick={signin}>Sign in</button>
            <button onClick={signup}>Sign up</button>
          </div>
        </>
      )}
    </main>
  );
}
