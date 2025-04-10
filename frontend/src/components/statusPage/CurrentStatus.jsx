import React from 'react';
import { formatDate } from '../../lib/utils';
import { STATUS_COLORS, STATUS_LABELS, SERVICE_STATUSES, getOverallStatus } from '../../lib/utils';

const CurrentStatus = ({ services = [], lastUpdated = null }) => {
  const overallStatus = getOverallStatus(services);
  
  const statusConfig = {
    [SERVICE_STATUSES.OPERATIONAL]: {
      title: 'All Systems Operational',
      color: 'success',
      description: 'All systems are operating normally.',
      icon: <CheckCircleIcon className="h-8 w-8 text-success-500" />,
    },
    [SERVICE_STATUSES.DEGRADED]: {
      title: 'Degraded Performance',
      color: 'warning',
      description: 'Some systems are experiencing degraded performance.',
      icon: <ExclamationCircleIcon className="h-8 w-8 text-warning-500" />,
    },
    [SERVICE_STATUSES.PARTIAL_OUTAGE]: {
      title: 'Partial System Outage',
      color: 'warning',
      description: 'We are experiencing a partial system outage.',
      icon: <ExclamationTriangleIcon className="h-8 w-8 text-warning-500" />,
    },
    [SERVICE_STATUSES.MAJOR_OUTAGE]: {
      title: 'Major System Outage',
      color: 'danger',
      description: 'We are experiencing a major system outage.',
      icon: <XCircleIcon className="h-8 w-8 text-danger-500" />,
    },
    [SERVICE_STATUSES.MAINTENANCE]: {
      title: 'Scheduled Maintenance',
      color: 'primary',
      description: 'Systems are undergoing scheduled maintenance.',
      icon: <WrenchIcon className="h-8 w-8 text-primary-500" />,
    },
  };

  const currentStatusConfig = statusConfig[overallStatus] || statusConfig[SERVICE_STATUSES.OPERATIONAL];
  
  const bgColorClasses = {
    success: 'bg-success-50 border-success-100',
    warning: 'bg-warning-50 border-warning-100',
    danger: 'bg-danger-50 border-danger-100',
    primary: 'bg-primary-50 border-primary-100',
  };

  return (
    <div className="space-y-6">
      {/* Overall status banner */}
      <div className={`rounded-lg border ${bgColorClasses[currentStatusConfig.color]} p-6`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {currentStatusConfig.icon}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium">{currentStatusConfig.title}</h3>
            <div className="mt-2 text-sm">
              <p>{currentStatusConfig.description}</p>
            </div>
          </div>
        </div>
        {lastUpdated && (
          <div className="mt-4 text-xs text-neutral-500">
            Last updated: {formatDate(lastUpdated, 'MMM d, yyyy HH:mm')}
          </div>
        )}
      </div>

      {/* Service status list */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 border-b border-neutral-200 sm:px-6">
          <h3 className="text-lg font-medium text-neutral-900">Service Status</h3>
        </div>
        <div className="divide-y divide-neutral-200">
          {services.length === 0 ? (
            <p className="p-6 text-neutral-500 text-center">No services found.</p>
          ) : (
            services.map((service) => {
              const color = STATUS_COLORS[service.status] || 'neutral';
              const label = STATUS_LABELS[service.status] || 'Unknown';
              
              const statusDotColors = {
                success: 'bg-success-500',
                warning: 'bg-warning-500',
                danger: 'bg-danger-500',
                primary: 'bg-primary-500',
                neutral: 'bg-neutral-500',
              };
              
              return (
                <div key={service.id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium text-neutral-900">{service.name}</h4>
                    {service.description && (
                      <p className="mt-1 text-sm text-neutral-500">{service.description}</p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full ${statusDotColors[color]} mr-2`}></span>
                    <span className="text-sm font-medium text-neutral-700">{label}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

function CheckCircleIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ExclamationCircleIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

function ExclamationTriangleIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function XCircleIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function WrenchIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  );
}

export default CurrentStatus;