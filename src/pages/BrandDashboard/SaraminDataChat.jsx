import { useEffect, useRef, useState } from 'react';
import blueorangeLogo from '../../assets/blueorange_logo.png';
import { analyzeChat, CHAT_QUESTIONS } from './chatAnalysis';
import './chat.css';

export default function SaraminDataChat({ month }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [context, setContext] = useState({});
  const end = useRef(null);
  const textarea = useRef(null);
  useEffect(() => {
    if (messages.length) end.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [messages.length]);
  const send = question => {
    const value = (question ?? input).trim();
    if (!value || value.length > 2000) return;
    const answer = analyzeChat(value, context, month);
    setMessages(previous => [...previous, { role: 'user', content: value }, { role: 'assistant', answer }]);
    setContext(answer.context);
    setInput('');
    textarea.current?.focus();
  };
  const latest = messages.at(-1)?.answer;
  return <section className={`bd-data-chat${messages.length ? ' has-messages' : ''}`} aria-label="AI 데이터챗">
    <h1 className="bd-sr-only">AI 데이터챗</h1>
    <div className="bd-data-chat-feed" aria-label="대화 내용">
      {!messages.length ? <div className="bd-data-chat-welcome"><div className="bd-data-chat-logos"><strong>saramin</strong><i /><img src={blueorangeLogo} alt="blueorange" /></div><h2>안녕하세요. 무엇을 도와드릴까요?</h2><p>브랜드별 광고 성과부터 경쟁 서비스의 트래픽까지 질문해 보세요.</p><div className="bd-data-chat-questions">{CHAT_QUESTIONS.map((question, index) => <button key={question} onClick={() => send(question)}><span className="material-symbols-outlined" aria-hidden="true">{['account_balance_wallet', 'conversion_path', 'bar_chart', 'trending_up'][index]}</span><strong>{question}</strong><small>즉시 물어보기 <span aria-hidden="true">↗</span></small></button>)}</div></div> : <div className="bd-data-chat-messages">{messages.map((message, index) => message.role === 'user' ? <article key={index} className="bd-data-chat-user"><span className="bd-sr-only">사용자 질문</span><p>{message.content}</p></article> : <article key={index} className="bd-data-chat-answer"><div className="bd-data-chat-author"><span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span><strong>saramin Data Chat</strong></div><h2>{message.answer.title}</h2>{message.answer.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}{message.answer.table && <div className="bd-data-chat-table"><table><thead><tr>{message.answer.table.headers.map((header, i) => <th key={i}>{header}</th>)}</tr></thead><tbody>{message.answer.table.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}<div className="bd-data-chat-source">분석 기준: {message.answer.source}</div></article>)}<div ref={end} /></div>}
    </div>
    <div className="bd-data-chat-composer-wrap">{latest && <div className="bd-data-chat-followups" aria-label="후속 질문">{latest.suggestions.map(question => <button key={question} onClick={() => send(question)}>{question}</button>)}</div>}<form className="bd-data-chat-composer" onSubmit={event => { event.preventDefault(); send(); }}><label className="bd-sr-only" htmlFor="saramin-chat-input">데이터 질문</label><textarea id="saramin-chat-input" ref={textarea} rows={2} maxLength={2000} value={input} onChange={event => setInput(event.target.value)} placeholder="사람인 데이터에 대해 물어보세요" onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); send(); } }} /><div className="bd-data-chat-compose-actions"><span>Enter 전송 · Shift + Enter 줄바꿈</span><button type="submit" disabled={!input.trim()} aria-label="메시지 보내기"><span className="material-symbols-outlined" aria-hidden="true">arrow_upward</span></button></div></form><p className="bd-data-chat-hint">현재 대시보드에 포함된 데이터를 계산해 답변합니다. 외부 데이터 조회는 수행하지 않습니다.</p><div className="bd-sr-only" role="status">{latest ? `${latest.title}. 답변이 생성되었습니다.` : ''}</div></div>
  </section>;
}
