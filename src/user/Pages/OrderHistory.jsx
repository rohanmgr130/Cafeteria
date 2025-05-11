import React, { useState, useEffect } from "react";
import { FaEye, FaTrashAlt } from "react-icons/fa";
import Footer from "../components/FooterPart";
import Navbar from "../components/Navbar";

const OrderHistory = () => {
  const [orderHistory, setOrderHistory] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  // Fetch user ID and token from localStorage
  const userId = localStorage.getItem("id");
  const token = localStorage.getItem("token");

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/profile/profile/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });
        
        const data = await res.json();
        if (data.success) {
          setUserData(data.user);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    
    fetchUserData();
  }, [userId, token]);

  // Debug selected order details
  useEffect(() => {
    if (selectedOrder && orderDetails[selectedOrder]) {
      console.log("Selected order details:", orderDetails[selectedOrder]);
      if (orderDetails[selectedOrder].cartData && orderDetails[selectedOrder].cartData.items) {
        console.log("Items array:", orderDetails[selectedOrder].cartData.items);
        orderDetails[selectedOrder].cartData.items.forEach((item, index) => {
          console.log(`Item ${index} details:`, item);
          console.log(`Item ${index} productId:`, item.productId);
        });
      }
    }
  }, [selectedOrder, orderDetails]);

  // Create a custom order history structure if it doesn't exist in backend
  useEffect(() => {
    const getOrderHistory = async () => {
      if (!userId) {
        setError("User ID not found in localStorage");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // First, try to get all orders by user ID
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/order/my-orders/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });
        
        const data = await res.json();
        
        if (data.success && data.orders && data.orders.length > 0) {
          // If API returns orders, create local order history structure
          const history = {
            userId,
            orders: data.orders.map(order => order._id),
            createdAt: new Date().toISOString()
          };
          
          setOrderHistory(history);
          
          // Store order details in state
          const detailsMap = {};
          data.orders.forEach(order => {
            detailsMap[order._id] = order;
          });
          
          setOrderDetails(detailsMap);
        } else {
          // Handle the case when API returns no orders
          setOrderHistory(null);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    getOrderHistory();
  }, [userId, token]);

  // Handle deleting an order from history
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to remove this order from your history?")) {
      return;
    }
    
    // Get the authentication token from localStorage
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Authentication token not found. Please log in again.");
      return;
    }
    
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/order/delete/${orderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete order");
      }
      
      console.log("Order deleted:", data);
      
      // Remove order from local state
      if (orderHistory && orderHistory.orders) {
        setOrderHistory({
          ...orderHistory,
          orders: orderHistory.orders.filter(id => id !== orderId)
        });
        
        // Also remove from details
        const newDetails = { ...orderDetails };
        delete newDetails[orderId];
        setOrderDetails(newDetails);
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      alert(`Error deleting order: ${err.message}`);
    }
  };

  // View order details
  const viewOrderDetails = async (orderId) => {
    setSelectedOrder(orderId);
    setViewModalOpen(true);
    
    try {
      const token = localStorage.getItem("token");
      
      // First log the orderId to make sure it's correct
      console.log("Fetching details for order:", orderId);
      
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/order/${orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      
      // Log the raw response for debugging
      console.log("Response status:", res.status);
      
      const data = await res.json();
      console.log("Order API response:", data);
      
      if (data.success && data.order) {
        // Process the items to ensure they have names
        if (data.order.cartData && data.order.cartData.items) {
          data.order.cartData.items = data.order.cartData.items.map((item, index) => {
            // If we don't have a proper name, add a fallback
            if ((!item.productId || typeof item.productId !== 'object' || !item.productId.name) && 
                !item.name && !item.productName) {
              return {
                ...item,
                productName: `Product #${index + 1}`
              };
            }
            return item;
          });
        }
        
        // Update order details with processed data
        setOrderDetails(prevDetails => ({
          ...prevDetails,
          [orderId]: data.order
        }));
      } else {
        console.error("API returned success false or no order data");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate total items in order
  const countItems = (order) => {
    if (!order || !order.cartData || !order.cartData.items) return 0;
    return order.cartData.items.length;
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "N/A";
    return `Rs. ${parseFloat(amount).toFixed(2)}`;
  };

  // Close modal
  const closeModal = () => {
    setViewModalOpen(false);
    setSelectedOrder(null);
  };

  // Get user name to display - IMPROVED to use fullname from localStorage if API data is not available
  const getUserName = () => {
    // First try to get the name from userData (API response)
    if (userData && userData.fullname) {
      return userData.fullname;
    }
    
    // Fallback to localStorage fullname if API data is not available
    const localFullname = localStorage.getItem("fullname");
    if (localFullname) {
      return localFullname;
    }
    
    // Last resort fallback
    return "User";
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl">Loading order history...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-50 p-6 rounded-lg shadow-md max-w-lg">
            <p className="text-xl text-red-600 font-bold mb-2">Error</p>
            <p className="text-gray-700">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen mt-10 bg-gray-50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
            <p className="text-gray-700 mt-2">Review your past orders and manage your history</p>
          </div>

          {orderHistory && orderHistory.orders && orderHistory.orders.length > 0 ? (
            <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-600">User</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-600">Date</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-600">Items</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-600">Total Amount</th>
                    <th className="py-3 px-6 text-center text-sm font-medium text-gray-600">Status</th>
                    <th className="py-3 px-6 text-center text-sm font-medium text-gray-600">Payment Method</th>
                    <th className="py-3 px-6 text-center text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orderHistory.orders.map((orderId) => {
                    const order = orderDetails[orderId] || {};
                    return (
                      <tr key={orderId} className="border-t hover:bg-gray-50">
                        <td className="py-4 px-6 text-sm text-gray-800 font-medium">
                          {getUserName()}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-800">
                          {countItems(order)} items
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-800 font-medium">
                          {formatCurrency(order.cartData?.finalTotal || order.additionalInfo?.totalAmount)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            order.orderStatus === 'completed' ? 'bg-green-100 text-green-800' :
                            order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.orderStatus === 'verified' ? 'bg-blue-100 text-blue-800' :
                            order.orderStatus === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.orderStatus || "Processing"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-center text-gray-800 capitalize">
                          {order.orderMethod || "N/A"}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center space-x-4">
                            <button 
                              onClick={() => viewOrderDetails(orderId)}
                              className="text-blue-500 hover:text-blue-700" 
                              title="View Order Details"
                            >
                              <FaEye size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(orderId)}
                              className="text-red-500 hover:text-red-700"
                              title="Remove from History"
                            >
                              <FaTrashAlt size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <p className="text-gray-600 text-xl font-medium mb-2">No order history found</p>
              <p className="text-gray-500">Your past orders will appear here once you make a purchase</p>
              <a href="/public" className="mt-6 inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-md">
                Start Shopping
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {viewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Order Details <span className="text-blue-500">#{selectedOrder.substring(selectedOrder.length - 8)}</span>
                </h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {orderDetails[selectedOrder] ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
                      <p className="text-gray-800">{formatDate(orderDetails[selectedOrder].createdAt)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Order Status</h3>
                      <p className="text-gray-800 capitalize">{orderDetails[selectedOrder].orderStatus || "Processing"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                      <p className="text-gray-800 capitalize">{orderDetails[selectedOrder].orderMethod || "Not specified"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
                      <p className="text-gray-800 font-medium">
                        {formatCurrency(orderDetails[selectedOrder].cartData?.finalTotal || orderDetails[selectedOrder].additionalInfo?.totalAmount)}
                      </p>
                    </div>
                  </div>
                  
                  {orderDetails[selectedOrder].cartData && orderDetails[selectedOrder].cartData.items && orderDetails[selectedOrder].cartData.items.length > 0 ? (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Order Items</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {orderDetails[selectedOrder].cartData.items.map((item, index) => {
                              // Determine the item name based on available data
                              let itemName = "Unknown Item";
                              
                              // Check various possibilities for where the name might be
                              if (item.productId) {
                                if (typeof item.productId === 'object' && item.productId !== null) {
                                  // If productId is populated as an object
                                  itemName = item.productId.name || item.productId.title || `Product #${index + 1}`;
                                } else {
                                  // If productId is just an ID
                                  itemName = `Product #${index + 1}`;
                                }
                              } else if (item.name) {
                                // If name is directly on the item
                                itemName = item.name;
                              } else if (item.productName) {
                                // If productName is on the item
                                itemName = item.productName;
                              }
                              
                              return (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    {itemName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {item.productQuantity || 1}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {formatCurrency(item.price)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    {formatCurrency(item.total)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">Order Total:</td>
                              <td className="px-6 py-3 text-sm font-bold text-gray-900">{formatCurrency(orderDetails[selectedOrder].cartData.orderTotal)}</td>
                            </tr>
                            {orderDetails[selectedOrder].cartData.discount > 0 && (
                              <tr>
                                <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">Discount:</td>
                                <td className="px-6 py-3 text-sm font-medium text-green-600">-{formatCurrency(orderDetails[selectedOrder].cartData.discount)}</td>
                              </tr>
                            )}
                            <tr>
                              <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-700">Final Total:</td>
                              <td className="px-6 py-3 text-sm font-bold text-gray-900">{formatCurrency(orderDetails[selectedOrder].cartData.finalTotal)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No item details available</p>
                  )}
                  
                  {orderDetails[selectedOrder].additionalInfo && orderDetails[selectedOrder].additionalInfo.shippingAddress && (
                    <div className="mt-6">
                      <h3 className="font-medium text-gray-700 mb-2">Shipping Address</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-800">
                          {orderDetails[selectedOrder].additionalInfo.shippingAddress.street}, {orderDetails[selectedOrder].additionalInfo.shippingAddress.city}<br />
                          {orderDetails[selectedOrder].additionalInfo.shippingAddress.state}, {orderDetails[selectedOrder].additionalInfo.shippingAddress.zip}
                        </p>
                      </div>
                    </div>
                  )}

                  {orderDetails[selectedOrder].screenshot && (
                    <div className="mt-6">
                      <h3 className="font-medium text-gray-700 mb-2">Payment Screenshot</h3>
                      <img 
                        src={`${process.env.REACT_APP_API_BASE_URL}/${orderDetails[selectedOrder].screenshot}`} 
                        alt="Payment screenshot" 
                        className="max-w-full h-auto border rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading order details...</p>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-5 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default OrderHistory;