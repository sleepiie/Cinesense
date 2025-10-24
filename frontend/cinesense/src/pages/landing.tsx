"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCurrentUser } from "@/services/api";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // รูปภาพยนต์ตัวอย่างจาก local
  const movieImages = [
    "/movies/superman.jpg",
    "/movies/superman.jpg", 
    "/movies/superman.jpg",
    "/movies/superman.jpg",
    "/movies/superman.jpg"
  ];

  // ตรวจสอบ user session เมื่อ component โหลด
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        
        // ถ้ามี user ให้ redirect ไปหน้า home
        if (userData) {
          router.push("/");
        }
      } catch (error) {
        console.log("LandingPage: ไม่มี user session");
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % movieImages.length
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [movieImages.length]);

  return (
    <div className="main-content">
      <div className="background-container"></div>
      
      <div className="landing-container" style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh",
        padding: "2rem 4rem",
        maxWidth: "1400px",
        margin: "0 auto",
        gap: "6rem",
        width: "100%",
        boxSizing: "border-box"
      }}>
        {/* Left side - Text content */}
        <div className="landing-text" style={{ 
          flex: "1",
          textAlign: "left",
          minWidth: "0"
        }}>
          <h1 style={{ 
            fontSize: "3.5rem", 
            fontWeight: "bold", 
            marginBottom: "1.5rem",
            color: "#fff",
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            lineHeight: "1.2"
          }}>
            🎬 Welcome to CINESENSE
          </h1>
          
          <p style={{ 
            fontSize: "1.3rem", 
            marginBottom: "2rem", 
            color: "#ccc",
            lineHeight: "1.6",
            maxWidth: "500px"
          }}>
            ค้นพบหนังที่คุณชื่นชอบและรับคำแนะนำหนังใหม่ ๆ ที่ตรงกับรสนิยมของคุณ
          </p>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "1.5rem" }}>
            <button 
              className="start-btn" 
              onClick={() => router.push("/register")}
              style={{
                fontSize: "1.3rem",
                padding: "1.2rem 2.5rem",
                minWidth: "220px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(45deg, #f6121d, #ff4f4f)",
                color: "white",
                cursor: "pointer",
                transition: "transform 0.2s ease",
                boxShadow: "0 4px 15px rgba(0, 123, 255, 0.3)"
              }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.transform = "translateY(-2px)"}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.transform = "translateY(0)"}
            >
              Get Started
            </button>
            
            <p style={{ 
              color: "#999", 
              fontSize: "1rem",
              margin: "0"
            }}>
              Already have an account?{" "}
              <span 
                onClick={() => router.push("/login")}
                style={{ 
                  color: "#007bff", 
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontWeight: "500"
                }}
              >
                Login
              </span>
            </p>
          </div>
        </div>

        {/* Right side - Movie Carousel */}
        <div style={{ 
          flex: "1",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minWidth: "0"
        }}>
          <div className="landing-carousel" style={{
            position: "relative",
            width: "300px",
            height: "450px",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
          }}>
            <Image
              src={movieImages[currentImageIndex]}
              alt={`Movie ${currentImageIndex + 1}`}
              fill
              style={{
                objectFit: "cover",
                transition: "opacity 0.5s ease-in-out"
              }}
            />
            
            {/* Carousel indicators */}
            <div style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "8px"
            }}>
              {movieImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    border: "none",
                    background: index === currentImageIndex ? "#fff" : "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    transition: "background 0.3s ease"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
