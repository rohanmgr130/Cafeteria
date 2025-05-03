import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MyCart = () => {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('id');
  const navigate = useNavigate();

  // Get my cart details
  const handleMyCartDetails = async (id) => {
    if (!userId) {
      setError("Please login to view your cart");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/get-cart/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const data = await response.json();
      console.log('Cart data received:', data);
      setCartData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error while fetching cart: ", error);
      setError("Failed to load cart data");
      setLoading(false);
    }
  };

  // Update quantity function
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      // If quantity becomes less than 1, remove the item
      removeItem(itemId);
      return;
    }
    
    try {
      // Find the product ID from the item
      const item = cartData.items.find(item => item._id === itemId);
      if (!item || !item.productId) return;
      
      const productId = item.productId._id;
      
      // Update UI immediately for responsiveness
      const updatedItems = cartData.items.map(item => {
        if (item._id === itemId) {
          const newTotal = item.price * newQuantity;
          return { ...item, productQuantity: newQuantity, total: newTotal };
        }
        return item;
      });
      
      // Calculate new totals
      const newOrderTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
      
      setCartData({
        ...cartData,
        items: updatedItems,
        orderTotal: newOrderTotal,
        finalTotal: newOrderTotal - (cartData.discount || 0)
      });
      
      // Make API call to update the server
      const response = await fetch('http://localhost:4000/api/update-cart-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productId,
          productQuantity: newQuantity
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cart item');
        // Optionally revert the UI changes here if needed
      }
      
    } catch (error) {
      console.error("Error updating quantity:", error);
      // You could add user-facing error handling here
    }
  };

  // Remove item function
  const removeItem = async (itemId) => {
    try {
      // Find the product ID from the item
      const item = cartData.items.find(item => item._id === itemId);
      if (!item || !item.productId) return;
      
      const productId = item.productId._id;
      
      // Update UI immediately
      const updatedItems = cartData.items.filter(item => item._id !== itemId);
      const newOrderTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
      
      setCartData({
        ...cartData,
        items: updatedItems,
        orderTotal: newOrderTotal,
        finalTotal: newOrderTotal - (cartData.discount || 0)
      });
      
      // Make API call to remove the item from the server
      const response = await fetch('http://localhost:4000/api/remove-from-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove cart item');
        // Optionally revert the UI changes here if needed
      }
      
    } catch (error) {
      console.error("Error removing item:", error);
      // You could add user-facing error handling here
    }
  };

  // Apply promo code function
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState(""); // For showing success/error message
  
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoStatus("Please enter a promo code");
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
      
      const data = await response.json();
      
      if (!response.ok) {
        setPromoStatus(data.message || "Failed to apply promo code");
        return;
      }
      
      // Update cart data with applied promo
      setCartData({
        ...cartData,
        promoCode: promoCode,
        discount: data.cart.discount,
        finalTotal: data.cart.finalTotal
      });
      
      setPromoStatus("Promo code applied successfully!");
      setTimeout(() => setPromoStatus(""), 3000);
      setPromoCode("");
      
    } catch (error) {
      console.error("Error applying promo code:", error);
      setPromoStatus("Error applying promo code. Please try again.");
    }
  };

  useEffect(() => {
    if (userId) {
      handleMyCartDetails(userId);
    } else {
      setLoading(false);
    }
  }, [userId]);

  const proceedToCheckout = () => {
    // Navigate to checkout page
    navigate('/user-checkout');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button 
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300"
            onClick={() => navigate('/login')}
          >
            Login to View Cart
          </button>
        </div>
      </div>
    );
  }

  if (!cartData || !cartData.items || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any delicious items to your cart yet</p>
          <button 
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300"
            onClick={() => navigate('/user-menus')}
          >
            Explore Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
          <span className="text-gray-500">{cartData.items.length} items</span>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Cart items */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden flex-grow">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">My Cart</h2>
            </div>
            
            {/* Cart items */}
            <div className="divide-y divide-gray-100">
              {cartData.items.map((item) => (
                <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Item image */}
                    <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.productId && item.productId.image && (
                        <img 
                          src={`http://localhost:4000${item.productId.image}`} 
                          alt={item.productId && item.productId.title ? item.productId.title : 'Product'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = 'http://localhost:4000/uploads/default-food.png';
                          }}
                        />
                      )}
                      {(!item.productId || !item.productId.image) && (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Item details */}
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-gray-800 text-lg">
                            {item.productId && item.productId.title ? item.productId.title : 'Product'}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.productId && item.productId.type ? (
                              item.productId.type === 'non-vegetarian' ? (
                                <span className="inline-flex items-center">
                                  <span className="w-2 h-2 bg-red-500 inline-block rounded-full mr-1"></span>
                                  Non-vegetarian
                                </span>
                              ) : item.productId.type === 'vegetarian' ? (
                                <span className="inline-flex items-center">
                                  <span className="w-2 h-2 bg-green-500 inline-block rounded-full mr-1"></span>
                                  Vegetarian
                                </span>
                              ) : item.productId.type === 'drinks' ? (
                                <span className="inline-flex items-center">
                                  <span className="w-2 h-2 bg-blue-500 inline-block rounded-full mr-1"></span>
                                  Drink
                                </span>
                              ) : (
                                item.productId.type
                              )
                            ) : (
                              'Unknown type'
                            )}
                          </p>
                        </div>
                        <span className="font-medium text-gray-800">Rs. {item.price}</span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                          <button 
                            className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                            onClick={() => updateQuantity(item._id, item.productQuantity - 1)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                            </svg>
                          </button>
                          <span className="px-4 py-1 font-medium text-gray-800">{item.productQuantity}</span>
                          <button 
                            className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                            onClick={() => updateQuantity(item._id, item.productQuantity + 1)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m6-6H6"></path>
                            </svg>
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="font-medium text-indigo-600">Rs. {item.total}</span>
                          <button 
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                            onClick={() => removeItem(item._id)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right column - Order details */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-8">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Payment Details</h2>
              </div>
              
              <div className="p-6">
                {/* Promo code section */}
                <div className="mb-6">
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
                
                {/* Order summary */}
                <div className="space-y-3 py-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-800">Rs. {cartData.orderTotal}</span>
                  </div>
                  
                  {cartData.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">- Rs. {cartData.discount}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-dashed border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between text-lg font-bold text-gray-800">
                      <span>Total</span>
                      <span>Rs. {cartData.finalTotal}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                  </div>
                </div>
                
                {/* Checkout button */}
                <button 
                  className="w-full py-3 mt-6 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                  onClick={proceedToCheckout}
                >
                  <span>Checkout</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </button>
                
                {/* Payment methods */}
                <div className="mt-6 flex justify-center">
                  <div className="flex gap-2 items-center text-gray-400">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 9H20M16 16H20M2 5H22V19H2V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-xs text-gray-500">Secure Payment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCart;