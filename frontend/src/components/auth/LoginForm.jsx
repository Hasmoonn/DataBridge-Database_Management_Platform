import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../common/Input';
import Button from '../common/Button';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errs.email = 'Enter a valid email address';
    if (!formData.password) errs.password = 'Password is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5" noValidate>
      {/* Email */}
      <Input
        label="Email address"
        type="email"
        name="email"
        placeholder="you@company.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
        disabled={loading}
      />

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#e5e5e5]">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            disabled={loading}
            className={`
              w-full px-4 py-2.5 pr-11 rounded-lg text-sm
              bg-white/5 border text-white placeholder-white/30
              focus:outline-none focus:ring-[3px] focus:ring-[#fca311]/15 focus:border-[#fca311]
              transition-all duration-200 disabled:opacity-50
              ${errors.password ? 'border-[#ef4444]' : 'border-white/12 hover:border-white/20'}
            `}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e5e5e5]/50 hover:text-[#fca311] transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-[#ef4444] flex items-center gap-1">
            <span>⚠</span> {errors.password}
          </p>
        )}
      </div>

      {/* Remember me + Forgot password */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`
                w-4 h-4 rounded border flex items-center justify-center transition-all duration-150
                ${rememberMe
                  ? 'bg-[#fca311] border-[#fca311]'
                  : 'border-white/30 bg-transparent group-hover:border-white/50'}
              `}
            >
              {rememberMe && (
                <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-[#e5e5e5]/70">Remember me</span>
        </label>
        <Link
          to="/forgot-password"
          className="text-sm text-[#fca311] hover:text-[#fca311]/80 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        fullWidth
        loading={loading}
        rightIcon={!loading && <ArrowRight size={16} />}
        className="mt-2"
      >
        Sign In
      </Button>

      {/* Divider */}
      <div className="relative flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-xs text-[#e5e5e5]/40">or continue with</span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* OAuth buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          {
            name: 'Google',
            icon: (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            ),
          },
          {
            name: 'GitHub',
            icon: (
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            ),
          },
        ].map((provider) => (
          <button
            key={provider.name}
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/12 text-sm text-[#e5e5e5] hover:border-white/25 hover:bg-white/5 transition-all duration-200"
          >
            {provider.icon}
            {provider.name}
          </button>
        ))}
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-[#e5e5e5]/60">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="text-[#fca311] hover:text-[#fca311]/80 font-medium transition-colors"
        >
          Create one
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;