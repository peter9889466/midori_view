import { useState, useEffect } from "react";
import { products } from "@/components/constants";
import { useNavigate } from "react-router-dom";
import MemberDeletePage from "./MemberDelete";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// 임시 기본 데이터
// const defaultProfile = {
//     userId: "midori123",
//     email: "midori@example.com",
//     birth: "1995-05-01",
//     products: [productsWithHS[0].name, productsWithHS[1].name],
// };

export default function ProfilePage() {
    const [userId, setUserId] = useState("midori123");
    const [email, setEmail] = useState("midori@example.com");
    const [birth, setBirth] = useState("1995-05-01");
    const [selectedProducts, setSelectedProducts] = useState<string[]>(["", "", ""]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const navigate = useNavigate();

    // 관심품목 변경 시 localStorage에 저장
    useEffect(() => {
        localStorage.setItem("userProducts", JSON.stringify(selectedProducts.filter(Boolean)));
    }, [selectedProducts]);

    // 중복 방지: 이미 선택된 값은 다른 Select에서 비활성화
    const getAvailableOptions = (idx: number) =>
        products.filter(
            (item) => !selectedProducts.includes(item) || selectedProducts[idx] === item
        );

    const handleSelectChange = (idx: number, value: string) => {
        setSelectedProducts((prev) => {
            const copy = [...prev];
            copy[idx] = value;
            return copy;
        });
    };

    // 로그아웃
    const handleLogout = () => {
        alert("로그아웃 되었습니다.");
        navigate("/");
    };

    // 회원탈퇴(모달 오픈)
    const handleDeleteAccount = () => {
        setShowDeleteModal(true);
    };

    // 회원탈퇴 완료 시 메인으로 이동
    const handleDeleteModalClose = () => {
        setShowDeleteModal(false);
        navigate("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6faf3]">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-[#e0f3d6]">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#7bbd3b]">마이페이지</h2>
                {/* 아이디 */}
                <div className="mb-6">
                    <div className="text-gray-500 text-sm mb-1">아이디</div>
                    <Input
                        value={userId}
                        onChange={e => setUserId(e.target.value)}
                        className="font-semibold text-lg"
                        placeholder="아이디를 입력하세요"
                    />
                </div>
                {/* 이메일 */}
                <div className="mb-6">
                    <div className="text-gray-500 text-sm mb-1">이메일</div>
                    <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="font-semibold"
                        placeholder="이메일을 입력하세요"
                    />
                </div>
                {/* 생년월일 */}
                <div className="mb-6">
                    <div className="text-gray-500 text-sm mb-1">생년월일</div>
                    <Input
                        type="date"
                        value={birth}
                        onChange={e => setBirth(e.target.value)}
                        className="font-semibold"
                    />
                </div>
                {/* 관심품목 */}
                <div className="mb-8">
                    <div className="text-gray-500 text-sm mb-2">관심품목 (최대 3개, 중복 불가)</div>
                    <div className="flex gap-3">
                        {[0, 1, 2].map((idx) => (
                            <Select
                                key={idx}
                                value={selectedProducts[idx]}
                                onValueChange={(value) => handleSelectChange(idx, value)}
                            >
                                <SelectTrigger className="w-44">
                                    <SelectValue placeholder={`관심품목 ${idx + 1}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {getAvailableOptions(idx).map((item) => (
                                        <SelectItem key={item} value={item} disabled={selectedProducts.includes(item) && selectedProducts[idx] !== item}>
                                            {item}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ))}
                    </div>
                </div>
                {/* 로그아웃/회원탈퇴 버튼 */}
                <div className="space-y-3 pt-2">
                    <button
                        onClick={handleLogout}
                        className="w-full h-12 text-base font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        로그아웃
                    </button>
                    <button
                        onClick={handleDeleteAccount}
                        className="w-full h-12 text-base font-medium bg-red-400 hover:bg-red-500 text-white rounded-lg"
                    >
                        회원탈퇴
                    </button>
                </div>
            </div>
            {/* 회원탈퇴 모달 */}

            {showDeleteModal && (
                <MemberDeletePage onClose={handleDeleteModalClose} />
            )}
        </div>
    );
}
