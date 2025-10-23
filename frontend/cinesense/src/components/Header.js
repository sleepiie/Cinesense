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
      <div className="header-content">
        <div className="logo" onClick={() => router.push("/")}>
          CINESENSE
        </div>

        <nav className="nav-section">
          <ul className="nav-links">
            <li><a href="/">Home</a></li>
            {!user && (
              <>
                <li><Link href="/login" className="header-btn">Login</Link></li>
                <li><Link href="/register">Register</Link></li>
              </>
            )}
          </ul>
        </nav>

        <div className="header-right">

          {user && (
            <div className="user-icon" onClick={() => setShowUserPopup(!showUserPopup)}>
              <i className="fas fa-user-circle"></i>
              <span className="username">{user.username}</span>

              {showUserPopup && (
                <div className="user-popup">
                  <p>Welcome, {user.username}!</p>
                  <a onClick={handleLogout} style={{ cursor: 'pointer', padding: '5px 0' }}>
                    Logout
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}