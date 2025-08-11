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

export class ModelParser {
  static parseModelName(modelName: string) {
    const normalized = modelName.toUpperCase().trim();
    
    // Extract basic components
    const productType = this.extractProductType(normalized);
    const conductorDetails = this.extractConductorDetails(normalized);
    const insulationDetails = this.extractInsulationDetails(normalized);
    const shieldingDetails = this.extractShieldingDetails(normalized);
    const standard = this.determineStandard(normalized, productType);
    
    return {
      productType,
      conductorDetails,
      insulationDetails,
      shieldingDetails,
      standard,
      originalName: modelName
    };
  }

  static extractProductType(normalized: string): string {
    if (normalized.includes('TYPE 1SB') || normalized.includes('TYPE 1SBM')) return 'type-1sb';
    if (normalized.includes('TYPE 1')) return 'type-1';
    if (normalized.includes('TYPE 2SB') || normalized.includes('TYPE 2SBM')) return 'type-2sb';
    if (normalized.includes('TYPE 2')) return 'type-2';
    if (normalized.includes('LFH SHEATH') || normalized.includes('SHEATH')) return 'lfh-sheath';
    if (normalized.match(/\d+C\s*X/)) return 'multicore-cable';
    if (normalized.includes('1C')) return 'single-core';
    return 'equipment-wire';
  }

  static extractConductorDetails(normalized: string) {
    const awgMatch = normalized.match(/X(\d+)/);
    const strandMatch = normalized.match(/\((\d+)\/(\d+\.?\d*)\)/);
    const coreMatch = normalized.match(/(\d+)C/);
    
    const awg = awgMatch ? awgMatch[1] : '12';
    const strandCount = strandMatch ? strandMatch[1] : '37';
    const strandDiameter = strandMatch ? strandMatch[2] : '0.30';
    const coreCount = coreMatch ? coreMatch[1] : '1';
    
    // Calculate parameters based on AWG
    const awgParams = this.getAWGParameters(awg);
    
    return {
      material: normalized.includes('ATC') ? 'ATC' : 'Copper',
      awg,
      strandCount,
      strandDiameter,
      coreCount,
      bunchedDiameter: awgParams.bunchedDiameter,
      resistance: awgParams.resistance,
      currentRating: awgParams.currentRating
    };
  }

  static extractInsulationDetails(normalized: string) {
    const color = this.extractColor(normalized);
    const thickness = normalized.includes('TYPE 2') ? '0.23' : '0.20';
    
    return {
      material: 'GFR 340 LFH',
      thickness,
      color,
      od: this.calculateInsulationOD(thickness)
    };
  }

  static extractShieldingDetails(normalized: string) {
    const hasShielding = normalized.includes('SHIELD') || normalized.includes('SCREEN');
    
    if (!hasShielding) return null;
    
    return {
      material: 'ATC',
      construction: '24*7*0.13',
      coverage: '85',
      diameterOverBraid: '7.55'
    };
  }

  static extractColor(normalized: string): string {
    if (normalized.includes('WHITE')) return 'White';
    if (normalized.includes('BLACK')) return 'Black';
    if (normalized.includes('RED')) return 'Red';
    if (normalized.includes('BLUE')) return 'Blue';
    if (normalized.includes('GREEN')) return 'Green';
    return 'White'; // Default
  }

  static determineStandard(normalized: string, productType: string): string {
    if (productType === 'lfh-sheath' || normalized.includes('SHEATH')) {
      return 'def-stan-61-12-part-31';
    }
    return 'def-stan-61-12-part-18';
  }

  static getAWGParameters(awg: string) {
    const awgTable = {
      '30': { bunchedDiameter: '0.8', resistance: '122.0', currentRating: '0.5' },
      '28': { bunchedDiameter: '1.0', resistance: '76.7', currentRating: '0.8' },
      '26': { bunchedDiameter: '1.3', resistance: '48.3', currentRating: '1.3' },
      '24': { bunchedDiameter: '1.6', resistance: '30.4', currentRating: '2.1' },
      '22': { bunchedDiameter: '1.8', resistance: '19.1', currentRating: '3.3' },
      '20': { bunchedDiameter: '2.0', resistance: '12.0', currentRating: '5.3' },
      '18': { bunchedDiameter: '2.2', resistance: '7.6', currentRating: '8.5' },
      '16': { bunchedDiameter: '2.4', resistance: '4.8', currentRating: '13.5' },
      '14': { bunchedDiameter: '2.6', resistance: '3.0', currentRating: '21.5' },
      '12': { bunchedDiameter: '2.1', resistance: '7.6', currentRating: '20.0' }
    };
    
    return awgTable[awg] || awgTable['12'];
  }

  static calculateInsulationOD(thickness: string): string {
    const thick = parseFloat(thickness);
    return `${(2.1 + 2 * thick).toFixed(1)}-${(2.1 + 2 * thick + 0.2).toFixed(1)}`;
  }

  static generateAutoPopulatedData(parsedModel: ParsedModel) {
    const { productType, conductorDetails, insulationDetails, shieldingDetails, standard } = parsedModel;
    
    const specifications: Specifications = {
      conductor: [
        { sno: 1, parameter: "Conductor Material", units: "Visual", specifications: conductorDetails.material },
        { sno: 2, parameter: "Bunched conductor Size", units: "AWG", specifications: conductorDetails.awg },
        { sno: 3, parameter: "No of strands", units: "Nos", specifications: conductorDetails.strandCount },
        { sno: 4, parameter: "Strand diameter", units: "mm", specifications: conductorDetails.strandDiameter },
        { sno: 5, parameter: "Bunched Dia", units: "mm(nom)", specifications: conductorDetails.bunchedDiameter },
        { sno: 6, parameter: "Conductor Resistance at 20 deg C (max)", units: "Ω/Km (Max)", specifications: conductorDetails.resistance }
      ],
      insulation: [
        { sno: 1, parameter: "Material", units: "Visual", specifications: insulationDetails.material },
        { sno: 2, parameter: "Thickness", units: "mm", specifications: insulationDetails.thickness },
        { sno: 3, parameter: "OD", units: "mm", specifications: insulationDetails.od },
        { sno: 4, parameter: "Color", units: "Visual", specifications: insulationDetails.color },
        { sno: 5, parameter: "No of cores", units: "Nos", specifications: conductorDetails.coreCount },
        { sno: 6, parameter: "Identification Marking", units: "Visual", specifications: "Number marking on each core with 50 mm intervals" }
      ]
    };

    // Add additional sections based on product type
    if (parseInt(conductorDetails.coreCount) > 1) {
      specifications.twisting = [
        { sno: 1, parameter: "Core sequence", units: "Visual", specifications: this.generateCoreSequence(conductorDetails.coreCount) },
        { sno: 2, parameter: "Laid up diameter", units: "mm(max)", specifications: "5.8" },
        { sno: 3, parameter: "Lay direction", units: "Visual", specifications: "RH" },
        { sno: 4, parameter: "Lay length", units: "mm", specifications: "70-90" },
        { sno: 5, parameter: "Wrap tape", units: "Visual", specifications: "Polyester tape with 20% coverage" }
      ];

      specifications.innerJacket = [
        { sno: 1, parameter: "Material", units: "Visual", specifications: "GFR 340 LFH (Sleeve type Extrusion)" },
        { sno: 2, parameter: "Thickness", units: "mm(Nom)", specifications: "0.50" },
        { sno: 3, parameter: "OD", units: "mm", specifications: "6.9-7.0" }
      ];
    }

    if (shieldingDetails) {
      specifications.shielding = [
        { sno: 1, parameter: "Material", units: "Visual", specifications: shieldingDetails.material },
        { sno: 2, parameter: "Construction", units: "Nos/mm", specifications: shieldingDetails.construction },
        { sno: 3, parameter: "Coverage (min)", units: "%", specifications: shieldingDetails.coverage },
        { sno: 4, parameter: "Diameter over Braid", units: "mm(max)", specifications: shieldingDetails.diameterOverBraid }
      ];
    }

    specifications.jacket = [
      { sno: 1, parameter: "Material", units: "Visual", specifications: "GFR 340 LFH (Pressure type Extrusion)" },
      { sno: 2, parameter: "Thickness", units: "mm(Nom)", specifications: "1.40" },
      { sno: 3, parameter: "OD", units: "mm", specifications: "10.3-10.5" },
      { sno: 4, parameter: "Color", units: "Visual", specifications: "Black" },
      { sno: 5, parameter: "Marking on Cable", units: "Visual", specifications: this.generateMarkingText(parsedModel) }
    ];

    // Add electrical and test parameters based on standard
    if (standard === 'def-stan-61-12-part-18') {
      specifications.electrical = [
        { sno: 1, parameter: "Conductor Resistance (20°C)", units: "Ω/km", specifications: `${conductorDetails.resistance} (max), 5.64 (measured)` },
        { sno: 2, parameter: "Current Rating", units: "A", specifications: `~${conductorDetails.currentRating}` },
        { sno: 3, parameter: "Voltage Rating", units: "V", specifications: "600" },
        { sno: 4, parameter: "Dielectric Strength", units: "V", specifications: "1500 (core-to-core, 1 min)" },
        { sno: 5, parameter: "Bending Radius", units: "mm", specifications: "10×OD (flexing), 4×OD (fixed)" }
      ];

      specifications.insulationTests = [
        { sno: 1, parameter: "Critical Oxygen Index", units: "%", specifications: "≥ 29", testResult: "32.5" },
        { sno: 2, parameter: "Smoke Density", units: "%", specifications: "≤ 12", testResult: "8.2" },
        { sno: 3, parameter: "Toxicity Index", units: "-", specifications: "≤ 0.2", testResult: "0.15" },
        { sno: 4, parameter: "Temperature Index", units: "°C", specifications: "≥ 250", testResult: "285" },
        { sno: 5, parameter: "Insulation Resistance", units: "MΩ/km", specifications: "≥ 0.20", testResult: "0.35" },
        { sno: 6, parameter: "Cold Bend Test (-50°C)", units: "-", specifications: "No cracks", testResult: "Pass" }
      ];

      specifications.jacketTests = [
        { sno: 1, parameter: "Critical Oxygen Index", units: "%", specifications: "≥ 29", testResult: "31.8" },
        { sno: 2, parameter: "Smoke Density", units: "%", specifications: "≤ 12", testResult: "9.1" },
        { sno: 3, parameter: "Toxicity Index", units: "-", specifications: "≤ 0.2", testResult: "0.18" },
        { sno: 4, parameter: "Temperature Index", units: "°C", specifications: "≥ 250", testResult: "275" },
        { sno: 5, parameter: "HCl Gas Content", units: "cm³/m", specifications: "≤ 10", testResult: "2.5" },
        { sno: 6, parameter: "Cold Elongation (-30°C)", units: "%", specifications: "≥ 20", testResult: "25" }
      ];
    }

    return {
      specifications,
      standard,
      productType,
      conductorDetails,
      insulationDetails,
      shieldingDetails
    };
  }

  static generateCoreSequence(coreCount: string): string {
    const count = parseInt(coreCount);
    const sequence = Array.from({ length: count }, (_, i) => `${i + 1}`).join('.....');
    return `${sequence}(White core)`;
  }

  static generateMarkingText(parsedModel: ParsedModel): string {
    const { conductorDetails, originalName } = parsedModel;
    const today = new Date();
    const monthYear = today.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase();
    
    return `CUSTOMER NAME ${conductorDetails.coreCount}C X ${conductorDetails.awg} AWG 600V PART NO. SHIELDED DOUBLE SHEATHED LFH CABLE BATCH NO. ${monthYear} Marking Intervals Every -1 Mtr`;
  }
}
