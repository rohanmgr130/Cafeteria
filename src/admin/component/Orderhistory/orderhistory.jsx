// import React, { useState, useEffect } from 'react';
// import { FiTrash2, FiEye, FiRefreshCw } from 'react-icons/fi';
// import { format } from 'date-fns';

// function Orderhistory() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [statusFilter, setStatusFilter] = useState('all');

//   const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
//   const token = localStorage.getItem('token');

//   // Fetch all orders
//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/order/get-all-orders`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         // Process orders and fetch user data for each
//         const processedOrders = await Promise.all(
//           data.orders.map(async (order) => {
//             let userData = null;
            
//             // Fetch user data if userId exists
//             if (order.cartData && order.cartData.userId) {
//               userData = await fetchUserData(order.cartData.userId);
//             }
            
//             return {
//               ...order,
//               userData
//             };
//           })
//         );
        
//         setOrders(processedOrders);
//       } else {
//         setError('Failed to fetch orders');
//       }
//     } catch (err) {
//       setError('Error connecting to server');
//       console.error('Error fetching orders:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch user data for an order
//   const fetchUserData = async (userId) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       const data = await response.json();
//       return data.success ? data.data : null;
//     } catch (err) {
//       console.error('Error fetching user data:', err);
//       return null;
//     }
//   };

//   // Handle order status update
//   const handleStatusUpdate = async (orderId, newStatus) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/order/update-order/${orderId}`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ orderStatus: newStatus })
//       });
      
//       const data = await response.json();
      
//       if (data.success) {
//         // Update order in the state
//         setOrders(orders.map(order => 
//           order._id === orderId ? { ...order, orderStatus: newStatus } : order
//         ));
        
//         // Close modal if open
//         if (showModal && selectedOrder && selectedOrder._id === orderId) {
//           setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
//         }
//       } else {
//         alert('Failed to update order status');
//       }
//     } catch (err) {
//       console.error('Error updating order status:', err);
//       alert('Error updating order status');
//     }
//   };

//   // Handle order deletion
//   const handleDeleteOrder = async (orderId) => {
//     if (window.confirm('Are you sure you want to delete this order?')) {
//       try {
//         const response = await fetch(`${API_BASE_URL}/api/order/delete/${orderId}`, {
//           method: 'DELETE',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });
        
//         const data = await response.json();
        
//         if (data.success) {
//           // Remove order from state
//           setOrders(orders.filter(order => order._id !== orderId));
          
//           // Close modal if the deleted order was being viewed
//           if (showModal && selectedOrder && selectedOrder._id === orderId) {
//             setShowModal(false);
//           }
//         } else {
//           alert('Failed to delete order');
//         }
//       } catch (err) {
//         console.error('Error deleting order:', err);
//         alert('Error deleting order');
//       }
//     }
//   };

//   // View order details
//   const viewOrderDetails = (order) => {
//     setSelectedOrder(order);
//     setShowModal(true);
//   };

//   // Get status badge class
//   const getStatusBadgeClass = (status) => {
//     switch (status) {
//       case 'Pending':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'Completed':
//         return 'bg-green-100 text-green-800';
//       case 'Cancelled':
//         return 'bg-red-100 text-red-800';
//       case 'Verified':
//         return 'bg-blue-100 text-blue-800';
//       case 'Preparing':
//         return 'bg-purple-100 text-purple-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Get payment method badge class
//   const getPaymentMethodBadgeClass = (method) => {
//     return method === 'khalti' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800';
//   };

//   // Filter orders based on status
//   const filteredOrders = statusFilter === 'all' 
//     ? orders 
//     : orders.filter(order => order.orderStatus === statusFilter);

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">Order History</h1>
//         <button 
//           onClick={fetchOrders}
//           className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           <FiRefreshCw className="mr-2" /> Refresh
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="mb-6">
//         <div className="flex space-x-2">
//           <button 
//             onClick={() => setStatusFilter('all')}
//             className={`px-4 py-2 rounded ${statusFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
//           >
//             All
//           </button>
//           <button 
//             onClick={() => setStatusFilter('Pending')}
//             className={`px-4 py-2 rounded ${statusFilter === 'Pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
//           >
//             Pending
//           </button>
//           <button 
//             onClick={() => setStatusFilter('Preparing')}
//             className={`px-4 py-2 rounded ${statusFilter === 'Preparing' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
//           >
//             Preparing
//           </button>
//           <button 
//             onClick={() => setStatusFilter('Completed')}
//             className={`px-4 py-2 rounded ${statusFilter === 'Completed' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
//           >
//             Completed
//           </button>
//           <button 
//             onClick={() => setStatusFilter('Cancelled')}
//             className={`px-4 py-2 rounded ${statusFilter === 'Cancelled' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
//           >
//             Cancelled
//           </button>
//         </div>
//       </div>

