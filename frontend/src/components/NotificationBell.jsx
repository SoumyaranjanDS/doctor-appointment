import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Socket setup
  useEffect(() => {
    if (!user) return;
    
    // Create new socket connection or use existing (we use a new one scoped for notifications here)
    const socket = io('/');
    
    // Register user to join their specific notification room
    socket.emit('register-user', user._id);
    
    socket.on('new-notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      toast.success(notification.title, { icon: '🔔' });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications');
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors relative"
      >
        <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center translate-x-1 -translate-y-1 shadow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-outline-variant/30 z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
            <h3 className="font-headline-sm font-bold text-on-surface">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-primary hover:bg-primary-container/30 px-2 py-1 rounded transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant flex flex-col items-center">
                <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">notifications_off</span>
                <p>No notifications yet.</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif._id} 
                  className={`p-3 rounded-xl transition-colors relative group ${notif.isRead ? 'bg-transparent hover:bg-surface-container-lowest' : 'bg-primary-container/20 border-l-4 border-primary'}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className={`text-sm ${notif.isRead ? 'font-medium text-on-surface-variant' : 'font-bold text-on-surface'}`}>{notif.title}</h4>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{notif.message}</p>
                      <p className="text-[10px] text-on-surface-variant/70 mt-2">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button 
                        onClick={(e) => handleMarkAsRead(notif._id, e)}
                        className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Mark as read"
                      >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
