const Button2 = ({ children, className, ...props }) => {
  return (
    <button
      className={`
      bg-[white]
      rounded-tl-[30px] 
      rounded-tr-[30px] 
      rounded-br-[30px]
      px-[20px]
      py-[10px]
      text-black
      border
      border-[black]
      cursor-pointer
      [box-shadow:0px_0px_40px_5px_#0000000D]
      ${className}
    `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button2;
