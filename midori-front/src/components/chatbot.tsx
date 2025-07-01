"use client";

import { useState } from "react";
import { ChatbotIcon } from "./chatbot-icon";
import { ChatbotWindow } from "./chatbot-test";
import { useLocation } from "react-router-dom";

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // /login, /signup 경로에서는 챗봇 숨김
    if (location.pathname === "/login" || location.pathname === "/signup") {
        return null;
    }

    const toggleChatbot = () => setIsOpen((prev) => !prev);
    const closeChatbot = () => setIsOpen(false);

    return (
        <>
            <ChatbotIcon onClick={toggleChatbot} isOpen={isOpen} />
            <ChatbotWindow isOpen={isOpen} onClose={closeChatbot} />
        </>
    );
}
