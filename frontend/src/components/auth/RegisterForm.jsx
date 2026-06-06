import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'data_engineer', label: 'Data Engineer' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'viewer', label: 'Viewer' },
];

const getPasswordStrength = (password) => {
  if (!password) 
    return 0;

  let strength = 0;
  
  if (password.length >= 8) 
    strength++;
  if (/[A-Z]/.test(password)) 
    strength++;
  if (/[0-9]/.test(password)) 
    strength++;
  if (/[^A-Za-z0-9]/.test(password)) 
    strength++;

  return strength;
};

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', '#ef4444', '#f59e0b', '#fca311', '#22c55e'];

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const passwordStrength = getPasswordStrength(formData.password);

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim()) 
      errs.full_name = 'Full name is required';

    if (!formData.email) 
      errs.email = 'Email is required';

    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errs.email = 'Enter a valid email address';
    if (!formData.password) 
      errs.password = 'Password is required';
    else if (formData.password.length < 8)
      errs.password = 'Password must be at least 8 characters';
    if (!formData.confirm_password)
      errs.confirm_password = 'Please confirm your password';
    else if (formData.password !== formData.confirm_password)
      errs.confirm_password = 'Passwords do not match';
    if (!formData.role) 
      errs.role = 'Please select a role';
    if (!agreed) 
      errs.agreed = 'You must agree to the Terms of Service';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) 
      setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);

    const payload = {
      username: formData.full_name.trim().replace(/\s+/g, '_').toLowerCase(),
      email: formData.email,
      password: formData.password,
      password2: formData.confirm_password,
    };

    const result = await register(payload);
    setLoading(false);
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>
      {/* Full Name */}
      <Input
        label="Full name"
        type="text"
        name="full_name"
        placeholder="John Smith"
        value={formData.full_name}
        onChange={handleChange}
        error={errors.full_name}
        autoComplete="name"
        disabled={loading}
      />

      {/* Email */}
      <Input
        label="Work email"
        type="email"
        name="email"
        placeholder="you@company.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
        disabled={loading}
      />

      {/* Password + Strength */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#e5e5e5]">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Min. 8 characters"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
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
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {/* Strength bar */}
        {formData.password && (
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    level <= passwordStrength
                      ? strengthColors[passwordStrength]
                      : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
            <span
              className="text-xs ml-1 font-medium"
              style={{ color: strengthColors[passwordStrength] }}
            >
              {strengthLabels[passwordStrength]}
            </span>
          </div>
        )}
        {errors.password && (
          <p className="text-xs text-[#ef4444] flex items-center gap-1">
            <span>⚠</span> {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#e5e5e5]">
          Confirm password
        </label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            name="confirm_password"
            placeholder="••••••••"
            value={formData.confirm_password}
            onChange={handleChange}
            autoComplete="new-password"
            disabled={loading}
            className={`
              w-full px-4 py-2.5 pr-11 rounded-lg text-sm
              bg-white/5 border text-white placeholder-white/30
              focus:outline-none focus:ring-[3px] focus:ring-[#fca311]/15 focus:border-[#fca311]
              transition-all duration-200 disabled:opacity-50
              ${errors.confirm_password ? 'border-[#ef4444]' : 'border-white/12 hover:border-white/20'}
            `}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e5e5e5]/50 hover:text-[#fca311] transition-colors"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirm_password && (
          <p className="text-xs text-[#ef4444] flex items-center gap-1">
            <span>⚠</span> {errors.confirm_password}
          </p>
        )}
      </div>

      {/* Role */}
      <Select
        label="Your role"
        name="role"
        options={roleOptions}
        placeholder="Select your role"
        value={formData.role}
        onChange={handleChange}
        error={errors.role}
        disabled={loading}
      />

      {/* Terms */}
      <div>
        <label className="flex items-start gap-2 cursor-pointer group">
          <div className="relative mt-0.5 flex-shrink-0">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                if (errors.agreed) setErrors((p) => ({ ...p, agreed: '' }));
              }}
              className="sr-only"
            />
            <div
              className={`
                w-4 h-4 rounded border flex items-center justify-center transition-all duration-150
                ${agreed
                  ? 'bg-[#fca311] border-[#fca311]'
                  : 'border-white/30 bg-transparent group-hover:border-white/50'}
                ${errors.agreed ? 'border-[#ef4444]' : ''}
              `}
            >
              {agreed && (
                <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-[#e5e5e5]/70 leading-relaxed">
            I agree to the{' '}
            <span className="text-[#fca311] hover:underline cursor-pointer">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="text-[#fca311] hover:underline cursor-pointer">
              Privacy Policy
            </span>
          </span>
        </label>
        {errors.agreed && (
          <p className="text-xs text-[#ef4444] mt-1 flex items-center gap-1 ml-6">
            <span>⚠</span> {errors.agreed}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        fullWidth
        loading={loading}
        rightIcon={!loading && <ArrowRight size={16} />}
      >
        Create Account
      </Button>

      {/* Login link */}
      <p className="text-center text-sm text-[#e5e5e5]/60">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-[#fca311] hover:text-[#fca311]/80 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;