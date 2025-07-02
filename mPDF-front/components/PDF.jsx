import React, { useState, useRef } from 'react';
import { Download, FileText, Calendar, Globe, Package, AlertCircle, CheckCircle, Eye } from 'lucide-react';

const PDF = () => {
  const [formData, setFormData] = useState({
    start: '', end: '', country: 'ALL', hs: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tradeData, setTradeData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); setSuccess('');
  };

  const generateSampleData = () => {
    const sampleData = [
      { year: '202401', statKor: '반도체', hsCd: '854211', expDlr: 1500000, impDlr: 800000 },
      { year: '202402', statKor: '자동차부품', hsCd: '870829', expDlr: 2200000, impDlr: 1100000 },
      { year: '202403', statKor: '화학제품', hsCd: '340290', expDlr: 980000, impDlr: 650000 },
      { year: '202404', statKor: '석유제품', hsCd: '271019', expDlr: 1800000, impDlr: 2100000 },
      { year: '202405', statKor: '철강제품', hsCd: '720851', expDlr: 1350000, impDlr: 900000 },
      { year: '202406', statKor: '기계류', hsCd: '847330', expDlr: 2100000, impDlr: 1200000 },
      { year: '202407', statKor: '섬유제품', hsCd: '520942', expDlr: 750000, impDlr: 580000 },
      { year: '202408', statKor: '플라스틱', hsCd: '392690', expDlr: 1100000, impDlr: 850000 },
      { year: '202409', statKor: '의료기기', hsCd: '901890', expDlr: 1650000, impDlr: 700000 },
      { year: '202410', statKor: '전자부품', hsCd: '854140', expDlr: 1900000, impDlr: 1000000 },
      { year: '202411', statKor: '알루미늄', hsCd: '760611', expDlr: 880000, impDlr: 920000 },
      { year: '202412', statKor: '농산물', hsCd: '100190', expDlr: 650000, impDlr: 780000 }
    ];
    setTradeData(sampleData);
    setSuccess('샘플 데이터 로드 완료!');
  };

  const fetchTradeData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const queryParams = new URLSearchParams({
        start: formData.start, 
        end: formData.end, 
        country: formData.country,
        ...(formData.hs && { hs: formData.hs })
      });
      
      const response = await fetch(`http://localhost:8088/MV/api/data?${queryParams}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const responseText = await response.text();
      const data = JSON.parse(responseText);
      
      if (data.response.header.resultCode !== "00") {
        throw new Error(data.response.header.resultMsg || '데이터 조회 실패');
      }
      
      setTradeData(data.response.body.items.item);
      setSuccess('데이터 조회 성공!');
    } catch (err) {
      setError(`조회 실패: ${err.message}`);
      // 실패시 샘플 데이터 제공
      console.log('API 호출 실패, 샘플 데이터를 사용합니다.');
      generateSampleData();
    } finally {
      setLoading(false);
    }
  };

  // HTML2Canvas와 jsPDF를 사용한 PDF 생성
  const generatePDF = async () => {
    if (!tradeData?.length) {
      setError('먼저 데이터를 조회해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      // html2canvas와 jspdf 라이브러리 로드
      if (!window.html2canvas) {
        const html2canvasScript = document.createElement('script');
        html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        await new Promise((resolve, reject) => {
          html2canvasScript.onload = resolve;
          html2canvasScript.onerror = reject;
          document.head.appendChild(html2canvasScript);
        });
      }

      if (!window.jspdf) {
        const jspdfScript = document.createElement('script');
        jspdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        await new Promise((resolve, reject) => {
          jspdfScript.onload = resolve;
          jspdfScript.onerror = reject;
          document.head.appendChild(jspdfScript);
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      const element = printRef.current;
      const canvas = await window.html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`trade_report_${formData.start}_${formData.end}.pdf`);
      setSuccess('PDF 생성 완료!');
    } catch (err) {
      setError(`PDF 생성 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 브라우저 인쇄 기능 사용
  const printReport = () => {
    if (!tradeData?.length) {
      setError('먼저 데이터를 조회해주세요.');
      return;
    }
    
    const printContent = printRef.current;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Trade Statistics Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { margin-bottom: 20px; }
            .summary { display: flex; gap: 20px; margin: 20px 0; }
            .summary-item { flex: 1; padding: 15px; border: 1px solid #ddd; text-align: center; }
            .export { background-color: #e8f4fd; }
            .import { background-color: #fdf2e8; }
            .balance { background-color: #e8fdf2; }
            .text-right { text-align: right; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const filteredData = tradeData?.filter(item => item.year !== '총계') || [];
  const totalExport = filteredData.reduce((sum, item) => sum + (item.expDlr || 0), 0);
  const totalImport = filteredData.reduce((sum, item) => sum + (item.impDlr || 0), 0);
  const tradeBalance = totalExport - totalImport;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText size={24} className="text-blue-600" />
            <h1 className="text-2xl font-bold">무역통계 PDF 생성기</h1>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Calendar size={14} /> 시작년월
              </label>
              <input
                type="text" name="start" value={formData.start} onChange={handleInputChange}
                placeholder="202401" maxLength={6}
                className="w-full px-3 py-2 border rounded-md focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Calendar size={14} /> 종료년월
              </label>
              <input
                type="text" name="end" value={formData.end} onChange={handleInputChange}
                placeholder="202412" maxLength={6}
                className="w-full px-3 py-2 border rounded-md focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Globe size={14} /> 국가
              </label>
              <select name="country" value={formData.country} onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:border-blue-500 focus:outline-none">
                <option value="ALL">전체</option>
                <option value="US">미국</option>
                <option value="CN">중국</option>
                <option value="JP">일본</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Package size={14} /> HS코드
              </label>
              <input
                type="text" name="hs" value={formData.hs} onChange={handleInputChange}
                placeholder="340290"
                className="w-full px-3 py-2 border rounded-md focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-center mb-4">
            <button onClick={fetchTradeData} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
              {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <FileText size={16} />}
              {loading ? '조회중...' : '데이터 조회'}
            </button>
            <button onClick={() => setShowPreview(!showPreview)} disabled={!tradeData?.length}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400">
              <Eye size={16} /> 미리보기
            </button>
            <button onClick={printReport} disabled={!tradeData?.length}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400">
              <Download size={16} /> 인쇄/PDF
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 mb-4">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700 mb-4">
              <CheckCircle size={16} /> {success}
            </div>
          )}

          {tradeData?.length > 0 && !showPreview && (
            <div>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-md text-center">
                  <h4 className="font-medium text-blue-800 mb-1">총 수출액</h4>
                  <p className="text-xl font-bold text-blue-600">${totalExport.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-md text-center">
                  <h4 className="font-medium text-red-800 mb-1">총 수입액</h4>
                  <p className="text-xl font-bold text-red-600">${totalImport.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-md text-center">
                  <h4 className="font-medium text-green-800 mb-1">무역수지</h4>
                  <p className={`text-xl font-bold ${tradeBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${tradeBalance.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-md">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">년도</th>
                      <th className="px-3 py-2 text-left">상품명</th>
                      <th className="px-3 py-2 text-left">HS코드</th>
                      <th className="px-3 py-2 text-right">수출액($)</th>
                      <th className="px-3 py-2 text-right">수입액($)</th>
                      <th className="px-3 py-2 text-right">무역수지($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.slice(0, 10).map((item, index) => {
                      const balance = (item.expDlr || 0) - (item.impDlr || 0);
                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2">{item.year}</td>
                          <td className="px-3 py-2">{item.statKor || '-'}</td>
                          <td className="px-3 py-2">{item.hsCd}</td>
                          <td className="px-3 py-2 text-right text-blue-600">{(item.expDlr || 0).toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-red-600">{(item.impDlr || 0).toLocaleString()}</td>
                          <td className={`px-3 py-2 text-right font-medium ${balance >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                            {balance.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredData.length > 10 && (
                  <p className="text-center text-gray-500 mt-2">... 총 {filteredData.length}개 데이터 (미리보기에서 10개만 표시)</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* PDF 출력용 컴포넌트 */}
        {showPreview && tradeData?.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div ref={printRef} style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
              <div className="header" style={{ marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
                <h1 style={{ fontSize: '24px', margin: '0 0 10px 0', color: '#333' }}>무역통계 보고서</h1>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <p style={{ margin: '5px 0' }}>기간: {formData.start} ~ {formData.end}</p>
                  <p style={{ margin: '5px 0' }}>국가: {formData.country === 'ALL' ? '전체' : formData.country}</p>
                  {formData.hs && <p style={{ margin: '5px 0' }}>HS코드: {formData.hs}</p>}
                  <p style={{ margin: '5px 0' }}>생성일: {new Date().toLocaleDateString('ko-KR')}</p>
                </div>
              </div>

              <div className="summary" style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
                <div className="summary-item export" style={{ flex: 1, padding: '15px', border: '1px solid #ddd', textAlign: 'center', backgroundColor: '#e8f4fd' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>총 수출액</h3>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1565c0' }}>${totalExport.toLocaleString()}</p>
                </div>
                <div className="summary-item import" style={{ flex: 1, padding: '15px', border: '1px solid #ddd', textAlign: 'center', backgroundColor: '#fdf2e8' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#ef6c00' }}>총 수입액</h3>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#ef6c00' }}>${totalImport.toLocaleString()}</p>
                </div>
                <div className="summary-item balance" style={{ flex: 1, padding: '15px', border: '1px solid #ddd', textAlign: 'center', backgroundColor: tradeBalance >= 0 ? '#e8fdf2' : '#ffebee' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: tradeBalance >= 0 ? '#2e7d32' : '#c62828' }}>무역수지</h3>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: tradeBalance >= 0 ? '#2e7d32' : '#c62828' }}>
                    ${tradeBalance.toLocaleString()}
                    <br />
                    <span style={{ fontSize: '14px' }}>({tradeBalance >= 0 ? '흑자' : '적자'})</span>
                  </p>
                </div>
              </div>

              <div style={{ margin: '30px 0' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#333' }}>상세 무역 데이터</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>년월</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>상품명</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>HS코드</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>수출액($)</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>수입액($)</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>무역수지($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => {
                      const balance = (item.expDlr || 0) - (item.impDlr || 0);
                      return (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9' }}>
                          <td style={{ border: '1px solid #ddd', padding: '6px' }}>{item.year}</td>
                          <td style={{ border: '1px solid #ddd', padding: '6px' }}>{item.statKor || '-'}</td>
                          <td style={{ border: '1px solid #ddd', padding: '6px' }}>{item.hsCd}</td>
                          <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right', color: '#1565c0' }}>
                            {(item.expDlr || 0).toLocaleString()}
                          </td>
                          <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right', color: '#ef6c00' }}>
                            {(item.impDlr || 0).toLocaleString()}
                          </td>
                          <td style={{ 
                            border: '1px solid #ddd', 
                            padding: '6px', 
                            textAlign: 'right', 
                            fontWeight: 'bold',
                            color: balance >= 0 ? '#2e7d32' : '#c62828'
                          }}>
                            {balance.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '30px', fontSize: '12px', color: '#666', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                <p>※ 본 보고서는 무역통계 API를 통해 생성되었습니다.</p>
                <p>※ 모든 금액은 미화(USD) 기준입니다.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDF;