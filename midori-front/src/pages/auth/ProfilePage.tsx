import { useState } from "react";
import { productsWithHS } from "@/components/constants";

// 임시 기본 데이터
const defaultProfile = {
    userId: "midori123",
    email: "midori@example.com",
    birth: "1995-05-01",
    products: [productsWithHS[0].name, productsWithHS[1].name],
};

export default function ProfilePage() {
    const [profile, setProfile] = useState(defaultProfile);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState(profile);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "select-multiple") {
            const options = Array.from((e.target as HTMLSelectElement).selectedOptions).map(opt => opt.value);
            if (options.length > 3) {
                setError("관심품목은 최대 3개까지 선택 가능합니다.");
                return;
            }
            setError("");
            setForm(f => ({ ...f, products: options }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };

    const handleEdit = () => {
        setForm(profile);
        setEditMode(true);
        setError("");
    };

    const handleCancel = () => {
        setEditMode(false);
        setError("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.userId || !form.email || !form.birth || !form.products.length) {
            setError("모든 항목을 입력해 주세요.");
            return;
        }
        setProfile(form);
        setEditMode(false);
        setError("");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6faf3]">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-[#e0f3d6]">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#7bbd3b]">마이페이지</h2>
                {!editMode ? (
                    <div>
                        <div className="mb-4">
                            <div className="text-gray-500 text-sm mb-1">아이디</div>
                            <div className="font-semibold text-lg">{profile.userId}</div>
                        </div>
                        <div className="mb-4">
                            <div className="text-gray-500 text-sm mb-1">이메일</div>
                            <div className="font-semibold">{profile.email}</div>
                        </div>
                        <div className="mb-4">
                            <div className="text-gray-500 text-sm mb-1">생년월일</div>
                            <div className="font-semibold">{profile.birth}</div>
                        </div>
                        <div className="mb-6">
                            <div className="text-gray-500 text-sm mb-1">관심품목</div>
                            <div className="flex flex-wrap gap-2">
                                {profile.products.map((p) => (
                                    <span key={p} className="bg-[#9AD970] text-white px-3 py-1 rounded-full text-xs">{p}</span>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handleEdit}
                            className="w-full bg-[#9AD970] hover:bg-[#7bbd3b] text-white font-semibold py-2 rounded-lg transition-colors"
                        >
                            수정
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-700">아이디</label>
                            <input
                                type="text"
                                name="userId"
                                value={form.userId}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-[#9AD970] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9AD970]"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-700">이메일</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-[#9AD970] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9AD970]"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-700">생년월일</label>
                            <input
                                type="date"
                                name="birth"
                                value={form.birth}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-[#9AD970] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9AD970]"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block mb-1 text-sm font-medium text-gray-700">관심품목 (최대 3개)</label>
                            <select
                                name="products"
                                multiple
                                value={form.products}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-[#9AD970] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9AD970] h-32"
                            >
                                {productsWithHS.map((item) => (
                                    <option key={item.hs} value={item.name}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 bg-[#9AD970] hover:bg-[#7bbd3b] text-white font-semibold py-2 rounded-lg transition-colors"
                            >
                                저장
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
                            >
                                취소
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
