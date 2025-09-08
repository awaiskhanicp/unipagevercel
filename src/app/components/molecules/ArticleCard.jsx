'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { slugify } from '../../utils/slugify';
import { CalendarDays, User } from 'lucide-react'; // For icons

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const ArticleCard = ({ article }) => {
  const router = useRouter();

  let imageUrl = null;
  if (article.image) {
    if (article.image.startsWith('/')) {
      imageUrl = `${API_BASE_URL}${article.image}`;
    } else if (article.image.startsWith('http')) {
      imageUrl = article.image;
    }
  }

  const excerpt = article.excerpt || article.short_description || '';

  const handleArticleClick = () => {
    const slug = slugify(article.title);
    router.push(`/${slug}`);
  };

  const categoryColor =
    article.category?.name?.toLowerCase() === 'consulting'
      ? 'bg-green-500'
      : 'bg-blue-500';

  return (
    <div
      className="bg-white rounded-[20px] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={handleArticleClick}
    >
      {/* Image Section */}
      {imageUrl && (
        <div className="relative">
          <Image
            src={imageUrl}
            alt={article.title}
            width={400}
            height={250}
            className="w-full h-[220px] object-cover"
          />
          {article.category?.name && (
            <span
              className={`${categoryColor} text-white text-xs px-3 py-1 rounded-full absolute bottom-3 left-3`}
            >
              {article.category.name}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center text-gray-500 text-xs gap-4 mb-2">
          <span className="flex items-center gap-1">
            <User size={14} /> {article.author || 'By admin'}
          </span>
          {article.created_at && (
            <span className="flex items-center gap-1">
              <CalendarDays size={14} />{' '}
              {new Date(article.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          )}
        </div>

        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          {article.title}
        </h3>
        {/* <p className="text-sm text-gray-600 mb-4">{excerpt}</p> */}

        <button
          className="text-[#0B6D76] hover:underline font-medium text-sm"
          onClick={(e) => {
            e.stopPropagation();
            handleArticleClick();
          }}
        >
          Read the article →
        </button>
      </div>
    </div>
  );
};

export default ArticleCard;







