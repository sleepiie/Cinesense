import * as realApi from "./api";

//export const recommendMovie = realApi.recommendMovie;
export const registerUser = realApi.registerUser;
export const loginUser = realApi.loginUser;
export const logoutUser = realApi.logoutUser; // ← เพิ่มถ้ายังไม่มี
export const getCurrentUser = realApi.getCurrentUser; // ← เพิ่มถ้ายังไม่มี
export const voteMovie = realApi.voteMovie; // ← เพิ่มถ้ายังไม่มี
//export const predictMovie = USE_MOCK ? mockApi.predictMovie : realApi.predictMovie; // ← เพิ่มถ้ายังไม่มี
export const submitMood = realApi.submitMood; // ← เพิ่มบรรทัดนี้ด้วย!