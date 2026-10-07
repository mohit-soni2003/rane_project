import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaUser, FaTrash, FaDatabase, FaChevronDown, FaChevronUp, FaLock, FaUnlockAlt } from 'react-icons/fa';
import { askAdminChat } from '../../../services/adminChatService';

const C = {
    primary: '#6b3e2b',
    accent: '#b95a52',
    destructive: '#c94a3a',
    muted: '#8b7b74',
};

// Premium-gate code — checked entirely client-side, on this page only
// (no backend call). Session-only: re-entering the page in a new tab or
// after closing the browser asks again, but navigating within the same
// tab session doesn't.
const ACCESS_CODE = '1304203';
const SESSION_KEY = 'admin_chatbot_unlocked';

const moduleCardStyle = {
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
    boxShadow: '0 2px 8px var(--shadow-color)', overflow: 'hidden',
    display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)',
};
const headerStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px', borderBottom: '1px solid var(--border)',
};
const messagesAreaStyle = { flex: 1, overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 };
const bubbleBaseStyle = {
    maxWidth: '75%', padding: '10px 14px', borderRadius: 12, fontSize: 13.5, lineHeight: 1.5, whiteSpace: 'pre-wrap',
};
const userBubbleStyle = { ...bubbleBaseStyle, background: 'var(--primary)', color: '#fff', alignSelf: 'flex-end', borderBottomRightRadius: 4 };
const botBubbleStyle = { ...bubbleBaseStyle, background: 'var(--input)', color: 'var(--foreground)', alignSelf: 'flex-start', borderBottomLeftRadius: 4 };
const inputRowStyle = { display: 'flex', gap: 10, padding: '14px 18px', borderTop: '1px solid var(--border)' };
const textInputStyle = {
    flex: 1, border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px',
    fontSize: 13.5, color: 'var(--foreground)', background: 'var(--input)', outline: 'none', resize: 'none',
};
const sendButtonStyle = (disabled) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: 8,
    border: 'none', background: 'var(--primary)', color: '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1, flexShrink: 0,
});
const clearButtonStyle = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
};
const lockScreenStyle = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    flex: 1, gap: 14, padding: '20px',
};
const lockInputStyle = {
    border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px',
    fontSize: 15, letterSpacing: '0.15em', textAlign: 'center', color: 'var(--foreground)',
    background: 'var(--input)', outline: 'none', width: 220,
};
const unlockButtonStyle = (disabled) => ({
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8,
    border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 13.5, fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
});
const toolLogToggleStyle = {
    display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: 'var(--text-muted)',
    marginTop: 6, cursor: 'pointer', fontWeight: 600,
};
const toolLogBoxStyle = {
    marginTop: 6, padding: '8px 10px', background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)',
};

