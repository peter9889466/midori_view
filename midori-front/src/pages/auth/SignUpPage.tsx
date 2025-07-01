import { useState } from "react";
import { Link } from "react-router-dom";

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }
        setError("");
        // 회원가입 처리 로직 (추후 구현)
        alert("회원가입 시도: " + name + ", " + email);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6faf3]">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm border border-[#e0f3d6]"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-[#7bbd3b]">회원가입</h2>
                <div className="mb-4">
                    <label className="block mb-1 text-sm font-medium text-gray-700">이름</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-[#9AD970] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9AD970]"
                        placeholder="이름을 입력하세요"
                    />
                </div>
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
                <div className="mb-4">
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
                <div className="mb-6">
                    <label className="block mb-1 text-sm font-medium text-gray-700">비밀번호 확인</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-[#9AD970] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9AD970]"
                        placeholder="비밀번호를 다시 입력하세요"
                    />
                </div>
                {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
                <button
                    type="submit"
                    className="w-full bg-[#9AD970] hover:bg-[#7bbd3b] text-white font-semibold py-2 rounded-lg transition-colors"
                >
                    회원가입
                </button>
                <div className="text-center text-sm text-gray-500 mt-4">
                    이미 계정이 있으신가요? <Link to="/login" className="text-[#7bbd3b] hover:underline">로그인</Link>
                </div>
            </form>
        </div>
    );
}
