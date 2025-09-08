'use client';

import React, { useState, useEffect } from 'react';
import { Download, Search, X } from 'lucide-react';
import Heading from '../../components/atoms/Heading';
import Paragraph from '../../components/atoms/Paragraph';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export default function StudentSupportDocument() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTitle, setFilterTitle] = useState("All");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch('/api/internal/student-support-documents');
        if (!res.ok) throw new Error('Failed to fetch documents');
        const data = await res.json();
        setDocuments(data);
      } catch (err) {
        setError('Failed to load documents.');
      }
      setLoading(false);
    };
    fetchDocs();
  }, []);

  const filteredDocs = documents.filter(
    (doc) =>
      (filterTitle === "All" || doc.file_desc === filterTitle) &&
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadClick = (doc) => {
    setSelectedDoc(doc);
  };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Form Error',
        text: 'Please fill all required fields correctly.',
      });
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const res = await fetch('/api/internal/save-download-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, documentId: selectedDoc.id }),
      });

      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Your details have been submitted. Your download will start shortly.',
        });

        // ✅ Download file after success
        const link = document.createElement('a');
        link.href = selectedDoc.file || selectedDoc.document_file;
        link.download = selectedDoc.title || selectedDoc.file_name;
        link.click();

        // Reset form and close modal
        setSelectedDoc(null);
        setFormData({ name: '', email: '', phone: '' });
      } else {
        throw new Error('Failed to save user info');
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Please try again later.',
      });
    }
  };

  return (
    <div className="">
      <section className="relative md:h-[54vh] sm:h-[100vh] h-[100vh] flex items-center justify-center overflow-hidden">
        <img src="/assets/minhaj.png" alt="Hero Background" className="absolute top-0 left-0 w-full h-full object-cover z-0" />
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.9)]"></div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto pb-12">
          <div className="max-w-5xl mx-auto text-center mb-10">
            <Heading level={3}>
              <span className="text-white font-medium"> Student Support Documents</span>
            </Heading>
            <p className="text-white text-lg">Find and download official student documents easily.</p>
          </div>
        </div>
      </section>

      <div className="min-h-screen py-12 mt-[120px] px-4">
        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-2/3">
            <Search size={18} className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="w-full md:w-1/3 px-4 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-200"
            value={filterTitle}
            onChange={(e) => setFilterTitle(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Policy">Policy</option>
            <option value="Guide">Guide</option>
          </select>
        </div>

        {/* Document Cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {loading ? (
            <p className="text-center col-span-2 text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-center col-span-2 text-red-500">{error}</p>
          ) : filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white shadow-lg rounded-xl p-6 flex flex-col gap-[50px] justify-between hover:shadow-2xl transition transform hover:-translate-y-1"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{doc.file_name}</h2>
                  <p className="text-sm text-blue-600 mb-2">{doc.file_desc || 'General'}</p>
                </div>
                <button
                  onClick={() => handleDownloadClick({ ...doc, title: doc.file_name, file: doc.document_file })}
                  className="inline-flex items-center rounded-lg justify-center px-4 py-2 bg-[var(--brand-color)] text-white transition"
                >
                  <Download size={18} className="mr-2" />
                  Download
                </button>
              </div>
            ))
          ) : (
            <p className="text-center col-span-2 text-gray-500">No documents found.</p>
          )}
        </div>

        {/* Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
              <button
                onClick={() => setSelectedDoc(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-12">
                Download {selectedDoc.title}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                    Your Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="text"
                    placeholder="Phone Number"
                    className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[var(--brand-color)] text-white py-2 rounded-lg transition"
                >
                  Submit & Download
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}