import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    organizationSlug: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-generate slug from organization name
    if (name === 'organizationName') {
      const slug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
        
      setFormData({
        ...formData,
        [name]: value,
        organizationSlug: slug,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.organizationName) newErrors.organizationName = 'Organization name is required';
    if (!formData.organizationSlug) newErrors.organizationSlug = 'Organization slug is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const result = await register({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        organization: {
          name: formData.organizationName,
          slug: formData.organizationSlug,
        },
      });
      
      if (result.success) {
        navigate('/admin');
      } else {
        setErrors({ general: result.error || 'Registration failed. Please try again.' });
      }
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary-600">StatusPage</h1>
          <h2 className="mt-2 text-xl font-semibold text-neutral-900">Create your account</h2>
        </div>
        
        {errors.general && (
          <div className="bg-danger-50 border-l-4 border-danger-500 text-danger-700 p-4 mb-6 rounded" role="alert">
            <p>{errors.general}</p>
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-neutral-900">Your Information</h3>
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  errors.fullName ? 'border-danger-500' : 'border-neutral-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-danger-600">{errors.fullName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  errors.email ? 'border-danger-500' : 'border-neutral-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-danger-600">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  errors.password ? 'border-danger-500' : 'border-neutral-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-danger-600">{errors.password}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-danger-500' : 'border-neutral-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-danger-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          
          <div className="pt-4 space-y-6">
            <h3 className="text-lg font-medium text-neutral-900">Organization Information</h3>
            
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-neutral-700 mb-1">
                Organization Name
              </label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                value={formData.organizationName}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  errors.organizationName ? 'border-danger-500' : 'border-neutral-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              />
              {errors.organizationName && (
                <p className="mt-1 text-sm text-danger-600">{errors.organizationName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="organizationSlug" className="block text-sm font-medium text-neutral-700 mb-1">
                Organization Slug
              </label>
              <div className="flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-neutral-300 bg-neutral-50 text-neutral-500 sm:text-sm">
                  status.yourdomain.com/
                </span>
                <input
                  id="organizationSlug"
                  name="organizationSlug"
                  type="text"
                  value={formData.organizationSlug}
                  onChange={handleChange}
                  className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border ${
                    errors.organizationSlug ? 'border-danger-500' : 'border-neutral-300'
                  } focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                />
              </div>
              {errors.organizationSlug && (
                <p className="mt-1 text-sm text-danger-600">{errors.organizationSlug}</p>
              )}
              <p className="mt-1 text-xs text-neutral-500">
                This will be used for your public status page URL
              </p>
            </div>
          </div>
          
          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;