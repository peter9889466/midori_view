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
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            // Small delay to ensure the component is fully rendered
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        // Refocus input after sending a message (when not typing)
        if (!isTyping && inputRef.current && isOpen) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [isTyping, isOpen]);

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
        setIsTyping(true);

        // Simulate bot response
        setTimeout(() => {
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: getBotResponse(inputValue),
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);
        }, 1000 + Math.random() * 1000);
    };

    const getBotResponse = (userInput: string): string => {
        const input = userInput.toLowerCase();

        if (input.includes("안녕") || input.includes("hello")) {
            return "안녕하세요! 무엇을 도와드릴까요?";
        } else if (input.includes("도움") || input.includes("help")) {
            return "MidoriView는 데이터 시각화 및 분석 플랫폼입니다. 그래프 페이지에서 차트를, 순위 페이지에서 무역 데이터를 확인할 수 있습니다.";
        } else if (input.includes("그래프") || input.includes("차트")) {
            return "그래프 페이지에서 다양한 데이터 시각화 도구를 사용할 수 있습니다. 막대 차트, 선형 차트, 원형 차트 등을 지원합니다.";
        } else if (input.includes("순위") || input.includes("랭킹")) {
            return "순위 페이지에서 무역 품목별 수출입 데이터를 확인하고 정렬할 수 있습니다. 수출액, 수입액, 총 무역액 기준으로 정렬 가능합니다.";
        } else if (input.includes("감사") || input.includes("고마워")) {
            return "천만에요! 더 궁금한 것이 있으시면 언제든 물어보세요.";
        } else {
            return "죄송합니다. 잘 이해하지 못했습니다. 다시 말씀해 주시거나 '도움'이라고 입력해 주세요.";
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
            className={`
        fixed bottom-24 right-6 z-40 
        /* Fixed chatbot window size - adjust these values to change overall chatbot size */
        w-80 h-[480px]
        /* Mobile responsive adjustments */
        sm:w-96 sm:h-[520px] sm:bottom-28 sm:right-8
        /* For very small screens, take more width */
        max-w-[calc(100vw-3rem)]
        shadow-2xl
        animate-in slide-in-from-bottom-4 duration-300
      `}
        >
            {/* Custom chatbot container without Card component to eliminate extra spacing */}
            <div className="h-full flex flex-col bg-white rounded-lg border-2 border-[#9AD970]/20 overflow-hidden">
                {/* Fixed Header - no extra spacing above */}
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
                        aria-label="채팅창 닫기"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Scrollable Messages Container - this area will scroll while header and input stay fixed */}
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
                                className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                  ${message.sender === "user" ? "bg-blue-500" : "bg-[#9AD970]"}
                `}
                            >
                                {message.sender === "user" ? (
                                    <User className="h-4 w-4 text-white" />
                                ) : (
                                    <Bot className="h-4 w-4 text-white" />
                                )}
                            </div>
                            <div
                                className={`
                  max-w-[70%] p-3 rounded-lg text-sm
                  ${
                      message.sender === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-900 rounded-bl-none"
                  }
                `}
                            >
                                {message.text}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#9AD970] flex items-center justify-center">
                                <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.1s" }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.2s" }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Fixed Input Area - no extra spacing below */}
                <div className="flex-shrink-0 border-t p-4 bg-white">
                    <div className="flex gap-2">
                        <Input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="메시지를 입력하세요..."
                            className="flex-1 text-sm"
                            disabled={isTyping}
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isTyping}
                            size="icon"
                            className="bg-[#9AD970] hover:bg-[#8BC766] flex-shrink-0"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
