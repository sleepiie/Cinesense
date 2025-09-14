"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { loginUser } from "@/services"; // ✅ ใช้ services

export default function LoginPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleHeaderSearch = (query: string) => {
    setSearchQuery(query);
    // ถ้า backend ยังไม่พร้อมสามารถ mock แบบง่าย
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = {
      username: e.currentTarget.username.value,
      password: e.currentTarget.password.value,
    };

    try {
      const res = await loginUser(formData);
      alert(res.message);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  };

  return (
    <div className="login-page">
      <Header onSearch={handleHeaderSearch} />
      <div className="login-page__background"></div>
      <div className="login-page__overlay"></div>
      <div className="login-page__form-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>เข้าสู่ระบบ</h2>
          <div className="form-group">
            <label htmlFor="username">ชื่อผู้ใช้</label>
            <input type="text" id="username" name="username" placeholder="กรอกชื่อผู้ใช้" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">รหัสผ่าน</label>
            <input type="password" id="password" name="password" placeholder="กรอกรหัสผ่าน" required />
          </div>
          <button type="submit">Login</button>
          <p>ยังไม่มีบัญชี? <a href="/register">สมัครสมาชิก</a></p>
        </form>
      </div>
    </div>
  );
}
