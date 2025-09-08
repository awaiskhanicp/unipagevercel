// utils/articles.js

const articles = [
  {
    id: 1,
    category: "Education",
    image: "/assets/a1.png",
    title: "Top 10 Universities for International Students in 2025",
    excerpt: "Explore the best universities worldwide for international students with quality education and global exposure.",
    readTime: "5",
    date: "Jan 5, 2025"
  },
  {
    id: 21,
    category: "Education",
    image: "/assets/a2.png",
    title: "Top 10 Universities for International Students in 2025",
    excerpt: "Explore the best universities worldwide for international students with quality education and global exposure.",
    readTime: "5",
    date: "Jan 5, 2025"
  },
  {
    id: 22,
    category: "Education",
    image: "/assets/a3.png",
    title: "Top 10 Universities for International Students in 2025",
    excerpt: "Explore the best universities worldwide for international students with quality education and global exposure.",
    readTime: "5",
    date: "Jan 5, 2025"
  },
  {
    id: 23,
    category: "Education",
    image: "/assets/u1.jpg",
    title: "Top 10 Universities for International Students in 2025",
    excerpt: "Explore the best universities worldwide for international students with quality education and global exposure.",
    readTime: "5",
    date: "Jan 5, 2025"
  },

  {
    id: 24,
    category: "Education",
    image: "/assets/a4.png",
    title: "Top 10 Universities for International Students in 2025",
    excerpt: "Explore the best universities worldwide for international students with quality education and global exposure.",
    readTime: "5",
    date: "Jan 5, 2025"
  },


  {
    id: 2,
    category: "Design",
    image: "/assets/a5.png",
    title: "2025 Graphic Design Trends to Watch",
    excerpt: "A rundown of emerging trends that will dominate the design world in 2025.",
    readTime: "4",
    date: "Jan 10, 2025"
  },
  {
    id: 3,
    category: "Art",
    image: "/assets/u3.jpg",
    title: "The Evolution of Abstract Art",
    excerpt: "How abstract art has evolved from canvas to digital forms.",
    readTime: "6",
    date: "Feb 2, 2025"
  },
  {
    id: 4,
    category: "Education",
    image: "/assets/u4.jpg",
    title: "How to Prepare for Scholarships Abroad",
    excerpt: "A complete guide to preparing scholarship applications for studying overseas.",
    readTime: "7",
    date: "Feb 15, 2025"
  },
  {
    id: 5,
    category: "Design",
    image: "/assets/u5.jpg",
    title: "Best Web Design Practices in 2025",
    excerpt: "Learn what makes a great website in terms of UI/UX and speed.",
    readTime: "5",
    date: "Mar 3, 2025"
  },
  {
    id: 6,
    category: "Art",
    image: "/assets/u6.webp",
    title: "Rise of AI in Digital Art",
    excerpt: "How artificial intelligence is transforming the way art is created.",
    readTime: "6",
    date: "Mar 14, 2025"
  },
  {
    id: 7,
    category: "Education",
    image: "/assets/u7.jpg",
    title: "Top 5 Study Hacks for College Students",
    excerpt: "Maximize your productivity and GPA with these proven study techniques.",
    readTime: "3",
    date: "Mar 20, 2025"
  }, {
    id: 8,
    category: "Design",
    image: "https://images.unsplash.com/photo-1612832021163-0f6c9807c3fd?auto=format&fit=crop&w=800&q=80",
    title: "UX Mistakes You Should Avoid in 2025",
    excerpt: "Improve your product's usability by avoiding these common UX errors.",
    readTime: "5",
    date: "Apr 1, 2025"
  },
  {
    id: 9,
    category: "Art",
    image: "https://images.unsplash.com/photo-1581091870620-5e6a1bfa6a37?auto=format&fit=crop&w=800&q=80",
    title: "Famous Paintings That Changed History",
    excerpt: "Dive into the stories behind some of the world’s most iconic paintings.",
    readTime: "7",
    date: "Apr 7, 2025"
  },
  {
    id: 10,
    category: "Education",
    image: "https://images.unsplash.com/photo-1584697964273-bd53f7a3cfb3?auto=format&fit=crop&w=800&q=80",
    title: "Why Finland's Education System is the Best",
    excerpt: "A breakdown of what makes Finland’s schools stand out globally.",
    readTime: "4",
    date: "Apr 20, 2025"
  },
  {
    id: 11,
    category: "Design",
    image: "https://images.unsplash.com/photo-1581091012184-5c1f4f7f94ec?auto=format&fit=crop&w=800&q=80",
    title: "Typography Tips for Designers",
    excerpt: "Master the art of typography with these essential tips.",
    readTime: "3",
    date: "May 2, 2025"
  },
  {
    id: 12,
    category: "Art",
    image: "https://images.unsplash.com/photo-1605276375005-13d4c1800a54?auto=format&fit=crop&w=800&q=80",
    title: "Street Art as a Medium of Expression",
    excerpt: "Uncover how graffiti and murals are changing urban landscapes.",
    readTime: "5",
    date: "May 14, 2025"
  },
  {
    id: 13,
    category: "Education",
    image: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=800&q=80",
    title: "Virtual Classrooms: Pros and Cons",
    excerpt: "Explore the rise of online education and its impact on learning.",
    readTime: "6",
    date: "May 25, 2025"
  },
  {
    id: 14,
    category: "Design",
    image: "https://images.unsplash.com/photo-1600585154084-3c6ec0b5c9a7?auto=format&fit=crop&w=800&q=80",
    title: "Minimalist Interior Design Ideas",
    excerpt: "Create simple, beautiful spaces with minimalist design principles.",
    readTime: "4",
    date: "Jun 3, 2025"
  },
  {
    id: 15,
    category: "Art",
    image: "https://images.unsplash.com/photo-1549887534-ec7c2129c3fd?auto=format&fit=crop&w=800&q=80",
    title: "Sculpture Through the Ages",
    excerpt: "A historical look at how sculpture has evolved over centuries.",
    readTime: "6",
    date: "Jun 11, 2025"
  },
  {
    id: 16,
    category: "Education",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
    title: "Top Learning Resources for 2025",
    excerpt: "Explore the best websites, platforms, and tools for self-learning.",
    readTime: "5",
    date: "Jun 18, 2025"
  },
  {
    id: 17,
    category: "Design",
    image: "https://images.unsplash.com/photo-1581090700227-1e8b6a0f1b9d?auto=format&fit=crop&w=800&q=80",
    title: "What Makes a Product Design Successful?",
    excerpt: "The key factors behind the world’s most popular product designs.",
    readTime: "7",
    date: "Jul 1, 2025"
  },
  {
    id: 18,
    category: "Art",
    image: "https://images.unsplash.com/photo-1589395937772-04a8e46f3a75?auto=format&fit=crop&w=800&q=80",
    title: "World’s Most Visited Art Museums",
    excerpt: "A virtual tour through the planet’s top art destinations.",
    readTime: "6",
    date: "Jul 10, 2025"
  },
  {
    id: 19,
    category: "Education",
    image: "https://images.unsplash.com/photo-1600195077071-1f0f1f04e2ed?auto=format&fit=crop&w=800&q=80",
    title: "How to Stay Focused During Exams",
    excerpt: "Strategies and techniques to help you perform your best.",
    readTime: "4",
    date: "Jul 20, 2025"
  },
  {
    id: 20,
    category: "Design",
    image: "https://images.unsplash.com/photo-1609941216337-e7339d6a1a1f?auto=format&fit=crop&w=800&q=80",
    title: "Creating a Memorable Brand Identity",
    excerpt: "Design secrets that help you build a lasting brand image.",
    readTime: "5",
    date: "Jul 30, 2025"
  }
];

export default articles;
