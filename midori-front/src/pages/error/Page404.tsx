import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";

export default function Page404() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="space-y-4">
                    <div className="flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border-4 border-red-200">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            404 - 페이지를 찾을 수 없습니다
                        </CardTitle>
                        <CardDescription className="mt-2">
                            요청하신 페이지가 존재하지 않거나 이동되었습니다.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        asChild
                        className="w-full bg-[#9AD970] hover:bg-[#8BC766]"
                    >
                        <Link
                            to="/"
                            className="flex items-center justify-center space-x-2"
                        >
                            <Home className="h-4 w-4" />
                            <span>홈으로 돌아가기</span>
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
