const Container = ({ children }) => {
  return (
    <div className="w-full max-w-[1280px] xl:w-[80%] lg:w-[80%] md:w-[95%] sm:w-[95%] w-[95%] px-4 mx-auto">
      {children}
    </div>
  );
};

export default Container;
