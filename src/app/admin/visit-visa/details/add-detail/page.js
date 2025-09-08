'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Layout from '../../../../admin/components/Layout';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

const AddVisaDetail = () => {
  const router = useRouter();
  const [countries, setCountries] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMetaTags, setShowMetaTags] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const [form, setForm] = useState({
    country_id: '',
    visa_title: '',
    visa_description: '',
    sm_question: '',
    sm_answer: '',
    visa_image: '',
    seo: '',
    review_detail: '',
    rating_count: 0,
    review_count: 0,
    avg_review_value: 0,
    country_name: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/internal/visa-country');
        if (!res.ok) {
          throw new Error('Failed to fetch countries');
        }
        const data = await res.json();
        if (data?.success) {
          setCountries(data.data || []);
        } else {
          throw new Error(data?.message || 'Failed to fetch countries');
        }
      } catch (err) {
        console.error('Error fetching countries:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'country_id') {
      const selectedCountry = countries.find(c => c.id.toString() === value);
      setForm({
        ...form,
        country_id: value,
        country_name: selectedCountry?.country_name || ''
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setForm({ ...form, visa_image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.country_id || !form.visa_title || !form.visa_description) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/internal/visa-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          country_id: parseInt(form.country_id),
          review_detail: form.review_detail || ''
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save visa detail');
      }

      alert('Visa Detail Saved Successfully!');
      router.push(`/admin/visit-visa/details/${form.country_id}`);
    } catch (err) {
      console.error('Error:', err);
      alert(err.message || 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
          Add Visa Detail
        </h1>
        
        {isLoading ? (
          <div className="text-center py-4">Loading countries...</div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-2">Country</h2>
              <select
                name="country_id"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.country_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country.id} value={country.id}>
                    {country.country_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-2">Data Title</h2>
              <input
                type="text"
                name="visa_title"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.visa_title}
                onChange={handleChange}
                placeholder="Enter title"
                required
              />
            </div>

            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-2">Step</h2>
              <textarea
                name="visa_description"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.visa_description}
                onChange={handleChange}
                placeholder="Start Description"
                required
                rows={4}
              />
            </div>

            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-2">Scalma Method Question</h2>
              <input
                type="text"
                name="sm_question"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                value={form.sm_question}
                onChange={handleChange}
                placeholder="Enter question"
              />
              <h3 className="text-md font-medium mb-2">Scalma Method Answer</h3>
              <textarea
                name="sm_answer"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.sm_answer}
                onChange={handleChange}
                placeholder="Enter short description"
                rows={3}
              />
            </div>

            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-2">Visa Image</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="file"
                    id="visa_image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <label
                    htmlFor="visa_image"
                    className="inline-block px-4 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200"
                  >
                    Choose Image
                  </label>
                </div>
                {previewImage && (
                  <div className="w-20 h-20 border rounded-md overflow-hidden relative">
                    <Image 
                      src={previewImage} 
                      alt="Preview" 
                      fill
                      className="object-cover"
                      unoptimized // Since it's a preview of a user-uploaded image
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-2">Add Review</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Rating</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Author&apos;s Name</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Publisher&apos;s Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border">
                        <input 
                          type="text" 
                          className="w-full border-none focus:ring-0" 
                          value={form.rating_count}
                          onChange={(e) => setForm({...form, rating_count: parseInt(e.target.value) || 0})}
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input type="text" className="w-full border-none focus:ring-0" placeholder="(mm/dd/yyyy)" />
                      </td>
                      <td className="px-4 py-2 border">
                        <input type="text" className="w-full border-none focus:ring-0" />
                      </td>
                      <td className="px-4 py-2 border">
                        <input type="text" className="w-full border-none focus:ring-0" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4">
                <h3 className="text-md font-medium mb-2">Review&apos;s Name</h3>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mt-4">
                <h3 className="text-md font-medium mb-2">Review Description</h3>
                <textarea
                  name="review_detail"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.review_detail}
                  onChange={handleChange}
                  placeholder="Enter short description"
                  rows={3}
                />
              </div>
            </div>

            <div className="border-b pb-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowMetaTags(!showMetaTags)}
              >
                <h2 className="text-lg font-semibold">Meta Tags</h2>
                {showMetaTags ? <ChevronUp /> : <ChevronDown />}
              </div>
              
              {showMetaTags && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      name="meta_title"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={form.meta_title}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea
                      name="meta_description"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={form.meta_description}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                    <input
                      type="text"
                      name="meta_keywords"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={form.meta_keywords}
                      onChange={handleChange}
                      placeholder="Comma separated keywords"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/admin/visit-visa')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !form.country_id}
                className={`px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm transition-colors flex items-center gap-2 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                <Plus size={18} />
                {isSubmitting ? 'Saving...' : 'Save Detail'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default AddVisaDetail;















// 'use client';
// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Layout from '../../../../admin/components/Layout';
// import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

// const AddVisaDetail = () => {
//   const router = useRouter();
//   const [countries, setCountries] = useState([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showMetaTags, setShowMetaTags] = useState(false);
//   const [previewImage, setPreviewImage] = useState('');

//   const [form, setForm] = useState({
//     country_id: '',
//     visa_title: '',
//     visa_description: '',
//     sm_question: '',
//     sm_answer: '',
//     visa_image: '',
//     seo: '',
//     review_detail: '', // Make sure this is initialized
//     rating_count: 0,
//     review_count: 0,
//     avg_review_value: 0,
//     country_name: '',
//     meta_title: '',
//     meta_description: '',
//     meta_keywords: ''
//   });

//   useEffect(() => {
//     const fetchCountries = async () => {
//       try {
//         setIsLoading(true);
//         const res = await fetch('/api/internal/visa-country');
//         if (!res.ok) {
//           throw new Error('Failed to fetch countries');
//         }
//         const data = await res.json();
//         if (data?.success) {
//           setCountries(data.data || []);
//         } else {
//           throw new Error(data?.message || 'Failed to fetch countries');
//         }
//       } catch (err) {
//         console.error('Error fetching countries:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCountries();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name === 'country_id') {
//       const selectedCountry = countries.find(c => c.id.toString() === value);
//       setForm({
//         ...form,
//         country_id: value,
//         country_name: selectedCountry?.country_name || ''
//       });
//     } else {
//       setForm({ ...form, [name]: value });
//     }
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreviewImage(reader.result);
//         setForm({ ...form, visa_image: reader.result });
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!form.country_id || !form.visa_title || !form.visa_description) {
//       alert('Please fill in all required fields');
//       return;
//     }

//     setIsSubmitting(true);
    
//     try {
//       const response = await fetch('/api/internal/visa-details', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           ...form,
//           country_id: parseInt(form.country_id),
//           review_detail: form.review_detail || '' // Ensure this is always sent
//         }),
//       });

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to save visa detail');
//       }

//       alert('Visa Detail Saved Successfully!');
//       router.push(`/admin/visit-visa/details/${form.country_id}`);
//     } catch (err) {
//       console.error('Error:', err);
//       alert(err.message || 'An error occurred while saving');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
//         <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
//           Add Visa Detail
//         </h1>
        
//         {isLoading ? (
//           <div className="text-center py-4">Loading countries...</div>
//         ) : (
//           <form className="space-y-6" onSubmit={handleSubmit}>
//             {/* Country Dropdown */}
//             <div className="border-b pb-4">
//               <h2 className="text-lg font-semibold mb-2">Country</h2>
//               <select
//                 name="country_id"
//                 className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 value={form.country_id}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">Select Country</option>
//                 {countries.map(country => (
//                   <option key={country.id} value={country.id}>
//                     {country.country_name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Visa Title */}
//             <div className="border-b pb-4">
//               <h2 className="text-lg font-semibold mb-2">Data Title</h2>
//               <input
//                 type="text"
//                 name="visa_title"
//                 className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 value={form.visa_title}
//                 onChange={handleChange}
//                 placeholder="Enter title"
//                 required
//               />
//             </div>

//             {/* Visa Description */}
//             <div className="border-b pb-4">
//               <h2 className="text-lg font-semibold mb-2">Step</h2>
//               <textarea
//                 name="visa_description"
//                 className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 value={form.visa_description}
//                 onChange={handleChange}
//                 placeholder="Start Description"
//                 required
//                 rows={4}
//               />
//             </div>

//             {/* Scalma Method */}
//             <div className="border-b pb-4">
//               <h2 className="text-lg font-semibold mb-2">Scalma Method Question</h2>
//               <input
//                 type="text"
//                 name="sm_question"
//                 className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
//                 value={form.sm_question}
//                 onChange={handleChange}
//                 placeholder="Enter question"
//               />
//               <h3 className="text-md font-medium mb-2">Scalma Method Answer</h3>
//               <textarea
//                 name="sm_answer"
//                 className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 value={form.sm_answer}
//                 onChange={handleChange}
//                 placeholder="Enter short description"
//                 rows={3}
//               />
//             </div>

//             {/* Image Upload */}
//             <div className="border-b pb-4">
//               <h2 className="text-lg font-semibold mb-2">Visa Image</h2>
//               <div className="flex items-center gap-4">
//                 <div className="relative">
//                   <input
//                     type="file"
//                     id="visa_image"
//                     accept="image/*"
//                     onChange={handleImageChange}
//                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                   />
//                   <label
//                     htmlFor="visa_image"
//                     className="inline-block px-4 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200"
//                   >
//                     Choose Image
//                   </label>
//                 </div>
//                 {previewImage && (
//                   <div className="w-20 h-20 border rounded-md overflow-hidden">
//                     <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Reviews Section */}
//             <div className="border-b pb-4">
//               <h2 className="text-lg font-semibold mb-2">Add Review</h2>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full border">
//                   <thead>
//                     <tr className="bg-gray-50">
//                       <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Rating</th>
//                       <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
//                       <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Author's Name</th>
//                       <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Publisher's Name</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     <tr>
//                       <td className="px-4 py-2 border">
//                         <input 
//                           type="text" 
//                           className="w-full border-none focus:ring-0" 
//                           value={form.rating_count}
//                           onChange={(e) => setForm({...form, rating_count: parseInt(e.target.value) || 0})}
//                         />
//                       </td>
//                       <td className="px-4 py-2 border">
//                         <input type="text" className="w-full border-none focus:ring-0" placeholder="(mm/dd/yyyy)" />
//                       </td>
//                       <td className="px-4 py-2 border">
//                         <input type="text" className="w-full border-none focus:ring-0" />
//                       </td>
//                       <td className="px-4 py-2 border">
//                         <input type="text" className="w-full border-none focus:ring-0" />
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
              
//               <div className="mt-4">
//                 <h3 className="text-md font-medium mb-2">Review's Name</h3>
//                 <input
//                   type="text"
//                   className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
              
//               <div className="mt-4">
//                 <h3 className="text-md font-medium mb-2">Review Description</h3>
//                 <textarea
//                   name="review_detail"
//                   className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   value={form.review_detail}
//                   onChange={handleChange}
//                   placeholder="Enter short description"
//                   rows={3}
//                 />
//               </div>
//             </div>

//             {/* Meta Tags Toggle */}
//             <div className="border-b pb-4">
//               <div 
//                 className="flex items-center justify-between cursor-pointer"
//                 onClick={() => setShowMetaTags(!showMetaTags)}
//               >
//                 <h2 className="text-lg font-semibold">Meta Tags</h2>
//                 {showMetaTags ? <ChevronUp /> : <ChevronDown />}
//               </div>
              
//               {showMetaTags && (
//                 <div className="mt-4 space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
//                     <input
//                       type="text"
//                       name="meta_title"
//                       className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       value={form.meta_title}
//                       onChange={handleChange}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
//                     <textarea
//                       name="meta_description"
//                       className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       value={form.meta_description}
//                       onChange={handleChange}
//                       rows={3}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
//                     <input
//                       type="text"
//                       name="meta_keywords"
//                       className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       value={form.meta_keywords}
//                       onChange={handleChange}
//                       placeholder="Comma separated keywords"
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="flex justify-end gap-4 pt-4">
//               <button
//                 type="button"
//                 onClick={() => router.push('/admin/visit-visa')}
//                 className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={isSubmitting || !form.country_id}
//                 className={`px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm transition-colors flex items-center gap-2 ${
//                   isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
//                 }`}
//               >
//                 <Plus size={18} />
//                 {isSubmitting ? 'Saving...' : 'Save Detail'}
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default AddVisaDetail;