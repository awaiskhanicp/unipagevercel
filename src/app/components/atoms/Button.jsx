'use client';

const Button = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`
        relative
        overflow-hidden
        text-white
        rounded-tl-[30px] 
        rounded-tr-[30px] 
        rounded-br-[30px]
        px-5 py-2 
        font-medium 
        text-sm 
        cursor-pointer 
        shadow-md 
        transition-all 
        duration-300
        bg-[length:200%_100%]
        bg-left
        ${className}
      `}
      style={{
        '--brand-color': '#0B6D76',
        backgroundImage: `linear-gradient(90deg,rgb(0, 3, 3) 0%, var(--brand-color) 50%)`,
        backgroundPosition: '0% 0%',
        backgroundSize: '200% 100%',
        transition: 'background-position 0.4s ease-in-out'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundPosition = '100% 0%';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundPosition = '0% 0%';
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;