
// import React, { useState, useEffect } from 'react';
// import { Star, User, Edit, Trash2, Upload } from 'lucide-react';
// import Navbar from "../components/Navbar";
// import axios from 'axios';
// import { toast } from 'react-toastify';

// export default function UserProfile() {
//   const [user, setUser] = useState({
//     fullname: "",
//     email: "",
//     rewardPoints: 0
//   });

//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("profile");
//   const [profileImage, setProfileImage] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [showImageOptions, setShowImageOptions] = useState(false);
//   const [imageUploadSuccess, setImageUploadSuccess] = useState(false);

//   useEffect(() => {
//     fetchUserProfile();
//   }, []);



//   const fetchUserProfile = async () => {
//     try {
//       setLoading(true);
      
//       // Get user data from localStorage
//       const id = localStorage.getItem('id');
//       const token = localStorage.getItem('token');
//       const storedFullname = localStorage.getItem('fullname');
//       const storedEmail = localStorage.getItem('email');
      
//       if (!id || !token) {
//         toast.error('You need to login first');
//         // Redirect to login page
//         window.location.href = '/login';
//         return;
//       }
  
//       // Set initial user data from localStorage
//       setUser({
//         fullname: storedFullname || "",
//         email: storedEmail || "",
//         rewardPoints: 0
//       });
  
//       // Fetch user profile
//       const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/profile/profile/${id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
  
//       if (response.data.success) {
//         // Log the full response to see the structure
//         console.log('Profile API response:', response.data);
        
//         // Extract reward points regardless of field name
//         const userData = response.data.data;
//         const points = userData.rewardPoints || userData.rewards || userData.points || 0;
        
//         setUser({
//           fullname: userData.fullname,
//           email: userData.email,
//           rewardPoints: points
//         });
        
//         console.log('Reward points set to:', points);
//       } else {
//         toast.error('Failed to fetch profile data');
//       }
//     } catch (error) {
//       console.error('Error fetching profile:', error);
//       toast.error(error.response?.data?.message || 'Error fetching profile data');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         setProfileImage(event.target.result);
//         setImageUploadSuccess(true);
//         // Hide success message after 3 seconds
//         setTimeout(() => setImageUploadSuccess(false), 3000);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const removeProfileImage = () => {
//     setProfileImage(null);
//     setShowImageOptions(false);
//   };

//   const toggleEditing = () => {
//     setIsEditing(!isEditing);
//   };

//   const handleProfileUpdate = async (e) => {
//     e.preventDefault();
    
//     try {
//       const token = localStorage.getItem('token');
//       const userId = localStorage.getItem('id');
      
//       if (!token || !userId) {
//         toast.error('Authentication required');
//         return;
//       }
      
//       // Create form data for profile update
//       const updatedData = {
//         fullname: e.target.fullname.value,
//         email: e.target.email.value
//       };
      
//       // Send update request to your existing backend route
//       const response = await axios.put(
//         `${process.env.REACT_APP_API_BASE_URL}/api/users/${userId}`, 
//         updatedData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );
      
//       if (response.data.success) {
//         toast.success('Profile updated successfully');
//         setUser({...user, ...updatedData});
//         setIsEditing(false);
        
//         // Update localStorage values
//         localStorage.setItem('fullname', updatedData.fullname);
//         localStorage.setItem('email', updatedData.email);
//       } else {
//         toast.error('Failed to update profile');
//       }
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       toast.error(error.response?.data?.message || 'Error updating profile');
//     }
//   };

//   if (loading) {
//     return (
//       <div>
//         <Navbar />
//         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 mx-auto"></div>
//             <p className="mt-4 text-gray-600">Loading profile...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <Navbar/>
//       <div className="min-h-screen bg-gray-50 py-8 px-4">
//         <div className="max-w-4xl mt-11 mx-auto">
//           {/* User Info Card */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
//             <div className="md:flex">
//               <div className="md:w-1/3 bg-gradient-to-br from-gray-500 to-gray-700 p-6 text-white">
//                 <div className="flex flex-col items-center text-center">
//                   <div 
//                     className="relative rounded-full mb-4 w-24 h-24 bg-gray-200 flex items-center justify-center shadow-md overflow-hidden cursor-pointer"
//                     onMouseEnter={() => setShowImageOptions(true)}
//                     onMouseLeave={() => setShowImageOptions(false)}
//                   >
//                     {profileImage ? (
//                       <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
//                     ) : (
//                       <User size={48} className="text-gray-500" />
//                     )}
                    
