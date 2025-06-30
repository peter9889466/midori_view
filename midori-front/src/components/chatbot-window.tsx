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

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;
        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: "user",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setTimeout(() => {
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: getBotResponse(inputValue),
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
        }, 1000);
    };
    const getBotResponse = (userInput: string): string => {
        const input = userInput.toLowerCase();
        if (input.includes("안녕") || input.includes("hello")) {
            return "안녕하세요! 무엇을 도와드릴까요?";
        } else if (input.includes("도움") || input.includes("help")) {
            return "MidoriView는 데이터 시각화 및 분석 플랫폼입니다. 그래프, 순위 페이지에서 무역 데이터를 확인할 수 있습니다.";
        } else {
            return "죄송합니다. 잘 이해하지 못했습니다. 다시 말씀해주시거나 '도움'이라고 입력해주세요.";
        }
    };
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    if (!isOpen) return null;
    return (
        <div
            className="fixed bottom-24 right-6 z-40 w-80 h-[480px] sm:w-96 sm:h-[520px] sm:bottom-28 sm:right-8 max-w-[calc(100vw-3rem)] shadow-2xl bg-white rounded-lg border-2 border-[#9AD970]/20 overflow-hidden"
        >
            {/* Fixed Header */}
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
            {/* Scrollable Messages Container */}
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
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.sender === "user" ? "bg-blue-500" : "bg-[#9AD970]"}`}
                        >
                            {message.sender === "user" ? (
                                <User className="h-4 w-4 text-white" />
                            ) : (
                                <Bot className="h-4 w-4 text-white" />
                            )}
                        </div>
                        <div
                            className={`max-w-[70%] p-3 rounded-lg text-sm ${message.sender === "user" ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"}`}
                        >
                            {message.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            {/* Fixed Input Area */}
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
