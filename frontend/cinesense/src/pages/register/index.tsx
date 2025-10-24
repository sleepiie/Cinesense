"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { registerUser, checkUsername } from "@/services";

interface ValidationState {
  username: {
    isValid: boolean;
    message: string;
    checking: boolean;
    hasValue: boolean;
  };
  password: {
    isValid: boolean;
    message: string;
    hasValue: boolean;
  };
  confirmPassword: {
    isValid: boolean;
    message: string;
    hasValue: boolean;
  };
}

export default function RegisterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [validation, setValidation] = useState<ValidationState>({
    username: { isValid: false, message: "", checking: false, hasValue: false },
    password: { isValid: false, message: "", hasValue: false },
    confirmPassword: { isValid: false, message: "", hasValue: false }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debounceTimers, setDebounceTimers] = useState<{[key: string]: NodeJS.Timeout}>({});
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) router.push("/home");
  }, [router]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [debounceTimers]);

  const handleHeaderSearch = (query: string) => {
    setSearchQuery(query);
  };

  const validateUsername = async (username: string) => {
    // Clear existing timer
    if (debounceTimers.username) {
      clearTimeout(debounceTimers.username);
    }

    if (!username) {
      setValidation(prev => ({
        ...prev,
        username: { isValid: false, message: "", checking: false, hasValue: false }
      }));
      return;
    }

    // Check if username contains only English characters and numbers
    const englishOnlyRegex = /^[a-zA-Z0-9]+$/;
    if (!englishOnlyRegex.test(username)) {
      setValidation(prev => ({
        ...prev,
        username: { 
          isValid: false, 
          message: "ชื่อผู้ใช้ต้องเป็นภาษาอังกฤษและตัวเลขเท่านั้น", 
          checking: false, 
          hasValue: true 
        }
      }));
      return;
    }

    // Set hasValue to true immediately
    setValidation(prev => ({
      ...prev,
      username: { isValid: false, message: "", checking: true, hasValue: true }
    }));

    // Set debounce timer
    const timer = setTimeout(async () => {
      try {
        const response = await checkUsername(username);
        
        setValidation(prev => ({
          ...prev,
          username: { 
            isValid: response.available, 
            message: response.available ? "" : response.message, // Only show message if not valid
            checking: false, 
            hasValue: true 
          }
        }));
      } catch (error) {
        setValidation(prev => ({
          ...prev,
          username: { 
            isValid: false, 
            message: "เกิดข้อผิดพลาดในการตรวจสอบชื่อผู้ใช้", 
            checking: false, 
            hasValue: true 
          }
        }));
      }
    }, 1000); 

    setDebounceTimers(prev => ({
      ...prev,
      username: timer
    }));
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setValidation(prev => ({
        ...prev,
        password: { isValid: false, message: "", hasValue: false }
      }));
      return;
    }

    if (password.length < 8) {
      setValidation(prev => ({
        ...prev,
        password: { isValid: false, message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร", hasValue: true }
      }));
      return;
    }

    setValidation(prev => ({
      ...prev,
      password: { isValid: true, message: "", hasValue: true } // No message when valid
    }));
  };

  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (!confirmPassword) {
      setValidation(prev => ({
        ...prev,
        confirmPassword: { isValid: false, message: "", hasValue: false }
      }));
      return;
    }

    if (password !== confirmPassword) {
      setValidation(prev => ({
        ...prev,
        confirmPassword: { isValid: false, message: "รหัสผ่านไม่ตรงกัน", hasValue: true }
      }));
      return;
    }

    setValidation(prev => ({
      ...prev,
      confirmPassword: { isValid: true, message: "", hasValue: true } // No message when valid
    }));
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const username = e.currentTarget.username.value;
    const password = e.currentTarget.password.value;
    const confirmPassword = e.currentTarget.confirmPassword.value;

    // Final validation
    if (!validation.username.isValid || !validation.password.isValid || !validation.confirmPassword.isValid) {
      alert("กรุณาแก้ไขข้อมูลให้ถูกต้องก่อนส่ง");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await registerUser({ username, password });
      
      if (response.error) {
        alert(response.error);
        return;
      }

      alert("สมัครสมาชิกสำเร็จ!");
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      alert("เกิดข้อผิดพลาดในการสมัครสมาชิก");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <Header onSearch={handleHeaderSearch} user={null} setUser={() => {}} />
      <div className="register-page__background"></div>
      <div className="register-page__overlay"></div>
      <div className="register-page__form-container">
        <form className="register-form" onSubmit={handleRegister}>
          <h2>สมัครสมาชิก</h2>
          
          <div className="form-group">
            <label htmlFor="username">ชื่อผู้ใช้</label>
            <div className="input-container">
              <input 
                type="text" 
                id="username" 
                name="username" 
                placeholder="กรอกชื่อผู้ใช้" 
                required 
                onChange={(e) => {
                  const value = e.target.value;
                  validateUsername(value);
                }}
              />
              {validation.username.hasValue && (
                <div className="input-status">
                  {validation.username.checking ? (
                    <span className="loading-icon">⏳</span>
                  ) : validation.username.isValid ? (
                    <span className="success-icon">✅</span>
                  ) : (
                    <span className="error-icon">❌</span>
                  )}
                </div>
              )}
            </div>
            {validation.username.hasValue && !validation.username.isValid && validation.username.message && (
              <div className="validation-message error">
                <span>{validation.username.message}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">รหัสผ่าน</label>
            <div className="input-container">
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="กรอกรหัสผ่าน" 
                required 
                onChange={(e) => {
                  const password = e.target.value;
                  const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement)?.value || '';
                  validatePassword(password);
                  validateConfirmPassword(password, confirmPassword);
                }}
              />
              {validation.password.hasValue && (
                <div className="input-status">
                  {validation.password.isValid ? (
                    <span className="success-icon">✅</span>
                  ) : (
                    <span className="error-icon">❌</span>
                  )}
                </div>
              )}
            </div>
            {validation.password.hasValue && !validation.password.isValid && validation.password.message && (
              <div className="validation-message error">
                <span>{validation.password.message}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
            <div className="input-container">
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                placeholder="ยืนยันรหัสผ่าน" 
                required 
                onChange={(e) => {
                  const confirmPassword = e.target.value;
                  const password = (document.getElementById('password') as HTMLInputElement)?.value || '';
                  validateConfirmPassword(password, confirmPassword);
                }}
              />
              {validation.confirmPassword.hasValue && (
                <div className="input-status">
                  {validation.confirmPassword.isValid ? (
                    <span className="success-icon">✅</span>
                  ) : (
                    <span className="error-icon">❌</span>
                  )}
                </div>
              )}
            </div>
            {validation.confirmPassword.hasValue && !validation.confirmPassword.isValid && validation.confirmPassword.message && (
              <div className="validation-message error">
                <span>{validation.confirmPassword.message}</span>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !validation.username.isValid || !validation.password.isValid || !validation.confirmPassword.isValid}
            className="submit-btn"
          >
            {isSubmitting ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>
          
          <p className="login-link">
            Have an account? <a href="/login">เข้าสู่ระบบ</a>
          </p>
        </form>
      </div>
    </div>
  );
}
