import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatRelativeTime } from '../../lib/utils';
import { INCIDENT_STATUS_COLORS, INCIDENT_STATUS_LABELS } from '../../lib/utils';

const IncidentHistory = ({ incidents = [], organizationSlug = 'default' }) => {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="py-6 text-center text-neutral-500">
        No incidents to display.
      </div>
    );
  }

  // Group incidents by date (YYYY-MM-DD)
  const groupedIncidents = incidents.reduce((groups, incident) => {
    const date = new Date(incident.started_at);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(incident);
    return groups;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedIncidents).sort((a, b) => {
    return new Date(b) - new Date(a);
  });

  // Status badge component
  const StatusBadge = ({ status }) => {
    const color = INCIDENT_STATUS_COLORS[status] || 'neutral';
    const label = INCIDENT_STATUS_LABELS[status] || 'Unknown';
    
    const colorClasses = {
      success: 'bg-success-100 text-success-800 border-success-200',
      warning: 'bg-warning-100 text-warning-800 border-warning-200',
      danger: 'bg-danger-100 text-danger-800 border-danger-200',
      primary: 'bg-primary-100 text-primary-800 border-primary-200',
      neutral: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]}`}>
        {label}
      </span>
    );
  };

  // Type badge component
  const TypeBadge = ({ type }) => {
    const config = {
      incident: {
        label: 'Incident',
        classes: 'bg-danger-100 text-danger-800 border-danger-200',
      },
      maintenance: {
        label: 'Maintenance',
        classes: 'bg-primary-100 text-primary-800 border-primary-200',
      },
    };

    const typeConfig = config[type] || config.incident;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeConfig.classes}`}>
        {typeConfig.label}
      </span>
    );
  };

  return (
    <div className="divide-y divide-neutral-200">
      {sortedDates.map(dateKey => (
        <div key={dateKey} className="py-4 px-6">
          <h3 className="text-sm font-medium text-neutral-500 mb-3">
            {formatDate(dateKey, 'MMMM d, yyyy')}
          </h3>
          
          <div className="space-y-4">
            {groupedIncidents[dateKey].map(incident => (
              <div key={incident.id} className="bg-neutral-50 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link
                      to={`/incidents/${incident.id}`}
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      {incident.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <StatusBadge status={incident.status} />
                      <TypeBadge type={incident.type} />
                      {incident.impact && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200 capitalize">
                          {incident.impact} Impact
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 sm:mt-0 text-sm text-neutral-500">
                    <time title={formatDate(incident.started_at)}>
                      {formatRelativeTime(incident.started_at)}
                    </time>
                  </div>
                </div>
                
                {incident.scheduled_start_time && incident.type === 'maintenance' && (
                  <div className="mt-2 text-sm text-neutral-500">
                    <span className="font-medium">Scheduled:</span>{' '}
                    {formatDate(incident.scheduled_start_time)}
                    {incident.scheduled_end_time && (
                      <> to {formatDate(incident.scheduled_end_time)}</>
                    )}
                  </div>
                )}
                
                {incident.services && incident.services.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-neutral-500">Affected services:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {incident.services.map(service => (
                        <span 
                          key={service.id || service} 
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800"
                        >
                          {typeof service === 'object' ? service.name : service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-2">
                  <Link
                    to={`/incidents/${incident.id}`}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IncidentHistory;