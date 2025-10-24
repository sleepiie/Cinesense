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


        <div className="header-right">

          {user && (
            <div className="user-icon" onClick={() => setShowUserPopup(!showUserPopup)}>
              <i className="fas fa-user-circle"></i>
              <span className="username">{user.username}</span>

              {showUserPopup && (
                <div className="user-popup">
                  <p>Welcome, {user.username}!</p>
                  <a 
                    onClick={() => {
                      setShowUserPopup(false);
                      router.push("/watch-history");
                    }} 
                    style={{ cursor: 'pointer', padding: '5px 0', display: 'block' }}
                  >
                    <i className="fas fa-history"></i> ประวัติการรับชม
                  </a>
                  <a onClick={handleLogout} style={{ cursor: 'pointer', padding: '5px 0', display: 'block' }}>
                    <i className="fas fa-sign-out-alt"></i> Logout
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