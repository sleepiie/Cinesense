export default function IntroBox({ onStart }) {
  return (
    <main className="main-content">
      <div className="intro-box">
        <h1><i className="fas fa-film"></i> CINESENSE</h1>
        <p>ค้นหาหนังที่คุณชอบ และแบบที่เหมาะกับคุณดู</p>
        <button onClick={onStart} className="start-btn">เริ่มต้นเลย !</button>
      </div>
    </main>
  );
}
