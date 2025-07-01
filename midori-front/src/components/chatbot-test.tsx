"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

interface ChatbotWindowProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ChatbotWindow({ isOpen, onClose }: ChatbotWindowProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "안녕하세요! MidoriView 챗봇입니다. 무엇을 도와드릴까요?",
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }
    }, [messages, isOpen]);

    // ✅ [추가됨] 백엔드에 메시지 보내고 응답 받는 함수
    const fetchBotResponse = async (userInput: string): Promise<string> => {
        try {
            const response = await fetch("http://localhost:8088/MV/api/chat/message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: userInput }),
            });

            if (!response.ok) {
                throw new Error("서버 응답 오류");
            }

            const data = await response.json();
            return data.message || "⚠️ 응답이 비어 있습니다.";
        } catch (error) {
            console.error("❌ 오류:", error);
            return "⚠️ 서버와의 연결에 실패했습니다.";
        }
    };

    // ✅ [수정됨] 하드코딩된 응답 제거 & 실제 API 연동
    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: "user",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");

        const aiReply = await fetchBotResponse(inputValue); // ✅ 수정됨

        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: aiReply,
            sender: "bot",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 z-40 w-80 h-[480px] sm:w-96 sm:h-[520px] sm:bottom-28 sm:right-8 max-w-[calc(100vw-3rem)] shadow-2xl bg-white rounded-lg border-2 border-[#9AD970]/20 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 flex flex-row items-center justify-between p-4 bg-[#9AD970] text-white">
                <div className="text-lg font-semibold flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    MidoriView 챗봇
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 text-white hover:bg-white/20 flex-shrink-0"
                    aria-label="챗봇창 닫기"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 chatbot-scroll bg-white">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex items-start gap-2 ${
                            message.sender === "user"
                                ? "flex-row-reverse"
                                : "flex-row"
                        }`}
                    >
                        <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                message.sender === "user"
                                    ? "bg-blue-500"
                                    : "bg-[#9AD970]"
                            }`}
                        >
                            {message.sender === "user" ? (
                                <User className="h-4 w-4 text-white" />
                            ) : (
                                <Bot className="h-4 w-4 text-white" />
                            )}
                        </div>

                        <div
                            className={`max-w-[70%] p-3 rounded-lg text-sm ${
                                message.sender === "user"
                                    ? "bg-blue-500 text-white rounded-br-none"
                                    : "bg-gray-100 text-gray-900 rounded-bl-none"
                            }`}
                            style={{ whiteSpace: "pre-wrap" }} // ✅ 줄바꿈 처리
                        >
                            {message.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t p-4 bg-white">
                <div className="flex gap-2">
                    <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지를 입력하세요..."
                        className="flex-1 text-sm"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        size="icon"
                        className="bg-[#9AD970] hover:bg-[#8BC766] flex-shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
