"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

interface ChatbotIconProps {
    onClick: () => void;
    isOpen: boolean;
}

export function ChatbotIcon({ onClick }: ChatbotIconProps) {
    return (
        <Button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-[#9AD970] hover:bg-[#8BC766] text-white sm:h-16 sm:w-16 sm:bottom-8 sm:right-8"
            size="icon"
            aria-label="챗봇 열기"
        >
            <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
        </Button>
    );
}
