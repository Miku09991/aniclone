
const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="w-16 h-16 border-t-4 border-red-500 border-solid rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
