
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, FileText, File } from "lucide-react";

interface DownloadOptionsProps {
  onDownload: (format: 'pdf' | 'txt' | 'docx') => void;
  selectedFormat: 'pdf' | 'txt' | 'docx';
  onFormatChange: (format: 'pdf' | 'txt' | 'docx') => void;
  disabled?: boolean;
}

const DownloadOptions: React.FC<DownloadOptionsProps> = ({
  onDownload,
  selectedFormat,
  onFormatChange,
  disabled = false
}) => {
  const formatIcons = {
    pdf: <FileText className="h-4 w-4" />,
    txt: <File className="h-4 w-4" />,
    docx: <FileText className="h-4 w-4" />
  };

  const formatDescriptions = {
    pdf: 'Professional PDF with full formatting',
    txt: 'Plain text file for basic viewing',
    docx: 'Microsoft Word document for editing'
  };

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <FileDown className="h-5 w-5 text-purple-600" />
          Download Options
        </CardTitle>
        <CardDescription>
          Choose your preferred file format for the report download
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">File Format</label>
          <Select 
            value={selectedFormat} 
            onValueChange={(value) => onFormatChange(value as 'pdf' | 'txt' | 'docx')}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select file format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-500" />
                  <span>PDF Document</span>
                </div>
              </SelectItem>
              <SelectItem value="txt">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-gray-500" />
                  <span>Text File</span>
                </div>
              </SelectItem>
              <SelectItem value="docx">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>Word Document</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {formatDescriptions[selectedFormat]}
          </p>
        </div>

        <Button
          onClick={() => onDownload(selectedFormat)}
          disabled={disabled}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          size="lg"
        >
          <FileDown className="h-4 w-4 mr-2" />
          Download {selectedFormat.toUpperCase()} Report
        </Button>

        <div className="grid grid-cols-3 gap-2 text-center">
          {(['pdf', 'txt', 'docx'] as const).map((format) => (
            <div
              key={format}
              className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                selectedFormat === format
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => !disabled && onFormatChange(format)}
            >
              <div className="flex justify-center mb-1">
                {formatIcons[format]}
              </div>
              <div className="text-xs font-medium">{format.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadOptions;