//                     {showImageOptions && (
//                       <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center transition-opacity">
//                         <label htmlFor="profile-upload" className="w-full flex items-center justify-center p-2 hover:bg-black hover:bg-opacity-30 cursor-pointer">
//                           <Upload size={20} className="text-white mr-1" />
//                           <span className="text-white text-xs">Upload</span>
//                         </label>
                        
//                         {profileImage && (
//                           <button 
//                             onClick={removeProfileImage} 
//                             className="w-full flex items-center justify-center p-2 hover:bg-black hover:bg-opacity-30"
//                           >
//                             <Trash2 size={20} className="text-white mr-1" />
//                             <span className="text-white text-xs">Remove</span>
//                           </button>
//                         )}
//                       </div>
//                     )}
                    
//                     <input 
//                       id="profile-upload" 
//                       type="file" 
//                       accept="image/*" 
//                       className="hidden" 
//                       onChange={handleImageUpload}
//                     />
//                   </div>
                  
//                   {imageUploadSuccess && (
//                     <div className="mb-2 px-3 py-1 bg-gray-800 bg-opacity-50 rounded-full text-xs">
//                       Image uploaded successfully!
//                     </div>
//                   )}
                  
//                   <h1 className="text-2xl font-bold mb-1">{user.fullname}</h1>
//                   <p className="text-gray-100 mb-4">{user.email}</p>
//                   <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center mb-4">
//                     <Star size={16} className="text-yellow-300 mr-2" />
//                     <span className="font-bold">{user.rewardPoints || 0} points</span>
//                   </div>
//                   <button 
//                     onClick={toggleEditing}
//                     className="flex items-center px-4 py-2 bg-gray-800 bg-opacity-40 text-white rounded-md hover:bg-gray-800 transition"
//                   >
//                     <Edit size={16} className="mr-2" />
//                     Edit Profile
//                   </button>
                  
//                   <div className="mt-4 text-xs text-center text-gray-300">
//                     <p>Click on profile picture to change image</p>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="md:w-2/3">
//                 {/* Tab Navigation */}
//                 <div className="flex border-b">
//                   <button 
//                     className={`flex-1 py-4 font-medium ${activeTab === 'profile' ? 'text-gray-600 border-b-2 border-gray-600' : 'text-gray-500 hover:text-gray-700'}`}
//                     onClick={() => setActiveTab('profile')}
//                   >
//                     Profile
//                   </button>

//                   <button 
//                     className={`flex-1 py-4 font-medium ${activeTab === 'rewards' ? 'text-gray-600 border-b-2 border-gray-600' : 'text-gray-500 hover:text-gray-700'}`}
//                     onClick={() => setActiveTab('rewards')}
//                   >
//                     Rewards
//                   </button>
//                 </div>
                
//                 {/* Tab Content */}
//                 <div className="p-6">
//                   {activeTab === 'profile' && (
//                     <div>
//                       {isEditing ? (
//                         <div className="mb-6">
//                           <h2 className="text-lg font-semibold mb-4 flex items-center">
//                             <Edit size={20} className="mr-2 text-gray-600" />
//                             Edit Profile
//                           </h2>
//                           <form onSubmit={handleProfileUpdate} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
//                             <div className="mb-4">
//                               <label className="block text-gray-600 mb-1 font-medium">Name</label>
//                               <input 
//                                 type="text" 
//                                 name="fullname"
//                                 defaultValue={user.fullname} 
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
//                                 required
//                               />
//                             </div>
//                             <div className="mb-4">
//                               <label className="block text-gray-600 mb-1 font-medium">Email</label>
//                               <input 
//                                 type="email" 
//                                 name="email"
//                                 defaultValue={user.email} 
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
//                                 required
//                               />
//                             </div>
                            
