import { useEffect, useRef } from 'react';
import { Chart } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import {
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
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
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface MixedChartProps {
    data: ChartData<'bar' | 'line'>;
    options?: ChartOptions<'bar' | 'line'>;
    className?: string;
}

export default function MixedChart({ data, options, className }: MixedChartProps) {
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
            <Chart
                ref={chartRef}
                type='bar'
                data={data}
                options={{
                    ...options,
                    // 선 그래프 곡률 설정 (tension: 0.0 ~ 1.0)
                    elements: {
                        line: {
                            tension: 0.0
                        }
                    }
                }}
                key={JSON.stringify(data)} // 데이터가 변경될 때 차트 재생성
            />
        </div>
    );
}
