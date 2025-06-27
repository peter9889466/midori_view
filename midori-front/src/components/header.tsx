import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import Logo from "./logo";

interface NavItem {
    name: string;
    href: string;
    label: string;
}

export default function Header() {
    const location = useLocation();

    const navItems: NavItem[] = [
        { name: "Main", href: "/", label: "Main Page" },
        { name: "Graphs", href: "/graphs", label: "Graphs Page" },
        { name: "Rankings", href: "/rankings", label: "Rankings Page" },
        { name: "News", href: "/news", label: "News Page" },
    ];

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
                    <nav className="flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Button
                                key={item.href}
                                asChild
                                variant={
                                    location.pathname === item.href
                                        ? "default"
                                        : "ghost"
                                }
                                size="sm"
                                className={`
                    text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10
                    ${
                        location.pathname === item.href
                            ? "bg-[#9AD970] hover:bg-[#8BC766] text-white"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }
                `}
                            >
                                <Link to={item.href}>{item.name}</Link>
                            </Button>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
}
