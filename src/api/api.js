import { client } from "./client";

// Routine
export const getRoutines = () => client.get("/routines");
export const getRoutine = (id) => client.get(`/routines/${id}`);
export const createRoutine = (body) => client.post("/routines", body);
export const updateRoutine = (id, body) => client.put(`/routines/${id}`, body);
export const deleteRoutine = (id) => client.delete(`/routines/${id}`);
export const reorderRoutine = (id, body) => client.patch(`/routines/${id}/reorder`, body);

// Route
export const searchRoute = (body) => client.post("/routes/search", body);
export const getRouteHistory = (params = {}) => client.get("/routes/history", { params });

// Checklist
export const getChecklists = () => client.get("/checklists");
export const createChecklist = (body) => client.post("/checklists", body);
export const deleteChecklist = (id) => client.delete(`/checklists/${id}`);
export const updateChecklist = (id, body) => client.patch(`/checklists/${id}`, body);

// Countdown
export const startCountdown = (body) => client.post("/countdown/start", body);
export const completeCountdownItem = (id, body) => client.patch(`/countdown/${id}/item`, body);
export const departCountdown = (id) => client.patch(`/countdown/${id}/depart`);

// User
export const getMe = () => client.get("/users/me");
export const updateMe = (body) => client.patch("/users/me", body);
export const deleteMe = () => client.delete("/users/me");
export const uploadProfileImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return client.post("/users/me/profile-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Auth
export const logout = () => client.post("/auth/logout");
export const refreshToken = (body) => client.post("/auth/refresh", body);