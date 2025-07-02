import { useState } from "react";
import { Link } from "react-router-dom";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 로그인 처리 로직 (추후 구현)
        alert("로그인 시도: " + email);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6faf3]">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm border border-[#e0f3d6]"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-[#7bbd3b]">로그인</h2>
                <div className="mb-4">
                    <label className="block mb-1 text-sm font-medium text-gray-700">이메일</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-[#9AD970] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9AD970]"
                        placeholder="이메일을 입력하세요"
                    />
                </div>
                <div className="mb-6">
                    <label className="block mb-1 text-sm font-medium text-gray-700">비밀번호</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-[#9AD970] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9AD970]"
                        placeholder="비밀번호를 입력하세요"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-[#9AD970] hover:bg-[#7bbd3b] text-white font-semibold py-2 rounded-lg transition-colors"
                >
                    로그인
                </button>
                <div className="text-center text-sm text-gray-500 mt-4">
                    계정이 없으신가요? <Link to="/signup" className="text-[#9AD970] hover:text-[#7bbd3b]">회원가입</Link>
                </div>
            </form>
        </div>
    );
}
