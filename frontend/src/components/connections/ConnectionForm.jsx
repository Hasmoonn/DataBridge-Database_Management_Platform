import { useState } from 'react';
import { ChevronDown, ChevronUp, Zap, Save, X } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Toggle from '../common/Toggle';
import Button from '../common/Button';
import clsx from 'clsx';

const DB_TYPES = [
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
];

const DEFAULT_PORTS = { postgresql: 5432, mysql: 3306 };

const defaultForm = {
  name: '',
  description: '',
  db_type: 'postgresql',
  host: '',
  port: 5432,
  database_name: '',
  username: '',
  password: '',
  use_ssl: true,
};

const ConnectionForm = ({
  initialData,
  onSubmit,
  onTest,
  onCancel,
  isEdit = false,
}) => {
  const [form, setForm] = useState({
    ...defaultForm,
    ...(initialData || {}),
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
      };
      if (name === 'db_type') {
        updated.port = DEFAULT_PORTS[value] || prev.port;
      }
      return updated;
    });
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    setTestResult(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Connection name is required';
    if (!form.host.trim()) errs.host = 'Host is required';
    if (!form.port) errs.port = 'Port is required';
    if (!form.database_name.trim())
      errs.database_name = 'Database name is required';
    if (!form.username.trim()) errs.username = 'Username is required';
    if (!isEdit && !form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    const payload = { ...form };
    if (isEdit && !payload.password) delete payload.password;
    await onSubmit(payload);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* DB Type Selector */}
      <div className="bg-[#14213d] rounded-xl border border-white/8 p-4 sm:p-6 mb-5">
        <h3 className="text-sm font-semibold text-white mb-4">Database Type</h3>
        <div className="grid grid-cols-2 gap-3">
          {DB_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() =>
                handleChange({
                  target: { name: 'db_type', value: type.value, type: 'text' },
                })
              }
              className={clsx(
                'relative p-4 rounded-xl border text-left transition-all duration-150',
                form.db_type === type.value
                  ? 'border-[#fca311] bg-[#fca311]/6'
                  : 'border-white/8 bg-black/20 hover:border-white/20'
              )}
            >
              {form.db_type === type.value && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#fca311]" />
              )}
              <div
                className="text-lg font-bold font-mono mb-1"
                style={{
                  color: type.value === 'postgresql' ? '#4a90d9' : '#e87511',
                }}
              >
                #{type.value === 'postgresql' ? 'PG' : 'MY'}
              </div>
              <div className="text-sm font-semibold text-white">{type.label}</div>
              <div className="text-xs text-[#e5e5e5]/50 mt-0.5">
                {type.value === 'postgresql'
                  ? 'Open-source relational'
                  : 'Popular web database'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Connection Details */}
      <div className="bg-[#14213d] rounded-xl border border-white/8 p-4 sm:p-6 mb-5">
        <h3 className="text-sm font-semibold text-white mb-4">
          Connection Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Connection Name *"
              name="name"
              placeholder="My Production DB"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Description"
              name="description"
              placeholder="Optional description"
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <Input
            label="Host *"
            name="host"
            placeholder="db.example.com"
            value={form.host}
            onChange={handleChange}
            error={errors.host}
          />
          <Input
            label="Port *"
            name="port"
            type="number"
            placeholder="5432"
            value={form.port}
            onChange={handleChange}
            error={errors.port}
          />
          <Input
            label="Database Name *"
            name="database_name"
            placeholder="my_database"
            value={form.database_name}
            onChange={handleChange}
            error={errors.database_name}
          />
          <Input
            label="Username *"
            name="username"
            placeholder="db_user"
            value={form.username}
            onChange={handleChange}
            error={errors.username}
          />
          <div className="sm:col-span-2">
            <Input
              label={isEdit ? 'Password (leave blank to keep)' : 'Password *'}
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
            />
          </div>
          <div className="sm:col-span-2 pt-2">
            <Toggle
              enabled={form.use_ssl}
              onChange={(v) => setForm((p) => ({ ...p, use_ssl: v }))}
              label="Use SSL"
              description="Encrypt connection using SSL/TLS"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-2 text-sm text-[#e5e5e5]/50 hover:text-white mt-4 transition-colors"
        >
          {showAdvanced ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          Advanced Options
        </button>

        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-white/8">
            <p className="text-xs text-[#e5e5e5]/40">
              Additional advanced options coming soon.
            </p>
          </div>
        )}
      </div>

      {testResult && (
        <div
          className={clsx(
            'rounded-xl border p-4 mb-5 flex items-center gap-3',
            testResult === 'success'
              ? 'border-[#22c55e]/30 bg-[#22c55e]/8'
              : 'border-[#ef4444]/30 bg-[#ef4444]/8'
          )}
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
              backgroundColor:
                testResult === 'success' ? '#22c55e' : '#ef4444',
            }}
          />
          <p
            className="text-sm font-medium"
            style={{
              color: testResult === 'success' ? '#22c55e' : '#ef4444',
            }}
          >
            {testResult === 'success'
              ? 'Connection test successful!'
              : 'Connection test failed. Please verify your credentials.'}
          </p>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          <X size={15} className="mr-1.5" />
          Cancel
        </Button>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button type="submit" loading={loading} className="w-full sm:w-auto">
            <Save size={15} className="mr-1.5" />
            {isEdit ? 'Save Changes' : 'Create Connection'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ConnectionForm;