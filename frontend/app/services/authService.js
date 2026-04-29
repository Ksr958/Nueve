import axiosClient from "../utils/apis"
export async function loginUser(usernameOrEmail, password) {
  if (!usernameOrEmail || !password) {
    throw new Error("Username/email and password are required");
  }

  try {
    const res = await axiosClient.post("/login/", {
      username: usernameOrEmail,
      password,
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || "Login failed. Check username/password.");
  }
}
export async function registerUser(username, email, password) {
  const res = await axiosClient.post("/register/", {
    username,
    email,
    password,
  })

  return res.data
}
