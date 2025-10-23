// 1. รับ user จาก props
export default function IntroBox({ onStart, user }) { 
  return (
    <main className="main-content">
      <div className="intro-box">
        <h1><i className="fas fa-film"></i> CINESENSE</h1>
        
        {/* 2. เปลี่ยนข้อความตามสถานะ user */}
        {user ? (
          <p>สวัสดี, {user.username}! พร้อมค้นหาหนังที่เหมาะกับคุณรึยัง?</p>
        ) : (
          <p>ค้นหาหนังที่คุณชอบ และแบบที่เหมาะกับคุณดู</p>
        )}
        
        <button onClick={onStart} className="start-btn">เริ่มต้นเลย !</button>
      </div>
    </main>
  );
}