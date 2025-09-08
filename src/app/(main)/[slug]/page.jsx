'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { blogService } from "../../../app/services/blog.service";
import Heading from "../../../app/components/atoms/Heading";
import Paragraph from "../../../app/components/atoms/Paragraph";
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaReply, FaHeart, FaTimes, FaTag } from "react-icons/fa";
import Container from "../../../app/components/atoms/Container";
import countriesData from "../../../app/utils/countriesData";
import Input from '../../components/atoms/Input';
import Button from "../../../app/components/atoms/Button";
import { FaPhone, FaUser, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { MdOutlineMailLock } from "react-icons/md";
import { toast } from "sonner";

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const ITEMS_PER_PAGE = 6;

// Modal Component
function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="relative bg-white rounded-lg shadow-xl transform transition-all w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    comment: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyFormData, setReplyFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    comment: '',
    phone_number: ''
  });
  const [replyLoading, setReplyLoading] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userData, setUserData] = useState(null);

  const totalPages = Math.ceil(countriesData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = countriesData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
// console.log('aaaaa', currentData); 
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await blogService.getBlogBySlug(slug);
        if (response.success && response.data) {
          setArticle(response.data);
        } else {
          setError("Article not found");
          router.push('/404');
        }
      } catch (err) {
        setError("Failed to fetch article");
        console.error("Fetch article error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchArticle();
  }, [slug, router]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        if (!res.ok) {
          setIsAuthenticated(false);
          return;
        }
        const data = await res.json();
        setIsAuthenticated(Boolean(data?.user));
        setUserData(data?.user || null);
        
        if (data?.user && article?.id) {
          fetchComments(article.id);
          fetchReplies(article.id);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkSession();
  }, [article?.id]);


  const [blogs, setBlogs] = useState([]);

