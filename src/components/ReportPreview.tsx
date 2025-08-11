
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComplianceTestResult {
  test: string;
  label: string;
  value: string;
  limit: string;
  unit: string;
  status: string;
  deviation?: string;
}

interface StandardDetails {
  title: string;
  subtitle: string;
  date: string;
  scope: string;
}

interface ComplianceReportData {
  type: 'compliance';
  overallCompliance: boolean;
  reportId: string;
  date: string;
  standardDetails: StandardDetails;
  wireType: string;
  productName: string;
  conductorSize: string;
  complianceResults: ComplianceTestResult[];
  timestamp: string;
}

interface StandardReportData {
  type: 'standard' | 'enhanced-pds';
  company: string;
  location: string;
  datasheetNo: string;
  date: string;
  time: string;
  customer: string;
  revNo: string;
  itemDescription: string;
  customerPartNo: string;
  manufacturerPartNo: string;
  referenceStandard: string;
  formatNo: string;
  specifications: {
    [key: string]: Array<{
      sno: number;
      parameter: string;
      units: string;
      specifications: string;
    }>;
  };
  preparedBy: string;
  approvedBy: string;
}

type ReportData = ComplianceReportData | StandardReportData;

interface ReportPreviewProps {
  data: ReportData;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ data }) => {
  if (data.type === 'compliance') {
    return <ComplianceReportPreview data={data as ComplianceReportData} />;
  }
  
  return <StandardReportPreview data={data as StandardReportData} />;
};

const ComplianceReportPreview: React.FC<{ data: ComplianceReportData }> = ({ data }) => {
  const overallStatus = data.overallCompliance ? 'COMPLIANT' : 'NON-COMPLIANT';
  const statusColor = data.overallCompliance ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="bg-white rounded-lg shadow-sm border max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center">
            <span className="text-sm font-bold">MOD</span>
          </div>
          <div>
            <h2 className="text-lg font-bold">MINISTRY OF DEFENCE</h2>
            <p className="text-blue-100 text-sm">Standards Compliance Report</p>
          </div>
        </div>
      </div>

      {/* Compliance Status */}
      <div className={`${statusColor} text-white p-3 text-center font-bold`}>
        OVERALL STATUS: {overallStatus}
      </div>

      {/* Document Info */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Report ID:</strong> {data.reportId}</div>
          <div><strong>Date:</strong> {data.date}</div>
          <div><strong>Standard:</strong> {data.standardDetails.title}</div>
          <div><strong>Wire Type:</strong> {data.wireType.toUpperCase()}</div>
        </div>
        <div className="mt-2">
          <strong>Product:</strong> {data.productName}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
          <div><strong>Conductor Size:</strong> {data.conductorSize}</div>
          <div><strong>Test Date:</strong> {data.date}</div>
        </div>
      </div>

      {/* Test Results */}
      <div className="p-4">
        <h4 className="font-semibold mb-3 text-gray-800">Test Results Summary</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left">Parameter</th>
                <th className="border border-gray-300 p-2 text-left">Value</th>
                <th className="border border-gray-300 p-2 text-left">Limit</th>
                <th className="border border-gray-300 p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.complianceResults.map((result: ComplianceTestResult, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{result.label}</td>
                  <td className="border border-gray-300 p-2">{result.value} {result.unit}</td>
                  <td className="border border-gray-300 p-2">{result.limit}</td>
                  <td className={`border border-gray-300 p-2 font-bold ${
                    result.status === 'PASS' ? 'text-green-600' : 
                    result.status === 'FAIL' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {result.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Standard Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <h5 className="font-medium mb-2">Standard Information</h5>
          <p className="text-sm"><strong>Title:</strong> {data.standardDetails.title}</p>
          <p className="text-sm"><strong>Scope:</strong> {data.standardDetails.scope}</p>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600">
          <div className="flex justify-between">
            <div>Generated: {new Date(data.timestamp).toLocaleString()}</div>
            <div>Report ID: {data.reportId}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StandardReportPreview: React.FC<{ data: StandardReportData }> = ({ data }) => {
  const renderSpecifications = (specs: Array<{
    sno: number;
    parameter: string;
    units: string;
    specifications: string;
  }>, title: string) => {
    if (!specs || specs.length === 0) return null;

    return (
      <div key={title} className="mb-6">
        <h4 className="font-semibold mb-3 text-gray-800 bg-gray-100 p-2 rounded border">{title}</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left">S.No</th>
                <th className="border border-gray-300 p-2 text-left">Parameter</th>
                <th className="border border-gray-300 p-2 text-left">Units</th>
                <th className="border border-gray-300 p-2 text-left">Specifications</th>
              </tr>
            </thead>
            <tbody>
              {specs.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{item.sno}</td>
                  <td className="border border-gray-300 p-2">{item.parameter}</td>
                  <td className="border border-gray-300 p-2">{item.units}</td>
                  <td className="border border-gray-300 p-2">{item.specifications}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-t-lg">
        <div className="text-center">
          <h2 className="text-xl font-bold">{data.company}</h2>
          <p className="text-orange-100 text-sm mt-1">{data.location}</p>
        </div>
      </div>

      {/* Document Info */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Datasheet No:</strong> {data.datasheetNo}</div>
          <div><strong>Date:</strong> {data.date}</div>
          <div><strong>Time:</strong> {data.time}</div>
          <div><strong>Customer:</strong> {data.customer}</div>
          <div><strong>Rev No:</strong> {data.revNo}</div>
          <div><strong>Item Description:</strong> {data.itemDescription}</div>
          <div><strong>Customer Part No:</strong> {data.customerPartNo}</div>
          <div><strong>Manufacturer Part No:</strong> {data.manufacturerPartNo}</div>
          <div><strong>Reference Standard:</strong> {data.referenceStandard}</div>
          <div><strong>Format No:</strong> {data.formatNo}</div>
        </div>
      </div>

      {/* Specifications */}
      <div className="p-4">
        <h3 className="font-bold mb-4 text-gray-800">Product Specifications</h3>
        {Object.entries(data.specifications).map(([key, specs]) => {
          const titles: { [key: string]: string } = {
            conductor: 'A) Conductor',
            insulation: 'B) Insulation',
            twisting: 'C) Twisting',
            innerJacket: 'D) Inner Jacket',
            shielding: 'E) Shielding',
            jacket: 'F) Jacket',
            electrical: 'G) Electrical Parameters',
            insulationTests: 'H) Insulation Tests',
            jacketTests: 'I) Jacket Tests'
          };
          return renderSpecifications(specs, titles[key] || key);
        })}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Prepared By:</strong> {data.preparedBy}</div>
          <div><strong>Approved By:</strong> {data.approvedBy}</div>
        </div>
      </div>
    </div>
  );
};
