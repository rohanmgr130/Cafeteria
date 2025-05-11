




import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Info, Shield } from 'lucide-react';
import Navbar from "../components/Navbar";
import Footer from "../components/FooterPart";
import MyOrder from "../components/Order/MyOrder";

const Checkout = () => {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingCart, setFetchingCart] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState("");
  const userId = localStorage.getItem('id');
  const cartId = localStorage.getItem('cartId');

  // Fetch cart details on component mount
  useEffect(() => {
    fetchCartDetails();
  }, []);

  // Fetch cart details function
  const fetchCartDetails = async () => {
    if (!cartId || !userId) {
      setFetchingCart(false);
      showToast("No cart found. Please add items to your cart.", "error");
      return;
    }

    setFetchingCart(true);
    try {
      const response = await fetch(`http://localhost:4000/api/get-cart/${cartId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart details');
      }

      const data = await response.json();
      console.log("Cart data received:", data); // Debug log
      
      // Handle different API response structures
      if (data.cart) {
        setCartData(data.cart);
      } else if (data) {
        setCartData(data); // Maybe the API returns the cart directly
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      showToast("Failed to load cart details", "error");
    } finally {
      setFetchingCart(false);
    }
  };


  // Show toast notification
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    // Auto hide after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Calculate cart totals safely
  const getOrderTotal = () => {
    if (!cartData) return '0.00';
    
    // Check for orderTotal property
    if (cartData.orderTotal) {
      return cartData.orderTotal.toFixed(2);
    }
    
    // If orderTotal doesn't exist, try to calculate from items
    if (cartData.items && Array.isArray(cartData.items)) {
      const total = cartData.items.reduce((sum, item) => sum + (item.total || 0), 0);
      return total.toFixed(2);
    }
    
    return '0.00';
  };

  const getFinalTotal = () => {
    if (!cartData) return '0.00';
    
    // Check for finalTotal property
    if (cartData.finalTotal) {
      return cartData.finalTotal.toFixed(2);
    }
    
    // Calculate final total from orderTotal and discount
    const orderTotal = cartData.orderTotal || 0;
    const discount = cartData.discount || 0;
    return (orderTotal - discount).toFixed(2);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen mt-9 bg-gray-50 py-14 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Toast notification */}
          {toast && (
            <div 
              className={`fixed top-24 right-4 left-auto w-80 p-4 rounded-md shadow-md flex items-center justify-between z-50 ${
                toast.type === "error" ? "bg-red-100 text-red-700" : 
                toast.type === "success" ? "bg-green-100 text-green-700" : 
                "bg-blue-100 text-blue-700"
              }`}
            >
              <div className="flex items-center">
                {toast.type === "error" ? (
                  <AlertCircle className="mr-2 h-5 w-5" />
                ) : toast.type === "success" ? (
                  <CheckCircle className="mr-2 h-5 w-5" />
                ) : (
                  <Info className="mr-2 h-5 w-5" />
                )}
                <span>{toast.message}</span>
              </div>
              <button 
                onClick={() => setToast(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <span className="text-sm mt-2 font-medium">Cart</span>
              </div>
              <div className="flex-1 h-1 mx-2 bg-blue-600"></div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <span className="text-sm mt-2 font-medium">Checkout</span>
              </div>
              <div className="flex-1 h-1 mx-2 bg-gray-300"></div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">3</div>
                <span className="text-sm mt-2 font-medium text-gray-600">Confirmation</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Order Summary Section */}
            <div className="lg:col-span-2 bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="p-7 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
              </div>
              <div className="p-7">
                {fetchingCart ? (
                  <div className="flex justify-center items-center h-60">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <MyOrder />
                )}
              </div>
            </div>

            {/* Payment Section */}
           
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;

