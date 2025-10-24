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
      try {
        const userData = await getCurrentUser();
        setUser(userData); // userData จะเป็น null หรือ { user_id, username, ... }
        console.log("HomePage: ได้ข้อมูล user:", userData);
        
        // ถ้าไม่มี user ให้ redirect ไปหน้า landing
        if (!userData) {
          router.push("/landing");
        }
      } catch (error) {
        console.log("HomePage: ไม่มี user session หรือ session หมดอายุ");
        setUser(null);
        // ถ้าไม่มี session ให้ redirect ไปหน้า landing
        router.push("/landing");
      }
    };
    fetchUser();
  }, [router]); // เพิ่ม router ใน dependency array

  console.log("2. ค่า user ใน Render body:", user);
  const handleStart = () => setStep("form");

  const handleSubmit = async (selectedMovie: any) => {
    setStep("loading");
    try {
      // จำลองการประมวลผล
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Selected Movie:", selectedMovie);
      setMovie(selectedMovie);
      setSearchQuery(selectedMovie.title);
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

  // ถ้าไม่มี user ให้แสดง loading หรือ redirect
  if (!user) {
    return (
      <div className="main-content">
        <div className="background-container"></div>
        <div className="loading-screen">
          <p>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="background-container"></div>
      
      {/* 5. ส่ง user และ setUser ไปให้ Header */}
      <Header onSearch={handleHeaderSearch} user={user} setUser={setUser} />

      {/* 6. แสดง IntroBox สำหรับผู้ใช้ที่ login แล้ว */}
      {step === "intro" && <IntroBox onStart={handleStart} user={user} />}
      
      {step === "form" && <MovieForm onClose={() => setStep("intro")} onSubmit={handleSubmit} />}
      {step === "loading" && <LoadingScreen />}
      {step === "results" && movie && (
        <ResultScreen onClose={() => setStep("intro")} query={searchQuery} movie={movie} />
      )}
    </div>

  );
}