//                             <div className="mb-4">
//                               <label className="block text-gray-600 mb-1 font-medium">Profile Image</label>
//                               <div className="flex items-center">
//                                 <div className="w-16 h-16 rounded-full mr-4 overflow-hidden bg-gray-200 flex items-center justify-center">
//                                   {profileImage ? (
//                                     <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
//                                   ) : (
//                                     <User size={24} className="text-gray-500" />
//                                   )}
//                                 </div>
//                                 <div className="flex space-x-2">
//                                   <label htmlFor="profile-edit-upload" className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition cursor-pointer text-sm">
//                                     Change Image
//                                   </label>
//                                   {profileImage && (
//                                     <button 
//                                       type="button"
//                                       onClick={removeProfileImage}
//                                       className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm"
//                                     >
//                                       Remove
//                                     </button>
//                                   )}
//                                 </div>
//                                 <input 
//                                   id="profile-edit-upload" 
//                                   type="file" 
//                                   accept="image/*" 
//                                   className="hidden" 
//                                   onChange={handleImageUpload}
//                                 />
//                               </div>
//                             </div>
//                             <div className="flex justify-end space-x-3 mt-6">
//                               <button 
//                                 type="button"
//                                 onClick={toggleEditing}
//                                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
//                               >
//                                 Cancel
//                               </button>
//                               <button 
//                                 type="submit"
//                                 className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
//                               >
//                                 Save Changes
//                               </button>
//                             </div>
//                           </form>
//                         </div>
//                       ) : (
//                         <div className="mb-6">
//                           <h2 className="text-lg font-semibold mb-4 flex items-center">
//                             <User size={20} className="mr-2 text-gray-600" />
//                             Account Information
//                           </h2>
//                           <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
//                             <div className="flex justify-between py-3 border-b border-gray-200">
//                               <span className="text-gray-600">Name:</span>
//                               <span className="font-medium">{user.fullname}</span>
//                             </div>
//                             <div className="flex justify-between py-3 border-b border-gray-200">
//                               <span className="text-gray-600">Email:</span>
//                               <span className="font-medium">{user.email}</span>
//                             </div>
//                             <div className="flex justify-between py-3">
//                               <span className="text-gray-600">Total Points:</span>
//                               <span className="font-medium text-gray-600">{user.rewardPoints || 0}</span>
//                             </div>
//                           </div>
//                         </div>
//                       )}
                      
//                       <div>
//                         <h2 className="text-lg font-semibold mb-4 flex items-center">
//                           <Star size={20} className="mr-2 text-gray-600" />
//                           About Rewards
//                         </h2>
//                         <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
//                           <p className="text-gray-700 leading-relaxed">
//                             Earn points for every food purchase and redeem them for special rewards. 
//                             Points are calculated based on your order total:
//                           </p>
//                           <ul className="mt-2 space-y-1 text-gray-700 list-disc pl-5">
//                             <li>2% points for orders up to Rs 300</li>
//                             <li>4% points for orders between Rs 301-700</li>
//                             <li>5% points for orders above Rs 700</li>
//                           </ul>
//                           <div className="mt-4 flex space-x-4">
//                             <button 
//                               onClick={() => setActiveTab('rewards')}
//                               className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
//                             >
//                               Redeem Points
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
                  
//                   {activeTab === 'rewards' && (
//                     <div>
//                       <div className="flex items-center justify-between mb-6">
//                         <h2 className="text-lg font-semibold flex items-center">
//                           <Star size={20} className="mr-2 text-gray-600" />
//                           Available Rewards
//                         </h2>
//                         <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full flex items-center text-sm font-medium">
//                           <Star size={16} className="mr-1 text-yellow-500" />
//                           {user.rewardPoints || 0} points available
//                         </div>
//                       </div>
                      
