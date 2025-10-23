"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function RegisterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) router.push("/home");
  }, [router]);

  const handleHeaderSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const username = e.currentTarget.username.value;
    const password = e.currentTarget.password.value;
    const confirmPassword = e.currentTarget.confirmPassword.value;

    if (password !== confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน");
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    if (storedUsers.find((u: any) => u.username === username)) {
      alert("ชื่อผู้ใช้นี้ถูกใช้งานแล้ว");
      return;
    }

    storedUsers.push({ username, password });
    localStorage.setItem("users", JSON.stringify(storedUsers));
    localStorage.setItem("currentUser", JSON.stringify({ username }));

    alert("สมัครสมาชิกสำเร็จ!");
    router.push("/home");
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
