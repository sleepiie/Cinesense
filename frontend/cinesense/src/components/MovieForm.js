"use client";

import { useState } from "react";
import { submitMood } from "@/services/api";

export default function MovieForm({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = {
      q1: parseInt(e.target.happiness.value),
      q2: parseInt(e.target.energy.value),
      q3: parseInt(e.target.excitement.value),
      genre: e.target.genre.value,
    };

    try {
      const response = await submitMood(formData);
      console.log(formData);

      if (response.error) {
        setError(response.error);
        setResult(null);
      } else {
        setResult(response.result);
      }
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <form className="movie-form" onSubmit={handleSubmit}>
          <h2>ค้นหาภาพยนตร์ที่เหมาะกับคุณ</h2>

          {/* Q1 */}
          <div className="form-group">
            <label>1. ตอนนี้คุณรู้สึกอารมณ์ดีหรือมีความสุขมากแค่ไหน?</label>
            <div className="rating-group">
              <span className="label-text">หม่นหมอง</span>
              <div className="radio-options-container">
                {[1, 2, 3, 4, 5].map((v) => (
                  <div key={v}>
                    <input type="radio" id={`q1-${v}`} name="happiness" value={v} required />
                    <label htmlFor={`q1-${v}`} className="radio-label"></label>
                  </div>
                ))}
              </div>
              <span className="label-text">มีความสุข</span>
            </div>
          </div>

          {/* Q2 */}
          <div className="form-group">
            <label>2. ตอนนี้คุณรู้สึกมีพลังหรือกระตือรือร้นมากแค่ไหน?</label>
            <div className="rating-group">
              <span className="label-text">หมดแรง</span>
              <div className="radio-options-container">
                {[1, 2, 3, 4, 5].map((v) => (
                  <div key={v}>
                    <input type="radio" id={`q2-${v}`} name="energy" value={v} required />
                    <label htmlFor={`q2-${v}`} className="radio-label"></label>
                  </div>
                ))}
              </div>
              <span className="label-text">สดชื่นมาก</span>
            </div>
          </div>

          {/* Q3 */}
          <div className="form-group">
            <label>3. ตอนนี้คุณอยากดูหนังที่ให้ความรู้สึกสงบหรือเร้าใจมากกว่ากัน?</label>
            <div className="rating-group">
              <span className="label-text">สงบมาก</span>
              <div className="radio-options-container">
                {[1, 2, 3, 4, 5].map((v) => (
                  <div key={v}>
                    <input type="radio" id={`q3-${v}`} name="excitement" value={v} required />
                    <label htmlFor={`q3-${v}`} className="radio-label"></label>
                  </div>
                ))}
              </div>
              <span className="label-text">ตื่นเต้นมาก</span>
            </div>
          </div>

          {/* Genre */}
          <div className="form-group">
            <label htmlFor="genre"><strong>ประเภทหนังที่สนใจ</strong></label>
            <select id="genre" name="genre" required>
              <option value="Action">แอ็กชัน (Action)</option>
              <option value="Comedy">ตลก (Comedy)</option>
              <option value="Romance">โรแมนติก (Romance)</option>
              <option value="Drama">ดราม่า (Drama)</option>
              <option value="Horror">สยองขวัญ (Horror)</option>
              <option value="Sci-Fi">วิทยาศาสตร์ (Sci-Fi)</option>
              <option value="Documentary">สารคดี (Documentary)</option>
            </select>
          </div>

          <button type="submit" className="form-submit-btn" disabled={loading}>
            {loading ? "กำลังส่ง..." : "ส่งข้อมูล"}
          </button>
        </form>

      </div>
    </div>
  );
}
