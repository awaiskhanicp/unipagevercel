"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SummernoteEditor from "../../../../app/components/organisms/SummernoteEditor";

const AddGuide = () => {
  const router = useRouter();

  const [universities, setUniversities] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    type: "University",
    university_id: "",
    subject_id: "",
    title: "",
    slug: "",
    subTitle: "",
    sortOrder: "",
    description: "",
    schema: [{ question: "", answer: "" }],
    reviews: [
      {
        rating: "",
        date: "",
        authorName: "",
        publisherName: "",
        reviewName: "",
        reviewDescription: "",
      },
    ],
    featuredImage: null,
    show_meta: "off",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    active: true,
  });

  // Function to generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Fetch universities for dropdown
  const fetchUniversities = async () => {
    try {
      console.log('Fetching universities for AddGuide...');
      const response = await fetch('/api/internal/university');
      console.log('Universities response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Universities API response:', data);
        
        // Handle different response formats
        if (data.success && data.data) {
          setUniversities(data.data);
          console.log('Universities loaded (success format):', data.data.length);
        } else if (Array.isArray(data)) {
          setUniversities(data);
          console.log('Universities loaded (array format):', data.length);
        } else if (data.data && Array.isArray(data.data)) {
          setUniversities(data.data);
          console.log('Universities loaded (data.data format):', data.data.length);
        } else {
          console.log('Unexpected universities response format:', data);
          setUniversities([]);
        }
      } else {
        console.error('Failed to fetch universities:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  // Fetch subjects for dropdown
  const fetchSubjects = async () => {
    try {
      console.log('Fetching subjects for AddGuide...');
      const response = await fetch('/api/internal/subject');
      console.log('Subjects response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Subjects API response:', data);
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setSubjects(data);
          console.log('Subjects loaded (array format):', data.length);
        } else if (data.data && Array.isArray(data.data)) {
          setSubjects(data.data);
          console.log('Subjects loaded (data.data format):', data.data.length);
        } else if (data.success && data.data) {
          setSubjects(data.data);
          console.log('Subjects loaded (success format):', data.data.length);
        } else {
          console.log('Unexpected subjects response format:', data);
          setSubjects([]);
        }
      } else {
        console.error('Failed to fetch subjects:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  // Fetch both universities and subjects on component mount
  useEffect(() => {
    fetchUniversities();
    fetchSubjects();
  }, []);

  // Handle guide type change
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setForm(prev => ({
      ...prev,
      type: newType,
      // Reset the ID when type changes
      university_id: "",
      subject_id: ""
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Auto-generate slug when title changes
    if (name === 'title') {
      const newSlug = generateSlug(value);
      setForm(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
        slug: newSlug
      }));
    } else if (name === 'show_meta') {
      // Handle show_meta toggle specifically
      setForm(prev => ({
        ...prev,
        show_meta: checked ? "on" : "off"
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSchemaChange = (index, key, value) => {
    const updated = [...form.schema];
    updated[index][key] = value;
    setForm({ ...form, schema: updated });
  };

  const handleReviewChange = (index, key, value) => {
    const updated = [...form.reviews];
    updated[index][key] = value;
    setForm({ ...form, reviews: updated });
  };

  const addSchema = () =>
    setForm((prev) => ({
      ...prev,
      schema: [...prev.schema, { question: "", answer: "" }],
    }));

  const removeSchema = (index) => {
    const updated = [...form.schema];
    updated.splice(index, 1);
    setForm({ ...form, schema: updated });
  };

  const addReview = () =>
    setForm((prev) => ({
      ...prev,
      reviews: [
        ...prev.reviews,
        {
          rating: "",
          date: "",
          authorName: "",
          publisherName: "",
          reviewName: "",
          reviewDescription: "",
        },
      ],
    }));

  const removeReview = (index) => {
    const updated = [...form.reviews];
    updated.splice(index, 1);
    setForm({ ...form, reviews: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("user_id", 1);
    formData.append("type", form.type);
    formData.append("university_id", form.university_id || "");
    formData.append("subject_id", form.subject_id || "");
    formData.append("title", form.title);
    formData.append("slug", form.slug);
    formData.append("subTitle", form.subTitle);
    formData.append("sortOrder", form.sortOrder);
    formData.append("description", form.description);
    formData.append("active", form.active);
    formData.append("show_meta", form.show_meta);
    formData.append("meta_title", form.meta_title);
    formData.append("meta_description", form.meta_description);
    formData.append("meta_keywords", form.meta_keywords);

    formData.append("schema", JSON.stringify(form.schema));
    formData.append("reviews", JSON.stringify(form.reviews));

    if (form.featuredImage) {
      formData.append("featuredImage", form.featuredImage);
    }

    const res = await fetch("/api/internal/guides", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      // router.push("/guide");
      alert("Guide added successfully");
      console.log(res);
    } else {
      alert("Failed to add guide");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Add Guide</h1>
     <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-4 sm:p-6 rounded-xl shadow"
      >
        {/* Guide Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Guide Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleTypeChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="University">University</option>
              <option value="Subject">Subject</option>
            </select>
          </div>
{/*          {form.type === "University" && (
            <div>
              <label className="block text-sm font-medium">University</label>
              <select
                name="university_id"
                value={form.university_id}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select University</option>
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {form.type === "Subject" && (
            <div>
              <label className="block text-sm font-medium">Subject</label>
              <select
                name="subject_id"
                value={form.subject_id}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select Subject</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}*/}
        </div>

        {/* Title / Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
              placeholder="Enter guide title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Slug (Auto-generated)</label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded bg-gray-50"
              placeholder="Auto-generated from title"
            />
            <p className="text-xs text-gray-500 mt-1">
              Slug is automatically generated from the title. You can edit it manually if needed.
            </p>
          </div>
        </div>

        {/* SubTitle / Sort Order */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/*         <div>
            <label className="block text-sm font-medium">Sub Title</label>
            <input
              type="text"
              name="subTitle"
              value={form.subTitle}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Enter subtitle"
            />
          </div>*/}
  {/*        <div>
            <label className="block text-sm font-medium">Sort Order</label>
            <input
              type="number"
              name="sortOrder"
              value={form.sortOrder}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Enter sort order"
            />
          </div>*/}
        </div>

        {/* Summernote Description */}
        <div>
          <label className="block text-sm font-medium">Description</label>
          <SummernoteEditor
            value={form.description}
            onChange={(val) => setForm({ ...form, description: val })}
          />
        </div>

        {/* Schema */}
{/*        <div>
          <label className="block text-sm font-medium mb-2">Schema (FAQ)</label>
          {form.schema.map((item, index) => (
            <div
              key={index}
              className="border p-4 rounded space-y-2 bg-gray-50 mb-3"
            >
              <input
                placeholder="Schema Question"
                value={item.question}
                onChange={(e) =>
                  handleSchemaChange(index, "question", e.target.value)
                }
                className="w-full border px-3 py-2 rounded"
              />
              <textarea
                placeholder="Schema Answer"
                value={item.answer}
                onChange={(e) =>
                  handleSchemaChange(index, "answer", e.target.value)
                }
                className="w-full border px-3 py-2 rounded"
                rows="3"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeSchema(index)}
                  className="text-red-600 text-sm hover:text-red-800"
                >
                  Remove Schema
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSchema}
            className="text-blue-600 text-sm hover:text-blue-800 border border-blue-300 px-3 py-1 rounded"
          >
            + Add Schema
          </button>
        </div>*/}

        {/* Reviews */}
 {/*       <div>
          <label className="block text-sm font-medium mb-2">Reviews</label>
          {form.reviews.map((item, index) => (
            <div
              key={index}
              className="border p-4 rounded bg-gray-50 space-y-2 mb-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Rating (1-5)"
                  value={item.rating}
                  onChange={(e) =>
                    handleReviewChange(index, "rating", e.target.value)
                  }
                  className="border px-3 py-2 rounded"
                  min="1"
                  max="5"
                />
                <input
                  type="date"
                  placeholder="Date"
                  value={item.date}
                  onChange={(e) =>
                    handleReviewChange(index, "date", e.target.value)
                  }
                  className="border px-3 py-2 rounded"
                />
              </div>
              <input
                placeholder="Author Name"
                value={item.authorName}
                onChange={(e) =>
                  handleReviewChange(index, "authorName", e.target.value)
                }
                className="border px-3 py-2 rounded w-full"
              />
              <input
                placeholder="Publisher Name"
                value={item.publisherName}
                onChange={(e) =>
                  handleReviewChange(index, "publisherName", e.target.value)
                }
                className="border px-3 py-2 rounded w-full"
              />
              <input
                placeholder="Review Name"
                value={item.reviewName}
                onChange={(e) =>
                  handleReviewChange(index, "reviewName", e.target.value)
                }
                className="border px-3 py-2 rounded w-full"
              />
              <textarea
                placeholder="Review Description"
                value={item.reviewDescription}
                onChange={(e) =>
                  handleReviewChange(index, "reviewDescription", e.target.value)
                }
                className="border px-3 py-2 rounded w-full"
                rows="3"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeReview(index)}
                  className="text-red-600 text-sm hover:text-red-800"
                >
                  Remove Review
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addReview}
            className="text-green-600 text-sm hover:text-green-800 border border-green-300 px-3 py-1 rounded"
          >
            + Add Review
          </button>
        </div>*/}

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium">Featured Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setForm((prev) => ({
                  ...prev,
                  featuredImage: file,
                }));
              }
            }}
            className="w-full border px-3 py-2 rounded"
          />
          {form.featuredImage && (
            <img
              src={URL.createObjectURL(form.featuredImage)}
              alt="Preview"
              className="mt-2 w-32 sm:w-40 h-20 sm:h-24 object-cover rounded border"
            />
          )}
        </div>

        {/* Meta Tags */}
        <div>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              name="show_meta"
              checked={form.show_meta === "on"}
              onChange={handleChange}
            />
            <span>Enable Meta Tags</span>
          </label>
        </div>
        {form.show_meta === "on" && (
          <div className="space-y-2">
            <input
              type="text"
              name="meta_title"
              value={form.meta_title}
              onChange={handleChange}
              placeholder="Meta Title"
              className="w-full border px-3 py-2 rounded"
            />
            <textarea
              name="meta_description"
              value={form.meta_description}
              onChange={handleChange}
              placeholder="Meta Description"
              className="w-full border px-3 py-2 rounded"
              rows="3"
            />
            <input
              type="text"
              name="meta_keywords"
              value={form.meta_keywords}
              onChange={handleChange}
              placeholder="Meta Keywords (comma separated)"
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        )}

        {/* Active Checkbox */}
        <div>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />
            <span>Active</span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddGuide;