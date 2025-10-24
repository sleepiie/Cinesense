"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getWatchHistory } from "@/services/api";
import Header from "@/components/Header";
import Link from "next/link";

interface WatchHistoryItem {
  watch_id: number;
  movie_id: string;
  vote: number;
  movie_poster: string;
  movie_name: string;
}

interface WatchHistoryData {
  message: string;
  total_watched: number;
  watch_history: WatchHistoryItem[];
}

export default function WatchHistoryPage() {
  const [user, setUser] = useState<any>(null);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ตรวจสอบ user session
        const userData = await getCurrentUser();
        if (!userData) {
          router.push("/landing");
          return;
        }
        setUser(userData);

        // ดึงประวัติการรับชม
        const historyData = await getWatchHistory();
        setWatchHistory(historyData);
        } catch (err) {
          console.error("Error fetching data:", err);
          const errorMessage = err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลได้";
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
    };

    fetchData();
  }, [router]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i
        key={index}
        className={`fas fa-star ${index < rating ? "active" : ""}`}
        style={{ color: index < rating ? "#ffd700" : "#ddd" }}
      ></i>
    ));
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="background-container"></div>
        <div className="loading-screen">
          <p>กำลังโหลดประวัติการรับชม...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="background-container"></div>
        <Header user={user} setUser={setUser} onSearch={() => {}} />
        <div className="error-container">
          <h2>เกิดข้อผิดพลาด</h2>
          <p>{error}</p>
          <Link href="/" className="back-button">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="background-container"></div>
      <Header user={user} setUser={setUser} onSearch={() => {}} />
      
      <div className="watch-history-container">
        <div className="watch-history-header">
          <h1>ประวัติการรับชม</h1>
          <Link href="/" className="back-button">
            <i className="fas fa-arrow-left"></i> กลับหน้าหลัก
          </Link>
        </div>

        <div className="watch-history-content">
          {/* สถิติด้านซ้าย */}
          <div className="stats-sidebar">
            <div className="stats-box">
              <h3>สถิติการรับชม</h3>
              <div className="stat-item">
                <div className="stat-number">{watchHistory?.total_watched || 0}</div>
                <div className="stat-label">ภาพยนตร์ที่ดูแล้ว</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">
                  {watchHistory?.watch_history && watchHistory.watch_history.length > 0 
                    ? (watchHistory.watch_history.reduce((sum, item) => sum + item.vote, 0) / watchHistory.watch_history.length).toFixed(1)
                    : "0.0"
                  }
                </div>
                <div className="stat-label">คะแนนเฉลี่ยที่ให้</div>
              </div>
            </div>
          </div>

          {/* รายการประวัติการรับชม - 2 columns */}
          <div className="history-main">
            {watchHistory?.watch_history?.length === 0 ? (
              <div className="empty-history">
                <i className="fas fa-film"></i>
                <h3>ยังไม่มีประวัติการรับชม</h3>
                <p>เริ่มต้นการค้นหาภาพยนตร์ที่คุณชอบได้เลย!</p>
                <Link href="/" className="start-button">
                  เริ่มค้นหา
                </Link>
              </div>
            ) : (
              <div className="history-scroll-container">
                <div className="history-grid-2col">
                  {watchHistory?.watch_history?.map((item) => (
                    <div key={item.watch_id} className="history-card-compact">
                      <div className="movie-poster-compact">
                        <img
                          src={item.movie_poster || "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg"}
                          alt={item.movie_name}
                          onError={(e) => {
                            e.currentTarget.src = "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg";
                          }}
                        />
                      </div>
                      <div className="movie-info-compact">
                        <h3 className="movie-title-compact">{item.movie_name}</h3>
                        <div className="movie-rating-compact">
                          <div className="stars-compact">
                            {renderStars(item.vote)}
                          </div>
                          <span className="rating-number-compact">({item.vote}/5)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
