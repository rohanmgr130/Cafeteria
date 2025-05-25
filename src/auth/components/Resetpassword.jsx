import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEye, faEyeSlash, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();

  const token = searchParams.get('t');

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      navigate('/login');
      return;
    }

    verifyToken();
  }, [token, navigate]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/verify-reset-token/${token}`
      );
      
      if (response.data.success) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        toast.error('Reset link is invalid or expired');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      setTokenValid(false);
      toast.error('Reset link is invalid or expired');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.password) {
      toast.error('Password is required');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (!formData.confirmPassword) {
      toast.error('Please confirm your password');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/reset-password/${token}`,
        {
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }
      );

      if (response.data.success) {
        setResetSuccess(true);
        toast.success('Password reset successful!');
      } else {
        toast.error(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.response?.status === 400) {
        toast.error('Reset link is invalid or expired');
      } else {
        toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // Success screen
  if (resetSuccess) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-100 to-blue-100">
        <Toaster position="top-right" />
        <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You can now login with your new password.
            </p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full p-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Invalid token screen
  if (tokenValid === false) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-100 to-blue-100">
        <Toaster position="top-right" />
        <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faTimesCircle} className="text-3xl text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full p-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
            >
              Request New Link
            </button>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full p-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition duration-300"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (tokenValid === null) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-100 to-blue-100">
        <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div 
      className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-100 to-blue-100"
      onKeyDown={handleKeyDown}
      tabIndex="0"
    >
      <Toaster position="top-right" />
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faLock} className="text-3xl text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Reset Your Password</h2>
          <p className="text-gray-600 text-sm">
            Enter your new password below.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Password Field */}
          <div className="relative mb-5">
            <FontAwesomeIcon 
              icon={faLock} 
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type={isPasswordVisible ? "text" : "password"}
              name="password"
              placeholder="New Password"
              className="w-full p-3 pl-10 pr-10 border rounded-lg text-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
            />
            <button
              type="button"
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
            </button>
          </div>

          {/* Confirm Password Field */}
          <div className="relative mb-6">
            <FontAwesomeIcon 
              icon={faLock} 
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type={isConfirmPasswordVisible ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm New Password"
              className="w-full p-3 pl-10 pr-10 border rounded-lg text-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={loading}
            />
            <button
              type="button"
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            >
              <FontAwesomeIcon icon={isConfirmPasswordVisible ? faEyeSlash : faEye} />
            </button>
          </div>

          {/* Password requirements */}
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 font-medium mb-2">Password Requirements:</p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li className={formData.password.length >= 6 ? 'text-green-600' : ''}>
                • At least 6 characters
              </li>
              <li className={formData.password === formData.confirmPassword && formData.password ? 'text-green-600' : ''}>
                • Passwords must match
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full p-3 rounded-lg text-lg font-semibold transition duration-300 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-500 text-sm hover:underline font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;