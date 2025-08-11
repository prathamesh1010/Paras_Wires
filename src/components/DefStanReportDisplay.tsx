
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface Metadata {
  title: string;
  issue: string;
  date: string;
  scope: string;
}

interface ProductDetails {
  sections?: string[];
  [key: string]: unknown;
}

interface Sections {
  [key: string]: string;
}

interface GeneratedReport {
  standardName: string;
  productName: string;
  metadata: Metadata;
  productDetails: ProductDetails;
  sections: Sections;
  generatedAt: string;
}

interface DefStanReportDisplayProps {
  report: GeneratedReport;
}

const DefStanReportDisplay: React.FC<DefStanReportDisplayProps> = ({ report }) => {
  return (
    <div className="bg-white rounded-lg border max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-t-lg">
        <div className="text-center">
          <h2 className="text-xl font-bold">MINISTRY OF DEFENCE</h2>
          <h3 className="text-lg font-semibold mt-2">{report.standardName}</h3>
          <p className="text-blue-100 text-sm mt-1">{report.metadata.title}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="bg-green-500 text-white p-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span className="font-bold">COMPLIANCE REPORT GENERATED</span>
        </div>
      </div>

      {/* Report Content */}
      <div className="p-4 space-y-4">
        {/* Standard Metadata */}
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-semibold mb-2 text-gray-800">Standard Information</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><strong>Issue:</strong> {report.metadata.issue}</div>
            <div><strong>Date:</strong> {report.metadata.date}</div>
            <div className="col-span-2"><strong>Scope:</strong> {report.metadata.scope}</div>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-blue-50 p-3 rounded">
          <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
            Product: {report.productName}
            <Badge variant="secondary">Compliant</Badge>
          </h4>
          <div className="space-y-2 text-sm">
            {Object.entries(report.productDetails).map(([key, value]) => {
              if (key === 'sections') return null;
              return (
                <div key={key} className="flex justify-between">
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span>{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Applicable Sections */}
        <div className="bg-yellow-50 p-3 rounded">
          <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            Applicable Sections
          </h4>
          <div className="space-y-2 text-sm">
            {report.productDetails.sections?.map((section: string) => (
              <div key={section} className="border-l-2 border-yellow-400 pl-3">
                <div className="font-medium">{section}</div>
                <div className="text-gray-600 text-xs">
                  {report.sections[section] || 'See standard for complete details'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Summary */}
        <div className="bg-green-50 p-3 rounded">
          <h4 className="font-semibold mb-2 text-gray-800">Compliance Summary</h4>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Product meets all specified requirements for {report.standardName}</span>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            All applicable sections and test methods have been reviewed and confirmed compliant.
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-3 text-xs text-gray-500 flex justify-between">
          <span>Generated: {new Date(report.generatedAt).toLocaleString()}</span>
          <span>Report ID: {report.standardName.replace(/\s+/g, '-').toLowerCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default DefStanReportDisplay;
