import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { BarChart3, LineChart, PieChart, TrendingUp } from "lucide-react";
import Logo from "../../components/logo";

export default function GraphsPage() {
    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white border-4 border-[#9AD970] p-2">
                        <Logo size={40} />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                    데이터 시각화
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    대화형 차트와 그래프를 통해 데이터를 탐색하세요
                </p>
            </div>

            {/* Chart Type Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#9AD970] text-white">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-sm">
                            막대 차트
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#9AD970] text-white">
                                <LineChart className="h-6 w-6" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-sm">
                            선형 차트
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#9AD970] text-white">
                                <PieChart className="h-6 w-6" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-sm">
                            원형 차트
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#9AD970] text-white">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-sm">
                            트렌드 분석
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Graphs Page Content Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>그래프 페이지 콘텐츠</CardTitle>
                    <CardDescription>
                        대화형 차트 및 데이터 시각화
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center space-y-2">
                            <BarChart3 className="h-12 w-12 text-[#9AD970] mx-auto" />
                            <p className="text-gray-500">
                                Chart.js 시각화가 여기에 표시됩니다
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
