'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Layout from '../../../components/Layout';
import AddArticle from '../../../pages/Articles/AddArticle';

export default function EditArticle({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogData, setBlogData] = useState(null);

  // Properly unwrap the params promise
  const { id } = use(params);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (!id || isNaN(parseInt(id))) {
          throw new Error('Invalid blog ID');
        }

        const response = await fetch(`/api/internal/blogs/${id}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            throw new Error(errorText || 'Failed to fetch blog');
          }
          throw new Error(errorData.message || 'Failed to fetch blog');
        }

        const result = await response.json();
        
        if (!result?.success || !result?.data) {
          throw new Error(result?.message || 'Blog not found');
        }

        if (isMounted) {
          setBlogData(transformBlogData(result.data));
          setError(null);
        }
      } catch (err) {
        console.error('Error loading blog:', err);
        if (isMounted) {
          setError(err.message);
          setBlogData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const transformBlogData = (data) => {
    try {
      return {
        ...data,
        enable_meta_tags: data.enable_meta_tags || false,
        meta_title: data.seo?.meta_title || '',
        meta_description: data.seo?.meta_description || '',
        meta_keywords: data.seo?.meta_keywords || '',
        sm_question: Array.isArray(data.sm_question) ? data.sm_question : [''],
        sm_answer: Array.isArray(data.sm_answer) ? data.sm_answer : [''],
        review_detail: Array.isArray(data.review_detail) && data.review_detail.length > 0 
          ? data.review_detail 
          : [{
              rating: 5,
              date: '',
              authorName: '',
              publisherName: '',
              reviewName: '',
              reviewDescription: ''
            }]
      };
    } catch (error) {
      console.error('Error transforming blog data:', error);
      throw new Error('Invalid blog data format');
    }
  };

  const handleBackToList = () => {
    router.push('/admin/articles/list');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          <span className="ml-2">Loading article data...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={handleBackToList}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Back to Articles List
          </button>
        </div>
      </Layout>
    );
  }

  if (!blogData) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-red-500 text-lg">Article data could not be loaded</p>
          <button
            onClick={handleBackToList}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Back to Articles List
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AddArticle 
        id={id} 
        isEditMode={true} 
        initialData={blogData}
        onSuccess={handleBackToList}
      />
    </Layout>
  );
}