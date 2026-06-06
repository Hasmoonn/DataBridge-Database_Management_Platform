import HeroPanel from '../../components/auth/HeroPanel';
import LoginForm from '../../components/auth/LoginForm';
import logo from '../../assets/logo.png';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      {/* Left Hero Panel — desktop only */}
      <HeroPanel />

      {/* Right Form Panel */}
      <div className="flex-1 lg:w-2/5 flex flex-col items-center justify-center p-4 sm:p-8 bg-transparent lg:bg-[#14213d] min-h-screen z-10 overflow-y-auto">
        <div className="w-full max-w-md bg-[#0a1128]/80 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border border-white/10 lg:border-none p-6 sm:p-10 lg:p-0 rounded-2xl shadow-2xl lg:shadow-none">
          
          {/* Mobile Logo */}
          <div className="flex lg:hidden justify-center mb-6">
            <img
              src={logo}
              alt="DATABRIDGE Logo"
              className="object-contain h-10 sm:h-12 w-auto"
            />
          </div>

          {/* Desktop Logo */}
          <div className="hidden lg:flex items-center gap-2 mb-8">
            <div className='relative -left-4'>
              <img
                src={logo}
                alt="DATABRIDGE Logo"
                className="object-contain flex-shrink-0 h-12 w-auto max-w-[200px]"
              />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6 sm:mb-8 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Welcome back</h2>
            <p className="mt-1.5 text-sm text-[#e5e5e5]/60">
              Sign in to your workspace
            </p>
          </div>

          {/* Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
