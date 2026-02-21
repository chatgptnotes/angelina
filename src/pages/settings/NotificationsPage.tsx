import React from 'react';
import { Bell, Check, CheckCheck, Share2, MessageSquare, UserPlus, Info } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  project_shared: <Share2 className="w-4 h-4 text-blue-500" />,
  comment: <MessageSquare className="w-4 h-4 text-green-500" />,
  approval: <Check className="w-4 h-4 text-purple-500" />,
  team_invite: <UserPlus className="w-4 h-4 text-orange-500" />,
  system: <Info className="w-4 h-4 text-gray-500" />,
};

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-angelina-500" /> Notifications
          {unreadCount > 0 && <span className="bg-angelina-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
        </h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-sm text-angelina-600 hover:text-angelina-700">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No notifications</p>
          </div>
        ) : notifications.map(n => (
          <div key={n.id} className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-angelina-50/50' : ''}`} onClick={() => !n.read && markAsRead(n.id)}>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              {TYPE_ICONS[n.type] || TYPE_ICONS.system}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${!n.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
              {n.message && <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-400">{timeAgo(n.created_at)}</span>
              {!n.read && <div className="w-2 h-2 rounded-full bg-angelina-500" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
