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

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
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
        localStorage.setItem('id', user.id);
        localStorage.setItem('role', user.role);

        toast.success('Login successful!');

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
        setError(data.message || 'Login failed!');
        toast.error(data.message || 'Login failed!');
      }
    } catch (error) {
      setError('Something went wrong. Please try again later.');
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
      <div
          className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-100 to-blue-100"
          onKeyDown={handleKeyDown}
          tabIndex="0"
      >
        <Toaster position="top-right" />
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
                  loading ? 'bg-gray-400' : 'bg-green-500 text-white'
              } disabled:opacity-50`}
              onClick={handleLogin}
              disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Error Message */}
          {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}

          {/* Links */}
          <div className="text-center mt-4">
            <a href="#" className="text-blue-500 text-sm hover:underline">
              Forgot Password?
            </a>
          </div>
          <div className="text-center mt-2">
            <a href="/register" className="text-blue-500 text-sm hover:underline">
              Create an Account
            </a>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;