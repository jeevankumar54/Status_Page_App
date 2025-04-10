import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import CurrentStatus from '../../components/statusPage/CurrentStatus';
import IncidentHistory from '../../components/statusPage/IncidentHistory';
import api from '../../lib/api';
import useWebSocket from '../../hooks/useWebSocket';

const StatusPage = () => {
  const { slug } = useParams();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const organizationSlug = slug || 'default'; // Fallback to 'default' if no slug provided
  
  // Websocket for real-time updates
  const { isConnected, lastMessage } = useWebSocket(`/ws/public/${organizationSlug}`);

  // Fetch organization status
  const { 
    data: orgStatus, 
    isLoading: isLoadingStatus, 
    error: statusError,
    refetch: refetchStatus
  } = useQuery(
    ['organization-status', organizationSlug],
    async () => {
      const response = await api.get(`/public/${organizationSlug}/status`);
      return response.data;
    },
    {
      staleTime: 60000, // 1 minute
      refetchInterval: 300000, // 5 minutes
      retry: 2,
    }
  );

  // Fetch services
  const { 
    data: services, 
    isLoading: isLoadingServices, 
    error: servicesError,
    refetch: refetchServices
  } = useQuery(
    ['public-services', organizationSlug],
    async () => {
      const response = await api.get(`/public/${organizationSlug}/services`);
      return response.data;
    },
    {
      staleTime: 60000, // 1 minute
      refetchInterval: 300000, // 5 minutes
      retry: 2,
    }
  );

  // Fetch active incidents
  const { 
    data: activeIncidents, 
    isLoading: isLoadingIncidents, 
    error: incidentsError,
    refetch: refetchIncidents
  } = useQuery(
    ['public-active-incidents', organizationSlug],
    async () => {
      const response = await api.get(`/public/${organizationSlug}/incidents/active`);
      return response.data;
    },
    {
      staleTime: 60000, // 1 minute
      refetchInterval: 300000, // 5 minutes
      retry: 2,
    }
  );

  // Fetch recent incidents
  const { 
    data: recentIncidents, 
    isLoading: isLoadingRecentIncidents,
    error: recentIncidentsError,
    refetch: refetchRecentIncidents
  } = useQuery(
    ['public-recent-incidents', organizationSlug],
    async () => {
      const response = await api.get(`/public/${organizationSlug}/incidents/recent`);
      return response.data;
    },
    {
      staleTime: 60000, // 1 minute
      refetchInterval: 300000, // 5 minutes
      retry: 2,
    }
  );

  // Handle websocket updates
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = typeof lastMessage === 'string' ? JSON.parse(lastMessage) : lastMessage;
        
        // Handle different event types
        switch (data.type) {
          case 'service_status_changed':
          case 'service_created':
          case 'service_updated':
          case 'service_deleted':
            refetchServices();
            refetchStatus();
            setLastUpdated(new Date());
            break;
            
          case 'incident_created':
          case 'incident_updated':
          case 'incident_status_changed':
          case 'incident_deleted':
          case 'incident_update_added':
            refetchIncidents();
            refetchRecentIncidents();
            setLastUpdated(new Date());
            break;
            
          default:
            console.log('Unknown websocket event type:', data.type);
        }
      } catch (error) {
        console.error('Error handling websocket message:', error);
      }
    }
  }, [lastMessage, refetchServices, refetchStatus, refetchIncidents, refetchRecentIncidents]);

  // Loading state
  const isLoading = isLoadingStatus || isLoadingServices || isLoadingIncidents || isLoadingRecentIncidents;
  
  // Error state
  const hasError = statusError || servicesError || incidentsError || recentIncidentsError;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Organization header */}
      {orgStatus && (
        <div className="mb-8 text-center">
          {orgStatus.organization.logo_url && (
            <img 
              src={orgStatus.organization.logo_url} 
              alt={`${orgStatus.organization.name} logo`} 
              className="h-16 mx-auto mb-4"
            />
          )}
          <h1 className="text-3xl font-bold text-neutral-900">{orgStatus.organization.name} Status</h1>
          {orgStatus.organization.website && (
            <a 
              href={orgStatus.organization.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-800 text-sm"
            >
              {orgStatus.organization.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      )}
      
      {isLoading ? (
        <div className="p-8 bg-white rounded-lg shadow">
          <div className="flex justify-center items-center h-32">
            <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      ) : hasError ? (
        <div className="p-8 bg-white rounded-lg shadow text-center">
          <svg className="h-12 w-12 text-danger-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-medium text-neutral-900 mb-2">Failed to load status information</h2>
          <p className="text-neutral-500 mb-4">Please try again later or contact support.</p>
          <button 
            onClick={() => {
              refetchStatus();
              refetchServices();
              refetchIncidents();
              refetchRecentIncidents();
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Current Status section */}
          <CurrentStatus 
            services={services || []} 
            lastUpdated={lastUpdated}
          />
          
          {/* Active Incidents section */}
          {activeIncidents && activeIncidents.length > 0 && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 border-b border-neutral-200 sm:px-6">
                <h2 className="text-lg font-medium text-neutral-900">Active Incidents</h2>
              </div>
              <div className="divide-y divide-neutral-200">
                <IncidentHistory 
                  incidents={activeIncidents} 
                  organizationSlug={organizationSlug}
                />
              </div>
            </div>
          )}
          
          {/* Past Incidents section */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 border-b border-neutral-200 sm:px-6">
              <h2 className="text-lg font-medium text-neutral-900">Past Incidents</h2>
            </div>
            <div className="divide-y divide-neutral-200">
              {recentIncidents && recentIncidents.length > 0 ? (
                <IncidentHistory 
                  incidents={recentIncidents.filter(incident => incident.status === 'resolved')} 
                  organizationSlug={organizationSlug}
                />
              ) : (
                <p className="p-6 text-neutral-500 text-center">No incidents in the past 90 days.</p>
              )}
            </div>
          </div>
          
          {/* Websocket status */}
          <div className="text-center text-xs text-neutral-500">
            {isConnected ? (
              <span className="flex items-center justify-center">
                <span className="inline-block w-2 h-2 rounded-full bg-success-500 mr-1"></span>
                Connected for live updates
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="inline-block w-2 h-2 rounded-full bg-neutral-300 mr-1"></span>
                Not connected for live updates
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusPage;