"use client";

import Header from "@/components/Header";
import IntroBox from "@/components/IntroBox";
import { useState, useEffect } from "react"; // 1. เพิ่ม useEffect
import MovieForm from "@/components/MovieForm";
import LoadingScreen from "@/components/LoadingScreen";
import ResultScreen from "@/components/ResultScreen";
import { getCurrentUser } from "@/services/api";
import { submitMood } from "@/services/api"; // 2. เพิ่ม getCurrentUser
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [step, setStep] = useState("intro");
  const [searchQuery, setSearchQuery] = useState("");
  const [movie, setMovie] = useState<any>(null);
  const [user, setUser] = useState<any>(null); // 3. เพิ่ม user state
  const router = useRouter();

  // 4. เพิ่ม useEffect เพื่อดึงข้อมูล user เมื่อ component โหลด
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData); // userData จะเป็น null หรือ { user_id, username, ... }
      console.log("HomePage: ได้ข้อมูล user:", userData);
    };
    fetchUser();
  }, []); // [] หมายถึงให้รันแค่ครั้งเดียวตอนโหลด

  console.log("2. ค่า user ใน Render body:", user);
  const handleStart = () => setStep("form");

  const handleSubmit = async (formData: any) => {
    setStep("loading");
    try {
      const result = await submitMood(formData);
      console.log("Movie API Result:", result);
      setMovie(result);
      setSearchQuery(result.title);
      setStep("results");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
      setStep("intro");
    }
  };

  const handleHeaderSearch = async (query: string) => {
    setSearchQuery(query);
    setStep("loading");

    setTimeout(() => setStep("results"), 1500);
  };

  return (
    <div className="main-content">
      <div className="background-container"></div>
      
      {/* 5. ส่ง user และ setUser ไปให้ Header */}
      <Header onSearch={handleHeaderSearch} user={user} setUser={setUser} />

      {/* 6. แสดง landing page หรือ IntroBox ตามสถานะ user */}
      {step === "intro" && !user && (
        <div className="intro-box">
          <h1>🎬 Welcome to CINESENSE</h1>
          <p>ค้นพบหนังที่คุณชื่นชอบและรับคำแนะนำหนังใหม่ ๆ ที่ตรงกับรสนิยมของคุณ</p>

          {/* ฟีเจอร์แนะนำเว็บสั้น ๆ */}
          <ul style={{ listStyle: "disc", margin: "1rem 0 2rem 1.5rem", color: "#ccc" }}>
            <li>ค้นหาหนังใหม่และหนังคลาสสิกได้ทันที</li>
            <li>ระบบแนะนำหนังตามความชอบของคุณ</li>
            <li>สร้างรายการโปรดและติดตามหนังที่ชอบ</li>
          </ul>

          <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
            <button className="start-btn" onClick={() => router.push("/login")}>
              Login
            </button>
            <button className="start-btn" onClick={() => router.push("/register")}>
              Register
            </button>
          </div>
        </div>
      )}
      
      {step === "intro" && user && <IntroBox onStart={handleStart} user={user} />}
      
      {step === "form" && <MovieForm onClose={() => setStep("intro")} />}
      {step === "loading" && <LoadingScreen />}
      {step === "results" && movie && (
        <ResultScreen onClose={() => setStep("intro")} query={searchQuery} movie={movie} />
      )}
    </div>
  );
}