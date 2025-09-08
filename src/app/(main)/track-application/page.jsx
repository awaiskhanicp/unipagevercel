'use client';

import { useState } from 'react';
import { FaEnvelope, FaUser, FaSearch, FaCheck, FaSpinner, FaPlane, FaHandHoldingUsd, FaMoneyCheckAlt, FaFileAlt, FaCalendarCheck, FaUserCheck, FaIdCard } from 'react-icons/fa';
import Container from '../../components/atoms/Container';
import Heading from '../../components/atoms/Heading';
import Input from '../../components/atoms/Input';
import Button from '../../components/atoms/Button';
import { toast } from 'sonner';

const steps = [
  { key: 'student_registration_initial_documents_assessment', label: 'Initial Documents Assessment', icon: <FaHandHoldingUsd size={28} /> },
  { key: 'student_registration_course_finalization', label: 'Course Finalization', icon: <FaMoneyCheckAlt size={28} /> },
  { key: 'student_registration_application_submitted', label: 'Application Submitted', icon: <FaFileAlt size={28} /> },
  { key: 'student_registration_got_admission', label: 'Got Admission', icon: <FaCalendarCheck size={28} /> },
  { key: 'student_registration_visa_applied', label: 'Visa Processing', icon: <FaUserCheck size={28} /> },
  { key: 'student_registration_visa_approved', label: 'Visa Approved', icon: <FaIdCard size={28} /> },
  // { key: 'student_registration_travel_plan_finalized', label: 'Travel Plan Finalized', icon: <FaPlane size={28} /> },
  // { key: 'student_registration_pre_departure_session', label: 'Pre-departure Session', icon: <FaUser size={28} /> },
  // { key: 'student_registration_arrival_confirmation', label: 'Arrival Confirmation', icon: <FaCheck size={28} /> },
  // { key: 'student_registration_enrollment_completed', label: 'Enrollment Completed', icon: <FaCheck size={28} /> },
];

