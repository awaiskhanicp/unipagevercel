'use client'
import React, { useState } from 'react';
import Layout from '../../components/Layout';

const AddStudentSupportDocument = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (file) {
        formData.append('file', file);
      }
      const res = await fetch('/api/internal/student-support-documents', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to upload document.');
      }
      setSuccess(true);
      setTitle('');
      setDescription('');
      setFile(null);
    } catch (err) {
      setError(err.message || 'Failed to upload document.');
    }
    setLoading(false);
  };

  return (
  <Layout>
     <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Student Support Document</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">File Upload</label>
          <input type="file" onChange={e => setFile(e.target.files[0])} required className="w-full" />
        </div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Saving...' : 'Save'}
        </button>
        {success && <div className="text-green-600 mt-2">Document added successfully!</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  </Layout>
  );
};

export default AddStudentSupportDocument; 