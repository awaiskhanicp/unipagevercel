// src/utils/countryStateCityAPI.js
const API_KEY = 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA==';

export const getCountries = async () => {
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

export const getCities = async (countryIso) => {
  if (!countryIso) return [];
  
  try {
    const response = await fetch(`https://api.countrystatecity.in/v1/countries/${countryIso}/cities`, {
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