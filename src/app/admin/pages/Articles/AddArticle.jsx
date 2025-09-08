'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2, Star, Loader2, ChevronLeft, ChevronRight, Save } from 'lucide-react';

const SummernoteEditor = dynamic(
  () => import('../../../components/organisms/SummernoteEditor'),
  { 
    ssr: false,
    loading: () => <div className="border rounded-md p-4">Loading editor...</div>
  }
);

const tabs = [
  'BASIC INFO',
  'CONTENT',
  'META TAGS',
  'SCHEMA',
  'REVIEWS',
  'SETTINGS'
];

const initialForm = {
  title: '',
  slug: '',
  category_id: '',
  short_description: '',
  views: 0,
  sort_order: 1,
  description: '',
  image: '',
  image_ext: '',
  is_featured: false,
  is_active: true,
  sm_question: JSON.stringify(['']),
  sm_answer: JSON.stringify(['']),
  review_detail: JSON.stringify([{ 
    rating: 5, 
    date: '', 
    authorName: '', 
    publisherName: '', 
    reviewName: '', 
    reviewDescription: '' 
  }]),
  rating_count: 0,
  review_count: 0,
  avg_review_value: 0,
  seo: '{}',
  likes: 0,
  custom_post_type: 'blog',
  post_attributes: '{}',
  enable_meta_tags: false,
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
};

