"use client";

export default function MovieForm({ onSubmit, onClose }) {
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      stress: parseInt(e.target.stress.value),
      ending: parseInt(e.target.ending.value),
      mood: parseInt(e.target.mood.value),
      length: parseInt(e.target.length.value),
      genre: e.target.genre.value,
    };

    onSubmit(formData);
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
            <label>1. ตอนนี้คุณรู้สึกเครียดหรือผ่อนคลายแค่ไหน?</label>
            <div className="rating-group">
              <span className="label-text">เครียดสุดๆ</span>
              <div className="radio-options-container">
                {[1, 2, 3, 4, 5].map((v) => (
                  <div key={v}>
                    <input type="radio" id={`q1-${v}`} name="stress" value={v} required />
                    <label htmlFor={`q1-${v}`} className="radio-label"></label>
                  </div>
                ))}
              </div>
              <span className="label-text">ผ่อนคลายสุดๆ</span>
            </div>
          </div>

          {/* Q2 */}
          <div className="form-group">
            <label>2. คุณอยากให้หนังจบแบบแฮปปี้หรือน่าเศร้า?</label>
            <div className="rating-group">
              <span className="label-text">เศร้าสุดๆ</span>
              <div className="radio-options-container">
                {[1, 2, 3, 4, 5].map((v) => (
                  <div key={v}>
                    <input type="radio" id={`q2-${v}`} name="ending" value={v} required />
                    <label htmlFor={`q2-${v}`} className="radio-label"></label>
                  </div>
                ))}
              </div>
              <span className="label-text">แฮปปี้สุดๆ</span>
            </div>
          </div>

          {/* Q3 */}
          <div className="form-group">
            <label>3. คุณอยากดูหนังที่ทำให้รู้สึกสงบหรือตื่นเต้น?</label>
            <div className="rating-group">
              <span className="label-text">สงบ</span>
              <div className="radio-options-container">
                {[1, 2, 3, 4, 5].map((v) => (
                  <div key={v}>
                    <input type="radio" id={`q3-${v}`} name="mood" value={v} required />
                    <label htmlFor={`q3-${v}`} className="radio-label"></label>
                  </div>
                ))}
              </div>
              <span className="label-text">ตื่นเต้น</span>
            </div>
          </div>

          {/* Q4 */}
          <div className="form-group">
            <label>4. คุณอยากดูหนังสั้นหรือนาน ๆ ?</label>
            <div className="rating-group">
              <span className="label-text">สั้น ๆ</span>
              <div className="radio-options-container">
                {[1, 2, 3, 4, 5].map((v) => (
                  <div key={v}>
                    <input type="radio" id={`q4-${v}`} name="length" value={v} required />
                    <label htmlFor={`q4-${v}`} className="radio-label"></label>
                  </div>
                ))}
              </div>
              <span className="label-text">ยาว ๆ</span>
            </div>
          </div>

          {/* Genre */}
          <div className="form-group">
            <label htmlFor="genre"><strong>ประเภทหนังที่สนใจ</strong></label>
            <select id="genre" name="genre">
              <option value="Action">แอ็กชัน (Action)</option>
              <option value="Comedy">ตลก (Comedy)</option>
              <option value="Romance">โรแมนติก (Romance)</option>
              <option value="Drama">ดราม่า (Drama)</option>
              <option value="Horror">สยองขวัญ (Horror)</option>
              <option value="Sci-Fi">วิทยาศาสตร์ (Sci-Fi)</option>
            </select>
          </div>

          <button type="submit" className="form-submit-btn">ส่งข้อมูล</button>
        </form>
      </div>
    </div>
  );
}
