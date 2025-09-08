"use client";
import Link from "next/link";
import React from "react";

export default function TermsAndConditionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <Link href="/">Home</Link> <span className="mx-2">/</span> Terms & Conditions
        </div>

        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Terms & Conditions
        </h1>

        {/* Service Providers */}
        <p className="text-gray-700 mb-4">
          To facilitate our Service;
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
          <li>To provide the Service on our behalf;</li>
          <li>To perform Service-related services; or</li>
          <li>To assist us in analyzing how our Service is used.</li>
        </ul>
        <p className="text-gray-700 mb-6">
          We want to inform users of this Service that these third parties have access to their Personal Information.
          The reason is to perform the tasks assigned to them on our behalf.
          However, they are obligated not to disclose or use the information for any other purpose.
        </p>

        {/* Security */}
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Security</h2>
        <p className="text-gray-700 mb-6">
          We value your trust in providing us with your Personal Information, thus we are striving to use commercially
          acceptable means of protecting it. But remember that no method of transmission over the internet, or method
          of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
        </p>

        {/* Links */}
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Links To Other Sites</h2>
        <p className="text-gray-700 mb-6">
          This Service may contain links to other sites. If you click on a third-party link, you will be directed to
          that site. Note that these external sites are not operated by us. Therefore, we strongly advise you to review
          the Privacy Policy of these websites. We have no control over and assume no responsibility for the content,
          privacy policies, or practices of any third-party sites or services.
        </p>

        {/* Children's Privacy */}
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Children’s Privacy</h2>
        <p className="text-gray-700 mb-6">
          These Services do not address anyone under the age of 18. We do not knowingly collect personally identifiable
          information from children under 18 years of age. In the case we discover that a child under 18 has provided us
          with personal information, we immediately delete this from our servers. If you are a parent or guardian and
          you are aware that your child has provided us with personal information, please contact us so that we will be
          able to do the necessary actions.
        </p>

        {/* Changes */}
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Changes To This Privacy Policy</h2>
        <p className="text-gray-700 mb-6">
          We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically
          for any changes. We will notify you of any changes by posting the new Privacy Policy on this page.
          <br />
          This policy is effective as of <strong>2022-06-28</strong>.
        </p>

        {/* Contact */}
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Contact Us</h2>
        <p className="text-gray-700">
          If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at{" "}
          <a href="mailto:info@universitiespage.com" className="text-teal-600 hover:underline">
            info@universitiespage.com
          </a>.
        </p>
      </div>
    </div>
  );
}