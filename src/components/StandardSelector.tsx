
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StandardSelectorProps {
  selectedStandard: string;
  setSelectedStandard: (value: string) => void;
  wireType: string;
  setWireType: (value: string) => void;
  conductorSize: string;
  setConductorSize: (value: string) => void;
}

export const StandardSelector: React.FC<StandardSelectorProps> = ({
  selectedStandard,
  setSelectedStandard,
  wireType,
  setWireType,
  conductorSize,
  setConductorSize
}) => {
  const standardOptions = [
    { value: 'def-stan-61-12-part-31', label: 'Def Stan 61-12 Part 31 (LFH Sheaths)' },
    { value: 'def-stan-61-12-part-18', label: 'Def Stan 61-12 Part 18 (Equipment Wires)' }
  ];

  const wireTypeOptions = {
    'def-stan-61-12-part-31': [
      { value: 'lf-sheath-85c', label: 'LFH Sheath (-30°C to +105°C, 85°C life)' }
    ],
    'def-stan-61-12-part-18': [
      { value: 'type-1', label: 'Type 1 (Unscreened, Single Core)' },
      { value: 'type-1sb', label: 'Type 1SB (Screened, Single Core)' },
      { value: 'type-1sbm-85', label: 'Type 1SBM 85 (Screened/Sheathed, 85°C)' },
      { value: 'type-1sbm-120', label: 'Type 1SBM 120 (Screened/Sheathed, 120°C)' },
      { value: 'type-2', label: 'Type 2 (Unscreened, Multicore)' },
      { value: 'type-2sb', label: 'Type 2SB (Screened, Multicore)' },
      { value: 'type-2sbm', label: 'Type 2SBM (Screened/Sheathed, Multicore)' }
    ]
  };

  const conductorSizeOptions = [
    { value: '30-awg-7-0.10', label: '30 AWG (7/0.10)' },
    { value: '28-awg-7-0.127', label: '28 AWG (7/0.127)' },
    { value: '26-awg-7-0.16', label: '26 AWG (7/0.16)' },
    { value: '24-awg-7-0.20', label: '24 AWG (7/0.20)' },
    { value: '22-awg-7-0.25', label: '22 AWG (7/0.25)' },
    { value: '20-awg-19-0.18', label: '20 AWG (19/0.18)' },
    { value: '18-awg-19-0.23', label: '18 AWG (19/0.23)' },
    { value: '16-awg-19-0.25', label: '16 AWG (19/0.25)' },
    { value: '14-awg-19-0.30', label: '14 AWG (19/0.30)' },
    { value: '12-awg-37-0.30', label: '12 AWG (37/0.30)' }
  ];

  const handleStandardChange = (value: string) => {
    setSelectedStandard(value);
    setWireType('');
    setConductorSize('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Applicable Standard *</Label>
        <Select value={selectedStandard} onValueChange={handleStandardChange}>
          <SelectTrigger className="border-gray-200">
            <SelectValue placeholder="Select applicable standard" />
          </SelectTrigger>
          <SelectContent>
            {standardOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStandard && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Wire/Cable Type *</Label>
          <Select value={wireType} onValueChange={setWireType}>
            <SelectTrigger className="border-gray-200">
              <SelectValue placeholder="Select wire/cable type" />
            </SelectTrigger>
            <SelectContent>
              {wireTypeOptions[selectedStandard]?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {wireType && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Conductor Size *</Label>
          <Select value={conductorSize} onValueChange={setConductorSize}>
            <SelectTrigger className="border-gray-200">
              <SelectValue placeholder="Select conductor size" />
            </SelectTrigger>
            <SelectContent>
              {conductorSizeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
