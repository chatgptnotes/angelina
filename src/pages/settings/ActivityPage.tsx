import React, { useState, useEffect } from 'react';
import { Activity, Filter, Calendar, User } from 'lucide-react';
import { ActivityService } from '../../services/activityService';
import { useAuth } from '../../contexts/AuthContext';
import type { ActivityLogEntry } from '../../types/saas';

const ACTION_ICONS: Record<string, string> = {
  project_created: '📁', item_edited: '✏️', boq_exported: '📤', member_invited: '👥',
  project_shared: '🔗', comment_added: '💬', approval: '✅', login: '🔑',
};

const ActivityPage: React.FC = () => {
  const { organization } = useAuth();
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  useEffect(() => { load(); }, [organization, filterAction, filterFrom, filterTo]);

  const load = async () => {
    setLoading(true);
    const data = await ActivityService.getActivities({
      orgId: organization?.id,
      action: filterAction || undefined,
      from: filterFrom || undefined,
      to: filterTo || undefined,
      limit: 100
    });
    setActivities(data);
    setLoading(false);
  };

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
          <Activity className="w-6 h-6 text-angelina-500" /> Activity Log
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-gray-400" />
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-angelina-500 focus:border-transparent">
          <option value="">All actions</option>
          <option value="project_created">Project Created</option>
          <option value="item_edited">Item Edited</option>
          <option value="boq_exported">BOQ Exported</option>
          <option value="member_invited">Member Invited</option>
          <option value="project_shared">Project Shared</option>
        </select>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2" />
          <span className="text-gray-400">to</span>
          <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2" />
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No activities yet</p>
          </div>
        ) : activities.map(a => (
          <div key={a.id} className="flex items-start gap-3 p-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">
              {ACTION_ICONS[a.action] || '📋'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{a.action.replace(/_/g, ' ')}</span>
                {a.entity_type && <span className="text-gray-500"> on {a.entity_type}</span>}
              </p>
              {a.details && <p className="text-xs text-gray-500 mt-0.5">{JSON.stringify(a.details)}</p>}
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(a.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityPage;
