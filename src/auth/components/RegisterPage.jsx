import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
      useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = "http://localhost:4000/api";

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
    if (
        !formData.fullName ||
        !formData.email ||
        !formData.contact ||
        !formData.password ||
        !formData.confirmPassword
    ) {
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

  const handleRegister = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const payload = {
        fullname: formData.fullName,
        email: formData.email,
        contact: formData.contact,
        password: formData.password,
        role: "user",
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration successful! Check your email to verify.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2500);
      } else {
        toast.error(data.message || "Registration failed. Try again.");
      }
    } catch (error) {
      toast.error("Something went wrong!");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-center text-3xl font-bold mb-6 text-gray-800">
            Create Account
          </h2>

          <div className="relative mb-5">
            <FontAwesomeIcon icon={faUser} className="absolute top-3 left-3 text-gray-400" />
            <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                value={formData.fullName}
                onChange={handleInputChange}
            />
          </div>

          <div className="relative mb-5">
            <FontAwesomeIcon icon={faEnvelope} className="absolute top-3 left-3 text-gray-400" />
            <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                value={formData.email}
                onChange={handleInputChange}
            />
          </div>

          <div className="relative mb-5">
            <FontAwesomeIcon icon={faPhone} className="absolute top-3 left-3 text-gray-400" />
            <input
                type="text"
                name="contact"
                placeholder="Contact Number"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                value={formData.contact}
                onChange={handleInputChange}
            />
          </div>

          <div className="relative mb-5">
            <FontAwesomeIcon icon={faLock} className="absolute top-3 left-3 text-gray-400" />
            <input
                type={isPasswordVisible ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
          </div>

          <div className="relative mb-5">
            <FontAwesomeIcon icon={faLock} className="absolute top-3 left-3 text-gray-400" />
            <input
                type={isConfirmPasswordVisible ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                value={formData.confirmPassword}
                onChange={handleInputChange}
            />
            <button
                type="button"
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={() =>
                    setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                }
            >
              <FontAwesomeIcon
                  icon={isConfirmPasswordVisible ? faEyeSlash : faEye}
              />
            </button>
          </div>

          <button
              className={`w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 font-medium ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              onClick={handleRegister}
              disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Register"}
          </button>

          <div className="text-center mt-6">
            <span className="text-gray-600">Already have an account?</span>
            <a
                href="/login"
                className="ml-1 text-green-500 hover:text-green-700 font-medium"
            >
              Login here
            </a>
          </div>
        </div>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
  );
};

export default RegisterPage;
