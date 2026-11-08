import { useState } from "react";
import { Download, FileText, Database, Package, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Progress } from "./progress";
import { useToast } from "@/hooks/use-toast";
import { fetchWithCredentials } from "@/lib/utils";

interface DownloadItem {
  id: string;
  name: string;
  description: string;
  filename: string;
  size: string;
  type: 'documentation' | 'database' | 'archive' | 'source';
  icon: React.ReactNode;
  status: 'pending' | 'downloading' | 'completed' | 'error';
}

const downloadItems: DownloadItem[] = [
  {
    id: 'angular-readme',
    name: 'Angular 19 Setup Guide',
    description: 'Complete installation and configuration guide for Angular conversion',
    filename: 'ANGULAR_EXPORT_README.md',
    size: '15.2 KB',
    type: 'documentation',
    icon: <FileText className="w-4 h-4" />,
    status: 'pending'
  },
  {
    id: 'angular-conversion',
    name: 'Angular Conversion Guide',
    description: 'Detailed component-by-component conversion documentation',
    filename: 'ANGULAR_CONVERSION_COMPLETE.md',
    size: '28.7 KB',
    type: 'documentation',
    icon: <FileText className="w-4 h-4" />,
    status: 'pending'
  },
  {
    id: 'database-schema',
    name: 'Database Schema',
    description: 'Complete SQL Server database structure and table definitions',
    filename: 'database-schema.sql',
    size: '12.4 KB',
    type: 'database',
    icon: <Database className="w-4 h-4" />,
    status: 'pending'
  },
  {
    id: 'database-sample',
    name: 'Sample Data',
    description: 'Pre-populated sample data for testing and development',
    filename: 'database-sample-data.sql',
    size: '8.9 KB',
    type: 'database',
    icon: <Database className="w-4 h-4" />,
    status: 'pending'
  },
  {
    id: 'complete-archive',
    name: 'Complete Project Archive',
    description: 'All files bundled in a single downloadable archive',
    filename: 'angular-conversion-export.tar.gz',
    size: '245 KB',
    type: 'archive',
    icon: <Package className="w-4 h-4" />,
    status: 'pending'
  }
];

export function DownloadManager() {
  const [items, setItems] = useState<DownloadItem[]>(downloadItems);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const updateItemStatus = (id: string, status: DownloadItem['status']) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status } : item
    ));
  };

  const downloadFile = async (item: DownloadItem) => {
    try {
      updateItemStatus(item.id, 'downloading');
      
      // Download file from API endpoint
      const response = await fetchWithCredentials(`/api/downloads/${item.filename}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = item.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      updateItemStatus(item.id, 'completed');
      toast({
        title: "Download Complete",
        description: `${item.name} has been downloaded successfully.`,
      });
    } catch (error) {
      updateItemStatus(item.id, 'error');
      toast({
        title: "Download Failed",
        description: `Failed to download ${item.name}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const downloadAll = async () => {
    setIsDownloadingAll(true);
    setProgress(0);
    
    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await downloadFile(item);
        setProgress(((i + 1) / items.length) * 100);
        
        // Small delay between downloads to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast({
        title: "All Downloads Complete",
        description: "All export artifacts have been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Bulk Download Error",
        description: "Some files failed to download. Please try individual downloads.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingAll(false);
      setProgress(0);
    }
  };

  const getTypeColor = (type: DownloadItem['type']) => {
    switch (type) {
      case 'documentation': return 'bg-blue-100 text-blue-800';
      case 'database': return 'bg-green-100 text-green-800';
      case 'archive': return 'bg-purple-100 text-purple-800';
      case 'source': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: DownloadItem['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'downloading': return (
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      );
      default: return null;
    }
  };

  const completedCount = items.filter(item => item.status === 'completed').length;
  const totalSize = items.reduce((acc, item) => {
    const size = parseFloat(item.size.replace(/[^\d.]/g, ''));
    return acc + (item.size.includes('KB') ? size : size * 1024);
  }, 0);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Artifact Download Manager
            </CardTitle>
            <CardDescription>
              Download all conversion files, documentation, and project artifacts
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{completedCount}/{items.length} files</p>
            <p className="text-xs text-muted-foreground">
              Total: {totalSize > 1024 ? `${(totalSize/1024).toFixed(1)} MB` : `${totalSize.toFixed(1)} KB`}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Bulk Download Section */}
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-medium">Download All Files</h3>
              <p className="text-sm text-muted-foreground">
                Get all export artifacts in one click
              </p>
            </div>
            <Button 
              onClick={downloadAll}
              disabled={isDownloadingAll}
              className="flex items-center gap-2"
            >
              {isDownloadingAll ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download All
                </>
              )}
            </Button>
          </div>
          
          {isDownloadingAll && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        {/* Individual Files */}
        <div className="space-y-3">
          <h3 className="font-medium text-lg">Individual Downloads</h3>
          
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-gray-100 rounded">
                  {item.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{item.name}</h4>
                    <Badge variant="secondary" className={getTypeColor(item.type)}>
                      {item.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {item.filename}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.size}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {getStatusIcon(item.status)}
                <Button
                  variant={item.status === 'completed' ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => downloadFile(item)}
                  disabled={item.status === 'downloading'}
                  className="flex items-center gap-2"
                >
                  {item.status === 'downloading' ? (
                    <>
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Downloading
                    </>
                  ) : item.status === 'completed' ? (
                    <>
                      <Download className="w-3 h-3" />
                      Re-download
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Download Instructions</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Start with the Angular 19 Setup Guide for complete installation instructions</li>
            <li>• Use the database files to set up your development environment</li>
            <li>• The complete archive contains all files for easy project transfer</li>
            <li>• Your Express.js backend folder can be copied unchanged to the new project</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}