"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { registerUser } from "@/services";

export default function RegisterPage() {
  const [step, setStep] = useState("intro"); 
  const [searchQuery, setSearchQuery] = useState("");

  const handleHeaderSearch = (query: string) => {
    setSearchQuery(query);
    setStep("loading");
    setTimeout(() => setStep("results"), 2000);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = {
      username: e.currentTarget.username.value,
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
    };

    try {
      const res = await registerUser(formData);
      alert(res.message);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการสมัครสมาชิก");
    }
  };

  return (
    <div className="register-page">
      <Header onSearch={handleHeaderSearch} />
      <div className="register-page__background"></div>
      <div className="register-page__overlay"></div>
      <div className="register-page__form-container">
        <form className="register-form" onSubmit={handleRegister}>
          <h2>สมัครสมาชิก</h2>
          <div className="form-group">
            <label htmlFor="username">ชื่อผู้ใช้</label>
            <input type="text" id="username" name="username" placeholder="กรอกชื่อผู้ใช้" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">อีเมล</label>
            <input type="email" id="email" name="email" placeholder="กรอกอีเมล" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">รหัสผ่าน</label>
            <input type="password" id="password" name="password" placeholder="กรอกรหัสผ่าน" required />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
            <input type="password" id="confirmPassword" name="confirmPassword" placeholder="ยืนยันรหัสผ่าน" required />
          </div>
          <button type="submit">สมัครสมาชิก</button>
          <p>มีบัญชีอยู่แล้ว? <a href="/login">เข้าสู่ระบบ</a></p>
        </form>
      </div>
    </div>
  );
}
