import { Newspaper} from "lucide-react";

interface NewsHeaderProps {
    loading: boolean;
    error: string | null;
    newsLength: number;
    startIndex: number;
    endIndex: number;
}

const NewsHeader = ({ loading, error, newsLength, startIndex, endIndex }: NewsHeaderProps) => (
    <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#9AD970] rounded-full mb-4 shadow-lg">
            <Newspaper className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            친환경 뉴스
        </h1>
        <p className="text-gray-600 text-lg">지구를 위한 따뜻한 소식들</p>
        {!loading && !error && newsLength > 0 && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
                <div className="w-2 h-2 bg-[#9AD970] rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                    총 {newsLength}개 기사 중 {startIndex + 1}-{Math.min(endIndex, newsLength)}번째
                </span>
            </div>
        )}
    </div>
);

export default NewsHeader; 