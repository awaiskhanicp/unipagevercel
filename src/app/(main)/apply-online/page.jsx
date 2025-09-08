'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Heading from '../../components/atoms/Heading';
import { FaUser, FaGlobe, FaGlobeAmericas } from 'react-icons/fa';
import { MdOutlineMail, MdOutlinePhoneEnabled } from "react-icons/md";
import { HiOutlineAcademicCap, HiOutlineCheckCircle } from 'react-icons/hi';
import { FaCity } from "react-icons/fa";
import Button from '../../components/atoms/Button';
import Container from '../../components/atoms/Container';
import Paragraph from '../../components/atoms/Paragraph';
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';

const API_KEY = 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA==';

const ApplyOnline = () => {
  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '',
    student_phone_number: '',
    student_last_education: '',
    student_country: '',
    student_state: '',
    student_city: '',
    interested_country: '',
    student_apply_for: '',
    application_type: 'online',
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [interestedCountryStates, setInterestedCountryStates] = useState([]);
  const [interestedCountryCities, setInterestedCountryCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingInterestedStates, setLoadingInterestedStates] = useState(false);
  const [loadingInterestedCities, setLoadingInterestedCities] = useState(false);

  // Store ISO codes for countries and states
  const [countryIso, setCountryIso] = useState('');
  const [stateIso, setStateIso] = useState('');
  const [interestedCountryIso, setInterestedCountryIso] = useState('');
  const [interestedStateIso, setInterestedStateIso] = useState('');

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://api.countrystatecity.in/v1/countries', {
        headers: {
          'X-CSCAPI-KEY': API_KEY
        }
      });
      const countriesData = await response.json();
      setCountries(countriesData.map(country => ({
        id: country.iso2,
        name: country.name
      })));
    } catch (error) {
      console.error('Error fetching countries:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load countries. Please refresh the page.',
      });
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchStates = async (countryIso) => {
    if (!countryIso) {
      setStates([]);
      return;
    }
    
    setLoadingStates(true);
    try {
      const response = await fetch(`https://api.countrystatecity.in/v1/countries/${countryIso}/states`, {
        headers: {
          'X-CSCAPI-KEY': API_KEY
        }
      });
      const statesData = await response.json();
      setStates(statesData.map(state => ({
        id: state.iso2,
        name: state.name
      })));
    } catch (error) {
      console.error('Error fetching states:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load states.',
      });
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async (countryIso, stateIso = '') => {
    if (!countryIso) {
      setCities([]);
      return;
    }
    
    setLoadingCities(true);
    try {
      let url = `https://api.countrystatecity.in/v1/countries/${countryIso}/cities`;
      if (stateIso) {
        url = `https://api.countrystatecity.in/v1/countries/${countryIso}/states/${stateIso}/cities`;
      }
      
      const response = await fetch(url, {
        headers: {
          'X-CSCAPI-KEY': API_KEY
        }
      });
      const citiesData = await response.json();
      setCities(citiesData.map(city => ({
        id: city.id,
        name: city.name
      })));
    } catch (error) {
      console.error('Error fetching cities:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load cities.',
      });
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchInterestedCountryStates = async (countryIso) => {
    if (!countryIso) {
      setInterestedCountryStates([]);
      return;
    }
    
    setLoadingInterestedStates(true);
    try {
      const response = await fetch(`https://api.countrystatecity.in/v1/countries/${countryIso}/states`, {
        headers: {
          'X-CSCAPI-KEY': API_KEY
        }
      });
      const statesData = await response.json();
      setInterestedCountryStates(statesData.map(state => ({
        id: state.iso2,
        name: state.name
      })));
    } catch (error) {
      console.error('Error fetching interested country states:', error);
    } finally {
      setLoadingInterestedStates(false);
    }
  };

  const fetchInterestedCountryCities = async (countryIso, stateIso = '') => {
    if (!countryIso) {
      setInterestedCountryCities([]);
      return;
    }
    
    setLoadingInterestedCities(true);
    try {
      let url = `https://api.countrystatecity.in/v1/countries/${countryIso}/cities`;
      if (stateIso) {
        url = `https://api.countrystatecity.in/v1/countries/${countryIso}/states/${stateIso}/cities`;
      }
      
      const response = await fetch(url, {
        headers: {
          'X-CSCAPI-KEY': API_KEY
        }
      });
      const citiesData = await response.json();
      setInterestedCountryCities(citiesData.map(city => ({
        id: city.id,
        name: city.name
      })));
    } catch (error) {
      console.error('Error fetching interested country cities:', error);
    } finally {
      setLoadingInterestedCities(false);
    }
  };

  const handleChange = async (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));

    // Handle dependent data fetching
    if (field === 'student_country') {
      const selectedCountry = countries.find(c => c.name === value);
      if (selectedCountry) {
        setCountryIso(selectedCountry.id);
        await fetchStates(selectedCountry.id);
        setFormData(prev => ({ ...prev, student_state: '', student_city: '' }));
        setStateIso('');
      }
    } else if (field === 'student_state') {
      const selectedState = states.find(s => s.name === value);
      if (selectedState) {
        setStateIso(selectedState.id);
        await fetchCities(countryIso, selectedState.id);
        setFormData(prev => ({ ...prev, student_city: '' }));
      }
    } else if (field === 'interested_country') {
      const selectedCountry = countries.find(c => c.name === value);
      if (selectedCountry) {
        setInterestedCountryIso(selectedCountry.id);
        await fetchInterestedCountryStates(selectedCountry.id);
      }
    } else if (field === 'interested_state') {
      const selectedState = interestedCountryStates.find(s => s.name === value);
      if (selectedState) {
        setInterestedStateIso(selectedState.id);
        await fetchInterestedCountryCities(interestedCountryIso, selectedState.id);
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Required fields for online_consultants table
    const requiredFields = ['student_name', 'student_phone_number', 'student_last_education', 'interested_country', 'student_apply_for'];
    
    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    if (formData.student_email && !emailRegex.test(formData.student_email)) {
      newErrors.student_email = 'Enter a valid email';
    }

    const phoneDigits = formData.student_phone_number?.replace(/\D/g, '') || '';
    if (formData.student_phone_number && phoneDigits.length < 8) {
      newErrors.student_phone_number = 'Enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const payload = {
      student_name: formData.student_name,
      student_email: formData.student_email || '',
      student_phone_number: formData.student_phone_number,
      student_last_education: formData.student_last_education,
      student_country: formData.student_country || '',
      student_state: formData.student_state || '',
      student_city: formData.student_city || '',
      interested_country: formData.interested_country,
      student_apply_for: formData.student_apply_for,
      application_type: formData.application_type,
    };

    try {
      const res = await fetch('/api/internal/online-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setFormData({
          student_name: '',
          student_email: '',
          student_phone_number: '',
          student_last_education: '',
          student_country: '',
          student_state: '',
          student_city: '',
          interested_country: '',
          student_apply_for: '',
          application_type: 'online',
        });

        Swal.fire({
          icon: 'success',
          title: 'Application Submitted',
          text: 'Your application has been submitted successfully!',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: data.message || 'Please try again later.',
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error Occurred',
        text: 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) =>
    errors[field] ? <p className="text-red-500 text-sm mt-1">{errors[field]}</p> : null;

  // Education options
  const educationOptions = ['Matric', 'Intermediate', 'Bachelor', 'Master'];
  
  // Application options
  const applyForOptions = ['IELTS', 'Study', 'Both'];

  const IntrestedCountries = ['Italy', 'UK', 'France', 'Turkey', 'China', 'Cyprus', 'Others'];

  return (
    <Container>
      <div className="text-center bottom-session-space banner-bottom-space">
        <div className="text-bottom-space md:pt-[0px] sm:pt-[80px] pt-[80px]">
          <Heading level={3}>
            Apply <span className="text-[#0B6D76] font-medium"> Online</span>
          </Heading>
          <div className="max-w-[700px] md:mt-[20px] sm:mt-[10px]  mt-[10px] mx-auto">
            <Paragraph>
              Please complete the form below to initiate your study abroad application.
            </Paragraph>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-[80px] items-center">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 w-full">
            <div className="grid xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4">
              <div>
                <Input icon={<FaUser />} placeholder="Enter Your Name" name="student_name" value={formData.student_name} onChange={e => handleChange('student_name', e.target.value)} />
                {renderError('student_name')}
              </div>
              <div>
                <Input icon={<MdOutlineMail />} placeholder="Enter Your Email" name="student_email" value={formData.student_email} onChange={e => handleChange('student_email', e.target.value)} />
                {renderError('student_email')}
              </div>
              <div>
                <Input icon={<MdOutlinePhoneEnabled />} placeholder="Phone" name="student_phone_number" value={formData.student_phone_number} onChange={e => handleChange('student_phone_number', e.target.value)} />
                {renderError('student_phone_number')}
              </div>
              <div>
                <Select 
                  name="student_last_education" 
                  icon={<HiOutlineAcademicCap />} 
                  placeholder="Enter Last Education" 
                  value={formData.student_last_education} 
                  onChange={e => handleChange('student_last_education', e.target.value)} 
                  options={educationOptions} 
                />
                {renderError('student_last_education')}
              </div>
              <div>
                <Select 
                  name="student_country" 
                  icon={<FaGlobe />} 
                  placeholder={loadingCountries ? "Loading countries..." : "Select Country"} 
                  value={formData.student_country} 
                  onChange={e => handleChange('student_country', e.target.value)} 
                  options={countries.map(c => c.name)} 
                  disabled={loadingCountries}
                />
                {renderError('student_country')}
              </div>
              <div>
                <Select 
                  name="student_state" 
                  icon={<FaGlobeAmericas />} 
                  placeholder={loadingStates ? "Loading states..." : "Select State"} 
                  value={formData.student_state} 
                  onChange={e => handleChange('student_state', e.target.value)} 
                  options={states.map(s => s.name)} 
                  disabled={loadingStates || !formData.student_country}
                />
                {renderError('student_state')}
              </div>
              <div>
                <Select 
                  name="student_city" 
                  icon={<FaCity />} 
                  placeholder={loadingCities ? "Loading cities..." : "Select City"} 
                  value={formData.student_city} 
                  onChange={e => handleChange('student_city', e.target.value)} 
                  options={cities.map(c => c.name)} 
                  disabled={loadingCities || !formData.student_state}
                />
                {renderError('student_city')}
              </div>
              <div>
                <Select 
                  name="interested_country" 
                  icon={<FaGlobe />} 
                  placeholder="Select Interest Country" 
                  value={formData.interested_country} 
                  onChange={e => handleChange('interested_country', e.target.value)} 
                  options={IntrestedCountries} 
                />
                {renderError('interested_country')}
              </div>
            </div>

            <div>
              <Select 
                name="student_apply_for" 
                icon={<HiOutlineCheckCircle />} 
                placeholder="Apply For" 
                value={formData.student_apply_for} 
                onChange={e => handleChange('student_apply_for', e.target.value)} 
                options={applyForOptions} 
              />
              {renderError('student_apply_for')}
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Submit Application'}
            </Button>
          </form>

          <div className="relative rounded-3xl overflow-visible shadow-lg">
            <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 h-[80%] w-[30px] bg-[var(--brand-color)] rounded-bl-3xl rounded-tl-3xl z-10"></div>
            <img
              src="/assets/aply.png"
              alt="Apply Online"
              className="w-full rounded-[24px] md:block sm:hidden hidden object-cover relative z-0"
            />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ApplyOnline;