export default function LoadingState() {
    return (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2 text-blue-700">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            데이터를 불러오는 중...
        </div>
    );
} 