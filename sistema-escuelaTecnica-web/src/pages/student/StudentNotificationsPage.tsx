import React, { useEffect } from 'react';
import { useNotificationStore } from '../../store/notification.store';
import { Bell, Check, Mail, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const StudentNotificationsPage: React.FC = () => {
    const { 
        notifications, 
        unreadCount, 
        loading, 
        fetchNotifications, 
        markAsRead, 
        markAllAsRead 
    } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = (id: number) => {
        markAsRead(id);
    };

    const handleMarkAllRead = () => {
        markAllAsRead();
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-[#004694] flex items-center gap-3">
                        <Bell className="text-blue-500" />
                        Mis Notificaciones
                    </h1>
                    <p className="text-gray-500 mt-1">Mantente al día con tus anuncios académicos.</p>
                </div>
                {unreadCount > 0 && (
                    <button 
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm w-full md:w-auto justify-center"
                    >
                        <Check size={16} />
                        Marcar todo como leído
                    </button>
                )}
            </header>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Cargando notificaciones...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Mail size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Estás al día</h3>
                        <p className="text-gray-500">No tienes notificaciones nuevas.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {notifications.map((notification) => (
                            <div 
                                key={notification.id} 
                                className={`
                                    relative p-6 rounded-xl border transition-all duration-200 group
                                    ${!notification.isRead 
                                        ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100' 
                                        : 'bg-gray-50 border-gray-100 opacity-75 hover:opacity-100'}
                                `}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {!notification.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-blue-500 block animate-pulse"></span>
                                            )}
                                            <h3 className={`font-bold text-lg ${!notification.isRead ? 'text-[#004694]' : 'text-gray-700'}`}>
                                                {notification.title}
                                            </h3>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed mb-3">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: es })}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded uppercase ${
                                                notification.type === 'RISK_ALERT' ? 'bg-red-100 text-red-600' :
                                                notification.type === 'TOP_PERFORMANCE' ? 'bg-green-100 text-green-600' :
                                                'bg-gray-100 text-gray-500'
                                            }`}>
                                                {notification.type === 'RISK_ALERT' ? 'Alerta' : 
                                                 notification.type === 'TOP_PERFORMANCE' ? 'Felicito' : 'Info'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {!notification.isRead && (
                                        <button 
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Marcar como leída"
                                        >
                                            <Check size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentNotificationsPage;
