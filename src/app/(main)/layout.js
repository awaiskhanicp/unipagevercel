import Header from '../components/organisms/Header';
import Footer from '../components/organisms/Footer';
import { JobProvider } from '../admin/pages/JobPosts/JobContext';


export default function MainLayout({ children }) {
  return (
    <JobProvider>
      <Header />
      {children}
      <Footer />
    </JobProvider>
  );
}