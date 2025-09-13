'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Image from 'next/image';
import { FaUser, FaGlobe, FaPhone, FaGraduationCap, FaCheckCircle } from 'react-icons/fa';
import { MdOutlineMail, MdLocationCity } from 'react-icons/md';
import { HiAcademicCap } from 'react-icons/hi';

// Custom Components
import Heading from '../../components/atoms/Heading';
import Container from '../../components/atoms/Container';
import Paragraph from '../../components/atoms/Paragraph';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';
import CountrySelect from '../../components/atoms/CountrySelect';

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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Education options
  const educationOptions = ['Matric', 'Intermediate', 'Bachelor', 'Master'];
  
  // Application options
  const applyForOptions = ['IELTS', 'Study', 'Both'];

  // Interested countries
  const interestedCountries = ['Italy', 'UK', 'France', 'Turkey', 'China', 'Cyprus', 'Others'];

  useEffect(() => {
    fetchCountries();
  }, []);

  // Helper function to convert data to options
  function toOptions(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map(r => ({ label: r.name, value: String(r.id) }));
  }

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/frontend/countries_db');
      const data = await response.json();
      
      if (data.countries && Array.isArray(data.countries)) {
        setCountries(data.countries);
      } else {
        throw new Error('Failed to load countries');
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      // Swal.fire({
      //   icon: 'error',
      //   title: 'Error',
      //   text: 'Failed to load countries. Please refresh the page.',
      // });
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchStates = async (countryId) => {
    if (!countryId) {
      setStates([]);
      setFormData(prev => ({ ...prev, student_state: '', student_city: '' }));
      return;
    }

    setLoadingStates(true);
    try {
      const response = await fetch(`/api/frontend/states_db?countryId=${countryId}`);
      const data = await response.json();

      if (data.states && Array.isArray(data.states)) {
        setStates(data.states);
      } else {
        throw new Error('Failed to load states');
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      // Swal.fire({
      //   icon: 'error',
      //   title: 'Error',
      //   text: 'Failed to load states.',
      // });
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async (stateId) => {
    if (!stateId) {
      setCities([]);
      setFormData(prev => ({ ...prev, student_city: '' }));
      return;
    }

    setLoadingCities(true);
    try {
      const response = await fetch(`/api/frontend/cities_db?stateId=${stateId}`);
      const data = await response.json();

      if (data.cities && Array.isArray(data.cities)) {
        setCities(data.cities);
      } else {
        throw new Error('Failed to load cities');
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      // Swal.fire({
      //   icon: 'error',
      //   title: 'Error',
      //   text: 'Failed to load cities.',
      // });
    } finally {
      setLoadingCities(false);
    }
  };

  // General handler
// General handler for all changes
const handleChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));

  // Clear error when field is updated
  if (errors[field]) {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }

  // Fetch states when country changes
  if (field === 'student_country') {
    setFormData(prev => ({ ...prev, student_state: '', student_city: '' })); // reset dependent fields
    fetchStates(value);
  }

  // Fetch cities when state changes
  if (field === 'student_state') {
    setFormData(prev => ({ ...prev, student_city: '' })); // reset dependent field
    fetchCities(value);
  }
};

// Handler for CountrySelect components (they pass DOM events)
const handleCountrySelectChange = (e) => { 
  const countryId = e.target.value;
  handleChange('student_country', countryId);
};

const handleStateSelectChange = (e) => {
  const stateId = e.target.value;
  handleChange('student_state', stateId);
};

const handleCitySelectChange = (e) => {
  const cityId = e.target.value;
  handleChange('student_city', cityId);
};

// Handler for regular input fields
const handleInputChange = (e) => {
  const { name, value } = e.target;
  handleChange(name, value);
};

// Handler for regular select fields
const handleSelectChange = (e) => {
  const { name, value } = e.target;
  handleChange(name, value);
};

interface ApplyFormData {
  student_name: string;
  student_email: string;
  student_phone_number: string;
  student_last_education: string;
  interested_country: string;
  student_apply_for: string;
}

type FormErrors = Partial<Record<keyof ApplyFormData, string>>;


const validate = () => {
  const newErrors: FormErrors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Required fields
  const requiredFields: (keyof ApplyFormData)[] = [
    'student_name',
    'student_phone_number',
    'student_last_education',
    'interested_country',
    'student_apply_for',
  ];

  requiredFields.forEach((field) => {
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
      const res = await fetch('/api/frontend/online-consultant', {
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
          text: 'Your application has been submitted successfully! Our consultant will contact you within 24 hours.',
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

  const countryOptions = toOptions(countries);
  const stateOptions = toOptions(states);
  const cityOptions = toOptions(cities);

  // Find current selected options for CountrySelect components
const currentCountryValue = formData.student_country || '';
const currentStateValue = formData.student_state || '';
const currentCityValue = formData.student_city || '';


  const renderError = (field) =>
    errors[field] ? <p className="text-red-500 text-sm mt-1">{errors[field]}</p> : null;

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-lightgreen-900 to-teal-800 text-white py-16">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <Heading level={4} className="mb-6">
              Start Your <span className="text-teal-300">Study Abroad</span> Journey Today
            </Heading>
            <Paragraph className="text-xl opacity-90 text-white">
              Complete the form below to get personalized guidance from our expert consultants. 
              We&apos;ll help you find the perfect program and university for your goals.
            </Paragraph>
          </div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-white">
        <Container>
          <Heading level={4} className="text-center mb-12">Why Apply With Us?</Heading>
          
          <div className="grid md:grid-cols-3 gap-8 mt-10 mb-10">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiAcademicCap className="text-2xl text-teal-600" />
              </div>
              <Heading level={4} className="mb-3">Expert Guidance</Heading>
              <Paragraph>
                Our consultants have years of experience helping students find the right programs 
                and universities across the globe.
              </Paragraph>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-2xl text-teal-600" />
              </div>
              <Heading level={4} className="mb-3">High Success Rate</Heading>
              <Paragraph>
                95% visa success rate with personalized application support and documentation guidance.
              </Paragraph>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGraduationCap className="text-2xl text-teal-600" />
              </div>
              <Heading level={4} className="mb-3">End-to-End Support</Heading>
              <Paragraph>
                From program selection to arrival at your university, we provide comprehensive support 
                throughout your journey.
              </Paragraph>
            </div>
          </div>
        </Container>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <Heading level={4} className="mb-6">
                Apply <span className="text-teal-600">Online</span>
              </Heading>
              
              <Paragraph className="mb-10">
                Please complete the form below to initiate your study abroad application. 
                Our team will review your information and contact you within 24 hours to discuss 
                the next steps.
              </Paragraph>
              
              <div className="bg-teal-50 p-4 pt-10 pb-10 rounded-lg mb-8 mt-10">
                <Heading level={4} className="mb-3 flex items-center">
                   What happens after you apply?
                </Heading>
                <ul className="space-y-6 mt-10">
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">✓</span>
                    <span>Our consultant will contact you within 24 hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">✓</span>
                    <span>We&apos;ll assess your profile and recommend suitable options</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">✓</span>
                    <span>You&apos;ll receive a personalized roadmap for your application process</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">✓</span>
                    <span>We&apos;ll guide you through documentation, tests, and visa process</span>
                  </li>
                </ul>
              </div>
           
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Input 
                      icon={<FaUser />} 
                      placeholder="Enter Your Full Name" 
                      name="student_name" 
                      value={formData.student_name} 
                      onChange={handleInputChange}
                      required
                    />
                    {renderError('student_name')}
                  </div>
                  
                  <div>
                    <Input 
                      icon={<MdOutlineMail />} 
                      placeholder="Enter Your Email" 
                      name="student_email" 
                      type="email"
                      value={formData.student_email} 
                      onChange={handleInputChange}
                    />
                    {renderError('student_email')}
                  </div>
                  
                  <div>
                    <Input 
                      icon={<FaPhone />} 
                      placeholder="Phone Number with Country Code" 
                      name="student_phone_number" 
                      value={formData.student_phone_number} 
                      onChange={handleInputChange}
                      required
                    />
                    {renderError('student_phone_number')}
                  </div>
                  
                  <div>
                    <Select 
                      name="student_last_education" 
                      icon={<HiAcademicCap />} 
                      placeholder="Select Last Education" 
                      value={formData.student_last_education} 
                      onChange={handleSelectChange} 
                      options={educationOptions}
                      required
                    />
                    {renderError('student_last_education')}
                  </div>
                  
                  {/* Country / State / City */}
                      <CountrySelect
                        name="student_country"
                        icon={<FaGlobe />}
                        placeholder="Select Country"
                        value={currentCountryValue}
                        onChange={handleCountrySelectChange}
                        options={countryOptions}
                      />

                      <CountrySelect
                        name="student_state"
                        icon={<MdLocationCity />}
                        placeholder={formData.student_country ? (loadingStates ? 'Loading states...' : 'Select State') : 'Select Country first'}
                        value={currentStateValue}
                        onChange={handleStateSelectChange}
                        options={stateOptions}
                        disabled={!formData.student_country || loadingStates}
                      />

                      <CountrySelect
                        name="student_city"
                        icon={<MdLocationCity />}
                        placeholder={formData.student_state ? (loadingCities ? 'Loading cities...' : 'Select City') : 'Select State first'}
                        value={currentCityValue}
                        onChange={handleCitySelectChange}
                        options={cityOptions}
                        disabled={!formData.student_state || loadingCities}
                      />

                  
                  <div>
                    <Select 
                      name="interested_country" 
                      icon={<FaGlobe />} 
                      placeholder="Select Country of Interest" 
                      value={formData.interested_country} 
                      onChange={handleSelectChange} 
                      options={interestedCountries}
                      required
                    />
                    {renderError('interested_country')}
                  </div>
                </div>
                
                <div>
                  <Select 
                    name="student_apply_for" 
                    icon={<FaCheckCircle />} 
                    placeholder="Select Program Type" 
                    value={formData.student_apply_for} 
                    onChange={handleSelectChange} 
                    options={applyForOptions}
                    required
                  />
                  {renderError('student_apply_for')}
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Submit Application'}
                </Button>
                
                <Paragraph className="text-center text-sm text-gray-600 mt-4">
                  By submitting this form, you agree to our Privacy Policy and consent to be contacted by our team.
                </Paragraph>
              </form>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default ApplyOnline;