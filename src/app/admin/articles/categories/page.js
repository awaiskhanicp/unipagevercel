'use client';

import Layout from '../../components/Layout';
import CategoryList from '../../pages/Articles/CategoryList';
import { ArticleProvider } from '../../pages/ArticleContext';

const CategoriesPage = () => {
  return (
    <Layout>
      <ArticleProvider>
        <CategoryList />
      </ArticleProvider>
    </Layout>
  );
};

export default CategoriesPage; 