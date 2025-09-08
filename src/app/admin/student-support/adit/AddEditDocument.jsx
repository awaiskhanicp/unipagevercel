import React, { useState } from 'react';

const AddEditDocument = ({ mode = 'add', initialData = {}, onSuccess }) => {
  const [title, setTitle] = useState(initialData.file_name || '');
  const [description, setDescription] = useState(initialData.file_desc || '');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (file) formData.append('file', file);
      if (mode === 'edit') formData.append('id', initialData.id);
      const res = await fetch('/api/internal/student-support-documents', {
        method: mode === 'add' ? 'POST' : 'PATCH',
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed');
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
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
        <label className="block mb-1 font-medium">File Upload (PDF only)</label>
        <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} className="w-full" />
      </div>
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? (mode === 'add' ? 'Saving...' : 'Updating...') : (mode === 'add' ? 'Save' : 'Update')}
      </button>
      {success && <div className="text-green-600 mt-2">{mode === 'add' ? 'Document added!' : 'Document updated!'}</div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </form>
  );
};

export default AddEditDocument; 