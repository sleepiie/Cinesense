"use client";

import Header from "@/components/Header";
import IntroBox from "@/components/IntroBox";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MovieForm from "@/components/MovieForm";
import LoadingScreen from "@/components/LoadingScreen";
import ResultScreen from "@/components/ResultScreen";
import { recommendMovie } from "@/services";
import { getCurrentUser } from "@/services/api";

export default function HomePage() {
  const [step, setStep] = useState("intro");
  const [searchQuery, setSearchQuery] = useState("");
  const [movie, setMovie] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();

  // ตรวจสอบว่า user login หรือยัง
  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser(); // mock API หรือ localStorage
      if (!user) {
        router.push("/login");
      } else {
        setLoadingUser(false); // user login แล้ว
      }
    };
    checkUser();
  }, [router]);

  const handleStart = () => setStep("form");

  const handleSubmit = async (formData: any) => {
    setStep("loading");
    try {
      const result = await recommendMovie(formData);
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

  // ถ้ายังโหลด user อยู่ แสดง loading
  if (loadingUser) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      <div className="background-container"></div>
      <Header onSearch={handleHeaderSearch} />

      {step === "intro" && <IntroBox onStart={handleStart} />}
      {step === "form" && (
        <MovieForm onSubmit={handleSubmit} onClose={() => setStep("intro")} />
      )}
      {step === "loading" && <LoadingScreen />}
      {step === "results" && movie && (
        <ResultScreen
          onClose={() => setStep("intro")}
          query={searchQuery}
          movie={movie}
        />
      )}
    </div>
  );
}