//       {/* Loading state */}
//       {loading && (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//         </div>
//       )}

//       {/* Error state */}
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {/* Orders table */}
//       {!loading && !error && (
//         <>
//           {filteredOrders.length === 0 ? (
//             <div className="text-center py-10 bg-gray-50 rounded-lg">
//               <p className="text-gray-500">No orders found</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto bg-white rounded-lg shadow">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Order ID
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Customer
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Date & Time
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Total
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Payment
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredOrders.map((order) => {
//                     const userName = order.userData?.fullname || 'Unknown User';
//                     const formattedDate = order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : 'N/A';
//                     const formattedTime = order.createdAt ? format(new Date(order.createdAt), 'h:mm a') : 'N/A';
//                     return (
//                       <tr key={order._id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                           {order._id.substring(0, 8)}...
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {userName}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           <div>{formattedDate}</div>
//                           <div className="text-xs text-gray-400">{formattedTime}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
//                           Rs {order.cartData?.finalTotal || 0}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.orderStatus)}`}>
//                             {order.orderStatus}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentMethodBadgeClass(order.orderMethod)}`}>
//                             {order.orderMethod === 'khalti' ? 'Khalti' : 'Cash on Delivery'}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                           <div className="flex space-x-2">
//                             <button
//                               onClick={() => viewOrderDetails(order)}
//                               className="text-blue-600 hover:text-blue-900"
//                               title="View Details"
//                             >
//                               <FiEye size={18} />
//                             </button>
//                             <button
//                               onClick={() => handleDeleteOrder(order._id)}
//                               className="text-red-600 hover:text-red-900"
//                               title="Delete Order"
//                             >
//                               <FiTrash2 size={18} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </>
//       )}

//       {/* Order Details Modal */}
//       {showModal && selectedOrder && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-start">
//                 <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
//                 <button 
//                   onClick={() => setShowModal(false)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   ✕
//                 </button>
//               </div>
              
//               <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500">Order Information</h3>
//                   <div className="mt-2 space-y-2">
//                     <p><span className="font-medium">Order ID:</span> {selectedOrder._id}</p>
//                     <p>
//                       <span className="font-medium">Date:</span> {
//                         selectedOrder.createdAt 
//                           ? format(new Date(selectedOrder.createdAt), 'MMMM dd, yyyy h:mm a') 
//                           : 'N/A'
//                       }
//                     </p>
//                     <p>
//                       <span className="font-medium">Status:</span> 
//                       <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedOrder.orderStatus)}`}>
//                         {selectedOrder.orderStatus}
//                       </span>
//                     </p>
//                     <p>
//                       <span className="font-medium">Payment Method:</span> 
//                       <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentMethodBadgeClass(selectedOrder.orderMethod)}`}>
//                         {selectedOrder.orderMethod === 'khalti' ? 'Khalti' : 'Cash on Delivery'}
//                       </span>
//                     </p>
//                     {selectedOrder.khaltiPayment && selectedOrder.orderMethod === 'khalti' && (
//                       <div className="mt-2">
//                         <p><span className="font-medium">Khalti Status:</span> {selectedOrder.khaltiPayment.status}</p>
//                         {selectedOrder.khaltiPayment.pidx && (
//                           <p><span className="font-medium">Transaction ID:</span> {selectedOrder.khaltiPayment.pidx}</p>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500">Customer Information</h3>
//                   <div className="mt-2 space-y-2">
//                     <p><span className="font-medium">Name:</span> {selectedOrder.userData?.fullname || 'Unknown'}</p>
//                     <p><span className="font-medium">Phone:</span> {selectedOrder.additionalInfo?.phone || selectedOrder.userData?.phone || 'N/A'}</p>
//                     <p><span className="font-medium">Address:</span> {selectedOrder.additionalInfo?.address || selectedOrder.userData?.address || 'N/A'}</p>
//                     {selectedOrder.additionalInfo?.notes && (
//                       <p><span className="font-medium">Notes:</span> {selectedOrder.additionalInfo.notes}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
              
//               <div className="mt-6">
//                 <h3 className="text-sm font-medium text-gray-500">Order Items</h3>
//                 <div className="mt-2 overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Product
//                         </th>
//                         <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Quantity
//                         </th>
//                         <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Price
//                         </th>
//                         <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Total
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {selectedOrder.cartData?.items.map((item, index) => {
//                         const productName = item.productId?.name || 'Unknown Product';
//                         return (
//                           <tr key={index}>
//                             <td className="px-4 py-3 text-sm text-gray-900">
//                               {productName}
//                             </td>
//                             <td className="px-4 py-3 text-sm text-gray-500 text-right">
//                               {item.productQuantity || 1}
//                             </td>
//                             <td className="px-4 py-3 text-sm text-gray-500 text-right">
//                               Rs {item.price || 0}
//                             </td>
//                             <td className="px-4 py-3 text-sm text-gray-500 text-right">
//                               Rs {item.total || (item.price * (item.productQuantity || 1))}
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                     <tfoot className="bg-gray-50">
//                       <tr>
//                         <td colSpan="3" className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
//                           Subtotal:
//                         </td>
//                         <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
//                           Rs {selectedOrder.cartData?.orderTotal || 0}
//                         </td>
//                       </tr>
//                       {selectedOrder.cartData?.discount > 0 && (
//                         <tr>
//                           <td colSpan="3" className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
//                             Discount:
//                           </td>
//                           <td className="px-4 py-3 text-sm font-medium text-red-600 text-right">
//                             - Rs {selectedOrder.cartData?.discount || 0}
//                           </td>
//                         </tr>
//                       )}
//                       <tr>
//                         <td colSpan="3" className="px-4 py-3 text-base font-bold text-gray-900 text-right">
//                           Total:
//                         </td>
//                         <td className="px-4 py-3 text-base font-bold text-gray-900 text-right">
//                           Rs {selectedOrder.cartData?.finalTotal || 0}
//                         </td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </div>
//               </div>
              
//               <div className="mt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
//                 <div className="w-full md:w-auto">
//                   <h3 className="text-sm font-medium text-gray-500 mb-2">Update Status</h3>
//                   <div className="flex flex-wrap gap-2">
//                     <button 
//                       onClick={() => handleStatusUpdate(selectedOrder._id, 'Pending')}
//                       className={`px-3 py-1 text-xs rounded ${selectedOrder.orderStatus === 'Pending' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
//                     >
//                       Pending
//                     </button>
//                     <button 
//                       onClick={() => handleStatusUpdate(selectedOrder._id, 'Preparing')}
//                       className={`px-3 py-1 text-xs rounded ${selectedOrder.orderStatus === 'Preparing' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'}`}
//                     >
//                       Preparing
//                     </button>
//                     <button 
//                       onClick={() => handleStatusUpdate(selectedOrder._id, 'Verified')}
//                       className={`px-3 py-1 text-xs rounded ${selectedOrder.orderStatus === 'Verified' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
//                     >
//                       Verified
//                     </button>
//                     <button 
//                       onClick={() => handleStatusUpdate(selectedOrder._id, 'Completed')}
//                       className={`px-3 py-1 text-xs rounded ${selectedOrder.orderStatus === 'Completed' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
//                     >
//                       Completed
//                     </button>
//                     <button 
//                       onClick={() => handleStatusUpdate(selectedOrder._id, 'Cancelled')}
//                       className={`px-3 py-1 text-xs rounded ${selectedOrder.orderStatus === 'Cancelled' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
//                     >
//                       Cancelled
//                     </button>
//                   </div>
//                 </div>
                
//                 <button
//                   onClick={() => handleDeleteOrder(selectedOrder._id)}
//                   className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
//                 >
//                   <FiTrash2 className="mr-2" /> Delete Order
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Orderhistory;


import React, { useState, useEffect } from 'react';
import { FiTrash2, FiEye, FiRefreshCw, FiFilter, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';

function Orderhistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  // Fetch all orders
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/order/get-all-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Process orders and fetch user data for each
        const processedOrders = await Promise.all(
          data.orders.map(async (order) => {
            let userData = null;
            
            // Fetch user data if userId exists
            if (order.cartData && order.cartData.userId) {
              userData = await fetchUserData(order.cartData.userId);
            }
            
            return {
              ...order,
              userData
            };
          })
        );
        
        setOrders(processedOrders);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data for an order
  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.error('Error fetching user data:', err);
      return null;
    }
  };

  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/order/update-order/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update order in the state
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        ));
        
        // Close modal if open
        if (showModal && selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
      } else {
        showNotification('Failed to update order status', 'error');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      showNotification('Error updating order status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setIsUpdating(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/order/delete/${orderId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Remove order from state
          setOrders(orders.filter(order => order._id !== orderId));
          
          // Close modal if the deleted order was being viewed
          if (showModal && selectedOrder && selectedOrder._id === orderId) {
            setShowModal(false);
          }
          
          showNotification('Order deleted successfully', 'success');
        } else {
          showNotification('Failed to delete order', 'error');
        }
      } catch (err) {
        console.error('Error deleting order:', err);
        showNotification('Error deleting order', 'error');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Show notification
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  
  const showNotification = (message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification({ message: '', type: '', visible: false });
    }, 3000);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Verified':
        return 'bg-blue-100 text-blue-800';
      case 'Preparing':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge class for buttons
  const getStatusButtonClass = (status, currentStatus) => {
    const isActive = status === currentStatus;
    
    switch (status) {
      case 'Pending':
        return isActive 
          ? 'bg-yellow-500 text-white' 
          : 'bg-yellow-50 text-yellow-700 border border-yellow-300 hover:bg-yellow-100';
      case 'Completed':
        return isActive 
          ? 'bg-green-500 text-white' 
          : 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100';
      case 'Cancelled':
        return isActive 
          ? 'bg-red-500 text-white' 
          : 'bg-red-50 text-red-700 border border-red-300 hover:bg-red-100';
      case 'Verified':
        return isActive 
          ? 'bg-blue-500 text-white' 
          : 'bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100';
      case 'Preparing':
        return isActive 
          ? 'bg-purple-500 text-white' 
          : 'bg-purple-50 text-purple-700 border border-purple-300 hover:bg-purple-100';
      default:
        return isActive 
          ? 'bg-gray-700 text-white' 
          : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100';
    }
  };

  // Get payment method badge class
  const getPaymentMethodBadgeClass = (method) => {
    return method === 'khalti' 
      ? 'bg-purple-100 text-purple-800 border border-purple-200' 
      : 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  // Format item names for display in the table
  const formatItemsList = (items) => {
    if (!items || items.length === 0) return 'No items';
    
    // Get product names from the first 2 items using multiple possible data structures
    const productNames = items
      .slice(0, 2)
      .map(item => {
        // Try multiple possible locations for the product name
        const name = item.productId?.name || 
                    item.product?.name || 
                    item.name || 
                    item.productName || 
                    (typeof item.productId === 'string' ? item.productId : null);
                    
        // For debugging, log the item structure to console
        if (!name) {
          console.log('Item structure:', JSON.stringify(item));
        }
        
        return name || 'Unknown Product';
      })
      .join(', ');
    
    // Add "and X more" if there are more than 2 items
    return items.length > 2 
      ? `${productNames} and ${items.length - 2} more` 
      : productNames;
  };

  // Filter orders based on status and search term
  const filteredOrders = orders
    .filter(order => statusFilter === 'all' || order.orderStatus === statusFilter)
    .filter(order => {
      if (!searchTerm.trim()) return true;
      
      const searchLower = searchTerm.toLowerCase();
      const userName = order.userData?.fullname || '';
      const items = order.cartData?.items || [];
      const itemNames = items.map(item => item.productId?.name || '').join(' ');
      
      return userName.toLowerCase().includes(searchLower) || 
             itemNames.toLowerCase().includes(searchLower) ||
             (order.additionalInfo?.phone || '').includes(searchTerm) ||
             (order.additionalInfo?.address || '').toLowerCase().includes(searchLower);
    });

  return (
    <div className="ml-64 px-6 py-6"> {/* Added ml-64 to account for sidebar width */}
      {/* Notification */}
      {notification.visible && (
        <div className={`fixed top-5 right-5 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
          'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          <FiAlertCircle className="mr-2" />
          {notification.message}
        </div>
      )}
    
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Order History</h1>
            <button 
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all shadow-sm disabled:opacity-70"
            >
              <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> 
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          {/* Search & Filter Bar */}
          <div className="mt-6 flex flex-col lg:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by customer, item, phone or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex overflow-x-auto pb-1 gap-2">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`flex items-center px-4 py-2 rounded-md transition-all text-sm whitespace-nowrap ${
                  statusFilter === 'all' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'bg-gray-50 text-gray-600 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                <FiFilter className="mr-2" /> All Orders
              </button>
              <button 
                onClick={() => setStatusFilter('Pending')}
                className={`px-4 py-2 rounded-md transition-all text-sm whitespace-nowrap ${
                  statusFilter === 'Pending' 
                    ? 'bg-yellow-500 text-white shadow-sm' 
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
                }`}
              >
                Pending
              </button>
              <button 
                onClick={() => setStatusFilter('Preparing')}
                className={`px-4 py-2 rounded-md transition-all text-sm whitespace-nowrap ${
                  statusFilter === 'Preparing' 
                    ? 'bg-purple-500 text-white shadow-sm' 
                    : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                }`}
              >
                Preparing
              </button>
              <button 
                onClick={() => setStatusFilter('Completed')}
                className={`px-4 py-2 rounded-md transition-all text-sm whitespace-nowrap ${
                  statusFilter === 'Completed' 
                    ? 'bg-green-500 text-white shadow-sm' 
                    : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                }`}
              >
                Completed
              </button>
              <button 
                onClick={() => setStatusFilter('Cancelled')}
                className={`px-4 py-2 rounded-md transition-all text-sm whitespace-nowrap ${
                  statusFilter === 'Cancelled' 
                    ? 'bg-red-500 text-white shadow-sm' 
                    : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center h-64 bg-gray-50">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-500">Loading orders...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="m-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
            <FiAlertCircle className="mr-3 text-red-500" size={24} />
            <div>
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-1">Please try refreshing or check your connection.</p>
            </div>
          </div>
        )}

        {/* Orders table */}
        {!loading && !error && (
          <>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 border-t border-gray-100">
                <div className="mx-auto max-w-md p-6">
                  <FiAlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? "No orders match your search criteria." 
                      : statusFilter !== 'all'
                        ? `No orders with "${statusFilter}" status found.`
                        : "There are no orders in the system yet."}
                  </p>
                  {(searchTerm || statusFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {/* Removed Order ID column */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => {
                      const userName = order.userData?.fullname || 'Unknown User';
                      const formattedDate = order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : 'N/A';
                      const formattedTime = order.createdAt ? format(new Date(order.createdAt), 'h:mm a') : 'N/A';
                      const items = order.cartData?.items || [];

                      return (
                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{userName}</div>
                            {order.userData?.phone && (
                              <div className="text-xs text-gray-500">{order.userData.phone}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {formatItemsList(items)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formattedDate}</div>
                            <div className="text-xs text-gray-500">{formattedTime}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              Rs {order.cartData?.finalTotal || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.orderStatus)}`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentMethodBadgeClass(order.orderMethod)}`}>
                              {order.orderMethod === 'khalti' ? 'Khalti' : 'Cash on Delivery'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => viewOrderDetails(order)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                                title="View Details"
                              >
                                <FiEye size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order._id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Delete Order"
                                disabled={isUpdating}
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {/* Order count summary */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
                  Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                  {statusFilter !== 'all' && ` with status "${statusFilter}"`}
                  {searchTerm && ` matching "${searchTerm}"`}
                </div>
              </div>
            )}
          </>
        )}

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Order Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order ID:</span>
                        <span className="font-medium text-gray-900">{selectedOrder._id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span className="text-gray-900">
                          {selectedOrder.createdAt 
                            ? format(new Date(selectedOrder.createdAt), 'MMMM dd, yyyy h:mm a') 
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Status:</span>
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedOrder.orderStatus)}`}>
                          {selectedOrder.orderStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Payment Method:</span>
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentMethodBadgeClass(selectedOrder.orderMethod)}`}>
                          {selectedOrder.orderMethod === 'khalti' ? 'Khalti' : 'Cash on Delivery'}
                        </span>
                      </div>
                      {selectedOrder.khaltiPayment && selectedOrder.orderMethod === 'khalti' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Khalti Status:</span>
                            <span className="text-gray-900">{selectedOrder.khaltiPayment.status}</span>
                          </div>
                          {selectedOrder.khaltiPayment.pidx && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Transaction ID:</span>
                              <span className="font-mono text-gray-900">{selectedOrder.khaltiPayment.pidx}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Customer Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium text-gray-900">{selectedOrder.userData?.fullname || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span className="text-gray-900">{selectedOrder.additionalInfo?.phone || selectedOrder.userData?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-gray-500">Address:</span>
                        <span className="text-gray-900 text-right">{selectedOrder.additionalInfo?.address || selectedOrder.userData?.address || 'N/A'}</span>
                      </div>
                      {selectedOrder.additionalInfo?.notes && (
                        <div className="border-t border-gray-200 pt-3">
                          <p className="text-gray-500 mb-1">Notes:</p>
                          <p className="text-gray-900 italic">{selectedOrder.additionalInfo.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Order Items</h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedOrder.cartData?.items.map((item, index) => {
                            // Try multiple possible locations for the product name
                            const productName = item.productId?.name || 
                                              item.product?.name || 
                                              item.name || 
                                              item.productName || 
                                              (typeof item.productId === 'string' ? item.productId : 'Unknown Product');
                                              
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {productName}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 text-right">
                                  {item.productQuantity || 1}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 text-right">
                                  Rs {item.price || 0}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 font-medium text-right">
                                  Rs {item.total || (item.price * (item.productQuantity || 1))}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50">
                            <td colSpan="3" className="px-4 py-3 text-sm font-medium text-gray-700 text-right">
                              Subtotal:
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                              Rs {selectedOrder.cartData?.orderTotal || 0}
                            </td>
                          </tr>
                          {selectedOrder.cartData?.discount > 0 && (
                            <tr className="bg-gray-50">
                              <td colSpan="3" className="px-4 py-3 text-sm font-medium text-gray-700 text-right">
                                Discount:
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-red-600 text-right">
                                - Rs {selectedOrder.cartData?.discount || 0}
                              </td>
                            </tr>
                          )}
                          <tr className="bg-gray-50 border-t border-gray-300">
                            <td colSpan="3" className="px-4 py-3 text-base font-bold text-gray-900 text-right">
                              Total:
                            </td>
                            <td className="px-4 py-3 text-base font-bold text-gray-900 text-right">
                              Rs {selectedOrder.cartData?.finalTotal || 0}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="w-full md:w-auto">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Update Status</h3>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => handleStatusUpdate(selectedOrder._id, 'Pending')}
                          className={`px-3 py-2 text-sm rounded-md font-medium transition-all ${getStatusButtonClass('Pending', selectedOrder.orderStatus)}`}
                          disabled={isUpdating}
                        >
                          Pending
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(selectedOrder._id, 'Preparing')}
                          className={`px-3 py-2 text-sm rounded-md font-medium transition-all ${getStatusButtonClass('Preparing', selectedOrder.orderStatus)}`}
                          disabled={isUpdating}
                        >
                          Preparing
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(selectedOrder._id, 'Verified')}
                          className={`px-3 py-2 text-sm rounded-md font-medium transition-all ${getStatusButtonClass('Verified', selectedOrder.orderStatus)}`}
                          disabled={isUpdating}
                        >
                          Verified
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(selectedOrder._id, 'Completed')}
                          className={`px-3 py-2 text-sm rounded-md font-medium transition-all ${getStatusButtonClass('Completed', selectedOrder.orderStatus)}`}
                          disabled={isUpdating}
                        >
                          Completed
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(selectedOrder._id, 'Cancelled')}
                          className={`px-3 py-2 text-sm rounded-md font-medium transition-all ${getStatusButtonClass('Cancelled', selectedOrder.orderStatus)}`}
                          disabled={isUpdating}
                        >
                          Cancelled
                        </button>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteOrder(selectedOrder._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all flex items-center disabled:opacity-70"
                      disabled={isUpdating}
                    >
                      <FiTrash2 className="mr-2" /> Delete Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orderhistory;