
'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blogs'); 
      const data = await res.json();
      if (data && data.data) {
        setArticles(data.data);
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/blogs/${id}`, { 
        method: 'DELETE' 
      });
      if (res.ok) {
        setArticles(prev => prev.filter(article => article.id !== id));
        alert('Article deleted successfully');
      } else {
        alert('Failed to delete article.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting article');
    }
  };

  const togglePopularStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enable_meta_tags: !currentStatus
        }),
      });

      if (res.ok) {
        setArticles(prev => prev.map(article => 
          article.id === id 
            ? { ...article, enable_meta_tags: !currentStatus } 
            : article
        ));
      } else {
        alert('Failed to update popular status');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Error updating popular status');
    }
  };

  const handleEdit = (id) => {
    router.push(`/admin/articles/edit/${id}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Article List happy</h1>

      <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Image</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Title</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Author</th>
               <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Popular</th>
              <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Active</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Created At</th>
              <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500 text-lg">
                  Loading...
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500 text-lg">
                  No articles found.
                </td>
              </tr>
            ) : (
              articles.map((article) => {
                let imageUrl = null;
                if (article.image) {
                  if (article.image.startsWith('/')) {
                    imageUrl = `${API_BASE_URL}${article.image}`;
                  } else if (article.image.startsWith('http')) {
                    imageUrl = article.image;
                  }
                }

                return (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={article.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">{article.title}</td>
                    <td className="py-3 px-4 text-gray-600">{article.user?.email || '-'}</td>
                     <td className="py-3 px-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={article.enable_meta_tags || false}
                          onChange={() => togglePopularStatus(article.id, article.enable_meta_tags)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {article.enable_meta_tags ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={article.is_featured ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                        {article.is_featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {article.created_at
                        ? new Date(article.created_at).toLocaleString()
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-center flex gap-2 justify-center">
                      <button 
                        className="p-2 rounded-full hover:bg-gray-100" 
                        title="Edit"
                        onClick={() => handleEdit(article.id)}
                      >
                        <Pencil className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        className="p-2 rounded-full hover:bg-gray-100"
                        title="Delete"
                        onClick={() => handleDelete(article.id)}
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArticleList;