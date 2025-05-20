
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import for navigation

// Enhanced OnlinePayment component with Khalti integration and redirection
const OnlinePayment = ({ cartTotal, onCheckout, loading, checkoutLoading, cartDetails, refreshCartDetails }) => {
  // Toast state
  const [toast, setToast] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState("");
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(cartTotal);
  const [error, setError] = useState("");
  const userId = localStorage.getItem('id');
  const cartId = localStorage.getItem('cartId');
  
  // Navigation hooks
  const navigate = useNavigate();
  const location = useLocation();

  // State for tracking cart fetching status
  const [fetchingCart, setFetchingCart] = useState(false);
  const [cartData, setCartData] = useState(null);
  
  // State for processing payment verification
  const [processingVerification, setProcessingVerification] = useState(false);

  // Fetch cart details function
  const fetchCartDetails = async () => {
    if (!cartId || !userId) {
      setFetchingCart(false);
      showToast("No cart found. Please add items to your cart.", "error");
      return;
    }

    setFetchingCart(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/get-cart/${cartId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Check for network errors first
      if (!response) {
        throw new Error('Network error - unable to connect to server');
      }

      // Handle HTTP error responses with more details
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Server error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Cart data received:", data); // Debug log

      // Handle different API response structures
      if (data.cart) {
        setCartData(data.cart);

        // Update discount and final total
        if (data.cart.discount) {
          setDiscount(data.cart.discount);
        }
        if (data.cart.finalTotal) {
          setFinalTotal(data.cart.finalTotal);
        } else if (data.cart.orderTotal) {
          setFinalTotal(data.cart.orderTotal - (data.cart.discount || 0));
        }
      } else if (data) {
        setCartData(data); // Maybe the API returns the cart directly

        // Update discount and final total
        if (data.discount) {
          setDiscount(data.discount);
        }
        if (data.finalTotal) {
          setFinalTotal(data.finalTotal);
        } else if (data.orderTotal) {
          setFinalTotal(data.orderTotal - (data.discount || 0));
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      showToast(`Failed to load cart details: ${error.message}`, "error");
      setCartData(null);
    } finally {
      setFetchingCart(false);
    }
  };

  // Check payment status on component mount and URL parameters
  useEffect(() => {
    // Parse query parameters from URL
    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get('status');
    const pidx = queryParams.get('pidx');
    const transactionId = localStorage.getItem('khaltiTransactionId');
    const orderId = localStorage.getItem('currentOrderId');
    
    // If we have payment status parameters from Khalti redirect
    if (paymentStatus && pidx) {
      setProcessingVerification(true);
      
      // Verify the payment with our backend
      const verifyPayment = async () => {
        try {
          showToast("Verifying your payment...", "info");
          
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/khalti/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: paymentStatus,
              pidx,
              transactionId,
              orderId,
              userId
            })
          });
          
          if (!response.ok) {
            throw new Error('Payment verification failed');
          }
          
          const data = await response.json();
          
          if (data.success) {
            // Clear cart-related localStorage items
            localStorage.removeItem('currentOrderId');
            localStorage.removeItem('khaltiTransactionId');
            localStorage.removeItem('cartId');
            
            showToast("Payment successful! Redirecting to home...", "success");
            
            // Navigate to home page after successful payment
            setTimeout(() => {
              navigate('/');
            }, 2000);
          } else {
            showToast(data.message || "Payment verification failed", "error");
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          showToast(`Payment verification error: ${error.message}`, "error");
        } finally {
          setProcessingVerification(false);
        }
      };
      
      verifyPayment();
    }
  }, [location.search, navigate]);

  // Update finalTotal whenever cartTotal or discount changes (for cases when cartDetails is passed as prop)
  useEffect(() => {
    // If cartDetails exists and has discount information, use it
    if (cartDetails) {
      if (cartDetails.discount) {
        setDiscount(cartDetails.discount);
      }
      // If finalTotal is already calculated by the backend, use it
      if (cartDetails.finalTotal) {
        setFinalTotal(cartDetails.finalTotal);
      } else {
        // Otherwise calculate it locally
        setFinalTotal(cartTotal - discount);
      }
    } else if (!cartData) {
      // Only calculate locally if we don't have cartData from our own fetch
      setFinalTotal(cartTotal - discount);
    }
  }, [cartTotal, discount, cartDetails]);

  // Handle checkout with validation
  const handleCheckout = () => {
    if (!finalTotal || finalTotal <= 0) {
      showToast("Your cart is empty", "error");
      return;
    }

    showToast("Processing your payment...", "info");
    initiateKhaltiPayment();
  };

  // Initiate Khalti direct payment
  const initiateKhaltiPayment = async () => {
    setError("");

    try {
      // First check if we have cart data
      if (!cartId) {
        showToast("Cart information not available", "error");
        return;
      }

      // First, try to fetch the latest cart data if we don't have it
      if (!cartData && !fetchingCart) {
        await fetchCartDetails();
      }

      showToast("Connecting to payment gateway...", "info");

      // Get current URL for return URL
      const currentUrl = window.location.origin;

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/khalti/initiate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          cartId,
          userId,
          amount: finalTotal,
          returnUrl: `${currentUrl}/` // Send users back to root URL with payment params
        }),
      });

      // Check for network errors
      if (!response) {
        throw new Error('Network error - unable to connect to payment server');
      }

      // Try to parse the response data, with error handling
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Invalid response from payment server');
      }

      console.log('response::::::::::::', response);
            console.log('data::::::::::::', data);
                        console.log('data.khaltiPaymentUrl::::::::::::', data.khaltiPaymentUrl);


      if (response.ok && data.khaltiPaymentUrl) {
        // Store order ID for verification later
        localStorage.setItem('currentOrderId', data.orderId);
        localStorage.setItem('khaltiTransactionId', data.transactionId);

        showToast("Redirecting to payment gateway...", "info");

        // Redirect to Khalti payment page
        window.location.href = data.khaltiPaymentUrl;
      } else {
        const errorMessage = data.error || data.message || "Payment failed. Please try again.";
        setError(errorMessage);
        showToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError(error.message || "Payment processing error. Please try again.");
      showToast(error.message || "Payment processing error. Please try again.", "error");
    }
  };

  // Apply promo code function
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoStatus("Please enter a promo code");
      showToast("Please enter a promo code", "error");
      return;
    }

    try {
      // Make API call to validate and apply the promo code
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/apply-promo-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          promoCode,
          cartId // Include cartId in the request
        }),
      });

      // Better error handling
      if (!response) {
        throw new Error('Network error - unable to connect to server');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Server error: ${response.status} ${response.statusText}`;
        setPromoStatus(errorMessage);
        showToast(errorMessage, "error");
        return;
      }

      const data = await response.json();

      // Update discount and final total from backend response
      if (data.cart) {
        setDiscount(data.cart.discount || 0);
        setFinalTotal(data.cart.finalTotal || data.cart.orderTotal - data.cart.discount); 
        setCartData(data.cart); // Update cart data
      } else {
        setDiscount(data.discount || 0);
        setFinalTotal(data.finalTotal || data.orderTotal - data.discount);
        if (data.cart_id || data.cartId) {
          // Fetch updated cart data if we have a cart ID
          fetchCartDetails();
        }
      }

      setPromoStatus("Promo code applied successfully!");
      showToast("Promo code applied successfully!", "success");
      setTimeout(() => setPromoStatus(""), 3000);
      setPromoCode("");

      // Notify parent component to refresh cart details
      if (refreshCartDetails) {
        refreshCartDetails();
      }

    } catch (error) {
      console.error("Error applying promo code:", error);
      setPromoStatus(`Error: ${error.message}`);
      showToast(`Error applying promo code: ${error.message}`, "error");
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

  // Effect to fetch cart details when component mounts
  useEffect(() => {
    if (cartId && userId && !cartDetails) {
      fetchCartDetails();
    }
  }, [cartId, userId]);

  // If we're processing payment verification, show a loading indicator
  if (processingVerification) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mb-4"></div>
        <h2 className="text-xl font-semibold text-purple-700">Verifying Payment</h2>
        <p className="text-gray-600 mt-2">Please wait while we verify your payment...</p>
        
        {/* Toast notification */}
        {toast && (
          <div 
            className={`mt-4 p-3 rounded-md shadow-md flex items-center justify-between w-full ${
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
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative">
      {/* Toast notification */}
      {toast && (
        <div 
          className={`absolute top-2 right-2 left-2 p-3 rounded-md shadow-md flex items-center justify-between ${
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

      <h2 className="text-xl font-semibold mb-4">Payment Options</h2>

      {/* Payment Method Display */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-base font-bold mr-3">1</div>
          <h3 className="text-lg font-semibold text-gray-700">Payment Method</h3>
        </div>

        <div className="space-y-3">
          {/* Khalti Direct Payment Option */}
          <div className="border-2 rounded-lg border-purple-500 bg-purple-50">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#5C2D91] rounded-md flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">K</span>
                </div>
                <div>
                  <h4 className="font-medium text-lg">Khalti Direct</h4>
                  <p className="text-sm text-gray-500">The payment will be non-refundable once made </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promo code section */}
      <div className="mb-5">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-base font-bold mr-3">2</div>
          <h3 className="text-lg font-semibold text-gray-700">Apply Promo Code</h3>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter code"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <button 
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow-sm font-medium"
            onClick={applyPromoCode}
          >
            Apply
          </button>
        </div>
        {promoStatus && (
          <p className={`text-sm mt-2 ${promoStatus.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
            {promoStatus}
          </p>
        )}
      </div>

      {/* Order summary */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-base font-bold mr-3">3</div>
          <h3 className="text-lg font-semibold text-gray-700">Order Summary</h3>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>Cart Total:</span>
            {loading ? (
              <span className="font-medium">Loading...</span>
            ) : (
              <span className="font-medium">Rs. {cartTotal?.toFixed(2) || '0.00'}</span>
            )}
          </div>

          {discount > 0 && (
            <div className="flex justify-between mb-2 text-green-600">
              <span>Discount:</span>
              <span>- Rs. {discount.toFixed(2)}</span>
            </div>
          )}

          <div className="border-t pt-2 mt-2 flex justify-between font-bold">
            <span>Total Amount:</span>
            {loading ? (
              <span className="font-medium">Loading...</span>
            ) : (
              <span className="font-medium">Rs. {finalTotal?.toFixed(2) || '0.00'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg mb-5">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Loading indicator when fetching cart */}
      {fetchingCart && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
          <span className="ml-2 text-purple-700">Loading cart details...</span>
        </div>
      )}

      <div className="mt-4">
        <button 
          onClick={handleCheckout}
          disabled={checkoutLoading || fetchingCart || !finalTotal || finalTotal <= 0}
          className={`w-full py-3 rounded-md font-medium transition duration-200 ${
            !checkoutLoading && !fetchingCart && finalTotal > 0
              ? 'bg-[#5C2D91] text-white hover:bg-[#4A2275]' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {checkoutLoading ? "Please wait..." : fetchingCart ? "Loading cart details..." : "Proceed to Khalti Payment"}
        </button>

        <p className="text-gray-600 mt-4 text-sm">
          You'll be redirected to Khalti payment portal to complete your transaction. After successful payment, you'll automatically return to the home page.
        </p>

        {/* Security Note */}
        <div className="flex items-center justify-center text-gray-500 text-sm mt-4">
          <Shield className="h-4 w-4 mr-1" />
          Secure payment processed by Khalti
        </div>

        {/* Retry button if cart fetch failed */}
        {error && error.includes("Failed to load cart") && (
          <button 
            onClick={fetchCartDetails}
            className="mt-4 w-full py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
          >
            Retry Loading Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default OnlinePayment;