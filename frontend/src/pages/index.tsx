"use client";

import Header from "@/components/Header";
import IntroBox from "@/components/IntroBox";
import { useState } from "react";
import MovieForm from "@/components/MovieForm";
import LoadingScreen from "@/components/LoadingScreen";
import ResultScreen from "@/components/ResultScreen";

import { recommendMovie } from "@/services"; // ✅ ใช้ services

export default function HomePage() {
  const [step, setStep] = useState("intro"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [movie, setMovie] = useState<any>(null);

  const handleStart = () => setStep("form");

  // ส่ง MovieForm
  const handleSubmit = async (formData: any) => {
    setStep("loading");
    try {
      const result = await recommendMovie(formData);
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

  // ค้นหาจาก Header
  const handleHeaderSearch = async (query: string) => {
    setSearchQuery(query);
    setStep("loading");

    // ถ้ายังไม่มี backend สำหรับ search สามารถ mock แบบง่าย
    setTimeout(() => setStep("results"), 1500);
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      <div className="background-container"></div>
      <Header onSearch={handleHeaderSearch} />

      {step === "intro" && <IntroBox onStart={handleStart} />}
      {step === "form" && <MovieForm onSubmit={handleSubmit} onClose={() => setStep("intro")} />}
      {step === "loading" && <LoadingScreen />}
      {step === "results" && movie && (
        <ResultScreen onClose={() => setStep("intro")} query={searchQuery} movie={movie} />
      )}
    </div>
  );
}
