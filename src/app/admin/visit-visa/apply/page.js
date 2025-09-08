'use client';

import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';

const ApplyVisitVisaPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/internal/visit-visas');
        const result = await res.json();

        if (result.success && Array.isArray(result.data)) {
          setApplications(result.data);
        } else {
          console.error('Invalid data format:', result);
          setApplications([]);
         
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Apply Visit Visa Applications</h1>
        {loading ? (
          <p>Loading applications...</p>
        ) : applications.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">#</th>
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Passport No</th>
                  <th className="py-2 px-4 border-b">Country</th>
                  <th className="py-2 px-4 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, idx) => (
                  <tr key={app.id} className="text-center hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">{idx + 1}</td>
                    <td className="py-2 px-4 border-b">{app.name}</td>
                    <td className="py-2 px-4 border-b">{app.passport_number || '-'}</td>
                    <td className="py-2 px-4 border-b">{app.country || app.homeCountry || '-'}</td>
                    <td className="py-2 px-4 border-b">{app.choosable_status || 'Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ApplyVisitVisaPage;
