"use client";

import { useState, useEffect } from "react";
import { voteMovie } from "@/services/api";

export default function ResultScreen({ onClose, query, movie }) {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(60);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    let interval;
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTime]);

  const handleStarClick = async (value) => {
    if (cooldownTime > 0 || hasVoted) {
      return;
    }

    setRating(value);
    setIsVoting(true);
    setVoteError(null);

    try {
      const response = await voteMovie(
        movie?.movie_id || movie?.id, 
        value, 
        movie?.poster || movie?.movie_poster || "", 
        movie?.title || movie?.movie_name || ""
      );
      console.log("Vote submitted successfully:", response);
      setSubmitted(true);
      setHasVoted(true);
    } catch (err) {
      console.error("Error submitting vote:", err);
      setVoteError("ไม่สามารถบันทึกคะแนนได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsVoting(false);
    }
  };

  const getStreamingIcon = (service) => {
    const iconPaths = {
      "Netflix": "/icons/netflix.png",
      "Disney+": "/icons/disney-plus.png", 
      "HBO Max": "/icons/hbo-max.png",
      "Amazon Prime Video": "/icons/amazon-prime.png",
      "Apple TV": "/icons/apple-tv.png",
      "Apple TV+": "/icons/apple-tv.png",
      "Hulu": "/icons/hulu.png"
    };
    
    const iconPath = iconPaths[service];

    if (iconPath) {
      return (
        <img 
          src={iconPath} 
          alt={service}
          className="streaming-icon-img"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      );
    }

    return null;
  };

  const availableServices = movie?.streaming_services?.filter(service => service !== "N/A") || [];
  const shouldShowNA = movie?.streaming_services?.includes("N/A") && availableServices.length === 0;

  return (
    <div className="screen">
      <div
        className="screen-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="close-button" 
          onClick={onClose}
          type="button"
          aria-label="ปิดผลลัพธ์"
        >
          <i className="fas fa-times"></i>
        </button>
        <h3>นี่คือภาพยนตร์ที่เหมาะกับคุณ</h3>

        <div className="movie-card">
          <img
            src={movie?.poster || "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg"}
            alt={movie?.title || "Movie Poster"}
            className="movie-poster"
          />
          
          <div className="movie-info">
            <h2>{movie?.title || "DUNE"}</h2>
            <p className="movie-genres">{movie?.genres?.join(", ") || "Unknown"}</p>
            
            <div className="streaming-info">
              <span className="streaming-text">Available on :</span>
              <div className="streaming-icons">

                {availableServices.length > 0 ? (
                  availableServices.map((service, index) => {
                    const icon = getStreamingIcon(service);

                    return icon ? (
                      <div key={index} className="streaming-icon-container">
                        {icon}
                      </div>
                    ) : null; 
                  })
                ) : shouldShowNA || !movie?.streaming_services?.length ? (
                
                  <div className="streaming-icon-container">
                    <span className="streaming-fallback">📺</span>
                  </div>
                ) : null}
              </div>
            </div>

            <h4>เรื่องย่อ</h4>
            <p className="synopsis">
              {movie?.synopsis || "ไม่มีข้อมูลเรื่องย่อ"}
            </p>

            <div className="rating-section">
              <p>คุณคิดว่าเราแนะนำได้ดีแค่ไหน?</p>
              
              {/* Cooldown message */}
              {cooldownTime > 0 && (
                <div className="cooldown-message">
                  <p className="cooldown-text">
                    ⏰ กรุณารอ {cooldownTime} วินาที ก่อนจะโหวตได้
                  </p>
                  <p className="suggestion-text">
                    💡 แนะนำให้ลองดูภาพยนตร์ก่อนโหวต เพื่อให้คะแนนที่แม่นยำมากขึ้น
                  </p>
                </div>
              )}
              
              {/* Already voted message */}
              {hasVoted && (
                <div className="voted-message">
                  <p className="voted-text">
                    ✅ คุณได้โหวตแล้ว ขอบคุณสำหรับคะแนนของคุณ!
                  </p>
                </div>
              )}
              
              {/* Voting error message */}
              {voteError && (
                <div className="error-message">
                  <p className="error-text">{voteError}</p>
                </div>
              )}
              
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((v) => (
                  <i
                    key={v}
                    className={`fas fa-star ${v <= rating ? "active" : ""} ${
                      cooldownTime > 0 || hasVoted ? "disabled" : ""
                    } ${isVoting ? "loading" : ""}`}
                    onClick={() => handleStarClick(v)}
                    style={{
                      cursor: cooldownTime > 0 || hasVoted ? "not-allowed" : "pointer",
                      opacity: cooldownTime > 0 || hasVoted ? 0.5 : 1
                    }}
                  ></i>
                ))}
              </div>
              
              {isVoting && <p className="voting-text">กำลังบันทึกคะแนน...</p>}
            </div>

            {submitted && hasVoted && (
              <p className="thank-you">ขอบคุณสำหรับคะแนนของคุณ!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}