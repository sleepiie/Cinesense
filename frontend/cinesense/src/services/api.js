const BASE_URL = "http://localhost:8000";


// export async function recommendMovie(formData) {
//   const res = await fetch(`${BASE_URL}/recommend`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     credentials: "include", // ← เพิ่มบรรทัดนี้
//     body: JSON.stringify(formData),
//   });
//   return await res.json();
// }


export async function registerUser(userData) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return await res.json();
}

export async function loginUser(userData) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ← เพิ่มบรรทัดนี้สำหรับรับ cookie
    body: JSON.stringify(userData),
  });
  
  // ← เพิ่มการจัดการ error
  if (!res.ok) {
    const error = await res.json();
    return { error: error.error || "เกิดข้อผิดพลาด" };
  }
  
  return await res.json();
}

// ← เพิ่ม function สำหรับ logout
export async function logoutUser() {
  const res = await fetch(`${BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
  return await res.json();
}

// ← เพิ่ม function สำหรับตรวจสอบ session
export async function getCurrentUser() {
  const res = await fetch(`${BASE_URL}/session`, {
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }

  return await res.json();
}

// ← เพิ่ม function สำหรับ vote
export async function voteMovie(movieId, vote) {
  const res = await fetch(`${BASE_URL}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ← สำคัญ!
    body: JSON.stringify({ movie_id: movieId, vote }),
  });

  if (!res.ok) {
    throw new Error("Vote failed");
  }

  return await res.json();
}

// ← เพิ่ม function สำหรับ prediction
export async function predictMovie(data) {
  const res = await fetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ← สำคัญ!
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Prediction failed");
  }

  return await res.json();
}

export async function submitMood(formData) {
  const res = await fetch(`${BASE_URL}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const error = await res.json();
    return { error: error.detail || "เกิดข้อผิดพลาดในการส่งข้อมูล" };
  }

  return await res.json();
}
