


import React, { useState, useEffect } from 'react';
import { Star, User, Edit, Trash2, Upload, Eye, EyeOff, Lock } from 'lucide-react';
import Navbar from "../components/Navbar";
import axios from 'axios';
import { toast } from 'react-toastify';

export default function UserProfile() {
  const [user, setUser] = useState({
    fullname: "",
    email: "",
    contact: "",
    rewardPoints: 0,
    profileImage: null
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [imageUploadSuccess, setImageUploadSuccess] = useState(false);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);

  // Rewards state
  const [rewardItems, setRewardItems] = useState([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState({});
  const [redeemConfirm, setRedeemConfirm] = useState({ show: false, item: null });

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Profile form state
  const [profileFormData, setProfileFormData] = useState({
    fullname: '',
    profileImageFile: null
  });

  // Confirmation modals state
  const [deleteImageConfirm, setDeleteImageConfirm] = useState(false);


  //for promos
const [availablePromos, setAvailablePromos] = useState([]);
const [promosLoading, setPromosLoading] = useState(false);
const [redeemmLoading, setRedeemmLoading] = useState(false)
const [userId, setUserId] = useState("")




const fetchPromos = async () => {
  try {
    setPromosLoading(true);
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/staff/get-all-promo`);
    if (res.data.success) {
      setAvailablePromos(res.data.data);
    }
    setPromosLoading(false);
  } catch (err) {
    console.error("Error fetching promos", err);
    setPromosLoading(false);
  }
};

  useEffect(() => {
    const id = localStorage.getItem('id');
    setUserId(id)
    fetchUserProfile();
    fetchPromos()
  }, []);

  useEffect(() => {
    if (activeTab === 'rewards') {
      fetchRewardItems();
    }
  }, [activeTab]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Get user data from localStorage
      const id = localStorage.getItem('id');
      const token = localStorage.getItem('token');
      
      if (!id || !token) {
        toast.error('You need to login first');
        window.location.href = '/login';
        return;
      }
  
      // Fetch user profile
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/profile/profile/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.data.success) {
        const userData = response.data.data;
        const points = userData.rewardPoints || userData.rewards || userData.points || 0;
        
        setUser({
          fullname: userData.fullname,
          email: userData.email,
          contact: userData.contact,
          rewardPoints: points,
          profileImage: userData.profileImage
        });

        setProfileFormData({
          fullname: userData.fullname,
          profileImageFile: null
        });

        // Set profile image preview
        if (userData.profileImage) {
          setProfileImage(`${process.env.REACT_APP_API_BASE_URL}${userData.profileImage}`);
        }
        
        console.log('Profile loaded:', userData);
      } else {
        toast.error('Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(error.response?.data?.message || 'Error fetching profile data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reward items from API
  const fetchRewardItems = async () => {
    try {
      setRewardsLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/reward-point/available-rewards`);
      
      if (response.data && Array.isArray(response.data)) {
        setRewardItems(response.data);
      } else {
        setRewardItems([]);
      }
    } catch (error) {
      console.error('Error fetching reward items:', error);
      toast.error('Failed to load reward items');
      setRewardItems([]);
    } finally {
      setRewardsLoading(false);
    }
  };

  // Handle reward redemption
  const handleRedeemItem = async (itemId, requiredPoints, itemTitle) => {
    if (user.rewardPoints < requiredPoints) {
      toast.error(`You need ${requiredPoints - user.rewardPoints} more points to redeem this item`);
      return;
    }

    setRedeemConfirm({ 
      show: true, 
      item: { id: itemId, points: requiredPoints, title: itemTitle }
    });
  };

  const confirmRedeemItem = async () => {
    const { id: itemId, points: requiredPoints, title: itemTitle } = redeemConfirm.item;

    try {
      setRedeemLoading(prev => ({ ...prev, [itemId]: true }));
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/rewards/redeem`,
        {
          itemId: itemId,
          requiredPoints: requiredPoints
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(`Successfully redeemed ${itemTitle}!`);
        // Update user points
        setUser(prev => ({
          ...prev,
          rewardPoints: prev.rewardPoints - requiredPoints
        }));
      } else {
        toast.error(response.data.message || 'Failed to redeem item');
      }
    } catch (error) {
      console.error('Error redeeming item:', error);
      toast.error(error.response?.data?.message || 'Failed to redeem item');
    } finally {
      setRedeemLoading(prev => ({ ...prev, [itemId]: false }));
      setRedeemConfirm({ show: false, item: null });
    }
  };

  const closeRedeemConfirm = () => {
    setRedeemConfirm({ show: false, item: null });
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setProfileFormData(prev => ({
        ...prev,
        profileImageFile: file
      }));

      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
        setImageUploadSuccess(true);
        setTimeout(() => setImageUploadSuccess(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = async () => {
    if (!user.profileImage) {
      setProfileImage(null);
      setProfileFormData(prev => ({ ...prev, profileImageFile: null }));
      setShowImageOptions(false);
      return;
    }

    setDeleteImageConfirm(true);
  };

  const confirmDeleteImage = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/profile/delete-image`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Profile image deleted successfully!');
        setUser(prev => ({ ...prev, profileImage: null }));
        setProfileImage(null);
        setProfileFormData(prev => ({ ...prev, profileImageFile: null }));
        setShowImageOptions(false);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error(error.response?.data?.message || 'Failed to delete image');
    } finally {
      setDeleteImageConfirm(false);
    }
  };

  const closeDeleteImageConfirm = () => {
    setDeleteImageConfirm(false);
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setProfileFormData({
        fullname: user.fullname,
        profileImageFile: null
      });
    }
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileUpdateLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const formData = new FormData();
      formData.append('fullname', profileFormData.fullname);
      
      if (profileFormData.profileImageFile) {
        formData.append('profileImage', profileFormData.profileImageFile);
      }
      
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/profile/update`, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        const updatedUser = response.data.data;
        
        setUser(prev => ({
          ...prev,
          fullname: updatedUser.fullname,
          profileImage: updatedUser.profileImage
        }));
        
        // Update profile image preview
        if (updatedUser.profileImage) {
          setProfileImage(`${process.env.REACT_APP_API_BASE_URL}${updatedUser.profileImage}`);
        }
        
        setIsEditing(false);
        setProfileFormData({ ...profileFormData, profileImageFile: null });
        
        // Update localStorage
        localStorage.setItem('fullname', updatedUser.fullname);
        
        // Reset file input
        const fileInput = document.getElementById('profile-upload');
        if (fileInput) fileInput.value = '';
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      setPasswordLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/profile/change-password`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordModal(false);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };


  // Function to redeem a promo
const handleRedeemPromo = async (promoId) => {
  if(!userId) return
  try {
   setRedeemmLoading(true)
    
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/api/staff/reedem-promo/${userId}`,
      { pcode: promoId }
    );

    if (response.data.success) {
      toast.success(response.data.message || 'Redemption Successful');
      fetchPromos(); // re-fetch promos to update redeemed status\
      fetchUserProfile()
    } else {
      toast.error(response.data.message || 'Redemption failed');
    }
  } catch (err) {
    toast.error("Error redeem Promo")
    
  } finally {
   setRedeemmLoading(false)


  }
};

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar/>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mt-11 mx-auto">
          {/* User Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="md:flex">
              <div className="md:w-1/3 bg-gradient-to-br from-gray-500 to-gray-700 p-6 text-white">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="relative rounded-full mb-4 w-24 h-24 bg-gray-200 flex items-center justify-center shadow-md overflow-hidden cursor-pointer"
                    onMouseEnter={() => setShowImageOptions(true)}
                    onMouseLeave={() => setShowImageOptions(false)}
                  >
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-gray-500" />
                    )}
                    
                    {showImageOptions && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center transition-opacity">
                        <label htmlFor="profile-upload" className="w-full flex items-center justify-center p-2 hover:bg-black hover:bg-opacity-30 cursor-pointer">
                          <Upload size={20} className="text-white mr-1" />
                          <span className="text-white text-xs">Upload</span>
                        </label>
                        
                        {profileImage && (
                          <button 
                            onClick={removeProfileImage} 
                            className="w-full flex items-center justify-center p-2 hover:bg-black hover:bg-opacity-30"
                          >
                            <Trash2 size={20} className="text-white mr-1" />
                            <span className="text-white text-xs">Remove</span>
                          </button>
                        )}
                      </div>
                    )}
                    
                    <input 
                      id="profile-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                  </div>
                  
                  {imageUploadSuccess && (
                    <div className="mb-2 px-3 py-1 bg-gray-800 bg-opacity-50 rounded-full text-xs">
                      Image uploaded successfully!
                    </div>
                  )}
                  
                  <h1 className="text-2xl font-bold mb-1">{user.fullname}</h1>
                  <p className="text-gray-100 mb-4">{user.email}</p>
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center mb-4">
                    <Star size={16} className="text-yellow-300 mr-2" />
                    <span className="font-bold">{user.rewardPoints || 0} points</span>
                  </div>
                  
                  <div className="flex flex-col space-y-2 w-full">
                    <button 
                      onClick={toggleEditing}
                      className="flex items-center justify-center px-4 py-2 bg-gray-800 bg-opacity-40 text-white rounded-md hover:bg-gray-800 transition"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit Profile
                    </button>
                    
                    <button 
                      onClick={() => setShowPasswordModal(true)}
                      className="flex items-center justify-center px-4 py-2 bg-gray-800 bg-opacity-40 text-white rounded-md hover:bg-gray-800 transition"
                    >
                      <Lock size={16} className="mr-2" />
                      Change Password
                    </button>
                  </div>
                  
                  <div className="mt-4 text-xs text-center text-gray-300">
                    <p>Click on profile picture to change image</p>
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3">
                {/* Tab Navigation */}
                <div className="flex border-b">
                  <button 
                    className={`flex-1 py-4 font-medium ${activeTab === 'profile' ? 'text-gray-600 border-b-2 border-gray-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    Profile
                  </button>

                  <button 
                    className={`flex-1 py-4 font-medium ${activeTab === 'promos' ? 'text-gray-600 border-b-2 border-gray-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('promos')}
                  >
                    Promos
                  </button>
                  <button 
                    className={`flex-1 py-4 font-medium ${activeTab === 'rewards' ? 'text-gray-600 border-b-2 border-gray-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('rewards')}
                  >
                    Rewards
                  </button>
                </div>
                
                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'profile' && (
                    <div>
                      {isEditing ? (
                        <div className="mb-6">
                          <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <Edit size={20} className="mr-2 text-gray-600" />
                            Edit Profile
                          </h2>
                          <form onSubmit={handleProfileUpdate} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="mb-4">
                              <label className="block text-gray-600 mb-1 font-medium">Name</label>
                              <input 
                                type="text" 
                                name="fullname"
                                value={profileFormData.fullname}
                                onChange={handleProfileFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
                                required
                                minLength={3}
                                maxLength={100}
                              />
                            </div>
                            
                            <div className="mb-4">
                              <label className="block text-gray-600 mb-1 font-medium">Email</label>
                              <input 
                                type="email" 
                                value={user.email} 
                                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500"
                                disabled
                              />
                              <small className="text-gray-500">Email cannot be changed</small>
                            </div>

                            <div className="mb-4">
                              <label className="block text-gray-600 mb-1 font-medium">Contact</label>
                              <input 
                                type="text" 
                                value={user.contact || ''} 
                                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500"
                                disabled
                              />
                              <small className="text-gray-500">Contact cannot be changed</small>
                            </div>
                            
                            <div className="mb-4">
                              <label className="block text-gray-600 mb-1 font-medium">Profile Image</label>
                              <div className="flex items-center">
                                <div className="w-16 h-16 rounded-full mr-4 overflow-hidden bg-gray-200 flex items-center justify-center">
                                  {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                  ) : (
                                    <User size={24} className="text-gray-500" />
                                  )}
                                </div>
                                <div className="flex space-x-2">
                                  <label htmlFor="profile-edit-upload" className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition cursor-pointer text-sm">
                                    Change Image
                                  </label>
                                  {profileImage && (
                                    <button 
                                      type="button"
                                      onClick={removeProfileImage}
                                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                                <input 
                                  id="profile-edit-upload" 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={handleImageUpload}
                                />
                              </div>
                              <small className="text-gray-500 block mt-1">Supported formats: JPG, PNG, GIF. Max size: 5MB</small>
                            </div>
                            
                            <div className="flex justify-end space-x-3 mt-6">
                              <button 
                                type="button"
                                onClick={toggleEditing}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                                disabled={profileUpdateLoading}
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit"
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition disabled:opacity-50"
                                disabled={profileUpdateLoading}
                              >
                                {profileUpdateLoading ? 'Saving...' : 'Save Changes'}
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <div className="mb-6">
                          <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <User size={20} className="mr-2 text-gray-600" />
                            Account Information
                          </h2>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex justify-between py-3 border-b border-gray-200">
                              <span className="text-gray-600">Name:</span>
                              <span className="font-medium">{user.fullname}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-200">
                              <span className="text-gray-600">Email:</span>
                              <span className="font-medium">{user.email}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-200">
                              <span className="text-gray-600">Contact:</span>
                              <span className="font-medium">{user.contact || 'Not provided'}</span>
                            </div>
                            <div className="flex justify-between py-3">
                              <span className="text-gray-600">Total Points:</span>
                              <span className="font-medium text-gray-600">{user.rewardPoints || 0}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'promos' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center">
                          <Star size={20} className="mr-2 text-gray-600" />
                          Available Promos
                        </h2>
                        <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full flex items-center text-sm font-medium">
                          <Star size={16} className="mr-1 text-yellow-500" />
                          {user.rewardPoints || 0} points available
                        </div>
                      </div>
                      
                      {promosLoading ? (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-600"></div>
    <span className="ml-3 text-gray-600">Loading promo codes...</span>
  </div>
) : availablePromos.length === 0 ? (
  <div className="text-center p-8">
    <Star size={48} className="mx-auto text-gray-300 mb-4" />
    <p className="text-gray-500">No promo codes available at the moment.</p>
  </div>
) : (
  <div className="mt-10">
    
    <div className="space-y-4">
      {availablePromos.map((promo) => (
        <div key={promo._id} className="p-4 border border-yellow-100 bg-yellow-50 rounded-lg shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-md font-bold text-gray-800 mb-1">{promo.pcode}</h4>
              <p className="text-sm text-gray-600">
                {promo.discountPercentage}% off • Costs {promo.tokenValue} points
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Expires: {new Date(promo.expiresAt).toLocaleDateString()}
              </p>
            </div>
            <button
  onClick={() => handleRedeemPromo(promo._id)}
  disabled={
    promo.users.includes(userId) ||
    user.rewardPoints < promo.tokenValue ||
    redeemmLoading
  }
  className={`px-4 py-2 text-sm rounded-md transition ${
    promo.users.includes(userId)
      ? 'bg-green-200 text-green-700 cursor-default'
      : user.rewardPoints >= promo.tokenValue && !redeemmLoading
      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
      : 'bg-yellow-200 text-yellow-800 cursor-not-allowed'
  }`}
>
  {promo.users.includes(userId)
    ? 'Redeemed'
    : redeemmLoading
    ? 'Redeeming...'
    : user.rewardPoints >= promo.tokenValue
    ? 'Redeem Promo'
    : `Need ${promo.tokenValue - user.rewardPoints} more points`}
</button>

          </div>
        </div>
      ))}
    </div>
  </div>
)}
                      
                     
                    </div>
                  )}


                  {activeTab === 'rewards' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center">
                          <Star size={20} className="mr-2 text-gray-600" />
                          Available Rewards
                        </h2>
                        <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full flex items-center text-sm font-medium">
                          <Star size={16} className="mr-1 text-yellow-500" />
                          {user.rewardPoints || 0} points available
                        </div>
                      </div>
                      
                      {rewardsLoading ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-600"></div>
                          <span className="ml-3 text-gray-600">Loading rewards...</span>
                        </div>
                      ) : rewardItems.length === 0 ? (
                        <div className="text-center p-8">
                          <Star size={48} className="mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-500">No reward items available at the moment.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {rewardItems.map((item) => (
                            <div key={item._id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 mr-4 flex-shrink-0">
                                    {item.image ? (
                                      <img 
                                        src={`${process.env.REACT_APP_API_BASE_URL}${item.image}`} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Star size={20} className="text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                                    <p className="text-sm text-gray-500 capitalize">{item.categories} • {item.type}</p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <span className="mr-3 font-medium text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded-full">
                                    {item.rewardPoints} pts
                                  </span>
                                </div>
                              </div>
                              <div className="mt-4 flex justify-end">
                                <button
                                  onClick={() => handleRedeemItem(item._id, item.rewardPoints, item.title)}
                                  disabled={user.rewardPoints < item.rewardPoints || redeemLoading[item._id]}
                                  className={`px-4 py-2 ${
                                    user.rewardPoints >= item.rewardPoints && !redeemLoading[item._id]
                                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  } rounded-md transition text-sm`}
                                >
                                  {redeemLoading[item._id] ? 'Redeeming...' : 
                                   user.rewardPoints >= item.rewardPoints ? 'Redeem Item' : 
                                   `Need ${item.rewardPoints - user.rewardPoints} more points`}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-gray-600 text-sm">
                          Points expire 12 months after they are earned. Redeem your points for amazing rewards!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Lock size={20} className="mr-2 text-gray-600" />
                Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange}>
              <div className="mb-4">
                <label className="block text-gray-600 mb-1 font-medium">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.current ? (
                      <EyeOff size={20} className="text-gray-400" />
                    ) : (
                      <Eye size={20} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-600 mb-1 font-medium">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? (
                      <EyeOff size={20} className="text-gray-400" />
                    ) : (
                      <Eye size={20} className="text-gray-400" />
                    )}
                  </button>
                </div>
                <small className="text-gray-500">Password must be at least 6 characters long</small>
              </div>

              <div className="mb-6">
                <label className="block text-gray-600 mb-1 font-medium">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={20} className="text-gray-400" />
                    ) : (
                      <Eye size={20} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition disabled:opacity-50"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Redeem Confirmation Modal */}
      {redeemConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Confirm Redemption</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to redeem "<span className="font-medium">{redeemConfirm.item?.title}</span>" for {redeemConfirm.item?.points} points?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeRedeemConfirm}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmRedeemItem}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Redeem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Image Confirmation Modal */}
      {deleteImageConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Delete Profile Image</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your profile image? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteImageConfirm}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteImage}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}