const TrackApplication = () => {
  const [name, setName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const handleTrack = async () => {
    if (!name || !passportNumber) {
      toast.error('Please enter both name and passport number');
      return;
    }

    setLoading(true);
    setApplicationData(null);

    try {
      const res = await fetch(
        `/api/internal/track-application?name=${encodeURIComponent(name)}&passportNumber=${encodeURIComponent(passportNumber)}`
      );
      const data = await res.json();
      console.log(data);

      if (data.success && data.data?.data?.length > 0) {
        setApplicationData(data.data.data[0]);
        toast.success('Application found!');
      } else {
        toast.error(data.message || 'Application not found');
      }
    } catch (error) {
      console.error('Track error:', error);
      toast.error('Something went wrong while tracking');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!applicationData) return -1;

    for (let i = steps.length - 1; i >= 0; i--) {
      if (applicationData[steps[i].key] === "on") {
        return i;
      }
    }
    return -1;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="  text-center bg-white">
      {/* Full width background image section for form */}
      <div className="w-full relative full-bg-track">
        <div className="max-w-4xl mx-auto px-6 py-12 w-full flex flex-col items-center">
          <Heading level={3} className="text-3xl font-bold text-white drop-shadow">
            Track Your <span className="text-[#0B6D76] font-semibold">Application Status</span>
          </Heading>
          <p className="text-gray-100 mt-2 drop-shadow">Enter your details to check your application progress</p>
          <div className="flex flex-col md:flex-row justify-center items-center pb-[40px] gap-[20px] md:gap-[25px] mt-8 w-full">
            <Input
              name={'name'}
              icon={<FaUser className="text-[#0B6D76]" />}
              placeholder={'Enter Full Name'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-2 border-gray-200 focus:border-[#0B6D76] rounded-lg px-4 py-3"
            />
            <Input
              name={'passportNumber'}
              icon={<FaEnvelope className="text-[#0B6D76]" />}
              placeholder={'Enter Passport Number'}
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
              className="border-2 border-gray-200 focus:border-[#0B6D76] rounded-lg px-4 py-3"
            />
            <Button
              className="w-full md:w-auto px-12 py-4 bg-[#0B6D76] hover:bg-[#0a5c65] text-white font-medium rounded-lg flex items-center gap-2"
              onClick={handleTrack}
              disabled={loading}
            >
              {loading ? (
                <>Tracking...</>
              ) : (
                <><FaSearch />Track</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Show progress tracker only if applicationData is present */}
      {applicationData && (
        <>
          {/* Profile Details - One Line */}
          <div className="text-center mt-[120px] pt-[20px] px-6">
            <div className="bg-white rounded-lg shadow-md py-3 px-6 inline-block">
              <span className="text-gray-600 mr-4">
                <strong>Name:</strong> {applicationData.student_registration_name || 'N/A'}
              </span>
              <span className="text-gray-600 mr-4">
                <strong>Country:</strong> {applicationData.student_registration_interested_country || '—'}
              </span>
              <span className="text-gray-600">
                <strong>Passport:</strong> {applicationData.student_registration_passport_number || 'N/A'}
              </span>
            </div>
          </div>
          
          <div className=" text-center pt-[40px]">
            <Heading level={3}><span className='text-black leading-[60px]'>Simple steps to easily get your visa</span></Heading>
          </div>
          <div className="mt-8 mx-auto max-w-6xl px-6 bg-white shadow-xl rounded-xl flex flex-col md:flex-row justify-center items-center gap-[25px] border border-gray-100 relative z-50">
            
            {/* Steps Card with airplane and dotted line */}
            <div className="relative w-full flex justify-center">
              <div className="justify-center flex items-center px-6 py-10 gap-12 w-full relative overflow-x-auto" style={{ overflowY: 'hidden' }}>
                {steps.map((step, idx) => {
                  const isCompleted = applicationData[step.key] === "on";
                  const isCurrentStep = idx === currentStepIndex;
                  const isPending = idx > currentStepIndex;
                  
                  return (
                    <div key={step.label} className="flex flex-col items-center relative">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl mb-3 shadow-lg border-4 border-white transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-[#0B6D76] shadow-[#0B6D76]/20' 
                          : isCurrentStep 
                          ? 'bg-[#0B6D76] shadow-[#0B6D76]/20 animate-pulse' 
                          : isPending 
                          ? 'bg-gray-400 shadow-gray-200' 
                          : 'bg-gray-400 shadow-gray-200'
                      }`}>
                        {isCompleted ? <FaCheck size={28} /> : step.icon}
                      </div>
                      <span className={`font-bold text-base text-center transition-all duration-300 ${
                        isCompleted 
                          ? 'text-[#0B6D76]' 
                          : isCurrentStep 
                          ? 'text-[#0B6D76]' 
                          : 'text-gray-500'
                      }`} style={{ letterSpacing: '0.01em' }}>
                        {step.label}
                      </span>
                      {/* Dotted line + airplane between steps */}
                      {idx < steps.length - 1 && (
                        <div className="flex items-center absolute top-[40%] left-[78%] transform -translate-y-1/2">
                          <div className={`h-0.5 w-10 border-dotted border-t-2 transition-all duration-300 ${
                            isCompleted ? 'border-[#0B6D76]/40' : 'border-gray-300'
                          }`} style={{borderStyle:'dotted'}}></div>
                          <FaPlane className={`mx-1 text-sm rotate-45 transition-all duration-300 ${
                            isCompleted ? 'text-[#0B6D76]' : 'text-gray-400'
                          }`} />
                          <div className={`h-0.5 w-10 border-dotted border-t-2 transition-all duration-300 ${
                            isCompleted ? 'border-[#0B6D76]/40' : 'border-gray-300'
                          }`} style={{borderStyle:'dotted'}}></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Video Section */}
          <div className="w-full relative -mt-32 mb-[80px]">
            <div className="rounded-xl overflow-hidden">
              <div className="aspect-video relative">
                {/* Thumbnail with play button */}
                <div className="relative w-full h-[90vh]">
                  <img
                    src="/assets/media-18.jpg"
                    alt="Video thumbnail"
                    className="w-full h-[80vh] object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', e.target.src);
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => console.log('Image loaded successfully')}
                  />
                <div className="absolute inset-0 flex items-center px-[150px] w-full h-full bg-opacity-10 hover:bg-opacity-20 transition-all">
                  <Heading level={3}><span className='text-white'>How to Track Your Application Status</span></Heading>
                <button
                    onClick={() => setShowVideoModal(true)}
                    className=" justify-end flex  items-center w-full "
                  >
                    <div className="w-20 h-20 bg-red-700 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>
                </div>
                </div>
              </div>
            </div>

            {/* Video Modal */}
            {showVideoModal && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="relative w-full max-w-4xl">
                  <button
                    onClick={() => setShowVideoModal(false)}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <video
                    className="w-full rounded-lg"
                    controls
                    autoPlay
                  >
                    <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                    <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.webm" type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      <Container>
        {/* If no applicationData and not loading, show illustration and message */}
       
      </Container>
    </div>
  );
};

export default TrackApplication;