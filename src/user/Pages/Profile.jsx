import React, { useState } from 'react';
import { Star, Coffee, Pizza, Apple, Salad, ChevronRight, User, Settings, Bell, LogOut, ShoppingBag, Upload, Edit, Trash2 } from 'lucide-react';
import Navbar from "../components/Navbar";

export default function UserProfile() {
  const [user] = useState({
    name: "Rohan Magar",
    email: "rohan123@gmail.com",
    rewardPoints: 350,
  });

  const [activeTab, setActiveTab] = useState("profile");
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [imageUploadSuccess, setImageUploadSuccess] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
        setImageUploadSuccess(true);
        // Hide success message after 3 seconds
        setTimeout(() => setImageUploadSuccess(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setShowImageOptions(false);
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const renderFoodIcon = (food) => {
    switch(food) {
      case "Coffee": return <Coffee className="text-gray-700" />;
      case "Pizza": return <Pizza className="text-gray-700" />;
      case "Apple": return <Apple className="text-gray-700" />;
      case "Salad": return <Salad className="text-gray-700" />;
      default: return <Coffee className="text-gray-700" />;
    }
  };

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
                
                <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
                <p className="text-gray-100 mb-4">{user.email}</p>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center mb-4">
                  <Star size={16} className="text-yellow-300 mr-2" />
                  <span className="font-bold">{user.rewardPoints} points</span>
                </div>
                <button 
                  onClick={toggleEditing}
                  className="flex items-center px-4 py-2 bg-gray-800 bg-opacity-40 text-white rounded-md hover:bg-gray-800 transition"
                >
                  <Edit size={16} className="mr-2" />
                  Edit Profile
                </button>
                
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
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <div className="mb-4">
                            <label className="block text-gray-600 mb-1 font-medium">Name</label>
                            <input 
                              type="text" 
                              defaultValue={user.name} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-600 mb-1 font-medium">Email</label>
                            <input 
                              type="email" 
                              defaultValue={user.email} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
                            />
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
                          </div>
                          <div className="flex justify-end space-x-3 mt-6">
                            <button 
                              onClick={toggleEditing}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={toggleEditing}
                              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
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
                            <span className="font-medium">{user.name}</span>
                          </div>
                          <div className="flex justify-between py-3 border-b border-gray-200">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{user.email}</span>
                          </div>
                          <div className="flex justify-between py-3">
                            <span className="text-gray-600">Total Points:</span>
                            <span className="font-medium text-gray-600">{user.rewardPoints}</span>
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
                          Check your purchase history and available rewards in the other tabs.
                        </p>
                        <div className="mt-4 flex space-x-4">
                          <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition">
                            Redeem Points
                          </button>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition">
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'history' && (
                  <div>
                    <h2 className="text-lg font-semibold mb-6 flex items-center">
                      <ShoppingBag size={20} className="mr-2 text-gray-600" />
                      Purchase History
                    </h2>
                    
                    {user.history.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <ShoppingBag size={40} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No purchase history available yet.</p>
                        <button className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition">
                          Shop Now
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {user.history.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center">
                              <div className="bg-gray-100 p-3 rounded-full text-gray-600">
                                {renderFoodIcon(item.item)}
                              </div>
                              <div className="ml-4">
                                <p className="font-medium text-gray-800">{item.item}</p>
                                <p className="text-sm text-gray-500">{item.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                                +{item.points} pts
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        <div className="mt-6">
                          <button className="w-full py-3 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition flex items-center justify-center">
                            <span>View All History</span>
                            <ChevronRight size={16} className="ml-1" />
                          </button>
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
                        <Star size={16} className="mr-1" />
                        {user.rewardPoints} points available
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="bg-gray-100 p-3 rounded-full text-gray-600 mr-4">
                              <Coffee size={24} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800 mb-1">Free Coffee</h3>
                              <p className="text-sm text-gray-500">Valid at any location. Expires in 30 days after redemption.</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-3 font-medium text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded-full">
                              200 pts
                            </span>
                            <button className="bg-gray-600 hover:bg-gray-700 text-white rounded-full p-1 transition">
                              <ChevronRight size={18} />
                            </button>
                          </div>
                        </div>
                        {user.rewardPoints >= 200 && (
                          <div className="mt-4 flex justify-end">
                            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition text-sm">
                              Redeem Now
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="bg-gray-100 p-3 rounded-full text-gray-600 mr-4">
                              <Pizza size={24} />
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
                            <button className="bg-gray-600 hover:bg-gray-700 text-white rounded-full p-1 transition">
                              <ChevronRight size={18} />
                            </button>
                          </div>
                        </div>
                        {user.rewardPoints >= 500 && (
                          <div className="mt-4 flex justify-end">
                            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition text-sm">
                              Redeem Now
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="bg-gray-100 p-3 rounded-full text-gray-600 mr-4">
                              <Star size={24} />
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
                            <button className="bg-gray-600 hover:bg-gray-700 text-white rounded-full p-1 transition">
                              <ChevronRight size={18} />
                            </button>
                          </div>
                        </div>
                        {user.rewardPoints >= 1000 && (
                          <div className="mt-4 flex justify-end">
                            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition text-sm">
                              Redeem Now
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-gray-600 text-sm">
                        Points expire 12 months after they are earned. See our <a href="#" className="text-gray-600 hover:underline">terms and conditions</a> for more details.
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
    </div>
  );
}
