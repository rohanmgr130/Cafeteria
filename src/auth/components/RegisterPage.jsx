import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";


const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Toast notification system
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info") => {
    const id = Date.now();
    const toast = { id, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Validation rules
  const validationRules = {
    fullName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/,
      message: "Full name must contain only letters and spaces (2-50 characters)"
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address"
    },
    contact: {
      required: true,
      pattern: /^[0-9]{10}$/,
      message: "Contact number must be exactly 10 digits"
    },
    password: {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
    }
  };

  // Validate individual field
  const validateField = (name, value) => {
    const rule = validationRules[name];
    if (!rule) return "";

    if (rule.required && !value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return rule.message || `Minimum ${rule.minLength} characters required`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message || `Maximum ${rule.maxLength} characters allowed`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message;
    }

    // Special validation for confirm password
    if (name === "confirmPassword") {
      if (value !== formData.password) {
        return "Passwords do not match";
      }
    }

    return "";
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Special validation for confirm password
    if (formData.confirmPassword && formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change with real-time validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Special handling for contact field (numbers only)
    if (name === "contact") {
      processedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    // Special handling for full name (letters and spaces only)
    if (name === "fullName") {
      processedValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));

    // Real-time validation for touched fields
    if (touched[name]) {
      const error = validateField(name, processedValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    // Special case for confirm password - validate when password changes
    if (name === "password" && touched.confirmPassword && formData.confirmPassword) {
      const confirmError = processedValue !== formData.confirmPassword 
        ? "Passwords do not match" 
        : "";
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  // Handle field blur (mark as touched)
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e && e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      showToast("Please fix the errors below", "error");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        fullname: formData.fullName,
        email: formData.email,
        contact: formData.contact,
        password: formData.password,
        role: "user",
      };

      // Replace this with your actual API call
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success/failure
      if (Math.random() > 0.3) {
        // Success
        setSuccessMessage("Registration successful! Please check your email to verify your account.");
        showToast("Registration successful! Please check your email to verify your account.", "success");
        
        // Clear form data after successful registration
        setFormData({
          fullName: "",
          email: "",
          contact: "",
          password: "",
          confirmPassword: "",
        });
        setTouched({});
        setErrors({});
        
        // Redirect after delay
        setTimeout(() => {
          showToast("Redirecting to login...", "info");
          // Replace with your navigation logic
          window.location.href = "/login";
        }, 3000);
      } else {
        // Simulate email already exists error
        setErrors({ email: "Email already exists" });
        showToast("Email already exists!", "error");
      }

      
      // Uncomment this for actual API call
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, payload);
      
      setSuccessMessage("Registration successful! Please check your email to verify your account.");
      showToast("Registration successful! Please check your email to verify your account.", "success");
      
      setFormData({
        fullName: "",
        email: "",
        contact: "",
        password: "",
        confirmPassword: "",
      });
      setTouched({});
      setErrors({});
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
     
      
    } catch (error) {
      console.error('Error during registration:', error);
      
      if (error.response?.status === 409 || error.response?.data?.message === "User already exists") {
        setErrors({...errors, email: "Email already exists"});
        showToast("Email already exists!", "error");
      } else {
        showToast(error.response?.data?.message || 'Registration failed. Try again.', "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to login
  const navigateToLogin = () => {
    // Replace with your navigation logic (React Router, Next.js, etc.)
    window.location.href = "/login";
  };

  // Clear success message after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: "", color: "" };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    const levels = [
      { score: 0, label: "", color: "" },
      { score: 1, label: "Very Weak", color: "bg-red-500" },
      { score: 2, label: "Weak", color: "bg-orange-500" },
      { score: 3, label: "Fair", color: "bg-yellow-500" },
      { score: 4, label: "Good", color: "bg-blue-500" },
      { score: 5, label: "Strong", color: "bg-green-500" }
    ];

    return levels[score];
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8 px-4">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
              toast.type === "success" ? "bg-green-500 text-white" :
              toast.type === "error" ? "bg-red-500 text-white" :
              toast.type === "info" ? "bg-blue-500 text-white" :
              "bg-gray-500 text-white"
            }`}
          >
            <div className="flex items-center">
              {toast.type === "success" && <CheckCircle className="w-5 h-5 mr-2" />}
              {toast.type === "error" && <AlertCircle className="w-5 h-5 mr-2" />}
              <span className="text-sm">{toast.message}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-center text-3xl font-bold mb-6 text-gray-800">
          Create Account
        </h2>
        
        {/* Success message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 flex items-center rounded">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            <span className="text-sm">{successMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Full Name */}
          <div className="relative">
            <User className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={formData.fullName}
              onChange={handleInputChange}
              onBlur={handleBlur}
            />
            {errors.fullName && (
              <div className="flex items-center mt-1 text-red-500 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.fullName}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
            />
            {errors.email && (
              <div className="flex items-center mt-1 text-red-500 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.email}
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="relative">
            <Phone className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="contact"
              placeholder="Contact Number (10 digits)"
              className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.contact ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={formData.contact}
              onChange={handleInputChange}
              onBlur={handleBlur}
            />
            {errors.contact && (
              <div className="flex items-center mt-1 text-red-500 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.contact}
              </div>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
            <input
              type={isPasswordVisible ? "text" : "password"}
              name="password"
              placeholder="Password"
              className={`w-full p-3 pl-10 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
            />
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              {isPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            
            {/* Password strength indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Password Strength</span>
                  <span className={`font-medium ${
                    passwordStrength.score <= 2 ? 'text-red-500' :
                    passwordStrength.score <= 3 ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {errors.password && (
              <div className="flex items-center mt-1 text-red-500 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.password}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
            <input
              type={isConfirmPasswordVisible ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              className={`w-full p-3 pl-10 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onBlur={handleBlur}
            />
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            >
              {isConfirmPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {errors.confirmPassword && (
              <div className="flex items-center mt-1 text-red-500 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className={`w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 font-medium flex items-center justify-center ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              "Register"
            )}
          </button>
        </div>

        <div className="text-center mt-6">
          <span className="text-gray-600">Already have an account? </span>
          <button 
            onClick={navigateToLogin}
            className="text-green-500 hover:text-green-700 font-medium hover:underline transition-colors"
          >
            Login here
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;