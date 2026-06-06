import { useState } from 'react';
import { User, Shield, Bell, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Toggle from '../../components/common/Toggle';
import { authAPI } from '../../api/endpoints';
import { toast } from 'react-toastify';
import clsx from 'clsx';

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'general', label: 'General', icon: SettingsIcon },
];

const SettingsSection = ({ title, description, children, footer }) => (
  <div className="bg-[#14213d] rounded-xl border border-white/8 overflow-hidden">
    <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/8">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && (
        <p className="text-sm text-[#e5e5e5]/60 mt-1">{description}</p>
      )}
    </div>

    <div className="px-4 sm:px-6 py-4 sm:py-5">{children}</div>

    {footer && (
      <div className="px-4 sm:px-6 py-4 border-t border-white/8 bg-black/10 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
        {footer}
      </div>
    )}
  </div>
);

const SettingsToggleRow = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 border-b border-white/6 last:border-b-0">
    <div className="min-w-0 flex-1 pr-2">
      <p className="text-sm font-medium text-white">{label}</p>
      {description && (
        <p className="text-xs text-[#e5e5e5]/50 mt-0.5 leading-relaxed">
          {description}
        </p>
      )}
    </div>
    <Toggle enabled={enabled} onChange={onChange} className="flex-shrink-0" />
  </div>
);

const SettingsPage = () => {
  const { user } = useAuth();
  const [active, setActive] = useState('profile');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 sm:gap-6 items-start">
        {/* Section navigation */}
        <aside className="md:sticky md:top-6">
          <nav
            className="bg-[#14213d] rounded-xl border border-white/8 p-1.5 sm:p-2 grid grid-cols-2 md:grid-cols-1 gap-1"
            aria-label="Settings sections"
          >
            {sections.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActive(s.id)}
                  className={clsx(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left',
                    isActive
                      ? 'bg-[#fca311]/10 text-white shadow-[inset_0_0_0_1px_rgba(252,163,17,0.25)] md:border-l-[3px] md:border-[#fca311] md:pl-[calc(0.75rem-3px)]'
                      : 'text-[#e5e5e5]/70 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent md:pl-3'
                  )}
                >
                  <Icon
                    size={16}
                    className={clsx(
                      'flex-shrink-0',
                      isActive ? 'text-[#fca311]' : 'text-[#e5e5e5]/50'
                    )}
                  />
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content panel */}
        <div className="min-w-0">
          {active === 'profile' && <ProfileSection user={user} />}
          {active === 'security' && <SecuritySection />}
          {active === 'notifications' && <NotificationsSection />}
          {active === 'general' && <GeneralSection />}
        </div>
      </div>
    </div>
  );
};

const ProfileSection = ({ user }) => {
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile(form);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      title="Profile"
      description="Update your personal account information."
      footer={
        <Button onClick={handleSave} loading={saving} className="w-full sm:w-auto">
          Save Changes
        </Button>
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 mb-5 border-b border-white/8">
        <div className="w-16 h-16 rounded-full bg-[#fca311]/20 border-2 border-[#fca311]/30 flex items-center justify-center text-2xl font-bold text-[#fca311] flex-shrink-0 mx-auto sm:mx-0">
          {(user?.username || 'U')[0].toUpperCase()}
        </div>
        <div className="text-center sm:text-left min-w-0">
          <p className="text-sm text-white font-medium truncate">
            {user?.username}
          </p>
          <p className="text-xs text-[#e5e5e5]/60 truncate">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-4 max-w-lg">
        <Input
          label="Username"
          name="username"
          value={form.username}
          onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
      </div>
    </SettingsSection>
  );
};

const SecuritySection = () => (
  <SettingsSection
    title="Security"
    description="Manage your password and account security."
    footer={
      <Button className="w-full sm:w-auto">Update Password</Button>
    }
  >
    <div className="space-y-4 max-w-lg">
      <Input label="Current Password" name="current_password" type="password" placeholder="••••••••" />
      <Input label="New Password" name="new_password" type="password" placeholder="••••••••" />
      <Input label="Confirm New Password" name="confirm_password" type="password" placeholder="••••••••" />
    </div>
  </SettingsSection>
);

const NotificationsSection = () => {
  const [transferDone, setTransferDone] = useState(true);
  const [transferFail, setTransferFail] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  return (
    <SettingsSection
      title="Notifications"
      description="Choose which email alerts you want to receive."
    >
      <div className="-my-1">
        <SettingsToggleRow
          label="Transfer completed"
          description="Email me when a transfer completes successfully."
          enabled={transferDone}
          onChange={setTransferDone}
        />
        <SettingsToggleRow
          label="Transfer failed"
          description="Email me when a transfer fails or is interrupted."
          enabled={transferFail}
          onChange={setTransferFail}
        />
        <SettingsToggleRow
          label="Weekly summary"
          description="Receive a weekly activity report every Monday."
          enabled={weeklyReport}
          onChange={setWeeklyReport}
        />
      </div>
    </SettingsSection>
  );
};

const GeneralSection = () => (
  <SettingsSection
    title="General"
    description="Default preferences for transfers and connections."
  >
    <div className="space-y-5 max-w-lg">
      <Input label="Default Batch Size" name="batch_size" type="number" defaultValue={1000} />
      <Input
        label="Default Connection Timeout (seconds)"
        name="connection_timeout"
        type="number"
        defaultValue={30}
      />

      <div>
        <label className="text-xs font-medium text-[#e5e5e5]/80 uppercase tracking-wider block mb-2">
          Theme
        </label>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <button
            type="button"
            className="px-4 py-2.5 rounded-lg bg-[#fca311] text-black text-sm font-medium w-full sm:w-auto text-center"
          >
            Dark
          </button>
          <button
            type="button"
            disabled
            className="px-4 py-2.5 rounded-lg border border-white/8 text-white/30 text-sm cursor-not-allowed w-full sm:w-auto text-center"
          >
            Light (coming soon)
          </button>
        </div>
      </div>
    </div>
  </SettingsSection>
);

export default SettingsPage;
