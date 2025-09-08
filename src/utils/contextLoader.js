// Utility to determine when different contexts should load their data
export const shouldLoadContext = (contextName, pathname) => {
  const contextRules = {
    jobs: ['/jobs', '/apply-online', '/'],
    wishlist: ['/wishlist', '/comparison', '/institutions', '/courses', '/'],
    search: ['/search', '/institutions', '/courses', '/'],
    auth: ['*'], // Always load auth context
  };

  const allowedPaths = contextRules[contextName] || [];
  
  // If no specific rules, don't load
  if (allowedPaths.length === 0) return false;
  
  // If '*' is in allowed paths, always load
  if (allowedPaths.includes('*')) return true;
  
  // Check if current path matches any allowed paths
  return allowedPaths.some(path => pathname.startsWith(path));
};

// Hook to use context loading logic
export const useContextLoader = (contextName) => {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  return shouldLoadContext(contextName, pathname);
};
