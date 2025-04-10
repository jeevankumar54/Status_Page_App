import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Tab } from '@headlessui/react';
import IncidentList from '../../components/incidents/IncidentList';
import PageTitle from '../../components/common/PageTitle';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { useOrganization } from '../../hooks/useAuth';

const Incidents = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization || { currentOrganization: null };
  
  // Tab states
  const [activeTab, setActiveTab] = useState(0);

  // Fetch services for incident association
  const { data: services, isLoading: isLoadingServices } = useQuery(
    'services',
    async () => {
      const response = await api.get('/api/v1/services');
      return response.data;
    },
    {
      staleTime: 60000, // 1 minute
      onError: (error) => {
        console.error('Error fetching services:', error);
      },
    }
  );

  // Fetch all incidents
  const { data: incidents, isLoading: isLoadingIncidents, error: incidentsError } = useQuery(
    'incidents',
    async () => {
      const response = await api.get('/api/v1/incidents');
      return response.data;
    },
    {
      staleTime: 30000, // 30 seconds
      retry: 2,
      onError: (error) => {
        toast.error('Failed to load incidents');
        console.error('Error fetching incidents:', error);
      },
    }
  );

  // Create incident mutation
  const createIncidentMutation = useMutation(
    async (incidentData) => {
      const data = {
        ...incidentData,
        organization_id: currentOrganization?.id,
        service_ids: incidentData.serviceIds,
      };
      
      // Format dates for maintenance
      if (incidentData.type === 'maintenance') {
        data.scheduled_start_time = incidentData.scheduledStartTime;
        data.scheduled_end_time = incidentData.scheduledEndTime;
      }
      
      const response = await api.post('/api/v1/incidents', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('incidents');
        toast.success('Incident created successfully');
      },
      onError: (error) => {
        toast.error('Failed to create incident');
        console.error('Error creating incident:', error);
      },
    }
  );

  // Update incident mutation
  const updateIncidentMutation = useMutation(
    async ({ id, data }) => {
      const formattedData = {
        ...data,
        service_ids: data.serviceIds,
      };
      
      // Format dates for maintenance
      if (data.type === 'maintenance') {
        formattedData.scheduled_start_time = data.scheduledStartTime;
        formattedData.scheduled_end_time = data.scheduledEndTime;
      }
      
      const response = await api.put(`/api/v1/incidents/${id}`, formattedData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('incidents');
        toast.success('Incident updated successfully');
      },
      onError: (error) => {
        toast.error('Failed to update incident');
        console.error('Error updating incident:', error);
      },
    }
  );

  // Add incident update mutation
  const addIncidentUpdateMutation = useMutation(
    async ({ id, data }) => {
      const formattedData = {
        incident_id: id,
        message: data.message,
        status: data.status,
        is_public: true,
      };
      
      const response = await api.post(`/api/v1/incidents/${id}/updates`, formattedData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('incidents');
        toast.success('Incident update added');
      },
      onError: (error) => {
        toast.error('Failed to add incident update');
        console.error('Error adding incident update:', error);
      },
    }
  );

  // Delete incident mutation
  const deleteIncidentMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/api/v1/incidents/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('incidents');
        toast.success('Incident deleted successfully');
      },
      onError: (error) => {
        toast.error('Failed to delete incident');
        console.error('Error deleting incident:', error);
      },
    }
  );

  // Handler functions
  const handleCreateIncident = async (incidentData) => {
    // If there's a message, we need to save it separately as an update
    const { message, ...incidentPayload } = incidentData;
    
    try {
      // First create the incident
      const incident = await createIncidentMutation.mutateAsync(incidentPayload);
      
      // Then add the initial update
      if (message && incident.id) {
        await addIncidentUpdateMutation.mutateAsync({
          id: incident.id,
          data: {
            message,
            status: incidentPayload.status,
          },
        });
      }
      
      return incident;
    } catch (error) {
      console.error('Error in incident creation flow:', error);
      throw error;
    }
  };

  const handleUpdateIncident = async (id, incidentData) => {
    // If there's a message, we need to save it separately as an update
    const { message, ...incidentPayload } = incidentData;
    
    try {
      // First update the incident
      const incident = await updateIncidentMutation.mutateAsync({
        id,
        data: incidentPayload,
      });
      
      // Then add the update if provided
      if (message) {
        await addIncidentUpdateMutation.mutateAsync({
          id,
          data: {
            message,
            status: incidentPayload.status,
          },
        });
      }
      
      return incident;
    } catch (error) {
      console.error('Error in incident update flow:', error);
      throw error;
    }
  };

  const handleDeleteIncident = async (id) => {
    return deleteIncidentMutation.mutateAsync(id);
  };

  // Filter incidents for active tab
  const activeIncidents = React.useMemo(() => {
    if (!incidents) return [];
    return incidents.filter(incident => incident.status !== 'resolved');
  }, [incidents]);

  const maintenanceIncidents = React.useMemo(() => {
    if (!incidents) return [];
    return incidents.filter(incident => incident.type === 'maintenance');
  }, [incidents]);

  // Error state
  if (incidentsError) {
    return (
      <div className="space-y-6">
        <PageTitle title="Incidents" />
        <Card>
          <div className="p-4 text-center">
            <p className="text-danger-600">Failed to load incidents. Please try again later.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle 
        title="Incidents" 
        description="Manage your incidents and maintenance events"
      />

      <Tab.Group onChange={setActiveTab}>
        <Card noPadding>
          <Tab.List className="flex p-1 space-x-1 bg-neutral-50 border-b border-neutral-200">
            <Tab className={({ selected }) =>
              `w-full py-2.5 text-sm font-medium leading-5 rounded-t-lg
               ${selected 
                ? 'text-primary-700 border-b-2 border-primary-500' 
                : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'}`
            }>
              Active Incidents
            </Tab>
            <Tab className={({ selected }) =>
              `w-full py-2.5 text-sm font-medium leading-5 rounded-t-lg
               ${selected 
                ? 'text-primary-700 border-b-2 border-primary-500' 
                : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'}`
            }>
              All Incidents
            </Tab>
            <Tab className={({ selected }) =>
              `w-full py-2.5 text-sm font-medium leading-5 rounded-t-lg
               ${selected 
                ? 'text-primary-700 border-b-2 border-primary-500' 
                : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'}`
            }>
              Maintenance
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <IncidentList
                incidents={activeIncidents}
                services={services || []}
                isLoading={isLoadingIncidents || isLoadingServices}
                onCreateIncident={handleCreateIncident}
                onUpdateIncident={handleUpdateIncident}
                onDeleteIncident={handleDeleteIncident}
                showUnresolved={true}
              />
            </Tab.Panel>
            <Tab.Panel>
              <IncidentList
                incidents={incidents || []}
                services={services || []}
                isLoading={isLoadingIncidents || isLoadingServices}
                onCreateIncident={handleCreateIncident}
                onUpdateIncident={handleUpdateIncident}
                onDeleteIncident={handleDeleteIncident}
                showUnresolved={false}
              />
            </Tab.Panel>
            <Tab.Panel>
              <IncidentList
                incidents={maintenanceIncidents}
                services={services || []}
                isLoading={isLoadingIncidents || isLoadingServices}
                onCreateIncident={handleCreateIncident}
                onUpdateIncident={handleUpdateIncident}
                onDeleteIncident={handleDeleteIncident}
                showUnresolved={false}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Card>
      </Tab.Group>
    </div>
  );
};

export default Incidents;