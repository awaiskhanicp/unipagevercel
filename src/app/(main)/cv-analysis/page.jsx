'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaUpload, FaFilePdf, FaFileWord, FaFileAlt, FaSpinner, FaUser, FaGraduationCap, FaBriefcase, FaCode, FaProjectDiagram, FaFile } from 'react-icons/fa';

export default function CvAnalysisPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState('extracted');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/student-login?redirect=/cv-analysis');
    }
  }, [status, router]);

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  // Show loading if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Please upload a valid file type (PDF, DOC, DOCX, or TXT)');
      return;
    }

    if (selectedFile.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    alert('File selected successfully');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userId', session?.user?.id || 'unknown');

    try {
      const response = await fetch('/api/internal/cv-analysis', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setExtractedData(result.extractedData);
        alert('CV analysis completed successfully!');
      } else {
        alert(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FaFilePdf className="text-red-500 text-2xl" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-500 text-2xl" />;
      default:
        return <FaFileAlt className="text-gray-500 text-2xl" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered CV Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your resume and let our AI extract and structure all the information. 
            Get insights into your professional profile and discover relevant opportunities.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Upload Your Resume
          </h2>
          
          <form onSubmit={handleSubmit}>
            {/* Drag & Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
              
              {file ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    {getFileIcon(file.name)}
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-lg text-gray-600 mb-2">
                    Drag and drop your resume here, or{' '}
                    <label className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                      browse files
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileChange}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, DOC, DOCX, and TXT files up to 5MB
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={!file || uploading}
                className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                  !file || uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {uploading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FaSpinner className="animate-spin" />
                    <span>Analyzing with AI...</span>
                  </div>
                ) : (
                  'Analyze Resume with AI'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Analysis Results */}
        {extractedData && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              CV Analysis Results
            </h2>
            
            {/* Analysis Method Notice */}
            {extractedData.structuredData?.summary && extractedData.structuredData.summary.includes('fallback') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Fallback Analysis Mode
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        OpenAI API is currently unavailable. Using fallback text extraction method. 
                        Results may be less accurate than AI-powered analysis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('extracted')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === 'extracted'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaFile className="inline mr-2" />
                Structured Data
              </button>
              <button
                onClick={() => setActiveTab('original')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === 'original'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaFile className="inline mr-2" />
                Original Text
              </button>
            </div>

            {activeTab === 'extracted' ? (
              <div className="space-y-8">
                {/* Personal Information */}
                {extractedData.structuredData?.personalInfo && (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                      <FaUser className="mr-2" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {extractedData.structuredData.personalInfo.name && (
                        <div>
                          <span className="font-medium text-gray-700">Name:</span>
                          <span className="ml-2 text-gray-900">{extractedData.structuredData.personalInfo.name}</span>
                        </div>
                      )}
                      {extractedData.structuredData.personalInfo.email && (
                        <div>
                          <span className="font-medium text-gray-700">Email:</span>
                          <span className="ml-2 text-gray-900">{extractedData.structuredData.personalInfo.email}</span>
                        </div>
                      )}
                      {extractedData.structuredData.personalInfo.phone && (
                        <div>
                          <span className="font-medium text-gray-700">Phone:</span>
                          <span className="ml-2 text-gray-900">{extractedData.structuredData.personalInfo.phone}</span>
                        </div>
                      )}
                      {extractedData.structuredData.personalInfo.location && (
                        <div>
                          <span className="font-medium text-gray-700">Location:</span>
                          <span className="ml-2 text-gray-900">{extractedData.structuredData.personalInfo.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Education */}
                {extractedData.structuredData?.education && extractedData.structuredData.education.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                      <FaGraduationCap className="mr-2" />
                      Education
                    </h3>
                    <div className="space-y-4">
                      {extractedData.structuredData.education.map((edu, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="font-medium text-gray-900">{edu.degree}</div>
                          <div className="text-gray-600">{edu.institution}</div>
                          <div className="text-sm text-gray-500">
                            {edu.year} {edu.gpa && `• GPA: ${edu.gpa}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {extractedData.structuredData?.experience && extractedData.structuredData.experience.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                      <FaBriefcase className="mr-2" />
                      Work Experience
                    </h3>
                    <div className="space-y-4">
                      {extractedData.structuredData.experience.map((exp, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-purple-200">
                          <div className="font-medium text-gray-900">{exp.title}</div>
                          <div className="text-gray-600">{exp.company}</div>
                          <div className="text-sm text-gray-500 mb-2">{exp.duration}</div>
                          {exp.responsibilities && exp.responsibilities.length > 0 && (
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                              {exp.responsibilities.map((resp, respIndex) => (
                                <li key={respIndex}>{resp}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {extractedData.structuredData?.skills && (
                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                      <FaCode className="mr-2" />
                      Skills
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {extractedData.structuredData.skills.technical && extractedData.structuredData.skills.technical.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Technical Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {extractedData.structuredData.skills.technical.map((skill, index) => (
                              <span key={index} className="bg-white px-3 py-1 rounded-full text-sm border border-orange-200">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {extractedData.structuredData.skills.soft && extractedData.structuredData.skills.soft.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Soft Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {extractedData.structuredData.skills.soft.map((skill, index) => (
                              <span key={index} className="bg-white px-3 py-1 rounded-full text-sm border border-orange-200">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {extractedData.structuredData.skills.languages && extractedData.structuredData.skills.languages.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Languages</h4>
                          <div className="flex flex-wrap gap-2">
                            {extractedData.structuredData.skills.languages.map((lang, index) => (
                              <span key={index} className="bg-white px-3 py-1 rounded-full text-sm border border-orange-200">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {extractedData.structuredData?.projects && extractedData.structuredData.projects.length > 0 && (
                  <div className="bg-indigo-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                      <FaProjectDiagram className="mr-2" />
                      Projects
                    </h3>
                    <div className="space-y-4">
                      {extractedData.structuredData.projects.map((project, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-indigo-200">
                          <div className="font-medium text-gray-900 mb-2">{project.name}</div>
                          <div className="text-gray-600 mb-2">{project.description}</div>
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {project.technologies.map((tech, techIndex) => (
                                <span key={techIndex} className="bg-indigo-100 px-2 py-1 rounded text-xs text-indigo-800">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {extractedData.structuredData?.summary && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h3>
                    <p className="text-gray-700 leading-relaxed">{extractedData.structuredData.summary}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Original CV Text</h3>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {extractedData.originalText}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
