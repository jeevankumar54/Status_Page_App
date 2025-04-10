import api from '../lib/api';

/**
 * Authentication service for handling user authentication and registration
 */
const authService = {
  /**
   * Login a user with email and password
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} - User data and token
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/api/v1/auth/login', credentials);
      
      // Store token in localStorage
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      
      return {
        token: response.data.access_token,
        user: response.data.user,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.full_name - User's full name
   * @param {Object} userData.organization - Organization data for new users
   * @returns {Promise<Object>} - User data and token
   */
  register: async (userData) => {
    try {
      const response = await api.post('/api/v1/auth/register', userData);
      
      // Store token in localStorage
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      
      return {
        token: response.data.access_token,
        user: response.data.user,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Get the currently logged in user
   * @returns {Promise<Object>} - User data
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/v1/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  /**
   * Logout the current user
   */
  logout: () => {
    localStorage.removeItem('token');
  },

  /**
   * Request a password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} - Response data
   */
  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/api/v1/auth/password-reset', { email });
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param {Object} resetData - Password reset data
   * @param {string} resetData.token - Reset token
   * @param {string} resetData.password - New password
   * @returns {Promise<Object>} - Response data
   */
  resetPassword: async (resetData) => {
    try {
      const response = await api.post('/api/v1/auth/reset-password', resetData);
      return response.data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - User profile data to update
   * @returns {Promise<Object>} - Updated user data
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/api/v1/auth/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.old_password - Current password
   * @param {string} passwordData.new_password - New password
   * @returns {Promise<Object>} - Response data
   */
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/api/v1/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },
};

export default authService;