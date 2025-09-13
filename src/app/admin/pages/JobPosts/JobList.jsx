"use client"

import React, { useEffect, useState } from 'react'
import { Eye, Trash2, Pencil } from "lucide-react";
import Swal from 'sweetalert2'
import Pagination from '../../components/Pagination';
import dynamic from 'next/dynamic';

const SummernoteEditor = dynamic(() => import('../../../components/organisms/SummernoteEditor'), { 
  ssr: false,
  loading: () => <div className="p-4 border rounded-lg bg-gray-50 animate-pulse">Loading editor...</div>
});

const JobList = () => {

    const [filteredJobs, setFilteredJobs] = useState([]);
    const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
    const [appliedSiteType, setAppliedSiteType] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [siteType, setSiteType] = useState(""); // '' | 'onsite' | 'remote'
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);  // Default to page 1
    const [totalPages, setTotalPages] = useState(0);  // Total pages from backend
    const [totalJobs, setTotalJobs] = useState(0);    // Total jobs count from backend
    const [itemsPerPage, setItemsPerPage] = useState(5);  // Default items per page

    // Function to safely render HTML content
    const renderHTML = (html) => {
        if (!html) return '';
        return { __html: html };
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        job_type: '',
        city: '',
        province: '',
        country: '',
        site_based: false,
        skills: [],
        experience: '',
        requirements: '',
        responsibilities: '',
        description: '',
        active: false
    });
    const editTabs = ['BASIC INFO', 'SKILLS', 'REQUIREMENTS', 'RESPONSIBILITIES', 'DESCRIPTION'];
    const [editActiveTab, setEditActiveTab] = useState('BASIC INFO');

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });
    
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/internal/jobs/${id}`, {
                    method: "DELETE",
                });
                
                if (!response.ok) {
                    
                    const data = await response.json();

                    throw new Error(`Failed to delete job: ${data.message}`);
                }

                const data = await response.json();

                Swal.fire({
                    title: 'Success',
                    text: data.message,
                    icon: 'success',
                    confirmButtonText: 'OK'
                })
                
                await fetchJobs();
                return true;
            } catch (error) {
                console.error("Error deleting job:", error);
                Swal.fire({
                    title: 'Error',
                    text: error.message,
                    icon: 'error',
                    confirmButtonText: 'OK'
                })
                return false;
            }
        }
    };

    const toggleActive = (id) => {
        toggleJobStatus(id);
    };

    const handleEditClick = (job) => {
        setSelectedJob(job);
        setEditForm({
        title: job.title,
        job_type: job.job_type,
        city: job.city,
        province: job.province,
        country: job.country,
        site_based: job.site_based,
        skills: [...(job.skills || [])],
        experience: job.experience || '',
        requirements: job.requirements || '',
        responsibilities: job.responsibilities || '',
        description: job.description || '',
        active: job.active
        });
        setIsEditing(true);
        setEditActiveTab('BASIC INFO');
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSkillChange = (e, index) => {
        const newSkills = [...editForm.skills];
        newSkills[index] = e.target.value;
        setEditForm(prev => ({
        ...prev,
        skills: newSkills
        }));
    };

    const addSkill = () => {
        setEditForm(prev => ({
        ...prev,
        skills: [...prev.skills, '']
        }));
    };

    const removeSkill = (index) => {
        const newSkills = [...editForm.skills];
        newSkills.splice(index, 1);
        setEditForm(prev => ({
        ...prev,
        skills: newSkills
        }));
    };

    const fetchJobs = async () => {
      const params = new URLSearchParams();
      if (appliedSearchTerm) params.append('search', appliedSearchTerm);
      if (appliedSiteType) params.append('site_type', appliedSiteType);

      params.append('items_per_page', itemsPerPage);
      params.append('page', currentPage);
      
      try {
        const res = await fetch(`/api/internal/jobs?${params.toString()}`);
        if (!res.ok) {
          const data = await res.json();
          Swal.fire({
            title: 'Error',
            text: data.message,
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
        }

        const data = await res.json();
        
        // Map jobs with necessary transformations
        setFilteredJobs(
          data.jobs.map(job => ({
            ...job,
            skills: job.skills ? job.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
            active: job.post_status === 1,
          }))
        );

        setTotalPages(data.totalPages);
        setTotalJobs(data.totalJobs);

      } catch (e) {
        console.error(e);
        // Fallback logic if fetch fails
        Swal.fire({
          title: 'Error',
          text: 'Something went wrong while fetching jobs.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    };

    useEffect(() => {

    fetchJobs();
    
  }, [appliedSearchTerm, appliedSiteType, currentPage, itemsPerPage]);

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        const id = selectedJob.id
        try {
            const response = await fetch(`/api/internal/jobs/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    editForm
                }),
            });
            
            if (!response.ok) {
                const data = await response.json();

                console.log("Error to show at frontend", data);
                Swal.fire({
                    title: 'Error',
                    text: data.details,
                    icon: 'error',
                    confirmButtonText: 'OK'
                })
                return;
            }

            const data = await response.json();
            Swal.fire({
                title: 'Success',
                text: data.message,
                icon: 'success',
                confirmButtonText: 'OK'
            })

            setIsEditing(false);
            setSelectedJob(null);
            
            await fetchJobs();
            return true;
        } catch (error) {
            console.error("Error updating job:", error);
            setError(error.message);
            return false;
        }
    };





  // Handle the filter toggle
  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  // Apply filters (set the applied search term and site type)
  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedSiteType(siteType);
    setIsFilterOpen(false);  // Close filter section after search
  };

  // Clear the filters
  const clearFilters = () => {
    setSearchTerm("");
    setSiteType("");
    setAppliedSearchTerm("");
    setAppliedSiteType("");
  };

     // Calculate startIndex and endIndex based on the page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

    return (

    <>
    <title>Jobs List - University Page</title>
        <div className="p-4 sm:p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Job Listings
                </h1>
                <button
                onClick={toggleFilter}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                🔍 Filters
                </button>
            </div>

            {/* Filter Section */}
            {isFilterOpen && (
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Jobs</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search by title, type, location, skills..."
                        className="w-full p-2 border rounded"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Type</label>
                    <select
                        value={siteType}
                        onChange={(e) => setSiteType(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">All</option>
                        <option value="onsite">Onsite</option>
                        <option value="remote">Remote</option>
                    </select>
                    </div>
                    <div className="flex items-end gap-2">
                    <button 
                        onClick={handleSearch} 
                        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 flex items-center gap-2"
                    >
                        🔍 Search
                    </button>
                    <button 
                        onClick={clearFilters} 
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Clear Filters
                    </button>
                    </div>
                </div>

                {/* Active Filters Display */}
                {(appliedSearchTerm || appliedSiteType) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                        Active filters: 
                        {appliedSearchTerm && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">Search: "{appliedSearchTerm}"</span>}
                        {appliedSiteType && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">Site Type: {appliedSiteType === 'onsite' ? 'Onsite' : 'Remote'}</span>}
                    </div>
                    </div>
                )}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                    <thead className="sticky top-0 bg-gray-100 z-10">
                    <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 rounded-l-xl">Title</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Job Type</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Location</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Site Type</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Skills</th>
                        <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 rounded-r-xl">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {filteredJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-800">{job.title}</td>
                        <td className="py-3 px-4 text-gray-600">{job.job_type}</td>
                        <td className="py-3 px-4 text-gray-600">{[job.city, job.province, job.country].filter(Boolean).join(", ")}</td>
                        <td className="py-3 px-4 text-gray-600">{job.site_based ? 'Onsite' : 'Remote'}</td>
                        <td className="py-3 px-4 text-gray-600">
                            <div className="flex flex-wrap gap-1">
                                {(Array.isArray(job.skills) ? job.skills : job.skills.split(',')).slice(0, 2).map((skill, index) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                    {skill.trim()} {/* trim to remove any extra spaces */}
                                    </span>
                                ))}
                                {(Array.isArray(job.skills) ? job.skills : job.skills.split(',')).length > 2 && (
                                    <span className="text-xs font-medium p-1">
                                    +{(Array.isArray(job.skills) ? job.skills : job.skills.split(',')).length - 2} more
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                            <input 
                                type="checkbox" 
                                checked={job.active} 
                                onChange={() => toggleActive(job.id)} 
                                className="w-4 h-4 accent-teal-600"
                            />
                            <button
                                onClick={() => setSelectedJob(job)}
                                className="text-blue-500 hover:text-blue-700 p-1"
                            >
                                <Eye size={18} />
                            </button>
                            <button
                                onClick={() => handleEditClick(job)}
                                className="text-green-500 hover:text-green-700 p-1"
                            >
                                <Pencil size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(job.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                            >
                                <Trash2 size={18} />
                            </button>
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
                {filteredJobs.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No jobs found.</p>
                </div>
                )}
                <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalJobs}
                startIndex={startIndex}  // Displaying 1-based index for start
                endIndex={endIndex > totalJobs ? totalJobs : endIndex}  // Ensure no exceeding totalJobs
                />
            </div>
            {/* View Modal */}
            {selectedJob && !isEditing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white/90 backdrop-blur-md w-full max-w-4xl max-h-[90vh] rounded-xl shadow-xl p-6 overflow-y-auto">
                    <h2 className="text-lg sm:text-xl font-bold mb-4">{selectedJob.title}</h2>
                    
                    {/* Basic Info Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                        <p><strong>Job Type:</strong> {selectedJob.job_type}</p>
                        <p><strong>Location:</strong> {[selectedJob.city, selectedJob.province, selectedJob.country].filter(Boolean).join(", ")}</p>
                        <p><strong>Site Type:</strong> {selectedJob.site_based ? 'Onsite' : 'Remote'}</p>
                        <p><strong>Experience:</strong> {selectedJob.experience || 'Not specified'}</p>
                    </div>
                    <div>
                        <p><strong>Status:</strong> <span className={selectedJob.active ? "text-green-600" : "text-red-600"}>{selectedJob.active ? "Active" : "Inactive"}</span></p>
                        <div className="mt-2">
                        <strong>Skills:</strong>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {(selectedJob.skills || []).map((skill) => (
                            <span key={skill} className="bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                                {skill}
                            </span>
                            ))}
                        </div>
                        </div>
                    </div>
                    </div>

                    {/* Rich Text Content Sections */}
                    {selectedJob.requirements && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2 text-gray-800">Requirements</h3>
                        <div className="bg-gray-50 p-4 rounded-lg" dangerouslySetInnerHTML={renderHTML(selectedJob.requirements)} />
                    </div>
                    )}

                    {selectedJob.responsibilities && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2 text-gray-800">Responsibilities</h3>
                        <div className="bg-gray-50 p-4 rounded-lg" dangerouslySetInnerHTML={renderHTML(selectedJob.responsibilities)} />
                    </div>
                    )}

                    {selectedJob.description && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2 text-gray-800">Description</h3>
                        <div className="bg-gray-50 p-4 rounded-lg" dangerouslySetInnerHTML={renderHTML(selectedJob.description)} />
                    </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => handleEditClick(selectedJob)}
                        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 flex items-center gap-2"
                    >
                        <Pencil size={16} /> Edit
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={() => setSelectedJob(null)}
                    >
                        Close
                    </button>
                    </div>
                </div>
                </div>
            )}

            {/* Edit Modal */}
            {selectedJob && isEditing && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white/95 backdrop-blur rounded-xl shadow-xl p-4 w-[800px] h-[700px] flex flex-col">
                    <h2 className="text-lg sm:text-xl font-bold mb-3 text-center">Edit Job</h2>
                    {/* Tabs */}
                    <div className="flex gap-2 justify-center mb-4 flex-wrap">
                    {editTabs.map((tab) => (
                        <button
                        key={tab}
                        type="button"
                        onClick={() => setEditActiveTab(tab)}
                        className={`px-3 py-1 rounded-full text-sm ${editActiveTab === tab ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                        >
                        {tab}
                        </button>
                    ))}
                    </div>
                    <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto">
                    {editActiveTab === 'BASIC INFO' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input type="text" name="title" value={editForm.title} onChange={handleEditChange} className="w-full p-2 border rounded" required />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                            <input type="text" name="job_type" value={editForm.job_type} onChange={handleEditChange} className="w-full p-2 border rounded" required />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input type="text" name="city" value={editForm.city} onChange={handleEditChange} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                            <input type="text" name="province" value={editForm.province} onChange={handleEditChange} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <input type="text" name="country" value={editForm.country} onChange={handleEditChange} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                            <input type="text" name="experience" value={editForm.experience || ''} onChange={handleEditChange} className="w-full p-2 border rounded" />
                        </div>
                        <div className="flex items-center gap-4 sm:col-span-2">
                            <label className="flex items-center gap-2">
                            <input type="checkbox" name="site_based" checked={editForm.site_based} onChange={handleEditChange} className="w-4 h-4 accent-teal-600" />
                            <span>Site Based</span>
                            </label>
                            <label className="flex items-center gap-2">
                            <input type="checkbox" name="active" checked={editForm.active} onChange={handleEditChange} className="w-4 h-4 accent-teal-600" />
                            <span>Active</span>
                            </label>
                        </div>
                        </div>
                    )}
                    {editActiveTab === 'SKILLS' && (
                        <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                            {editForm.skills.map((skill, index) => (
                            <div key={index} className="flex gap-2">
                            <input type="text" value={skill} onChange={(e) => handleSkillChange(e, index)} className="flex-1 p-2 border rounded" />
                            <button type="button" onClick={() => removeSkill(index)} className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200">Remove</button>
                            </div>
                            ))}
                        <button type="button" onClick={addSkill} className="mt-2 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm">Add Skill</button>
                        </div>
                    )}
                    {editActiveTab === 'REQUIREMENTS' && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                        <SummernoteEditor
                            key="requirements-editor"
                            value={editForm.requirements}
                            onChange={(val) => setEditForm((p) => ({ ...p, requirements: val }))}
                            placeholder="List the requirements for this position..."
                        />
                        </div>
                    )}
                    {editActiveTab === 'RESPONSIBILITIES' && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities</label>
                        <SummernoteEditor
                            key="responsibilities-editor"
                            value={editForm.responsibilities}
                            onChange={(val) => setEditForm((p) => ({ ...p, responsibilities: val }))}
                            placeholder="Describe the responsibilities for this role..."
                        />
                        </div>
                    )}
                    {editActiveTab === 'DESCRIPTION' && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <SummernoteEditor
                            key="description-editor"
                            value={editForm.description}
                            onChange={(val) => setEditForm((p) => ({ ...p, description: val }))}
                            placeholder="Provide a detailed description of the job..."
                        />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between gap-3 mt-4">
                        <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                        <div className="flex gap-2">
                        {editActiveTab !== 'BASIC INFO' && (
                            <button type="button" onClick={() => setEditActiveTab(editTabs[editTabs.indexOf(editActiveTab) - 1])} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Previous</button>
                        )}
                        {editActiveTab !== 'DESCRIPTION' ? (
                            <button type="button" onClick={() => setEditActiveTab(editTabs[editTabs.indexOf(editActiveTab) + 1])} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">Next</button>
                        ) : (
                            <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">Save Changes</button>
                        )}
                        </div>
                    </div>
                    </form>
                </div>
                </div>
            )}
        </div>
    </>
    )
}

export default JobList
