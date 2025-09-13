'use client';

import { useState, useCallback } from 'react';
import { 
  FaEnvelope, 
  FaUser, 
  FaSearch, 
  FaCheck, 
  FaPlane, 
  FaHandHoldingUsd, 
  FaMoneyCheckAlt, 
  FaFileAlt, 
  FaCalendarCheck, 
  FaUserCheck, 
  FaIdCard,
  FaTimes,
  FaPlay,
  FaInfoCircle
} from 'react-icons/fa';
import Container from '../../components/atoms/Container';
import Heading from '../../components/atoms/Heading';
import Input from '../../components/atoms/Input';
import Button from '../../components/atoms/Button';
import { toast } from 'sonner';
import Image from 'next/image';

// Types
interface ApplicationData {
  student_registration_name: string;
  student_registration_interested_country: string;
  student_registration_passport_number: string;
  [key: string]: string;
}

interface Step {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}


const steps: Step[] = [
  { 
    key: 'student_registration_initial_documents_assessment', 
    label: 'Documents Assessment', 
    icon: <FaHandHoldingUsd className="text-white" size={20} />,
    description: 'Initial review of your academic documents and credentials'
  },
  { 
    key: 'student_registration_course_finalization', 
    label: 'Course Finalization', 
    icon: <FaMoneyCheckAlt className="text-white" size={20} />,
    description: 'Selection and confirmation of your study program'
  },
  { 
    key: 'student_registration_application_submitted', 
    label: 'Application Submitted', 
    icon: <FaFileAlt className="text-white" size={20} />,
    description: 'Your application has been officially submitted to the institution'
  },
  { 
    key: 'student_registration_got_admission', 
    label: 'Admission Received', 
    icon: <FaCalendarCheck className="text-white" size={20} />,
    description: 'Congratulations! You have received your acceptance letter'
  },
  { 
    key: 'student_registration_visa_applied', 
    label: 'Visa Processing', 
    icon: <FaUserCheck className="text-white" size={20} />,
    description: 'Your student visa application is being processed'
  },
  { 
    key: 'student_registration_visa_approved', 
    label: 'Visa Approved', 
    icon: <FaIdCard className="text-white" size={20} />,
    description: 'Your visa has been approved - ready for travel!'
  },
];

