"use client"; 

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { logoutUser } from "@/services/api"; 

export default function Header({ onSearch, user, setUser }) {
  const [search, setSearch] = useState("");
  const [showUserPopup, setShowUserPopup] = useState(false);
  const router = useRouter(); 

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(search);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null); 
    setShowUserPopup(false);
    router.push("/"); 
    router.refresh(); 
  };

  return (
    <header className="main-header">
      <div className="logo" onClick={() => onSearch?.("")}>
        CINESENSE
      </div>

      <nav>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          {user ? (
            <li>
              <a onClick={handleLogout} className="header-btn" style={{ cursor: 'pointer' }}>
                Logout
              </a>
            </li>
          ) : (
            <>
              <li><Link href="/login" className="header-btn">Login</Link></li>
              <li><Link href="/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>

      <div className="header-right">

        <div className="user-icon" onClick={() => setShowUserPopup(!showUserPopup)}>
          <i className="fas fa-user-circle"></i>

          {showUserPopup && (
            <div className="user-popup">
              {user ? (
                <>
                  <p>Welcome, {user.username}!</p>
                  {/* ▼▼▼ 2. แก้ไขตรงนี้ด้วย (ใน Popup) ▼▼▼ */}
                  {/* เปลี่ยนจาก <button> เป็น <a> */}
                  <a onClick={handleLogout} style={{ cursor: 'pointer', padding: '5px 0' }}>
                    Logout
                  </a>
                  {/* ▲▲▲ สิ้นสุดการแก้ไข ▲▲▲ */}
                </>
              ) : (
                <>
                  <p>Welcome, Guest!</p>
                  <Link href="/login">Login</Link>
                  <Link href="/register">Register</Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}