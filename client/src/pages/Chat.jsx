import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadDocument, getDocuments, getDocumentStatus, deleteDocument } from '../services/documentService';
import { sendMessage, getChats, getChatById } from '../services/chatService';
import './Chat.css';

export default function Chat() {
  const { user, logout } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadDocuments();
    loadChats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // poll for documents still processing
  useEffect(() => {
    const processingDocs = documents.filter((d) => d.status !== 'ready' && d.status !== 'failed');
    if (processingDocs.length === 0) return;

    const interval = setInterval(async () => {
      for (const doc of processingDocs) {
        const updated = await getDocumentStatus(doc._id);
        setDocuments((prev) => prev.map((d) => (d._id === updated._id ? updated : d)));
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [documents]);

  const loadDocuments = async () => {
    const docs = await getDocuments();
    setDocuments(docs);
  };

  const loadChats = async () => {
    const chatList = await getChats();
    setChats(chatList);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    try {
      await uploadDocument(file, setUploadProgress);
      await loadDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!confirm('Delete this document and its data?')) return;
    await deleteDocument(id);
    await loadDocuments();
  };

  const handleSelectChat = async (id) => {
    const chat = await getChatById(id);
    setActiveChatId(chat._id);
    setMessages(chat.messages);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const data = await sendMessage(userMessage.content, activeChatId);
      setActiveChatId(data.chatId);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer, sources: data.sources },
      ]);
      loadChats();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.', sources: [] },
      ]);
    } finally {
      setSending(false);
    }
  };

  const readyDocs = documents.filter((d) => d.status === 'ready');

  return (
    <div className="chat-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-mark">
            <span className="brand-glyph" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 3.5h9l5 5V19a1.5 1.5 0 01-1.5 1.5H8.5A1.5 1.5 0 017 19V16" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M14 3.5V8h4.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </span>
            Docuchat
          </div>
        </div>

        <button className="new-chat-btn" onClick={handleNewChat}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          New chat
        </button>

        <div className="sidebar-section">
          <div className="sidebar-section-head">
            <span>Documents</span>
            <button className="upload-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? `${uploadProgress}%` : '+ Upload'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.docx,.txt"
              hidden
            />
          </div>

          <div className="doc-list">
            {documents.length === 0 && <p className="empty-hint">No documents yet</p>}
            {documents.map((doc) => (
              <div key={doc._id} className="doc-item">
                <div className="doc-item-info">
                  <span className="doc-item-name">{doc.originalName}</span>
                  <span className={`doc-status doc-status--${doc.status}`}>
                    {doc.status === 'ready' ? 'Ready' : doc.status === 'failed' ? 'Failed' : 'Processing…'}
                  </span>
                </div>
                <button className="doc-delete-btn" onClick={() => handleDeleteDocument(doc._id)} aria-label="Delete">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 12a1 1 0 001 1h6a1 1 0 001-1l1-12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-section sidebar-section--grow">
          <div className="sidebar-section-head">
            <span>Chat history</span>
          </div>
          <div className="chat-list">
            {chats.map((c) => (
              <button
                key={c._id}
                className={`chat-list-item ${c._id === activeChatId ? 'active' : ''}`}
                onClick={() => handleSelectChat(c._id)}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <span className="user-name">{user?.name}</span>
          <button className="logout-btn" onClick={logout}>Log out</button>
        </div>
      </aside>

      {/* Main chat panel */}
      <main className="chat-main">
        {messages.length === 0 && (
          <div className="chat-empty-state">
            <div className="empty-glyph" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 3.5h9l5 5V19a1.5 1.5 0 01-1.5 1.5H8.5A1.5 1.5 0 017 19V16" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M14 3.5V8h4.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </div>
            <h2>Ask your documents anything</h2>
            <p>
              {readyDocs.length === 0
                ? 'Upload a document to get started.'
                : `You have ${readyDocs.length} document${readyDocs.length > 1 ? 's' : ''} ready. Ask a question below.`}
            </p>
          </div>
        )}

        <div className="messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message message--${msg.role}`}>
              <div className="message-bubble">
                <p>{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="sources">
                    {msg.sources.map((s, j) => (
                      <span key={j} className="source-chip">
                        {s.originalName} · {(s.score * 100).toFixed(0)}%
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="message message--assistant">
              <div className="message-bubble message-bubble--loading">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSend}>
          <input
            type="text"
            placeholder={readyDocs.length === 0 ? 'Upload a document first…' : 'Ask a question about your documents…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={readyDocs.length === 0 || sending}
          />
          <button type="submit" disabled={!input.trim() || sending || readyDocs.length === 0}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 12h16M14 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </main>
    </div>
  );
}