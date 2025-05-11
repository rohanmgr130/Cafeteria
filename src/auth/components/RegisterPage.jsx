// import React, { useState, useEffect } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faUser,
//   faEnvelope,
//   faPhone,
//   faLock,
//   faEye,
//   faEyeSlash,
//   faCheckCircle
// } from "@fortawesome/free-solid-svg-icons";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import axios from "axios";

// const RegisterPage = () => {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     contact: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
//   const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errors, setErrors] = useState({});

//   const API_BASE_URL = "http://localhost:4000/api";

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "contact") {
//       const contactValue = value.replace(/\D/g, "");
//       if (contactValue.length <= 10) {
//         setFormData({ ...formData, [name]: contactValue });
//       }
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     let isValid = true;

//     if (!formData.fullName) {
//       toast.error("All fields are required!");
//       return false;
//     }

//     if (!formData.email) {
//       toast.error("All fields are required!");
//       return false;
//     }

//     if (!formData.contact) {
//       toast.error("All fields are required!");
//       return false;
//     }

//     if (!formData.password) {
//       toast.error("All fields are required!");
//       return false;
//     }

//     if (!formData.confirmPassword) {
//       toast.error("All fields are required!");
//       return false;
//     }

//     const emailRegex = /^\S+@\S+\.\S+$/;
//     if (!emailRegex.test(formData.email)) {
//       toast.error("Enter a valid email address!");
//       return false;
//     }

//     if (formData.contact.length !== 10) {
//       toast.error("Contact number must be 10 digits!");
//       return false;
//     }

//     if (formData.password.length < 6) {
//       toast.error("Password must be at least 6 characters!");
//       return false;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       toast.error("Passwords do not match!");
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }
    
//     setIsLoading(true);

//     try {
//       const payload = {
//         fullname: formData.fullName,
//         email: formData.email,
//         contact: formData.contact,
//         password: formData.password,
//         role: "user",
//       };

//       const response = await axios.post(`${API_BASE_URL}/auth/register`, payload);
      
//       const { token } = response.data;
//       localStorage.setItem('authToken', token);
      
//       // Set success message
//       setSuccessMessage("Please check your email to verify your account.");
      
//       // Clear form data after successful registration
//       setFormData({
//         fullName: "",
//         email: "",
//         contact: "",
//         password: "",
//         confirmPassword: "",
//       });
      
//       // Optional: Redirect after delay
//       setTimeout(() => {
//         window.location.href = "/login";
//       }, 3000);
      
//     } catch (error) {
//       console.error('Error during registration:', error);
      
//       if (error.response?.status === 409) {
//         setErrors({...errors, email: "Email already exists"});
//         toast.error("Email already exists!");
//       } else {
//         toast.error(error.response?.data?.message || 'Registration failed. Try again.');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Clear messages after timeout
//   useEffect(() => {
//     if (successMessage || Object.keys(errors).length > 0) {
//       const timer = setTimeout(() => {
//         setSuccessMessage("");
//         setErrors({});
//       }, 3000);
      
//       return () => clearTimeout(timer);
//     }
//   }, [successMessage, errors]);

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8">
//       <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
//         <h2 className="text-center text-3xl font-bold mb-6 text-gray-800">
//           Create Account
//         </h2>
        
//         {/* Success message */}
//         {successMessage && (
//           <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 flex items-center rounded">
//             <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" />
//             <span>{successMessage}</span>
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="relative mb-5">
//             <FontAwesomeIcon icon={faUser} className="absolute top-3 left-3 text-gray-400" />
//             <input
//               type="text"
//               name="fullName"
//               placeholder="Full Name"
//               className={`w-full p-3 pl-10 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500`}
//               value={formData.fullName}
//               onChange={handleInputChange}
//             />
//             {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
//           </div>

//           <div className="relative mb-5">
//             <FontAwesomeIcon icon={faEnvelope} className="absolute top-3 left-3 text-gray-400" />
//             <input
//               type="email"
//               name="email"
//               placeholder="Email Address"
//               className={`w-full p-3 pl-10 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500`}
//               value={formData.email}
//               onChange={handleInputChange}
//             />
//             {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
//           </div>

//           <div className="relative mb-5">
//             <FontAwesomeIcon icon={faPhone} className="absolute top-3 left-3 text-gray-400" />
//             <input
//               type="text"
//               name="contact"
//               placeholder="Contact Number"
//               className={`w-full p-3 pl-10 border ${errors.contact ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500`}
//               value={formData.contact}
//               onChange={handleInputChange}
//             />
//             {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
//           </div>

//           <div className="relative mb-5">
//             <FontAwesomeIcon icon={faLock} className="absolute top-3 left-3 text-gray-400" />
//             <input
//               type={isPasswordVisible ? "text" : "password"}
//               name="password"
//               placeholder="Password"
//               className={`w-full p-3 pl-10 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500`}
//               value={formData.password}
//               onChange={handleInputChange}
//             />
//             <button
//               type="button"
//               className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
//               onClick={() => setIsPasswordVisible(!isPasswordVisible)}
//             >
//               <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
//             </button>
//             {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
//           </div>

