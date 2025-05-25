import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/forgot-password`,
        { email }
      );

      if (response.data.success) {
        setEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
      } else {
        toast.error(response.data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response?.status === 404) {
        toast.error('No account found with this email address');
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

  if (emailSent) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-100 to-blue-100">
        <Toaster position="top-right" />
        <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faEnvelope} className="text-3xl text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Email Sent!</h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your inbox and follow the instructions to reset your password.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> The reset link will expire in 1 hour for security reasons. 
                If you don't see the email, please check your spam folder.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full p-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
            >
              Back to Login
            </button>
            
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              className="w-full p-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition duration-300"
            >
              Try Different Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-100 to-blue-100"
      onKeyDown={handleKeyDown}
      tabIndex="0"
    >
      <Toaster position="top-right" />
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        {/* Back button */}
        <button
          onClick={() => navigate('/login')}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition duration-300"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Login
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faEnvelope} className="text-3xl text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Forgot Password?</h2>
          <p className="text-gray-600 text-sm">
            Don't worry! Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="relative mb-6">
            <FontAwesomeIcon 
              icon={faEnvelope} 
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full p-3 pl-10 border rounded-lg text-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
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
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-6 space-y-2">
          <div>
            <span className="text-gray-600 text-sm">Remember your password? </span>
            <button
              onClick={() => navigate('/login')}
              className="text-blue-500 text-sm hover:underline font-medium"
            >
              Sign In
            </button>
          </div>
          <div>
            <span className="text-gray-600 text-sm">Don't have an account? </span>
            <button
              onClick={() => navigate('/register')}
              className="text-blue-500 text-sm hover:underline font-medium"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;