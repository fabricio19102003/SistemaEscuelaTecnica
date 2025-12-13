import { useRef, useState, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNotificationStore } from '../../store/notification.store';
import { useAuthStore } from '../../store/auth.store';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const NotificationBell = () => {
    const { 
        notifications, 
        unreadCount, 
        fetchNotifications, 
        markAsRead, 
        markAllAsRead 
    } = useNotificationStore();
    const { isAuthenticated } = useAuthStore();
    
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            // Optional: Poll every 60 seconds
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        await markAsRead(id);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 focus:outline-none"
                aria-label="Notificaciones"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full min-w-[18px]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-3 border-b flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-800">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={() => markAllAsRead()}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1"
                            >
                                <Check size={14} /> Marcar todo leído
                            </button>
                        )}
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                <Bell size={32} className="mb-2 text-gray-300" />
                                <p className="text-sm">No tienes notificaciones</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        className={`p-4 hover:bg-gray-50 transition-colors relative group ${notification.isRead ? 'opacity-70' : 'bg-blue-50/30'}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${notification.isRead ? 'bg-transparent' : 'bg-blue-500'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium text-gray-900 ${!notification.isRead && 'font-bold'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1 break-words">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: es })}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <button
                                                    onClick={(e) => handleMarkAsRead(e, notification.id)}
                                                    className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1.5 hover:bg-gray-200 rounded-full transition-all text-gray-400 hover:text-blue-600"
                                                    title="Marcar como leída"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
