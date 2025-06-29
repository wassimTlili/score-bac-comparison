export default function LoadingSpinner({ message = "Chargement...", size = "default" }) {
  const spinnerSizes = {
    small: "w-4 h-4",
    default: "w-8 h-8", 
    large: "w-12 h-12"
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className={`${spinnerSizes[size]} border-4 border-blue-500 border-t-transparent rounded-full animate-spin`}></div>
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  );
}
