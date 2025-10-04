"use client";

import { getCurrentUser } from "@/services/api";
import { useState } from "react";
import { useRouter } from "next/navigation"; // ← เพิ่ม import
import Header from "@/components/Header";
import { loginUser } from "@/services/api";

export default function LoginPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter(); // ← เพิ่ม

  const handleHeaderSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    const formData = {
      username: e.currentTarget.username.value,
      password: e.currentTarget.password.value,
    };

    try {
      console.log("Attempting login..."); // ← เพิ่ม log
      const res = await loginUser(formData);
      
      console.log("Login response:", res); // ← เพิ่ม log เพื่อดูผลลัพธ์

      // ← แก้การเช็ค error
      if (res.error) {
        console.log("Login error:", res.error); // ← เพิ่ม log
        setErrorMsg(res.error);
        return;
      }

      if (res.message === "Login successful!") {
        alert("done")
        console.log("Login successful! Checking session..."); // ← เพิ่ม log
        
        // ทดสอบเรียก getCurrentUser
        const userData = await getCurrentUser();
        console.log("Current user data:", userData); // ← ควรเห็นข้อมูล user

        // ใช้ router แทน window.location.href
        router.push("/");
        router.refresh();
      } else {
        console.log("Login failed with message:", res.message); // ← เพิ่ม log
        setErrorMsg(res.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      console.error("Login error:", err); // ← เพิ่ม log
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