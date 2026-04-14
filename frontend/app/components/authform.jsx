// components/AuthForm.jsx
"use client";
import { useState, useEffect } from "react";
import axiosClient from "../utils/apis";
import { loginUser, registerUser } from "../services/authService";
import { useUser } from "../contexts/authContext";

export default function AuthForm({ mode, setMode, router }) {
  const { login } = useUser();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [stepEmail, setStepEmail] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [timer, setTimer] = useState(300);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // OTP countdown
  useEffect(() => {
    let interval;
    if (mode === "reset" && resendDisabled) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, resendDisabled]);


  async function sendOTP() {
    if (!stepEmail) {
      setError("Please enter your email first");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axiosClient.post("/forgot-password/", { email: stepEmail });
      setSuccess(res.data.message);
      setTimer(300);
      setResendDisabled(true);
      setMode("reset");
    } catch (err) {
      const message = err.response?.data?.error || "Something went wrong. Please try again.";
      setError(message);
      setMode("forgot");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOTP() {
    if (!stepEmail) {
      setError("Please enter your email first");
      return;
    }
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    

    try {
      const res = await axiosClient.post("/verify-otp/", { email: stepEmail, otp });
      setSuccess(res.data.message);
      setOtpVerified(true);
    } catch (err) {
      const message = err.response?.data?.error || "OTP verification failed";
      setError(message);
    } finally {
      setLoading(false);
      
    }
    
  }

  async function resetPassword() {
    if (!password || !confirmPassword) {
      setError("Please fill all required fields to reset password");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axiosClient.post("/reset-password/", {
        new_password: password,
        confirm_password: confirmPassword,
      });
      setSuccess(res.data.message);
      setMode("login");
      setOtpVerified(false);
      setOtp("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Password reset failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await loginUser(username, password);
      await login(data.username, data.access, data.refresh, data.is_admin);
      router.push(data.is_admin ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await registerUser(username, email, password);
      setMode("login");
      setSuccess("Account created successfully. Please login.");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  }
//handling submit
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "login" && (!username || !password)) {
      setError("Please fill all required fields");
      return;
    }
    if (mode === "register" && (!username || !email || !password)) {
      setError("Please fill all required fields");
      return;
    }
    if(mode === "register" &&(username === email )){
      setError("Username and Email cannot be same")
      return;
    }
    if (mode === "forgot" && !stepEmail) {
      setError("Please enter your email");
      return;
    }
    if (mode === "reset") {
      if (!otp && !otpVerified) {
        setError("Please enter OTP");
        return;
      }
    }

    if (mode === "login") await handleLogin();
    else if (mode === "register") await handleRegister();
    else if (mode === "forgot") await sendOTP();
    else if (mode === "reset") {
      if (!otpVerified) await verifyOTP();
      else await resetPassword();
    }
  }

  const isPasswordVisible = mode === "login" || mode === "register" || (mode === "reset" && otpVerified);

  return (
    <div className="min-w-[400px] max-w-lg bg-white rounded-2xl p-10">
      <div className="mb-10 text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          {mode === "login" ? "Welcome Back" : mode === "register" ? "Register" : mode === "forgot" ? "Forgot Password" : "Reset Password"}
        </h2>
        <p className="text-slate-500 text-base mt-2 font-medium">
          Please enter your details to continue.
        </p>
      </div>
 
      <form onSubmit={handleSubmit} className="space-y-6">
        {(mode === "login" || mode === "register") && (
          <input
            type="text"
            placeholder={mode === "login" ? "Username or Email" : "Username"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-2 w-full border border-slate-300 focus:border-blue-200 rounded-xl px-4 py-3 text-sm"
          />
        )}

        {(mode === "register" || mode === "forgot") && (
          <input
            type="email"
            placeholder="Email"
            value={mode === "register" ? email : stepEmail}
            onChange={(e) => (mode === "register" ? setEmail(e.target.value) : setStepEmail(e.target.value))}
            className="mt-2 w-full border border-slate-300 focus:border-blue-200 rounded-xl px-4 py-3 text-sm"
          />
        )}

        {mode === "reset" && !otpVerified && (
          <div>
            <input
              type="text"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-2 w-full border border-slate-300  focus:ring-blue-200 rounded-xl px-4 py-3 text-sm"
            />
            <div className="text-right mt-2">
              <button
                type="button"
                disabled={resendDisabled}
                onClick={sendOTP}
                className={`text-sm ${resendDisabled ? "text-gray-400" : "text-blue-600 hover:underline"}`}
              >
                {resendDisabled
                  ? `Resend OTP in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, "0")}`
                  : "Resend OTP"}
              </button>
            </div>
          </div>
        )}

        {isPasswordVisible && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border border-slate-300 focus:border-blue-200 rounded-xl px-4 py-3 text-sm"
          />
        )}

        {mode === "reset" && otpVerified && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-2 w-full border border-slate-300 focus:border-blue-200 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 text-sm"
          />
        )}

        {error && <p className="text-red-500 text-lg font-medium text-center">{error}</p>}
        {success && <p className="text-green-600 text-lg text-center font-medium">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl cursor-pointer"
        >
        {loading
          ? "Processing..."
          : mode === "login"
          ? "Login"
          : mode === "register" 
          ? "Create Account"
          : mode === "forgot"
          ? "Send OTP"
          : mode === "reset"
          ? "Reset Password"
          : "Submit"}
        </button>

        {mode === "login" && (
          <div className="text-right mt-2">
            <button type="button" onClick={() => setMode("forgot")} className="text-sm text-blue-600 hover:underline">
              Forgot Password?
            </button>
          </div>
        )}

        {(mode=="login" || mode=="register")&& <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login")
              setError("")
              setSuccess("")
              }}
            className="text-base text-blue-600 underline cursor-pointer"
          >
            {mode === "login" ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>}
        {(mode === "forgot" || mode === "reset") && (
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setOtpVerified(false);
            setOtp("");
            setPassword("");
            setConfirmPassword("");
            setStepEmail("");
            setError("");
            setSuccess("");
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          Back to Login
        </button>
      </div>
)}
      </form>
    </div>
  );
}