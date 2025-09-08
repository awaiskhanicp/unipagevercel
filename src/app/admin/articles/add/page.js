'use client';

import dynamic from 'next/dynamic';
import Layout from '../../components/Layout';
import { ArticleProvider } from '../../pages/ArticleContext';

// Dynamically import AddArticle with SSR disabled
const AddArticle = dynamic(() => import('../../pages/Articles/AddArticle'), {
  ssr: false,
});

const AddArticlePage = () => {
  return (
    <Layout>
      <ArticleProvider>
        <AddArticle />
      </ArticleProvider>
    </Layout>
  );
};

export default AddArticlePage;
