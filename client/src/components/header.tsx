import { Bell } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Bell className="text-primary text-2xl" />
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
          </div>
        </div>
      </div>
    </header>
  );
}
