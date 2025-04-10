import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { STATUS_LABELS, STATUS_COLORS, SERVICE_STATUSES } from '../../lib/utils';

const StatusSelector = ({ value, onChange, showLabel = true, disabled = false }) => {
  const statuses = [
    { id: SERVICE_STATUSES.OPERATIONAL, name: STATUS_LABELS[SERVICE_STATUSES.OPERATIONAL], color: STATUS_COLORS[SERVICE_STATUSES.OPERATIONAL] },
    { id: SERVICE_STATUSES.DEGRADED, name: STATUS_LABELS[SERVICE_STATUSES.DEGRADED], color: STATUS_COLORS[SERVICE_STATUSES.DEGRADED] },
    { id: SERVICE_STATUSES.PARTIAL_OUTAGE, name: STATUS_LABELS[SERVICE_STATUSES.PARTIAL_OUTAGE], color: STATUS_COLORS[SERVICE_STATUSES.PARTIAL_OUTAGE] },
    { id: SERVICE_STATUSES.MAJOR_OUTAGE, name: STATUS_LABELS[SERVICE_STATUSES.MAJOR_OUTAGE], color: STATUS_COLORS[SERVICE_STATUSES.MAJOR_OUTAGE] },
    { id: SERVICE_STATUSES.MAINTENANCE, name: STATUS_LABELS[SERVICE_STATUSES.MAINTENANCE], color: STATUS_COLORS[SERVICE_STATUSES.MAINTENANCE] },
  ];

  const selectedStatus = statuses.find(status => status.id === value) || statuses[0];

  const getStatusDot = (color) => {
    const colorClasses = {
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      danger: 'bg-danger-500',
      primary: 'bg-primary-500',
    };

    return (
      <span className={`inline-block w-3 h-3 rounded-full ${colorClasses[color]}`} />
    );
  };

  return (
    <div className={`${showLabel ? 'space-y-1' : ''}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-neutral-700">Status</label>
      )}

      <Listbox value={selectedStatus} onChange={(newStatus) => onChange(newStatus.id)} disabled={disabled}>
        <div className="relative mt-1">
          <Listbox.Button className={`relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-md border ${
            disabled ? 'cursor-not-allowed bg-neutral-100 border-neutral-200' : 'cursor-default border-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500'
          } shadow-sm`}>
            <span className="flex items-center space-x-2">
              {getStatusDot(selectedStatus.color)}
              <span className="block truncate">{selectedStatus.name}</span>
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDownIcon
                className="h-5 w-5 text-neutral-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {statuses.map((status) => (
                <Listbox.Option
                  key={status.id}
                  className={({ active }) =>
                    `${
                      active ? 'text-neutral-900 bg-neutral-100' : 'text-neutral-900'
                    } cursor-default select-none relative py-2 pl-3 pr-9`
                  }
                  value={status}
                >
                  {({ selected, active }) => (
                    <>
                      <div className="flex items-center space-x-2">
                        {getStatusDot(status.color)}
                        <span
                          className={`${
                            selected ? 'font-medium' : 'font-normal'
                          } block truncate`}
                        >
                          {status.name}
                        </span>
                      </div>

                      {selected ? (
                        <span
                          className={`${
                            active ? 'text-primary-600' : 'text-primary-600'
                          } absolute inset-y-0 right-0 flex items-center pr-4`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

function ChevronDownIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function CheckIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export default StatusSelector;