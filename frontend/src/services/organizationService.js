import api from '../lib/api';

/**
 * Service for managing organizations in the status page
 */
const organizationService = {
  /**
   * Get organizations for the current user
   * @returns {Promise<Array>} - List of organizations
   */
  getUserOrganizations: async () => {
    try {
      const response = await api.get('/api/v1/organizations');
      return response.data;
    } catch (error) {
      console.error('Get user organizations error:', error);
      throw error;
    }
  },

  /**
   * Get a single organization by ID
   * @param {number} id - Organization ID
   * @returns {Promise<Object>} - Organization data
   */
  getOrganizationById: async (id) => {
    try {
      const response = await api.get(`/api/v1/organizations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get organization ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Create a new organization
   * @param {Object} orgData - Organization data
   * @param {string} orgData.name - Organization name
   * @param {string} orgData.slug - Organization slug for public URL
   * @param {string} orgData.logo_url - Organization logo URL
   * @param {string} orgData.website - Organization website
   * @returns {Promise<Object>} - Created organization data
   */
  createOrganization: async (orgData) => {
    try {
      const response = await api.post('/api/v1/organizations', orgData);
      return response.data;
    } catch (error) {
      console.error('Create organization error:', error);
      throw error;
    }
  },

  /**
   * Update an existing organization
   * @param {number} id - Organization ID
   * @param {Object} orgData - Organization data to update
   * @returns {Promise<Object>} - Updated organization data
   */
  updateOrganization: async (id, orgData) => {
    try {
      const response = await api.put(`/api/v1/organizations/${id}`, orgData);
      return response.data;
    } catch (error) {
      console.error(`Update organization ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Delete an organization
   * @param {number} id - Organization ID
   * @returns {Promise<Object>} - Deleted organization data
   */
  deleteOrganization: async (id) => {
    try {
      const response = await api.delete(`/api/v1/organizations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete organization ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Get public organization status
   * @param {string} slug - Organization slug
   * @returns {Promise<Object>} - Organization status data
   */
  getPublicOrganizationStatus: async (slug) => {
    try {
      const response = await api.get(`/public/${slug}/status`);
      return response.data;
    } catch (error) {
      console.error(`Get public organization status for ${slug} error:`, error);
      throw error;
    }
  },
  
  /**
   * Add a user to an organization
   * @param {number} orgId - Organization ID
   * @param {string} email - User email to invite
   * @param {boolean} isAdmin - Whether to add as admin
   * @returns {Promise<Object>} - Response data
   */
  inviteUserToOrganization: async (orgId, email, isAdmin = false) => {
    try {
      const response = await api.post(`/api/v1/organizations/${orgId}/members`, {
        email,
        is_admin: isAdmin
      });
      return response.data;
    } catch (error) {
      console.error(`Invite user to organization ${orgId} error:`, error);
      throw error;
    }
  },
  
  /**
   * Remove a user from an organization
   * @param {number} orgId - Organization ID
   * @param {number} userId - User ID to remove
   * @returns {Promise<Object>} - Response data
   */
  removeUserFromOrganization: async (orgId, userId) => {
    try {
      const response = await api.delete(`/api/v1/organizations/${orgId}/members/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Remove user ${userId} from organization ${orgId} error:`, error);
      throw error;
    }
  }
};

export default organizationService;