"use client";

import { useState } from "react";

export default function ResultScreen({ onClose, query, movie }) {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleStarClick = (value) => {
    setRating(value);

    // ส่ง rating ไป backend
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
        setSubmitted(true); // แสดงข้อความขอบคุณ
      })
      .catch((err) => console.error("Error submitting rating:", err));
  };

  return (
    <div className="screen" onClick={onClose}>
      <div
        className="screen-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>ผลลัพธ์สำหรับ: {query || "ภาพยนตร์ที่เหมาะกับคุณ"}</h3>

        <img
          src={movie?.poster || "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg"}
          alt={movie?.title || "Movie Poster"}
          width={"50%"}
        />
        <h3>{movie?.title || "DUNE"}</h3>
        <p className="gray-text">{movie?.genres || "Sci-Fi, Action, Adventure"}</p>

        <h4>เรื่องย่อ</h4>
        <p className="gray-text">
          {movie?.overview || "Cobb is a skilled thief who commits corporate espionage..."}
        </p>

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

        {submitted && <p style={{ marginTop: "1rem", color: "#ffc107" }}>ขอบคุณสำหรับคะแนนของคุณ!</p>}
      </div>
    </div>
  );
}
