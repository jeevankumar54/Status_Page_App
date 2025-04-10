import api from '../lib/api';

/**
 * Service for managing incidents in the status page
 */
const incidentService = {
  /**
   * Get all incidents for the current organization
   * @param {Object} options - Query options
   * @param {boolean} options.activeOnly - Only return active incidents
   * @returns {Promise<Array>} - List of incidents
   */
  getIncidents: async (options = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (options.activeOnly) {
        params.append('active_only', 'true');
      }
      
      const response = await api.get(`/api/v1/incidents?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get incidents error:', error);
      throw error;
    }
  },

  /**
   * Get a single incident by ID
   * @param {number} id - Incident ID
   * @returns {Promise<Object>} - Incident data with updates
   */
  getIncidentById: async (id) => {
    try {
      const response = await api.get(`/api/v1/incidents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get incident ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Create a new incident
   * @param {Object} incidentData - Incident data
   * @param {string} incidentData.title - Incident title
   * @param {string} incidentData.status - Incident status
   * @param {string} incidentData.impact - Incident impact level
   * @param {string} incidentData.type - Incident type
   * @param {Array<number>} incidentData.service_ids - Affected service IDs
   * @param {string} incidentData.scheduled_start_time - Start time for maintenance
   * @param {string} incidentData.scheduled_end_time - End time for maintenance
   * @returns {Promise<Object>} - Created incident data
   */
  createIncident: async (incidentData) => {
    try {
      const response = await api.post('/api/v1/incidents', incidentData);
      return response.data;
    } catch (error) {
      console.error('Create incident error:', error);
      throw error;
    }
  },

  /**
   * Update an existing incident
   * @param {number} id - Incident ID
   * @param {Object} incidentData - Incident data to update
   * @returns {Promise<Object>} - Updated incident data
   */
  updateIncident: async (id, incidentData) => {
    try {
      const response = await api.put(`/api/v1/incidents/${id}`, incidentData);
      return response.data;
    } catch (error) {
      console.error(`Update incident ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Update just the status of an incident
   * @param {number} id - Incident ID
   * @param {string} status - New incident status
   * @returns {Promise<Object>} - Updated incident data
   */
  updateIncidentStatus: async (id, status) => {
    try {
      const response = await api.patch(`/api/v1/incidents/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Update incident ${id} status error:`, error);
      throw error;
    }
  },

  /**
   * Add an update to an incident
   * @param {number} id - Incident ID
   * @param {Object} updateData - Update data
   * @param {string} updateData.message - Update message
   * @param {string} updateData.status - New incident status
   * @param {boolean} updateData.is_public - Whether update is public
   * @returns {Promise<Object>} - Updated incident data with updates
   */
  addIncidentUpdate: async (id, updateData) => {
    try {
      const response = await api.post(`/api/v1/incidents/${id}/updates`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Add update to incident ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Delete an incident
   * @param {number} id - Incident ID
   * @returns {Promise<Object>} - Deleted incident data
   */
  deleteIncident: async (id) => {
    try {
      const response = await api.delete(`/api/v1/incidents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete incident ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Get active incidents for public view
   * @param {string} slug - Organization slug
   * @returns {Promise<Array>} - List of active incidents
   */
  getPublicActiveIncidents: async (slug) => {
    try {
      const response = await api.get(`/public/${slug}/incidents/active`);
      return response.data;
    } catch (error) {
      console.error(`Get public active incidents for ${slug} error:`, error);
      throw error;
    }
  },

  /**
   * Get recent incidents for public view
   * @param {string} slug - Organization slug
   * @param {number} limit - Number of incidents to return
   * @returns {Promise<Array>} - List of recent incidents
   */
  getPublicRecentIncidents: async (slug, limit = 10) => {
    try {
      const response = await api.get(`/public/${slug}/incidents/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error(`Get public recent incidents for ${slug} error:`, error);
      throw error;
    }
  },

  /**
   * Get public incident details
   * @param {string} slug - Organization slug
   * @param {number} id - Incident ID
   * @returns {Promise<Object>} - Incident data with public updates
   */
  getPublicIncidentById: async (slug, id) => {
    try {
      const response = await api.get(`/public/${slug}/incidents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get public incident ${id} for ${slug} error:`, error);
      throw error;
    }
  },
};

export default incidentService;