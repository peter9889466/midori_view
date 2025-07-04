import React from 'react';
import { Download } from 'lucide-react';

const SimplePDFButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="bg-gradient-to-r from-[#9AD970] to-[#7BC242] text-white px-6 py-3 rounded-lg 
                    font-semibold flex items-center gap-2 shadow-lg shadow-[#9AD970]/30
                    hover:shadow-xl hover:shadow-[#9AD970]/40 hover:-translate-y-0.5 
                    transition-all duration-300 ease-out"
        >
            <Download size={18} />
            PDF로 저장
        </button>
    );
};

export default SimplePDFButton;