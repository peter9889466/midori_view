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
        { name: "Graphs", href: "/graph", label: "Graph Page" },
        { name: "Rankings", href: "/ranking", label: "Ranking Page" },
    ];

    return (
        <header className="border-b border-gray-200 bg-white shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo and Project Name */}
                    <Link
                        to="/"
                        className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border-2 border-[#9AD970] p-1">
                            <Logo size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
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
                                className={
                                    location.pathname === item.href
                                        ? "bg-[#9AD970] hover:bg-[#8BC766] text-white"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                }
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
