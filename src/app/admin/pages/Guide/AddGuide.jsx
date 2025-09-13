"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SummernoteEditor from "../../../../app/components/organisms/SummernoteEditor";
import Swal from "sweetalert2";

const AddGuide = () => {
  const router = useRouter();


  const [universities, setUniversities] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("University");
  const [typeID, setTypeID] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showMeta, setShowMeta] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [isloading, setIsLoading] = useState(false);


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

  // Fetch both universities and subjects on component mount
  // Fetch universities and subjects on mount
    useEffect(() => {
  
      const fetchdata = async () => {
      const [universitiesResponse, subjectsResponse] = await Promise.all([
        fetch('/api/internal/new/getuniversity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }),
        fetch('/api/internal/new/getsubject', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }),
      ]);

      if(!universitiesResponse.ok || !subjectsResponse.ok) throw new Error('Failed to fetch data')

      const universityData = await universitiesResponse.json();
      const subjectsData = await subjectsResponse.json();

      setUniversities(universityData.data);
      setSubjects(subjectsData.data);

    }

    fetchdata()

  }, [])

  const uploadImage = async (file, uploadType = 'university-logo') => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('uploadType', uploadType); // Add upload type for proper S3 path

      const response = await fetch('/api/internal/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Determine upload type based on field
      let uploadType = 'university-logo'; // default
      if (field === 'featured_image') uploadType = 'university-feature';
      
      const imageUrl = await uploadImage(file, uploadType);

      setUploadedImages(imageUrl);
      
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Error',
        text: error.message || 'Failed to upload image',
        confirmButtonColor: '#0B6D76'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    
    setUploadedImages("");


  };

  // Handle guide type change
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    setTypeID("");
  };

  // Assuming SummernoteEditor expects `value` and `onChange` as props
  const handleDescriptionChange = (content) => {
    setDescription(content); // Update the description state with the editor's content
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle); // Set the title
    setSlug(generateSlug(newTitle)); // Automatically generate and set the slug
  };

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    setShowMeta(e.target.checked); // Set state based on whether checkbox is checked
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try
      {
        setIsLoading(true);
        // Construct the payload with all the form state values
        const payload = {
          title,
          type,
          type_id: typeID,
          slug,
          description,
          is_active: isActive, // true or false
          show_meta: showMeta ? "on" : "off", // Send as "on" or "off"
          meta_title: metaTitle,
          meta_description: metaDescription,
          meta_keywords: metaKeywords,
          image: uploadedImages, // Assuming this is the URL of the uploaded image
        };

        console.log("Form Payload:", payload); // You can log to check the data structure

        const res = await fetch("/api/internal/guides", {
          method: "POST",
          body: JSON.stringify(payload), // Send the payload as JSON
        });

        if(!res.ok)
        {
          const data = await res.json();

          throw new Error(data.message || "Failed to add guide")
        }
        
        const data = await res.json();

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: data.message,
          confirmButtonColor: '#10b981'
        })

        router.push("/admin/guide");

      } catch (error) {
        console.error("Error submitting form:", error);
        setIsLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error,
          confirmButtonColor: '#ef4444'
        })
      } finally {
        setIsLoading(false);
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
              value={type}
              onChange={handleTypeChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="University">University</option>
              <option value="Subject">Subject</option>
            </select>
          </div>
          {type === "University" && (
            <div>
              <label className="block text-sm font-medium">University</label>
              <select
                name="university_id"
                value={typeID}
                onChange={(e) => setTypeID(e.target.value)}
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
          {type === "Subject" && (
            <div>
              <label className="block text-sm font-medium">Subject</label>
              <select
                name="subject_id"
                value={typeID}
                onChange={(e) => setTypeID(e.target.value)}
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
          )}
        </div>

        {/* Title / Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Title *</label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={handleTitleChange}
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
              value={slug}
              onChange={(e) => slug(e.target.value)}
              className="w-full border px-3 py-2 rounded bg-gray-50"
              placeholder="Auto-generated from title"
            />
            <p className="text-xs text-gray-500 mt-1">
              Slug is automatically generated from the title. You can edit it manually if needed.
            </p>
          </div>
        </div>

        {/* Summernote Description */}
        <div>
          <label className="block text-sm font-medium">Description</label>
          <SummernoteEditor
            value={description}
            onChange={handleDescriptionChange}
          />
        </div>


        <div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'featured')}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                disabled={isUploading}
              />
              {uploadedImages && (
                <div className="mt-2">
                  <img
                    src={uploadedImages}
                    alt="Logo preview"
                    className="h-20 object-contain"
                  />
                  
                  <button
                    type="button"
                    onClick={() => removeImage()}
                    className="mt-1 text-red-600 text-sm"
                    disabled={isUploading}
                  >
                    Remove
                  </button>
                </div>
              )}
              {isUploading && !uploadedImages && (
                <div className="mt-2 text-sm text-gray-500">Uploading Image...</div>
              )}
            </div>
          </div>
        </div>

        {/* Meta Tags */}
        <div>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              name="show_meta"
              checked={showMeta}
              onChange={handleCheckboxChange}
            />
            <span>Enable Meta Tags</span>
          </label>
        </div>
        {showMeta && (
          <div className="space-y-2">
            <input
              type="text"
              name="meta_title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Meta Title"
              className="w-full border px-3 py-2 rounded"
            />
            <textarea
              name="meta_description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Meta Description"
              className="w-full border px-3 py-2 rounded"
              rows="3"
            />
            <input
              type="text"
              name="meta_keywords"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
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
              checked={isActive}
              onChange={(e) => setIsActive(e.target.value)}
            />
            <span>Active</span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
          disabled={isloading}
        >
          {isloading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default AddGuide;