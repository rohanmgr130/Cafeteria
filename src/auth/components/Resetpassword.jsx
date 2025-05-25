// import React, { useState, useEffect } from 'react';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faLock, faEye, faEyeSlash, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { toast, Toaster } from 'react-hot-toast';
// import axios from 'axios';

// const ResetPasswordPage = () => {
//   const [searchParams] = useSearchParams();
//   const [formData, setFormData] = useState({
//     password: '',
//     confirmPassword: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [tokenValid, setTokenValid] = useState(null);
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
//   const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
//   const [resetSuccess, setResetSuccess] = useState(false);
//   const navigate = useNavigate();

//   const token = searchParams.get('t');

//   // Verify token on component mount
//   useEffect(() => {
//     if (!token) {
//       toast.error('Invalid reset link');
//       navigate('/login');
//       return;
//     }

//     verifyToken();
//   }, [token, navigate]);

//   const verifyToken = async () => {
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_API_BASE_URL}/api/auth/verify-reset-token/${token}`
//       );
      
//       if (response.data.success) {
//         setTokenValid(true);
//       } else {
//         setTokenValid(false);
//         toast.error('Reset link is invalid or expired');
//       }
//     } catch (error) {
//       console.error('Token verification error:', error);
//       setTokenValid(false);
//       toast.error('Reset link is invalid or expired');
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const validateForm = () => {
//     if (!formData.password) {
//       toast.error('Password is required');
//       return false;
//     }

//     if (formData.password.length < 6) {
//       toast.error('Password must be at least 6 characters long');
//       return false;
//     }

//     if (!formData.confirmPassword) {
//       toast.error('Please confirm your password');
//       return false;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       toast.error('Passwords do not match');
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_API_BASE_URL}/api/auth/reset-password/${token}`,
//         {
//           password: formData.password,
//           confirmPassword: formData.confirmPassword
//         }
//       );

//       if (response.data.success) {
//         setResetSuccess(true);
//         toast.success('Password reset successful!');
//       } else {
//         toast.error(response.data.message || 'Failed to reset password');
//       }
//     } catch (error) {
//       console.error('Reset password error:', error);
      
//       if (error.response?.status === 400) {
//         toast.error('Reset link is invalid or expired');
//       } else {
//         toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter') {
//       handleSubmit(e);
//     }
//   };

//   // Success screen
//   if (resetSuccess) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-100 to-blue-100">
//         <Toaster position="top-right" />
//         <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">
//           <div className="mb-6">
//             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-green-600" />
//             </div>
//             <h2 className="text-2xl font-semibold text-gray-800 mb-4">Password Reset Successful!</h2>
//             <p className="text-gray-600 mb-6">
//               Your password has been successfully reset. You can now login with your new password.
//             </p>
//           </div>

//           <button
//             onClick={() => navigate('/login')}
//             className="w-full p-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition duration-300"
//           >
//             Go to Login
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Invalid token screen
//   if (tokenValid === false) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-100 to-blue-100">
//         <Toaster position="top-right" />
//         <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">
//           <div className="mb-6">
//             <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <FontAwesomeIcon icon={faTimesCircle} className="text-3xl text-red-600" />
//             </div>
//             <h2 className="text-2xl font-semibold text-gray-800 mb-4">Invalid Reset Link</h2>
//             <p className="text-gray-600 mb-6">
//               This password reset link is invalid or has expired. Please request a new one.
//             </p>
//           </div>

//           <div className="space-y-3">
//             <button
//               onClick={() => navigate('/forgot-password')}
//               className="w-full p-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
//             >
//               Request New Link
//             </button>
            
//             <button
//               onClick={() => navigate('/login')}
//               className="w-full p-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition duration-300"
//             >
//               Back to Login
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Loading state
//   if (tokenValid === null) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-100 to-blue-100">
//         <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-gray-600">Verifying reset link...</p>
//         </div>
//       </div>
//     );
//   }

//   // Reset password form
//   return (
//     <div 
//       className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-100 to-blue-100"
//       onKeyDown={handleKeyDown}
//       tabIndex="0"
//     >
//       <Toaster position="top-right" />
//       <div className="bg-white p-8 rounded-xl shadow-lg w-96">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <FontAwesomeIcon icon={faLock} className="text-3xl text-blue-600" />
//           </div>
//           <h2 className="text-2xl font-semibold text-gray-800 mb-2">Reset Your Password</h2>
//           <p className="text-gray-600 text-sm">
//             Enter your new password below.
//           </p>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit}>
//           {/* Password Field */}
//           <div className="relative mb-5">
//             <FontAwesomeIcon 
//               icon={faLock} 
//               className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" 
//             />
//             <input
//               type={isPasswordVisible ? "text" : "password"}
//               name="password"
//               placeholder="New Password"
//               className="w-full p-3 pl-10 pr-10 border rounded-lg text-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//               value={formData.password}
//               onChange={handleInputChange}
//               disabled={loading}
//             />
//             <button
//               type="button"
//               className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//               onClick={() => setIsPasswordVisible(!isPasswordVisible)}
//             >
//               <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
//             </button>
//           </div>

//           {/* Confirm Password Field */}
//           <div className="relative mb-6">
//             <FontAwesomeIcon 
//               icon={faLock} 
//               className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" 
//             />
//             <input
//               type={isConfirmPasswordVisible ? "text" : "password"}
//               name="confirmPassword"
//               placeholder="Confirm New Password"
//               className="w-full p-3 pl-10 pr-10 border rounded-lg text-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//               value={formData.confirmPassword}
//               onChange={handleInputChange}
//               disabled={loading}
//             />
//             <button
//               type="button"
//               className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//               onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
//             >
//               <FontAwesomeIcon icon={isConfirmPasswordVisible ? faEyeSlash : faEye} />
//             </button>
//           </div>

//           {/* Password requirements */}
//           <div className="mb-6 p-3 bg-blue-50 rounded-lg">
//             <p className="text-sm text-blue-700 font-medium mb-2">Password Requirements:</p>
//             <ul className="text-xs text-blue-600 space-y-1">
//               <li className={formData.password.length >= 6 ? 'text-green-600' : ''}>
//                 • At least 6 characters
//               </li>
//               <li className={formData.password === formData.confirmPassword && formData.password ? 'text-green-600' : ''}>
//                 • Passwords must match
//               </li>
//             </ul>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className={`w-full p-3 rounded-lg text-lg font-semibold transition duration-300 ${
//               loading 
//                 ? 'bg-gray-400 cursor-not-allowed' 
//                 : 'bg-green-500 hover:bg-green-600 text-white'
//             }`}
//             disabled={loading}
//           >
//             {loading ? 'Resetting...' : 'Reset Password'}
//           </button>
//         </form>

