interface LogoProps {
    size?: number;
    className?: string;
}

export default function Logo({ size = 32, className = "" }: LogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Magnifying glass lens */}
            <circle
                cx="40"
                cy="40"
                r="25"
                stroke="#2d3748"
                strokeWidth="4"
                fill="rgba(154, 217, 112, 0.1)"
            />

            {/* Magnifying glass handle */}
            <line
                x1="60"
                y1="60"
                x2="80"
                y2="80"
                stroke="#2d3748"
                strokeWidth="6"
                strokeLinecap="round"
            />

            {/* Handle grip */}
            <line
                x1="68"
                y1="68"
                x2="72"
                y2="72"
                stroke="#9AD970"
                strokeWidth="2"
                strokeLinecap="round"
            />

            {/* Main leaf shape */}
            <path
                d="M25 40 Q30 25, 45 30 Q55 35, 50 50 Q45 55, 35 50 Q25 45, 25 40 Z"
                fill="#9AD970"
            />

            {/* Leaf vein - main */}
            <path
                d="M30 42 Q37 35, 45 40"
                stroke="#7CB342"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
            />

            {/* Leaf vein - secondary */}
            <path
                d="M32 45 Q35 42, 38 44"
                stroke="#7CB342"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
            />

            {/* Small decorative leaf outside lens */}
            <path
                d="M15 25 Q20 20, 25 25 Q20 30, 15 25 Z"
                fill="#9AD970"
                opacity="0.8"
            />

            {/* Lens highlight for depth */}
            <ellipse
                cx="32"
                cy="32"
                rx="8"
                ry="12"
                fill="rgba(255, 255, 255, 0.3)"
                transform="rotate(-30 32 32)"
            />
        </svg>
    );
}
