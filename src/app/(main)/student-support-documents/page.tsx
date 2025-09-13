'use client';

import React, { useState, useEffect } from 'react';
import { Download, Search, X, FileText, BookOpen, Shield, Award, GraduationCap } from 'lucide-react';
import Heading from '../../components/atoms/Heading';
import Paragraph from '../../components/atoms/Paragraph';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Link from "next/link";

export default function StudentSupportDocument() {
  const [searchTerm, setSearchTerm] = useState("");
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
    (doc) => doc.file_name.toLowerCase().includes(searchTerm.toLowerCase())
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
      const res = await fetch('/api/frontend/student-support-document-downloads', {
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
    <div className="min-h-screen">
      {/* Hero Section */}
<section className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden bg-[#0B6D76]">
  {/* Background Image */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: "url('/assets/backgrounds/student-support-documents.jpg')",
    }}
  />

  {/* Overlay gradients */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#0B6D76]/70 to-[#0a5d65]/70" />

  {/* Content */}
  <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
    <div className="mb-8">
      <Heading level={1}>
        <span className="text-white font-bold text-4xl md:text-5xl">
          Student Support Documents
        </span>
      </Heading>
      <p className="text-white text-xl mt-4 max-w-2xl mx-auto opacity-90">
        Access all official documents, forms, and resources in one convenient location
      </p>
    </div>

    {/* Search Box Card */}
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl mx-auto mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Find Your Documents</h3>
      <div className="relative">
        <Search size={18} className="absolute top-3 left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search documents by name, keyword..."
          className="w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#0B6D76] focus:border-[#0B6D76]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  </div>
</section>


      {/* Main Content */}
      <div className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <Heading level={2}>
              <span className="text-[#0B6D76] font-bold text-3xl">Academic Resources</span>
            </Heading>
            <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
              Browse our collection of essential documents and resources to support your academic journey. 
              All resources are available for download after quick registration.
            </p>
          </div>
        

          {/* Document Cards */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              All Documents
              <span className="text-[#0B6D76] ml-2">({filteredDocs.length})</span>
            </h3>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B6D76] mb-4"></div>
                <p className="text-gray-600">Loading documents...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-6 rounded-xl text-center">
                <p className="text-red-600 font-medium">{error}</p>
                <button 
                  className="mt-4 px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#095a62]"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            ) : filteredDocs.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="p-6">
                      <div className="flex items-start mb-4">
                        <div className="bg-[#E6F3F4] p-3 rounded-lg mr-4">
                          <FileText className="text-[#0B6D76]" size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 line-clamp-2">{doc.file_name}</h4>
                          <span className="inline-block mt-1 px-3 py-1 bg-[#E6F3F4] text-[#0B6D76] text-xs rounded-full">
                            {doc.file_category || 'Document'}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDownloadClick({ ...doc, title: doc.file_name, file: doc.document_file })}
                        className="w-full flex items-center justify-center px-4 py-3 bg-[#0B6D76] text-white rounded-lg hover:bg-[#095a62] transition"
                      >
                        <Download size={18} className="mr-2" />
                        Download Document
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-12 rounded-xl text-center">
                <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No documents found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {searchTerm ? `No results found for "${searchTerm}". Try adjusting your search.` : 'No documents available at the moment.'}
                </p>
              </div>
            )}
          </div>

                    {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="text-[#0B6D76] flex justify-center mb-3">
                <FileText size={30} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{documents.length}+</h3>
              <p className="text-gray-600">Documents Available</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="text-[#0B6D76] flex justify-center mb-3">
                <GraduationCap size={30} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">5,000+</h3>
              <p className="text-gray-600">Monthly Downloads</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="text-[#0B6D76] flex justify-center mb-3">
                <BookOpen size={30} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">24/7</h3>
              <p className="text-gray-600">Access Available</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="text-[#0B6D76] flex justify-center mb-3">
                <Award size={30} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">100%</h3>
              <p className="text-gray-600">Official Documents</p>
            </div>
          </div>
          
          {/* Additional Support Section */}
          <div className="bg-[#0B6D76] rounded-2xl p-8 md:p-12 text-white overflow-hidden relative">
            <div className="absolute -right-12 -bottom-12 opacity-10">
              <FileText size={240} />
            </div>
            
            <div className="relative z-10 max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Need Additional Support?</h2>
              <p className="text-[#E6F3F4] mb-6">
                Can&apos;t find what you&apos;re looking for? Our student support team is here to help you 
                with any questions or document requests you might have.
              </p>
              <div className="flex flex-wrap gap-4">
              <Link href="/contact-us">
                <button className="px-6 py-3 bg-white text-[#0B6D76] font-medium rounded-lg hover:bg-gray-100 transition">
                  Contact Support
                </button>
              </Link>
              <Link href="/contact-us">
                <button className="px-6 py-3 border border-white text-white font-medium rounded-lg hover:bg-[#0a5d65] transition">
                  Request a Document
                </button>
              </Link>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-fade-in">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-2">
              <div className="bg-[#E6F3F4] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download size={24} className="text-[#0B6D76]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Download {selectedDoc.title}
              </h2>
              <p className="text-gray-600 mt-2">Please provide your details to download this document</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5 mt-8">
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-[#0B6D76]"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-[#0B6D76]"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  type="text"
                  placeholder="Your phone number"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-[#0B6D76]"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0B6D76] text-white py-3 rounded-lg font-medium hover:bg-[#095a62] transition flex items-center justify-center"
              >
                <Download size={18} className="mr-2" />
                Submit & Download
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                By downloading, you agree to our Terms of Use and Privacy Policy.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}