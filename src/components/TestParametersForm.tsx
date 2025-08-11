
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TestParameters {
  [key: string]: string;
}

interface TestParametersFormProps {
  standard: string;
  wireType: string;
  testParameters: TestParameters;
  setTestParameters: (params: TestParameters) => void;
}

export const TestParametersForm: React.FC<TestParametersFormProps> = ({
  standard,
  wireType,
  testParameters,
  setTestParameters
}) => {
  const handleParameterChange = (testName: string, value: string) => {
    setTestParameters(prev => ({
      ...prev,
      [testName]: value
    }));
  };

  const getTestParameters = () => {
    if (standard === 'def-stan-61-12-part-31') {
      return [
        { test: 'tensileStrength', label: 'Tensile Strength', unit: 'N/mm²', limit: '≥ 8', method: 'BS 903' },
        { test: 'elongationAtBreak', label: 'Elongation at Break', unit: '%', limit: '≥ 200', method: 'BS 6469' },
        { test: 'tearResistance', label: 'Tear Resistance', unit: 'N/mm', limit: '≥ 5', method: 'Longitudinal Cut' },
        { test: 'criticalOxygenIndex', label: 'Critical Oxygen Index', unit: '%', limit: '≥ 29', method: 'BS 2782 Method 141' },
        { test: 'temperatureIndex', label: 'Temperature Index', unit: '°C', limit: '≥ 250', method: 'ISO 4589-3 Annex A' },
        { test: 'toxicityIndex', label: 'Toxicity Index', unit: 'per 100g', limit: '≤ 5', method: 'Def Stan 61-12 Part 0' },
        { test: 'smokeIndex', label: 'Smoke Index', unit: '-', limit: '≤ 20', method: 'Def Stan 61-12 Part 0' },
        { test: 'halogenContent', label: 'Halogen Content', unit: '-', limit: 'Negative', method: 'Lassaigne Test' },
        { test: 'coldElongation', label: 'Cold Elongation (-30°C)', unit: '%', limit: '≥ 20', method: 'BS 6469' },
        { test: 'heatShock', label: 'Heat Shock (150°C, 4h)', unit: '-', limit: 'No Cracking', method: 'BS 6469' },
        { test: 'insulationResistance', label: 'Insulation Resistance Constant', unit: 'MΩ·km', limit: '≥ 0.1', method: 'Standard Method' },
        { test: 'hotSet', label: 'Hot Set (200°C) - Max Elongation', unit: '%', limit: '≤ 175', method: 'BS 6469' },
        { test: 'hotSetPermanent', label: 'Hot Set - Permanent Elongation', unit: '%', limit: '≤ 25', method: 'BS 6469' },
        { test: 'pressureTest', label: 'Pressure Test (120°C)', unit: '%', limit: '≤ 50', method: 'BS 6469' },
        { test: 'ozoneResistance', label: 'Ozone Resistance', unit: 'hours', limit: '120 (80-100 ppm)', method: 'BS 6469' },
        { test: 'uvResistance', label: 'UV Resistance', unit: 'hours', limit: '1000', method: 'Def Stan 61-12 Part 0' }
      ];
    } else if (standard === 'def-stan-61-12-part-18') {
      return [
        { test: 'conductorResistance', label: 'Conductor Resistance (20°C)', unit: 'Ω/km', limit: 'Per Table B', method: 'BS 2G 231' },
        { test: 'insulationDielectric', label: 'Insulation Dielectric Constant (1 kHz)', unit: '-', limit: '≤ 4', method: 'Standard Method' },
        { test: 'screenFillingFactor', label: 'Screen Braid Filling Factor', unit: '-', limit: '≥ 0.5', method: 'Visual/Calculation' },
        { test: 'insulationResistance', label: 'Insulation Resistance (20°C)', unit: 'MΩ·km', limit: '≥ 0.2', method: 'Standard Method' },
        { test: 'voltageWithstand', label: 'Voltage Withstand Test', unit: 'V', limit: 'Per Standard', method: 'AC Test' },
        { test: 'flammabilityTest', label: 'Flammability Test', unit: '-', limit: 'Self-Extinguishing', method: 'Per Standard' },
        { test: 'toxicityIndex', label: 'Toxicity Index', unit: '-', limit: '≤ 0.2 (Std) / ≤ 1.5 (Maint)', method: 'Per Standard' },
        { test: 'smokeEmission', label: 'Smoke Emission', unit: '-', limit: 'Per Standard', method: 'Per Standard' },
        { test: 'temperatureRating', label: 'Temperature Rating', unit: '°C', limit: '-50 to +120 (or +85)', method: 'Thermal Test' },
        { test: 'thermalEndurance', label: 'Thermal Endurance (40,000h)', unit: 'hours', limit: '40,000 at rated temp', method: 'BS EN 60216-1' }
      ];
    }
    return [];
  };

  const testParamDefinitions = getTestParameters();

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-gray-800">Test Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Parameter</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Limit</TableHead>
                <TableHead>Test Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testParamDefinitions.map((param) => (
                <TableRow key={param.test}>
                  <TableCell className="font-medium">{param.label}</TableCell>
                  <TableCell>{param.unit}</TableCell>
                  <TableCell className="text-sm text-blue-600">{param.limit}</TableCell>
                  <TableCell>
                    <Input
                      placeholder="Enter value"
                      value={testParameters[param.test] || ''}
                      onChange={(e) => handleParameterChange(param.test, e.target.value)}
                      className="w-24 h-8 text-sm"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
