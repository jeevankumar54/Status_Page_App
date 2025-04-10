import api from '../lib/api';

/**
 * Service for managing services in the status page
 */
const serviceService = {
  /**
   * Get all services for the current organization
   * @returns {Promise<Array>} - List of services
   */
  getServices: async () => {
    try {
      const response = await api.get('/api/v1/services');
      return response.data;
    } catch (error) {
      console.error('Get services error:', error);
      throw error;
    }
  },

  /**
   * Get a single service by ID
   * @param {number} id - Service ID
   * @returns {Promise<Object>} - Service data
   */
  getServiceById: async (id) => {
    try {
      const response = await api.get(`/api/v1/services/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get service ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Create a new service
   * @param {Object} serviceData - Service data
   * @param {string} serviceData.name - Service name
   * @param {string} serviceData.description - Service description
   * @param {string} serviceData.status - Service status
   * @param {number} serviceData.organization_id - Organization ID
   * @returns {Promise<Object>} - Created service data
   */
  createService: async (serviceData) => {
    try {
      const response = await api.post('/api/v1/services', serviceData);
      return response.data;
    } catch (error) {
      console.error('Create service error:', error);
      throw error;
    }
  },

  /**
   * Update an existing service
   * @param {number} id - Service ID
   * @param {Object} serviceData - Service data to update
   * @returns {Promise<Object>} - Updated service data
   */
  updateService: async (id, serviceData) => {
    try {
      const response = await api.put(`/api/v1/services/${id}`, serviceData);
      return response.data;
    } catch (error) {
      console.error(`Update service ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Update just the status of a service
   * @param {number} id - Service ID
   * @param {string} status - New service status
   * @returns {Promise<Object>} - Updated service data
   */
  updateServiceStatus: async (id, status) => {
    try {
      const response = await api.patch(`/api/v1/services/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Update service ${id} status error:`, error);
      throw error;
    }
  },

  /**
   * Delete a service
   * @param {number} id - Service ID
   * @returns {Promise<Object>} - Deleted service data
   */
  deleteService: async (id) => {
    try {
      const response = await api.delete(`/api/v1/services/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete service ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Get public services for an organization by slug
   * @param {string} slug - Organization slug
   * @returns {Promise<Array>} - List of services
   */
  getPublicServices: async (slug) => {
    try {
      const response = await api.get(`/public/${slug}/services`);
      return response.data;
    } catch (error) {
      console.error(`Get public services for ${slug} error:`, error);
      throw error;
    }
  },
};

export default serviceService;