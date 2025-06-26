import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Trophy, Medal, Award, Star } from "lucide-react";
import Logo from "../../components/logo";

export default function RankingPage() {
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
                    순위 및 성과
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    카테고리별 성과 지표를 추적하고 순위를 비교하세요
                </p>
            </div>

            {/* Ranking Categories */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#9AD970] text-white">
                                <Trophy className="h-6 w-6" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-sm">
                            최고 성과자
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#9AD970] text-white">
                                <Medal className="h-6 w-6" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-sm">
                            카테고리
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#9AD970] text-white">
                                <Award className="h-6 w-6" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-sm">
                            성취
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#9AD970] text-white">
                                <Star className="h-6 w-6" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-sm">
                            평가
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Sample Rankings Table */}
            <Card>
                <CardHeader>
                    <CardTitle>현재 순위</CardTitle>
                    <CardDescription>샘플 순위 데이터 표시</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((rank) => (
                            <div
                                key={rank}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9AD970] text-white font-bold">
                                        {rank}
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            항목 {rank}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            샘플 순위 항목
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="secondary">
                                        점수: {100 - rank * 5}
                                    </Badge>
                                    {rank <= 3 && (
                                        <div className="text-[#9AD970]">
                                            {rank === 1 && (
                                                <Trophy className="h-5 w-5" />
                                            )}
                                            {rank === 2 && (
                                                <Medal className="h-5 w-5" />
                                            )}
                                            {rank === 3 && (
                                                <Award className="h-5 w-5" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Rankings Page Content Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>순위 페이지 콘텐츠</CardTitle>
                    <CardDescription>상세 순위 및 성과 지표</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center space-y-2">
                            <Trophy className="h-12 w-12 text-[#9AD970] mx-auto" />
                            <p className="text-gray-500">
                                상세 순위 표 및 지표가 여기에 표시됩니다
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
