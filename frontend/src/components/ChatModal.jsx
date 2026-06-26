import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';

const ChatModal = ({ appointment, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. Fetch History
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chat/${appointment._id}`);
        setMessages(res.data.messages);
        setIsExpired(res.data.isExpired);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    // 2. Setup Socket
    socketRef.current = io('/');
    socketRef.current.emit('join-chat', appointment._id);

    socketRef.current.on('receive-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [appointment._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isExpired) return;

    socketRef.current.emit('send-message', {
      appointmentId: appointment._id,
      senderId: user._id,
      text: newMessage.trim()
    });

    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="bg-surface rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up relative"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-primary-container/20 border-b border-outline-variant/30 flex justify-between items-center">
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface">Post-Consultation Chat</h2>
            <p className="text-body-sm text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">history</span>
              Available for 72 hours post-completion
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-container-lowest">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-on-surface-variant opacity-60">
              <span className="material-symbols-outlined text-[48px] mb-2">forum</span>
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isMine = String(msg.senderId._id) === String(user._id);
                return (
                  <div key={msg._id || index} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-end gap-2 max-w-[80%]">
                      {!isMine && (
                        <img 
                          src={msg.senderId.profileImageUrl || `https://ui-avatars.com/api/?name=${msg.senderId.firstName}+${msg.senderId.lastName}`} 
                          alt="avatar" 
                          className="w-8 h-8 rounded-full shadow-sm"
                        />
                      )}
                      <div 
                        className={`p-3 rounded-2xl ${isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-surface-container text-on-surface rounded-bl-sm'}`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-on-surface-variant mt-1 px-10">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/30">
          {isExpired ? (
            <div className="bg-error-container/30 text-error p-3 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">lock</span>
              This chat is locked as the 72-hour window has expired.
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-surface border border-outline-variant rounded-full px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
