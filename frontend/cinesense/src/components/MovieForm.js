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
            <label>1. ตอนนี้คุณรู้สึกอารมณ์ดีหรือมีความสุขมากแค่ไหน?</label>
            <div className="rating-group">
              <span className="label-text">รู้สึกหม่นหมอง</span>
              <div className="radio-options-container">
                {[1, 2, 3, 4, 5].map((v) => (
                  <div key={v}>
                    <input type="radio" id={`q1-${v}`} name="stress" value={v} required />
                    <label htmlFor={`q1-${v}`} className="radio-label"></label>
                  </div>
                ))}
              </div>
              <span className="label-text">มีความสุขมาก</span>
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
                    <input type="radio" id={`q3-${v}`} name="mood" value={v} required />
                    <label htmlFor={`q3-${v}`} className="radio-label"></label>
                  </div>
                ))}
              </div>
              <span className="label-text">กระปรี้กระเปร่า</span>
            </div>
          </div>

          {/* Q3 */}
          <div className="form-group">
            <label>3. ตอนนี้คุณอยากดูหนังที่ให้ความรู้สึกสงบหรือเร้าใจมากกว่ากัน?</label>
            <div className="rating-group">
              <span className="label-text">อยากดูหนังที่สงบมาก</span>
              <div className="radio-options-container">
                {[1, 2, 3, 4, 5].map((v) => (
                  <div key={v}>
                    <input type="radio" id={`q4-${v}`} name="length" value={v} required />
                    <label htmlFor={`q4-${v}`} className="radio-label"></label>
                  </div>
                ))}
              </div>
              <span className="label-text">อยากดูหนังที่ตื่นเต้นสุด ๆ</span>
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
                <option value="Thriller">ระทึกขวัญ (Thriller)</option>
                <option value="Mystery">ลึกลับ (Mystery)</option>
                <option value="Fantasy">แฟนตาซี (Fantasy)</option>
                <option value="Sci-Fi">วิทยาศาสตร์ (Sci-Fi)</option>
                <option value="Animation">แอนิเมชัน (Animation)</option>
                <option value="Adventure">ผจญภัย (Adventure)</option>
                <option value="Documentary">สารคดี (Documentary)</option>
                <option value="Family">ครอบครัว (Family)</option>
                <option value="Music">ดนตรี/มิวสิคัล (Musical)</option>
                <option value="Crime">อาชญากรรม (Crime)</option>
                <option value="History">ประวัติศาสตร์ (History)</option>
                <option value="War">สงคราม (War)</option>
            </select>
          </div>

          <button type="submit" className="form-submit-btn">ส่งข้อมูล</button>
        </form>
      </div>
    </div>
  );
}