export default function AddArticle({ id, isEditMode = false }) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('BASIC INFO');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Debug form initialization
  console.log('🔍 Frontend: Component initialized with form:', form);
  console.log('🔍 Frontend: Initial form description:', form.description);
  console.log('🔍 Frontend: Initial form keys:', Object.keys(form));

  useEffect(() => {
    loadCategories();
    if (isEditMode && id) {
      loadArticle();
    }
  }, [id, isEditMode]);

  // Helper function to safely get string values
  const safeString = (value) => {
    return value !== null && value !== undefined ? String(value) : '';
  };

  // Helper function to safely get boolean values
  const safeBool = (value) => {
    return Boolean(value);
  };

  // Helper function to safely get number values
  const safeNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const loadArticle = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/internal/blogs/${id}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch article');
      }

      const data = await res.json();
      
      if (!data?.success || !data?.data) {
        throw new Error(data?.message || 'Article not found');
      }

      const article = data.data;
      
      const parseJsonField = (field, defaultValue) => {
        try {
          return field ? JSON.parse(field) : defaultValue;
        } catch {
          return defaultValue;
        }
      };

      const seoData = parseJsonField(article.seo, {});
      const smQuestion = parseJsonField(article.sm_question, ['']);
      const smAnswer = parseJsonField(article.sm_answer, ['']);
      const reviewDetail = parseJsonField(article.review_detail, [{
        rating: 5,
        date: '',
        authorName: '',
        publisherName: '',
        reviewName: '',
        reviewDescription: ''
      }]);

      // Safely set form data with proper type conversions
      setForm({
        title: safeString(article.title),
        slug: safeString(article.slug),
        category_id: safeString(article.category_id),
        short_description: safeString(article.short_description),
        views: safeNumber(article.views),
        sort_order: safeNumber(article.sort_order),
        description: safeString(article.description),
        image: safeString(article.image),
        image_ext: safeString(article.image_ext),
        is_featured: safeBool(article.is_featured),
        is_active: safeBool(article.is_active),
        sm_question: JSON.stringify(smQuestion),
        sm_answer: JSON.stringify(smAnswer),
        review_detail: JSON.stringify(reviewDetail),
        rating_count: safeNumber(article.rating_count),
        review_count: safeNumber(article.review_count),
        avg_review_value: safeNumber(article.avg_review_value),
        seo: safeString(article.seo || '{}'),
        likes: safeNumber(article.likes),
        custom_post_type: safeString(article.custom_post_type || 'blog'),
        post_attributes: safeString(article.post_attributes || '{}'),
        enable_meta_tags: safeBool(article.enable_meta_tags),
        meta_title: safeString(seoData.meta_title || article.meta_title),
        meta_description: safeString(seoData.meta_description || article.meta_description),
        meta_keywords: safeString(seoData.meta_keywords || article.meta_keywords),
      });
    } catch (error) {
      console.error('Error loading article:', error);
      toast.error(error.message || 'Failed to load article');
      router.push('/admin/articles/list');
    } finally {
      setLoading(false);
    }
  };
  
  const loadCategories = async () => {
    try {
      const res = await fetch('/api/internal/blog-categories');
      const data = await res.json();
      
      if (data.success) {
        setCategories(data.data);
        if (!isEditMode && !form.category_id && data.data.length > 0) {
          setForm(prev => ({ ...prev, category_id: String(data.data[0].id) }));
        }
      } else {
        toast.error(data.message || 'Failed to load categories');
      }
    } catch (error) {
      toast.error('Failed to load categories');
      console.error('Error loading categories:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/internal/blog-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory,
          slug: generateSlug(newCategory),
          is_active: true,
          sort_order: categories.length + 1,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success('Category added successfully');
        setNewCategory('');
        await loadCategories();
        setForm(prev => ({ ...prev, category_id: String(data.data.id) }));
      } else {
        toast.error(data.message || 'Failed to add category');
      }
    } catch (error) {
      toast.error('Failed to add category');
      console.error('Error adding category:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSchemaRow = () => {
    const questions = JSON.parse(form.sm_question);
    const answers = JSON.parse(form.sm_answer);
    questions.push('');
    answers.push('');
    setForm(prev => ({
      ...prev,
      sm_question: JSON.stringify(questions),
      sm_answer: JSON.stringify(answers),
    }));
  };

  const removeSchemaRow = (index) => {
    const questions = JSON.parse(form.sm_question);
    const answers = JSON.parse(form.sm_answer);
    if (questions.length > 1) {
      questions.splice(index, 1);
      answers.splice(index, 1);
      setForm(prev => ({
        ...prev,
        sm_question: JSON.stringify(questions),
        sm_answer: JSON.stringify(answers),
      }));
    }
  };

  const handleSchemaChange = (index, field, value) => {
    const questions = JSON.parse(form.sm_question);
    const answers = JSON.parse(form.sm_answer);
    if (field === 'question') questions[index] = safeString(value);
    else answers[index] = safeString(value);
    setForm(prev => ({
      ...prev,
      sm_question: JSON.stringify(questions),
      sm_answer: JSON.stringify(answers),
    }));
  };

  const addReviewRow = () => {
    let reviews = [];
    try {
      reviews = JSON.parse(form.review_detail);
      if (!Array.isArray(reviews)) reviews = [];
    } catch {
      reviews = [];
    }
    reviews.push({
      rating: 5,
      date: '',
      authorName: '',
      publisherName: '',
      reviewName: '',
      reviewDescription: '',
    });
    setForm(prev => ({ ...prev, review_detail: JSON.stringify(reviews) }));
  };

  const removeReviewRow = (index) => {
    const reviews = JSON.parse(form.review_detail);
    if (reviews.length > 1) {
      reviews.splice(index, 1);
      setForm(prev => ({ ...prev, review_detail: JSON.stringify(reviews) }));
    }
  };

  const handleReviewChange = (index, field, value) => {
    const reviews = JSON.parse(form.review_detail);
    reviews[index] = { ...reviews[index], [field]: safeString(value) };
    setForm(prev => ({ ...prev, review_detail: JSON.stringify(reviews) }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title || !form.slug || !form.category_id) {
      toast.error('Please fill all required fields');
      return;
    }

    console.log('🔍 Frontend: Form submission started');
    console.log('🔍 Frontend: Current form state:', form);
    console.log('🔍 Frontend: Description field value:', form.description);
    console.log('🔍 Frontend: Description field type:', typeof form.description);
    console.log('🔍 Frontend: Description field length:', form.description?.length);
    console.log('🔍 Frontend: Short description field value:', form.short_description);
    console.log('🔍 Frontend: Short description field type:', typeof form.short_description);
    console.log('🔍 Frontend: Short description field length:', form.short_description?.length);
    
    // Test if description field exists in form
    console.log('🔍 Frontend: Form keys:', Object.keys(form));
    console.log('🔍 Frontend: Form has description key:', 'description' in form);
    console.log('🔍 Frontend: Form description value:', form['description']);

    try {
      setLoading(true);
      
      let reviews = [];
      try {
        reviews = JSON.parse(form.review_detail);
        if (!Array.isArray(reviews)) reviews = [];
      } catch {
        reviews = [];
      }
      const avgReview = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length 
        : 0;

      const payload = {
        ...form,
        seo: JSON.stringify({
          meta_title: form.meta_title,
          meta_description: form.meta_description,
          meta_keywords: form.meta_keywords,
        }),
        category_id: Number(form.category_id),
        review_count: reviews.length,
        rating_count: reviews.filter(r => r.rating).length,
        avg_review_value: parseFloat(avgReview.toFixed(1)),
        views: Number(form.views),
        likes: Number(form.likes),
        sort_order: Number(form.sort_order),
        custom_post_type: form.custom_post_type || 'blog'
      };

      console.log('🔍 Frontend: Form data being sent:', form);
      console.log('🔍 Frontend: Description field value:', form.description);
      console.log('🔍 Frontend: Final payload:', payload);
      console.log('🔍 Frontend: Payload description field:', payload.description);
      console.log('🔍 Frontend: Payload short_description field:', payload.short_description);

      const url = isEditMode ? `/api/internal/blogs/${id}` : '/api/internal/blogs';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Request failed: ${res.status} ${res.statusText}\n${errorText}`);
        }
        data = await res.json();
      } catch (err) {
        toast.error('Server error or invalid response');
        console.error('Fetch error:', err);
        setLoading(false);
        return;
      }
      if (data.success) {
        toast.success(`Article ${isEditMode ? 'updated' : 'created'} successfully!`);
        router.push('/admin/articles/list');
      } else {
        toast.error(data.message || `Failed to ${isEditMode ? 'update' : 'create'} article`);
      }
    } catch (error) {
      console.error('Error submitting article:', error);
      toast.error(`Error ${isEditMode ? 'updating' : 'creating'} article`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : safeString(value)
    }));
  };

  const handleTitleChange = (e) => {
    const title = safeString(e.target.value);
    setForm(prev => ({ 
      ...prev, 
      title, 
      slug: generateSlug(title) 
    }));
  };

  const generateSlug = (text) => {
    return safeString(text)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  const handleDescriptionChange = (html) => {
    console.log('🔍 Frontend: handleDescriptionChange called with:', html);
    console.log('🔍 Frontend: HTML type:', typeof html);
    console.log('🔍 Frontend: HTML length:', html?.length);
    console.log('🔍 Frontend: HTML content preview:', html?.substring(0, 100));
    setForm(prev => {
      const newForm = { ...prev, description: safeString(html) };
      console.log('🔍 Frontend: Form updated, new description:', newForm.description);
      console.log('🔍 Frontend: New description length:', newForm.description?.length);
      console.log('🔍 Frontend: New description preview:', newForm.description?.substring(0, 100));
      return newForm;
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('uploadType', 'articles-featured');

      const res = await fetch('/api/internal/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (data.success && data.url) {
        const ext = file.name.split('.').pop();
        setForm(prev => ({ 
          ...prev, 
          image: safeString(data.url), 
          image_ext: safeString(ext)
        }));
        toast.success('Image uploaded successfully');
      } else {
        toast.error(data.message || 'Image upload failed');
      }
    } catch (error) {
      toast.error('Image upload error');
      console.error('Upload error:', error);
    } finally {
      setImageUploading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'BASIC INFO':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block font-medium">Post Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleTitleChange}
                required
                className="w-full p-2 border rounded-md"
                placeholder="Enter article title"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium">Slug *</label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md"
                placeholder="Article URL slug"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium">Category *</label>
              <div className="flex gap-2 flex-col sm:flex-row">
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                  disabled={loading}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                    className="p-2 border rounded-md flex-1"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-gradient-to-b from-[#0B6D76] to-[#094F56] text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    disabled={loading || !newCategory.trim()}
                  >
                    {loading ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-medium">Short Description</label>
              <textarea
                name="short_description"
                value={form.short_description}
                onChange={handleChange}
                className="w-full p-2 border rounded-md min-h-[100px]"
                placeholder="Brief summary of the article"
              />
            </div>
          </div>
        );

      case 'CONTENT':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block font-medium">Description</label>
              <SummernoteEditor
                value={form.description}
                onChange={handleDescriptionChange}
                placeholder="Write your article content here..."
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium">Featured Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded-md"
                disabled={imageUploading}
              />
              {form.image && (
                <div className="mt-2">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-40 h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, image: '', image_ext: '' }))}
                    className="mt-2 text-sm text-red-500 flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Remove Image
                  </button>
                </div>
              )}
              {imageUploading && (
                <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> Uploading image...
                </div>
              )}
            </div>
          </div>
        );

      case 'META TAGS':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Meta Tags</h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="enable_meta_tags"
                  checked={form.enable_meta_tags}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-2 text-sm font-medium">
                  {form.enable_meta_tags ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            {form.enable_meta_tags && (
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="block font-medium">Meta Title</label>
                  <input
                    type="text"
                    name="meta_title"
                    value={form.meta_title}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="Meta title"
                    maxLength={60}
                  />
                  <div className="text-xs text-gray-500">
                    {form.meta_title.length}/60 characters
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-medium">Meta Description</label>
                  <textarea
                    name="meta_description"
                    value={form.meta_description}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md min-h-[80px]"
                    placeholder="Meta description"
                    maxLength={160}
                  />
                  <div className="text-xs text-gray-500">
                    {form.meta_description.length}/160 characters
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-medium">Meta Keywords</label>
                  <input
                    type="text"
                    name="meta_keywords"
                    value={form.meta_keywords}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your keywords"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'SCHEMA':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Schema Markup</h2>
              <button
                type="button"
                onClick={addSchemaRow}
                className="bg-gradient-to-b from-[#0B6D76] to-[#094F56] text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add FAQ Item
              </button>
            </div>

            {(() => {
              try {
                const questions = JSON.parse(form.sm_question);
                const answers = JSON.parse(form.sm_answer);
                return Array.isArray(questions) ? questions.map((question, index) => (
                  <div key={index} className="flex gap-4 items-start mt-4">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={safeString(question)}
                        onChange={(e) => handleSchemaChange(index, "question", e.target.value)}
                        placeholder="Question"
                        className="w-full p-2 border rounded"
                      />
                      <textarea
                        value={safeString(answers[index])}
                        onChange={(e) => handleSchemaChange(index, "answer", e.target.value)}
                        placeholder="Answer"
                        className="w-full p-2 border rounded min-h-[80px]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSchemaRow(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Remove this FAQ item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )) : [];
              } catch {
                return [];
              }
            })()}
          </div>
        );

      case 'REVIEWS':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Reviews</h2>
              <button
                type="button"
                onClick={addReviewRow}
                className="bg-gradient-to-b from-[#0B6D76] to-[#094F56] text-white px-4 py-2 rounded"
              >
                Add Review
              </button>
            </div>

            {(() => {
              try {
                const reviews = JSON.parse(form.review_detail);
                return Array.isArray(reviews) ? reviews.map((review, index) => (
                  <div key={index} className="mt-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleReviewChange(index, "rating", star)}
                            className={`${review.rating >= star ? "text-yellow-400" : "text-gray-300"} hover:scale-110 transition`}
                          >
                            <Star fill="currentColor" size={20} />
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeReviewRow(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove this review"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Author Name"
                        value={safeString(review.authorName)}
                        onChange={(e) => handleReviewChange(index, "authorName", e.target.value)}
                        className="p-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Publisher Name"
                        value={safeString(review.publisherName)}
                        onChange={(e) => handleReviewChange(index, "publisherName", e.target.value)}
                        className="p-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Review Title"
                        value={safeString(review.reviewName)}
                        onChange={(e) => handleReviewChange(index, "reviewName", e.target.value)}
                        className="p-2 border rounded"
                      />
                      <input
                        type="date"
                        value={safeString(review.date)}
                        onChange={(e) => handleReviewChange(index, "date", e.target.value)}
                        className="p-2 border rounded"
                      />
                    </div>
                    
                    <textarea
                      placeholder="Review Description"
                      value={safeString(review.reviewDescription)}
                      onChange={(e) => handleReviewChange(index, "reviewDescription", e.target.value)}
                      className="w-full p-2 border rounded mt-4 min-h-[100px]"
                    />
                  </div>
                )) : [];
              } catch {
                return [];
              }
            })()}
          </div>
        );

      case 'SETTINGS':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Settings</h2>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="font-medium">Active</span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Mobile Menu Button */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-bold text-gray-800">
          {isEditMode ? 'Edit Article' : 'Create Article'}
        </h2>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-500 hover:text-gray-600"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-lg p-4">
          <ul className="space-y-2">
            {tabs.map((tab) => (
              <li key={tab}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab ? 'bg-[#0B6D76] text-white' : 'hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white border-r shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          {isEditMode ? 'Edit Article' : 'Create Article'}
        </h2>
        <ul className="space-y-2">
          {tabs.map((tab) => (
            <li key={tab}>
              <button
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab ? 'bg-[#0B6D76] text-white' : 'hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Mobile Tab Indicator */}
          <div className="md:hidden mb-6">
            <div className="bg-[#0B6D76] text-white px-4 py-2 rounded-lg">
              {activeTab}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg border">
            {renderContent()}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6 mt-6">
            {activeTab !== 'BASIC INFO' ? (
              <button
                type="button"
                onClick={() => setActiveTab(tabs[tabs.indexOf(activeTab) - 1])}
                className="btn-gray flex items-center gap-2 px-4 py-2"
              >
                <ChevronLeft size={18} /> Previous
              </button>
            ) : (
              <div></div>
            )}

            {activeTab !== 'SETTINGS' ? (
              <button
                type="button"
                onClick={() => setActiveTab(tabs[tabs.indexOf(activeTab) + 1])}
                className="ml-auto btn-primary flex items-center gap-2 px-4 py-2"
              >
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="submit"
                className="ml-auto btn-primary flex items-center gap-2 px-6 py-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> 
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save size={18} /> 
                    {isEditMode ? 'Update Article' : 'Create Article'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add these styles to your global CSS or CSS module */}
      <style jsx>{`
        .btn-primary {
          @apply bg-gradient-to-b from-[#0B6D76] to-[#094F56] text-white font-medium rounded-lg transition-colors hover:from-[#094F56] hover:to-[#083a40] disabled:opacity-70;
        }
        .btn-gray {
          @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors;
        }
      `}</style>
    </form>
  );
}