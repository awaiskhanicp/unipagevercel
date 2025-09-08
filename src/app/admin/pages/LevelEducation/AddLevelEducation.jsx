'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const AddLevelEducation = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    fontAwesome: '',
    isActive: true,
    isFeatured: false,
    price: 0,
    slug: '',
    user_id: 1,
    category_id: 1,
    brand_id: null,
    post_type: 1, // Changed from 'level' to 1 (integer)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/internal/add_post_level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Level Education Added Successfully');
        setTimeout(() => {
          router.push('/admin/level_of_education');
        }, 1500);
      } else {
        alert('❌ Failed to add: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-xl mt-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Level of Education</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium">Post Title *</label>
          <input
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Font Awesome Icon *</label>
          <input
            name="fontAwesome"
            required
            value={formData.fontAwesome}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* <div>
          <label className="block mb-1 font-medium">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div> */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            Active
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
            />
            Is Featured
          </label>
        </div>
        <button
          type="submit"
          className="bg-[#0B6D76] text-white px-6 py-2 rounded transition"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default AddLevelEducation