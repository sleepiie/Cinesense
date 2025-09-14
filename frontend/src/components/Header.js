import { useState } from "react";
import Link from "next/link";

export default function Header({ onSearch }) {
  const [search, setSearch] = useState("");
  const [showUserPopup, setShowUserPopup] = useState(false); // ✅ ต้องประกาศ useState

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(search);
  };

  return (
    <header className="main-header">
      <div className="logo" onClick={() => onSearch?.("")}>
        CINESENSE
      </div>

      <nav>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><Link href="/login" className="header-btn">Login</Link></li>
          <li><Link href="/register">Register</Link></li>
        </ul>
      </nav>

      <div className="header-right">
        <form className="search-box" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Enter</button>
        </form>

        <div className="user-icon" onClick={() => setShowUserPopup(!showUserPopup)}>
          <i className="fas fa-user-circle"></i>

          {showUserPopup && (
            <div className="user-popup">
              <p>Welcome, Guest!</p>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
