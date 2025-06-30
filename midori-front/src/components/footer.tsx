
export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white mt-16">
            <div className="container mx-auto px-4 py-6 text-center">
                <p>&copy; {new Date().getFullYear()} MidoriView. All Rights Reserved.</p>
                <div className="flex justify-center space-x-6 mt-4 text-sm">
                    <a href="/about" className="hover:underline">회사소개</a>
                    <a href="/privacy" className="hover:underline">개인정보처리방침</a>
                    <a href="/contact" className="hover:underline">문의하기</a>
                </div>
            </div>
        </footer>
    );
}