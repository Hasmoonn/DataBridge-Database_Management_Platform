import clsx from 'clsx';

const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-[#14213d] border border-white/8 rounded-xl p-6',
        hover && 'hover:border-[#fca311]/40 transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;