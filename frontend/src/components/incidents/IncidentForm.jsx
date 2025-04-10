import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { INCIDENT_STATUSES, INCIDENT_STATUS_LABELS } from '../../lib/utils';

const IncidentForm = ({ 
  incident = null, 
  services = [], 
  onSubmit, 
  onCancel,
  isMaintenanceMode = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    status: isMaintenanceMode ? 'maintenance' : INCIDENT_STATUSES.INVESTIGATING,
    impact: 'minor',
    message: '',
    serviceIds: [],
    type: isMaintenanceMode ? 'maintenance' : 'incident',
    scheduledStartTime: '',
    scheduledEndTime: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form if editing existing incident
  useEffect(() => {
    if (incident) {
      setFormData({
        title: incident.title || '',
        status: incident.status || (isMaintenanceMode ? 'maintenance' : INCIDENT_STATUSES.INVESTIGATING),
        impact: incident.impact || 'minor',
        message: '',  // Always empty for updates
        serviceIds: incident.services?.map(s => s.id) || [],
        type: incident.type || (isMaintenanceMode ? 'maintenance' : 'incident'),
        scheduledStartTime: incident.scheduled_start_time || '',
        scheduledEndTime: incident.scheduled_end_time || '',
      });
    }
  }, [incident, isMaintenanceMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => {
      const currentServices = [...prev.serviceIds];
      const serviceIndex = currentServices.indexOf(serviceId);
      
      if (serviceIndex === -1) {
        // Add the service
        currentServices.push(serviceId);
      } else {
        // Remove the service
        currentServices.splice(serviceIndex, 1);
      }
      
      return {
        ...prev,
        serviceIds: currentServices
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.message.trim() && !incident) {
      newErrors.message = 'Message is required';
    }
    
    if (formData.serviceIds.length === 0) {
      newErrors.serviceIds = 'Please select at least one affected service';
    }

    // Validate scheduled times for maintenance
    if (formData.type === 'maintenance') {
      if (!formData.scheduledStartTime) {
        newErrors.scheduledStartTime = 'Start time is required for maintenance';
      }
      
      if (!formData.scheduledEndTime) {
        newErrors.scheduledEndTime = 'End time is required for maintenance';
      }
      
      if (formData.scheduledStartTime && formData.scheduledEndTime) {
        const startTime = new Date(formData.scheduledStartTime);
        const endTime = new Date(formData.scheduledEndTime);
        
        if (startTime >= endTime) {
          newErrors.scheduledEndTime = 'End time must be after start time';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting incident:', error);
      setErrors({ submit: 'Failed to save incident. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine form title and button text
  const formTitle = incident 
    ? 'Update Incident' 
    : (isMaintenanceMode ? 'Schedule Maintenance' : 'Report Incident');
  
  const submitButtonText = incident 
    ? 'Update' 
    : (isMaintenanceMode ? 'Schedule Maintenance' : 'Create Incident');

  return (
    <form onSubmit={handleSubmit}>
      {errors.submit && (
        <div className="mb-4 p-3 bg-danger-50 border-l-4 border-danger-500 text-danger-700 rounded">
          {errors.submit}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
            Title <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${
              errors.title ? 'border-danger-500' : 'border-neutral-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
            placeholder={isMaintenanceMode ? "Scheduled Database Maintenance" : "API Service Disruption"}
          />
          {errors.title && <p className="mt-1 text-sm text-danger-600">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {isMaintenanceMode ? (
                <option value="maintenance">Scheduled Maintenance</option>
              ) : (
                Object.entries(INCIDENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div>
            <label htmlFor="impact" className="block text-sm font-medium text-neutral-700 mb-1">
              Impact
            </label>
            <select
              id="impact"
              name="impact"
              value={formData.impact}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="minor">Minor</option>
              <option value="major">Major</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {formData.type === 'maintenance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="scheduledStartTime" className="block text-sm font-medium text-neutral-700 mb-1">
                Scheduled Start Time <span className="text-danger-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="scheduledStartTime"
                name="scheduledStartTime"
                value={formData.scheduledStartTime}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  errors.scheduledStartTime ? 'border-danger-500' : 'border-neutral-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              />
              {errors.scheduledStartTime && <p className="mt-1 text-sm text-danger-600">{errors.scheduledStartTime}</p>}
            </div>
            
            <div>
              <label htmlFor="scheduledEndTime" className="block text-sm font-medium text-neutral-700 mb-1">
                Scheduled End Time <span className="text-danger-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="scheduledEndTime"
                name="scheduledEndTime"
                value={formData.scheduledEndTime}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  errors.scheduledEndTime ? 'border-danger-500' : 'border-neutral-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              />
              {errors.scheduledEndTime && <p className="mt-1 text-sm text-danger-600">{errors.scheduledEndTime}</p>}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1">
            Message <span className="text-danger-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${
              errors.message ? 'border-danger-500' : 'border-neutral-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
            placeholder={incident 
              ? "Provide an update on the current situation..." 
              : (isMaintenanceMode 
                ? "We'll be performing scheduled maintenance on our database servers..." 
                : "We're investigating reports of increased latency..."
              )
            }
          ></textarea>
          {errors.message && <p className="mt-1 text-sm text-danger-600">{errors.message}</p>}
        </div>

        <div>
          <span className="block text-sm font-medium text-neutral-700 mb-1">
            Affected Services <span className="text-danger-500">*</span>
          </span>
          {errors.serviceIds && <p className="mt-1 text-sm text-danger-600">{errors.serviceIds}</p>}
          
          <div className="mt-2 space-y-2">
            {services.length === 0 ? (
              <p className="text-sm text-neutral-500">No services available. Please create services first.</p>
            ) : (
              services.map((service) => (
                <div key={service.id} className="flex items-center">
                  <input
                    id={`service-${service.id}`}
                    name={`service-${service.id}`}
                    type="checkbox"
                    checked={formData.serviceIds.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  />
                  <label htmlFor={`service-${service.id}`} className="ml-2 block text-sm text-neutral-700">
                    {service.name}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default IncidentForm;