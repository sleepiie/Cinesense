"use client";

import { getCurrentUser } from "@/services/api";
import { useState, useEffect } from "react"; // 1. เพิ่ม useEffect
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { loginUser } from "@/services/api";

export default function LoginPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const [user, setUser] = useState<any>(null); // 2. เพิ่ม user state

  // 3. เพิ่ม useEffect เพื่อดึงข้อมูล user (เผื่อกรณีกดเข้ามาหน้า login ทั้งที่ login อยู่แล้ว)
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
    };
    fetchUser();
  }, []);

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
      console.log("Attempting login...");
      const res = await loginUser(formData);
      
      console.log("Login response:", res);

      if (res.error) {
        console.log("Login error:", res.error);
        setErrorMsg(res.error);
        return;
      }

      if (res.message === "Login successful!") {
        alert("done");
        console.log("Login successful! Checking session...");
        
        const userData = await getCurrentUser();
        console.log("Current user data:", userData);
        
        setUser(userData); // 4. อัปเดต user state หลัง login สำเร็จ
        
        router.push("/");
        // router.refresh();
      } else {
        console.log("Login failed with message:", res.message);
        setErrorMsg(res.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  };

  return (
    <div className="login-page">
      {/* 5. ส่ง user และ setUser ให้ Header */}
      <Header onSearch={handleHeaderSearch} user={user} setUser={setUser} />
      
      <div className="login-page__background"></div>
      <div className="login-page__overlay"></div>
      <div className="login-page__form-container">
        <form className="login-form" onSubmit={handleLogin}>
          {/* ... (ส่วนที่เหลือของ form เหมือนเดิม) ... */}
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