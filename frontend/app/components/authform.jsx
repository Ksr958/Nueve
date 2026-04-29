"use client";
import { useState, useEffect } from "react";
import axiosClient from "../utils/apis";
import { loginUser, registerUser } from "../services/authService";
import { useUser } from "../contexts/authContext";
import PropTypes from "prop-types";

// ONLY ADDED CONSTANT IMPORT
import { AUTH_MODE } from "../constants/auth";

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

  // ================= TIMER =================
  useEffect(() => {
    let interval;

    if (mode === AUTH_MODE.RESET && resendDisabled) {
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

  const formatTimer = () =>
    `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, "0")}`;

  // ================= VALIDATIONS =================
  const validateLogin = () => {
    if (!username || !password) {
      setError("Please fill all required fields");
      return false;
    }
    return true;
  };

  const validateRegister = () => {
    if (!username || !email || !password) {
      setError("Please fill all required fields");
      return false;
    }
    if (username === email) {
      setError("Username and Email cannot be same");
      return false;
    }
    return true;
  };

  const validateForgot = () => {
    if (!stepEmail) {
      setError("Please enter your email");
      return false;
    }
    return true;
  };

  const validateReset = () => {
    if (!otp && !otpVerified) {
      setError("Please enter OTP");
      return false;
    }
    return true;
  };

  // ================= API FUNCTIONS =================
  async function sendOTP() {
    if (!stepEmail) {
      setError("Please enter your email first");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axiosClient.post("/forgot-password/", {
        email: stepEmail,
      });

      setSuccess(res.data.message);
      setTimer(300);
      setResendDisabled(true);
      setMode(AUTH_MODE.RESET);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
      setMode(AUTH_MODE.FORGOT);
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
      const res = await axiosClient.post("/verify-otp/", {
        email: stepEmail,
        otp,
      });

      setSuccess(res.data.message);
      setOtpVerified(true);
    } catch (err) {
      setError(err.response?.data?.error || "OTP verification failed");
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
        email: stepEmail,
        new_password: password,
        confirm_password: confirmPassword,
      });

      setSuccess(res.data.message);
      setMode(AUTH_MODE.LOGIN);
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
      login(data.username, data.is_admin);
      router.push(data.is_admin ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
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
      setMode(AUTH_MODE.LOGIN);
      setSuccess("Account created successfully. Please login.");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  // ================= MAIN SUBMIT =================
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === AUTH_MODE.LOGIN && !validateLogin()) return;
    if (mode === AUTH_MODE.REGISTER && !validateRegister()) return;
    if (mode === AUTH_MODE.FORGOT && !validateForgot()) return;
    if (mode === AUTH_MODE.RESET && !validateReset()) return;

    switch (mode) {
      case AUTH_MODE.LOGIN:
        await handleLogin();
        break;

      case AUTH_MODE.REGISTER:
        await handleRegister();
        break;

      case AUTH_MODE.FORGOT:
        await sendOTP();
        break;

      case AUTH_MODE.RESET:
        if (otpVerified) {
          await resetPassword();
        } else {
          await verifyOTP();
        }
        break;

      default:
        break;
    }
  }

  const isPasswordVisible =
    mode === AUTH_MODE.LOGIN ||
    mode === AUTH_MODE.REGISTER ||
    (mode === AUTH_MODE.RESET && otpVerified);

  const titleMap = {
    [AUTH_MODE.LOGIN]: "Welcome Back",
    [AUTH_MODE.REGISTER]: "Register",
    [AUTH_MODE.FORGOT]: "Forgot Password",
    [AUTH_MODE.RESET]: "Reset Password",
  };

  const buttonMap = {
    [AUTH_MODE.LOGIN]: "Login",
    [AUTH_MODE.REGISTER]: "Create Account",
    [AUTH_MODE.FORGOT]: "Send OTP",
    [AUTH_MODE.RESET]: "Reset Password",
  };

  const handleEmailChange = (e) => {
    if (mode === AUTH_MODE.REGISTER) setEmail(e.target.value);
    else setStepEmail(e.target.value);
  };

  // ================= UI =================
  return (
    <div className="min-w-[400px] max-w-lg bg-white rounded-2xl p-10">
      <div className="mb-10 text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          {titleMap[mode]}
        </h2>
        <p className="text-slate-500 text-base mt-2 font-medium">
          Please enter your details to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {(mode === AUTH_MODE.LOGIN || mode === AUTH_MODE.REGISTER) && (
          <input
            type="text"
            placeholder={mode === AUTH_MODE.LOGIN ? "Username or Email" : "Username"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-2 w-full border border-slate-300 focus:border-blue-200 rounded-xl px-4 py-3 text-sm"
          />
        )}

        {(mode === AUTH_MODE.REGISTER || mode === AUTH_MODE.FORGOT) && (
          <input
            type="email"
            placeholder="Email"
            value={mode === AUTH_MODE.REGISTER ? email : stepEmail}
            onChange={handleEmailChange}
            className="mt-2 w-full border border-slate-300 focus:border-blue-200 rounded-xl px-4 py-3 text-sm"
          />
        )}

        {mode === AUTH_MODE.RESET && !otpVerified && (
          <div>
            <input
              type="text"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-2 w-full border border-slate-300 rounded-xl px-4 py-3 text-sm"
            />

            <div className="text-right mt-2">
              <button
                type="button"
                disabled={resendDisabled}
                onClick={sendOTP}
                className={`text-sm ${
                  resendDisabled ? "text-gray-400" : "text-blue-600 hover:underline"
                }`}
              >
                {resendDisabled
                  ? `Resend OTP in ${formatTimer()}`
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

        {mode === AUTH_MODE.RESET && otpVerified && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-2 w-full border border-slate-300 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 text-sm"
          />
        )}

        {error && (
          <p className="text-red-500 text-lg font-medium text-center">{error}</p>
        )}

        {success && (
          <p className="text-green-600 text-lg text-center font-medium">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl cursor-pointer"
        >
          {loading ? "Processing..." : buttonMap[mode] || "Submit"}
        </button>

        {mode === AUTH_MODE.LOGIN && (
          <div className="text-right mt-2">
            <button
              type="button"
              onClick={() => setMode(AUTH_MODE.FORGOT)}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {(mode === AUTH_MODE.LOGIN || mode === AUTH_MODE.REGISTER) && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === AUTH_MODE.LOGIN ? AUTH_MODE.REGISTER : AUTH_MODE.LOGIN);
                setError("");
                setSuccess("");
              }}
              className="text-base text-blue-600 underline cursor-pointer"
            >
              {mode === AUTH_MODE.LOGIN
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
            </button>
          </div>
        )}

        {(mode === AUTH_MODE.FORGOT || mode === AUTH_MODE.RESET) && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => {
                setMode(AUTH_MODE.LOGIN);
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

AuthForm.propTypes = {
  mode: PropTypes.string.isRequired,
  setMode: PropTypes.func.isRequired,
  router: PropTypes.object,
};