//           <div className="relative mb-5">
//             <FontAwesomeIcon icon={faLock} className="absolute top-3 left-3 text-gray-400" />
//             <input
//               type={isConfirmPasswordVisible ? "text" : "password"}
//               name="confirmPassword"
//               placeholder="Confirm Password"
//               className={`w-full p-3 pl-10 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500`}
//               value={formData.confirmPassword}
//               onChange={handleInputChange}
//             />
//             <button
//               type="button"
//               className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
//               onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
//             >
//               <FontAwesomeIcon icon={isConfirmPasswordVisible ? faEyeSlash : faEye} />
//             </button>
//             {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
//           </div>

//           <button
//             type="submit"
//             className={`w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 font-medium ${
//               isLoading ? "opacity-70 cursor-not-allowed" : ""
//             }`}
//             disabled={isLoading}
//           >
//             {isLoading ? "Processing..." : "Register"}
//           </button>
//         </form>

//         <div className="text-center mt-6">
//           <span className="text-gray-600">Already have an account?</span>
//           <a
//             href="/login"
//             className="ml-1 text-green-500 hover:text-green-700 font-medium"
//           >
//             Login here
//           </a>
//         </div>
//       </div>

//       <ToastContainer position="top-right" autoClose={3000} />
//     </div>
//   );
// };

// export default RegisterPage;




import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faLock,
  faEye,
  faEyeSlash,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "contact") {
      const contactValue = value.replace(/\D/g, "");
      if (contactValue.length <= 10) {
        setFormData({ ...formData, [name]: contactValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.fullName) {
      toast.error("All fields are required!");
      return false;
    }

    if (!formData.email) {
      toast.error("All fields are required!");
      return false;
    }

    if (!formData.contact) {
      toast.error("All fields are required!");
      return false;
    }

    if (!formData.password) {
      toast.error("All fields are required!");
      return false;
    }

    if (!formData.confirmPassword) {
      toast.error("All fields are required!");
      return false;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Enter a valid email address!");
      return false;
    }

    if (formData.contact.length !== 10) {
      toast.error("Contact number must be 10 digits!");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
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

      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, payload);
      
      // Set success message
      setSuccessMessage("Please check your email to verify your account.");
      toast.success("Registration successful! Please check your email to verify your account.");
      
      // Clear form data after successful registration
      setFormData({
        fullName: "",
        email: "",
        contact: "",
        password: "",
        confirmPassword: "",
      });
      
      // Optional: Redirect after delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
      
    } catch (error) {
      console.error('Error during registration:', error);
      
      if (error.response?.status === 409 || error.response?.data?.message === "User already exists") {
        setErrors({...errors, email: "Email already exists"});
        toast.error("Email already exists!");
      } else {
        toast.error(error.response?.data?.message || 'Registration failed. Try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage || Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrors({});
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage, errors]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-center text-3xl font-bold mb-6 text-gray-800">
          Create Account
        </h2>
        
        {/* Success message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 flex items-center rounded">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="relative mb-5">
            <FontAwesomeIcon icon={faUser} className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              className={`w-full p-3 pl-10 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500`}
              value={formData.fullName}
              onChange={handleInputChange}
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          <div className="relative mb-5">
            <FontAwesomeIcon icon={faEnvelope} className="absolute top-3 left-3 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className={`w-full p-3 pl-10 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500`}
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="relative mb-5">
            <FontAwesomeIcon icon={faPhone} className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              name="contact"
              placeholder="Contact Number"
              className={`w-full p-3 pl-10 border ${errors.contact ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500`}
              value={formData.contact}
              onChange={handleInputChange}
            />
            {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
          </div>

          <div className="relative mb-5">
            <FontAwesomeIcon icon={faLock} className="absolute top-3 left-3 text-gray-400" />
            <input
              type={isPasswordVisible ? "text" : "password"}
              name="password"
              placeholder="Password"
              className={`w-full p-3 pl-10 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500`}
              value={formData.password}
              onChange={handleInputChange}
            />
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
            </button>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="relative mb-5">
            <FontAwesomeIcon icon={faLock} className="absolute top-3 left-3 text-gray-400" />
            <input
              type={isConfirmPasswordVisible ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              className={`w-full p-3 pl-10 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500`}
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            >
              <FontAwesomeIcon icon={isConfirmPasswordVisible ? faEyeSlash : faEye} />
            </button>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            className={`w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 font-medium ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Register"}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-gray-600">Already have an account?</span>
          <a href="/login" className="ml-1 text-green-500 hover:text-green-700 font-medium">
            Login here
          </a>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default RegisterPage;