//                       <div className="space-y-4">
//                         {/* Free Coffee Reward */}
//                         <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition">
//                           <div className="flex justify-between items-center">
//                             <div className="flex items-center">
//                               <div className="bg-gray-100 p-3 rounded-full text-gray-600 mr-4">
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                   <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
//                                   <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
//                                   <line x1="6" x2="6" y1="2" y2="4"></line>
//                                   <line x1="10" x2="10" y1="2" y2="4"></line>
//                                   <line x1="14" x2="14" y1="2" y2="4"></line>
//                                 </svg>
//                               </div>
//                               <div>
//                                 <h3 className="font-semibold text-gray-800 mb-1">Free Coffee</h3>
//                                 <p className="text-sm text-gray-500"> Expires in 30 days after redemption.</p>
//                               </div>
//                             </div>
//                             <div className="flex items-center">
//                               <span className="mr-3 font-medium text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded-full">
//                                 200 pts
//                               </span>
//                             </div>
//                           </div>
//                           <div className="mt-4 flex justify-end">
//                             <button 
//                               className={`px-4 py-2 ${user.rewardPoints >= 200 ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} rounded-md transition text-sm`}
//                               disabled={user.rewardPoints < 200}
//                             >
//                               {user.rewardPoints >= 200 ? 'Redeem Now' : `Need ${200 - (user.rewardPoints || 0)} more points`}
//                             </button>
//                           </div>
//                         </div>
                        
//                         {/* Free Pizza Reward */}
//                         <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition">
//                           <div className="flex justify-between items-center">
//                             <div className="flex items-center">
//                               <div className="bg-gray-100 p-3 rounded-full text-gray-600 mr-4">
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                   <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
//                                   <path d="m7 10.5 1.5 1.5"></path>
//                                   <path d="m10.5 7 1.5 1.5"></path>
//                                   <path d="m7 16.5 1.5-1.5"></path>
//                                   <path d="m10.5 19 1.5-1.5"></path>
//                                   <path d="m16.5 7 -1.5 1.5"></path>
//                                   <path d="m13.5 9.5 -1.5 1.5"></path>
//                                   <path d="m16.5 16.5 -1.5-1.5"></path>
//                                   <path d="m13.5 14.5 -1.5-1.5"></path>
//                                 </svg>
//                               </div>
//                               <div>
//                                 <h3 className="font-semibold text-gray-800 mb-1">Free Pizza</h3>
//                                 <p className="text-sm text-gray-500">Medium size with two toppings of your choice.</p>
//                               </div>
//                             </div>
//                             <div className="flex items-center">
//                               <span className="mr-3 font-medium text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded-full">
//                                 500 pts
//                               </span>
//                             </div>
//                           </div>
//                           <div className="mt-4 flex justify-end">
//                             <button 
//                               className={`px-4 py-2 ${user.rewardPoints >= 500 ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} rounded-md transition text-sm`}
//                               disabled={user.rewardPoints < 500}
//                             >
//                               {user.rewardPoints >= 500 ? 'Redeem Now' : `Need ${500 - (user.rewardPoints || 0)} more points`}
//                             </button>
//                           </div>
//                         </div>
                        
//                         {/* Premium Item Reward */}
//                         <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition">
//                           <div className="flex justify-between items-center">
//                             <div className="flex items-center">
//                               <div className="bg-gray-100 p-3 rounded-full text-gray-600 mr-4">
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                   <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
//                                 </svg>
//                               </div>
//                               <div>
//                                 <h3 className="font-semibold text-gray-800 mb-1">Premium Item</h3>
//                                 <p className="text-sm text-gray-500">One free premium menu item of your choice.</p>
//                               </div>
//                             </div>
//                             <div className="flex items-center">
//                               <span className="mr-3 font-medium text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded-full">
//                                 1000 pts
//                               </span>
//                             </div>
//                           </div>
//                           <div className="mt-4 flex justify-end">
//                             <button 
//                               className={`px-4 py-2 ${user.rewardPoints >= 1000 ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} rounded-md transition text-sm`}
//                               disabled={user.rewardPoints < 1000}
//                             >
//                               {user.rewardPoints >= 1000 ? 'Redeem Now' : `Need ${1000 - (user.rewardPoints || 0)} more points`}
//                             </button>
//                           </div>
//                         </div>
                        
