'use client'
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import {
  MapPin,
  Clock,
  CheckCircle,
  Star,
  Users,
  FileText,
  Shield,
  TrendingUp,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import UniversityCountryatom from "../../../../app/components/atoms/UniversityCountryatom";
import Button from "../../../../app/components/atoms/Button";

export default function VisitVisaDetailPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const [country, setCountry] = useState(null);
  const [countries, setCountries] = useState([]);
  const [visaRequirements, setVisaRequirements] = useState([]);
  const [visaFaqs, setVisaFaqs] = useState([]);
  const [adminVisaTypes, setAdminVisaTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const routeParams = useParams();
  const slug = Array.isArray(routeParams?.slug) ? routeParams.slug[0] : routeParams?.slug;

  const toSlug = (value) => {
    if (!value) return '';
    return value
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const safeImage = (url) => {
    if (!url) return '/assets/visit.png';
    const str = url.toString();
    if (str.startsWith('/filemanager')) return '/assets/visit.png';
    return str;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!slug) {
          return;
        }
        
        // First try to fetch from API
        try {
          // Try targeted search first
          const baseSlugSearch = (slug || '').replace('-visit-visa', '');
          let countriesRes = await fetch(`/api/internal/visa-country?search=${encodeURIComponent(baseSlugSearch)}&limit=50`);
          if (!countriesRes.ok) throw new Error('Failed to fetch countries');
          
          const countriesData = await countriesRes.json();
          
          if (!countriesData.success || !Array.isArray(countriesData.data)) {
            throw new Error('Invalid countries data format');
          }
          
          let fetchedCountries = countriesData.data;

          // If nothing matched with search, widen the fetch
          if (!fetchedCountries || fetchedCountries.length === 0) {
            countriesRes = await fetch(`/api/internal/visa-country?limit=500`);
            if (!countriesRes.ok) throw new Error('Failed to fetch countries');
            const allCountriesData = await countriesRes.json();
            if (!allCountriesData.success || !Array.isArray(allCountriesData.data)) {
              throw new Error('Invalid countries data format');
            }
            fetchedCountries = allCountriesData.data;
          }

          setCountries(fetchedCountries);
          
          // Find the matching country
          const baseSlug = (slug || '').replace('-visit-visa', '');
          const match = fetchedCountries.find((c) => {
            const recordSlug = (c.slug || '').toString().toLowerCase();
            const nameSlug = toSlug(c.country_name || '');
            return recordSlug === baseSlug || nameSlug === baseSlug;
          });
          
          if (match) {
            // Try to fetch full country details
            try {
              const countryRes = await fetch(`/api/internal/visa-country/${match.id}`);
              if (!countryRes.ok) throw new Error('Failed to fetch country details');
              
              const countryData = await countryRes.json();
              
              if (countryData.success) {
                setCountry(countryData.data);
              } else {
                setCountry(match); // Fallback to basic data
              }
            } catch (detailErr) {
              console.warn('Using fallback country data:', detailErr.message);
              setCountry(match);
            }

            // Fetch visa requirements for this country
            try {
              const requirementsRes = await fetch(`/api/internal/visa-requirements?visa_country_id=${match.id}`);
              if (requirementsRes.ok) {
                const requirementsData = await requirementsRes.json();
                if (requirementsData.success) {
                  setVisaRequirements(requirementsData.data);
                }
              }
            } catch (reqErr) {
              console.warn('Failed to fetch visa requirements:', reqErr.message);
            }

            // Fetch visa FAQs for this country
            try {
              const faqsRes = await fetch(`/api/internal/visa-faqs?visa_country_id=${match.id}`);
              if (faqsRes.ok) {
                const faqsData = await faqsRes.json();
                if (faqsData.data) {
                  setVisaFaqs(faqsData.data);
                }
              }
            } catch (faqErr) {
              console.warn('Failed to fetch visa FAQs:', faqErr.message);
            }

            // Fetch visa types for this country
            try {
              const typesRes = await fetch(`/api/internal/visa-types?visa_country_id=${match.id}`);
              if (typesRes.ok) {
                const typesData = await typesRes.json();
                if (typesData.success) {
                  setAdminVisaTypes(typesData.data);
                }
              }
            } catch (typeErr) {
              console.warn('Failed to fetch visa types:', typeErr.message);
            }
          } else {
            // Fallback to a minimal dynamic country object derived from slug
            const derivedName = baseSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            setCountry({
              id: 0,
              banner_image: '/assets/visit.png',
              country_name: derivedName || 'Visit Visa',
              description: '',
              currency: 'USD',
              discount_price: null,
              price: '0',
              slug: baseSlug,
              visa_details: [],
              visa_faqs: [],
              visa_requirements: [],
              visa_types: [],
            });
            return;
          }
        } catch (apiErr) {
          console.warn('API failed, using fallback data:', apiErr.message);
          // Fallback to static data if API fails
          const fallbackCountries = getFallbackCountries();
          setCountries(fallbackCountries);
          
           const baseSlug2 = (slug || '').replace('-visit-visa', '');
           const match = fallbackCountries.find((c) => {
             const recordSlug = (c.slug || '').toString().toLowerCase();
             const nameSlug = toSlug(c.country_name || '');
             return recordSlug === baseSlug2 || nameSlug === baseSlug2;
           });
          
          if (match) {
            setCountry(match);
            
            // Fetch visa requirements for this country
            try {
              const requirementsRes = await fetch(`/api/internal/visa-requirements?visa_country_id=${match.id}`);
              if (requirementsRes.ok) {
                const requirementsData = await requirementsRes.json();
                if (requirementsData.success) {
                  setVisaRequirements(requirementsData.data);
                }
              }
            } catch (reqErr) {
              console.warn('Failed to fetch visa requirements:', reqErr.message);
            }

            // Fetch visa FAQs for this country
            try {
              const faqsRes = await fetch(`/api/internal/visa-faqs?visa_country_id=${match.id}`);
              if (faqsRes.ok) {
                const faqsData = await faqsRes.json();
                if (faqsData.data) {
                  setVisaFaqs(faqsData.data);
                }
              }
            } catch (faqErr) {
              console.warn('Failed to fetch visa FAQs:', faqErr.message);
            }

            // Fetch visa types for this country
            try {
              const typesRes = await fetch(`/api/internal/visa-types?visa_country_id=${match.id}`);
              if (typesRes.ok) {
                const typesData = await typesRes.json();
                if (typesData.success) {
                  setAdminVisaTypes(typesData.data);
                }
              }
            } catch (typeErr) {
              console.warn('Failed to fetch visa types:', typeErr.message);
            }
          } else {
            const derivedName = baseSlug2.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            setCountry({
              id: 0,
              banner_image: '/assets/visit.png',
              country_name: derivedName || 'Visit Visa',
              description: '',
              currency: 'USD',
              discount_price: null,
              price: '0',
              slug: baseSlug2,
              visa_details: [],
              visa_faqs: [],
              visa_requirements: [],
              visa_types: [],
            });
            return;
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  function getFallbackCountries() {
    return [
      {
        id: 3,
        banner_image: "/uploads/1753526315261.png",
        country_name: "Barbara Robbins",
        description: "Natus incididunt deb",
        currency: "USD",
        discount_price: "66.99",
        price: "77",
        slug: "barbara-robbins",
        visa_details: [],
        visa_faqs: [
          {
            title: "In esse maiores dist",
            description: "Hic libero laboris"
          }
        ],
        visa_requirements: [
          {
            title: "Sit nisi magna unde",
            description: "In consequat Conseq"
          }
        ],
        visa_types: [
          {
            name: "Eum consectetur con",
            description: "Sed non ad nostrud o"
          }
        ]
      },
      {
        id: 4,
        banner_image: "/uploads/example1.jpg",
        country_name: "Example Country 1",
        description: "Example description 1",
        currency: "USD",
        discount_price: "80",
        price: "100",
        slug: "example-country-1"
      },
      {
        id: 5,
        banner_image: "/uploads/example2.jpg",
        country_name: "Example Country 2",
        description: "Example description 2",
        currency: "EUR",
        discount_price: null,
        price: "120",
        slug: "example-country-2"
      }
    ];
  }

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error: {error}</div>;
  }

  if (!country) {
    return <div className="text-center py-12">Country not found</div>;
  }

  // Process visa requirements - use admin-added data if available, otherwise fallback
  const requirements = visaRequirements.length > 0
    ? visaRequirements.map(req => ({
        title: req.title || "Visa Requirements",
        items: req.description?.split('\n').filter(item => item.trim()) || []
      }))
    : country.visa_requirements?.length > 0
    ? country.visa_requirements.map(req => ({
        title: req.title || "Visa Requirements",
        items: req.description?.split('\n').filter(item => item.trim()) || []
      }))
    : [
        {
          title: "Visa Requirements",
          items: [
            "Valid passport with at least 6 months validity",
            "Completed visa application form"
          ]
        }
      ];

  // Process visa FAQs - use admin-added data if available, otherwise fallback
  const faqs = visaFaqs.length > 0
    ? visaFaqs.map(faq => ({
        title: faq.title || "FAQ",
        description: faq.description || "No description available"
      }))
    : country.visa_faqs?.length > 0
    ? country.visa_faqs.map(faq => ({
        title: faq.title || "FAQ",
        description: faq.description || "No description available"
      }))
    : [
        {
          title: "What is the processing time?",
          description: "Processing typically takes 5-10 business days."
        }
      ];

  // Process visa types - use admin-added data if available, otherwise fallback
  const visaTypes = adminVisaTypes.length > 0
    ? adminVisaTypes.map(type => ({
        name: type.name || "Visa Type",
        description: type.country_name || "No description available"
      }))
    : country.visa_types?.length > 0
    ? country.visa_types.map(type => ({
        name: type.name || "Visa Type",
        description: type.description || type.visa_type_name || "No description available"
      }))
    : [
        {
          name: "Tourist Visa",
          description: "For tourism and leisure visits"
        }
      ];

  // Filter and limit other countries to max 3
  const otherCountries = countries
    .filter(c => c.id !== country?.id)
    .slice(0, 3)
    .map((country) => {
      const baseSlug = country.slug || toSlug(country.country_name || '');
      return {
        id: country.id,
        name: country.country_name,
        image: safeImage(country.banner_image || country.country_image),
        slug: `${baseSlug}-visit-visa`,
        price: country.discount_price || country.price,
        currency: country.currency,
      };
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${safeImage(country.banner_image) || '/assets/default-banner.jpg'}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        </div>
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {country.country_name}
                <span className="block text-primary-glow">Visit Visa</span>
              </h1>
              <p className="text-xl mb-6 opacity-90">
                {country.description || `Discover the beauty of ${country.country_name} with our visa services.`}
                {country.discount_price && ' Discount available!'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Rating and Overview */}
            <div className="bg-card rounded-lg shadow-xl p-12">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400" />
                  ))}
                  <span className="text-lg font-semibold ml-2 text-foreground">4.5</span>
                </div>
                <span className="inline-block px-2 py-0.5 text-xs rounded bg-secondary text-foreground">
                  {country.visa_details?.[0]?.review_count || '156'} reviews
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {country.visa_details?.[0]?.visa_description || 
                  `${country.country_name} visit visa: Find all required documents, fees, and complete information on visa requirements.`}
              </p>
            </div>

            {/* Visa Requirements */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
              <div className="border-b p-6 bg-gradient-to-r from-[#E7F1F2] to-[#d6eaeb]">
                <div className="flex items-center gap-2 text-xl font-semibold text-[#0B6D76]">
                  <FileText className="h-6 w-6" />
                  Visa Requirements
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Complete documentation requirements for your visit.
                </p>
              </div>

              <div className="divide-y">
                {requirements.map((req, idx) => {
                  const isOpen = openIndex === idx;
                  return (
                    <div key={idx} className="transition-all duration-300">
                      <button
                        onClick={() => toggleAccordion(idx)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left font-medium text-gray-800 hover:text-[#0B6D76] focus:outline-none"
                      >
                        <span>{req.title}</span>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180 text-[#0B6D76]' : ''}`}
                        />
                      </button>
                      <div
                        className={`px-6 overflow-hidden transition-all ${isOpen ? 'max-h-[1000px] py-4' : 'max-h-0'}`}
                      >
                        <ul className="space-y-3 bg-[#0B6D76] p-4 rounded-lg">
                          {req.items.length > 0 ? (
                            req.items.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-white">
                                <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0 text-white" />
                                {item}
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-white">No requirements listed</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visa Types */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
              <div className="border-b p-6 bg-gradient-to-r from-[#E7F1F2] to-[#d6eaeb]">
                <div className="flex items-center gap-2 text-xl font-semibold text-[#0B6D76]">
                  <FileText className="h-6 w-6" />
                  Visa Types
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Different visa options available for {country.country_name}.
                </p>
              </div>

              <div className="p-6 grid md:grid-cols-2 gap-4">
                {visaTypes.map((type, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg text-[#0B6D76]">{type.name}</h3>
                    <p className="text-gray-600 mt-2">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs Section */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
              <div className="border-b p-6 bg-gradient-to-r from-[#E7F1F2] to-[#d6eaeb]">
                <div className="flex items-center gap-2 text-xl font-semibold text-[#0B6D76]">
                  <FileText className="h-6 w-6" />
                  Frequently Asked Questions
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Common questions about {country.country_name} visit visa.
                </p>
              </div>

              <div className="divide-y">
                {faqs.map((faq, idx) => {
                  const isOpen = openIndex === idx + requirements.length;
                  return (
                    <div key={idx} className="transition-all duration-300">
                      <button
                        onClick={() => toggleAccordion(idx + requirements.length)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left font-medium text-gray-800 hover:text-[#0B6D76] focus:outline-none"
                      >
                        <span>{faq.title}</span>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180 text-[#0B6D76]' : ''}`}
                        />
                      </button>
                      <div
                        className={`px-6 overflow-hidden transition-all ${isOpen ? 'max-h-[1000px] py-4' : 'max-h-0'}`}
                      >
                        <div className="pb-4 text-gray-700">
                          {faq.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Features */}
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Clock className="h-6 w-6 text-primary" />,
                  title: "Fast Processing",
                  desc: "Quick visa processing with expert guidance.",
                  bg: "bg-primary/10 text-primary",
                },
                {
                  icon: <Shield className="h-6 w-6 text-green-600" />,
                  title: "Secure Process",
                  desc: "Your documents and personal information are completely secure.",
                  bg: "bg-green-100 text-green-600",
                },
                {
                  icon: <Users className="h-6 w-6 text-blue-500" />,
                  title: "Expert Support",
                  desc: "Dedicated team to help you throughout your visa journey.",
                  bg: "bg-blue-100 text-blue-500",
                },
                {
                  icon: <TrendingUp className="h-6 w-6 text-orange-500" />,
                  title: "High Success Rate",
                  desc: "Over 95% success rate in visa approvals.",
                  bg: "bg-orange-100 text-orange-500",
                },
              ].map((feat, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${feat.bg}`}>
                      {feat.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{feat.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="rounded-2xl shadow-md border border-gray-200 overflow-hidden bg-white">
              <div className="text-center p-6 border-b bg-gray-50">
                <div className="flex items-center justify-center gap-2 text-lg font-semibold text-[#0B6D76]">
                  <MapPin className="h-5 w-5" />
                  {country.country_name}
                </div>
                <p className="text-sm text-gray-500 mt-1">Consultation Fee</p>
              </div>

              <div className="p-6 space-y-4 text-center">
                {country.discount_price && (
                  <span className="inline-block bg-[#0B6D76]/10 text-[#0B6D76] px-3 py-1 text-xs font-medium rounded-full">
                    Discounted
                  </span>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Discounted Fee:</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {country.currency} {country.discount_price || country.price}
                  </p>
                </div>
                {country.discount_price && (
                  <p className="text-sm text-gray-400 line-through">
                    Original Price: {country.currency} {country.price}
                  </p>
                )}
                <Link href={`/visa-apply-now/${country.slug || slug}`}>
                  <button className="w-full py-3 rounded-lg font-semibold text-white bg-[#0B6D76] hover:bg-[#09575f] transition">
                    Apply Now
                  </button>
                </Link>
              </div>
            </div>

            {/* Other Visa Countries - Limited to 3 */}
            <div className="bg-card rounded-lg shadow-xl px-[20px] overflow-hidden">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-[#0B6D76] mb-4">Other Visa Countries</h3>
                <div className="space-y-4">
                  {otherCountries.map((country) => (
                    <Link 
                      key={country.id} 
                      href={`/visit-visa-detail/${country.slug}`}
                      className="block group"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                          <img 
                            src={country.image} 
                            alt={country.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate group-hover:text-[#0B6D76] transition-colors">
                            {country.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {country.currency} {country.price}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#0B6D76] transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="py-6 flex gap-[20px]">
                <Link href={'/visit-visa'}>
                  <Button>View more countries</Button>
                </Link>
                <Link href={`/visa-apply-now/${country.slug || slug}`}>
                  <Button>Apply Now</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}