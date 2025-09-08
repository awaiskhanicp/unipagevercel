const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const blogService = {
  createBlog: async (data) => {
    const response = await fetch(`/api/internal/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  getAllBlogs: async () => {
    const response = await fetch(`/api/internal/blogs`);
    return await response.json();
  },

  getBlogById: async (id) => {
    const response = await fetch(`/api/internal/blogs/${id}`);
    return await response.json();
  },

  getBlogBySlug: async (slug) => {
    const response = await fetch(`/api/internal/blogs`);
    const data = await response.json();
    if (data.success) {
      const found = data.data.find(blog => slugify(blog.title) === slug);
      return {
        success: true,
        data: found || null,
      };
    }
    return data;
  },

  updateBlog: async (id, data) => {
    const response = await fetch(`/api/internal/blogs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  deleteBlog: async (id) => {
    const response = await fetch(`/api/internal/blogs/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return await response.json();
  },

  createCategory: async (data) => {
    const response = await fetch(`/api/internal/blog-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  getAllCategories: async () => {
    const response = await fetch(`/api/internal/blog-categories`);
    return await response.json();
  },

  getActiveCategories: async () => {
    const response = await fetch(`/api/internal/blog-categories/active`);
    return await response.json();
  },

  updateCategory: async (id, data) => {
    const response = await fetch(`/api/internal/blog-categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  deleteCategory: async (id) => {
    const response = await fetch(`/api/internal/blog-categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return await response.json();
  },

  // New comment-related methods
    getCommentsByArticleId: async (articleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/internal/comments?article_id=${articleId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch comments');
      }

      // Only return approved comments for this specific article
      return {
        success: true,
        data: data.data.filter(comment => 
          comment.article_id.toString() === articleId.toString() && 
          comment.status === 'approved'
        )
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  getRepliesByArticleId: async (articleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/internal/replies?article_id=${articleId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch replies');
      }

      // Only return approved replies for this specific article
      return {
        success: true,
        data: data.data.filter(reply => 
          reply.article_id.toString() === articleId.toString() && 
          reply.status === 'approved'
        )
      };
    } catch (error) {
      console.error('Error fetching replies:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  createComment: async (commentData) => {
    const response = await fetch(`/api/internal/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData)
    });
    return await response.json();
  },

  createReply: async (replyData) => {
    const response = await fetch(`/api/internal/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(replyData)
    });
    return await response.json();
  },

  // Comment approval methods (admin only)
  approveComment: async (commentId) => {
    const response = await fetch(`/api/internal/comments/${commentId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return await response.json();
  },

  rejectComment: async (commentId) => {
    const response = await fetch(`/api/internal/comments/${commentId}/reject`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return await response.json();
  },

  // Reply approval methods (admin only)
  approveReply: async (replyId) => {
    const response = await fetch(`/api/internal/replies/${replyId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return await response.json();
  },

  rejectReply: async (replyId) => {
    const response = await fetch(`/api/internal/replies/${replyId}/reject`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return await response.json();
  },
};

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}