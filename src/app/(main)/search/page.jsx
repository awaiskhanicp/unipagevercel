import React, { Suspense } from 'react';
import UniversityListingSidebar from '../../components/organisms/UniversityListingSidebar';

function Search() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UniversityListingSidebar />
    </Suspense>
  );
}

export default Search;