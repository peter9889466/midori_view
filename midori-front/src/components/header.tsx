import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import Logo from "./logo";
import { motion } from "framer-motion";
import { useRef, useLayoutEffect, useState } from "react";

interface NavItem {
    name: string;
    href: string;
    label: string;
}

export default function Header() {
    const location = useLocation();
    const navItems: NavItem[] = [
        { name: "Main", href: "/", label: "Main Page" },
        { name: "Rankings", href: "/rankings", label: "Rankings Page" },
        { name: "News", href: "/news", label: "News Page" },
    ];

    // 각 버튼의 ref 저장
    const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const navRef = useRef<HTMLDivElement>(null);
    const [indicator, setIndicator] = useState({ left: 0, width: 0 });

    useLayoutEffect(() => {
        const idx = navItems.findIndex(item => location.pathname === item.href);
        const btn = btnRefs.current[idx];
        const nav = navRef.current;
        if (btn && nav) {
            const btnRect = btn.getBoundingClientRect();
            const navRect = nav.getBoundingClientRect();
            setIndicator({ left: btnRect.left - navRect.left, width: btnRect.width });
        }
    }, [location.pathname]);

    return (
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo and Project Name */}
                    <Link
                        to="/"
                        className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity min-w-0"
                    >
                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white border-2 border-[#9AD970] p-1 flex-shrink-0">
                            <Logo size={24} className="sm:w-8 sm:h-8" />
                        </div>
                        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                            MidoriView
                        </h1>
                    </Link>

                    {/* Navigation */}
                    <nav ref={navRef} className="relative flex items-center space-x-1">
                        {/* 슬라이딩 초록색 배경 */}
                        <motion.div
                            className="absolute top-0 left-0 h-8 sm:h-10 rounded-lg bg-[#9AD970] z-0"
                            layout
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            style={{ left: indicator.left, width: indicator.width }}
                        />
                        {navItems.map((item, idx) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Button
                                    key={item.href}
                                    asChild
                                    ref={(el) => { btnRefs.current[idx] = el; }}
                                    variant="ghost"
                                    size="sm"
                                    className={`
                                        relative z-10
                                        text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10
                                        ${isActive ? "text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}
                                    `}
                                    data-active={isActive}
                                >
                                    <Link to={item.href}>{item.name}</Link>
                                </Button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </header>
    );
}
