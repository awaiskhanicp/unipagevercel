'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../../admin/components/Layout';

const currencyOptions = [
  { value: 'PKR', label: 'PKR' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
];

const continentOptions = [
  { value: 'Asia', label: 'Asia' },
  { value: 'Africa', label: 'Africa' },
  { value: 'North America', label: 'North America' },
  { value: 'South America', label: 'South America' },
  { value: 'Antarctica', label: 'Antarctica' },
  { value: 'Europe', label: 'Europe' },
  { value: 'Australia', label: 'Australia' },
];

export default function AddVisaCountry() {
  const router = useRouter();
  const [form, setForm] = useState({
    countryName: '',
    continent: 'Asia', // Default continent
    currency: 'PKR',
    amount: '',
    discount: '',
    description: '',
    countryImageUrl: '',
    bannerImageUrl: ''
  });
  const [previews, setPreviews] = useState({
    countryImage: null,
    bannerImage: null,
  });
  const [uploading, setUploading] = useState({
    countryImage: false,
    bannerImage: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const uploadImage = async (file, uploadType = 'visa') => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('uploadType', uploadType);

      const response = await fetch('/api/internal/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Image upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      try {
        setUploading(prev => ({ ...prev, [name]: true }));
        setError('');

        if (files[0].size > 2 * 1024 * 1024) {
          throw new Error('Image size should be less than 2MB');
        }
        if (!files[0].type.startsWith('image/')) {
          throw new Error('Please select a valid image file');
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          setPreviews(prev => ({ ...prev, [name]: event.target.result }));
        };
        reader.readAsDataURL(files[0]);

        const uploadType = name === 'countryImage' ? 'visa-country' : 'visa-banner';
        const imageUrl = await uploadImage(files[0], uploadType);
        setForm(prev => ({ 
          ...prev, 
          [`${name}Url`]: imageUrl 
        }));
      } catch (err) {
        setError(err.message);
        console.error('Upload error:', err);
      } finally {
        setUploading(prev => ({ ...prev, [name]: false }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!form.countryName || !form.continent || !form.amount || !form.description || 
          !form.countryImageUrl || !form.bannerImageUrl) {
        throw new Error('All required fields must be filled');
      }

      const response = await fetch('/api/internal/visa-country', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create visa country');
      }

      router.push('/admin/visit-visa/country');
    } catch (err) {
      setError(err.message);
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Add Visa Country</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Country Name *
              </label>
              <input
                type="text"
                name="countryName"
                value={form.countryName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Continent *
              </label>
              <select
                name="continent"
                value={form.continent}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                {continentOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Currency *
              </label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                {currencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Amount *
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={form.discount}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Description *
              </label>
              <textarea
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Country Image (200px × 100px) *
                {form.countryImageUrl && !uploading.countryImage && (
                  <span className="text-green-600 ml-2">✓ Uploaded</span>
                )}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 relative cursor-pointer hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  name="countryImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                {uploading.countryImage ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Uploading...</p>
                  </div>
                ) : previews.countryImage ? (
                  <div className="text-center">
                    <img
                      src={previews.countryImage}
                      alt="Country preview"
                      className="w-[200px] h-[100px] object-cover mx-auto border"
                    />
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="mx-auto w-10 h-10 text-gray-400 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500">Click to select an image</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Banner Image (1200px × 400px) *
                {form.bannerImageUrl && !uploading.bannerImage && (
                  <span className="text-green-600 ml-2">✓ Uploaded</span>
                )}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 relative cursor-pointer hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  name="bannerImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                {uploading.bannerImage ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Uploading...</p>
                  </div>
                ) : previews.bannerImage ? (
                  <div className="text-center">
                    <img
                      src={previews.bannerImage}
                      alt="Banner preview"
                      className="w-full max-w-[400px] h-auto max-h-[150px] object-cover mx-auto border"
                    />
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="mx-auto w-10 h-10 text-gray-400 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500">Click to select an image</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || uploading.countryImage || uploading.bannerImage || !form.countryImageUrl || !form.bannerImageUrl}
              className={`px-6 py-2 rounded-md text-white ${isSubmitting || uploading.countryImage || uploading.bannerImage || !form.countryImageUrl || !form.bannerImageUrl ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isSubmitting ? 'Saving...' : 'Save Country'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}






























// 'use client';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Layout from '../../../../admin/components/Layout';

// const currencyOptions = [
//   { value: 'PKR', label: 'PKR' },
//   { value: 'USD', label: 'USD' },
//   { value: 'EUR', label: 'EUR' },
// ];

// export default function AddVisaCountry() {
//   const router = useRouter();
//   const [form, setForm] = useState({
//     countryName: '',
//     currency: 'PKR',
//     amount: '',
//     discount: '',
//     description: '',
//     countryImageUrl: '',
//     bannerImageUrl: ''
//   });
//   const [previews, setPreviews] = useState({
//     countryImage: null,
//     bannerImage: null,
//   });
//   const [uploading, setUploading] = useState({
//     countryImage: false,
//     bannerImage: false
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState('');

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm(prev => ({ ...prev, [name]: value }));
//   };

//   const uploadImage = async (file, uploadType = 'visa') => {
//     try {
//       const formData = new FormData();
//       formData.append('image', file); // Changed from 'file' to 'image' to match API
//       formData.append('uploadType', uploadType); // Add upload type for proper S3 path

//       const response = await fetch('/api/internal/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Image upload failed');
//       }

//       const data = await response.json();
//       return data.url;
//     } catch (error) {
//       console.error('Upload error:', error);
//       throw error;
//     }
//   };

//   const handleFileChange = async (e) => {
//     const { name, files } = e.target;
//     if (files && files[0]) {
//       try {
//         // Set uploading state
//         setUploading(prev => ({ ...prev, [name]: true }));
//         setError('');

//         // Validate file
//         if (files[0].size > 2 * 1024 * 1024) {
//           throw new Error('Image size should be less than 2MB');
//         }
//         if (!files[0].type.startsWith('image/')) {
//           throw new Error('Please select a valid image file');
//         }

//         // Set preview
//         const reader = new FileReader();
//         reader.onload = (event) => {
//           setPreviews(prev => ({ ...prev, [name]: event.target.result }));
//         };
//         reader.readAsDataURL(files[0]);

//         // Upload file with specific type
//         const uploadType = name === 'countryImage' ? 'visa-country' : 'visa-banner';
//         const imageUrl = await uploadImage(files[0], uploadType);
//         setForm(prev => ({ 
//           ...prev, 
//           [`${name}Url`]: imageUrl 
//         }));
//       } catch (err) {
//         setError(err.message);
//         console.error('Upload error:', err);
//       } finally {
//         setUploading(prev => ({ ...prev, [name]: false }));
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError('');

//     try {
//       // Validate required fields
//       if (!form.countryName || !form.amount || !form.description || 
//           !form.countryImageUrl || !form.bannerImageUrl) {
//         throw new Error('All required fields must be filled');
//       }

//       const response = await fetch('/api/internal/visa-country', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(form),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to create visa country');
//       }

//       // router.push('/admin/visa-countries');
//     } catch (err) {
//       setError(err.message);
//       console.error('Submission error:', err);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="p-6 max-w-4xl mx-auto">
//         <h1 className="text-2xl font-semibold mb-6">Add Visa Country</h1>
        
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="col-span-2">
//               <label className="block text-sm font-medium mb-1">
//                 Country Name *
//               </label>
//               <input
//                 type="text"
//                 name="countryName"
//                 value={form.countryName}
//                 onChange={handleChange}
//                 className="w-full border rounded px-3 py-2"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Currency *
//               </label>
//               <select
//                 name="currency"
//                 value={form.currency}
//                 onChange={handleChange}
//                 className="w-full border rounded px-3 py-2"
//                 required
//               >
//                 {currencyOptions.map(option => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Amount *
//               </label>
//               <input
//                 type="number"
//                 name="amount"
//                 value={form.amount}
//                 onChange={handleChange}
//                 className="w-full border rounded px-3 py-2"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Discount (%)
//               </label>
//               <input
//                 type="number"
//                 name="discount"
//                 value={form.discount}
//                 onChange={handleChange}
//                 min="0"
//                 max="100"
//                 className="w-full border rounded px-3 py-2"
//               />
//             </div>

//             <div className="col-span-2">
//               <label className="block text-sm font-medium mb-1">
//                 Description *
//               </label>
//               <textarea
//                 name="description"
//                 rows={5}
//                 value={form.description}
//                 onChange={handleChange}
//                 className="w-full border rounded px-3 py-2"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Country Image (200px × 100px) *
//                 {form.countryImageUrl && !uploading.countryImage && (
//                   <span className="text-green-600 ml-2">✓ Uploaded</span>
//                 )}
//               </label>
//               <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
//                 {uploading.countryImage ? (
//                   <div className="text-center py-4">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//                     <p className="text-sm text-gray-600 mt-2">Uploading...</p>
//                   </div>
//                 ) : previews.countryImage ? (
//                   <div className="text-center">
//                     <img
//                       src={previews.countryImage}
//                       alt="Country preview"
//                       className="w-[200px] h-[100px] object-cover mx-auto border"
//                     />
//                   </div>
//                 ) : (
//                   <div className="text-center py-4">
//                     <div className="mx-auto w-10 h-10 text-gray-400 mb-2">
//                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                       </svg>
//                     </div>
//                     <p className="text-xs text-gray-500">Click to select an image</p>
//                   </div>
//                 )}
//                 <input
//                   type="file"
//                   name="countryImage"
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   className="w-full mt-2 opacity-0 absolute"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Banner Image (1200px × 400px) *
//                 {form.bannerImageUrl && !uploading.bannerImage && (
//                   <span className="text-green-600 ml-2">✓ Uploaded</span>
//                 )}
//               </label>
//               <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
//                 {uploading.bannerImage ? (
//                   <div className="text-center py-4">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//                     <p className="text-sm text-gray-600 mt-2">Uploading...</p>
//                   </div>
//                 ) : previews.bannerImage ? (
//                   <div className="text-center">
//                     <img
//                       src={previews.bannerImage}
//                       alt="Banner preview"
//                       className="w-full max-w-[400px] h-auto max-h-[150px] object-cover mx-auto border"
//                     />
//                   </div>
//                 ) : (
//                   <div className="text-center py-4">
//                     <div className="mx-auto w-10 h-10 text-gray-400 mb-2">
//                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                       </svg>
//                     </div>
//                     <p className="text-xs text-gray-500">Click to select an image</p>
//                   </div>
//                 )}
//                 <input
//                   type="file"
//                   name="bannerImage"
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   className="w-full mt-2 opacity-0 absolute"
//                   required
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-end">
//             <button
//               type="submit"
//               disabled={isSubmitting || uploading.countryImage || uploading.bannerImage || !form.countryImageUrl || !form.bannerImageUrl}
//               className={`px-6 py-2 rounded-md text-white ${isSubmitting || uploading.countryImage || uploading.bannerImage || !form.countryImageUrl || !form.bannerImageUrl ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
//             >
//               {isSubmitting ? 'Saving...' : 'Save Country'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </Layout>
//   );
// }




// 'use client';
// import React, { useState } from 'react';
// import Layout from '../../../../admin/components/Layout';

// const currencyOptions = [
//   { value: 'PKR', label: 'PKR' },
//   { value: 'USD', label: 'USD' },
//   { value: 'EUR', label: 'EUR' },
//   // Add more as needed
// ];

// const AddVisaCountry = () => {
//   const [form, setForm] = useState({
//     countryName: '',
//     currency: 'PKR',
//     amount: '',
//     discount: '',
//     description: '',
//     countryImage: null,
//     bannerImage: null,
//   });
//   const [countryImagePreview, setCountryImagePreview] = useState(null);
//   const [bannerImagePreview, setBannerImagePreview] = useState(null);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const { name, files } = e.target;
//     if (files && files[0]) {
//       setForm((prev) => ({ ...prev, [name]: files[0] }));
//       const reader = new FileReader();
//       reader.onload = (ev) => {
//         if (name === 'countryImage') setCountryImagePreview(ev.target.result);
//         if (name === 'bannerImage') setBannerImagePreview(ev.target.result);
//       };
//       reader.readAsDataURL(files[0]);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Here you would send the data to your API
//     alert('Visa Country Saved!');
//     // Reset form or redirect as needed
//   };

//   return (
//     <Layout>
//       <div className="p-6 max-w-xl mx-auto">
//         <h1 className="text-xl font-semibold mb-4">Add Visa Country</h1>
//         <form className="space-y-4" onSubmit={handleSubmit}>
//           <div>
//             <label className="block text-sm font-medium mb-1">Country Name</label>
//             <input
//               type="text"
//               name="countryName"
//               className="w-full border rounded px-3 py-2"
//               value={form.countryName}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <div className="flex gap-2">
//             <div className="flex-1">
//               <label className="block text-sm font-medium mb-1">Select Currency</label>
//               <select
//                 name="currency"
//                 className="w-full border rounded px-3 py-2"
//                 value={form.currency}
//                 onChange={handleChange}
//                 required
//               >
//                 {currencyOptions.map((opt) => (
//                   <option key={opt.value} value={opt.value}>{opt.label}</option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex-1">
//               <label className="block text-sm font-medium mb-1">Amount</label>
//               <input
//                 type="number"
//                 name="amount"
//                 className="w-full border rounded px-3 py-2"
//                 value={form.amount}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="flex-1">
//               <label className="block text-sm font-medium mb-1">Discount %</label>
//               <input
//                 type="number"
//                 name="discount"
//                 className="w-full border rounded px-3 py-2"
//                 value={form.discount}
//                 onChange={handleChange}
//                 min="0"
//                 max="100"
//               />
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Visa Description</label>
//             <textarea
//               name="description"
//               className="w-full border rounded px-3 py-2"
//               value={form.description}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Country Image (200px X 100px)</label>
//             <input
//               type="file"
//               name="countryImage"
//               accept="image/*"
//               className="w-full border rounded px-3 py-2"
//               onChange={handleFileChange}
//               required
//             />
//             {countryImagePreview && (
//               <img src={countryImagePreview} alt="Country Preview" className="mt-2 w-[200px] h-[100px] object-cover border" />
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Banner Image (1200px X 400px)</label>
//             <input
//               type="file"
//               name="bannerImage"
//               accept="image/*"
//               className="w-full border rounded px-3 py-2"
//               onChange={handleFileChange}
//               required
//             />
//             {bannerImagePreview && (
//               <img src={bannerImagePreview} alt="Banner Preview" className="mt-2 w-[300px] h-[100px] object-cover border" style={{maxWidth:'100%'}} />
//             )}
//           </div>
//           <button
//             type="submit"
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//           >
//             Save
//           </button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default AddVisaCountry;