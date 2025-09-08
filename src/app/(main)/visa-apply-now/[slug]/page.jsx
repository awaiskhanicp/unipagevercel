'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Swal from 'sweetalert2';

// API utility functions
const API_KEY = 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA==';

const getCountries = async () => {
  try {
    const response = await fetch('https://api.countrystatecity.in/v1/countries', {
      headers: {
        'X-CSCAPI-KEY': API_KEY
      }
    });
    const countries = await response.json();
    return countries.map(country => ({
      id: country.iso2,
      name: country.name
    }));
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
};

const getStates = async (countryIso) => {
  if (!countryIso) return [];
  
  try {
    const response = await fetch(`https://api.countrystatecity.in/v1/countries/${countryIso}/states`, {
      headers: {
        'X-CSCAPI-KEY': API_KEY
      }
    });
    const states = await response.json();
    return states.map(state => ({
      id: state.iso2,
      name: state.name
    }));
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
};

const getCities = async (countryIso, stateIso) => {
  if (!countryIso || !stateIso) return [];
  
  try {
    const response = await fetch(`https://api.countrystatecity.in/v1/countries/${countryIso}/states/${stateIso}/cities`, {
      headers: {
        'X-CSCAPI-KEY': API_KEY
      }
    });
    const cities = await response.json();
    return cities.map(city => ({
      id: city.id,
      name: city.name
    }));
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

export default function VisaApplyNowPage() {
  const params = useParams();
  const slug = params?.slug || '';

  const [form, setForm] = useState({
    givenName: '',
    email: '',
    mobile: '',
    education: '',
    gender: '',
    taxpayer: '',
    bankStatement: '',
    applyFor: '',
    homeCountry: '',
    state: '',
    city: '',
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState({
    countries: false,
    states: false,
    cities: false
  });

  useEffect(() => {
    // Fetch countries on component mount
    const fetchCountries = async () => {
      setLoadingLocations(prev => ({ ...prev, countries: true }));
      const countriesData = await getCountries();
      setCountries(countriesData);
      setLoadingLocations(prev => ({ ...prev, countries: false }));
    };
    
    fetchCountries();
  }, []);

  useEffect(() => {
    // Fetch states when country changes
    const fetchStates = async () => {
      if (form.homeCountry) {
        setLoadingLocations(prev => ({ ...prev, states: true }));
        setForm(prev => ({ ...prev, state: '', city: '' }));
        setStates([]);
        setCities([]);
        
        const statesData = await getStates(form.homeCountry);
        setStates(statesData);
        setLoadingLocations(prev => ({ ...prev, states: false }));
      } else {
        setStates([]);
        setCities([]);
      }
    };
    
    fetchStates();
  }, [form.homeCountry]);

  useEffect(() => {
    // Fetch cities when state changes
    const fetchCities = async () => {
      if (form.homeCountry && form.state) {
        setLoadingLocations(prev => ({ ...prev, cities: true }));
        setForm(prev => ({ ...prev, city: '' }));
        
        const citiesData = await getCities(form.homeCountry, form.state);
        setCities(citiesData);
        setLoadingLocations(prev => ({ ...prev, cities: false }));
      } else {
        setCities([]);
      }
    };
    
    fetchCities();
  }, [form.homeCountry, form.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(?:\+92|92|0)3[0-9]{9}$/;

    Object.entries(form).forEach(([key, value]) => {
      if (!value.trim()) newErrors[key] = 'This field is required';
    });

    if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (form.mobile && !phoneRegex.test(form.mobile)) {
      newErrors.mobile = 'Invalid Pakistani mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      Swal.fire({
        icon: 'warning',
        title: 'Please fill all fields correctly!',
        confirmButtonColor: '#0B6D76',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/internal/visit-visas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Submission failed');

      setSubmitted(true);
      Swal.fire({
        icon: 'success',
        title: 'Application Submitted Successfully!',
        confirmButtonColor: '#0B6D76',
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Something went wrong!',
        text: 'Please try again later.',
        confirmButtonColor: '#0B6D76',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTitle = (text) =>
    text.replace(/-visit-visa$/, '').replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const renderError = (field) =>
    errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-3xl overflow-hidden">
        <div className="bg-[#0B6D76] p-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Apply for <span className="text-yellow-300">{formatTitle(slug)}</span> Visa
          </h1>
          <p className="text-blue-100 mt-2">Complete the form below to start your application</p>
        </div>

        {submitted ? (
          <div className="text-center py-16 px-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Application Submitted Successfully!</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Thank you for your application. Our team will contact you within 24-48 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[{ label: 'Full Name', name: 'givenName', type: 'text' },
                { label: 'Email Address', name: 'email', type: 'email' },
                { label: 'Mobile Number', name: 'mobile', type: 'tel' },
                { label: 'Apply For', name: 'applyFor', type: 'text' }].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input
                    name={field.name}
                    type={field.type}
                    value={form[field.name]}
                    onChange={handleChange}
                    required
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {renderError(field.name)}
                </div>
              ))}

              {/* Country Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home Country</label>
                <select
                  name="homeCountry"
                  value={form.homeCountry}
                  onChange={handleChange}
                  required
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {loadingLocations.countries && <p className="text-sm text-gray-500 mt-1">Loading countries...</p>}
                {renderError('homeCountry')}
              </div>

              {/* State Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  disabled={!form.homeCountry || loadingLocations.states}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
                {loadingLocations.states && <p className="text-sm text-gray-500 mt-1">Loading states...</p>}
                {renderError('state')}
              </div>

              {/* City Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  disabled={!form.state || loadingLocations.cities}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {loadingLocations.cities && <p className="text-sm text-gray-500 mt-1">Loading cities...</p>}
                {renderError('city')}
              </div>

              {[{ label: 'Last Education', name: 'education', options: ['Select', 'Matric', 'Inter', 'Bachelor', 'Master', 'PhD', 'Other'] },
                { label: 'Gender', name: 'gender', options: ['Select', 'Male', 'Female', 'Other'] },
                { label: 'Taxpayer Status', name: 'taxpayer', options: ['Select', 'Filer', 'Non-Filer'] },
                { label: '6 Months Bank Statement?', name: 'bankStatement', options: ['Select', 'Yes', 'No'] }].map((select) => (
                <div key={select.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{select.label}</label>
                  <select
                    name={select.name}
                    value={form[select.name]}
                    onChange={handleChange}
                    required
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {select.options.map((opt, idx) => (
                      <option key={opt} value={idx === 0 ? '' : opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {renderError(select.name)}
                </div>
              ))}
            </div>

            <div className="flex items-start">
              <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the <a href="#" className="text-blue-600 underline hover:text-blue-500">terms and conditions</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0B6D76] text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}













// 'use client';

// import { useState } from 'react';
// import { useParams } from 'next/navigation';
// import Swal from 'sweetalert2';

// export default function VisaApplyNowPage() {
//   const params = useParams();
//   const slug = params?.slug || '';

//   const [form, setForm] = useState({
//     givenName: '',
//     email: '',
//     mobile: '',
//     education: '',
//     gender: '',
//     taxpayer: '',
//     bankStatement: '',
//     applyFor: '',
//     homeCountry: '',
//     state: '',
//     city: '',
//   });

//   const [errors, setErrors] = useState({});
//   const [submitted, setSubmitted] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: '' }));
//   };

//   const validate = () => {
//     const newErrors = {};
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const phoneRegex = /^(?:\+92|92|0)3[0-9]{9}$/; // ✅ updated

//     Object.entries(form).forEach(([key, value]) => {
//       if (!value.trim()) newErrors[key] = 'This field is required';
//     });

//     if (form.email && !emailRegex.test(form.email)) {
//       newErrors.email = 'Invalid email format';
//     }

//     if (form.mobile && !phoneRegex.test(form.mobile)) {
//       newErrors.mobile = 'Invalid Pakistani mobile number';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validate()) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Please fill all fields correctly!',
//         confirmButtonColor: '#0B6D76',
//       });
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch('/api/internal/visit-visas', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form),
//       });

//       if (!res.ok) throw new Error('Submission failed');

//       setSubmitted(true);
//       Swal.fire({
//         icon: 'success',
//         title: 'Application Submitted Successfully!',
//         confirmButtonColor: '#0B6D76',
//       });
//     } catch (err) {
//       console.error(err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Something went wrong!',
//         text: 'Please try again later.',
//         confirmButtonColor: '#0B6D76',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatTitle = (text) =>
//     text.replace(/-visit-visa$/, '').replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

//   const renderError = (field) =>
//     errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>;

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10">
//       <div className="w-full max-w-3xl bg-white shadow-2xl rounded-3xl overflow-hidden">
//         <div className="bg-[#0B6D76] p-6 text-center">
//           <h1 className="text-3xl sm:text-4xl font-bold text-white">
//             Apply for <span className="text-yellow-300">{formatTitle(slug)}</span> Visa
//           </h1>
//           <p className="text-blue-100 mt-2">Complete the form below to start your application</p>
//         </div>

//         {submitted ? (
//           <div className="text-center py-16 px-6">
//             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
//               <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//               </svg>
//             </div>
//             <h2 className="text-2xl font-semibold text-gray-800 mb-2">Application Submitted Successfully!</h2>
//             <p className="text-gray-600 max-w-md mx-auto">
//               Thank you for your application. Our team will contact you within 24-48 hours.
//             </p>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10 space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {[{ label: 'Full Name', name: 'givenName', type: 'text' },
//                 { label: 'Email Address', name: 'email', type: 'email' },
//                 { label: 'Mobile Number', name: 'mobile', type: 'tel' },
//                 { label: 'Apply For', name: 'applyFor', type: 'text' },
//                 { label: 'State/Province', name: 'state', type: 'text' },
//                 { label: 'City', name: 'city', type: 'text' }].map((field) => (
//                 <div key={field.name}>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
//                   <input
//                     name={field.name}
//                     type={field.type}
//                     value={form[field.name]}
//                     onChange={handleChange}
//                     required
//                     className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   />
//                   {renderError(field.name)}
//                 </div>
//               ))}

//               {[{ label: 'Last Education', name: 'education', options: ['Select', 'Matric', 'Inter', 'Bachelor', 'Master', 'PhD', 'Other'] },
//                 { label: 'Gender', name: 'gender', options: ['Select', 'Male', 'Female', 'Other'] },
//                 { label: 'Taxpayer Status', name: 'taxpayer', options: ['Select', 'Filer', 'Non-Filer'] },
//                 { label: '6 Months Bank Statement?', name: 'bankStatement', options: ['Select', 'Yes', 'No'] },
//                 { label: 'Home Country', name: 'homeCountry', options: ['Select', 'Pakistan', 'India', 'Bangladesh', 'Other'] }].map((select) => (
//                 <div key={select.name}>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">{select.label}</label>
//                   <select
//                     name={select.name}
//                     value={form[select.name]}
//                     onChange={handleChange}
//                     required
//                     className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   >
//                     {select.options.map((opt, idx) => (
//                       <option key={opt} value={idx === 0 ? '' : opt}>
//                         {opt}
//                       </option>
//                     ))}
//                   </select>
//                   {renderError(select.name)}
//                 </div>
//               ))}
//             </div>

//             <div className="flex items-start">
//               <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
//               <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
//                 I agree to the <a href="#" className="text-blue-600 underline hover:text-blue-500">terms and conditions</a>
//               </label>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-[#0B6D76] text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition"
//             >
//               {loading ? 'Submitting...' : 'Submit Application'}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }