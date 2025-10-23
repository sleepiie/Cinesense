"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="main-content">
      <div className="background-container"></div>

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
    </div>
  );
}
