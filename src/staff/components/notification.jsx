
// import { useEffect, useState } from 'react';
// import { ref, onValue, remove } from 'firebase/database';
// import { database } from '../../services/firebase'; // Make sure this path is correct for your project
// import { AlertCircle, Bell, Clock, Trash2, X } from 'lucide-react';

// const Notification = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [notificationCount, setNotificationCount] = useState(0);
//   const [showPanel, setShowPanel] = useState(true);
//   const [role] = useState('staff'); // Default role - could be made dynamic
  
//   useEffect(() => {
//     // Reference to the notifications for the specified role
//     const notificationsRef = ref(database, `notifications/${role}`);
    
//     // Set up a real-time listener
//     const unsubscribe = onValue(notificationsRef, (snapshot) => {
//       try {
//         setLoading(true);
//         if (snapshot.exists()) {
//           // Convert the object to an array and add the key as id
//           const notificationsData = snapshot.val();
//           const notificationsArray = Object.keys(notificationsData).map(key => ({
//             id: key,
//             ...notificationsData[key]
//           }));
          
//           // Sort by timestamp (newest first)
//           const sortedNotifications = notificationsArray
//             .sort((a, b) => b.timestamp - a.timestamp);
            
//           setNotifications(sortedNotifications);
//           setNotificationCount(sortedNotifications.length);
//         } else {
//           setNotifications([]);
//           setNotificationCount(0);
//         }
//       } catch (err) {
//         console.error('Error processing notifications:', err);
//         setError('Failed to load notifications');
//       } finally {
//         setLoading(false);
//       }
//     }, (err) => {
//       console.error('Error fetching notifications:', err);
//       setError('Failed to connect to notification service');
//       setLoading(false);
//     });
    
//     // Clean up the listener when component unmounts
//     return () => unsubscribe();
//   }, [role]);
  
//   // Function to delete a notification
//   const handleDelete = async (id) => {
//     try {
//       await remove(ref(database, `notifications/${role}/${id}`));
//       // The UI will update automatically thanks to the onValue listener
//     } catch (err) {
//       console.error('Error deleting notification:', err);
//     }
//   };
  
//   // Function to clear all notifications
//   const handleClearAll = async () => {
//     try {
//       const confirmClear = window.confirm('Are you sure you want to clear all notifications?');
//       if (!confirmClear) return;
      
//       // Delete each notification one by one
//       for (const notification of notifications) {
//         await remove(ref(database, `notifications/${role}/${notification.id}`));
//       }
//     } catch (err) {
//       console.error('Error clearing notifications:', err);
//     }
//   };
  
//   // Function to format timestamp
//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.round(diffMs / 60000);
    
//     if (diffMins < 1) return 'Just now';
//     if (diffMins < 60) return `${diffMins} min ago`;
    
//     const diffHours = Math.round(diffMins / 60);
//     if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
//     const diffDays = Math.round(diffHours / 24);
//     if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
//     return date.toLocaleDateString();
//   };

//   // Since this is a dedicated page (not a sidebar), let's adjust the layout
//   return (
//     <div className="max-w-4xl mx-auto px-4 py-6">
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center">
//           <Bell className="h-6 w-6 mr-2 text-blue-500" />
//           <h1 className="text-2xl font-bold">Notifications</h1>
//           {notificationCount > 0 && (
//             <span className="ml-3 bg-blue-500 text-white rounded-full px-3 py-1 text-sm font-medium">
//               {notificationCount}
//             </span>
//           )}
//         </div>
        
//         {notificationCount > 0 && (
//           <button 
//             onClick={handleClearAll}
//             className="text-sm text-red-500 hover:text-red-700 font-medium"
//           >
//             Clear All
//           </button>
//         )}
//       </div>
      
//       {/* Notification content */}
//       <div className="bg-white rounded-lg shadow-md">
//         {loading ? (
//           <div className="flex flex-col items-center justify-center h-64">
//             <div className="animate-spin h-10 w-10 border-3 border-blue-500 rounded-full border-t-transparent"></div>
//             <p className="mt-4 text-gray-600">Loading notifications...</p>
//           </div>
//         ) : error ? (
//           <div className="bg-red-100 text-red-700 p-6 rounded-lg flex items-center">
//             <AlertCircle className="h-6 w-6 mr-3 flex-shrink-0" />
//             <p className="font-medium">{error}</p>
//           </div>
//         ) : notifications.length === 0 ? (
//           <div className="text-center py-16 text-gray-500">
//             <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
//             <p className="font-medium text-lg">No notifications</p>
//             <p className="mt-2">You're all caught up!</p>
//           </div>
//         ) : (
//           <div className="divide-y divide-gray-100">
//             {notifications.map((notification) => (
//                 <div 
//                     key={notification.id} 
//                     className="p-5 hover:bg-gray-50 transition-colors relative"
//                 >
//                     <div className="flex justify-between items-start">
//                     <div className="flex-grow pr-10">
//                         <p className="font-medium text-lg">{notification.name || 'User'}</p>
//                         <p className="text-gray-700 mt-2">{notification.message}</p>
                        
