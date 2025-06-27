"use client";

import { useState } from "react";
import { ChatbotIcon } from "./chatbot-icon";
import { ChatbotWindow } from "./chatbot-window";

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    const closeChatbot = () => {
        setIsOpen(false);
    };

    return (
        <>
            <ChatbotIcon onClick={toggleChatbot} isOpen={isOpen} />
            <ChatbotWindow isOpen={isOpen} onClose={closeChatbot} />
        </>
    );
}
