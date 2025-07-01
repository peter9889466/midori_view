import { useState, useRef, useEffect } from "react";
import { Edit, Check } from "lucide-react";
import { productsWithHS } from "@/components/constants";
import { useNavigate } from "react-router-dom";
import MemberDeletePage from "./MemberDelete";

// 임시 기본 데이터
// const defaultProfile = {
//     userId: "midori123",
//     email: "midori@example.com",
//     birth: "1995-05-01",
//     products: [productsWithHS[0].name, productsWithHS[1].name],
// };

export default function ProfilePage() {
    // 기본 프로필 데이터
    const [userId, setUserId] = useState("midori123");
    const [email, setEmail] = useState("midori@example.com");
    const [birth, setBirth] = useState("1995-05-01");
    const [products, setProducts] = useState<string[]>([productsWithHS[0].name, productsWithHS[1].name]);

    // 편집 상태
    const [isEditingId, setIsEditingId] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingBirth, setIsEditingBirth] = useState(false);
    const [isEditingProducts, setIsEditingProducts] = useState(false);
    const [error, setError] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // ref
    const idRef = useRef<HTMLDivElement>(null);
    const emailRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();

    // 인라인 편집 저장/취소
    const handleSaveId = () => {
        if (idRef.current) setUserId(idRef.current.textContent || userId);
        setIsEditingId(false);
    };
    const handleCancelId = () => {
        if (idRef.current) idRef.current.textContent = userId;
        setIsEditingId(false);
    };
    const handleSaveEmail = () => {
        if (emailRef.current) setEmail(emailRef.current.textContent || email);
        setIsEditingEmail(false);
    };
    const handleCancelEmail = () => {
        if (emailRef.current) emailRef.current.textContent = email;
        setIsEditingEmail(false);
    };
    const handleKeyDown = (e: React.KeyboardEvent, type: "id" | "email") => {
        if (e.key === "Enter") {
            e.preventDefault();
            type === "id" ? handleSaveId() : handleSaveEmail();
        } else if (e.key === "Escape") {
            type === "id" ? handleCancelId() : handleCancelEmail();
        }
    };
    useEffect(() => {
        if (isEditingId && idRef.current) {
            idRef.current.focus();
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(idRef.current);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    }, [isEditingId]);
    useEffect(() => {
        if (isEditingEmail && emailRef.current) {
            emailRef.current.focus();
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(emailRef.current);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    }, [isEditingEmail]);

    // 생년월일 편집
    const [birthEditValue, setBirthEditValue] = useState(birth);
    const handleSaveBirth = () => {
        setBirth(birthEditValue);
        setIsEditingBirth(false);
    };
    const handleCancelBirth = () => {
        setBirthEditValue(birth);
        setIsEditingBirth(false);
    };

    // 관심품목 편집
    const [productsEditValue, setProductsEditValue] = useState(products);
    const handleProductsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
        if (options.length > 3) {
            setError("관심품목은 최대 3개까지 선택 가능합니다.");
            return;
        }
        setError("");
        setProductsEditValue(options);
    };
    const handleSaveProducts = () => {
        setProducts(productsEditValue);
        setIsEditingProducts(false);
    };
    const handleCancelProducts = () => {
        setProductsEditValue(products);
        setIsEditingProducts(false);
        setError("");
    };

    // 관심품목 변경 시 localStorage에 저장
    useEffect(() => {
        localStorage.setItem("userProducts", JSON.stringify(products));
    }, [products]);

    // 로그아웃
    const handleLogout = () => {
        // 실제 로그아웃 처리(토큰 삭제 등)는 추후 구현
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
                    <div className="flex items-center gap-2">
                        <div
                            ref={idRef}
                            contentEditable={isEditingId}
                            onKeyDown={e => handleKeyDown(e, "id")}
                            className={`font-semibold text-lg ${isEditingId ? "border-b border-gray-300 focus:border-[#9AD970] focus:outline-none px-1 min-w-[100px]" : ""}`}
                            suppressContentEditableWarning={true}
                        >
                            {userId}
                        </div>
                        {isEditingId ? (
                            <>
                                <button onClick={handleSaveId} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><Check className="h-4 w-4 text-gray-900" /></button>
                                <button onClick={handleCancelId} className="p-1 hover:bg-gray-100 rounded-full transition-colors">취소</button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditingId(true)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><Edit className="h-4 w-4 text-gray-500 hover:text-gray-700" /></button>
                        )}
                    </div>
                </div>
                {/* 이메일 */}
                <div className="mb-6">
                    <div className="text-gray-500 text-sm mb-1">이메일</div>
                    <div className="flex items-center gap-2">
                        <div
                            ref={emailRef}
                            contentEditable={isEditingEmail}
                            onKeyDown={e => handleKeyDown(e, "email")}
                            className={`font-semibold ${isEditingEmail ? "border-b border-gray-300 focus:border-[#9AD970] focus:outline-none px-1 min-w-[150px]" : ""}`}
                            suppressContentEditableWarning={true}
                        >
                            {email}
                        </div>
                        {isEditingEmail ? (
                            <>
                                <button onClick={handleSaveEmail} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><Check className="h-4 w-4 text-gray-900" /></button>
                                <button onClick={handleCancelEmail} className="p-1 hover:bg-gray-100 rounded-full transition-colors">취소</button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditingEmail(true)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><Edit className="h-4 w-4 text-gray-500 hover:text-gray-700" /></button>
                        )}
                    </div>
                </div>
                {/* 생년월일 */}
                <div className="mb-6">
                    <div className="text-gray-500 text-sm mb-1">생년월일</div>
                    <div className="flex items-center gap-2">
                        {isEditingBirth ? (
                            <>
                                <input
                                    type="date"
                                    value={birthEditValue}
                                    onChange={e => setBirthEditValue(e.target.value)}
                                    className="border-b border-[#9AD970] px-2 py-1 rounded focus:outline-none"
                                />
                                <button onClick={handleSaveBirth} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><Check className="h-4 w-4 text-gray-900" /></button>
                                <button onClick={handleCancelBirth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">취소</button>
                            </>
                        ) : (
                            <>
                                <span className="font-semibold">{birth}</span>
                                <button onClick={() => setIsEditingBirth(true)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><Edit className="h-4 w-4 text-gray-500 hover:text-gray-700" /></button>
                            </>
                        )}
                    </div>
                </div>
                {/* 관심품목 */}
                <div className="mb-6">
                    <div className="text-gray-500 text-sm mb-1">관심품목</div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {isEditingProducts ? (
                            <>
                                <select
                                    multiple
                                    value={productsEditValue}
                                    onChange={handleProductsChange}
                                    className="border-b border-[#9AD970] px-2 py-1 rounded focus:outline-none h-24 min-w-[180px]"
                                >
                                    {productsWithHS.map((item) => (
                                        <option key={item.hs} value={item.name}>{item.name}</option>
                                    ))}
                                </select>
                                <button onClick={handleSaveProducts} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><Check className="h-4 w-4 text-gray-900" /></button>
                                <button onClick={handleCancelProducts} className="p-1 hover:bg-gray-100 rounded-full transition-colors">취소</button>
                            </>
                        ) : (
                            <>
                                {products.map((p) => (
                                    <span key={p} className="bg-[#9AD970] text-white px-3 py-1 rounded-full text-xs">{p}</span>
                                ))}
                                <button onClick={() => setIsEditingProducts(true)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><Edit className="h-4 w-4 text-gray-500 hover:text-gray-700" /></button>
                            </>
                        )}
                    </div>
                    {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
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
