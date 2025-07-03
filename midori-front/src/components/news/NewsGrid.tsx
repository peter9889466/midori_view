import { Card } from "@/components/ui/card";
import { Newspaper, ExternalLink, Clock } from "lucide-react";
import type { NaverNewsItem } from "./useNews";

interface NewsGridProps {
  loading: boolean;
  error: string | null;
  currentNews: NaverNewsItem[];
  startIndex: number;
}

const NewsGrid = ({ loading, error, currentNews, startIndex }: NewsGridProps) => {
  if (loading || error) return null;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
      {currentNews.length === 0 ? (
        <div className="col-span-full text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">뉴스 결과가 없습니다.</p>
        </div>
      ) : (
        currentNews.map((item, idx) => (
          <Card
            key={startIndex + idx}
            className="group relative overflow-hidden bg-white hover:bg-gradient-to-br hover:from-white hover:to-green-50/50 border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => window.open(item.originallink, '_blank', 'noopener,noreferrer')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') window.open(item.originallink, '_blank', 'noopener,noreferrer'); }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#9AD970]"></div>
            <div className="p-6">
              <div
                className="block font-bold text-lg leading-tight text-gray-800 group-hover:text-[#8BC760] mb-3 transition-colors duration-200"
                dangerouslySetInnerHTML={{ __html: item.title }}
              />
              <div
                className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{item.pubDate}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#9AD970] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span>더 보기</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6AAE4A] to-[#9AD970] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </Card>
        ))
      )}
    </div>
  );
};

export default NewsGrid; 