import { useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import {
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Chart.js 스케일 등록
import { Chart as ChartJS } from 'chart.js';
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface BarChartProps {
    data: ChartData<'bar'>;
    options?: ChartOptions<'bar'>;
    className?: string;
}

export default function BarChart({ data, options, className }: BarChartProps) {
    const chartRef = useRef<any>(null);

    useEffect(() => {
        // 컴포넌트가 언마운트될 때 차트 정리
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, []);

    return (
        <div className={className}>
            <Bar
                ref={chartRef}
                data={data}
                options={options}
                key={JSON.stringify(data)} // 데이터가 변경될 때 차트 재생성
            />
        </div>
    );
}
