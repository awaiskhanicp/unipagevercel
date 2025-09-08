'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaGlobe, FaPhone } from 'react-icons/fa';
import { MdOutlineMail } from 'react-icons/md';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import Swal from 'sweetalert2';
import Image from 'next/image';

import free from "../../../../public/assets/free_consulation.png";

// Custom Components
import Heading from '../../components/atoms/Heading';
import Container from '../../components/atoms/Container';
import Paragraph from '../../components/atoms/Paragraph';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import CountrySelect from '../../components/atoms/CountrySelect';
import Select from '../../components/atoms/Select';

// --- Types that match your API rows ---
type Country = { id: number; name: string };
type StateRow = { id: number; name: string };
type City = { id: number; name: string };

// If your Select expects {label, value}
type Option = { label: string; value: string };

function toOptions<T extends { id: number; name: string }>(rows?: T[]): Option[] {

  if (!Array.isArray(rows)) return [];
  return rows.map(r => ({ label: r.name, value: String(r.id) }));
}

// Helper to read value for both native events and custom values
function readSelectValue(eOrValue: any): string {
  // If your <Select> forwards native event:
  if (eOrValue?.target?.value !== undefined) return eOrValue.target.value as string;
  // If it sends the value directly:
  return String(eOrValue ?? '');
}

