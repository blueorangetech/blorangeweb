import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import DataChatWelcome from './DataChatWelcome';
import DataChatHistory from './DataChatHistory';
import DataChatInput from './DataChatInput';
import WorkbookPanel from './WorkbookPanel';
import WorkspaceDivider from './WorkspaceDivider';
import { applyWorkbookEdits, calculationCache } from './workbookEditing';
import './workbook.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function DataChatView({ datasetId }) {
  const isHf = datasetId === 'hanssem_hf';
  const serviceTitle = isHf ? '한샘 홈퍼니싱' : '한샘 리하우스';

  const [inputVal, setInputVal] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [workbook, setWorkbook] = useState(null);
  const [sheetName, setSheetName] = useState('');
  const [selection, setSelection] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadingName, setUploadingName] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragDepth = useRef(0);
  const requestBusy = useRef(false);
  const originalFile = useRef(null);
  const originalWorkbook = useRef(null);
  const [edits, setEdits] = useState({});
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [chatRatio, setChatRatio] = useState(38);

  const handleUpload = async (files) => {
    const file = files?.[0];
    if (!file || requestBusy.current) return;
    setUploadError('');
    if (files.length !== 1) {
      setUploadError('엑셀 파일은 한 번에 하나씩 첨부해 주세요.');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.xlsx') || file.size > 10 * 1024 * 1024) {
      setUploadError('10MB 이하의 .xlsx 파일을 선택해 주세요.');
      return;
    }
    requestBusy.current = true;
    setUploading(true);
    setUploadingName(file.name);
    try {
      const data = new FormData();
      data.append('file', file);
      const token = Cookies.get('Authorization');
      const response = await fetch(`${API_BASE_URL}/api/ai_chat/workbook`, {
        method: 'POST', headers: token ? { Authorization: token } : {}, body: data,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.detail === 'string' ? result.detail : '파일을 읽을 수 없습니다.');
      const computed = applyWorkbookEdits(result, {});
      setWorkbook(computed);
      originalFile.current = file;
      originalWorkbook.current = result;
      setEdits({});
      setExportError('');
      setSheetName(result.sheets[0].name);
      setSelection(null);
      setChatHistory([]);
    } catch (error) {
      setUploadError(error.message || '업로드에 실패했습니다.');
    } finally {
      requestBusy.current = false;
      setUploading(false);
      setUploadingName('');
    }
  };

  const handleCellEdit = (sheetName, address, value) => {
    if (requestBusy.current || !originalWorkbook.current) return;
    const sheet = originalWorkbook.current.sheets.find(item => item.name === sheetName);
    if (!sheet || sheet.locked_cells?.includes(address)) return;
    const [, column, row] = /^([A-Z]+)(\d+)$/.exec(address);
    const col = [...column].reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0) - 1;
    const before = sheet.formulas?.[address] ?? sheet.rows[Number(row) - 1][col] ?? '';
    const next = { ...edits };
    const key = JSON.stringify([sheetName, address]);
    if (value === before) delete next[key];
    else next[key] = { sheet: sheetName, address, value };
    let updated;
    try {
      updated = applyWorkbookEdits(originalWorkbook.current, next);
    } catch (error) {
      setExportError(error.message);
      return;
    }
    if (JSON.stringify(updated).length > 160000) {
      setExportError('수정한 내용이 너무 많습니다. 내용을 줄여 주세요.');
      return;
    }
    setEdits(next);
    setWorkbook(updated);
    setExportError('');
  };

  const handleExport = async () => {
    if (requestBusy.current || !originalFile.current) return;
    requestBusy.current = true;
    setExporting(true);
    setExportError('');
    try {
      const data = new FormData();
      data.append('file', originalFile.current);
      data.append('edits', JSON.stringify(Object.values(edits)));
      data.append('calculated', JSON.stringify(calculationCache(workbook)));
      const token = Cookies.get('Authorization');
      const response = await fetch(`${API_BASE_URL}/api/ai_chat/workbook/export`, {
        method: 'POST', headers: token ? { Authorization: token } : {}, body: data,
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => ({}));
        throw new Error(typeof failure.detail === 'string' ? failure.detail : '내보내기에 실패했습니다.');
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = `${workbook.filename.replace(/\.xlsx$/i, '')}_수정본.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      setExportError(error.message || '내보내기에 실패했습니다.');
    } finally {
      requestBusy.current = false;
      setExporting(false);
    }
  };

  const navigateToCells = (href) => {
    if (!workbook || !href.startsWith('#sheet=')) return;
    const params = new URLSearchParams(href.slice(1));
    const name = params.get('sheet');
    const range = (params.get('range') || '').toUpperCase();
    const sheet = workbook.sheets.find(item => item.name === name);
    if (!sheet || !/^[A-Z]{1,3}[1-9]\d*(:[A-Z]{1,3}[1-9]\d*)?$/.test(range)) return;
    const valid = range.split(':').every(address => {
      const [, col, row] = /^([A-Z]+)(\d+)$/.exec(address);
      const index = [...col].reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0);
      return Number(row) <= sheet.rows.length && index <= Math.max(0, ...sheet.rows.map(r => r.length));
    });
    if (valid) { setSheetName(name); setSelection({ sheet: name, range }); }
  };

  useEffect(() => {
    const history = chatEndRef.current?.parentElement;
    history?.scrollTo({ top: history.scrollHeight, behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text || requestBusy.current) return;
    requestBusy.current = true;

    // 사용자 메시지 추가
    setChatHistory((prev) => [...prev, { type: 'user', content: text, scope: selection ? `${selection.sheet}!${selection.range}` : workbook?.filename }]);
    setInputVal('');
    setIsTyping(true);

    try {
      const token = Cookies.get('Authorization');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = token;
      }

      const response = await fetch(`${API_BASE_URL}/api/ai_chat`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          message: text,
          dataset_id: datasetId,
          dataset_name: serviceTitle,
          history: chatHistory,
          ...(workbook ? { workbook, selection } : {}),
        }),
      });

      if (!response.ok) {
        const failure = await response.json().catch(() => ({}));
        throw new Error(typeof failure.detail === 'string' ? failure.detail : '서버 응답 오류가 발생했습니다.');
      }

      const result = await response.json();

      if (result.status === 'success' && result.response) {
        setChatHistory((prev) => [...prev, { type: 'ai', content: result.response }]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { type: 'ai', content: result.message || '답변을 생성하는 중에 오류가 발생했습니다.' },
        ]);
      }
    } catch (error) {
      console.error('Data Chat API Error:', error);
      setIsTyping(false);
      setChatHistory((prev) => [
        ...prev,
        { type: 'ai', content: error.message || '서버와의 통신이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.' },
      ]);
    } finally {
      requestBusy.current = false;
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const templateQuestions = isHf
    ? [
        "홈퍼니싱 광고 성과의 주요 상승 요인이 무엇인가요?",
        "Meta 전환 캠페인의 효율 분석",
        "구글 디스플레이 타겟팅 성과 리포트",
        "유튜브 비디오 캠페인 직접 전환 성과 요약"
      ]
    : [
        "지난 달 성과가 가장 좋았던 매체는 어디인가요?",
        "카카오 캠페인 효율 개선 방안을 추천해줘",
        "이번 주 전환당 비용(CPA) 트렌드 분석",
        "광고비 대비 매출액(ROAS) 최적화 제안"
      ];

  return (
    <div className={`data-chat-workspace${workbook ? ' has-workbook' : ''}`}
      style={{ '--chat-ratio': `${chatRatio}fr`, '--sheet-ratio': `${100 - chatRatio}fr` }}
      onDragEnter={event => {
        if (!isHf || !Array.from(event.dataTransfer.types).includes('Files')) return;
        event.preventDefault();
        dragDepth.current += 1;
        if (!requestBusy.current) setIsDraggingFile(true);
      }}
      onDragOver={event => {
        if (isHf && Array.from(event.dataTransfer.types).includes('Files')) {
          event.preventDefault();
          event.dataTransfer.dropEffect = requestBusy.current ? 'none' : 'copy';
        }
      }}
      onDragLeave={event => {
        if (!isHf || !Array.from(event.dataTransfer.types).includes('Files')) return;
        event.preventDefault();
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (!dragDepth.current) setIsDraggingFile(false);
      }}
      onDrop={event => {
        if (!isHf || !Array.from(event.dataTransfer.types).includes('Files')) return;
        event.preventDefault();
        dragDepth.current = 0;
        setIsDraggingFile(false);
        handleUpload(event.dataTransfer.files);
      }}
    >
    {isDraggingFile && <div className="chat-file-drop-overlay"><span className="material-symbols-outlined" aria-hidden="true">upload_file</span><strong>엑셀 파일을 여기에 놓으세요</strong><span>.xlsx · 최대 10MB · 한 번에 1개</span></div>}
    <div className="data-chat-conversation" style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 120px)',
      position: 'relative',
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
      backgroundColor: '#f8fafc'
    }}>
      {/* Dynamic Keyframes Animation Injection */}
      <style>{`
        @keyframes pulseBorder {
          0% { border-color: #cbd5e1; }
          50% { border-color: #3b82f6; }
          100% { border-color: #cbd5e1; }
        }
        @keyframes bounceDot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .ai-pulse-input {
          animation: pulseBorder 2.5s infinite ease-in-out;
        }
        .loading-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #3b82f6;
          margin: 0 3px;
        }
        .loading-dot:nth-child(1) { animation: bounceDot 0.8s infinite 0.1s; }
        .loading-dot:nth-child(2) { animation: bounceDot 0.8s infinite 0.2s; }
        .loading-dot:nth-child(3) { animation: bounceDot 0.8s infinite 0.3s; }
        
        .chat-markdown p { margin: 0 0 10px 0; line-height: 1.6; }
        .chat-markdown p:last-child { margin-bottom: 0; }
        .chat-markdown ul, .chat-markdown ol { margin: 0 0 10px 20px; padding: 0; }
        .chat-markdown li { margin-bottom: 5px; line-height: 1.5; }
        .chat-markdown strong { color: #1e3a8a; font-weight: 700; }
        
        /* 테이블 스타일 추가 */
        .chat-markdown table {
          width: 100%;
          border-collapse: collapse;
          margin: 14px 0;
          font-size: 0.88rem;
          background-color: #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          border-radius: 6px;
          overflow: hidden;
        }
        .chat-markdown th, .chat-markdown td {
          border: 1px solid #e2e8f0;
          padding: 10px 14px;
          text-align: left;
          font-weight: 500;
        }
        .chat-markdown th {
          background-color: #f8fafc;
          color: #1e293b;
          font-weight: 600;
        }
        .chat-markdown tr:nth-child(even) {
          background-color: #fafafa;
        }
      `}</style>

      {chatHistory.length === 0 && !workbook ? (
        <DataChatWelcome
          isHf={isHf}
          serviceTitle={serviceTitle}
          templateQuestions={templateQuestions}
          onSend={handleSend}
        />
      ) : (
        <DataChatHistory
          chatHistory={chatHistory}
          isTyping={isTyping}
          chatEndRef={chatEndRef}
          onCellReference={navigateToCells}
        />
      )}

      <DataChatInput
        inputVal={inputVal}
        setInputVal={setInputVal}
        isTyping={isTyping || uploading || exporting}
        allowAttachments={isHf}
        uploading={uploading}
        uploadingName={uploadingName}
        uploadError={uploadError}
        onAttach={handleUpload}
        onRemoveAttachment={() => { setWorkbook(null); originalFile.current = null; originalWorkbook.current = null; setEdits({}); setExportError(''); setSelection(null); setChatHistory([]); setUploadError(''); }}
        workbook={workbook}
        selection={selection}
        serviceTitle={serviceTitle}
        onSend={handleSend}
        onKeyPress={handleKeyPress}
      />
    </div>
    {workbook && <WorkspaceDivider ratio={chatRatio} onChange={setChatRatio} />}
    {workbook && <WorkbookPanel workbook={workbook} sheetName={sheetName} setSheetName={setSheetName} selection={selection} setSelection={setSelection} onAsk={() => setInputVal(`선택한 ${selection.sheet}!${selection.range} 영역을 분석해줘`)} onEdit={handleCellEdit} edits={edits} disabled={isTyping || uploading || exporting} exporting={exporting} exportError={exportError} onExport={handleExport} />}
    </div>
  );
}

export default DataChatView;
