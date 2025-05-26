import { ref, set, push, remove, get, update, query, orderByChild, equalTo } from 'firebase/database';
import { database } from './firebase';

/**
 * Create a notification under a specific role
 * @param {string} role - Role name (e.g., 'admin', 'staff', 'user')
 * @param {Object} data - { userId, name, message }
 * @returns {Promise<string>} - Firebase ID (key)
 */
export const createNotification = async (role, data) => {
  const timestamp = Date.now();
  const notifRef = ref(database, `notifications/${role}`);
  const newRef = push(notifRef);
  await set(newRef, { ...data, timestamp });
  return newRef.key;
};

/**
 * Notify multiple roles (admin, staff, etc.)
 * @param {Array<string>} roles - Array of role strings
 * @param {Object} data - { userId, name, message, items, total }
 * @returns {Promise<Array<string>>} - Array of notification IDs
 */
export const notifyRoles = async (roles, data) => {
  const timestamp = Date.now();

  console.log('data', data);
  
  // Create a single notification object with all necessary data
  const notificationData = {
    ...data,
    timestamp,
    // Make sure we don't duplicate the items data if it's already present
    items: data.items || [],
    read: false // Add read status for notifications
  };

  // Send notification to each role and collect notification IDs
  const notificationIds = await Promise.all(roles.map(async (role) => {
    const notifRef = ref(database, `notifications/${role}`);
    const newRef = push(notifRef);
    await set(newRef, notificationData);
    console.log(`✅ Notification sent to ${role}`);
    return { role, id: newRef.key };
  }));
  
  return notificationIds;
};

/**
 * Send order status update notification to a user
 * @param {string} userId - User ID to notify
 * @param {Object} orderData - Order details including status
 * @returns {Promise<string>} - Notification ID
 */
export const notifyOrderStatusUpdate = async (userId, orderData) => {
  if (!userId) {
    throw new Error('User ID is required for status update notification');
  }
  
  const { orderId, status, items, total } = orderData;
  
  // Create status message based on the order status
  let statusMessage = '';
  let statusIcon = '';
  
  switch (status) {
    case 'processing':
      statusMessage = 'Your order is being processed';
      statusIcon = '🔄';
      break;
    case 'preparing':
      statusMessage = 'Your order is being prepared';
      statusIcon = '👨‍🍳';
      break;
    case 'ready':
      statusMessage = 'Your order is ready for pickup';
      statusIcon = '✅';
      break;
    case 'delivered':
      statusMessage = 'Your order has been delivered';
      statusIcon = '🚚';
      break;
    case 'completed':
      statusMessage = 'Your order is complete';
      statusIcon = '🎉';
      break;
    case 'cancelled':
      statusMessage = 'Your order has been cancelled';
      statusIcon = '❌';
      break;
    default:
      statusMessage = `Your order status: ${status}`;
      statusIcon = '📋';
  }
  
  const timestamp = Date.now();
  const notifRef = ref(database, `notifications/user`);
  const newRef = push(notifRef);
  
  const notificationData = {
    type: 'order_status',
    userId,
    orderId,
    status,
    message: `${statusIcon} ${statusMessage}`,
    items,
    total,
    timestamp,
    read: false
  };
  
  await set(newRef, notificationData);
  console.log(`✅ Order status notification sent to user ${userId}`);
  return newRef.key;
};

/**
 * Broadcast a promocode notification to all users
 * @param {Object} promoData - Promocode details
 * @returns {Promise<Array<string>>} - Array of notification IDs
 */
export const broadcastPromocode = async (promoData) => {
  const { code, discount, expiry, minPurchase, maxDiscount, description } = promoData;
  
  // Format discount properly
  const formattedDiscount = typeof discount === 'number' 
    ? (discount > 1 ? `Rs. ${discount}` : `${discount * 100}%`) 
    : discount;
  
  // Format expiry date
  const expiryDate = expiry ? new Date(expiry).toLocaleDateString() : 'N/A';
  
  const notificationData = {
    type: 'promocode',
    code,
    discount: formattedDiscount,
    message: description || `🎟️ New promo code: ${code} for ${formattedDiscount} off. Valid until ${expiryDate}`,
    details: {
      code,
      discount: formattedDiscount,
      expiry: expiryDate,
      minPurchase: minPurchase ? `Rs. ${minPurchase}` : 'None',
      maxDiscount: maxDiscount ? `Rs. ${maxDiscount}` : 'Unlimited'
    },
    timestamp: Date.now(),
    read: false
  };
  
  try {
    // Get all users from the API
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:4000/api/users/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const userData = await response.json();
    
    if (!userData.success || !userData.data || !userData.data.length) {
      console.log('No users found for broadcasting');
      return [];
    }
    
    // Extract user IDs from the API response
    const users = userData.data;
    
    // Send notification to each user
    const notificationPromises = users.map(async (user) => {
      const notifRef = ref(database, `notifications/user`);
      const newRef = push(notifRef);
    const data = { 
        ...notificationData, 
        userId: user._id, 
        recipientName: user.name || user.fullname || 'User'
    };  
    await set(newRef, data);
      console.log(`✅ Promocode notification sent to user ${user._id}`);
      return newRef.key;
    });
    
    return Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error broadcasting promocode:', error);
    throw error;
  }
};

/**
 * Broadcast a reward notification to all users
 * @param {Object} rewardData - Reward details
 * @returns {Promise<Array<string>>} - Array of notification IDs
 */
