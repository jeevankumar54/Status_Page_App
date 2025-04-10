import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { formatDate } from '../../lib/utils';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getOverallStatus, STATUS_LABELS, STATUS_COLORS, SERVICE_STATUSES } from '../../lib/utils';
import api from '../../lib/api';

const Dashboard = () => {
  // Fetch services
  const { data: services, isLoading: isLoadingServices } = useQuery(
    'services',
    async () => {
      const response = await api.get('/services');
      return response.data;
    },
    { staleTime: 60000 } // 1 minute
  );

  // Fetch active incidents
  const { data: incidents, isLoading: isLoadingIncidents } = useQuery(
    'active-incidents',
    async () => {
      const response = await api.get('/incidents', {
        params: { active_only: true }
      });
      return response.data;
    },
    { staleTime: 60000 } // 1 minute
  );

  // Calculate status counts
  const statusCounts = React.useMemo(() => {
    if (!services) return {};
    
    return services.reduce((acc, service) => {
      acc[service.status] = (acc[service.status] || 0) + 1;
      return acc;
    }, {});
  }, [services]);

  // Get overall system status
  const overallStatus = React.useMemo(() => {
    if (!services || services.length === 0) return SERVICE_STATUSES.OPERATIONAL;
    return getOverallStatus(services);
  }, [services]);

  // Status indicator component
  const StatusIndicator = ({ status }) => {
    const color = STATUS_COLORS[status] || 'neutral';
    const label = STATUS_LABELS[status] || 'Unknown';
    
    const bgColorClasses = {
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      danger: 'bg-danger-500',
      primary: 'bg-primary-500',
      neutral: 'bg-neutral-500',
    };
    
    const textColorClasses = {
      success: 'text-success-700',
      warning: 'text-warning-700',
      danger: 'text-danger-700',
      primary: 'text-primary-700',
      neutral: 'text-neutral-700',
    };

    return (
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${bgColorClasses[color]}`}></div>
        <span className={`font-medium ${textColorClasses[color]}`}>{label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <div className="flex space-x-2">
          <Link to="/admin/incidents/new">
            <Button 
              variant="primary"
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              }
            >
              New Incident
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Overview */}
      <Card 
        title="System Status" 
        headerActions={
          <Link to="/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              View Status Page
            </Button>
          </Link>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-neutral-900">Overall Status</h3>
              <p className="mt-1 text-sm text-neutral-500">Current status of all systems</p>
            </div>
            <StatusIndicator status={overallStatus} />
          </div>
          
          <div className="border-t border-neutral-200 pt-4">
            <h4 className="font-medium text-neutral-900 mb-3">Services Status</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(SERVICE_STATUSES).map(([key, value]) => (
                <div key={key} className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                  <StatusIndicator status={value} />
                  <p className="mt-2 text-sm text-neutral-500">
                    {statusCounts[value] || 0} services
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Active Incidents */}
      <Card title="Active Incidents" subtitle="Currently ongoing issues">
        {isLoadingIncidents ? (
          <div className="flex justify-center items-center h-24">
            <svg className="animate-spin h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : incidents && incidents.length > 0 ? (
          <div className="divide-y divide-neutral-200">
            {incidents.map(incident => (
              <div key={incident.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <Link 
                    to={`/admin/incidents/${incident.id}`} 
                    className="text-primary-600 hover:text-primary-800 font-medium"
                  >
                    {incident.title}
                  </Link>
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    incident.type === 'maintenance'
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-danger-100 text-danger-800'
                  }`}>
                    {incident.type === 'maintenance' ? 'Maintenance' : 'Incident'}
                  </span>
                </div>
                
                <div className="mt-1 text-sm text-neutral-500">
                  <div className="flex items-center space-x-4">
                    <span>Status: {incident.status}</span>
                    <span>Started: {formatDate(incident.started_at)}</span>
                  </div>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {incident.services?.map(service => (
                    <span 
                      key={service.id} 
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800"
                    >
                      {service.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-neutral-500 text-center py-6">
            <p>No active incidents.</p>
            <p className="mt-1 text-sm">All systems are operating normally.</p>
          </div>
        )}
      </Card>

      {/* Quick Links */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/services">
            <div className="p-4 bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow hover:border-primary-200 transition-all">
              <div className="flex items-center space-x-3">
                <span className="p-2 bg-primary-100 rounded-md text-primary-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-medium text-neutral-900">Manage Services</h3>
                  <p className="text-sm text-neutral-500">Add or update services</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/admin/incidents">
            <div className="p-4 bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow hover:border-primary-200 transition-all">
              <div className="flex items-center space-x-3">
                <span className="p-2 bg-primary-100 rounded-md text-primary-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-medium text-neutral-900">Incident History</h3>
                  <p className="text-sm text-neutral-500">View all incidents</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/admin/settings">
            <div className="p-4 bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow hover:border-primary-200 transition-all">
              <div className="flex items-center space-x-3">
                <span className="p-2 bg-primary-100 rounded-md text-primary-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-medium text-neutral-900">Settings</h3>
                  <p className="text-sm text-neutral-500">Configure your status page</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;