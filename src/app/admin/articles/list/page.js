'use client';

import dynamic from 'next/dynamic';
import Layout from '../../components/Layout';
import { ArticleProvider } from '../../pages/ArticleContext';

// Dynamically import AddArticle with SSR disabled
const ArticleList = dynamic(() => import('../../pages/Articles/ArticleList'), {
  ssr: false,
});

const AddArticlePage = () => {
  return (
    <Layout>
      <ArticleProvider>
        <ArticleList />
      </ArticleProvider>
    </Layout>
  );
};

export default AddArticlePage;
