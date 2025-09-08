"use client";

import { useState } from "react";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';

const currencyOptions = ["USD", "PKR", "EUR", "GBP", "AUD", "CAD", "AED", "SAR"];

const AddCountry = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    amount: "",
    currency: "USD",
    consultationFee: "",
    consultationDiscountFee: "",
    featureImage: ""
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'File Too Large',
          text: 'Image size should be less than 2MB. Please choose a smaller image.',
          confirmButtonColor: '#0B6D76',
          confirmButtonText: 'OK'
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please select a valid image file.',
          confirmButtonColor: '#0B6D76',
          confirmButtonText: 'OK'
        });
        return;
      }

      try {
        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('uploadType', 'countries');

        const uploadResponse = await fetch('/api/internal/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadResult.message || 'Upload failed');
        }

        setFormData((prev) => ({ ...prev, featureImage: uploadResult.url }));
        setImagePreview(uploadResult.url);
        
        // Show success SweetAlert for image upload
        Swal.fire({
          icon: 'success',
          title: 'Image Uploaded!',
          text: 'Image has been uploaded successfully.',
          confirmButtonColor: '#0B6D76',
          confirmButtonText: 'OK',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Upload error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: `Upload failed: ${error.message}`,
          confirmButtonColor: '#0B6D76',
          confirmButtonText: 'OK'
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/internal/countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          currency: formData.currency,
          consultationFee: formData.consultationFee,
          consultationDiscountFee: formData.consultationDiscountFee,
          featureImage: formData.featureImage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add country");
      }

      // Show success SweetAlert
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Country added successfully!',
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
      
      router.push("/admin/countries");
    } catch (err) {
      console.error("❌ Submit Error:", err);
      
      // Show error SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.message || "Something went wrong. Please try again.",
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gradient-to-br from-green-50 to-teal-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <button
          onClick={() => router.push("/admin/countries")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Country</h1>
          <p className="text-gray-600 mt-1">Add a new country to the system</p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-3xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Country Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Country Code *</label>
              <input
                type="text"
                name="code"
                maxLength={3}
                value={formData.code}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Currency *</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              >
                {currencyOptions.map((cur) => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Fee *</label>
              <input
                type="number"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Fee</label>
              <input
                type="number"
                name="consultationDiscountFee"
                value={formData.consultationDiscountFee}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Feature Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center">
                {uploading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0B6D76] mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Uploading image...</p>
                  </div>
                ) : imagePreview ? (
                  <div>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg mx-auto mb-2"
                    />
                    <p className="text-xs text-green-600 mb-2">✓ Image uploaded successfully</p>
                  </div>
                ) : (
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2 text-xs sm:text-sm"
                  disabled={uploading}
                />
                {!uploading && !imagePreview && (
                  <p className="text-xs text-gray-500 mt-2">Click to select an image (max 2MB)</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-6 sm:mt-8 pt-6 sm:pt-8 border-t">
          <button
            type="submit"
            disabled={submitting || uploading}
            className={`px-6 sm:px-8 py-3 rounded-xl flex items-center gap-2 transition-all ${
              submitting || uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#0B6D76] text-white hover:shadow-xl'
            }`}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Adding Country...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Add Country</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCountry;