export const broadcastReward = async (rewardData) => {
  const { rewardType, points, value, expiry, description } = rewardData;
  
  // Create appropriate message based on reward type
  let message = '';
  let icon = '';
  
  switch (rewardType) {
    case 'points':
      message = `You earned ${points} reward points!`;
      icon = '🌟';
      break;
    case 'discount':
      message = `You earned a ${value} discount reward!`;
      icon = '💰';
      break;
    case 'freeItem':
      message = `You earned a free item reward: ${value}`;
      icon = '🎁';
      break;
    default:
      message = `You received a new reward!`;
      icon = '🏆 ';
  }
  
  // Use custom description if provided
  if (description) {
    message = description;
  }
  
  // Format expiry date if available
  const expiryDate = expiry ? new Date(expiry).toLocaleDateString() : null;
  const expiryMessage = expiryDate ? ` Valid until ${expiryDate}.` : '';
  
  const notificationData = {
    type: 'reward',
    rewardType,
    points,
    value,
    message: `${icon} ${message}${expiryMessage}`,
    details: {
      ...rewardData,
      expiry: expiryDate
    },
    timestamp: Date.now(),
    read: false
  };
  
  try {
    // Get all users from the API
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:4000/api/users/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const userData = await response.json();
    
    if (!userData.success || !userData.data || !userData.data.length) {
      console.log('No users found for broadcasting');
      return [];
    }
    
    // Extract user IDs from the API response
    const users = userData.data;
    
    // Send notification to each user
    const notificationPromises = users.map(async (user) => {
      const notifRef = ref(database, `notifications/user-${user._id}`);
      const newRef = push(notifRef);
      await set(newRef, notificationData);
      console.log(`✅ Reward notification sent to user ${user._id}`);
      return newRef.key;
    });
    
    return Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error broadcasting reward:', error);
    throw error;
  }
};

/**
 * Send a general announcement to all users
 * @param {Object} announcementData - Announcement details
 * @returns {Promise<Array<string>>} - Array of notification IDs
 */
export const sendAnnouncement = async (announcementData) => {
  const { title, message, icon = '📢' } = announcementData;
  
  const notificationData = {
    type: 'announcement',
    title,
    message: `${icon} ${title || 'Announcement'}: ${message}`,
    details: announcementData,
    timestamp: Date.now(),
    read: false
  };
  
  try {
    // Get all users from the API
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:4000/api/users/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const userData = await response.json();
    
    if (!userData.success || !userData.data || !userData.data.length) {
      console.log('No users found for broadcasting');
      return [];
    }
    
    // Extract user IDs from the API response
    const users = userData.data;
    
    // Send notification to each user
    const notificationPromises = users.map(async (user) => {
      const notifRef = ref(database, `notifications/user-${user._id}`);
      const newRef = push(notifRef);
      await set(newRef, notificationData);
      console.log(`✅ Announcement sent to user ${user._id}`);
      return newRef.key;
    });
    
    return Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error sending announcement:', error);
    throw error;
  }
};

/**
 * Get all notifications for a specific role
 * @param {string} role - Role to fetch (e.g., 'admin')
 * @returns {Promise<Object>} - Notifications object
 */
export const getNotificationsByRole = async (role) => {
  const snapshot = await get(ref(database, `notifications/${role}`));
  return snapshot.exists() ? snapshot.val() : {};
};

/**
 * Get all notifications for a specific user
 * @param {string} userId - User ID to fetch notifications for
 * @returns {Promise<Object>} - Notifications object
 */
export const getNotificationsByUser = async (userId) => {
  const snapshot = await get(ref(database, `notifications/user-${userId}`));
  return snapshot.exists() ? snapshot.val() : {};
};

/**
 * Delete a notification by role and ID
 * @param {string} role - Role (e.g., 'staff')
 * @param {string} id - Firebase push ID
 */
export const deleteNotificationByRole = async (role, id) => {
  await remove(ref(database, `notifications/${role}/${id}`));
};

/**
 * Delete a notification for a user
 * @param {string} userId - User ID
 * @param {string} id - Firebase push ID
 */
export const deleteUserNotification = async (userId, id) => {
  await remove(ref(database, `notifications/user/${id}`));
};

/**
 * Update a notification by role and ID
 * @param {string} role - Role (e.g., 'admin')
 * @param {string} id - Firebase push ID
 * @param {Object} updatedData - Partial update object
 */
export const updateNotificationByRole = async (role, id, updatedData) => {
  await update(ref(database, `notifications/${role}/${id}`), updatedData);
};

/**
 * Mark a notification as read
 * @param {string} path - Full path to notification (role or user-id)
 * @param {string} id - Firebase push ID
 */
export const markNotificationAsRead = async (path, id) => {
  await update(ref(database, `notifications/${path}/${id}`), { read: true });
};

/**
 * Mark all notifications as read for a specific path
 * @param {string} path - Full path to notifications (role or user-id)
 */
export const markAllNotificationsAsRead = async (path) => {
  const snapshot = await get(ref(database, `notifications/${path}`));
  if (snapshot.exists()) {
    const updates = {};
    const notifications = snapshot.val();
    
    Object.keys(notifications).forEach(id => {
      if (!notifications[id].read) {
        updates[`notifications/${path}/${id}/read`] = true;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
    }
  }
};

/**
 * Count unread notifications
 * @param {string} path - Full path to notifications (role or user-id)
 * @returns {Promise<number>} - Count of unread notifications
 */
export const countUnreadNotifications = async (path) => {
  const snapshot = await get(ref(database, `notifications/${path}`));
  if (!snapshot.exists()) return 0;
  
  const notifications = snapshot.val();
  return Object.values(notifications).filter(notif => !notif.read).length;
};