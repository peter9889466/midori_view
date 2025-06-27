import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { BarChart3, Newspaper, Trophy } from "lucide-react";
import Logo from "../../components/logo";

export default function HomePage() {
    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white border-4 border-[#9AD970] p-2">
                        <Logo size={48} />
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900">
                    MidoriView에 오신 것을 환영합니다
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    데이터 시각화 및 분석을 위한 종합 대시보드
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#9AD970] text-white">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <CardTitle>데이터 시각화</CardTitle>
                        </div>
                        <CardDescription>
                            데이터를 시각화하기 위한 아름다운 차트와 그래프를
                            생성하세요
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600">
                            데이터 패턴을 더 잘 이해하기 위해 강력한 그래프
                            도구와 대화형 시각화에 액세스하세요.
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#9AD970] text-white">
                                <Trophy className="h-5 w-5" />
                            </div>
                            <CardTitle>순위</CardTitle>
                        </div>
                        <CardDescription>
                            종합적인 순위 및 성과 지표를 확인하세요
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600">
                            다양한 카테고리와 기간에 걸쳐 성과 지표를 추적하고
                            순위를 비교하세요.
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#9AD970] text-white">
                                <Newspaper className="h-5 w-5" />
                            </div>
                            <CardTitle>관련뉴스</CardTitle>
                        </div>
                        <CardDescription>
                            친환경 제품에 대한 최신 뉴스와 트렌드를 한눈에 확인하세요
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600">
                            실시간 뉴스와 업계 동향을 통해 빠르게 변화하는 시장
                            상황을 파악하세요.
                        </p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>메인 페이지 콘텐츠</CardTitle>
                    <CardDescription>메인 대시보드 영역입니다</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">
                            메인 페이지 콘텐츠가 여기에 표시됩니다
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