//                         {/* Display order items if available */}
//                         {notification.orderInfo && notification.orderInfo.items && notification.orderInfo.items.length > 0 && (
//                         <div className="mt-3 bg-gray-50 p-3 rounded-md">
//                             <p className="font-medium text-sm text-gray-700 mb-2">Order Items:</p>
//                             <div className="space-y-2">
//                             {notification.orderInfo.items.map((item, index) => (
//                                 <div key={index} className="flex justify-between text-sm">
//                                 <span>{item.quantity}x {item.name}</span>
//                                 <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
//                                 </div>
//                             ))}
//                             <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-medium">
//                                 <span>Total</span>
//                                 <span>Rs. {notification.orderInfo.total.toFixed(2)}</span>
//                             </div>
//                             </div>
//                         </div>
//                         )}
                        
//                         <div className="mt-3 flex items-center text-gray-500 text-sm">
//                         <Clock className="h-4 w-4 mr-1" />
//                         <span>{formatTime(notification.timestamp)}</span>
//                         </div>
//                     </div>
                    
//                     <button
//                         onClick={() => handleDelete(notification.id)}
//                         className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition-colors p-1"
//                         title="Delete notification"
//                     >
//                         <Trash2 className="h-5 w-5" />
//                     </button>
//                     </div>
//                 </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Notification;



import { useEffect, useState } from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { database } from '../../services/firebase'; // Make sure this path is correct for your project
import { AlertCircle, Bell, Clock, Trash2, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showPanel, setShowPanel] = useState(true);
  const [role] = useState('staff'); // Default role - could be made dynamic
  
  useEffect(() => {
    // Reference to the notifications for the specified role
    const notificationsRef = ref(database, `notifications/${role}`);
    
    // Set up a real-time listener
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      try {
        setLoading(true);
        if (snapshot.exists()) {
          // Convert the object to an array and add the key as id
          const notificationsData = snapshot.val();
          const notificationsArray = Object.keys(notificationsData).map(key => ({
            id: key,
            ...notificationsData[key]
          }));
          
          // Sort by timestamp (newest first)
          const sortedNotifications = notificationsArray
            .sort((a, b) => b.timestamp - a.timestamp);
            
          setNotifications(sortedNotifications);
          setNotificationCount(sortedNotifications.length);
        } else {
          setNotifications([]);
          setNotificationCount(0);
        }
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error processing notifications:', err);
        setError('Failed to load notifications');
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error('Error fetching notifications:', err);
      setError('Failed to connect to notification service');
      setLoading(false);
      toast.error('Failed to connect to notification service');
    });
    
    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, [role]);
  
  // Function to delete a notification
  const handleDelete = async (id) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Deleting notification...');
      
      await remove(ref(database, `notifications/${role}/${id}`));
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Notification deleted successfully');
      
      // The UI will update automatically thanks to the onValue listener
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
    }
  };
  
  // Function to clear all notifications with toast confirmation
  const handleClearAll = () => {
    toast((t) => (
      <div className="flex flex-col">
        <div className="flex items-center mb-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
          <span className="font-medium">Clear All Notifications</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to clear all notifications? This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            onClick={async () => {
              toast.dismiss(t.id);
              await confirmClearAll();
            }}
          >
            Clear All
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        background: 'white',
        color: 'black',
        padding: '16px',
        minWidth: '300px',
      },
    });
  };

  // Actual function to clear notifications
  const confirmClearAll = async () => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Clearing all notifications...');
      
      // Delete each notification one by one
      for (const notification of notifications) {
        await remove(ref(database, `notifications/${role}/${notification.id}`));
      }
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('All notifications cleared successfully');
      
    } catch (err) {
      console.error('Error clearing notifications:', err);
      toast.error('Failed to clear all notifications');
    }
  };
  
  // Function to format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  // Since this is a dedicated page (not a sidebar), let's adjust the layout
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#ef4444',
            },
          },
          loading: {
            style: {
              background: '#3b82f6',
            },
          },
        }}
      />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Bell className="h-6 w-6 mr-2 text-blue-500" />
          <h1 className="text-2xl font-bold">Notifications</h1>
          {notificationCount > 0 && (
            <span className="ml-3 bg-blue-500 text-white rounded-full px-3 py-1 text-sm font-medium">
              {notificationCount}
            </span>
          )}
        </div>
        
        {notificationCount > 0 && (
          <button 
            onClick={handleClearAll}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      
      {/* Notification content */}
      <div className="bg-white rounded-lg shadow-md">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin h-10 w-10 border-3 border-blue-500 rounded-full border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-6 rounded-lg flex items-center">
            <AlertCircle className="h-6 w-6 mr-3 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="font-medium text-lg">No notifications</p>
            <p className="mt-2">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
                <div 
                    key={notification.id} 
                    className="p-5 hover:bg-gray-50 transition-colors relative"
                >
                    <div className="flex justify-between items-start">
                    <div className="flex-grow pr-10">
                        <p className="font-medium text-lg">{notification.name || 'User'}</p>
                        <p className="text-gray-700 mt-2">{notification.message}</p>
                        
                        {/* Display order items if available */}
                        {notification.orderInfo && notification.orderInfo.items && notification.orderInfo.items.length > 0 && (
                        <div className="mt-3 bg-gray-50 p-3 rounded-md">
                            <p className="font-medium text-sm text-gray-700 mb-2">Order Items:</p>
                            <div className="space-y-2">
                            {notification.orderInfo.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.name}</span>
                                <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-medium">
                                <span>Total</span>
                                <span>Rs. {notification.orderInfo.total.toFixed(2)}</span>
                            </div>
                            </div>
                        </div>
                        )}
                        
                        <div className="mt-3 flex items-center text-gray-500 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatTime(notification.timestamp)}</span>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => handleDelete(notification.id)}
                        className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Delete notification"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                    </div>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;