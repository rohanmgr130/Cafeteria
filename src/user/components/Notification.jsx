import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../services/firebase';
import { markNotificationAsRead, deleteUserNotification } from '../../services/notification.services';
import { 
  Tag, Clock, Copy, CheckCircle, AlertCircle, ShoppingBag,
  Gift, ChevronDown, ChevronUp, Star, Bell, Trash2, X
} from 'lucide-react';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  
  // Get user ID from localStorage
  const userId = localStorage.getItem('id');
  
  useEffect(() => {
    if (!userId) {
      setError("Please login to view your notifications");
      setLoading(false);
      return;
    }
    
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        // Reference to all user notifications
        const userNotifRef = ref(database, `notifications/user`);
        
        onValue(userNotifRef, (snapshot) => {
          if (snapshot.exists()) {
            const allNotifications = snapshot.val();
            
            // Filter notifications for this user
            const userNotifications = Object.entries(allNotifications)
              .filter(([_, notification]) => notification.userId === userId)
              .map(([id, notification]) => ({
                id,
                ...notification
              }));
            
            // Sort by timestamp (newest first)
            const sortedNotifications = userNotifications.sort((a, b) => b.timestamp - a.timestamp);
            
            setNotifications(sortedNotifications);
          } else {
            setNotifications([]);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching notifications:", error);
          setError("Failed to load notifications");
          setLoading(false);
        });
      } catch (err) {
        console.error("Error setting up notification listener:", err);
        setError("Failed to connect to notification service");
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [userId]);
  
  // Function to copy promocode to clipboard
  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 3000); // Reset after 3 seconds
    });
  };
  
  // Function to mark notification as read
  const markAsRead = async (id) => {
    if (!userId) return;
    
    try {
      await markNotificationAsRead(`user`, id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };
  
  // Function to delete notification
  const deleteNotification = async (id) => {
    if (!userId) return;
    
    try {
      await deleteUserNotification(userId, id);
      
      // Update local state
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };
  
  // Toggle order details expansion
  const toggleOrderDetails = (id) => {
    setExpandedOrders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    
    // Mark as read when expanded
    if (!expandedOrders[id]) {
      markAsRead(id);
    }
  };
  
  // Check if promocode is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate || expiryDate === 'N/A') return false;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    return today > expiry;
  };
  
  // Format date for readable display
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return 'No expiry';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Calculate time since notification received
  const timeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;
    
    const months = Math.floor(days / 30);
    return `${months} months ago`;
  };
  
  // Get filtered notifications based on active tab
  const getFilteredNotifications = () => {
    if (activeTab === 'all') {
      return notifications;
    }
    return notifications.filter(notification => notification.type === activeTab);
  };
  
  // Count unread notifications
  const getUnreadCount = (type = null) => {
    if (type) {
      return notifications.filter(n => n.type === type && !n.read).length;
    }
    return notifications.filter(n => !n.read).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex items-center justify-center text-red-500">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Bell className="mr-2 h-6 w-6 text-blue-500" />
          Notifications
          {getUnreadCount() > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {getUnreadCount()} new
            </span>
          )}
        </h1>
        
        {notifications.length > 0 && (
          <button
            onClick={() => Promise.all(notifications.filter(n => !n.read).map(n => markAsRead(n.id)))}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      {/* Tabs for filtering notifications */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-2 px-4 ${
            activeTab === 'all' 
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All
          {getUnreadCount() > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {getUnreadCount()}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('order_status')}
          className={`py-2 px-4 ${
            activeTab === 'order_status' 
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Orders
          {getUnreadCount('order_status') > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {getUnreadCount('order_status')}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('promocode')}
          className={`py-2 px-4 ${
            activeTab === 'promocode' 
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Promocodes
          {getUnreadCount('promocode') > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {getUnreadCount('promocode')}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('reward')}
          className={`py-2 px-4 ${
            activeTab === 'reward' 
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Rewards
          {getUnreadCount('reward') > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {getUnreadCount('reward')}
            </span>
          )}
        </button>
      </div>
      
      {filteredNotifications.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-700">No notifications</h3>
          <p className="text-gray-500 mt-1">
            You don't have any {activeTab !== 'all' ? activeTab : ''} notifications yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id}
              className={`bg-white border rounded-lg overflow-hidden shadow-sm ${
                !notification.read ? 'border-l-4 border-l-blue-500' : 'border-gray-200'
              }`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              {/* Order Status Notification */}
              {notification.type === 'order_status' && (
                <div className="p-4">
                  <div className="flex justify-between">
                    <div className="flex items-start">
                      <ShoppingBag className="h-5 w-5 mr-3 text-blue-500 mt-0.5" />
                      <div>
                        <p className={`${!notification.read ? 'font-medium' : ''}`}>
                          {notification.message}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Order #{notification.orderId}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOrderDetails(notification.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 mr-2"
                        title={expandedOrders[notification.id] ? "Hide details" : "Show details"}
                      >
                        {expandedOrders[notification.id] ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500"
                        title="Delete notification"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Order details when expanded */}
                  {expandedOrders[notification.id] && notification.items && notification.items.length > 0 && (
                    <div className="mt-3 bg-gray-50 p-3 rounded">
                      <h4 className="font-medium text-sm mb-2">Order Items:</h4>
                      <div className="space-y-2">
                        {notification.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span>Rs. {(Number(item.price.replace(/[^0-9.]/g, '')) * Number(item.quantity)).toFixed(2)}</span>
                          </div>
                        ))}
                         <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-medium">
                            <span>Total</span>
                            <span>Rs. {notification.items.reduce((total, item) => {
                            // Extract numeric price from each item
                            const numericPrice = Number(
                                typeof item.price === 'string' 
                                ? item.price.replace(/[^0-9.]/g, '') 
                                : item.price || 0
                            );
                            // Add price * quantity to running total
                            return total + (numericPrice * Number(item.quantity || 1));
                            }, 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {timeAgo(notification.timestamp)}
                    </span>
                    
                    <span className={`px-2 py-1 rounded-full ${
                      notification.status === 'completed' ? 'bg-green-100 text-green-800' :
                      notification.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      notification.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {notification.status}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Promocode Notification */}
              {notification.type === 'promocode' && (
                <div className="p-4">
                  <div className="flex justify-between">
                    <div className="flex items-start">
                      <Tag className="h-5 w-5 mr-3 text-green-500 mt-0.5" />
                      <div>
                        <p className={`${!notification.read ? 'font-medium' : ''}`}>
                          {notification.message}
                        </p>
                        
                        {notification.code && (
                          <div className="flex items-center mt-2">
                            <span className="font-mono font-bold text-green-600 bg-green-50 px-2 py-1 rounded mr-2">
                              {notification.code}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(notification.code);
                              }}
                              className={`p-1 rounded ${
                                copiedCode === notification.code 
                                  ? 'text-green-600' 
                                  : 'text-gray-400 hover:text-gray-600'
                              }`}
                              title="Copy code"
                            >
                              {copiedCode === notification.code ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Delete notification"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Promocode details */}
                  {notification.details && (
                    <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-500">Discount:</span>
                          <span className="ml-2 font-medium">{notification.discount}</span>
                        </div>
                        
                        {notification.details.minPurchase && notification.details.minPurchase !== 'None' && (
                          <div>
                            <span className="text-gray-500">Min. purchase:</span>
                            <span className="ml-2 font-medium">{notification.details.minPurchase}</span>
                          </div>
                        )}
                        
                        {notification.details.maxDiscount && notification.details.maxDiscount !== 'Unlimited' && (
                          <div>
                            <span className="text-gray-500">Max discount:</span>
                            <span className="ml-2 font-medium">{notification.details.maxDiscount}</span>
                          </div>
                        )}
                        
                        <div>
                          <span className="text-gray-500">Expires:</span>
                          <span className={`ml-2 font-medium ${
                            isExpired(notification.details.expiry) ? 'text-red-600' : ''
                          }`}>
                            {formatDate(notification.details.expiry)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {timeAgo(notification.timestamp)}
                    </span>
                    
                    {notification.code && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(notification.code);
                        }}
                        className={`px-3 py-1 rounded-full border ${
                          isExpired(notification.details?.expiry) ? 
                            'border-gray-200 text-gray-400 cursor-not-allowed' : 
                            copiedCode === notification.code ? 
                              'border-green-200 bg-green-50 text-green-600' : 
                              'border-green-200 hover:bg-green-50 text-green-600'
                        }`}
                        disabled={isExpired(notification.details?.expiry)}
                      >
                        {copiedCode === notification.code ? 'Copied!' : 'Copy code'}
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Reward Notification */}
              {notification.type === 'reward' && (
                <div className="p-4">
                  <div className="flex justify-between">
                    <div className="flex items-start">
                      <Gift className="h-5 w-5 mr-3 text-purple-500 mt-0.5" />
                      <div>
                        <p className={`${!notification.read ? 'font-medium' : ''}`}>
                          {notification.message}
                        </p>
                        
                        {notification.rewardType === 'points' && notification.points && (
                          <div className="flex items-center mt-2">
                            <span className="flex items-center text-yellow-500">
                              {[...Array(Math.min(5, Math.ceil(notification.points / 20)))].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-current" />
                              ))}
                            </span>
                            <span className="ml-2 font-bold text-purple-600">
                              {notification.points} points
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Delete notification"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Reward details */}
                  {notification.details && (
                    <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
                      {notification.rewardType === 'points' && (
                        <div>
                          <span className="text-gray-500">Points earned:</span>
                          <span className="ml-2 font-medium">{notification.points}</span>
                        </div>
                      )}
                      
                      {notification.rewardType === 'discount' && notification.value && (
                        <div>
                          <span className="text-gray-500">Discount value:</span>
                          <span className="ml-2 font-medium">{notification.value}</span>
                        </div>
                      )}
                      
                      {notification.rewardType === 'freeItem' && notification.value && (
                        <div>
                          <span className="text-gray-500">Free item:</span>
                          <span className="ml-2 font-medium">{notification.value}</span>
                        </div>
                      )}
                      
                      {notification.details.expiry && (
                        <div className="mt-1">
                          <span className="text-gray-500">Expires:</span>
                          <span className={`ml-2 font-medium ${
                            isExpired(notification.details.expiry) ? 'text-red-600' : ''
                          }`}>
                            {formatDate(notification.details.expiry)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {timeAgo(notification.timestamp)}
                    </span>
                    
                    <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                      {notification.rewardType === 'points' ? 'Points Reward' : 
                       notification.rewardType === 'discount' ? 'Discount Reward' : 
                       notification.rewardType === 'freeItem' ? 'Free Item' : 'Reward'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notification;