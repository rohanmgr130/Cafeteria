



import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

// Cash payment component with promo code support
const CashPayment = ({ cartTotal, onPlaceOrder, loading, checkoutLoading, cartDetails, refreshCartDetails }) => {
  // Toast state
  const [toast, setToast] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState("");
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(cartTotal);
  const userId = localStorage.getItem('id');

  // Update finalTotal whenever cartTotal or discount changes
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
    } else {
      setFinalTotal(cartTotal - discount);
    }
  }, [cartTotal, discount, cartDetails]);

  // Handle place order with toast validation
  const handlePlaceOrder = () => {
    if (!finalTotal || finalTotal <= 0) {
      showToast("Your cart is empty", "error");
      return;
    }
    
    showToast("Processing your order...", "info");
    onPlaceOrder();
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
      const response = await fetch('http://localhost:4000/api/apply-promo-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          promoCode
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setPromoStatus(errorData.message || "Failed to apply promo code");
        showToast(errorData.message || "Failed to apply promo code", "error");
        return;
      }
      
      const data = await response.json();
      
      // Update discount and final total from backend response
      setDiscount(data.cart.discount);
      setFinalTotal(data.cart.finalTotal); // Use final total calculated by backend
      
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
      setPromoStatus("Error applying promo code. Please try again.");
      showToast("Error applying promo code. Please try again.", "error");
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
      
      <h2 className="text-xl font-semibold mb-4">Cash Payment Details</h2>
      
      {/* Promo code section */}
      <div className="mb-5">
        <label className="block text-gray-700 text-sm font-medium mb-2">Promo Code</label>
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
      
      <div className="mb-6">
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
      
      <div className="mt-4">
        <p className="text-gray-600 mb-4 text-sm">
          Collect your order from college canteen.
        </p>
        <button 
          onClick={handlePlaceOrder}
          disabled={checkoutLoading || !finalTotal || finalTotal <= 0}
          className={`w-full py-3 rounded-md font-medium transition duration-200 ${
            !checkoutLoading && finalTotal > 0
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {checkoutLoading ? "Please wait..." : "Place Order"}
        </button>
      </div>
    </div>
  );
};

export default CashPayment;
