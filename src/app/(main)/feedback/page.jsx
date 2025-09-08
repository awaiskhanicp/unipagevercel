"use client";
import { useState } from "react";
import Swal from "sweetalert2";

export default function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [experience, setExperience] = useState({});
  const [recommend, setRecommend] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [consultantId, setConsultantId] = useState(1); // Default or select if needed

  const stars = [1, 2, 3, 4, 5];
  const questions = [
    "Behaviour",
    "Timely Response",
    "Call pickup response",
    "Knowledge",
    "Problem Solving",
    "Professionalism",
  ];
  const experienceOptions = [
    "Very Satisfied",
    "Satisfied",
    "Neutral",
    "Dissatisfied",
    "Very Dissatisfied",
  ];
  const recommendOptions = [
    "Very Likely",
    "Likely",
    "Neutral",
    "Unlikely",
    "Very Unlikely",
  ];

  const handleExperienceChange = (question, value) => {
    setExperience((prev) => ({ ...prev, [question]: value }));
  };

  function getExperienceValue(question, satisfiedValue, neutralValue, dissatisfiedValue, verySatisfiedValue, veryDissatisfiedValue) {
    // Map experience options to numbers for DB
    const value = experience[question];
    switch (value) {
      case "Very Satisfied": return 5;
      case "Satisfied": return 4;
      case "Neutral": return 3;
      case "Dissatisfied": return 2;
      case "Very Dissatisfied": return 1;
      default: return 0;
    }
  }

  function getRecommendValue() {
    switch (recommend) {
      case "Very Likely": return 5;
      case "Likely": return 4;
      case "Neutral": return 3;
      case "Unlikely": return 2;
      case "Very Unlikely": return 1;
      default: return 0;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaChecked) {
      Swal.fire({ icon: "warning", title: "Please verify the reCAPTCHA" });
      return;
    }
    if (!fullName || !contactNumber) {
      Swal.fire({ icon: "warning", title: "Please fill in your name and contact number" });
      return;
    }
    // Validate all experience questions
    for (const q of questions) {
      if (!experience[q]) {
        Swal.fire(`{ icon: "warning", title: Please answer: ${q} }`);
        return;
      }
    }
    if (!recommend) {
      Swal.fire({ icon: "warning", title: "Please select a recommendation option" });
      return;
    }
    // Map experience fields to DB columns
    const formData = {
      full_name: fullName,
      contact_number: contactNumber,
      consultant_id: Number(consultantId),
      rating: Number(rating),
      average_rating: Number(rating), // or calculate average if needed
      behaviour_satis_level: Number(getExperienceValue("Behaviour")),
      timely_response: Number(getExperienceValue("Timely Response")),
      call_response: Number(getExperienceValue("Call pickup response")),
      knowledge: Number(getExperienceValue("Knowledge")),
      likelihood: Number(getRecommendValue()),
      customer_experience: Number(getExperienceValue("Professionalism")),
      suggestion,
    };
    try {
      const res = await fetch("/api/internal/client-feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.ok) {
        Swal.fire({ icon: "success", title: "Thank you!", text: "Your feedback has been submitted." });
        // Optionally reset form
        setRating(0);
        setExperience({});
        setRecommend("");
        setSuggestion("");
        setFullName("");
        setContactNumber("");
        setCaptchaChecked(false);
      } else {
        Swal.fire({ icon: "error", title: "Error", text: result.message || "Failed to submit feedback." });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to submit feedback." });
    }
  };

  return (
   <div className="my-[100px]">
        <div className="min-h-screen  flex justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-8 max-w-4xl w-full"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">
          Client Satisfaction Survey
        </h2>

        {/* Top inputs */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Enter Your Full Name"
            className="border rounded-md p-2 w-full"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Your Contact Number"
            className="border rounded-md p-2 w-full"
            value={contactNumber}
            onChange={e => setContactNumber(e.target.value)}
          />
          <select className="border rounded-md p-2 w-full" value={consultantId} onChange={e => setConsultantId(e.target.value)}>
            <option value={1}>Branch 1</option>
            <option value={2}>Branch 2</option>
          </select>
        </div>

        {/* Star Rating */}
        <div className="text-center mb-6">
          <p className="mb-2 font-medium">
            How would you rate your overall satisfaction with our Counselor?
          </p>
          <div className="flex justify-center space-x-2">
            {stars.map((s) => (
              <span
                key={s}
                onClick={() => setRating(s)}
                className={`cursor-pointer text-3xl transition-colors ${
                  rating >= s ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Styled Experience Table */}
        <p className="mb-2 text-center font-semibold text-gray-800">
          How was your experience with our Counselor?
        </p>
        <div className="overflow-x-auto mb-6 bg-white rounded-2xl shadow-md">
          <table className="min-w-full text-sm border border-gray-200 rounded-2xl overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">
                  Question
                </th>
                {experienceOptions.map((opt) => (
                  <th
                    key={opt}
                    className="py-3 px-4 text-center font-semibold text-gray-600"
                  >
                    {opt}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {questions.map((q, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="py-3 px-4 text-gray-800 font-medium">{q}</td>
                  {experienceOptions.map((opt) => (
                    <td key={opt} className="py-3 px-4 text-center">
                      <input
                        type="radio"
                        name={q + i}
                        value={opt}
                        checked={experience[q] === opt}
                        onChange={() => handleExperienceChange(q, opt)}
                        className="w-4 h-4 accent-teal-600"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recommendation */}
        <p className="mb-2 text-center font-medium">
          How likely are you to recommend our service to a friend or colleague?
        </p>
        <div className="flex justify-center flex-wrap gap-2 mb-6">
          {recommendOptions.map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => setRecommend(opt)}
              className={`px-4 py-1 rounded-full border transition-colors ${
                recommend === opt
                  ? "bg-teal-700 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Suggestions */}
        <p className="mb-2 text-center font-medium">
          Do you have any suggestions for how we can improve our customer
          experience?
        </p>
        <textarea
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          className="border rounded-md p-2 w-full mb-4"
          rows="4"
        ></textarea>

        {/* Styled Mock reCAPTCHA */}
        <div
          onClick={() => setCaptchaChecked(!captchaChecked)}
          className="border rounded-md p-3 flex items-center justify-between bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer select-none mb-4"
          style={{ maxWidth: "300px" }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-5 h-5 flex items-center justify-center border rounded-sm ${
                captchaChecked
                  ? "bg-green-500 border-green-500"
                  : "border-gray-400"
              }`}
            >
              {captchaChecked && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span className="text-gray-700 text-sm font-sans">
              I’m not a robot
            </span>
          </div>
          <img
            src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
            alt="reCAPTCHA"
            className="w-8 h-8"
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2 rounded-md"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
   </div>
  );
}