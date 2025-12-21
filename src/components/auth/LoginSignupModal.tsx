import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, Mail, Lock, User, Phone, Check, X } from "lucide-react";
import {
  useLoginMutation,
  useRegisterMutation,
  useGoogleLoginMutation,
} from "../../redux/api/authApi";
import { setCredentials, closeAuthModal } from "../../redux/slices/authSlice";
import { addNotification } from "../../redux/slices/uiSlice";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const LoginSignupModal = ({ isOpen, onClose, returnTo }) => {
  const dispatch = useDispatch();
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const [googleLogin, { isLoading: googleLoading }] =
    useGoogleLoginMutation();

  const passwordRequirements = {
    minLength: registerData.password.length >= 8,
    hasCapital: /[A-Z]/.test(registerData.password),
    hasNumber: /[0-9]/.test(registerData.password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch =
    registerData.password === registerData.confirmPassword;
  const canSubmit = isPasswordValid && passwordsMatch;

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(loginData).unwrap();
      dispatch(setCredentials(result));
      dispatch(
        addNotification({
          type: "success",
          message: "Logged in successfully!",
        })
      );
      onClose();
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message: error.data?.message || "Login failed",
        })
      );
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit) {
      dispatch(
        addNotification({
          type: "error",
          message: "Please fulfill all password requirements",
        })
      );
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      dispatch(
        addNotification({
          type: "error",
          message: "Passwords do not match",
        })
      );
      return;
    }

    try {
      const { confirmPassword, ...submitData } = registerData;
      const result = await register(submitData).unwrap();
      dispatch(setCredentials(result));
      dispatch(
        addNotification({
          type: "success",
          message: "Account created successfully!",
        })
      );
      onClose();
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message: error.data?.message || "Registration failed",
        })
      );
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;

      if (!credential) {
        throw new Error("No credential received from Google");
      }

      const result = await googleLogin(credential).unwrap();
      dispatch(setCredentials(result));
      dispatch(
        addNotification({
          type: "success",
          message: "Logged in with Google successfully!",
        })
      );
      onClose();
    } catch (error) {
      let errorMessage = "Google login failed";
      if (error.data?.message === "Account is suspended or inactive") {
        errorMessage =
          "Your account has been suspended. Please contact support.";
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      }

      dispatch(
        addNotification({
          type: "error",
          message: errorMessage,
        })
      );
    }
  };

  const handleGoogleError = () => {
    dispatch(
      addNotification({
        type: "error",
        message: "Google login failed. Please try again.",
      })
    );
  };

  const RequirementItem = ({ met, text }) => (
    <div
      className={`flex items-center space-x-1 text-xs ${
        met ? "text-green-600" : "text-gray-500"
      }`}
    >
      {met ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      <span>{text}</span>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between p-4">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === "login" ? "Sign In" : "Create Account"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {mode === "login" ? (
            <GoogleOAuthProvider
              clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
            >
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={loginData.email}
                      onChange={handleLoginChange}
                      className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {loginLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    theme="outline"
                    size="large"
                    width="100%"
                  />
                </div>
              </div>

              <p className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setMode("register");
                    setLoginData({ email: "", password: "" });
                  }}
                  className="text-green-600 hover:text-green-500 font-medium"
                >
                  Sign up
                </button>
              </p>
            </GoogleOAuthProvider>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={registerData.phone}
                    onChange={handleRegisterChange}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  <RequirementItem
                    met={passwordRequirements.minLength}
                    text="At least 8 characters"
                  />
                  <RequirementItem
                    met={passwordRequirements.hasCapital}
                    text="One uppercase letter"
                  />
                  <RequirementItem
                    met={passwordRequirements.hasNumber}
                    text="One number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-3"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {registerData.password &&
                  registerData.confirmPassword &&
                  !passwordsMatch && (
                    <p className="mt-1 text-xs text-red-600">
                      Passwords do not match
                    </p>
                  )}
              </div>

              <button
                type="submit"
                disabled={registerLoading || !canSubmit}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {registerLoading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}

          {mode === "register" && (
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setRegisterData({
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    confirmPassword: "",
                  });
                }}
                className="text-green-600 hover:text-green-500 font-medium"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginSignupModal;
