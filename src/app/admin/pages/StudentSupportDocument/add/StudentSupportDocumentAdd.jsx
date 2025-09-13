'use client'
import React, { useState } from 'react';
import { Upload, FileText, Save, X, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const AddStudentSupportDocument = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check if file is PDF
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed.');
        setFile(null);
        setFileName('');
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a PDF file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('file', file);

      const res = await fetch('/api/internal/student-support-documents', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to upload document.');
      }

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Document uploaded successfully!',
        confirmButtonColor: '#0B6D76',
      });

      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      setFileName('');
      setSuccess(true);

      // Optionally redirect to documents list
      setTimeout(() => {
        router.push('/admin/student-support-documents/list');
      }, 1500);

    } catch (err) {
      console.error('Upload error:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.message || 'Failed to upload document. Please try again.',
        confirmButtonColor: '#d33',
      });
      setError(err.message || 'Failed to upload document.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/student-support-documents/list');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Student Support Document</h1>
            <p className="text-gray-600 mt-2">Upload PDF documents for student support</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter document title"
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter document description (optional)"
              />
            </div>

            {/* File Upload Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF File Upload *
              </label>
              
              {/* File Input with custom styling */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf"
                  required
                  className="hidden"
                  id="file-upload"
                />
                
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF files only (Max: 10MB)</p>
                  </div>
                </label>
              </div>

              {/* Selected file display */}
              {fileName && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">{fileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setFileName('');
                      setError('');
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {error && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <X size={14} className="mr-1" /> {error}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to List
              </button>
              
              <button
                type="submit"
                disabled={loading || !file}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Upload Document
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Success Message */}
          {success && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Document uploaded successfully! Redirecting to documents list...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">📋 Upload Guidelines</h3>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>• Only PDF files are accepted</li>
            <li>• Maximum file size: 10MB</li>
            <li>• Provide a clear, descriptive title</li>
            <li>• Add a description to help students understand the document content</li>
            <li>• Documents will be immediately available to students after upload</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddStudentSupportDocument;