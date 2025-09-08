"use client"; 
import { useEffect, useState } from "react";
import { Bell, Search, User, LogOut, Settings, Menu, X, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

const Header = ({ onMenuClick }) => {
  const [openMenu, setOpenMenu] = useState(null); // 'notifications' | 'profile' | 'search'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminUser, setAdminUser] = useState({ name: "Admin User", email: "admin@university.com" });
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);

  const router = useRouter();

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  // Global search function
  const performGlobalSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(`/api/internal/global-search?q=${encodeURIComponent(query)}&limit=15`);
      const data = await res.json();
      
      if (data.success) {
        setSearchResults(data.data || []);
        setShowSearchResults(true);
        
        // Add to search history
        addToSearchHistory(query);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setSearchLoading(false);
    }
  };

  // Add search term to history
  const addToSearchHistory = (query) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) return;
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== trimmedQuery);
      return [trimmedQuery, ...filtered].slice(0, 5); // Keep only last 5 searches
    });
  };

  // Load search history from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("searchHistory");
      if (stored) {
        try {
          setSearchHistory(JSON.parse(stored));
        } catch {}
      }
    }
  }, []);

  // Save search history to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && searchHistory.length > 0) {
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performGlobalSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowSearchResults(false);
        setShowSearchHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('.search-container input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load admin info from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("adminUser");
      if (stored) {
        try {
          setAdminUser(JSON.parse(stored));
        } catch {}
      }
    }
  }, []);

  // Fetch notifications once on page load for count
  useEffect(() => {
    fetch("/api/internal/notifications?limit=5")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.data || []);
          // Count unread notifications
          const unread = data.data?.filter(n => !n.is_read).length || 0;
          setUnreadCount(unread);
        }
      });
  }, []);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/internal/notifications?limit=5")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setNotifications(data.data || []);
            // Count unread notifications
            const unread = data.data?.filter(n => !n.is_read).length || 0;
            setUnreadCount(unread);
          }
        })
        .catch((error) => {
          console.error('Failed to fetch notifications:', error);
        });
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Re-fetch notifications when bell is clicked
  useEffect(() => {
    if (openMenu === "notifications") {
      setLoading(true);
      fetch("/api/internal/notifications?limit=5")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setNotifications(data.data || []);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [openMenu]);

  // Handle search result click
  const handleSearchResultClick = (result) => {
    setShowSearchResults(false);
    setSearchQuery('');
    router.push(result.url);
  };

  // Get icon for search result type
  const getResultIcon = (type) => {
    switch (type) {
      case 'course':
        return '📚';
      case 'university':
        return '🏫';
      case 'student':
        return '👨‍🎓';
      case 'subject':
        return '📖';
      case 'job':
        return '💼';
      default:
        return '🔍';
    }
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left Side: Menu Icon (Mobile) + Title */}
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          {/* Mobile Menu Icon */}
          <button
            className="block md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="w-7 h-7 text-gray-700" />
          </button>
          <h1 className="truncate text-lg sm:text-xl md:block hidden md:text-2xl font-bold bg-[#0B6D76] bg-clip-text text-transparent">
            University Admin Dashboard
          </h1>
        </div>
        {/* Right Side */}
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          {/* Mobile Search Button
          <button
            className="block md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => toggleMenu('search')}
            aria-label="Open search"
          >
            <Search className="w-6 h-6 text-gray-700" />
          </button> */}

          {/* Global Search */}
          <div className="relative search-container w-full max-w-xs sm:max-w-sm md:block hidden md:w-80">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, universities, students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2 && searchResults.length > 0) {
                    setShowSearchResults(true);
                  } else if (searchHistory.length > 0) {
                    setShowSearchHistory(true);
                  }
                }}
                className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-[#0B6D76] transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearchResults(false);
                    setShowSearchHistory(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              {/* Keyboard shortcut indicator */}
              <div className="absolute -bottom-6 left-0 text-xs text-gray-400">
                Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">K</kbd> to search
              </div>
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Search Results</h3>
                  <p className="text-sm text-gray-500">
                    {searchLoading ? 'Searching...' : `${searchResults.length} results found`}
                  </p>
                </div>
                
                {searchLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0B6D76] mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Searching...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="p-2">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}-${index}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-lg">{getResultIcon(result.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {result.displayName}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {result.subtitle}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(result.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {searchResults.length > 0 && (
                  <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <p className="text-xs text-gray-500 text-center">
                      Click on any result to navigate to the corresponding page
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Search History Dropdown */}
            {showSearchHistory && !showSearchResults && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Recent Searches</h3>
                  <p className="text-sm text-gray-500">Click to search again</p>
                </div>
                
                <div className="p-2">
                  {searchHistory.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(query);
                        setShowSearchHistory(false);
                        performGlobalSearch(query);
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{query}</span>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                  <button
                    onClick={() => {
                      setSearchHistory([]);
                      localStorage.removeItem("searchHistory");
                      setShowSearchHistory(false);
                    }}
                    className="text-xs text-red-600 hover:text-red-700 text-center w-full"
                  >
                    Clear search history
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("notifications")}
              className="p-3 rounded-xl hover:bg-gray-100 relative transition-colors duration-200"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {openMenu === "notifications" && (
              <div className="absolute md:right-0  -right-18 mt-2  md:w-86 w-76 bg-white  rounded-2xl shadow-2xl border border-gray-200 z-50">
                <div className="p-6 rounded-2xl bg-[#0B6D76] text-white">
                  <h3 className="font-bold text-lg">Notifications</h3>
                  <p className="text-indigo-100 text-sm">
                    {loading
                      ? "Loading..."
                      : `You have ${notifications.length} new notification${notifications.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="p-4 ">
                  {notifications.length === 0 && !loading && (
                    <div className="text-gray-500 text-center">No notifications</div>
                  )}
                  {notifications.slice(0, 5).map((item, idx) => (
                    <div key={item.id || idx} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-150">
                      <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                        item.type === 'login' ? 'bg-green-500' : 
                        item.type === 'account' ? 'bg-blue-500' : 
                        'bg-gray-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                          {item.meta || item.message || item.type || 'Notification'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.name && item.email ? `${item.name} (${item.email})` : item.name || item.email || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(item.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-100">
                  <button
                    className="w-full text-center text-[#0B6D76] hover:text-indigo-700 font-medium text-sm"
                    onClick={() => router.push("/admin/notifications")}
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("profile")}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="w-10 h-10 bg-[#0B6D76] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-sm font-semibold text-gray-700 block">{adminUser.name}</span>
                <span className="text-xs text-gray-500">Administrator</span>
              </div>
            </button>

            {/* Profile Dropdown */}
            {openMenu === "profile" && (
              <div className="absolute md:right-0  -right-0 mt-2  md:w-66 w-76  mt-2  bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                <div className="p-6 bg-[#0B6D76] text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold">{adminUser.name}</p>
                      <p className="text-sm text-indigo-100">{adminUser.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-xl transition-colors duration-150">
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">My Profile</span>
                    </button>
                    {/* <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-xl transition-colors duration-150">
                      <Settings className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Settings</span>
                    </button> */}
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 rounded-xl transition-colors duration-150"
                        onClick={() => {
                          localStorage.removeItem("adminUser");
                          router.push("/admin/login");
                        }}
                      >
                        <LogOut className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      {openMenu === 'search' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden">
          <div className="fixed top-0 left-0 right-0 bg-white p-4 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={() => toggleMenu(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">Search</h2>
            </div>
            
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, universities, students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-[#0B6D76] transition-all duration-200"
                autoFocus
              />
            </div>

            {/* Mobile Search Results */}
            {showSearchResults && (
              <div className="mt-4 max-h-96 overflow-y-auto">
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Search Results</h3>
                    <p className="text-sm text-gray-500">
                      {searchLoading ? 'Searching...' : `${searchResults.length} results found`}
                    </p>
                  </div>
                  
                  {searchLoading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0B6D76] mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Searching...</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No results found for "{searchQuery}"
                    </div>
                  ) : (
                    <div className="p-2">
                      {searchResults.map((result, index) => (
                        <button
                          key={`mobile-${result.type}-${result.id}-${index}`}
                          onClick={() => {
                            handleSearchResultClick(result);
                            toggleMenu(null);
                          }}
                          className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-lg">{getResultIcon(result.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {result.displayName}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {result.subtitle}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(result.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

// Helper: Format "time ago" from date string
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // in seconds
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return date.toLocaleDateString();
}
