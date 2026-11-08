import { RefreshCw } from "lucide-react";

export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-white/90 bg-opacity-90 flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-lg font-medium text-gray-700">Loading</span>
      </div>
    </div>
  );
}
