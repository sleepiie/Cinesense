"use client";
import { useState } from "react";

export default function StarRating() {
  const [rating, setRating] = useState(0);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((v) => (
        <i
          key={v}
          className={`fas fa-star ${v <= rating ? "active" : ""}`}
          onClick={() => setRating(v)}
        ></i>
      ))}
    </div>
  );
}