const TrackApplication = () => {
  const [name, setName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Input validation
  const validateInputs = useCallback(() => {
    if (!name.trim() || !passportNumber.trim()) {
      toast.error('Please enter both name and passport number');
      return false;
    }

    if (name.length < 2) {
      toast.error('Please enter a valid name');
      return false;
    }

    if (passportNumber.length < 4) {
      toast.error('Please enter a valid passport number');
      return false;
    }

    return true;
  }, [name, passportNumber]);

  // Secure API call with error handling
  const handleTrack = useCallback(async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setApplicationData(null);

    try {
      const response = await fetch(
        `/api/frontend/track-application?name=${encodeURIComponent(name.trim())}&passportNumber=${encodeURIComponent(passportNumber.trim())}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch application data');
      }

      if (data.success && data.data?.data?.length > 0) {
        setApplicationData(data.data.data[0]);
        toast.success('Application found successfully!');
      } else {
        toast.error(data.message || 'Application not found. Please check your details.');
      }
    } catch (error) {
      console.error('Track error:', error);
      toast.error(error.message || 'Something went wrong while tracking. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [name, passportNumber, validateInputs]);

  // Get current step index
  const getCurrentStepIndex = useCallback(() => {
    if (!applicationData) return -1;

    for (let i = steps.length - 1; i >= 0; i--) {
      if (applicationData[steps[i].key] === "on") {
        return i;
      }
    }
    return -1;
  }, [applicationData]);

  const currentStepIndex = getCurrentStepIndex();



  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with dark blue background */}
      <div className="relative w-full bg-[#2E3B5A] py-8 md:py-20">
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#2E3B5A]/90 to-[#132b65]/90"
        style={{
          backgroundImage: "url('/assets/backgrounds/free-consultaion-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#0B6D76]/25 to-[#2E3B5A]/10" />

        <Container>
          <div className="relative z-10 text-center max-w-4xl mx-auto px-1">
            <Heading level={3} className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Track Your <span className="text-[#0B6D76]">Application Status</span>
            </Heading>
            <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Monitor your journey to studying abroad with our real-time application tracking system
            </p>
            
            {/* Search Form Card */}
            <div className="bg-white rounded-2xl pt-8 p-3 shadow-2xl border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#2E3B5A] mb-2">
                    Full Name
                  </label>
                  <Input
                    name="name"
                    icon={<FaUser className="text-[#0B6D76]" />}
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2E3B5A] mb-2">
                    Passport Number
                  </label>
                  <Input
                    name="passportNumber"
                    icon={<FaEnvelope className="text-[#0B6D76]" />}
                    placeholder="Enter passport number"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}                  />
                </div>
              </div>
              <Button
                onClick={handleTrack}
                disabled={loading}
                className="w-full md:w-auto px-10 py-4 bg-[#0B6D76] hover:bg-[#095a62] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Tracking Application...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FaSearch className="mr-3" />
                    Track My Application
                  </span>
                )}
              </Button>
              
              <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
                <FaInfoCircle className="mr-2 text-[#0B6D76]" />
                <span>Your information is secure and encrypted</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Application Status Section */}
      {applicationData && (
        <Container className="py-16 md:py-20">
          {/* Profile Summary Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16 border border-gray-100 mt-20">
            <div className="text-center mb-8">
              <Heading level={2} className="text-2xl md:text-3xl font-bold text-[#2E3B5A] mb-2">
                Application Overview
              </Heading>
              <p className="text-gray-600">Here&apos;s your current application status</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#2E3B5A] to-[#132b65] rounded-xl p-6 text-white text-center">
                <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUser className="text-xl" />
                </div>
                <h3 className="font-semibold mb-2">Applicant Name</h3>
                <p className="text-white/90">{applicationData.student_registration_name || 'N/A'}</p>
              </div>
              
              <div className="bg-gradient-to-br from-[#0B6D76] to-[#0D8994] rounded-xl p-6 text-white text-center">
                <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaPlane className="text-xl" />
                </div>
                <h3 className="font-semibold mb-2">Destination Country</h3>
                <p className="text-white/90">{applicationData.student_registration_interested_country || '—'}</p>
              </div>
              
              <div className="bg-gradient-to-br from-[#2E3B5A] to-[#132b65] rounded-xl p-6 text-white text-center">
                <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaIdCard className="text-xl" />
                </div>
                <h3 className="font-semibold mb-2">Passport Number</h3>
                <p className="text-white/90">{applicationData.student_registration_passport_number || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Progress Tracker Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <Heading level={2} className="text-2xl md:text-3xl font-bold text-[#2E3B5A] mb-4">
                Your Application Journey
              </Heading>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Follow your progress through each stage of the application process. 
                Our team is working diligently to get you to your dream destination.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              {/* Progress Steps */}
              <div className="relative mb-12">
                <div className="absolute hidden lg:block left-16 right-16 top-8 h-2 bg-gray-200 -z-10">
                  <div 
                    className="h-full bg-gradient-to-r from-[#0B6D76] to-[#2E3B5A] transition-all duration-1000 ease-in-out rounded-full"
                    style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {steps.map((step, idx) => {
                    const isCompleted = applicationData[step.key] === "on";
                    const isCurrentStep = idx === currentStepIndex;
                    const isPending = idx > currentStepIndex;
                    
                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 shadow-lg border-4 border-white transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-gradient-to-br from-[#0B6D76] to-[#2E3B5A] shadow-green-200' 
                            : isCurrentStep 
                            ? 'bg-gradient-to-br from-[#0B6D76] to-[#2E3B5A] shadow-blue-200 ring-4 ring-[#0B6D76]/30 animate-pulse' 
                            : 'bg-gray-300 shadow-gray-200'
                        }`}>
                          {isCompleted ? <FaCheck className="text-white text-lg" /> : step.icon}
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 w-full">
                          <h3 className={`font-semibold text-sm mb-2 ${
                            isCompleted 
                              ? 'text-[#0B6D76]' 
                              : isCurrentStep 
                              ? 'text-[#2E3B5A]' 
                              : 'text-gray-500'
                          }`}>
                            {step.label}
                          </h3>
                          
                          <p className="text-xs text-gray-600 mb-3">
                            {step.description}
                          </p>
                          
                          <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                            isCompleted 
                              ? 'bg-green-100 text-green-800' 
                              : isCurrentStep 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {isCompleted ? 'Completed' : isCurrentStep ? 'In Progress' : 'Pending'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Summary */}
              <div className="bg-gradient-to-r from-[#2E3B5A] to-[#0B6D76] rounded-xl p-6 text-white text-center">
                <h3 className="text-xl font-semibold mb-2">Current Status</h3>
                <p className="text-white/90 mb-4">
                  {currentStepIndex >= 0 ? steps[currentStepIndex].label : 'Application Received'}
                </p>
                <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                  />
                </div>
                <p className="text-sm">
                  Step {currentStepIndex + 1} of {steps.length} • {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% Complete
                </p>
              </div>
            </div>
          </div>


        </Container>
      )}

      {/* No Results State */}
      {!applicationData && !loading && (
        <Container className="py-16 md:py-20">
          <div className="max-w-2xl mx-auto mt-20">
            <div className="bg-white rounded-2xl shadow-xl p-10 text-center border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-[#2E3B5A] to-[#0B6D76] rounded-full flex items-center justify-center mx-auto mb-6">
                <FaSearch className="text-white text-2xl" />
              </div>
              <Heading level={2} className="text-2xl font-bold text-[#2E3B5A] mb-4">
                Ready to Track Your Application?
              </Heading>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Enter your name and passport number above to see your current application status. 
                Our tracking system provides real-time updates on each step of your journey to studying abroad.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="w-8 h-8 bg-[#0B6D76] rounded-full flex items-center justify-center mx-auto mb-2">
                    <FaCheck className="text-white text-xs" />
                  </div>
                  Real-time updates
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="w-8 h-8 bg-[#0B6D76] rounded-full flex items-center justify-center mx-auto mb-2">
                    <FaCheck className="text-white text-xs" />
                  </div>
                  Detailed progress
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="w-8 h-8 bg-[#0B6D76] rounded-full flex items-center justify-center mx-auto mb-2">
                    <FaCheck className="text-white text-xs" />
                  </div>
                  Secure information
                </div>
              </div>
            </div>
          </div>
        </Container>
      )}

                {/* Video Guide Section */}
          <div className="text-center mt-30">
            <div className="mb-12">
              <Heading level={2} className="text-2xl md:text-3xl font-bold text-[#2E3B5A] mb-4">
                Need Guidance?
              </Heading>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Watch our comprehensive guide to understand each step of the application process 
                and what to expect along your journey.
              </p>
            </div>
            
            <div className="relative bg-gradient-to-r from-[#2E3B5A] to-[#0B6D76] rounded-2xl overflow-hidden aspect-video max-w-4xl mx-auto shadow-2xl">
              <Image
                src="/assets/media-18.jpg"
                alt="Application tracking guide"
                fill
                className="object-cover opacity-40"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">
                  How to Navigate Your Application Journey
                </h3>
                <p className="text-white/90 mb-8 max-w-2xl text-center">
                  Learn about each stage of the process, required documents, and estimated timelines
                </p>
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="bg-white text-[#0B6D76] rounded-full p-5 shadow-lg transition-all duration-300 transform hover:scale-110 hover:shadow-xl"
                  aria-label="Play video guide"
                >
                  <FaPlay className="text-xl ml-1" />
                </button>
              </div>
            </div>
          </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-black rounded-2xl overflow-hidden w-full max-w-4xl">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10 transition-colors"
              aria-label="Close video"
            >
              <FaTimes className="w-8 h-8" />
            </button>
            
            <div className="aspect-video">
              <video
                className="w-full h-full"
                controls
                autoPlay
                poster="/assets/media-18.jpg"
              >
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackApplication;