// จำลอง delay 1.5 วิ
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function recommendMovie(formData) {
  console.log("Mock recommend called with:", formData);
  await delay(1500);
  return {
    title: "Interstellar",
    genre: "Sci-Fi, Drama",
    synopsis: "A team of explorers travel through a wormhole in space...",
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
  };
}

export async function registerUser(userData) {
  console.log("Mock register called with:", userData);
  await delay(1000);
  return { message: `User ${userData.username} registered successfully (mock)` };
}

export async function loginUser(userData) {
  console.log("Mock login called with:", userData);
  await delay(1000);
  return { message: `User ${userData.username} logged in (mock)` };
}
