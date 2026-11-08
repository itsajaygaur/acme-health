import { DownloadManager } from "@/components/ui/download-manager";

export default function Downloads() {
  return (
    <div className="flex-1 overflow-auto p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Export Downloads</h1>
          <p className="text-gray-600 mt-2">
            Download all conversion files, documentation, and project artifacts for your Angular 19 project
          </p>
        </div>
        <DownloadManager />
      </div>
    </div>
  );
}