// app/page.jsx
"use client";
import { useState} from "react";
import { useRouter } from "next/navigation";
import LeftSide from "./components/leftside";
import AuthForm from "./components/authform";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  return (
    <div className="min-h-screen flex bg-[#020617] font-sans">
      <LeftSide />
      <div className="flex flex-[0.8] h-screen justify-center items-center px-4 py-6 ">
        <AuthForm mode={mode} setMode={setMode} router={router} />
      </div>
    </div>
  );
}