useEffect(() => {
  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/internal/blogs");
      if (!res.ok) throw new Error("Failed to fetch blogs");

      const { data } = await res.json(); // destructure only data array
      console.log("✅ Blogs fetched:", data);

      setBlogs(data.slice(2, 5)); // only latest 3 blogs
    } catch (err) {
      console.error("❌ Error fetching blogs:", err);
    }
  };

  fetchBlogs();
}, []);



  const fetchComments = async (articleId) => {
    try {
      const response = await fetch(`/api/internal/comments?article_id=${articleId}&status=1&limit=200`, { cache: 'no-store' });
      const data = await response.json();
      if (response.ok) {
        setComments((data.data || []).filter(comment => comment.status === '1' && String(comment.article_id) === String(articleId)));
      } else {
        throw new Error(data.message || 'Failed to fetch comments');
      }
    } catch (error) {
      console.error("Fetch comments error:", error);
      toast.error("Failed to load comments");
    }
  };

  const fetchReplies = async (articleId) => {
    try {
      const response = await fetch(`/api/internal/replies?article_id=${articleId}`, { cache: 'no-store' });
      const data = await response.json();
      if (response.ok) {
        setReplies((data.data || []).filter(reply => Number(reply.status) === 1 && String(reply.article_id) === String(articleId)));
      } else {
        throw new Error(data.message || 'Failed to fetch replies');
      }
    } catch (error) {
      console.error("Fetch replies error:", error);
      toast.error("Failed to load replies");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReplyInputChange = (e) => {
    const { name, value } = e.target;
    setReplyFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!article) return;

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setFormLoading(true);

    try {
      const response = await fetch('/api/internal/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          article_id: article.id,
          article_url: typeof window !== 'undefined' ? window.location.href : '',
          type: 'blog',
          status: 'pending'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit comment');
      }

      toast.success("Comment submitted successfully! It will be visible after approval.");
      setFormData({ first_name: '', last_name: '', phone_number: '', email: '', comment: '' });
      fetchComments(article.id);
    } catch (error) {
      toast.error(error.message || "An error occurred while submitting your comment");
      console.error("Submit error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyingTo || !replyFormData.comment.trim()) return;

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setReplyLoading(true);

    try {
      const isReplyToReply = replyingTo.hasOwnProperty('reply_id');
      const payload = {
        ...replyFormData,
        article_id: article.id.toString(),
        article_url: typeof window !== 'undefined' ? window.location.href : '',
        type: 'blog',
        phone_number: replyFormData.phone_number || '',
        status: 'pending'
      };

      if (isReplyToReply) {
        payload.parent_reply_id = replyingTo.reply_id;
        payload.parent_comment_id = replyingTo.parent_comment_id;
      } else {
        payload.parent_comment_id = replyingTo.comment_id;
      }

      const response = await fetch('/api/internal/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit reply');
      }

      toast.success("Reply submitted successfully! It will be visible after approval.");
      setReplyFormData({ first_name: '', last_name: '', email: '', comment: '', phone_number: '' });
      setReplyingTo(null);
      setShowReplyModal(false);
      fetchReplies(article.id);
    } catch (error) {
      toast.error(error.message || "An error occurred while submitting your reply");
      console.error("Reply submit error:", error);
    } finally {
      setReplyLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const openReplyModal = (item) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setReplyingTo(item);
    setReplyFormData({
      first_name: '',
      last_name: '',
      email: '',
      comment: '',
      phone_number: ''
    });
    setShowReplyModal(true);
  };

  const toggleReplies = (id) => {
    setExpandedReplies(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const countTotalReplies = (commentId) => {
    let count = 0;
    
    const firstLevel = replies.filter(reply => 
      String(reply.parent_comment_id) === String(commentId) && 
      !reply.parent_reply_id &&
      reply.status === 'approved' &&
      String(reply.article_id) === String(article.id)
    );
    count += firstLevel.length;
    
    const countNested = (replyId) => {
      const nested = replies.filter(reply => 
        reply.parent_reply_id === replyId && 
        Number(reply.status) === 1 &&
        String(reply.article_id) === String(article.id)
      );
      count += nested.length;
      nested.forEach(reply => countNested(reply.reply_id));
    };
    
    firstLevel.forEach(reply => countNested(reply.reply_id));
    
    return count;
  };

  const renderReplies = (parentId, isComment = false, depth = 0) => {
    let filteredReplies = replies.filter(reply => 
      String(reply.article_id) === String(article.id) &&
      Number(reply.status) === 1 &&
      (isComment 
        ? String(reply.parent_comment_id) === String(parentId) && !reply.parent_reply_id
        : reply.parent_reply_id === parentId)
    );

    if (filteredReplies.length === 0) return null;
    const maxDepth = 5;
    if (depth >= maxDepth) return null;

    return (
      <div 
        className={`mt-4 pl-6 ${depth > 0 ? 'border-l-2 border-[var(--brand-color)]' : ''}`}
        style={{ marginLeft: `${depth * 1}rem` }}
      >
        {filteredReplies.map(reply => (
          <div key={reply.reply_id} className="mt-4 bg-[#f8fafb] p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="bg-[#0B6D76] text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">
                  {reply.first_name?.charAt(0)}{reply.last_name?.charAt(0)}
                </div>
                <div>
                  <h5 className="font-medium">
                    {reply.first_name} {reply.last_name}
                  </h5>
                  <span className="text-xs text-gray-500">
                    replied on {formatDate(reply.created_at)}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => openReplyModal(reply)}
                className="flex items-center gap-1 text-[var(--brand-color)] hover:text-[#095d65] transition-colors text-sm"
              >
                <FaReply size={12} /> Reply
              </button>
            </div>
            <p className="mt-2 text-gray-700 pl-[44px]">{reply.comment}</p>
            {renderReplies(reply.reply_id, false, depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className="p-8 text-center">
      <div className="animate-pulse flex justify-center">
        <div className="w-8 h-8 bg-[var(--brand-color)] rounded-full"></div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="p-8 text-center text-red-500">
      <p>{error}</p>
      <Button onClick={() => router.push('/blog')} className="mt-4">
        Back to Blog
      </Button>
    </div>
  );
  
  if (!article) return (
    <div className="p-8 text-center">
      <p>Article not found.</p>
      <Button onClick={() => router.push('/blog')} className="mt-4">
        Back to Blog
      </Button>
    </div>
  );

  const imageUrl = article.image?.startsWith('/')
    ? `${API_BASE_URL}${article.image}`
    : article.image;

  return (
    <div className="pb-20">
      <Container>
        <div className="flex pt-[80px] flex-col justify-center items-center">
          <Heading level={3} className="mb-4 text-center">{article.title}</Heading>
          <p className="text-gray-600 flex items-center gap-2">
  {article.category ? (
    <>
      <FaTag className="text-[var(--brand-color)]" />
      <span>{article.category.name}</span>
    </>
  ) : (
    'University Page'
  )}
  {/* <span> - {new Date(article.created_at).toLocaleDateString()}</span> */}
</p>

          <div className="flex gap-[10px] mt-4">
            {[
              { Icon: FaFacebook, name: "Facebook", url: (u, t) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
              { Icon: FaTwitter, name: "Twitter", url: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
              { Icon: FaLinkedin, name: "LinkedIn", url: (u, t) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
              { Icon: FaWhatsapp, name: "WhatsApp", url: (u, t) => `https://api.whatsapp.com/send?text=${encodeURIComponent(t + " " + u)}` },
            ].map(({ Icon, name, url }, i) => (
              <a
                key={i}
                className="flex items-center text-[14px] gap-[10px] hover:opacity-80 transition-opacity"
                href={url(window.location.href, article.title)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Share on ${name}`}
              >
                <div className="bg-[var(--brand-color)] w-[40px] h-[40px] rounded-full flex justify-center items-center text-white text-[16px]">
                  <Icon />
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-none mt-8 rounded-lg overflow-hidden">
          {imageUrl ? (
            <div className="relative w-full h-[55vh] mb-6">
              <Image
                src={imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  console.error("Image failed to load:", imageUrl);
                  e.currentTarget.parentElement.innerHTML = (
                    '<div class="w-full h-full bg-gray-200 flex items-center justify-center">' +
                    '<span class="text-gray-500">Image not available</span>' +
                    '</div>'
                  );
                }}
              />
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded mb-6 flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>

        <Paragraph className="mb-4 text-gray-600 text-lg">{article.short_description}</Paragraph>

        <div 
          className="prose max-w-none mt-6 px-6 lg:px-0" 
          dangerouslySetInnerHTML={{ __html: article.description || '' }} 
        />
      </Container>

      <Container>
        <div className="text-center pt-16 pb-8">
          <Heading level={3}>You might be interested in...</Heading>
        </div>

        <div className="px-6 py-10">
          <Swiper
            modules={[Navigation]}
            spaceBetween={20}
            slidesPerView={1}
            navigation={{ 
              prevEl: '.interest-prev', 
              nextEl: '.interest-next',
              disabledClass: 'opacity-50 cursor-not-allowed'
            }}
            breakpoints={{ 
              640: { slidesPerView: 1.5 },
              768: { slidesPerView: 2 }, 
              1024: { slidesPerView: 3 } 
            }}
            onSlideChange={(swiper) => {
              const newPage = Math.ceil((swiper.activeIndex + 1) / ITEMS_PER_PAGE);
              if (newPage !== currentPage) {
                setCurrentPage(newPage);
              }
            }}
          >
            {blogs.map(({ id, title, image }) => (
              <SwiperSlide key={id}>
                <div 
                  className="flex flex-col justify-between bg-[#eef6f7] p-4 rounded-[40px] shadow-md h-[450px] hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/${title.toLowerCase().replace(/\s+/g, '-')}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && router.push(`/${title.toLowerCase().replace(/\s+/g, '-')}`)}
                >
                  <div className="flex items-center gap-4 mb-[20px] min-h-[80px]">
                    <div className="w-[50px] h-[50px] bg-white text-[#006666] font-semibold flex items-center justify-center rounded-[40px] border-b-4 border-[#0B6D76] shadow">
                      {id.toString().padStart(2, "0")}
                    </div>
                    <div className="flex-1">
                      <Heading level={4}>{title}</Heading>
                    </div>
                  </div>
                  <div className="flex-grow" />
                  <div className="w-full overflow-hidden rounded-tr-[82px] rounded-br-[82px] rounded-bl-[82px] mt-auto">
                    <div className="relative w-full h-[300px]">
                      <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover rounded-tr-[82px] rounded-br-[82px] rounded-bl-[82px] hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

        </div>
      </Container>
    
      {/* Comment Form */}
      <Container>
        <div className="pb-6 text-center md:pt-0 sm:pt-[80px] pt-[80px]">
          <Heading level={3}>Add Your Comment</Heading>
        </div>

        <div className="form flex justify-center px-4">
          <form onSubmit={handleSubmit} className="w-full max-w-3xl">
            <div className="grid grid-cols-1 gap-6">
              <div className="grid xl:grid-cols-2 gap-4">
                <Input 
                  name="first_name" 
                  icon={<FaUser />} 
                  placeholder="First Name" 
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
                <Input 
                  name="last_name"
                  icon={<FaUser />} 
                  placeholder="Last Name" 
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
                <Input 
                  name="phone_number" 
                  icon={<FaPhone />} 
                  placeholder="Phone" 
                  value={formData.phone_number}
                  onChange={handleInputChange}
                />
                <Input 
                  name="email" 
                  type="email"
                  icon={<MdOutlineMailLock />} 
                  placeholder="Email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <textarea
                name="comment"
                placeholder="Enter your comment here..."
                className="px-4 py-4 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px] bg-[#E7F1F2] text-sm resize-none h-[120px] placeholder-gray-500 w-full"
                value={formData.comment}
                onChange={handleInputChange}
                required
              />

              <Button type="submit" disabled={formLoading}>
                {formLoading ? "Submitting..." : "Submit Comment"}
              </Button>
            </div>
          </form>
        </div>
      </Container>

      {/* Comments Section - Only show if authenticated */}
      {isAuthenticated ? (
        <Container>
          <div className="mt-16 bg-gray-100 p-3 rounded-lg shadow-sm border border-gray-100">
            <h1 className="mb-8 text-center text-5xl">Article Comments</h1>
            <div className="space-y-6 max-w-3xl mx-auto">
              {comments.length > 0 ? (
                comments.map(comment => {
                  const totalReplies = countTotalReplies(comment.comment_id);
                  
                  return (
                    <div 
                      key={comment.comment_id} 
                      className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                      id={`comment-${comment.comment_id}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3">
                            <div 
                              className="bg-[var(--brand-color)] text-white w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                              aria-hidden="true"
                            >
                              {comment.first_name?.charAt(0)}{comment.last_name?.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">
                                {comment.first_name} {comment.last_name}
                              </h4>
                              <p className="text-gray-500 text-sm">
                                {formatDate(comment.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="mt-3 text-gray-700 pl-[52px]">{comment.comment}</p>
                      <div className="mt-2 pl-[52px]">
                        <button
                          onClick={() => openReplyModal(comment)}
                          className="text-[var(--brand-color)] hover:text-[#095d65] text-sm px-3 py-1 rounded hover:bg-[#eaf4f5] transition"
                          type="button"
                        >
                          Reply
                        </button>
                      </div>
                      
                      {renderReplies(comment.comment_id, true)}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <div className="bg-[#f8fafb] p-8 rounded-lg">
                    <p className="text-gray-500 text-lg">No comments yet. Be the first to share your thoughts!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      ) : (
        <Container>
          <div className="mt-16 bg-gray-100 p-8 rounded-lg text-center">
            <Heading level={4} className="mb-4">Please login to view comments</Heading>
            <Button onClick={() => router.push('/student-login')}>Login</Button>
          </div>
        </Container>
      )}

      <Modal isOpen={showReplyModal} onClose={() => {
        setShowReplyModal(false);
        setReplyingTo(null);
      }}>
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              Reply to {replyingTo?.first_name}'s {replyingTo?.comment_id ? 'comment' : 'reply'}
            </h3>
            <button 
              onClick={() => {
                setShowReplyModal(false);
                setReplyingTo(null);
              }}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close reply modal"
            >
              <FaTimes />
            </button>
          </div>
          
          <form onSubmit={handleReplySubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reply-first-name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="reply-first-name"
                  name="first_name"
                  value={replyFormData.first_name}
                  onChange={handleReplyInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color)] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="reply-last-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="reply-last-name"
                  name="last_name"
                  value={replyFormData.last_name}
                  onChange={handleReplyInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color)] focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="reply-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="reply-email"
                name="email"
                value={replyFormData.email}
                onChange={handleReplyInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color)] focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="reply-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="reply-phone"
                name="phone_number"
                value={replyFormData.phone_number}
                onChange={handleReplyInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color)] focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="reply-comment" className="block text-sm font-medium text-gray-700 mb-1">
                Your Reply
              </label>
              <textarea
                id="reply-comment"
                name="comment"
                value={replyFormData.comment}
                onChange={handleReplyInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color)] focus:border-transparent h-32"
                required
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyingTo(null);
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={replyLoading}
              >
                {replyLoading ? "Posting..." : "Post Reply"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Login Required Modal */}
      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Login Required</h3>
            <button 
              onClick={() => setShowLoginModal(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close login modal"
            >
              <FaTimes />
            </button>
          </div>
          <p className="text-gray-700 mb-6">Please login to post a comment or reply.</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowLoginModal(false)}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
              type="button"
            >
              Close
            </button>
            <button
              onClick={() => router.push('/student-login')}
              className="px-4 py-2 rounded-lg bg-[var(--brand-color)] text-white hover:bg-[#095d65]"
              type="button"
            >
              Login
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}




