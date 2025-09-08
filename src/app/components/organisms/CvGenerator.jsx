'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Input from '../atoms/Input';
import { FaToggleOff, FaToggleOn } from 'react-icons/fa';
import { CgProfile } from "react-icons/cg";
import { PencilIcon } from 'lucide-react';
import Heading from '../atoms/Heading';
import Cropper from 'react-easy-crop';
import CvTemplate from './CvTemplate';

// Helper to get cropped image as base64
function getCroppedImg(imageSrc, crop, zoom, aspect = 1) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = image.naturalWidth / image.width;
      const cropX = crop.x * scale;
      const cropY = crop.y * scale;
      const cropWidth = (image.width * crop.width / 100) * scale;
      const cropHeight = (image.height * crop.height / 100) * scale;
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );
      resolve(canvas.toDataURL('image/jpeg'));
    };
    image.onerror = reject;
  });
}

export default function ResumeBuilder({ studentId }) {
  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    profileImage: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    nationality: '',
    aboutYourself: ''
  });

  // Address Details State
  const [addressDetails, setAddressDetails] = useState({
    city: '',
    country: '',
    postalCode: '',
    address: ''
  });

  // Dynamic sections state
  const [educations, setEducations] = useState([
    {
      id: '1',
      degreeName: '',
      instituteName: '',
      city: '',
      country: '',
      totalMarks: '',
      obtainedMarks: '',
      startDate: '',
      endDate: '',
      instituteLink: '',
      currentlyStudying: false
    }
  ]);

  const [experiences, setExperiences] = useState([
    {
      id: '1',
      position: '',
      employer: '',
      city: '',
      country: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      details: ''
    }
  ]);

  const [skills, setSkills] = useState([
    {
      id: '1',
      name: '',
      level: ''
    }
  ]);

  const [languages, setLanguages] = useState([
    { id: '1', language: 'Mother Language', certificate: '' },
    { id: '2', language: 'English', certificate: '' }
  ]);

  const [drivingLicenses, setDrivingLicenses] = useState([
    { id: '1', licenseType: '' }
  ]);

  const [hobbies, setHobbies] = useState(['']);

  const [awards, setAwards] = useState([
    { id: '1', title: '', awardDate: '', institutionName: '', details: '' }
  ]);

  // 1. Add state for projects (after awards state)
  const [projects, setProjects] = useState([
    { id: '1', title: '', startDate: '', endDate: '', detail: '' }
  ]);

  const [submitStatus, setSubmitStatus] = useState(null); // For showing success/error
  const [showTemplate, setShowTemplate] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Add state and logic for edit limit
  const [editLimitReached, setEditLimitReached] = useState(false);
  useEffect(() => {
    if (!studentId) return;
    (async () => {
      try {
        const res = await fetch(`/api/external/resume?std=${studentId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.id) {
          setPersonalInfo({
            profileImage: data.profileImage || '',
            fullName: data.fullName || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || '',
            gender: data.gender || '',
            dateOfBirth: data.dateOfBirth || '',
            nationality: data.nationality || '',
            aboutYourself: data.aboutYourself || ''
          });
          setAddressDetails({
            city: data.city || '',
            country: data.country || '',
            postalCode: data.postalCode || '',
            address: data.address || ''
          });
          setEducations(Array.isArray(data.education_details) && data.education_details.length > 0 ? data.education_details : [{ id: '1', degreeName: '', instituteName: '', city: '', country: '', totalMarks: '', obtainedMarks: '', startDate: '', endDate: '', instituteLink: '', currentlyStudying: false }]);
          setExperiences(Array.isArray(data.experience_details) && data.experience_details.length > 0 ? data.experience_details : [{ id: '1', position: '', employer: '', city: '', country: '', startDate: '', endDate: '', currentlyWorking: false, details: '' }]);
          setSkills(Array.isArray(data.skills) && data.skills.length > 0 ? data.skills : [{ id: '1', name: '', level: '' }]);
          setLanguages(Array.isArray(data.languages) && data.languages.length > 0 ? data.languages : [{ id: '1', language: 'Mother Language', certificate: '' }, { id: '2', language: 'English', certificate: '' }]);
          setDrivingLicenses(Array.isArray(data.driving_licence) && data.driving_licence.length > 0 ? data.driving_licence : [{ id: '1', licenseType: '' }]);
          setHobbies(Array.isArray(data.hobbies_and_interest) && data.hobbies_and_interest.length > 0 ? data.hobbies_and_interest : ['']);
          setAwards(Array.isArray(data.awards) && data.awards.length > 0 ? data.awards : [{ id: '1', title: '', awardDate: '', institutionName: '', details: '' }]);
          setProjects(Array.isArray(data.projects) && data.projects.length > 0 ? data.projects : [{ id: '1', title: '', startDate: '', endDate: '', detail: '' }]);
          setShowTemplate(true);
          if (data.link_status && !isNaN(Number(data.link_status)) && Number(data.link_status) >= 3) {
            setEditLimitReached(true);
          } else {
            setEditLimitReached(false);
          }
        }
      } catch (e) {
        // ignore error, show empty form
      }
    })();
  }, [studentId]);

  // Helper functions for dynamic sections
  const addEducation = () => {
    setEducations([
      ...educations,
      {
        id: Date.now().toString(),
        degreeName: '',
        instituteName: '',
        city: '',
        country: '',
        totalMarks: '',
        obtainedMarks: '',
        startDate: '',
        endDate: '',
        instituteLink: '',
        currentlyStudying: false
      }
    ]);
  };

  const removeEducation = (id) => {
    if (educations.length > 1) {
      setEducations(educations.filter(edu => edu.id !== id));
    }
  };

  const updateEducation = (id, field, value) => {
    setEducations(educations.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: Date.now().toString(),
        position: '',
        employer: '',
        city: '',
        country: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        details: ''
      }
    ]);
  };

  const removeExperience = (id) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter(exp => exp.id !== id));
    }
  };

  const updateExperience = (id, field, value) => {
    setExperiences(experiences.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const addSkill = () => {
    setSkills([
      ...skills,
      { id: Date.now().toString(), name: '', level: '' }
    ]);
  };

  const removeSkill = (id) => {
    if (skills.length > 1) {
      setSkills(skills.filter(skill => skill.id !== id));
    }
  };

  const updateSkill = (id, field, value) => {
    setSkills(skills.map(skill =>
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
  };

  const addLanguage = () => {
    setLanguages([
      ...languages,
      { id: Date.now().toString(), language: '', certificate: '' }
    ]);
  };

  const removeLanguage = (id) => {
    if (languages.length > 2) {
      setLanguages(languages.filter(lang => lang.id !== id));
    }
  };

  const updateLanguage = (id, field, value) => {
    setLanguages(languages => languages.map(lang => {
      if (lang.id !== id) return lang;
      // If updating proficiency, merge deeply
      if (field === 'proficiency') {
        return { ...lang, proficiency: { ...lang.proficiency, ...value } };
      }
      return { ...lang, [field]: value };
    }));
  };

  const addDrivingLicense = () => {
    setDrivingLicenses([
      ...drivingLicenses,
      { id: Date.now().toString(), licenseType: '' }
    ]);
  };

  const removeDrivingLicense = (id) => {
    if (drivingLicenses.length > 1) {
      setDrivingLicenses(drivingLicenses.filter(license => license.id !== id));
    }
  };

  const updateDrivingLicense = (id, value) => {
    setDrivingLicenses(drivingLicenses.map(license =>
      license.id === id ? { ...license, licenseType: value } : license
    ));
  };

  const addHobby = () => {
    setHobbies([...hobbies, '']);
  };

  const removeHobby = (index) => {
    if (hobbies.length > 1) {
      setHobbies(hobbies.filter((_, i) => i !== index));
    }
  };

  const updateHobby = (index, value) => {
    const newHobbies = [...hobbies];
    newHobbies[index] = value;
    setHobbies(newHobbies);
  };

  const addAward = () => {
    setAwards([
      ...awards,
      { id: Date.now().toString(), title: '', awardDate: '', institutionName: '', details: '' }
    ]);
  };

  const removeAward = (id) => {
    if (awards.length > 1) {
      setAwards(awards.filter(award => award.id !== id));
    }
  };

  const updateAward = (id, field, value) => {
    setAwards(awards.map(award =>
      award.id === id ? { ...award, [field]: value } : award
    ));
  };

  // 2. Add helper functions for projects (with other dynamic helpers)
  const addProject = () => {
    setProjects([
      ...projects,
      { id: Date.now().toString(), title: '', startDate: '', endDate: '', detail: '' }
    ]);
  };

  const removeProject = (id) => {
    if (projects.length > 1) {
      setProjects(projects.filter(project => project.id !== id));
    }
  };

  const updateProject = (id, field, value) => {
    setProjects(projects.map(project =>
      project.id === id ? { ...project, [field]: value } : project
    ));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCropImageSrc(e.target.result);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    if (!cropImageSrc || !croppedAreaPixels) return;
    const croppedImg = await getCroppedImg(cropImageSrc, croppedAreaPixels, zoom);
    setPersonalInfo({ ...personalInfo, profileImage: croppedImg });
    setCropModalOpen(false);
    setCropImageSrc(null);
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setCropImageSrc(null);
  };

  // Helper to check if all values in an object are empty (except id)
  const isObjectEmpty = (obj) => Object.entries(obj).filter(([k]) => k !== 'id').every(([, v]) => v === '' || v === false || v === null || v === undefined);
  const filterHobbies = (arr) => arr.filter(hobby => hobby && hobby.trim() !== '');

  // API integration for saving resume
  const handleSaveResume = async () => {
    setSubmitStatus(null);
    // Filter out empty objects before sending
    const filteredEducations = educations.filter(e => !isObjectEmpty(e));
    const filteredExperiences = experiences.filter(e => !isObjectEmpty(e));
    const filteredSkills = skills.filter(e => !isObjectEmpty(e));
    const filteredLanguages = languages.filter(e => e.language && e.language.trim() !== '');
    const filteredDrivingLicenses = drivingLicenses.filter(e => !isObjectEmpty(e));
    const filteredAwards = awards.filter(e => !isObjectEmpty(e));
    const filteredProjects = projects.filter(e => !isObjectEmpty(e));
    const filteredHobbies = filterHobbies(hobbies);
    try {
      const res = await fetch('/api/internal/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: personalInfo.fullName,
          email: personalInfo.email,
          phoneNumber: personalInfo.phoneNumber,
          gender: personalInfo.gender,
          dateOfBirth: personalInfo.dateOfBirth,
          nationality: personalInfo.nationality,
          aboutYourself: personalInfo.aboutYourself,
          profileImage: personalInfo.profileImage,
          postalCode: addressDetails.postalCode,
          city: addressDetails.city,
          country: addressDetails.country,
          address: addressDetails.address,
          educations: filteredEducations,
          experiences: filteredExperiences,
          skills: filteredSkills,
          languages: filteredLanguages,
          drivingLicenses: filteredDrivingLicenses,
          hobbies: filteredHobbies,
          awards: filteredAwards,
          projects: filteredProjects
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
      }
    } catch (err) {
      setSubmitStatus('error');
    }
  };

  // Certificate options for English
  const ENGLISH_CERTIFICATE_OPTIONS = [
    { value: '', label: '--Select Certificate--' },
    { value: 'English Proficiency Certificate', label: 'English Proficiency Certificate' },
    { value: 'IELTS', label: 'IELTS' },
    { value: 'PTE', label: 'PTE' },
    { value: 'TOEFL iBT', label: 'TOEFL iBT' },
    { value: 'TOEFL CBT', label: 'TOEFL CBT' },
    { value: 'TOEFL PBT', label: 'TOEFL PBT' },
    { value: 'Duolingo', label: 'Duolingo' },
    { value: 'Cambridge English Test', label: 'Cambridge English Test' },
    { value: 'Language Cert International ESOL', label: 'Language Cert International ESOL' },
  ];

  // Proficiency options for each certificate
  const PROFICIENCY_OPTIONS = {
    IELTS: {
      Listening: [
        { value: '', label: 'Select Level' },
        { value: 'A0', label: 'A0 (1.0)' },
        { value: 'A1', label: 'A1 (2.0-2.5)' },
        { value: 'A2', label: 'A2 (3.0-3.5)' },
        { value: 'B1', label: 'B1 (4.0-5.0)' },
        { value: 'B2', label: 'B2 (5.5-6.5)' },
        { value: 'C1', label: 'C1 (7.0-8.0)' },
        { value: 'C2', label: 'C2 (8.5-9.0)' },
      ],
      Reading: [
        { value: '', label: 'Select Level' },
        { value: 'A0', label: 'A0 (1.0)' },
        { value: 'A1', label: 'A1 (2.0-2.5)' },
        { value: 'A2', label: 'A2 (3.0-3.5)' },
        { value: 'B1', label: 'B1 (4.0-5.0)' },
        { value: 'B2', label: 'B2 (5.5-6.5)' },
        { value: 'C1', label: 'C1 (7.0-8.0)' },
        { value: 'C2', label: 'C2 (8.5-9.0)' },
      ],
      Speaking: [
        { value: '', label: 'Select Level' },
        { value: 'A0', label: 'A0 (1.0)' },
        { value: 'A1', label: 'A1 (2.0-2.5)' },
        { value: 'A2', label: 'A2 (3.0-3.5)' },
        { value: 'B1', label: 'B1 (4.0-5.0)' },
        { value: 'B2', label: 'B2 (5.5-6.5)' },
        { value: 'C1', label: 'C1 (7.0-8.0)' },
        { value: 'C2', label: 'C2 (8.5-9.0)' },
      ],
      Writing: [
        { value: '', label: 'Select Level' },
        { value: 'A0', label: 'A0 (1.0)' },
        { value: 'A1', label: 'A1 (2.0-2.5)' },
        { value: 'A2', label: 'A2 (3.0-3.5)' },
        { value: 'B1', label: 'B1 (4.0-5.0)' },
        { value: 'B2', label: 'B2 (5.5-6.5)' },
        { value: 'C1', label: 'C1 (7.0-8.0)' },
        { value: 'C2', label: 'C2 (8.5-9.0)' },
      ],
      Overall: [
        { value: '', label: 'Select Level' },
        { value: 'A0', label: 'A0 (1.0)' },
        { value: 'A1', label: 'A1 (2.0-2.5)' },
        { value: 'A2', label: 'A2 (3.0-3.5)' },
        { value: 'B1', label: 'B1 (4.0-5.0)' },
        { value: 'B2', label: 'B2 (5.5-6.5)' },
        { value: 'C1', label: 'C1 (7.0-8.0)' },
        { value: 'C2', label: 'C2 (8.5-9.0)' },
      ],
    },
    PTE: {
      Listening: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (10-29)' },
        { value: 'A2', label: 'A2 (30-42)' },
        { value: 'B1', label: 'B1 (43-58)' },
        { value: 'B2', label: 'B2 (59-75)' },
        { value: 'C1', label: 'C1 (76-84)' },
        { value: 'C2', label: 'C2 (85-90)' },
      ],
      Reading: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (10-29)' },
        { value: 'A2', label: 'A2 (30-42)' },
        { value: 'B1', label: 'B1 (43-58)' },
        { value: 'B2', label: 'B2 (59-75)' },
        { value: 'C1', label: 'C1 (76-84)' },
        { value: 'C2', label: 'C2 (85-90)' },
      ],
      Speaking: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (10-29)' },
        { value: 'A2', label: 'A2 (30-42)' },
        { value: 'B1', label: 'B1 (43-58)' },
        { value: 'B2', label: 'B2 (59-75)' },
        { value: 'C1', label: 'C1 (76-84)' },
        { value: 'C2', label: 'C2 (85-90)' },
      ],
      Writing: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (10-29)' },
        { value: 'A2', label: 'A2 (30-42)' },
        { value: 'B1', label: 'B1 (43-58)' },
        { value: 'B2', label: 'B2 (59-75)' },
        { value: 'C1', label: 'C1 (76-84)' },
        { value: 'C2', label: 'C2 (85-90)' },
      ],
      Overall: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (10-29)' },
        { value: 'A2', label: 'A2 (30-42)' },
        { value: 'B1', label: 'B1 (43-58)' },
        { value: 'B2', label: 'B2 (59-75)' },
        { value: 'C1', label: 'C1 (76-84)' },
        { value: 'C2', label: 'C2 (85-90)' },
      ],
    },
    'TOEFL iBT': {
      Reading: [
        { value: '', label: 'Select Level' },
        { value: 'A2', label: 'A2 (0-3)' },
        { value: 'B1', label: 'B1 (4-17)' },
        { value: 'B2', label: 'B2 (18-23)' },
        { value: 'C1', label: 'C1 (24-30)' },
      ],
      Listening: [
        { value: '', label: 'Select Level' },
        { value: 'A2', label: 'A2 (0-8)' },
        { value: 'B1', label: 'B1 (9-16)' },
        { value: 'B2', label: 'B2 (17-21)' },
        { value: 'C1', label: 'C1 (22-30)' },
      ],
      Speaking: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (0-9)' },
        { value: 'A2', label: 'A2 (10-15)' },
        { value: 'B1', label: 'B1 (16-19)' },
        { value: 'B2', label: 'B2 (20-24)' },
        { value: 'C1', label: 'C1 (25-30)' },
      ],
      Writing: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (0-6)' },
        { value: 'A2', label: 'A2 (7-12)' },
        { value: 'B1', label: 'B1 (13-16)' },
        { value: 'B2', label: 'B2 (17-23)' },
        { value: 'C1', label: 'C1 (24-30)' },
      ],
      Overall: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (0-39)' },
        { value: 'A2', label: 'A2 (40-56)' },
        { value: 'B1', label: 'B1 (57-86)' },
        { value: 'B2', label: 'B2 (87-109)' },
        { value: 'C1', label: 'C1 (110-120)' },
      ],
    },
    'TOEFL CBT': {
      Listening: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (0-119)' },
        { value: 'A2', label: 'A2 (120-162)' },
        { value: 'B1', label: 'B1 (163-226)' },
        { value: 'B2', label: 'B2 (227-269)' },
        { value: 'C1', label: 'C1 (270-300)' },
      ],
      Reading: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (0-119)' },
        { value: 'A2', label: 'A2 (120-162)' },
        { value: 'B1', label: 'B1 (163-226)' },
        { value: 'B2', label: 'B2 (227-269)' },
        { value: 'C1', label: 'C1 (270-300)' },
      ],
      Speaking: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (0-119)' },
        { value: 'A2', label: 'A2 (120-162)' },
        { value: 'B1', label: 'B1 (163-226)' },
        { value: 'B2', label: 'B2 (227-269)' },
        { value: 'C1', label: 'C1 (270-300)' },
      ],
      Writing: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (0-119)' },
        { value: 'A2', label: 'A2 (120-162)' },
        { value: 'B1', label: 'B1 (163-226)' },
        { value: 'B2', label: 'B2 (227-269)' },
        { value: 'C1', label: 'C1 (270-300)' },
      ],
      Overall: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (0-119)' },
        { value: 'A2', label: 'A2 (120-162)' },
        { value: 'B1', label: 'B1 (163-226)' },
        { value: 'B2', label: 'B2 (227-269)' },
        { value: 'C1', label: 'C1 (270-300)' },
      ],
    },
    'TOEFL PBT': {
      Listening: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (310-432)' },
        { value: 'A2', label: 'A2 (433-486)' },
        { value: 'B1', label: 'B1 (487-566)' },
        { value: 'B2', label: 'B2 (567-636)' },
        { value: 'C1', label: 'C1 (637-677)' },
      ],
      Reading: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (310-432)' },
        { value: 'A2', label: 'A2 (433-486)' },
        { value: 'B1', label: 'B1 (487-566)' },
        { value: 'B2', label: 'B2 (567-636)' },
        { value: 'C1', label: 'C1 (637-677)' },
      ],
      Speaking: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (310-432)' },
        { value: 'A2', label: 'A2 (433-486)' },
        { value: 'B1', label: 'B1 (487-566)' },
        { value: 'B2', label: 'B2 (567-636)' },
        { value: 'C1', label: 'C1 (637-677)' },
      ],
      Writing: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (310-432)' },
        { value: 'A2', label: 'A2 (433-486)' },
        { value: 'B1', label: 'B1 (487-566)' },
        { value: 'B2', label: 'B2 (567-636)' },
        { value: 'C1', label: 'C1 (637-677)' },
      ],
      Overall: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (310-432)' },
        { value: 'A2', label: 'A2 (433-486)' },
        { value: 'B1', label: 'B1 (487-566)' },
        { value: 'B2', label: 'B2 (567-636)' },
        { value: 'C1', label: 'C1 (637-677)' },
      ],
    },
    Duolingo: {
      Listening: [
        { value: '', label: 'Select Level' },
        { value: 'B1', label: 'B1 (10-90)' },
        { value: 'B2', label: 'B2 (95-125)' },
        { value: 'C1', label: 'C1 (130-155)' },
        { value: 'C2', label: 'C2 (160)' },
      ],
      Reading: [
        { value: '', label: 'Select Level' },
        { value: 'B1', label: 'B1 (10-90)' },
        { value: 'B2', label: 'B2 (95-125)' },
        { value: 'C1', label: 'C1 (130-155)' },
        { value: 'C2', label: 'C2 (160)' },
      ],
      Speaking: [
        { value: '', label: 'Select Level' },
        { value: 'B1', label: 'B1 (10-90)' },
        { value: 'B2', label: 'B2 (95-125)' },
        { value: 'C1', label: 'C1 (130-155)' },
        { value: 'C2', label: 'C2 (160)' },
      ],
      Writing: [
        { value: '', label: 'Select Level' },
        { value: 'B1', label: 'B1 (10-90)' },
        { value: 'B2', label: 'B2 (95-125)' },
        { value: 'C1', label: 'C1 (130-155)' },
        { value: 'C2', label: 'C2 (160)' },
      ],
      Overall: [
        { value: '', label: 'Select Level' },
        { value: 'B1', label: 'B1 (10-90)' },
        { value: 'B2', label: 'B2 (95-125)' },
        { value: 'C1', label: 'C1 (130-155)' },
        { value: 'C2', label: 'C2 (160)' },
      ],
    },
    'Language Cert International ESOL': {
      Listening: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (A1 Preliminary)' },
        { value: 'A2', label: 'A2 (A2 Access)' },
        { value: 'B1', label: 'B1 (B1 Achiever)' },
        { value: 'B2', label: 'B2 (B2 Communicator)' },
        { value: 'C1', label: 'C1 (C1 Expert)' },
        { value: 'C2', label: 'C2 (C2 Mastery)' },
      ],
      Reading: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (A1 Preliminary)' },
        { value: 'A2', label: 'A2 (A2 Access)' },
        { value: 'B1', label: 'B1 (B1 Achiever)' },
        { value: 'B2', label: 'B2 (B2 Communicator)' },
        { value: 'C1', label: 'C1 (C1 Expert)' },
        { value: 'C2', label: 'C2 (C2 Mastery)' },
      ],
      Speaking: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (A1 Preliminary)' },
        { value: 'A2', label: 'A2 (A2 Access)' },
        { value: 'B1', label: 'B1 (B1 Achiever)' },
        { value: 'B2', label: 'B2 (B2 Communicator)' },
        { value: 'C1', label: 'C1 (C1 Expert)' },
        { value: 'C2', label: 'C2 (C2 Mastery)' },
      ],
      Writing: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (A1 Preliminary)' },
        { value: 'A2', label: 'A2 (A2 Access)' },
        { value: 'B1', label: 'B1 (B1 Achiever)' },
        { value: 'B2', label: 'B2 (B2 Communicator)' },
        { value: 'C1', label: 'C1 (C1 Expert)' },
        { value: 'C2', label: 'C2 (C2 Mastery)' },
      ],
      Overall: [
        { value: '', label: 'Select Level' },
        { value: 'A1', label: 'A1 (A1 Preliminary)' },
        { value: 'A2', label: 'A2 (A2 Access)' },
        { value: 'B1', label: 'B1 (B1 Achiever)' },
        { value: 'B2', label: 'B2 (B2 Communicator)' },
        { value: 'C1', label: 'C1 (C1 Expert)' },
        { value: 'C2', label: 'C2 (C2 Mastery)' },
      ],
    },
  };

  // Helper to render proficiency fields
  function ProficiencyFields({ certType, proficiency, onChange }) {
    if (!PROFICIENCY_OPTIONS[certType]) return null;
    const fields = Object.keys(PROFICIENCY_OPTIONS[certType]);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 bg-gray-50 p-4 rounded border">
        {fields.map((field) => (
          <div key={field} className="mb-3">
            <label className="font-semibold block mb-1 text-teal-700">
              {certType} - {field}
            </label>
            <select
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-teal-400"
              value={proficiency?.[field] || ''}
              onChange={e => onChange(field, e.target.value)}
            >
              {PROFICIENCY_OPTIONS[certType][field].map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {(showTemplate || studentId) && !editLimitReached && (
        <button
          className="fixed top-8 left-8 bg-blue-700 text-white px-4 py-2 rounded z-50"
          onClick={() => setShowTemplate((prev) => !prev)}
        >
          {showTemplate ? 'Hide CV' : 'Show CV'}
        </button>
      )}
      {editLimitReached && (
        <div className="fixed top-8 left-8 bg-red-600 text-white px-4 py-2 rounded z-50">
          Edit limit reached. You cannot edit this CV anymore.
        </div>
      )}
      {showTemplate ? (
        <CvTemplate
          personalInfo={personalInfo}
          addressDetails={addressDetails}
          educations={educations}
          experiences={experiences}
          skills={skills}
          languages={languages}
          drivingLicenses={drivingLicenses}
          hobbies={hobbies}
          awards={awards}
          projects={projects}
        />
      ) : (
        !editLimitReached && <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-teal-600 text-white py-2 px-12 rounded-lg inline-block mb-4">
              <h1 className="text-xl font-bold">Add New Your Information</h1>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
           <div className="mb-12 text-center"> <Heading level={4} className="text-lg font-semibold text-center">Personal Information</Heading></div>
            {/* Profile Image */}
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="relative">
                {personalInfo.profileImage ? (
                  <img
                    src={personalInfo.profileImage}
                    alt="Profile"
                    className="w-[150px] h-[150px] rounded-full object-cover border-4 border-teal-200"
                  />
                ) : (
                  <div className="w-[150px] h-[150px] rounded-full bg-gray-200 border-[1px] border-black flex items-center justify-center text-4xl text-gray-400">
                    <CgProfile className='w-[150px] h-[150px] rounded-full' />
                  </div>
                )}
                <label htmlFor="profile-upload" className="absolute bottom-24  -right-4 bg-teal-600 text-white p-1 rounded-full cursor-pointer hover:bg-teal-700">
                  <span className="text-xs"><PencilIcon/></span>
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
            {/* Personal Info Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="font-semibold">Full Name *</label>
                <Input
                  id="fullName"
                  value={personalInfo.fullName}
                  onChange={e => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="email" className="font-semibold">Email *</label>
                <Input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="font-semibold">Phone Number *</label>
                <Input
                  id="phoneNumber"
                  value={personalInfo.phoneNumber}
                  onChange={e => setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="gender" className="font-semibold">Gender *</label>
                <select
                  id="gender"
                  value={personalInfo.gender}
                  onChange={e => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 rounded-[30px] bg-[#E7F1F2] text-sm placeholder-gray-500 focus:outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="font-semibold">Date of Birth *</label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={personalInfo.dateOfBirth}
                  onChange={e => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="nationality" className="font-semibold">Nationality *</label>
                <Input
                  id="nationality"
                  value={personalInfo.nationality}
                  onChange={e => setPersonalInfo({ ...personalInfo, nationality: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="aboutYourself" className="font-semibold">About Yourself (Optional)</label>
              <textarea
                id="aboutYourself"
                value={personalInfo.aboutYourself}
                onChange={e => setPersonalInfo({ ...personalInfo, aboutYourself: e.target.value })}
                rows={4}
                className="w-full border-2 border-[#E7F1F2] rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Address Details Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="mb-12 text-center"> <Heading level={4} className="text-lg font-semibold text-center">Address Details</Heading></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="font-semibold">City *</label>
                <Input
                  id="city"
                  value={addressDetails.city}
                  onChange={e => setAddressDetails({ ...addressDetails, city: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="country" className="font-semibold">Country *</label>
                <Input
                  id="country"
                  value={addressDetails.country}
                  onChange={e => setAddressDetails({ ...addressDetails, country: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="font-semibold">Postal Code (Optional)</label>
                <Input
                  id="postalCode"
                  value={addressDetails.postalCode}
                  onChange={e => setAddressDetails({ ...addressDetails, postalCode: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="address" className="font-semibold">Address</label>
                <Input
                  id="address"
                  value={addressDetails.address}
                  onChange={e => setAddressDetails({ ...addressDetails, address: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Education Details Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="mb-12 text-center"> <Heading level={4} className="text-lg font-semibold text-center">Education Details</Heading></div>
            {educations.map((education, index) => (
              <div key={education.id} className="border-l-4 border-teal-500 pl-4 space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Education {index + 1}</h3>
                  {educations.length > 1 && (
                    <button
                      type="button"
                      className="text-white bg-red-500 cursor-pointer w-[80px] px-2 py-1 rounded"
                      onClick={() => removeEducation(education.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold">Degree Name</label>
                    <Input
                      value={education.degreeName}
                      onChange={e => updateEducation(education.id, 'degreeName', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Institute Name</label>
                    <Input
                      value={education.instituteName}
                      onChange={e => updateEducation(education.id, 'instituteName', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">City</label>
                    <Input
                      value={education.city}
                      onChange={e => updateEducation(education.id, 'city', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Country</label>
                    <Input
                      value={education.country}
                      onChange={e => updateEducation(education.id, 'country', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Total Marks</label>
                    <Input
                      value={education.totalMarks}
                      onChange={e => updateEducation(education.id, 'totalMarks', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Obtained Marks</label>
                    <Input
                      value={education.obtainedMarks}
                      onChange={e => updateEducation(education.id, 'obtainedMarks', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Start Date</label>
                    <Input
                      type="date"
                      value={education.startDate}
                      onChange={e => updateEducation(education.id, 'startDate', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">End Date</label>
                    <Input
                      type="date"
                      value={education.endDate}
                      onChange={e => updateEducation(education.id, 'endDate', e.target.value)}
                      disabled={education.currentlyStudying}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Institute Link</label>
                    <Input
                      value={education.instituteLink}
                      onChange={e => updateEducation(education.id, 'instituteLink', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-6 cursor-pointer">
                    <div onClick={() => updateEducation(education.id, 'currentlyStudying', !education.currentlyStudying)}>
                      {education.currentlyStudying ? (
                        <FaToggleOn className="text-blue-600 text-2xl" />
                      ) : (
                        <FaToggleOff className="text-gray-400 text-2xl" />
                      )}
                    </div>
                    <label className="font-semibold">Currently Studying</label>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addEducation}
              className="w-[25%] cursor-pointer px-4 py-2 border border-blue-400 rounded bg-[var(--brand-color)]  text-white font-semibold"
            >
              Add More Education
            </button>
          </div>

          {/* Experience Details Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="mb-12 text-center"> <Heading level={4} className="text-lg font-semibold text-center">Experience Details</Heading></div>
            {experiences.map((experience, index) => (
              <div key={experience.id} className="border-l-4 border-teal-500 pl-4 space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Experience {index + 1}</h3>
                  {experiences.length > 1 && (
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
                      onClick={() => removeExperience(experience.id)}
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold">Position</label>
                    <Input
                      value={experience.position}
                      onChange={e => updateExperience(experience.id, 'position', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Employer</label>
                    <Input
                      value={experience.employer}
                      onChange={e => updateExperience(experience.id, 'employer', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">City</label>
                    <Input
                      value={experience.city}
                      onChange={e => updateExperience(experience.id, 'city', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Country</label>
                    <Input
                      value={experience.country}
                      onChange={e => updateExperience(experience.id, 'country', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Start Date</label>
                    <Input
                      type="date"
                      value={experience.startDate}
                      onChange={e => updateExperience(experience.id, 'startDate', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">End Date</label>
                    <Input
                      type="date"
                      value={experience.endDate}
                      onChange={e => updateExperience(experience.id, 'endDate', e.target.value)}
                      disabled={experience.currentlyWorking}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-6 cursor-pointer">
                    <div onClick={() => updateExperience(experience.id, 'currentlyWorking', !experience.currentlyWorking)}>
                      {experience.currentlyWorking ? (
                        <FaToggleOn className="text-blue-600  text-2xl" />
                      ) : (
                        <FaToggleOff className="text-gray-400 text-2xl" />
                      )}
                    </div>
                    <label className="font-semibold">Currently Working</label>
                  </div>
                </div>
                <div>
                  <label className="font-semibold">Details</label>
                  <textarea
                    value={experience.details}
                    onChange={e => updateExperience(experience.id, 'details', e.target.value)}
                    rows={3}
                    className="w-full border-2 border-[#E7F1F2] rounded px-3 py-2"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addExperience}
              className="w-[25%] cursor-pointer px-4 py-2 border border-blue-400 rounded bg-[var(--brand-color)] text-white font-semibold"
            >
              Add More Experience
            </button>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="mb-12 text-center"> <Heading level={4} className="text-lg font-semibold text-center">Add Skills</Heading></div>
            {skills.map((skill, index) => (
              <div key={skill.id} className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <label className="font-semibold">Skill Name</label>
                  <Input
                    value={skill.name}
                    onChange={e => updateSkill(skill.id, 'name', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="flex-1">
                  <label className="font-semibold">Skill Level</label>
                  <select
                    value={skill.level}
                    onChange={e => updateSkill(skill.id, 'level', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-[30px] bg-[#E7F1F2] text-sm placeholder-gray-500 focus:outline-none"
                  >
                    <option value="">Select Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                {skills.length > 1 && (
                  <button
                    type="button"
                    className="text-white bg-red-500 cursor-pointer w-[80px] px-2 py-1 rounded"
                    onClick={() => removeSkill(skill.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSkill}
              className="w-[25%] cursor-pointer  px-4 py-2 border border-blue-400 rounded bg-[var(--brand-color)] text-white font-semibold"
            >
              Add More Skills
            </button>
          </div>
          {/* Languages Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="mb-12 text-center"> <Heading level={4} className="text-lg font-semibold text-center">Add Languages</Heading></div>
            {languages.map((language, index) => {
              const showProficiency = language.language === 'English' && PROFICIENCY_OPTIONS[language.certificate];
              return (
                <div key={language.id} className="mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="font-semibold">Language</label>
                      <Input
                        value={language.language}
                        onChange={e => updateLanguage(language.id, 'language', e.target.value)}
                        readOnly={index < 2}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="font-semibold">{language.language === 'English' ? 'English Certificate' : 'Certificate'}</label>
                      {language.language === 'English' ? (
                        <select
                          className="w-full pl-12 pr-4 py-4 rounded-[30px] bg-[#E7F1F2] text-sm placeholder-gray-500 focus:outline-none"
                          value={language.certificate || ''}
                          onChange={e => {
                            updateLanguage(language.id, 'certificate', e.target.value);
                            // Reset proficiency if certificate changes
                            updateLanguage(language.id, 'proficiency', {});
                          }}
                        >
                          {ENGLISH_CERTIFICATE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          value={language.certificate}
                          onChange={e => updateLanguage(language.id, 'certificate', e.target.value)}
                          className="w-full border rounded px-3 py-2"
                        />
                      )}
                    </div>
                    {languages.length > 2 && index >= 2 && (
                      <button
                        type="button"
                        className="text-white bg-red-500 cursor-pointer w-[80px] px-2 py-1 rounded"
                        onClick={() => removeLanguage(language.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  {/* Proficiency fields for English certificate types, shown below the row */}
                  {showProficiency && (
                    <div className="mt-2">
                      <ProficiencyFields
                        certType={language.certificate}
                        proficiency={language.proficiency || {}}
                        onChange={(field, value) => updateLanguage(language.id, 'proficiency', { [field]: value })}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              onClick={addLanguage}
              className="w-[25%] cursor-pointer px-4 py-2 border border-blue-400 rounded bg-[var(--brand-color)] text-white font-semibold"
            >
              Add More Languages
            </button>
          </div>

          {/* Driving License Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="mb-12 text-center"> <Heading level={4} className="text-lg font-semibold text-center">Add Driving License</Heading></div>
            {drivingLicenses.map((license, index) => (
              <div key={license.id} className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <label className="font-semibold">License Type</label>
                  <select
                    value={license.licenseType}
                    onChange={e => updateDrivingLicense(license.id, e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-[30px] bg-[#E7F1F2] text-sm placeholder-gray-500 focus:outline-none"
                  >
                    <option value="">Select License Type</option>
                    <option value="car">Car License</option>
                    <option value="motorcycle">Motorcycle License</option>
                    <option value="truck">Truck License</option>
                    <option value="bus">Bus License</option>
                  </select>
                </div>
                {drivingLicenses.length > 1 && (
                  <button
                    type="button"
                    className="text-white bg-red-500 cursor-pointer w-[80px] px-2 py-1 rounded"
                    onClick={() => removeDrivingLicense(license.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addDrivingLicense}
              className="w-[25%] cursor-pointer px-4 py-2 border border-blue-400 rounded bg-[var(--brand-color)] text-white font-semibold"
            >
              Add More Licenses
            </button>
          </div>

          {/* Hobbies Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="mb-12 text-center"> <Heading level={4} className="text-lg font-semibold text-center">Add Hobbies and Interest</Heading></div>
            {hobbies.map((hobby, index) => (
              <div key={index} className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <label className="font-semibold">Enter Hobby</label>
                  <Input
                    value={hobby}
                    onChange={e => updateHobby(index, e.target.value)}
                    placeholder="Enter your hobby"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                {hobbies.length > 1 && (
                  <button
                    type="button"
                    className="text-white bg-red-500 cursor-pointer w-[80px] px-2 py-1 rounded"
                    onClick={() => removeHobby(index)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addHobby}
              className="w-[25%] cursor-pointer px-4 py-2 border border-blue-400 rounded bg-[var(--brand-color)] text-white font-semibold"
            >
              Add More Hobbies
            </button>
          </div>

          {/* Honours and Awards Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="mb-12 text-center"> <Heading level={4} className="text-lg font-semibold text-center">Honours and Awards</Heading></div>
            {awards.map((award, index) => (
              <div key={award.id} className="border-l-4 border-teal-500 pl-4 space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Award {index + 1}</h3>
                  {awards.length > 1 && (
                    <button
                      type="button"
                      className="text-white bg-red-500 cursor-pointer w-[80px] px-2 py-1 rounded"
                      onClick={() => removeAward(award.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold">Award Title</label>
                    <Input
                      value={award.title}
                      onChange={e => updateAward(award.id, 'title', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Award Date</label>
                    <Input
                      type="date"
                      value={award.awardDate}
                      onChange={e => updateAward(award.id, 'awardDate', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Institution Name</label>
                    <Input
                      value={award.institutionName}
                      onChange={e => updateAward(award.id, 'institutionName', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold">Details</label>
                  <textarea
                    value={award.details}
                    onChange={e => updateAward(award.id, 'details', e.target.value)}
                    rows={3}
                    className="w-full border-2 border-[#E7F1F2] rounded px-3 py-2"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addAward}
              className="w-[25%] cursor-pointer px-4 py-2 border border-blue-400 rounded bg-[var(--brand-color)] text-white font-semibold"
            >
              Add More Awards
            </button>
          </div>

          {/* Projects Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="mb-12 text-center"> <Heading level={4} className="text-lg font-semibold text-center">Projects</Heading></div>
            {projects.map((project, index) => (
              <div key={project.id} className="border-l-4 border-teal-500 pl-4 space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Project {index + 1}</h3>
                  {projects.length > 1 && (
                    <button
                      type="button"
                      className="text-white w-[80px] bg-red-500 cursor-pointer  px-2 py-1 rounded"
                      onClick={() => removeProject(project.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold">Title (optional)</label>
                    <Input
                      value={project.title}
                      onChange={e => updateProject(project.id, 'title', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Start Date (optional)</label>
                    <Input
                      type="date"
                      value={project.startDate}
                      onChange={e => updateProject(project.id, 'startDate', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">End Date (optional)</label>
                    <Input
                      type="date"
                      value={project.endDate}
                      onChange={e => updateProject(project.id, 'endDate', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold">Detail (optional)</label>
                  <textarea
                    value={project.detail}
                    onChange={e => updateProject(project.id, 'detail', e.target.value)}
                    rows={3}
                    className="w-full border-2 border-[#E7F1F2] rounded px-3 py-2"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addProject}
              className="w-[25%] cursor-pointer px-4 py-2 border border-blue-400 rounded bg-[var(--brand-color)] text-white font-semibold"
            >
              Add More Projects
            </button>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="button"
              className="bg-[var(--brand-color)] px-12 py-3 text-lg text-white rounded-lg font-semibold"
              onClick={handleSaveResume}
            >
              {(showTemplate || submitStatus === 'success') ? 'Update Resume' : 'Save Resume'}
            </button>
            {submitStatus === 'success' && (
              <div className="text-green-600 mt-4 font-semibold">Resume saved successfully!</div>
            )}
            {submitStatus === 'error' && (
              <div className="text-red-600 mt-4 font-semibold">Failed to save resume. Please try again.</div>
            )}
          </div>
        </div>
      )}
      {cropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-[90vw] max-w-md">
            <div className="w-full h-64 relative bg-gray-100">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex items-center gap-4 mt-4">
              <label className="font-semibold">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={handleCropCancel} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
              <button onClick={handleCropSave} className="px-4 py-2 rounded bg-teal-600 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}