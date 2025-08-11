interface ParsedModel {
  productType: string;
  conductorDetails: {
    material: string;
    awg: string;
    strandCount: string;
    strandDiameter: string;
    coreCount: string;
    bunchedDiameter: string;
    resistance: string;
    currentRating: string;
  };
  insulationDetails: {
    material: string;
    thickness: string;
    color: string;
    od: string;
  };
  shieldingDetails: {
    material: string;
    construction: string;
    coverage: string;
    diameterOverBraid: string;
  } | null;
  standard: string;
  originalName: string;
}

interface SpecificationItem {
  sno: number;
  parameter: string;
  units: string;
  specifications: string;
  testResult?: string;
}

interface Specifications {
  conductor: SpecificationItem[];
  insulation: SpecificationItem[];
  twisting?: SpecificationItem[];
  innerJacket?: SpecificationItem[];
  shielding?: SpecificationItem[];
  jacket?: SpecificationItem[];
  electrical?: SpecificationItem[];
  insulationTests?: SpecificationItem[];
  jacketTests?: SpecificationItem[];
}

interface AutoPopulatedData {
  specifications: Specifications;
  standard: string;
  productType: string;
  conductorDetails: ParsedModel['conductorDetails'];
  insulationDetails: ParsedModel['insulationDetails'];
  shieldingDetails: ParsedModel['shieldingDetails'];
}

interface ReportConfig {
  modelName: string;
  parsedModel: ParsedModel;
  autoPopulatedData: AutoPopulatedData;
  selectedStandard?: string;
  wireType?: string;
  testParameters?: TestParameters;
  productName?: string;
  conductorSize?: string;
}

interface ComplianceTestResult {
  parameter: string;
  limit: string;
  result: string;
  status: string;
}

interface ComplianceData {
  insulationTests?: ComplianceTestResult[];
  jacketTests?: ComplianceTestResult[];
  sheathTests?: ComplianceTestResult[];
}

interface ReportData {
  type: string;
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
  specifications: Specifications;
  parsedModel: ParsedModel;
  complianceData: ComplianceData;
  preparedBy: string;
  approvedBy: string;
  timestamp: string;
  overallCompliance?: boolean;
  reportId?: string;
  standardDetails?: {
    title: string;
    subtitle: string;
    date: string;
    scope: string;
  };
  wireType?: string;
  productName?: string;
  conductorSize?: string;
  complianceResults?: Array<{
    test: string;
    label: string;
    value: string;
    limit: string;
    unit: string;
    status: string;
    deviation?: string;
  }>;
}

interface TestParameters {
  [key: string]: string;
}

interface LimitObject {
  min?: number;
  max?: number;
  unit: string;
}

export class ReportGenerator {
  static generateReportData(productName: string) {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const formattedTime = today.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const datasheetNo = `A${Math.floor(Math.random() * 1000) + 600}`;
    const customerPartNo = Math.floor(Math.random() * 900000000000) + 100000000000;
    const manufacturerPartNo = Math.floor(Math.random() * 90000000000000) + 10000000000000;

    return {
      type: 'standard',
      company: "PARAS WIRES PVT LTD, BENGALURU",
      location: "Plot No. 17-O Phase-2 Sector 1, Bidadi Industrial Ramanagara Taluk & Dist-562109",
      datasheetNo,
      date: formattedDate,
      time: formattedTime,
      customer: "A & A Alloys",
      revNo: "00",
      itemDescription: productName,
      customerPartNo: customerPartNo.toString(),
      manufacturerPartNo: manufacturerPartNo.toString(),
      referenceStandard: "DEF STAN 61-12 / Customer TDS / NES 518",
      formatNo: "PWPL/MKT/02",
      preparedBy: "Harshitha",
      approvedBy: "Ravi"
    };
  }

  static generateEnhancedPDSReport(config: ReportConfig): ReportData {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const formattedTime = today.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const datasheetNo = `A${Math.floor(Math.random() * 1000) + 600}`;
    const customerPartNo = Math.floor(Math.random() * 900000000000) + 100000000000;
    const manufacturerPartNo = Math.floor(Math.random() * 90000000000000) + 10000000000000;

    return {
      type: 'enhanced-pds',
      company: "PARAS WIRES PVT LTD, BENGALURU",
      location: "Plot No. 17-O Phase-2 Sector 1, Bidadi Industrial Ramanagara Taluk & Dist-562109",
      datasheetNo,
      date: formattedDate,
      time: formattedTime,
      customer: "A & A Alloys",
      revNo: "00",
      itemDescription: config.modelName,
      customerPartNo: customerPartNo.toString(),
      manufacturerPartNo: manufacturerPartNo.toString(),
      referenceStandard: this.getEnhancedStandardReference(config.parsedModel.standard),
      formatNo: "PWPL/MKT/02",
      specifications: config.autoPopulatedData.specifications,
      parsedModel: config.parsedModel,
      complianceData: this.generateComplianceData(config.parsedModel.standard),
      preparedBy: "Harshitha",
      approvedBy: "Ravi",
      timestamp: new Date().toISOString()
    };
  }

  static generateComplianceData(standard: string): ComplianceData {
    if (standard === 'def-stan-61-12-part-18') {
      return {
        insulationTests: [
          { parameter: 'Critical Oxygen Index', limit: '≥ 29%', result: '32.5%', status: 'PASS' },
          { parameter: 'Smoke Density', limit: '≤ 12%', result: '8.2%', status: 'PASS' },
          { parameter: 'Toxicity Index', limit: '≤ 0.2', result: '0.15', status: 'PASS' },
          { parameter: 'Temperature Index', limit: '≥ 250°C', result: '285°C', status: 'PASS' },
          { parameter: 'Insulation Resistance', limit: '≥ 0.20 MΩ/km', result: '0.35 MΩ/km', status: 'PASS' },
          { parameter: 'Cold Bend Test (-50°C)', limit: 'No cracks', result: 'Pass', status: 'PASS' }
        ],
        jacketTests: [
          { parameter: 'Critical Oxygen Index', limit: '≥ 29%', result: '31.8%', status: 'PASS' },
          { parameter: 'Smoke Density', limit: '≤ 12%', result: '9.1%', status: 'PASS' },
          { parameter: 'Toxicity Index', limit: '≤ 0.2', result: '0.18', status: 'PASS' },
          { parameter: 'Temperature Index', limit: '≥ 250°C', result: '275°C', status: 'PASS' },
          { parameter: 'HCl Gas Content', limit: '≤ 10 cm³/m', result: '2.5 cm³/m', status: 'PASS' },
          { parameter: 'Cold Elongation (-30°C)', limit: '≥ 20%', result: '25%', status: 'PASS' }
        ]
      };
    } else if (standard === 'def-stan-61-12-part-31') {
      return {
        sheathTests: [
          { parameter: 'Tensile Strength', limit: '≥ 8 N/mm²', result: '12.5 N/mm²', status: 'PASS' },
          { parameter: 'Elongation at Break', limit: '≥ 200%', result: '285%', status: 'PASS' },
          { parameter: 'Tear Resistance', limit: '≥ 5 N/mm', result: '7.8 N/mm', status: 'PASS' },
          { parameter: 'Critical Oxygen Index', limit: '≥ 29%', result: '32.1%', status: 'PASS' },
          { parameter: 'Temperature Index', limit: '≥ 250°C', result: '275°C', status: 'PASS' },
          { parameter: 'Toxicity Index', limit: '≤ 5 per 100g', result: '2.8 per 100g', status: 'PASS' },
          { parameter: 'Smoke Index', limit: '≤ 20', result: '15', status: 'PASS' },
          { parameter: 'Halogen Content', limit: 'Negative', result: 'Not Detected', status: 'PASS' }
        ]
      };
    }
    return {};
  }

  static getEnhancedStandardReference(standard: string): string {
    const references = {
      'def-stan-61-12-part-31': 'DEF STAN 61-12 Part 31 (Issue 2, 20th January 2006) / Customer TDS / NES 518',
      'def-stan-61-12-part-18': 'DEF STAN 61-12 Part 18 (Issue 4, 6 January 1995) / Customer TDS / NES 518'
    };
    return references[standard] || 'DEF STAN 61-12 / Customer TDS / NES 518';
  }

  static downloadEnhancedPDF(data: ReportData) {
    const htmlContent = this.generateEnhancedHTMLContent(data);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
    }
  }

  static generateEnhancedHTMLContent(data: ReportData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Enhanced PDS Report - ${data.datasheetNo}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 15px; 
            font-size: 11px; 
            line-height: 1.3;
          }
          .header { 
            background: linear-gradient(135deg, #f97316, #ea580c); 
            color: white; 
            padding: 15px; 
            margin-bottom: 15px; 
            border-radius: 6px;
          }
          .company-info { 
            display: flex; 
            align-items: center; 
            gap: 12px; 
            margin-bottom: 12px; 
          }
          .logo { 
            width: 45px; 
            height: 45px; 
            background: rgba(255,255,255,0.2); 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 16px; 
            font-weight: bold; 
          }
          .document-info { 
            background: #f8f9fa; 
            padding: 12px; 
            margin-bottom: 15px; 
            border-radius: 4px; 
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 8px; 
            margin-bottom: 8px; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 15px; 
            font-size: 9px; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left; 
          }
          th { 
            background: #f8f9fa; 
            font-weight: bold; 
          }
          .section-title { 
            background: #e9ecef; 
            padding: 6px 10px; 
            margin: 12px 0 4px 0; 
            font-weight: bold; 
            border-radius: 3px; 
            font-size: 10px;
          }
          .compliance-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
          }
          .pass { background: #10b981; color: white; }
          .fail { background: #ef4444; color: white; }
          .footer { 
            margin-top: 20px; 
            padding-top: 12px; 
            border-top: 1px solid #ddd; 
            display: flex; 
            justify-content: space-between; 
            font-size: 9px;
          }
          .timestamp {
            text-align: center;
            color: #6b7280;
            font-size: 8px;
            margin-top: 10px;
          }
          @page { 
            margin: 15mm; 
            size: A4;
          }
          @media print { 
            body { margin: 0; padding: 8px; font-size: 9px; } 
            .header { break-inside: avoid; }
            table { break-inside: avoid; }
            .section-title { break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <div class="logo">PW</div>
            <div>
              <h2 style="margin: 0; font-size: 18px;">${data.company}</h2>
              <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 10px;">${data.location}</p>
            </div>
          </div>
          <div style="text-align: center;">
            <h3 style="margin: 0; font-size: 14px;">ENHANCED PRODUCTION DATA SHEET</h3>
            <p style="margin: 2px 0 0 0; opacity: 0.9; font-size: 9px;">Auto-Generated with Def Stan 61-12 Compliance</p>
          </div>
        </div>

        <div class="document-info">
          <div class="info-grid">
            <div><strong>Datasheet No:</strong> ${data.datasheetNo}</div>
            <div><strong>Date & Time:</strong> ${data.date}, ${data.time} IST</div>
            <div><strong>Customer:</strong> ${data.customer}</div>
            <div><strong>Rev no:</strong> ${data.revNo}</div>
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Item Description:</strong> ${data.itemDescription}
          </div>
          <div class="info-grid">
            <div><strong>Customer Part No:</strong> ${data.customerPartNo}</div>
            <div><strong>Manufacturer Part No:</strong> ${data.manufacturerPartNo}</div>
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Reference Standard:</strong> ${data.referenceStandard}
          </div>
          <div><strong>Format No:</strong> ${data.formatNo}</div>
        </div>

        ${this.generateSpecificationTables(data.specifications)}
        
        ${this.generateComplianceTables(data.complianceData, data.parsedModel.standard)}

        <div class="section-title">J) Packing Standards</div>
        <table>
          <thead>
            <tr>
              <th>S.no</th>
              <th>Parameter</th>
              <th>Units</th>
              <th>Specifications</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Standard Length</td>
              <td>m</td>
              <td>500 ± 5%</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Identification Tag</td>
              <td>Visual</td>
              <td>Cable specification details on each drum/reel</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div>Prepared By: ${data.preparedBy}</div>
          <div>Approved by: ${data.approvedBy}</div>
        </div>

        <div class="timestamp">
          Generated: ${new Date(data.timestamp).toLocaleString('en-GB')} | 
          Report ID: ${data.datasheetNo} | 
          Enhanced PDS v2.0
        </div>
      </body>
      </html>
    `;
  }

  static generateSpecificationTables(specifications: Specifications): string {
    const sections = [
      { key: 'conductor', title: 'A) Conductor' },
      { key: 'insulation', title: 'B) Insulation' },
      { key: 'twisting', title: 'C) Twisting' },
      { key: 'innerJacket', title: 'D) Inner Jacket' },
      { key: 'shielding', title: 'E) Shielding' },
      { key: 'jacket', title: 'F) Jacket' },
      { key: 'electrical', title: 'G) Electrical Parameters' }
    ];

    return sections.map(section => {
      if (!specifications[section.key]) return '';
      
      return `
        <div class="section-title">${section.title}</div>
        <table>
          <thead>
            <tr>
              <th>S.no</th>
              <th>Parameter</th>
              <th>Units</th>
              <th>Specifications</th>
            </tr>
          </thead>
          <tbody>
            ${specifications[section.key].map((spec: SpecificationItem) => `
              <tr>
                <td>${spec.sno}</td>
                <td>${spec.parameter}</td>
                <td>${spec.units}</td>
                <td>${spec.specifications}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }).join('');
  }

  static generateComplianceTables(complianceData: ComplianceData, standard: string): string {
    if (!complianceData) return '';

    let tables = '';

    if (standard === 'def-stan-61-12-part-18') {
      if (complianceData.insulationTests) {
        tables += `
          <div class="section-title">H) Insulation Tests - Def Stan 61-12 Part 18</div>
          <table>
            <thead>
              <tr>
                <th>Test Parameter</th>
                <th>Standard Limit</th>
                <th>Test Result</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${complianceData.insulationTests.map((test: ComplianceTestResult) => `
                <tr>
                  <td>${test.parameter}</td>
                  <td>${test.limit}</td>
                  <td>${test.result}</td>
                  <td><span class="compliance-badge ${test.status.toLowerCase()}">${test.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }

      if (complianceData.jacketTests) {
        tables += `
          <div class="section-title">I) Jacket Tests - Def Stan 61-12 Part 18</div>
          <table>
            <thead>
              <tr>
                <th>Test Parameter</th>
                <th>Standard Limit</th>
                <th>Test Result</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${complianceData.jacketTests.map((test: ComplianceTestResult) => `
                <tr>
                  <td>${test.parameter}</td>
                  <td>${test.limit}</td>
                  <td>${test.result}</td>
                  <td><span class="compliance-badge ${test.status.toLowerCase()}">${test.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    } else if (standard === 'def-stan-61-12-part-31') {
      if (complianceData.sheathTests) {
        tables += `
          <div class="section-title">H) Sheath Tests - Def Stan 61-12 Part 31</div>
          <table>
            <thead>
              <tr>
                <th>Test Parameter</th>
                <th>Standard Limit</th>
                <th>Test Result</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${complianceData.sheathTests.map((test: ComplianceTestResult) => `
                <tr>
                  <td>${test.parameter}</td>
                  <td>${test.limit}</td>
                  <td>${test.result}</td>
                  <td><span class="compliance-badge ${test.status.toLowerCase()}">${test.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    }

    return tables;
  }

  static generateComplianceReport(config: ReportConfig) {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const reportId = `DEF-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

    const complianceResults = this.evaluateCompliance(config.selectedStandard, config.wireType, config.testParameters);

    return {
      type: 'compliance',
      reportId,
      date: formattedDate,
      timestamp: new Date().toISOString(),
      productName: config.productName,
      standard: config.selectedStandard,
      wireType: config.wireType,
      conductorSize: config.conductorSize,
      testParameters: config.testParameters,
      complianceResults,
      overallCompliance: complianceResults.every(result => result.status === 'PASS'),
      standardDetails: this.getStandardDetails(config.selectedStandard),
      company: "MINISTRY OF DEFENCE",
      location: "Defence Standards - Crown Copyright",
      datasheetNo: reportId,
      customer: "Standards Compliance Report",
      revNo: "01",
      itemDescription: config.productName,
      referenceStandard: this.getStandardReference(config.selectedStandard),
      preparedBy: "Automated Compliance System",
      approvedBy: "Standards Authority"
    };
  }

  static evaluateCompliance(standard: string, wireType: string, testParams: TestParameters) {
    const results = [];

    if (standard === 'def-stan-61-12-part-31') {
      const limits = {
        tensileStrength: { min: 8, unit: 'N/mm²' },
        elongationAtBreak: { min: 200, unit: '%' },
        tearResistance: { min: 5, unit: 'N/mm' },
        criticalOxygenIndex: { min: 29, unit: '%' },
        temperatureIndex: { min: 250, unit: '°C' },
        toxicityIndex: { max: 5, unit: 'per 100g' },
        smokeIndex: { max: 20, unit: '-' },
        coldElongation: { min: 20, unit: '%' },
        insulationResistance: { min: 0.1, unit: 'MΩ·km' },
        hotSet: { max: 175, unit: '%' },
        hotSetPermanent: { max: 25, unit: '%' },
        pressureTest: { max: 50, unit: '%' },
        ozoneResistance: { min: 120, unit: 'hours' },
        uvResistance: { min: 1000, unit: 'hours' }
      };

      Object.entries(limits).forEach(([test, limit]) => {
        const value = parseFloat(testParams[test]);
        let status = 'NOT_TESTED';
        let deviation = null;

        if (!isNaN(value)) {
          if ('min' in limit) {
            status = value >= limit.min ? 'PASS' : 'FAIL';
            deviation = value - limit.min;
          } else if ('max' in limit) {
            status = value <= limit.max ? 'PASS' : 'FAIL';
            deviation = limit.max - value;
          }
        }

        results.push({
          test,
          label: this.getTestLabel(test),
          value: testParams[test] || 'Not Tested',
          limit: this.formatLimit(limit),
          unit: limit.unit,
          status,
          deviation: deviation?.toFixed(2)
        });
      });

      // Special cases
      if (testParams.halogenContent) {
        results.push({
          test: 'halogenContent',
          label: 'Halogen Content',
          value: testParams.halogenContent,
          limit: 'Negative',
          unit: '-',
          status: testParams.halogenContent.toLowerCase().includes('negative') || 
                  testParams.halogenContent.toLowerCase().includes('none') ? 'PASS' : 'FAIL'
        });
      }

      if (testParams.heatShock) {
        results.push({
          test: 'heatShock',
          label: 'Heat Shock Test',
          value: testParams.heatShock,
          limit: 'No Cracking',
          unit: '-',
          status: testParams.heatShock.toLowerCase().includes('no crack') ||
                  testParams.heatShock.toLowerCase().includes('pass') ? 'PASS' : 'FAIL'
        });
      }
    }

    return results;
  }

  static getTestLabel(test: string): string {
    const labels = {
      tensileStrength: 'Tensile Strength',
      elongationAtBreak: 'Elongation at Break',
      tearResistance: 'Tear Resistance',
      criticalOxygenIndex: 'Critical Oxygen Index',
      temperatureIndex: 'Temperature Index',
      toxicityIndex: 'Toxicity Index',
      smokeIndex: 'Smoke Index',
      halogenContent: 'Halogen Content',
      coldElongation: 'Cold Elongation (-30°C)',
      heatShock: 'Heat Shock (150°C, 4h)',
      insulationResistance: 'Insulation Resistance',
      hotSet: 'Hot Set Test - Max Elongation',
      hotSetPermanent: 'Hot Set - Permanent Elongation',
      pressureTest: 'Pressure Test (120°C)',
      ozoneResistance: 'Ozone Resistance',
      uvResistance: 'UV Resistance'
    };
    return labels[test] || test;
  }

  static formatLimit(limit: LimitObject): string {
    if ('min' in limit && 'max' in limit) {
      return `${limit.min} - ${limit.max}`;
    } else if ('min' in limit) {
      return `≥ ${limit.min}`;
    } else if ('max' in limit) {
      return `≤ ${limit.max}`;
    }
    return 'Per Standard';
  }

  static getStandardDetails(standard: string) {
    const details = {
      'def-stan-61-12-part-31': {
        title: 'Def Stan 61-12 Part 31 (Issue 2)',
        subtitle: 'Limited Fire Hazard (LFH) Sheathing Materials',
        date: '20th January 2006',
        scope: 'Requirements and test methods for sheaths suitable for temperatures from -30°C to +105°C'
      },
      'def-stan-61-12-part-18': {
        title: 'Def Stan 61-12 Part 18 (Issue 4)',
        subtitle: 'LFH Equipment Wires and Cables',
        date: '6 January 1995',
        scope: 'Requirements for equipment wires and cables suitable for temperatures from -50°C to +120°C'
      }
    };
    return details[standard] || {};
  }

  static getStandardReference(standard: string): string {
    const references = {
      'def-stan-61-12-part-31': 'DEF STAN 61-12 Part 31 (Issue 2, 20th January 2006)',
      'def-stan-61-12-part-18': 'DEF STAN 61-12 Part 18 (Issue 4, 6 January 1995)'
    };
    return references[standard] || 'DEF STAN 61-12';
  }

  static downloadPDF(data: ReportData) {
    const htmlContent = this.generateHTMLContent(data);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
    }
  }

  static downloadCompliancePDF(data: ReportData) {
    const htmlContent = this.generateComplianceHTMLContent(data);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
    }
  }

  static generateComplianceHTMLContent(data: ReportData): string {
    const overallStatus = data.overallCompliance ? 'COMPLIANT' : 'NON-COMPLIANT';
    const statusColor = data.overallCompliance ? '#10b981' : '#ef4444';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Standards Compliance Report - ${data.reportId}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            font-size: 12px; 
            line-height: 1.4;
          }
          .header { 
            background: linear-gradient(135deg, #1e40af, #3b82f6); 
            color: white; 
            padding: 20px; 
            margin-bottom: 20px; 
            border-radius: 8px;
          }
          .mod-logo { 
            width: 60px; 
            height: 60px; 
            background: rgba(255,255,255,0.2); 
            border-radius: 8px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 14px; 
            font-weight: bold; 
            margin-bottom: 15px;
          }
          .compliance-status {
            background: ${statusColor};
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
            margin: 20px 0;
          }
          .document-info { 
            background: #f8f9fa; 
            padding: 15px; 
            margin-bottom: 20px; 
            border-radius: 5px; 
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 10px; 
            margin-bottom: 10px; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
            font-size: 10px; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background: #f8f9fa; 
            font-weight: bold; 
          }
          .pass { color: #10b981; font-weight: bold; }
          .fail { color: #ef4444; font-weight: bold; }
          .not-tested { color: #6b7280; font-style: italic; }
          .section-title { 
            background: #e9ecef; 
            padding: 8px 12px; 
            margin: 15px 0 5px 0; 
            font-weight: bold; 
            border-radius: 3px; 
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 15px; 
            border-top: 1px solid #ddd; 
          }
          .crown-copyright {
            font-size: 8px;
            color: #6b7280;
            text-align: center;
            margin-top: 20px;
          }
          @media print { 
            body { margin: 0; padding: 10px; } 
            .header { break-inside: avoid; }
            table { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="mod-logo">MOD</div>
          <div>
            <h2 style="margin: 0; font-size: 18px;">MINISTRY OF DEFENCE</h2>
            <h3 style="margin: 5px 0; font-size: 16px;">STANDARDS COMPLIANCE REPORT</h3>
            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 11px;">${data.standardDetails.title}</p>
            <p style="margin: 0; opacity: 0.9; font-size: 10px;">${data.standardDetails.subtitle}</p>
          </div>
        </div>

        <div class="compliance-status">
          OVERALL COMPLIANCE STATUS: ${overallStatus}
        </div>

        <div class="document-info">
          <div class="info-grid">
            <div><strong>Report ID:</strong> ${data.reportId}</div>
            <div><strong>Date:</strong> ${data.date}</div>
            <div><strong>Standard:</strong> ${data.standardDetails.title}</div>
            <div><strong>Wire/Cable Type:</strong> ${data.wireType.toUpperCase()}</div>
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Product:</strong> ${data.productName}
          </div>
          <div class="info-grid">
            <div><strong>Conductor Size:</strong> ${data.conductorSize}</div>
            <div><strong>Test Date:</strong> ${data.date}</div>
          </div>
          <div><strong>Reference Standard:</strong> ${data.referenceStandard}</div>
        </div>

        <div class="section-title">Test Results Summary</div>
        <table>
          <thead>
            <tr>
              <th>Test Parameter</th>
              <th>Test Value</th>
              <th>Unit</th>
              <th>Required Limit</th>
              <th>Status</th>
              <th>Deviation</th>
            </tr>
          </thead>
          <tbody>
            ${data.complianceResults.map(result => `
              <tr>
                <td>${result.label}</td>
                <td>${result.value}</td>
                <td>${result.unit}</td>
                <td>${result.limit}</td>
                <td class="${result.status.toLowerCase().replace('_', '-')}">${result.status}</td>
                <td>${result.deviation || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">Standard Information</div>
        <div class="document-info">
          <p><strong>Title:</strong> ${data.standardDetails.title}</p>
          <p><strong>Scope:</strong> ${data.standardDetails.scope}</p>
          <p><strong>Issue Date:</strong> ${data.standardDetails.date}</p>
        </div>

        <div class="footer">
          <div class="info-grid">
            <div><strong>Report Generated By:</strong> ${data.preparedBy}</div>
            <div><strong>Approved By:</strong> ${data.approvedBy}</div>
          </div>
          <div style="margin-top: 10px;">
            <strong>Generated:</strong> ${new Date(data.timestamp).toLocaleString('en-GB')}
          </div>
        </div>

        <div class="crown-copyright">
          © Crown Copyright. This document contains information proprietary to the Ministry of Defence.<br>
          Def Stan 61-12 standards are published under Crown Copyright and must be used in accordance with MOD regulations.
        </div>
      </body>
      </html>
    `;
  }

  private static generateHTMLContent(data: ReportData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PDS Report - ${data.datasheetNo}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            font-size: 12px; 
            line-height: 1.4;
          }
          .header { 
            background: linear-gradient(135deg, #f97316, #ea580c); 
            color: white; 
            padding: 20px; 
            margin-bottom: 20px; 
            border-radius: 8px;
          }
          .company-info { 
            display: flex; 
            align-items: center; 
            gap: 15px; 
            margin-bottom: 15px; 
          }
          .logo { 
            width: 50px; 
            height: 50px; 
            background: rgba(255,255,255,0.2); 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 18px; 
            font-weight: bold; 
          }
          .document-info { 
            background: #f8f9fa; 
            padding: 15px; 
            margin-bottom: 20px; 
            border-radius: 5px; 
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 10px; 
            margin-bottom: 10px; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
            font-size: 10px; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background: #f8f9fa; 
            font-weight: bold; 
          }
          .section-title { 
            background: #e9ecef; 
            padding: 8px 12px; 
            margin: 15px 0 5px 0; 
            font-weight: bold; 
            border-radius: 3px; 
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 15px; 
            border-top: 1px solid #ddd; 
            display: flex; 
            justify-content: space-between; 
          }
          @media print { 
            body { margin: 0; padding: 10px; } 
            .header { break-inside: avoid; }
            table { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <div class="logo">PW</div>
            <div>
              <h2 style="margin: 0; font-size: 20px;">${data.company}</h2>
              <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 11px;">${data.location}</p>
            </div>
          </div>
          <div style="text-align: center;">
            <h3 style="margin: 0; font-size: 16px;">PRODUCTION DATA SHEET</h3>
          </div>
        </div>

        <div class="document-info">
          <div class="info-grid">
            <div><strong>Datasheet No:</strong> ${data.datasheetNo}</div>
            <div><strong>Date:</strong> ${data.date}</div>
            <div><strong>Customer:</strong> ${data.customer}</div>
            <div><strong>Rev no:</strong> ${data.revNo}</div>
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Item Description:</strong> ${data.itemDescription}
          </div>
          <div class="info-grid">
            <div><strong>Customer part no:</strong> ${data.customerPartNo}</div>
            <div><strong>Manufacturer part no:</strong> ${data.manufacturerPartNo}</div>
          </div>
          <div><strong>Reference standard:</strong> ${data.referenceStandard}</div>
        </div>

        <div class="section-title">A) Conductor</div>
        <table>
          <thead>
            <tr>
              <th>S.no</th>
              <th>Parameter</th>
              <th>Units</th>
              <th>Specifications</th>
            </tr>
          </thead>
          <tbody>
            ${data.specifications.conductor.map((spec: SpecificationItem) => `
              <tr>
                <td>${spec.sno}</td>
                <td>${spec.parameter}</td>
                <td>${spec.units}</td>
                <td>${spec.specifications}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">B) Insulation</div>
        <table>
          <thead>
            <tr>
              <th>S.no</th>
              <th>Parameter</th>
              <th>Units</th>
              <th>Specifications</th>
            </tr>
          </thead>
          <tbody>
            ${data.specifications.insulation.map((spec: SpecificationItem) => `
              <tr>
                <td>${spec.sno}</td>
                <td>${spec.parameter}</td>
                <td>${spec.units}</td>
                <td>${spec.specifications}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">C) Twisting</div>
        <table>
          <thead>
            <tr>
              <th>S.no</th>
              <th>Parameter</th>
              <th>Units</th>
              <th>Specifications</th>
            </tr>
          </thead>
          <tbody>
            ${data.specifications.twisting.map((spec: SpecificationItem) => `
              <tr>
                <td>${spec.sno}</td>
                <td>${spec.parameter}</td>
                <td>${spec.units}</td>
                <td>${spec.specifications}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">D) Inner Jacket</div>
        <table>
          <thead>
            <tr>
              <th>S.no</th>
              <th>Parameter</th>
              <th>Units</th>
              <th>Specifications</th>
            </tr>
          </thead>
          <tbody>
            ${data.specifications.innerJacket.map((spec: SpecificationItem) => `
              <tr>
                <td>${spec.sno}</td>
                <td>${spec.parameter}</td>
                <td>${spec.units}</td>
                <td>${spec.specifications}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">E) Shielding</div>
        <table>
          <thead>
            <tr>
              <th>S.no</th>
              <th>Parameter</th>
              <th>Units</th>
              <th>Specifications</th>
            </tr>
          </thead>
          <tbody>
            ${data.specifications.shielding.map((spec: SpecificationItem) => `
              <tr>
                <td>${spec.sno}</td>
                <td>${spec.parameter}</td>
                <td>${spec.units}</td>
                <td>${spec.specifications}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">F) Jacket</div>
        <table>
          <thead>
            <tr>
              <th>S.no</th>
              <th>Parameter</th>
              <th>Units</th>
              <th>Specifications</th>
            </tr>
          </thead>
          <tbody>
            ${data.specifications.jacket.map((spec: SpecificationItem) => `
              <tr>
                <td>${spec.sno}</td>
                <td>${spec.parameter}</td>
                <td>${spec.units}</td>
                <td>${spec.specifications}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <div>Prepared By: ${data.preparedBy}</div>
          <div>Approved by: ${data.approvedBy}</div>
        </div>
      </body>
      </html>
    `;
  }
}
