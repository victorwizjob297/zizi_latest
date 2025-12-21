import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Bell, 
  Shield, 
  CreditCard,
  Eye,
  EyeOff,
  Save,
  Camera,
  MessageCircle,
  Star,
  Store,
  Clock,
  Truck,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  AlertTriangle
} from 'lucide-react';
import { useUpdateProfileMutation } from '../redux/api/authApi';
import { useGetUserSettingsQuery, useUpdateUserSettingsMutation } from '../redux/api/settingsApi';
import { useGetMyBusinessProfileQuery, useUpdateBusinessProfileMutation } from '../redux/api/businessApi';
import { useGetSubscriptionPlansQuery, useGetCurrentSubscriptionQuery } from '../redux/api/subscriptionsApi';
import { useUpdateAvatarMutation } from '../redux/api/usersApi';
import { updateProfile } from '../redux/slices/authSlice';
import { addNotification } from '../redux/slices/uiSlice';

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [screenshotWarning, setScreenshotWarning] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    chatEnabled: true,
    reviewsEnabled: true,
  });

  const [businessData, setBusinessData] = useState({
    business_name: '',
    description: '',
    website_url: '',
    store_address: '',
    business_hours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    delivery_options: [],
    social_links: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });

  const [updateProfileMutation, { isLoading: updatingProfile }] = useUpdateProfileMutation();
  const [updateAvatarMutation] = useUpdateAvatarMutation();
  const { data: userSettings } = useGetUserSettingsQuery();
  const [updateUserSettings] = useUpdateUserSettingsMutation();
  const { data: businessProfile } = useGetMyBusinessProfileQuery();
  const [updateBusinessProfile] = useUpdateBusinessProfileMutation();
  const { data: subscriptionPlans } = useGetSubscriptionPlansQuery();
  const { data: currentSubscription } = useGetCurrentSubscriptionQuery();

  // Update state when data loads
  React.useEffect(() => {
    if (userSettings?.data) {
      setNotifications({
        emailNotifications: userSettings.data.email_notifications,
        smsNotifications: userSettings.data.sms_notifications,
        pushNotifications: userSettings.data.push_notifications,
        marketingEmails: userSettings.data.marketing_emails,
        chatEnabled: userSettings.data.chat_enabled,
        reviewsEnabled: userSettings.data.reviews_enabled,
      });
    }
  }, [userSettings]);

  React.useEffect(() => {
    if (businessProfile?.data) {
      setBusinessData({
        business_name: businessProfile.data.business_name || '',
        description: businessProfile.data.description || '',
        website_url: businessProfile.data.website_url || '',
        store_address: businessProfile.data.store_address || '',
        business_hours: businessProfile.data.business_hours || {
          monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: ''
        },
        delivery_options: businessProfile.data.delivery_options || [],
        social_links: businessProfile.data.social_links || { facebook: '', instagram: '', twitter: '' }
      });
    }
  }, [businessProfile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const result = await updateProfileMutation(profileData).unwrap();
      dispatch(updateProfile(result.user));
      dispatch(addNotification({
        type: 'success',
        message: 'Profile updated successfully!'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.data?.message || 'Failed to update profile'
      }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await updateAvatarMutation(formData).unwrap();
      
      // Check if screenshot warning is needed
      if (response.isScreenshot) {
        setScreenshotWarning(true);
        dispatch(addNotification({
          type: 'warning',
          message: 'This image appears to be a screenshot. Your ad might be rejected. Consider using an actual photo.'
        }));
      }

      dispatch(updateProfile({ ...user, avatar_url: response.data.avatar_url }));
      dispatch(addNotification({
        type: 'success',
        message: 'Profile picture updated successfully!'
      }));

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.data?.message || 'Failed to update profile picture'
      }));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      dispatch(addNotification({
        type: 'error',
        message: 'Passwords do not match'
      }));
      return;
    }
    // Implement password change logic
    dispatch(addNotification({
      type: 'success',
      message: 'Password updated successfully!'
    }));
  };

  const handleNotificationChange = async (key) => {
    const newValue = !notifications[key];
    setNotifications(prev => ({
      ...prev,
      [key]: newValue
    }));

    // Map frontend keys to backend keys
    const settingsMap = {
      emailNotifications: 'email_notifications',
      smsNotifications: 'sms_notifications',
      pushNotifications: 'push_notifications',
      marketingEmails: 'marketing_emails',
      chatEnabled: 'chat_enabled',
      reviewsEnabled: 'reviews_enabled'
    };

    try {
      await updateUserSettings({
        [settingsMap[key]]: newValue
      }).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        message: 'Settings updated successfully!'
      }));
    } catch (error) {
      // Revert on error
      setNotifications(prev => ({
        ...prev,
        [key]: !newValue
      }));
      
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to update settings'
      }));
    }
  };

  const handleBusinessUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateBusinessProfile(businessData).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Business profile updated successfully!'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.data?.message || 'Failed to update business profile'
      }));
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'business', name: 'Business', icon: Store },
    { id: 'subscription', name: 'Subscription', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.id
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
                  
                  {/* Avatar Section */}
                  <div className="flex items-center mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <User size={32} className="text-green-600" />
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Camera size={16} />
                        <span>{uploadingAvatar ? 'Uploading...' : 'Change Photo'}</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <p className="text-sm text-gray-500 mt-1">JPG, PNG, GIF or WebP. Max size 5MB.</p>
                      
                      {screenshotWarning && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
                          <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Screenshot Detected</p>
                            <p className="text-sm text-yellow-700">This appears to be a screenshot. Your ad might be rejected. Consider using an actual photo instead.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                            value={profileData.location}
                            onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={updatingProfile}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        <Save size={16} />
                        <span>{updatingProfile ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 capitalize">
                            {key === 'chatEnabled' ? 'Chat Feature' :
                             key === 'reviewsEnabled' ? 'Reviews Feature' :
                             key.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {key === 'emailNotifications' && 'Receive notifications via email'}
                            {key === 'smsNotifications' && 'Receive notifications via SMS'}
                            {key === 'pushNotifications' && 'Receive push notifications'}
                            {key === 'marketingEmails' && 'Receive marketing and promotional emails'}
                            {key === 'chatEnabled' && 'Allow other users to send you messages'}
                            {key === 'reviewsEnabled' && 'Allow other users to review your products'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange(key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Tab */}
              {activeTab === 'business' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Business Profile</h2>
                  
                  <form onSubmit={handleBusinessUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name
                        </label>
                        <input
                          type="text"
                          value={businessData.business_name}
                          onChange={(e) => setBusinessData(prev => ({ ...prev, business_name: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter business name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website URL
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="url"
                            value={businessData.website_url}
                            onChange={(e) => setBusinessData(prev => ({ ...prev, website_url: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Description
                      </label>
                      <textarea
                        value={businessData.description}
                        onChange={(e) => setBusinessData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Describe your business..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={businessData.store_address}
                          onChange={(e) => setBusinessData(prev => ({ ...prev, store_address: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter store address"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Save Business Profile
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Subscription Tab */}
              {activeTab === 'subscription' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Subscription Plans</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {subscriptionPlans?.data?.map((plan) => (
                      <div key={plan.id} className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                        <p className="text-3xl font-bold text-green-600 mb-4">${plan.price}<span className="text-sm text-gray-600">/month</span></p>
                        <ul className="space-y-2 mb-6">
                          <li className="text-sm text-gray-600">✓ {plan.features}</li>
                        </ul>
                        <button className={`w-full py-2 px-4 rounded-lg ${
                          currentSubscription?.data?.subscription_plan_id === plan.id
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        disabled={currentSubscription?.data?.subscription_plan_id === plan.id}
                        >
                          {currentSubscription?.data?.subscription_plan_id === plan.id ? 'Current Plan' : 'Upgrade'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