//         {/* Footer Links */}
//         <div className="text-center mt-6">
//           <button
//             onClick={() => navigate('/login')}
//             className="text-blue-500 text-sm hover:underline font-medium"
//           >
//             Back to Login
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResetPasswordPage;


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
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const token = searchParams.get('t');

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link - No token provided');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    verifyToken();
  }, [token, navigate]);

  const verifyToken = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/verify-reset-token/${token}`,
        { timeout: 10000 }
      );
      
      if (response.data.success) {
        setTokenValid(true);
        toast.success('Reset link verified successfully');
      } else {
        setTokenValid(false);
        toast.error(response.data.message || 'Reset link is invalid or expired');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      setTokenValid(false);
      
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout - Please check your connection');
      } else if (error.response?.status === 404) {
        toast.error('Invalid reset token');
      } else if (error.response?.status === 410) {
        toast.error('Reset link has expired');
      } else {
        toast.error(error.response?.data?.message || 'Failed to verify reset link');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation errors when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation feedback
    if (name === 'password') {
      validatePasswordStrength(value);
    }

    if (name === 'confirmPassword' && formData.password) {
      validatePasswordMatch(formData.password, value);
    }
  };

  const validatePasswordStrength = (password) => {
    const errors = [];
    
    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push('Password must contain at least one special character (@$!%*?&)');
      }
      if (/\s/.test(password)) {
        errors.push('Password cannot contain spaces');
      }
    }

    return errors;
  };

  const validatePasswordMatch = (password, confirmPassword) => {
    if (confirmPassword && password !== confirmPassword) {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match'
      }));
      return false;
    } else {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: ''
      }));
      return true;
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate password
    const passwordErrors = validatePasswordStrength(formData.password);
    if (passwordErrors.length > 0) {
      errors.password = passwordErrors[0]; // Show first error
      passwordErrors.forEach(error => toast.error(error));
      isValid = false;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      toast.error('Please confirm your password');
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      toast.error('Passwords do not match');
      isValid = false;
    }

    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'password123', 'admin', 'qwerty'];
    if (commonPasswords.includes(formData.password.toLowerCase())) {
      errors.password = 'Please choose a stronger password';
      toast.error('Please avoid common passwords');
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    // Show loading toast
    const loadingToast = toast.loading('Resetting your password...');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/reset-password/${token}`,
        {
          password: formData.password,
          confirmPassword: formData.confirmPassword
        },
        { 
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      toast.dismiss(loadingToast);

      if (response.data.success) {
        setResetSuccess(true);
        toast.success('Password reset successful! Redirecting to login...', {
          duration: 4000,
          icon: '🎉'
        });
        
        // Clear form data for security
        setFormData({
          password: '',
          confirmPassword: ''
        });
      } else {
        toast.error(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Reset password error:', error);
      
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout - Please try again');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Invalid request data');
      } else if (error.response?.status === 401) {
        toast.error('Reset link is invalid or expired');
        setTokenValid(false);
      } else if (error.response?.status === 422) {
        toast.error('Password does not meet requirements');
      } else if (error.response?.status === 429) {
        toast.error('Too many attempts. Please try again later');
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later');
      } else {
        toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  };

  const getPasswordStrengthColor = (password) => {
    const errors = validatePasswordStrength(password);
    if (!password) return 'text-gray-400';
    if (errors.length === 0) return 'text-green-600';
    if (errors.length <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPasswordStrengthText = (password) => {
    const errors = validatePasswordStrength(password);
    if (!password) return 'Enter password';
    if (errors.length === 0) return 'Strong password';
    if (errors.length <= 2) return 'Medium strength';
    return 'Weak password';
  };

  // Success screen
  if (resetSuccess) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-100 to-blue-100">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#10B981',
              color: '#fff',
            },
          }}
        />
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
            onClick={() => {
              toast.success('Redirecting to login...');
              navigate('/login');
            }}
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
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#EF4444',
              color: '#fff',
            },
          }}
        />
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
              onClick={() => {
                toast.success('Redirecting to forgot password...');
                navigate('/forgot-password');
              }}
              className="w-full p-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
            >
              Request New Link
            </button>
            
            <button
              onClick={() => {
                toast.success('Redirecting to login...');
                navigate('/login');
              }}
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
        <Toaster position="top-right" />
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
            style: {
              background: '#10B981',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faLock} className="text-3xl text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Reset Your Password</h2>
          <p className="text-gray-600 text-sm">
            Create a strong password for your account security.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Password Field */}
          <div className="relative mb-3">
            <FontAwesomeIcon 
              icon={faLock} 
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type={isPasswordVisible ? "text" : "password"}
              name="password"
              placeholder="New Password"
              className={`w-full p-3 pl-10 pr-10 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                validationErrors.password 
                  ? 'border-red-300 focus:ring-red-400' 
                  : formData.password && validatePasswordStrength(formData.password).length === 0
                  ? 'border-green-300 focus:ring-green-400'
                  : 'border-gray-300 focus:ring-blue-400'
              }`}
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              disabled={loading}
            >
              <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mb-4">
              <p className={`text-sm font-medium ${getPasswordStrengthColor(formData.password)}`}>
                {getPasswordStrengthText(formData.password)}
              </p>
            </div>
          )}

          {/* Confirm Password Field */}
          <div className="relative mb-4">
            <FontAwesomeIcon 
              icon={faLock} 
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type={isConfirmPasswordVisible ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm New Password"
              className={`w-full p-3 pl-10 pr-10 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                validationErrors.confirmPassword 
                  ? 'border-red-300 focus:ring-red-400' 
                  : formData.confirmPassword && formData.password === formData.confirmPassword
                  ? 'border-green-300 focus:ring-green-400'
                  : 'border-gray-300 focus:ring-blue-400'
              }`}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
              disabled={loading}
            >
              <FontAwesomeIcon icon={isConfirmPasswordVisible ? faEyeSlash : faEye} />
            </button>
          </div>

          {/* Password Match Indicator */}
          {formData.confirmPassword && (
            <div className="mb-4">
              <p className={`text-sm font-medium ${
                formData.password === formData.confirmPassword 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formData.password === formData.confirmPassword 
                  ? '✓ Passwords match' 
                  : '✗ Passwords do not match'
                }
              </p>
            </div>
          )}

          {/* Password requirements */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 font-medium mb-3">Password Requirements:</p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li className={formData.password && formData.password.length >= 8 ? 'text-green-600' : ''}>
                • At least 8 characters
              </li>
              <li className={formData.password && /(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : ''}>
                • One lowercase letter (a-z)
              </li>
              <li className={formData.password && /(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : ''}>
                • One uppercase letter (A-Z)
              </li>
              <li className={formData.password && /(?=.*\d)/.test(formData.password) ? 'text-green-600' : ''}>
                • One number (0-9)
              </li>
              <li className={formData.password && /(?=.*[@$!%*?&])/.test(formData.password) ? 'text-green-600' : ''}>
                • One special character (@$!%*?&)
              </li>
              <li className={formData.password && formData.confirmPassword && formData.password === formData.confirmPassword ? 'text-green-600' : ''}>
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
                : 'bg-green-500 hover:bg-green-600 text-white hover:shadow-md'
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Resetting Password...
              </div>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              if (!loading) {
                toast.success('Redirecting to login...');
                navigate('/login');
              }
            }}
            className="text-blue-500 text-sm hover:underline font-medium transition-colors"
            disabled={loading}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;