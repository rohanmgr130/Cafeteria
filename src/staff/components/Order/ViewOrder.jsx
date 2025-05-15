import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaEdit, FaCheck, FaTimes, FaPrint, FaExclamationTriangle, FaTrash, FaFilter, FaSort, FaSortUp, FaSortDown, FaLock } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { notifyOrderStatusUpdate } from '../../../services/notification.services'; // Update path as needed

// Create styles for PDF
const pdfStyles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  header: { fontSize: 12, marginBottom: 10, fontWeight: 'bold' },
  table: { display: 'flex', flexDirection: 'column', width: '100%', marginBottom: 20 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEEEEE', borderBottomStyle: 'solid', paddingTop: 5, paddingBottom: 5 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000000', borderBottomStyle: 'solid', paddingTop: 5, paddingBottom: 5, fontWeight: 'bold' },
  tableCol1: { width: '30%' },
  tableCol2: { width: '50%' },
  tableCol3: { width: '20%' },
  sectionTitle: { fontSize: 14, marginTop: 15, marginBottom: 5, fontWeight: 'bold' },
  footer: { marginTop: 30, fontSize: 10, textAlign: 'center' }
});

// PDF Document template
const OrderPDF = ({ order }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <Text style={pdfStyles.title}>Order Receipt</Text>
      
      <Text style={pdfStyles.header}>Order Information</Text>
      <View style={pdfStyles.table}>
        <View style={pdfStyles.tableRow}>
          <Text style={pdfStyles.tableCol1}>Order ID:</Text>
          <Text style={pdfStyles.tableCol2}>{order.id}</Text>
        </View>
        <View style={pdfStyles.tableRow}>
          <Text style={pdfStyles.tableCol1}>Customer:</Text>
          <Text style={pdfStyles.tableCol2}>{order.customer}</Text>
        </View>
        <View style={pdfStyles.tableRow}>
          <Text style={pdfStyles.tableCol1}>Order Date:</Text>
          <Text style={pdfStyles.tableCol2}>{new Date(order.createdAt).toLocaleString()}</Text>
        </View>
        <View style={pdfStyles.tableRow}>
          <Text style={pdfStyles.tableCol1}>Status:</Text>
          <Text style={pdfStyles.tableCol2}>{order.status}</Text>
        </View>
        <View style={pdfStyles.tableRow}>
          <Text style={pdfStyles.tableCol1}>Payment Method:</Text>
          <Text style={pdfStyles.tableCol2}>{order.paymentMethod === "khalti" ? "Online Payment (Khalti)" : "Cash on Delivery"}</Text>
        </View>
        <View style={pdfStyles.tableRow}>
          <Text style={pdfStyles.tableCol1}>Payment Status:</Text>
          <Text style={pdfStyles.tableCol2}>{order.paymentStatus}</Text>
        </View>
      </View>

      <Text style={pdfStyles.sectionTitle}>Order Items</Text>
      <View style={pdfStyles.table}>
        <View style={pdfStyles.tableHeader}>
          <Text style={pdfStyles.tableCol1}>Item</Text>
          <Text style={pdfStyles.tableCol2}>Quantity</Text>
          <Text style={pdfStyles.tableCol3}>Price</Text>
        </View>
        {order.items.map((item, index) => (
          <View key={index} style={pdfStyles.tableRow}>
            <Text style={pdfStyles.tableCol1}>{item.name}</Text>
            <Text style={pdfStyles.tableCol2}>{item.quantity}</Text>
            <Text style={pdfStyles.tableCol3}>{item.price}</Text>
          </View>
        ))}
        <View style={[pdfStyles.tableRow, { fontWeight: 'bold' }]}>
          <Text style={pdfStyles.tableCol1}>Total</Text>
          <Text style={pdfStyles.tableCol2}></Text>
          <Text style={pdfStyles.tableCol3}>{order.total}</Text>
        </View>
      </View>

      {order.notes && (
        <>
          <Text style={pdfStyles.sectionTitle}>Notes</Text>
          <Text>{order.notes}</Text>
        </>
      )}

      <Text style={pdfStyles.footer}>
        Thank you for your order!
      </Text>
    </Page>
  </Document>
);

