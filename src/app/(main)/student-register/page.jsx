'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Heading from '../../components/atoms/Heading';
import Input from '../../components/atoms/Input';
import Button from '../../components/atoms/Button';
import { getCountries, getCities } from '../../utils/countryStateCityAPI';
import Swal from 'sweetalert2';

export default function StudentForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: '',
    nationality: '',
    city: '',
    program_type: '',
    gender: '',
    agree: false,
  });

  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation function
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: minLength && hasNumber && hasUppercase && hasSpecialChar,
      minLength,
      hasNumber,
      hasUppercase,
      hasSpecialChar
    };
  };

  // Fetch countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesData = await getCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error('Failed to load countries:', error);
        Swal.fire({
          icon: 'error',
          title: '❌ Failed to load countries',
          text: 'Please try again later.',
          confirmButtonColor: '#0B6D76'
        });
      } finally {
        setLoadingCountries(false);
      }
    };

    loadCountries();
  }, []);

  // Fetch cities when country changes
  const fetchCities = async (countryName) => {
    if (!countryName) {
      setCities([]);
      return;
    }

    setLoadingCities(true);
    try {
      const country = countries.find(c => c.name === countryName);
      if (country) {
        const citiesData = await getCities(country.id);
        setCities(citiesData);
      }
    } catch (error) {
      console.error('Failed to load cities:', error);
      Swal.fire({
        icon: 'error',
        title: '❌ Failed to load cities',
        text: 'Please try again.',
        confirmButtonColor: '#0B6D76'
      });
    } finally {
      setLoadingCities(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!form.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email is invalid';
    
    // Enhanced password validation
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(form.password);
      if (!passwordValidation.isValid) {
        newErrors.password = 'Password must meet required criteria.';
      }
    }
    
    if (form.password !== form.confirm_password) newErrors.confirm_password = 'Passwords do not match';
    if (!form.gender) newErrors.gender = 'Gender is required';
    if (!form.program_type) newErrors.program_type = 'Program type is required';
    if (!form.nationality) newErrors.nationality = 'Nationality is required';
    if (!form.city) newErrors.city = 'City is required';
    if (!form.agree) newErrors.agree = 'You must agree to the terms';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    
    if (name === 'nationality') {
      fetchCities(value);
      setForm(prev => ({ ...prev, city: '' })); // Reset city when country changes
    }
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!validateForm()) return;
    
    // Check password validation before submission
    const passwordValidation = validatePassword(form.password);
    if (!passwordValidation.isValid) {
      Swal.fire({
        icon: 'error',
        title: '❌ Password must meet required criteria.',
        html: `
          <div class="text-left">
            <p class="mb-2">Your password must contain:</p>
            <ul class="list-disc list-inside space-y-1">
              <li class="${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}">At least 8 characters</li>
              <li class="${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}">At least one number</li>
              <li class="${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-600'}">At least one uppercase letter</li>
              <li class="${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}">At least one special character (!@#$%^&*)</li>
            </ul>
          </div>
        `,
        confirmButtonColor: '#0B6D76'
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/internal/auth/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          user_type: 'student',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '✅ Account created successfully!',
          text: 'Registration successful! Please login.',
          confirmButtonColor: '#0B6D76',
          timer: 2000,
          showConfirmButton: false
        });
        
        setTimeout(() => {
          router.push('/student-login');
        }, 2000);
      } else {
        // Handle specific error cases
        let errorTitle = '❌ Registration Failed';
        let errorMessage = data.message || 'Registration failed. Please try again.';
        
        if (data.message && data.message.includes('Email already registered')) {
          errorTitle = '❌ Email already registered. Please login instead.';
          errorMessage = 'This email is already in use. Please login with your existing account.';
        } else if (data.message && data.message.includes('Password')) {
          errorTitle = '❌ Password validation failed';
          errorMessage = 'Please ensure your password meets all requirements.';
        }
        
        Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
          confirmButtonColor: '#0B6D76'
        });
      }
    } catch (err) {
      console.error('Signup error:', err);
      Swal.fire({
        icon: 'error',
        title: '❌ Something went wrong, please try again later',
        text: 'Network error. Please check your connection and try again.',
        confirmButtonColor: '#0B6D76'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatLabel = (label) => label.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="min-h-screen bg-white py-12 px-4 flex items-center justify-center">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <Heading level={3} className="text-center lg:text-left">
            Registration <span className="text-teal-600">As Student</span>
          </Heading>

          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(form).map(([field, value]) => {
              if (['agree', 'gender', 'nationality', 'city', 'program_type'].includes(field)) return null;
              const isPassword = field === 'password' || field === 'confirm_password';
              return (
                <div key={field} className="relative">
                  <Input
                    id={field}
                    type={isPassword
                      ? field === 'password'
                        ? showPassword ? 'text' : 'password'
                        : showConfirmPassword ? 'text' : 'password'
                      : 'text'}
                    name={field}
                    value={value}
                    onChange={handleChange}
                    placeholder={formatLabel(field)}
                  />
                  {isPassword && (
                    <button
                      type="button"
                      onClick={field === 'password' ? togglePasswordVisibility : toggleConfirmPasswordVisibility}
                      className="absolute right-3 top-3 text-gray-500"
                    >
                      {field === 'password' 
                        ? (showPassword ? '🙈' : '👁️')
                        : (showConfirmPassword ? '🙈' : '👁️')}
                    </button>
                  )}
                  {errors[field] && <p className="text-sm text-red-500">{errors[field]}</p>}
                </div>
              );
            })}

            {/* Nationality Dropdown */}
            <div>
              <select
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none"
                disabled={loadingCountries}
              >
                <option value="">Select Nationality</option>
                {loadingCountries ? (
                  <option value="" disabled>Loading countries...</option>
                ) : (
                  countries.map((country) => (
                    <option key={country.id} value={country.name}>
                      {country.name}
                    </option>
                  ))
                )}
              </select>
              {errors.nationality && <p className="text-sm text-red-500">{errors.nationality}</p>}
            </div>

            {/* City Dropdown */}
            <div>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none"
                disabled={!form.nationality || loadingCities}
              >
                <option value="">Select City</option>
                {!form.nationality ? (
                  <option value="" disabled>Please select a country first</option>
                ) : loadingCities ? (
                  <option value="" disabled>Loading cities...</option>
                ) : cities.length === 0 ? (
                  <option value="" disabled>No cities available</option>
                ) : (
                  cities.map((city) => (
                    <option key={city.id} value={city.name}>
                      {city.name}
                    </option>
                  ))
                )}
              </select>
              {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
            </div>

            {/* Program Type Dropdown */}
            <div>
              <select
                name="program_type"
                value={form.program_type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none"
              >
                <option value="">Select Program Type</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Graduate">Graduate</option>
                <option value="PhD">PhD</option>
                <option value="Diploma">Diploma</option>
                <option value="Certificate">Certificate</option>
              </select>
              {errors.program_type && <p className="text-sm text-red-500">{errors.program_type}</p>}
            </div>

            {/* Gender Radio Buttons */}
            <div className="md:col-span-2 flex items-center space-x-6">
              {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                <label key={g} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={handleChange}
                    className="accent-teal-600"
                  />
                  <span>{g.charAt(0) + g.slice(1).toLowerCase()}</span>
                </label>
              ))}
              {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
            </div>

            {/* Terms and Conditions */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="agree"
                  checked={form.agree}
                  onChange={handleChange}
                  className="accent-teal-600"
                />
                <span>
                  I agree to the <span className="text-teal-600 underline">Terms and Conditions</span>
                </span>
              </label>
              {errors.agree && <p className="text-sm text-red-500">{errors.agree}</p>}
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex flex-wrap items-center gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
              <button
                type="button"
                onClick={() => router.push('/student-login')}
                className="text-teal-600 underline"
              >
                Already have an account? Login
              </button>
            </div>
          </form>
        </div>

        <div className="hidden lg:block relative shadow-lg rounded-3xl">
          <img
            src="/assets/comp.png"
            alt="Student"
            className="w-full rounded-[24px] object-cover"
          />
        </div>
      </div>
    </div>
  );
}