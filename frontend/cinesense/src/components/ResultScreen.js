"use client";

import { useState } from "react";

export default function ResultScreen({ onClose, query, movie }) {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleStarClick = (value) => {
    setRating(value);

    fetch("/api/submit-rating", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movieId: movie?.id || "unknown_movie",
        starRating: value,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Rating submitted:", data);
        setSubmitted(true);
      })
      .catch((err) => console.error("Error submitting rating:", err));
  };

  // ฟังก์ชันสำหรับแสดง streaming icon
  const getStreamingIcon = (service) => {
    const iconPaths = {
      "Netflix": "/icons/netflix.png",
      "Disney+": "/icons/disney-plus.png", 
      "HBO Max": "/icons/hbo-max.png",
      "Amazon Prime": "/icons/amazon-prime.png",
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
            e.target.nextSibling.style.display = 'inline';
          }}
        />
      );
    }
    
    // Fallback emoji
    return "📺";
  };

  return (
    <div className="screen" onClick={onClose}>
      <div
        className="screen-content"
        onClick={(e) => e.stopPropagation()}
      >
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
                {movie?.streaming_services?.length > 0 ? (
                  movie.streaming_services.map((service, index) => (
                    <div key={index} className="streaming-icon-container">
                      {getStreamingIcon(service)}
                      <span className="streaming-fallback" style={{display: 'none'}}>📺</span>
                    </div>
                  ))
                ) : (
                  <div className="streaming-icon-container">
                    <span className="streaming-fallback">📺</span>
                  </div>
                )}
              </div>
            </div>

            <h4>เรื่องย่อ</h4>
            <p className="synopsis">
              {movie?.synopsis || "ไม่มีข้อมูลเรื่องย่อ"}
            </p>

            <div className="rating-section">
              <p>คุณคิดว่าเราแนะนำได้ดีแค่ไหน?</p>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((v) => (
                  <i
                    key={v}
                    className={`fas fa-star ${v <= rating ? "active" : ""}`}
                    onClick={() => handleStarClick(v)}
                  ></i>
                ))}
              </div>
            </div>

            {submitted && <p className="thank-you">ขอบคุณสำหรับคะแนนของคุณ!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