// Safety net: if the model still sends markdown, turn it into clean plain text
// (this chat bubble shows text as-is, so symbols like ** or | would look broken).
function cleanAnswer(text) {
    if (!text) return '';
    return text
        .split('\n')
        .map((line) => {
            // table separator rows like |---|---|
            if (/^\s*\|?[\s:|-]{3,}\|?\s*$/.test(line) && line.includes('-')) return null;
            // table rows → "a – b – c"
            if (/^\s*\|.*\|\s*$/.test(line)) {
                return line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()).filter(Boolean).join(' – ');
            }
            return line
                .replace(/^\s{0,3}#{1,6}\s*/, '')       // headings
                .replace(/^\s*[-*+]\s+/, '• ')          // bullets
                .replace(/\*\*(.+?)\*\*/g, '$1')        // bold
                .replace(/__(.+?)__/g, '$1')
                .replace(/(^|[\s(])\*(\S[^*]*?)\*(?=[\s).,!?]|$)/g, '$1$2') // italics
                .replace(/`([^`]+)`/g, '$1');           // inline code
        })
        .filter((line) => line !== null)
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function ToolLog({ log }) {
    const [open, setOpen] = useState(false);
    if (!log || log.length === 0) return null;
    return (
        <div>
            <div style={toolLogToggleStyle} onClick={() => setOpen((o) => !o)}>
                <FaDatabase size={10} /> {log.length} DB call{log.length === 1 ? '' : 's'}
                {open ? <FaChevronUp size={9} /> : <FaChevronDown size={9} />}
            </div>
            {open && (
                <div style={toolLogBoxStyle}>
                    {log.map((entry, i) => (
                        <div key={i} style={{ marginBottom: i < log.length - 1 ? 6 : 0 }}>
                            <strong>{entry.tool}</strong>({JSON.stringify(entry.args)}) → {JSON.stringify(entry.resultSummary)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminChatBot() {
    // Premium access gate — checked once per browser tab session. Nothing
    // is sent to the server for this check; it's a simple client-side
    // gate on this page only, as requested.
    const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true');
    const [codeInput, setCodeInput] = useState('');
    const [codeError, setCodeError] = useState('');

    const handleUnlock = () => {
        if (codeInput.trim() === ACCESS_CODE) {
            sessionStorage.setItem(SESSION_KEY, 'true');
            setUnlocked(true);
            setCodeError('');
        } else {
            setCodeError('Incorrect code.');
        }
    };

    const handleCodeKeyDown = (e) => {
        if (e.key === 'Enter') handleUnlock();
    };

    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Ask me anything about the data in the system — projects, bills, tasks, users, and so on. I can only look things up, never change them.' },
    ]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || sending) return;

        setMessages((prev) => [...prev, { role: 'user', text }]);
        setInput('');
        setSending(true);
        setError('');

        try {
            const { answer, toolCallLog } = await askAdminChat(text);
            setMessages((prev) => [...prev, { role: 'bot', text: answer, toolCallLog }]);
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClear = async () => {
        try {
            await askAdminChat('', { reset: true }).catch(() => {});
        } finally {
            setMessages([
                { role: 'bot', text: 'Started a new conversation. What would you like to know?' },
            ]);
            setError('');
        }
    };

    if (!unlocked) {
        return (
            <div style={moduleCardStyle}>
                <div style={lockScreenStyle}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12, background: 'var(--warning)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <FaLock size={20} color={C.primary} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)' }}>
                        Premium Feature
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 280 }}>
                        The Database Assistant is a premium feature. Enter the access code to continue.
                    </div>
                    <input
                        type="password"
                        placeholder="Access code"
                        value={codeInput}
                        onChange={(e) => { setCodeInput(e.target.value); setCodeError(''); }}
                        onKeyDown={handleCodeKeyDown}
                        style={lockInputStyle}
                        autoFocus
                    />
                    {codeError && <div style={{ fontSize: 12, color: C.destructive }}>{codeError}</div>}
                    <button onClick={handleUnlock} disabled={!codeInput.trim()} style={unlockButtonStyle(!codeInput.trim())}>
                        <FaUnlockAlt size={13} /> Unlock
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={moduleCardStyle}>
            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 8, background: 'var(--warning)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <FaRobot size={16} color={C.primary} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)' }}>
                        Database Assistant
                    </div>
                </div>
                <button onClick={handleClear} style={clearButtonStyle}>
                    <FaTrash size={11} /> New chat
                </button>
            </div>

            <div ref={scrollRef} style={messagesAreaStyle}>
                {messages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                            <div style={{
                                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: m.role === 'user' ? 'var(--secondary)' : 'var(--warning)',
                            }}>
                                {m.role === 'user' ? <FaUser size={11} color="var(--secondary-foreground)" /> : <FaRobot size={12} color={C.primary} />}
                            </div>
                            <div style={m.role === 'user' ? userBubbleStyle : botBubbleStyle}>
                                {m.role === 'bot' ? cleanAnswer(m.text) : m.text}
                            </div>
                        </div>
                        {m.role === 'bot' && <div style={{ marginLeft: 34 }}><ToolLog log={m.toolCallLog} /></div>}
                    </div>
                ))}
                {sending && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--warning)',
                        }}>
                            <FaRobot size={12} color={C.primary} />
                        </div>
                        <div style={botBubbleStyle}>Thinking…</div>
                    </div>
                )}
            </div>

            {error && (
                <div style={{ padding: '0 18px 8px', fontSize: 12, color: C.destructive }}>{error}</div>
            )}

            <div style={inputRowStyle}>
                <textarea
                    rows={1}
                    placeholder="Ask about projects, bills, tasks, users…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={textInputStyle}
                    disabled={sending}
                />
                <button onClick={handleSend} disabled={sending || !input.trim()} style={sendButtonStyle(sending || !input.trim())}>
                    <FaPaperPlane size={14} />
                </button>
            </div>
        </div>
    );
}