import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Shield, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import type { OrgMember } from '../../types/saas';
import toast from 'react-hot-toast';

const ROLE_LABELS: Record<string, string> = { owner: 'Owner', admin: 'Admin', editor: 'Editor', viewer: 'Viewer' };
const ROLE_COLORS: Record<string, string> = { owner: 'bg-purple-100 text-purple-700', admin: 'bg-blue-100 text-blue-700', editor: 'bg-green-100 text-green-700', viewer: 'bg-gray-100 text-gray-700' };

const TeamPage: React.FC = () => {
  const { organization, user } = useAuth();
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (organization) loadMembers();
  }, [organization]);

  const loadMembers = async () => {
    if (!organization) return;
    try {
      const { data } = await supabase.from('org_members').select('*').eq('org_id', organization.id);
      setMembers((data || []) as OrgMember[]);
    } catch { /* */ }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !user) return;
    setLoading(true);
    try {
      await supabase.from('org_members').insert({
        org_id: organization.id, user_id: user.id, role: inviteRole,
        invited_by: user.id, invited_email: inviteEmail, status: 'pending'
      });
      await supabase.from('notifications').insert({
        user_id: user.id, type: 'team_invite', title: 'Team Invitation',
        message: `You've been invited to join ${organization.name}`, data: { org_id: organization.id }
      });
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      loadMembers();
    } catch { toast.error('Failed to invite'); }
    setLoading(false);
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remove this member?')) return;
    await supabase.from('org_members').delete().eq('id', memberId);
    toast.success('Member removed');
    loadMembers();
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    await supabase.from('org_members').update({ role: newRole }).eq('id', memberId);
    toast.success('Role updated');
    loadMembers();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" /> {members.length} members
        </div>
      </div>

      {/* Invite */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5" /> Invite Team Member
        </h2>
        <form onSubmit={handleInvite} className="flex gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required placeholder="colleague@company.com" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" />
          </div>
          <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent">
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-angelina-600 text-white rounded-lg font-medium hover:bg-angelina-700 disabled:opacity-50">
            {loading ? 'Sending...' : 'Invite'}
          </button>
        </form>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {members.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No team members yet. Invite your first teammate!</p>
          </div>
        ) : members.map(member => (
          <div key={member.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-angelina-100 flex items-center justify-center text-angelina-600 font-medium">
                {(member.invited_email || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{member.invited_email || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{member.status === 'pending' ? 'Invitation pending' : `Joined ${new Date(member.joined_at).toLocaleDateString()}`}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {member.role === 'owner' ? (
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[member.role]}`}>
                  <Shield className="w-3 h-3 inline mr-1" />{ROLE_LABELS[member.role]}
                </span>
              ) : (
                <select value={member.role} onChange={e => handleRoleChange(member.id, e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2 py-1">
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              )}
              {member.role !== 'owner' && (
                <button onClick={() => handleRemove(member.id)} className="p-1 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Org Settings */}
      {organization && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization Settings</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input defaultValue={organization.name} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input defaultValue={organization.address || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" placeholder="Used in PDF exports" />
            </div>
          </div>
          <button className="mt-4 px-6 py-2.5 bg-angelina-600 text-white rounded-lg font-medium hover:bg-angelina-700">Save Organization</button>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
