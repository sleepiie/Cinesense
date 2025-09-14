// Toggle: true = mock, false = real API
const USE_MOCK = true;

import * as mockApi from "./mockApi";
import * as realApi from "./api";

export const recommendMovie = USE_MOCK ? mockApi.recommendMovie : realApi.recommendMovie;
export const registerUser = USE_MOCK ? mockApi.registerUser : realApi.registerUser;
export const loginUser = USE_MOCK ? mockApi.loginUser : realApi.loginUser;
