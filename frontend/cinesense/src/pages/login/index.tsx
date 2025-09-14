"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { loginUser } from "@/services/api"; 

export default function LoginPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState(""); // state สำหรับเก็บข้อความ error

  const handleHeaderSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(""); // เคลียร์ข้อความเดิมก่อน

    const formData = {
      username: e.currentTarget.username.value,
      password: e.currentTarget.password.value,
    };

    try {
      const res = await loginUser(formData);
      if (res["message"] == "Login successful!") {
        // login สำเร็จ → redirect หรือทำอะไรต่อ
        window.location.href = "/"; // ตัวอย่าง redirect
      } else {
        // login fail → แสดงข้อความใต้ password
        console.log(res)
        setErrorMsg(res.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
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
            <input
              type="text"
              id="username"
              name="username"
              placeholder="กรอกชื่อผู้ใช้"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="กรอกรหัสผ่าน"
              required
            />
            {errorMsg && (
              <p className="error-msg" style={{ color: "red", marginTop: "0.7rem" }}>
                {errorMsg}
              </p>
            )}
          </div>
          <button type="submit">Login</button>
          <p>
            ยังไม่มีบัญชี? <a href="/register">สมัครสมาชิก</a>
          </p>
        </form>
      </div>
    </div>
  );
}
