"use client";

import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const SubjectAdded = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Subject Added Successfully!</h1>
        <p className="text-gray-600 mb-6">Your new subject has been added to the list.</p>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push("/course/subjects")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow"
          >
            Go to Subject List
          </button>
          <button
            onClick={() => router.push("/course/subjects/add")}
            className="px-6 py-3 border border-indigo-600 text-indigo-700 rounded-xl hover:bg-indigo-50 transition-colors font-semibold"
          >
            Add Another Subject
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectAdded;
