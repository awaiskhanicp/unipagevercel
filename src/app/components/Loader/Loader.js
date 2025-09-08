// components/Loader.js
export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-sm">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-b-transparent border-r-blue-500 border-l-purple-500 animate-spin" />
        <div className="absolute inset-2 bg-white rounded-full shadow-inner"></div>
      </div>
    </div>
  );
}
