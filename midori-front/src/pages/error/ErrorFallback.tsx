"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

export default function ErrorFallback({
    error,
    resetErrorBoundary,
}: ErrorFallbackProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="space-y-4">
                    <div className="flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border-4 border-red-200">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            오류가 발생했습니다
                        </CardTitle>
                        <CardDescription className="mt-2">
                            예상치 못한 오류가 발생했습니다. 다시 시도해 주세요.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 rounded-lg text-left">
                            <p className="text-sm text-red-600 font-mono">
                                {error.message}
                            </p>
                        </div>
                    )}
                    <Button
                        onClick={resetErrorBoundary}
                        className="w-full bg-[#9AD970] hover:bg-[#8BC766]"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        다시 시도
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