const ViewOrder = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState({ startDate: "", endDate: "" });
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10, totalItems: 0 });
  const [isAdvancedFilterVisible, setIsAdvancedFilterVisible] = useState(false);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");
  const [totalAmount, setTotalAmount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [userData, setUserData] = useState(null);


  // Status options - updated to match backend enum values
  const statusOptions = ["Pending", "Completed", "Cancelled", "Verified", "Preparing"];
  const paymentMethodOptions = ["All", "khalti", "cash-on"];

  // Helper function to check if status updates should be disabled
  const isStatusUpdateDisabled = (currentStatus) => {
    return currentStatus === "Cancelled" || currentStatus === "Completed";
  };

  // Fetch orders when component mounts or filters change
  useEffect(() => {
    fetchOrders();
  }, [
    statusFilter, 
    pagination.currentPage, 
    pagination.itemsPerPage, 
    sortConfig,
    paymentMethodFilter,
    dateFilter
  ]);

  // Calculate total amount of orders whenever filtered orders change
  useEffect(() => {
    const total = orders.reduce((sum, order) => {
      // Extract numeric value from total string (e.g., "Rs 1000" -> 1000)
      const amount = parseFloat(order.total.replace(/[^0-9.]/g, '')) || 0;
      return sum + amount;
    }, 0);
    setTotalAmount(total);
  }, [orders]);

  // Handle select all checkbox
  useEffect(() => {
    if (selectAll) {
      setSelectedOrders(orders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  }, [selectAll, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.append('status', statusFilter);
      if (paymentMethodFilter !== "All") params.append('paymentMethod', paymentMethodFilter);
      if (dateFilter.startDate) params.append('startDate', dateFilter.startDate);
      if (dateFilter.endDate) params.append('endDate', dateFilter.endDate);
      params.append('page', pagination.currentPage);
      params.append('limit', pagination.itemsPerPage);
      params.append('sortBy', sortConfig.key);
      params.append('sortOrder', sortConfig.direction);
      
      // Fetch orders from the API
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/order/get-all-orders?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}` // Add token if using authentication
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
  
      const data = await response.json();
      
      // Check if we received valid data
      if (data && data.success && Array.isArray(data.orders)) {
        // Create map to cache user and product info to minimize individual fetches
        const userMap = new Map();
        const productMap = new Map();
        
        // Pre-fetch all users with a single API call if possible
        try {
          const userResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
          });
          
          if (userResponse.ok) {
            const usersData = await userResponse.json();
            if (usersData.users && Array.isArray(usersData.users)) {
              usersData.users.forEach(user => {
                userMap.set(user._id, user.name || user.email || "Unknown User");
              });
            }
          }
        } catch (error) {
          console.log("Error pre-fetching users:", error);
        }
        
        // Pre-fetch all products with a single API call if possible
        try {
          const productResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/staff/menu`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
          });
          
          if (productResponse.ok) {
            const productsData = await productResponse.json();
            if (productsData.menus && Array.isArray(productsData.menus)) {
              productsData.menus.forEach(product => {
                productMap.set(product._id, product.name || "Unknown Product");
              });
            }
          }
        } catch (error) {
          console.log("Error pre-fetching products:", error);
        }
        
        // First, define the function to fetch user data outside of the loop
        const fetchUserData = async (id) => {
          if (!id) return null;
          
          try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/${id}`, {
              // method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
              },
            });
            
            const data = await res.json();
            if (data.success) {
              return data.data;
            }
          } catch (err) {
            console.error("Error fetching user data:", err);
          }
          return null;
        };

        // Transform the data into the orders format we need
        const transformedOrders = await Promise.all(data.orders.map(async order => {
          // Use fullname from localStorage for customer display
          
          // Fetch user data for this order
          let userData = null;
          if (order.cartData && order.cartData.userId) {
            userData = await fetchUserData(order.cartData.userId);
          }

          console.log('userdata', userData);
          
          const customerName = userData?.fullname || 'xaina';
          const customerId = userData._id;

          // Process the cart items with real product names
          const cartItems = [];
          
          if (order.cartData && Array.isArray(order.cartData.items)) {
            for (const item of order.cartData.items) {
             
              let productName = "Unknown Product";

              if (item.productId) {
                productName = item.productId.title;
              }
              
              cartItems.push({
                name: productName,
                quantity: item.productQuantity || 1,
                price: `Rs ${item.price || 0}`
              });
            }
          }
          
          // Determine payment status based on payment method and khalti status
          let paymentStatus = "Pending";
          if (order.orderMethod === "khalti") {
            if (order.khaltiPayment && order.khaltiPayment.status === "completed") {
              paymentStatus = "Paid";
            } else if (order.khaltiPayment && order.khaltiPayment.status === "failed") {
              paymentStatus = "Failed";
            }
          }
          
          return {
            id: order._id || `#ORD-${Math.floor(Math.random() * 10000)}`,
            customer: userData?.fullname || customerName,
            customerId: customerId,
            items: cartItems,
            total: `Rs ${order.cartData?.finalTotal || 0}`,
            status: order.orderStatus || "Pending",
            createdAt: order.createdAt || Date.now(),
            time: new Date(order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(order.createdAt || Date.now()).toLocaleDateString(),
            paymentStatus: paymentStatus,
            notes: order.additionalInfo?.notes || "",
            paymentMethod: order.orderMethod || "cash-on",
            phone: order.additionalInfo?.phone || userData?.phone || "",
            address: order.additionalInfo?.address || userData?.address || ""
          };
        }));
        
        setOrders(transformedOrders);
        setPagination({
          ...pagination,
          totalItems: data.totalCount || transformedOrders.length
        });
      } else {
        console.log("Invalid data format:", data);
        setError("Received invalid data format from server");
      }
      
      setLoading(false);
    } catch (error) {
      console.log("Error while fetching orders: ", error);
      setError("Failed to load order data");
      setLoading(false);
      toast.error("Failed to load orders. Please try again.");
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case "Confirmed": return "bg-purple-500";
      case "Preparing": return "bg-yellow-500";
      case "Ready": return "bg-green-500";
      case "Completed": return "bg-green-600";
      case "Verified": return "bg-blue-500";
      case "Cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    // Apply search filter
    return searchTerm === "" || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  });
  console.log('orders', orders);
  console.log('filteredOrders', filteredOrders);

  // Toggle order details
  const toggleOrderDetails = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  // Update order status
  const updateStatus = async (id, newStatus, customerId) => {
    try {
      // Check if the order's current status is "Cancelled" or "Completed"
      const orderToUpdate = orders.find(order => order.id === id);
      if (isStatusUpdateDisabled(orderToUpdate.status)) {
        toast.warning(`Cannot update status. Order is already ${orderToUpdate.status}.`);
        return;
      }
      
      console.log('newStatus', newStatus);
      setLoading(true);
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/order/update-order/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update order status");
      }
      
      // Find the order that was updated
      const updatedOrder = orders.find(order => order.id === id);
      
      // Update the local state
      setOrders(orders.map(order => 
        order.id === id ? { ...order, status: newStatus } : order
      ));
      
      // Send notification to the user if order has user data
      // First, we need to get the userId from the order
      console.log('updatedOrder', updatedOrder);
      if (updatedOrder) {
        try {
          // Check where the userId is stored in your order object
          const id = customerId;
          console.log('customerId', customerId);
          console.log('updatedOrder', updatedOrder); 
          
          if (id) {
            // Prepare the order data for notification
            const orderData = {
              orderId: id,
              status: newStatus,
              items: updatedOrder.items,
              total: updatedOrder.total.replace(/[^0-9.]/g, '') // Remove non-numeric characters
            };
            
            // Send the notification
            await notifyOrderStatusUpdate(id, orderData);
            console.log(`Notification sent to user ${id} about order status: ${newStatus}`);
            
            // Add notification success message to toast
            toast.success(`Order status updated to ${newStatus} and user notified`);
          } else {
            console.log("No userId found in order. Notification not sent.");
            toast.success(`Order status updated to ${newStatus}`);
          }
        } catch (notifError) {
          console.error("Error sending notification:", notifError);
          toast.warning(`Order status updated to ${newStatus}, but failed to notify user`);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.log("Error updating order status: ", error);
      setError("Failed to update order status");
      setLoading(false);
      toast.error("Failed to update order status. Please try again.");
    }
  };

  // Handle edit mode
  const startEditing = (order) => {
    setEditingOrder({ ...order });
  };

  const cancelEditing = () => {
    setEditingOrder(null);
  };

  const saveEditing = async () => {
    try {
      // Check if the original order's status was "Cancelled" or "Completed"
      const originalOrder = orders.find(order => order.id === editingOrder.id);
      
      if (isStatusUpdateDisabled(originalOrder.status) && editingOrder.status !== originalOrder.status) {
        toast.warning(`Cannot update status. Order is already ${originalOrder.status}.`);
        return;
      }
      
      setLoading(true);
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/order/update-order/${editingOrder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderStatus: editingOrder.status,
          additionalInfo: {
            phone: editingOrder.phone,
            address: editingOrder.address,
            notes: editingOrder.notes
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update order");
      }
      
      // Update the local state
      setOrders(orders.map(order => 
        order.id === editingOrder.id ? editingOrder : order
      ));
      
      setEditingOrder(null);
      setLoading(false);
      toast.success("Order updated successfully");
    } catch (error) {
      console.log("Error updating order: ", error);
      setError("Failed to update order");
      setLoading(false);
      toast.error("Failed to update order. Please try again.");
    }
  };

  // Delete order
  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/order/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete order");
      }
      
      // Update the local state
      setOrders(orders.filter(order => order.id !== id));
      
      setLoading(false);
      toast.success("Order deleted successfully");
    } catch (error) {
      console.log("Error deleting order: ", error);
      setError("Failed to delete order");
      setLoading(false);
      toast.error("Failed to delete order. Please try again.");
    }
  };

  // Bulk delete selected orders
  const bulkDeleteOrders = async () => {
    if (selectedOrders.length === 0) {
      toast.info("No orders selected");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedOrders.length} orders? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Since your backend might not have a bulk delete endpoint, we'll delete orders one by one
      const deletePromises = selectedOrders.map(orderId => 
        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/order/delete/${orderId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        })
      );
      
      await Promise.all(deletePromises);
      
      // Update the local state
      setOrders(orders.filter(order => !selectedOrders.includes(order.id)));
      setSelectedOrders([]);
      setSelectAll(false);
      
      setLoading(false);
      toast.success(`${selectedOrders.length} orders deleted successfully`);
    } catch (error) {
      console.log("Error deleting orders: ", error);
      setError("Failed to delete orders");
      setLoading(false);
      toast.error("Failed to delete orders. Please try again.");
    }
  };

  // Toggle selection of an order
  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prevSelected => 
      prevSelected.includes(orderId)
        ? prevSelected.filter(id => id !== orderId)
        : [...prevSelected, orderId]
    );
  };

  // Handle sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort indicator icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1 text-gray-400" />;
    return sortConfig.direction === 'asc' ? <FaSortUp className="ml-1 text-blue-500" /> : <FaSortDown className="ml-1 text-blue-500" />;
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setPagination({ ...pagination, currentPage: page });
  };

  // Export orders to CSV
  const exportToCsv = () => {
    const ordersToExport = selectedOrders.length > 0 
      ? orders.filter(order => selectedOrders.includes(order.id))
      : filteredOrders;
      
    if (ordersToExport.length === 0) {
      toast.info("No orders to export");
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Format the data for CSV
      const csvData = [
        ["Order ID", "Customer", "Date", "Time", "Status", "Payment Method", "Payment Status", "Total", "Items"],
        ...ordersToExport.map(order => [
          order.id,
          order.customer,
          order.date,
          order.time,
          order.status,
          order.paymentMethod === "khalti" ? "Online Payment (Khalti)" : "Cash on Delivery",
          order.paymentStatus,
          order.total,
          order.items.map(item => `${item.quantity}x ${item.name}`).join(", ")
        ])
      ];
      
      // Convert to CSV string
      const csvContent = "data:text/csv;charset=utf-8," + 
        csvData.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `orders-export-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      document.body.removeChild(link);
      
      toast.success("Orders exported successfully");
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast.error("Failed to export orders");
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate pagination values
  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
  const endIndex = Math.min(startIndex + pagination.itemsPerPage - 1, pagination.totalItems);

  return (
    <div className="ml-64 p-8 bg-gray-50 min-h-screen w-full">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Orders History</h1>
            <p className="text-gray-600">View and track all orders</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={exportToCsv}
              disabled={isExporting || loading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm flex items-center"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Export to CSV
                </>
              )}
            </button>
            
            {selectedOrders.length > 0 && (
              <button
                onClick={bulkDeleteOrders}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-sm flex items-center"
              >
                <FaTrash className="mr-2" />
                Delete Selected ({selectedOrders.length})
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Orders Summary */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="text-sm text-gray-500 mb-1">Total Orders</div>
            <div className="text-2xl font-bold">{pagination.totalItems}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold">Rs {totalAmount.toFixed(2)}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="text-sm text-gray-500 mb-1">Pending Orders</div>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === "Pending" || o.status === "Confirmed").length}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="text-sm text-gray-500 mb-1">Orders Today</div>
            <div className="text-2xl font-bold">
              {orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
            {/* Search */}
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by order #, customer name, or item..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-auto">
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            {/* Advanced Filter Toggle */}
            <button
              onClick={() => setIsAdvancedFilterVisible(!isAdvancedFilterVisible)}
              className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700"
            >
              <FaFilter className="mr-2" />
              {isAdvancedFilterVisible ? 'Hide Filters' : 'Advanced Filters'}
            </button>
          </div>
          
          {/* Advanced Filters */}
          {isAdvancedFilterVisible && (
            <div className="pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                />
              </div>
              
              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                >
                  <option value="All">All Methods</option>
                  <option value="khalti">Online Payment (Khalti)</option>
                  <option value="cash-on">Cash on Delivery</option>
                </select>
              </div>
              
              {/* Filter Actions */}
              <div className="col-span-full flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setDateFilter({ startDate: "", endDate: "" });
                    setPaymentMethodFilter("All");
                    setStatusFilter("All");
                    setSearchTerm("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Reset Filters
                </button>
                <button
                  onClick={fetchOrders}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
          
          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden mt-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-3 text-left">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={() => setSelectAll(!selectAll)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                      <div className="flex items-center">
                        CUSTOMER INFO
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('total')}
                    >
                      <div className="flex items-center">
                        Total
                        {getSortIcon('total')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!loading && filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <React.Fragment key={order.id}>
                        <tr className={`hover:bg-gray-50 ${selectedOrders.includes(order.id) ? 'bg-blue-50' : ''}`}>
                          <td className="px-2 py-4">
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => toggleOrderSelection(order.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => toggleOrderDetails(order.id)}>
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                                <div className="text-xs text-gray-500">{order.date} at {order.time}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 cursor-pointer" onClick={() => toggleOrderDetails(order.id)}>
                            <div className="text-sm text-gray-900">
                              {order.items.slice(0, 2).map((item, idx) => (
                                <div key={idx}>
                                  {item.quantity}x {item.name}
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{order.items.length - 2} more items
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => toggleOrderDetails(order.id)}>
                            <div className="text-sm font-medium text-gray-900">{order.total}</div>
                            <div className="text-xs text-gray-500">{order.paymentStatus}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => toggleOrderDetails(order.id)}>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            {isStatusUpdateDisabled(order.status) && (
                              <FaLock className="inline-block ml-1 text-gray-400" title="Status locked" />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditing(order);
                                }}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Edit Order"
                              >
                                <FaEdit />
                              </button>
                              <PDFDownloadLink 
                                document={<OrderPDF order={order} />}
                                fileName={`order-${order.id}.pdf`}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Download PDF"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {({ blob, url, loading, error }) => 
                                  loading ? <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /> : <FaPrint />
                                }
                              </PDFDownloadLink>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteOrder(order.id);
                                }}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Delete Order"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={order.paymentMethod === "khalti" ? "text-green-600" : "text-orange-500"}>
                              {order.paymentMethod === "khalti" ? "Online Payment" : "Cash on Delivery"}
                            </span>
                          </td>
                        </tr>

                        {/* Expanded Order Details */}
                        {expandedOrderId === order.id && (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 bg-gray-50">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Customer Details - Simplified */}
                                <div>
                                  <p className="text-sm font-medium text-gray-800 mb-2">Customer Information</p>
                                  <p className="text-sm"><span className="font-medium">Name:</span> {order.customer}</p>
                                  <p className="text-sm"><span className="font-medium">Order Date:</span> {order.date} at {order.time}</p>
                                </div>

                                {/* Order Items */}
                                <div>
                                  <h3 className="font-semibold text-gray-800 mb-2">Order Items</h3>
                                  <div className="space-y-1">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between text-sm">
                                        <span>{item.quantity}x {item.name}</span>
                                        <span>{item.price}</span>
                                      </div>
                                    ))}
                                    <div className="flex justify-between font-semibold text-sm pt-2 border-t">
                                      <span>Total</span>
                                      <span>{order.total}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Order Actions */}
                                <div>
                                  <h3 className="font-semibold text-gray-800 mb-2">Update Status</h3>
                                  {isStatusUpdateDisabled(order.status) ? (
                                    <div className="bg-gray-100 p-2 rounded border border-gray-300 text-sm flex mb-3">
                                      <FaLock className="text-gray-500 mr-2 flex-shrink-0 mt-1" />
                                      <p>Status updates are disabled for {order.status} orders.</p>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                      {statusOptions.filter(s => s !== "All").map(status => (
                                        <button
                                          key={status}
                                          onClick={() => updateStatus(order.id, status, order.customerId)}
                                          className={`px-2 py-1 text-xs rounded ${
                                            order.status === status 
                                              ? `${getStatusColor(status)} text-white` 
                                              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                          }`}
                                        >
                                          {status}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                  
                                  <div className="mt-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Payment Information</h3>
                                    <p className="text-sm"><span className="font-medium">Method:</span> {order.paymentMethod === "khalti" ? "Online Payment (Khalti)" : "Cash on Delivery"}</p>
                                    <p className="text-sm"><span className="font-medium">Status:</span> {order.paymentStatus}</p>
                                    
                                  </div>
                                  
                                  {order.notes && (
                                    <div className="mt-4">
                                      <h3 className="font-semibold text-gray-800 mb-2">Notes</h3>
                                      <div className="bg-yellow-50 p-2 rounded border border-yellow-200 text-sm flex">
                                        <FaExclamationTriangle className="text-yellow-500 mr-2 flex-shrink-0 mt-1" />
                                        <p>{order.notes}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : !loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                        No orders found matching your filters. Try adjusting your search criteria.
                      </td>
                    </tr>
                  ) : (
                    // Loading skeleton for the table
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={`skeleton-${index}`}>
                        <td className="px-2 py-4">
                          <Skeleton circle height={16} width={16} />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton height={20} width={120} className="mb-2" />
                          <Skeleton height={16} width={150} />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton height={16} width={180} className="mb-2" />
                          <Skeleton height={16} width={100} />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton height={20} width={80} />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton height={20} width={70} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Skeleton circle height={20} width={20} />
                            <Skeleton circle height={20} width={20} />
                            <Skeleton circle height={20} width={20} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton height={20} width={100} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {filteredOrders.length > 0 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startIndex}</span> to <span className="font-medium">{endIndex}</span> of{' '}
                      <span className="font-medium">{pagination.totalItems}</span> orders
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          pagination.currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">First</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          pagination.currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        let pageNum;
                        
                        if (totalPages <= 5) {
                          // If 5 or fewer pages, show all
                          pageNum = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          // Near start
                          pageNum = i + 1;
                        } else if (pagination.currentPage >= totalPages - 2) {
                          // Near end
                          pageNum = totalPages - 4 + i;
                        } else {
                          // In middle
                          pageNum = pagination.currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                              pagination.currentPage === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          pagination.currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={pagination.currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          pagination.currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Last</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Order for {editingOrder.customer}</h2>
                <button onClick={cancelEditing} className="text-gray-500 hover:text-gray-700">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                {/* Customer Information */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Customer Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editingOrder.customer}
                    onChange={(e) => setEditingOrder({...editingOrder, customer: e.target.value})}
                    disabled // Usually can't edit customer name without backend support
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editingOrder.phone || ""}
                    onChange={(e) => setEditingOrder({...editingOrder, phone: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Address</label>
                  <textarea
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    value={editingOrder.address || ""}
                    onChange={(e) => setEditingOrder({...editingOrder, address: e.target.value})}
                  ></textarea>
                </div>

                {/* Order Status */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Order Status</label>
                  <div className="relative">
                    <select
                      className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isStatusUpdateDisabled(orders.find(o => o.id === editingOrder.id)?.status) ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      value={editingOrder.status}
                      onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value})}
                      disabled={isStatusUpdateDisabled(orders.find(o => o.id === editingOrder.id)?.status)}
                    >
                      {statusOptions.filter(s => s !== "All").map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    {isStatusUpdateDisabled(orders.find(o => o.id === editingOrder.id)?.status) && (
                      <div className="mt-1 text-sm text-gray-500 flex items-center">
                        <FaLock className="mr-1" />
                        <span>Status cannot be changed for {orders.find(o => o.id === editingOrder.id)?.status} orders</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Payment Status</label>
                  <select
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editingOrder.paymentStatus}
                    onChange={(e) => setEditingOrder({...editingOrder, paymentStatus: e.target.value})}
                    disabled={editingOrder.paymentMethod === "khalti"} // Can't edit Khalti payment status directly
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                  {editingOrder.paymentMethod === "khalti" && (
                    <p className="text-xs text-gray-500 mt-1">Online payment status is managed automatically</p>
                  )}
                </div>

                {/* Order Items - read only as editing cart items would require more complex logic */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Order Items</label>
                  <div className="border rounded p-3 bg-gray-50">
                    {editingOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <span className="w-12 text-center">{item.quantity}x</span>
                        <span className="flex-grow">{item.name}</span>
                        <span className="w-24 text-right">{item.price}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 font-medium flex justify-between">
                      <span>Total:</span>
                      <span>{editingOrder.total}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Items cannot be modified after order creation</p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Order Notes</label>
                  <textarea
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    value={editingOrder.notes || ""}
                    onChange={(e) => setEditingOrder({...editingOrder, notes: e.target.value})}
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditing}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewOrder;