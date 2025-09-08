'use client';

import React, { useEffect, useState } from 'react';
import Heading from '../atoms/Heading';
import Button from '../atoms/Button';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { getCountries, getCities } from '../../utils/countryStateCityAPI';

const StudentProfile = () => {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const student = session?.user || {};
  
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    nationality: '',
    gender: '',
    program_type: '',
    city: '',
  });

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCountries, setIsFetchingCountries] = useState(false);
  const [isFetchingCities, setIsFetchingCities] = useState(false);
  const [originalValues, setOriginalValues] = useState({
    nationality: '',
    city: ''
  });

  // Fetch countries when component mounts
  useEffect(() => {
    const fetchCountries = async () => {
      setIsFetchingCountries(true);
      try {
        const countriesData = await getCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error('Error fetching countries:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load countries' });
      } finally {
        setIsFetchingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Fetch cities when nationality changes
  useEffect(() => {
    const fetchCities = async () => {
      if (form.nationality) {
        setIsFetchingCities(true);
        try {
          const citiesData = await getCities(form.nationality);
          setCities(citiesData);
          
          // If the original city belongs to this country, select it
          if (originalValues.nationality === form.nationality && originalValues.city) {
            setForm(prev => ({ ...prev, city: originalValues.city }));
          }
        } catch (error) {
          console.error('Error fetching cities:', error);
          Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load cities' });
        } finally {
          setIsFetchingCities(false);
        }
      } else {
        setCities([]);
        setForm(prev => ({ ...prev, city: '' }));
      }
    };

    fetchCities();
  }, [form.nationality, originalValues]);

  // Fetch student data when component mounts
  useEffect(() => {
    const fetchStudentData = async () => {
      if (student?.id && status === 'authenticated') {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/internal/auth/users/${student.id}`);
          let data = {};
          
          if (response.ok) {
            data = await response.json();
          }

          // Get values from API response or fallback to session data
          const studentData = {
            first_name: data.user?.first_name || student.first_name || '',
            last_name: data.user?.last_name || student.last_name || '',
            email: data.user?.email || student.email || '',
            phone: data.user?.phone || student.phone || '',
            nationality: data.student?.nationality || student.nationality || '',
            gender: data.student?.gender || student.gender || '',
            program_type: data.student?.prefered_program || student.program_type || '',
            city: data.student?.city || student.city || '',
          };

          // Store original values for reference
          setOriginalValues({
            nationality: studentData.nationality,
            city: studentData.city
          });

          setForm(studentData);
        } catch (error) {
          console.error('Error fetching student data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchStudentData();
  }, [student?.id, status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset city when country changes
    if (name === 'nationality') {
      setForm(prev => ({ ...prev, [name]: value, city: '' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/internal/auth/users/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          // Ensure we don't send empty strings for optional fields
          phone: form.phone || null,
          nationality: form.nationality || null,
          city: form.city || null,
          gender: form.gender || null,
          program_type: form.program_type || null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the session with new user data
        await update({
          ...session.user,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          nationality: form.nationality,
          gender: form.gender,
          program_type: form.program_type,
          city: form.city,
        });
        
        // Update original values after successful save
        setOriginalValues({
          nationality: form.nationality,
          city: form.city
        });
        
        await Swal.fire({ 
          icon: 'success', 
          title: 'Success', 
          text: 'Profile updated successfully!',
          timer: 2000,
          showConfirmButton: false
        });
        router.refresh();
      } else {
        await Swal.fire({ 
          icon: 'error', 
          title: 'Error', 
          text: data.message || 'Failed to update profile',
          timer: 3000
        });
      }
    } catch (err) {
      console.error('Profile update error:', err);
      await Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: 'Network error',
        timer: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B6D76] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center py-8">
      <div className="w-full max-w-4xl px-4">
        <div className="text-center mb-8">
          <Heading level={4}>Edit Profile</Heading>
          <p className="text-gray-600 mt-2">Update your personal information</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow-md">
          {/* First Name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              placeholder="First Name"
              required
            />
          </div>

          {/* Last Name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              placeholder="Last Name"
              required
            />
          </div>

          {/* Email (Disabled) */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              value={form.email}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
              placeholder="Email Address"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              name="phone"
              value={form.phone || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              placeholder="Phone"
            />
          </div>

          {/* Nationality */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Nationality</label>
            <select
              name="nationality"
              value={form.nationality || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              disabled={isFetchingCountries}
            >
              <option value="">Select Nationality</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
            {isFetchingCountries && (
              <p className="text-xs text-gray-500 mt-1">Loading countries...</p>
            )}
          </div>

          {/* City */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">City</label>
            <select
              name="city"
              value={form.city || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              disabled={!form.nationality || isFetchingCities}
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
              {/* Show existing city if it's not in the current country's cities */}
              {originalValues.city && form.nationality !== originalValues.nationality && (
                <option value={originalValues.city}>
                  {originalValues.city} (Previous selection)
                </option>
              )}
            </select>
            {isFetchingCities && (
              <p className="text-xs text-gray-500 mt-1">Loading cities...</p>
            )}
            {!form.nationality && !isFetchingCities && (
              <p className="text-xs text-gray-500 mt-1">Please select a country first</p>
            )}
          </div>

          {/* Program Type */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Program Type</label>
            <select
              name="program_type"
              value={form.program_type || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
            >
              <option value="">Select Program Type</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Graduate">Graduate</option>
              <option value="PhD">PhD</option>
              <option value="Diploma">Diploma</option>
              <option value="Certificate">Certificate</option>
            </select>
          </div>

          {/* Gender */}
          <div className="md:col-span-2 space-y-1">
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  checked={form.gender === 'MALE'}
                  onChange={handleChange}
                  className="text-[#0B6D76] focus:ring-[#0B6D76]"
                />
                <span>Male</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  checked={form.gender === 'FEMALE'}
                  onChange={handleChange}
                  className="text-[#0B6D76] focus:ring-[#0B6D76]"
                />
                <span>Female</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="OTHER"
                  checked={form.gender === 'OTHER'}
                  onChange={handleChange}
                  className="text-[#0B6D76] focus:ring-[#0B6D76]"
                />
                <span>Other</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 pt-4">
            <Button 
              type="submit" 
              className="w-full py-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : 'Update Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;