const FreeConsultation = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    last_education: '',
    country: '', // store as stringified ID
    state: '',   // store as stringified ID
    city: '',    // store as stringified ID
    interested_country: '',
    apply_for: ''
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<StateRow[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Derived numeric IDs for fetching
  const countryId = formData.country ? Number(formData.country) : undefined;
  const stateId = formData.state ? Number(formData.state) : undefined;

  // --- Countries ---
useEffect(() => {
  const controller = new AbortController();

  const fetchCountries = async () => {
    try {
      const res = await fetch(`/api/internal/countries_db`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Failed to fetch countries: ${res.status}`);
      const data = await res.json();

      setCountries(data.countries || []);
    } catch (err) {
      if (err.name === 'AbortError') return; // fetch aborted
      console.error('Error fetching countries:', err);
      setCountries([]);
    }
  };

  fetchCountries();

  return () => controller.abort(); // cleanup
}, []);

// --- States (dependent on country) ---
useEffect(() => {
  if (!countryId) {
    setStates([]);
    setCities([]);
    return;
  }

  const controller = new AbortController();

  const fetchStates = async () => {
    try {
      setStates([]); // reset states on country change
      setCities([]); // reset cities on country change

      const res = await fetch(
        `/api/internal/states_db?countryId=${countryId}`,
        { signal: controller.signal }
      );
      if (!res.ok) throw new Error(`Failed to fetch states: ${res.status}`);
      const data = await res.json();
      setStates(data.states || []);
    } catch (err) {
      if (err.name === 'AbortError') return; // fetch aborted
      console.error('Error fetching states:', err);
      setStates([]);
    }
  };

  fetchStates();

  return () => controller.abort();
}, [countryId]);

// --- Cities (dependent on state) ---
useEffect(() => {
  if (!stateId) {
    setCities([]);
    return;
  }

  const controller = new AbortController();

  const fetchCities = async () => {
    try {
      setCities([]); // reset cities on state change

      const res = await fetch(
        `${window.location.origin}/api/internal/cities_db?stateId=${stateId}`,
        { signal: controller.signal }
      );
      if (!res.ok) throw new Error(`Failed to fetch cities: ${res.status}`);
      const data = await res.json();
      setCities(data.cities || []);
    } catch (err) {
      if (err.name === 'AbortError') return; // fetch aborted
      console.error('Error fetching cities:', err);
      setCities([]);
    }
  };

  fetchCities();

  return () => controller.abort();
}, [stateId]);


  // Generic handler for text/inputs
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Specific handlers for dependent selects
  const handleCountryChange = (eOrValue: any) => {
    const value = readSelectValue(eOrValue); // string id or ''
    setFormData(prev => ({
      ...prev,
      country: value,
      state: '', // reset child
      city: ''   // reset grandchild
    }));
  };

  const handleStateChange = (eOrValue: any) => {
    const value = readSelectValue(eOrValue);
    setFormData(prev => ({
      ...prev,
      state: value,
      city: '' // reset child
    }));
  };

  const handleCityChange = (eOrValue: any) => {
    const value = readSelectValue(eOrValue);
    setFormData(prev => ({ ...prev, city: value }));
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {

      setIsLoading(true);

      // If your API wants numbers, coerce them here:
      const payload = {
        ...formData,
        country: formData.country ? Number(formData.country) : null,
        state:   formData.state ? Number(formData.state) : null,
        city:    formData.city ? Number(formData.city) : null,
      };

      const response = await fetch("/api/internal/freeconsulation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if(!response.ok){
        const data = await response.json();
        const errorMessages = Object.values(data.message).flat().join(", ");
        
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: errorMessages || 'An error occurred',
        });
      }

      //await axios.post('/api/internal/freeconsulation', payload);

      const data = await response.json();

      Swal.fire('Success!', data.message, 'success');

      setFormData({
        name: '',
        email: '',
        phone_number: '',
        last_education: '',
        country: '',
        state: '',
        city: '',
        interested_country: '',
        apply_for: ''
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      setIsLoading(false);
      Swal.fire('Error', 'Submission failed. Try again later.', 'error');
    } finally{
      setIsLoading(false);
    }
  };

  // Build options for your Select component
  const countryOptions = toOptions(countries);
  const stateOptions   = toOptions(states);
  const cityOptions    = toOptions(cities);

  return (
    <Container>
      <div className="text-center bottom-session-space banner-bottom-space">
        {/* Heading */}
        <div className="pb-6 md:pt-[0px] sm:pt-[80px] pt-[80px]">
          <Heading level={3}>
            Free <span className="text-[#0B6D76] font-medium">Consultation</span>
          </Heading>
          <div className="max-w-[700px] mx-auto">
            <Paragraph>
              Complete the form below and our experts will contact you within 24 hours.
            </Paragraph>
          </div>
        </div>

        {/* Form + Image Section */}
        <div className="grid md:grid-cols-2 gap-[80px] items-start">
          {/* Form */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                icon={<FaUser />}
                placeholder="Enter Your Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              <Input
                icon={<MdOutlineMail />}
                placeholder="Enter Your Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              <Input
                icon={<FaPhone />}
                placeholder="Enter Your Phone Number"
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
              />
              <CountrySelect
                name="last_education"
                icon={<HiOutlineAcademicCap />}
                placeholder="Select Last Education"
                value={formData.last_education}
                onChange={handleChange}
                options={['Matric', 'Intermediate', 'Bachelor', 'Master']}
              />

              {/* Country / State / City */}
              <CountrySelect
                name="country"
                icon={<FaGlobe />}
                placeholder="Select Country"
                value={formData.country}           // string id
                onChange={handleCountryChange}      // resets state/city and loads states
                options={countryOptions}            // [{label, value}]
              />
              <CountrySelect
                name="state"
                icon={<FaGlobe />}
                placeholder={formData.country ? "Select State" : "Select Country first"}
                value={formData.state}              // string id
                onChange={handleStateChange}        // resets city and loads cities
                options={stateOptions}
              />
              <CountrySelect
                name="city"
                icon={<FaGlobe />}
                placeholder={formData.state ? "Select City" : "Select State first"}
                value={formData.city}               // string id
                onChange={handleCityChange}
                options={cityOptions}
              />

              {/* Interested Country */}
              <Select
                name="interested_country"
                icon={<FaGlobe />}
                placeholder="Select Interested Country"
                value={formData.interested_country}
                onChange={handleChange}
                options={['Italy', 'UK', 'France', 'Turkey', 'China', 'Cyprus', 'Others']}
              />
              <Input
                icon={<FaUser />}
                placeholder="Apply For (e.g., Study Visa)"
                name="apply_for"
                value={formData.apply_for}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" disabled={isLoading}>{isLoading ? "Submitting" : "Submit"}</Button>
          </form>

          {/* Image Section */}
          <div className="relative rounded-3xl overflow-visible shadow-lg h-full">
            <Image
              src={free}
              alt="Education Consultation"
              width={600}
              height={400}
              className="w-full h-full rounded-[24px] md:block sm:hidden hidden object-cover relative z-0"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B6D76] to-transparent opacity-50 rounded-[24px]"></div>
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Why Choose Us?</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> 100% Free Consultation
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Expert Advisors
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> 95% Visa Success Rate
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default FreeConsultation;
