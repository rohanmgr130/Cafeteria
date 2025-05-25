import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Enhanced validation with specific toast messages
  const validateForm = () => {
    // Clear previous error
    setError(null);

    // Check if email is empty
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return false;
    }

    // Check email format
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Check if password is empty
    if (!password.trim()) {
      toast.error('Please enter your password');
      return false;
    }

    // Check password length
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        const { user, token } = data;

        // Store user data in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('email', user.email);
        localStorage.setItem('fullname', user.fullname);
        const myImage = process.env.REACT_APP_API_BASE_URL + user.profileImage
        if(user.profileImage){
          localStorage.setItem("profileImage", myImage)
        }
        localStorage.setItem('id', user.id);
        localStorage.setItem('role', user.role);

        toast.success('Login successful! Redirecting...');

        // Redirect based on role
        setTimeout(() => {
          switch (user.role) {
            case 'admin':
              navigate("/admin-home");
              break;
            case 'staff':
              navigate("/staff-dashboard");
              break;
            case 'user':
            default:
              navigate("/user-home");
              break;
          }
        }, 1000);
      } else {
        const errorMessage = data.message || 'Login failed!';
        setError(errorMessage);
        
        // Show specific error toasts based on the error message
        if (errorMessage.toLowerCase().includes('password')) {
          toast.error('Incorrect password. Please try again.');
        } else if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('user')) {
          toast.error('Email not found. Please check your email or create an account.');
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = 'Something went wrong. Please try again later.';
      setError(errorMessage);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleForgotPassword = () => {
    // Validate email before allowing forgot password
    if (!email.trim()) {
      toast.error('Please enter your email address first');
      return;
    }
    
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    toast.success('If this email exists, you will receive a password reset link shortly');
    navigate('/forgot-password');
  };

  return (
      <div
          className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-100 to-blue-100"
          onKeyDown={handleKeyDown}
          tabIndex="0"
      >
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
            error: {
              duration: 5000,
              theme: {
                primary: '#ff4b4b',
              },
            },
          }} 
        />
        <div className="relative bg-white p-8 rounded-xl shadow-lg w-96">
          <div
              className="absolute top-[-70px] left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full bg-white bg-cover bg-center shadow-lg"
              style={{
                backgroundImage:
                    'url("https://i.pinimg.com/1200x/9e/95/49/9e9549dcfbafb4a017f179ca1f9c0e46.jpg")',
              }}
          ></div>
          <h2 className="mt-16 text-2xl font-semibold text-gray-800 text-center">Login</h2>

          {/* Email Field */}
          <div className="relative mt-4">
            <FontAwesomeIcon icon={faEnvelope} className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400" />
            <input
                type="email"
                placeholder="Email"
                className="w-full p-3 pl-10 mt-2 border rounded-lg text-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  if (email && !validateEmail(email)) {
                    toast.error('Please enter a valid email format');
                  }
                }}
            />
          </div>

          {/* Password Field */}
          <div className="relative mt-4">
            <FontAwesomeIcon icon={faLock} className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400" />
            <input
                type={isPasswordVisible ? "text" : "password"}
                placeholder="Password"
                className="w-full p-3 pl-10 mt-2 border rounded-lg text-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => {
                  if (password && password.length < 6) {
                    toast.error('Password should be at least 6 characters');
                  }
                }}
            />
            <FontAwesomeIcon
                icon={isPasswordVisible ? faEyeSlash : faEye}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            />
          </div>

          {/* Login Button */}
          <button
              className={`w-full p-3 mt-6 rounded-lg text-lg font-semibold ${
                  loading ? 'bg-gray-400' : 'bg-green-500 text-white hover:bg-green-600'
              } disabled:opacity-50 transition-colors`}
              onClick={handleLogin}
              disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center mt-4 p-2 bg-red-50 rounded border border-red-200">
              {error}
            </div>
          )}

          {/* Links */}
          <div className="text-center mt-4">
            <button
              onClick={handleForgotPassword}
              className="text-blue-500 text-sm hover:underline hover:text-blue-700 transition-colors"
            >
              Forgot Password?
            </button>
          </div>
          <div className="text-center mt-2">
            <a href="/register" className="text-blue-500 text-sm hover:underline hover:text-blue-700 transition-colors">
              Create an Account
            </a>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;