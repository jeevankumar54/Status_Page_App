import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../../hooks/useAuth';
import { useOrganization } from '../../hooks/useAuth';

const Header = ({ toggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const { organizations, currentOrganization, switchOrganization } = useOrganization || { 
    organizations: [], 
    currentOrganization: null,
    switchOrganization: () => {} 
  };
  
  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left side - mobile menu button */}
        <div className="flex items-center lg:hidden">
          <button
            type="button"
            className="p-2 text-neutral-500 rounded-md hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={toggleSidebar}
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Center - page title (hidden on mobile) */}
        <div className="hidden lg:flex lg:items-center">
          <h1 className="text-xl font-semibold text-neutral-900">
            {currentOrganization ? currentOrganization.name : 'Dashboard'}
          </h1>
        </div>

        {/* Right side - user menu */}
        <div className="flex items-center gap-4">
          {/* Visit public page button */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
          >
            <ExternalLinkIcon className="w-4 h-4 mr-1.5" />
            Status Page
          </Link>

          {/* Organization selector */}
          {organizations.length > 0 && (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center text-sm font-medium text-neutral-700 rounded-md hover:text-neutral-900 hover:bg-neutral-100 px-3 py-1.5">
                <BuildingIcon className="w-4 h-4 mr-1.5" />
                <span>{currentOrganization?.name || 'Select Organization'}</span>
                <ChevronDownIcon className="w-4 h-4 ml-1.5" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {organizations.map((org) => (
                      <Menu.Item key={org.id}>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700'
                            } flex items-center w-full px-4 py-2 text-sm`}
                            onClick={() => switchOrganization(org.id)}
                          >
                            {org.name}
                            {currentOrganization?.id === org.id && (
                              <CheckIcon className="w-4 h-4 ml-auto" />
                            )}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
          
          {/* User menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <span className="sr-only">Open user menu</span>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700">
                {currentUser?.name?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 py-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {/* User info */}
                {currentUser && (
                  <div className="px-4 py-2 border-b border-neutral-200">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {currentUser.name || currentUser.email}
                    </p>
                    <p className="text-xs text-neutral-500 truncate mt-0.5">
                      {currentUser.email}
                    </p>
                  </div>
                )}
                
                {/* Menu items */}
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/admin/settings"
                      className={`${
                        active ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700'
                      } flex items-center px-4 py-2 text-sm`}
                    >
                      <CogIcon className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700'
                      } flex items-center w-full px-4 py-2 text-sm`}
                      onClick={logout}
                    >
                      <LogoutIcon className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

// Icons
function MenuIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function ExternalLinkIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function BuildingIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

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

function CogIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LogoutIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}

export default Header;