//                         <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
//                           <p className="text-gray-600 text-sm">
//                             Points expire 12 months after they are earned. Enjoy Reword.
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




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

  useEffect(() => {
    fetchUserProfile();
  }, []);

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

    if (!window.confirm('Are you sure you want to delete your profile image?')) {
      return;
    }

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
    }
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
                      
                      <div>
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                          <Star size={20} className="mr-2 text-gray-600" />
                          About Rewards
                        </h2>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <p className="text-gray-700 leading-relaxed">
                            Earn points for every food purchase and redeem them for special rewards. 
                            Points are calculated based on your order total:
                          </p>
                          <ul className="mt-2 space-y-1 text-gray-700 list-disc pl-5">
                            <li>2% points for orders up to Rs 300</li>
                            <li>4% points for orders between Rs 301-700</li>
                            <li>5% points for orders above Rs 700</li>
                          </ul>
                          <div className="mt-4 flex space-x-4">
                            <button 
                              onClick={() => setActiveTab('rewards')}
                              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                            >
                              Redeem Points
                            </button>
                          </div>
                        </div>
                      </div>
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
                      
                      <div className="space-y-4">
                        {/* Free Coffee Reward */}
                        <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="bg-gray-100 p-3 rounded-full text-gray-600 mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
                                  <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
                                  <line x1="6" x2="6" y1="2" y2="4"></line>
                                  <line x1="10" x2="10" y1="2" y2="4"></line>
                                  <line x1="14" x2="14" y1="2" y2="4"></line>
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-800 mb-1">Free Coffee</h3>
                                <p className="text-sm text-gray-500"> Expires in 30 days after redemption.</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-3 font-medium text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded-full">
                                200 pts
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <button 
                              className={`px-4 py-2 ${user.rewardPoints >= 200 ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} rounded-md transition text-sm`}
                              disabled={user.rewardPoints < 200}
                            >
                              {user.rewardPoints >= 200 ? 'Redeem Now' : `Need ${200 - (user.rewardPoints || 0)} more points`}
                            </button>
                          </div>
                        </div>
                        
                        {/* Free Pizza Reward */}
                        <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="bg-gray-100 p-3 rounded-full text-gray-600 mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                                  <path d="m7 10.5 1.5 1.5"></path>
                                  <path d="m10.5 7 1.5 1.5"></path>
                                  <path d="m7 16.5 1.5-1.5"></path>
                                  <path d="m10.5 19 1.5-1.5"></path>
                                  <path d="m16.5 7 -1.5 1.5"></path>
                                  <path d="m13.5 9.5 -1.5 1.5"></path>
                                  <path d="m16.5 16.5 -1.5-1.5"></path>
                                  <path d="m13.5 14.5 -1.5-1.5"></path>
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-800 mb-1">Free Pizza</h3>
                                <p className="text-sm text-gray-500">Medium size with two toppings of your choice.</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-3 font-medium text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded-full">
                                500 pts
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <button 
                              className={`px-4 py-2 ${user.rewardPoints >= 500 ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} rounded-md transition text-sm`}
                              disabled={user.rewardPoints < 500}
                            >
                              {user.rewardPoints >= 500 ? 'Redeem Now' : `Need ${500 - (user.rewardPoints || 0)} more points`}
                            </button>
                          </div>
                        </div>
                        
                        {/* Premium Item Reward */}
                        <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="bg-gray-100 p-3 rounded-full text-gray-600 mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-800 mb-1">Premium Item</h3>
                                <p className="text-sm text-gray-500">One free premium menu item of your choice.</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-3 font-medium text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded-full">
                                1000 pts
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <button 
                              className={`px-4 py-2 ${user.rewardPoints >= 1000 ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} rounded-md transition text-sm`}
                              disabled={user.rewardPoints < 1000}
                            >
                              {user.rewardPoints >= 1000 ? 'Redeem Now' : `Need ${1000 - (user.rewardPoints || 0)} more points`}
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <p className="text-gray-600 text-sm">
                            Points expire 12 months after they are earned. Enjoy Reward.
                          </p>
                        </div>
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
                    onClick={() => togglePasswordVisibility('current')}
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
    </div>
  );
}