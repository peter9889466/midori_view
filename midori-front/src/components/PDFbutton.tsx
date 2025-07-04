import React from 'react';
import { Download } from 'lucide-react';

const SimplePDFButton: React.FC<{ onClick: () => void; className?: string }> = ({ onClick, className }) => {
    return (
        <button
            onClick={onClick}
            className={`h-10 px-3 md:px-6 py-2 rounded-lg font-semibold flex items-center gap-2 border border-gray-200 bg-white text-gray-700 hover:bg-[#eafbe0] hover:text-black transition text-sm md:text-base ${className || ''}`}
        >
            <Download size={18} />
            PDF
        </button>
    );
};

export default SimplePDFButton;