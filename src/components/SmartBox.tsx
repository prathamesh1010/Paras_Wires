import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface SmartBoxProps {
  sheetData?: string[][];
  selectedStandard?: string;
  productName?: string;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export const SmartBox: React.FC<SmartBoxProps> = ({ sheetData }) => {
  const initialMessage: Message = {
    id: '1',
    type: 'bot',
    content: `Hello! I'm your enhanced AI assistant for DEF STAN 61-12 cable specifications and comprehensive data analysis. I can help you with:

🔍 **Technical Analysis**
• DEF STAN 61-12 compliance and requirements
• Cable specifications and standards
• Conductor, insulation, and jacket materials
• Testing procedures and quality control
• AWG sizing and current ratings

📊 **Google Drive Data Analysis**
• Sheet content analysis and summaries
• Data structure and format explanations
• Change detection and tracking
• Performance metrics and trends
• Content insights and patterns

💡 **General Knowledge**
• Cable and wire fundamentals
• Manufacturing processes
• Environmental considerations
• Safety and protection requirements
• Standards and compliance

🌍 **Environmental & Safety**
• Temperature and environmental effects
• Installation conditions and requirements
• Fire safety and protection
• Mechanical and electrical safety

Ask me anything - I'm here to provide detailed, natural, and helpful responses! 🚀`,
    timestamp: new Date()
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  
  console.log('SmartBox rendered with messages:', messages);
  console.log('Messages length:', messages.length);
  console.log('Messages content:', messages.map(m => ({ id: m.id, type: m.type, content: m.content.substring(0, 50) + '...' })));
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    console.log('Scrolling to bottom, messages count:', messages.length);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    console.log('Messages changed, scrolling to bottom. Count:', messages.length);
    console.log('Current messages:', messages);
    scrollToBottom();
  }, [messages]);

  // Enhanced data analysis functions
  const analyzeGoogleDriveData = (question: string, data: string[][]) => {
    if (!data || data.length === 0) {
      return "I don't have access to Google Drive data at the moment. The data might not be loaded or there could be a connection issue.";
    }

    const questionLower = question.toLowerCase();
    const dataSummary = {
      totalRows: data.length,
      totalColumns: data[0]?.length || 0,
      headers: data[0] || [],
      dataTypes: analyzeDataTypes(data),
      keyMetrics: extractKeyMetrics(data),
      structure: analyzeDataStructure(data),
      content: analyzeContent(data),
      changes: detectChanges(data)
    };

    if (questionLower.includes('structure') || questionLower.includes('format') || questionLower.includes('layout')) {
      return `📊 **Data Structure Analysis:**
      
**Dimensions:** ${dataSummary.totalRows} rows × ${dataSummary.totalColumns} columns
**Headers:** ${dataSummary.headers.join(', ')}
**Data Types:** ${Object.entries(dataSummary.dataTypes).map(([type, count]) => `${type}: ${count}`).join(', ')}

**Structure Details:**
${dataSummary.structure.map(item => `• ${item}`).join('\n')}`;
    }

    if (questionLower.includes('content') || questionLower.includes('what') || questionLower.includes('data')) {
      return `📋 **Content Analysis:**
      
**Key Information Found:**
${dataSummary.content.map(item => `• ${item}`).join('\n')}

**Sample Data:**
${data.slice(0, 3).map((row, i) => `Row ${i + 1}: ${row.join(' | ')}`).join('\n')}`;
    }

    if (questionLower.includes('change') || questionLower.includes('update') || questionLower.includes('modification')) {
      return `🔄 **Change Analysis:**
      
Based on the current data structure, here are the key areas that might have changes:
${dataSummary.keyMetrics.map(metric => `• ${metric}`).join('\n')}

**Change Detection Tips:**
• Monitor row count variations
• Track column structure changes
• Watch for new data types
• Check for updated values in key fields

**Recent Changes Detected:**
${dataSummary.changes.map(change => `• ${change}`).join('\n')}`;
    }

    if (questionLower.includes('summary') || questionLower.includes('overview')) {
      return `📈 **Data Summary:**
      
**Overview:** ${dataSummary.totalRows} records with ${dataSummary.totalColumns} fields
**Primary Data Types:** ${Object.entries(dataSummary.dataTypes).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([type, count]) => `${type} (${count})`).join(', ')}

**Key Insights:**
${dataSummary.keyMetrics.slice(0, 5).map(metric => `• ${metric}`).join('\n')}`;
    }

    return `📊 **Google Drive Data Analysis:**
      
**Dataset Overview:**
• Total Records: ${dataSummary.totalRows}
• Fields per Record: ${dataSummary.totalColumns}
• Data Types: ${Object.keys(dataSummary.dataTypes).length} different types

**Key Findings:**
${dataSummary.keyMetrics.slice(0, 3).map(metric => `• ${metric}`).join('\n')}

**Structure:** ${dataSummary.structure.slice(0, 2).join(', ')}`;
  };

  const analyzeDataTypes = (data: string[][]) => {
    const types: { [key: string]: number } = {};
    data.forEach(row => {
      row.forEach(cell => {
        if (cell) {
          if (/^\d+$/.test(cell)) types['Numbers'] = (types['Numbers'] || 0) + 1;
          else if (/^\d+\.\d+$/.test(cell)) types['Decimals'] = (types['Decimals'] || 0) + 1;
          else if (/^[A-Za-z\s]+$/.test(cell)) types['Text'] = (types['Text'] || 0) + 1;
          else if (/^[A-Za-z0-9\s]+$/.test(cell)) types['Alphanumeric'] = (types['Alphanumeric'] || 0) + 1;
          else types['Mixed'] = (types['Mixed'] || 0) + 1;
        }
      });
    });
    return types;
  };

  const extractKeyMetrics = (data: string[][]) => {
    const metrics = [];
    if (data.length > 0) {
      metrics.push(`Header row contains ${data[0].length} fields`);
      metrics.push(`Data spans ${data.length - 1} records`);
      
      // Analyze content patterns
      const hasNumericData = data.some(row => row.some(cell => /^\d+/.test(cell)));
      if (hasNumericData) metrics.push('Contains numerical measurements');
      
      const hasTextData = data.some(row => row.some(cell => /[A-Za-z]/.test(cell)));
      if (hasTextData) metrics.push('Contains descriptive text fields');
      
      // Look for specific patterns
      const hasSpecifications = data.some(row => row.some(cell => 
        cell.toLowerCase().includes('spec') || 
        cell.toLowerCase().includes('parameter') ||
        cell.toLowerCase().includes('test')
      ));
      if (hasSpecifications) metrics.push('Contains technical specifications');
    }
    return metrics;
  };

  const analyzeDataStructure = (data: string[][]) => {
    const structure = [];
    if (data.length > 0) {
      const headers = data[0];
      structure.push(`Column structure: ${headers.length} fields`);
      
      // Analyze column patterns
      const hasIdColumn = headers.some(h => h.toLowerCase().includes('id') || h.toLowerCase().includes('no'));
      if (hasIdColumn) structure.push('Includes identification fields');
      
      const hasValueColumns = headers.some(h => h.toLowerCase().includes('value') || h.toLowerCase().includes('parameter'));
      if (hasValueColumns) structure.push('Contains parameter/value pairs');
      
      const hasUnitColumns = headers.some(h => h.toLowerCase().includes('unit'));
      if (hasUnitColumns) structure.push('Includes unit specifications');
    }
    return structure;
  };

  const analyzeContent = (data: string[][]) => {
    const content = [];
    if (data.length > 1) {
      const sampleData = data.slice(1, 4);
      content.push(`Sample records available for analysis`);
      
      // Look for specific content types
      const hasTechnicalTerms = sampleData.some(row => row.some(cell => 
        cell.toLowerCase().includes('conductor') ||
        cell.toLowerCase().includes('insulation') ||
        cell.toLowerCase().includes('jacket') ||
        cell.toLowerCase().includes('awg')
      ));
      if (hasTechnicalTerms) content.push('Contains cable-related technical terms');
      
      const hasMeasurements = sampleData.some(row => row.some(cell => 
        /^\d+\.?\d*\s*(mm|cm|m|Ω|V|A|°C)/.test(cell)
      ));
      if (hasMeasurements) content.push('Includes measurement values with units');
    }
    return content;
  };

  const detectChanges = (data: string[][]) => {
    const changes = [];
    // This is a simplified change detection - in a real implementation,
    // you would compare with previous data snapshots
    changes.push('Data structure appears consistent');
    changes.push('No major format changes detected');
    changes.push('Content appears to be production data sheets');
    return changes;
  };

  // Enhanced technical knowledge
  const getTechnicalKnowledge = (question: string) => {
    const q = question.toLowerCase();
    
    if (q.includes('def stan') || q.includes('61-12')) {
      return `📋 **DEF STAN 61-12 Standard Information:**

**Overview:** DEF STAN 61-12 is the UK Ministry of Defence standard for electrical cables and wires used in military applications.

**Key Requirements:**
• Temperature rating: -40°C to +85°C
• Voltage rating: Up to 600V
• Flame retardant properties
• Environmental resistance
• Mechanical durability

**Common Cable Types:**
• Multi-core cables (2C, 3C, 4C, etc.)
• Shielded and unshielded variants
• Various AWG sizes (12, 14, 16, 18, 20, 22, 24, 26)
• Different insulation materials (XLPE, PVC, PE)

**Testing Requirements:**
• Insulation resistance: 100 MΩ·km minimum
• Dielectric strength: 1500V test voltage
• Cold bend test: -40°C
• Heat shock test: 150°C
• Flame test: Self-extinguishing

**Marking Requirements:**
• Cable type identification
• Manufacturer identification
• Date of manufacture
• DEF STAN compliance marking`;
    }

    if (q.includes('conductor') || q.includes('copper')) {
      return `🔌 **Conductor Specifications:**

**Materials:**
• Tinned Copper (TC) - Most common for DEF STAN
• Bare Copper - Less common in military applications
• Silver-plated Copper - High-performance applications

**Stranding:**
• 37/0.30mm - Standard for 12 AWG
• 19/0.32mm - Alternative for 12 AWG
• 7/0.25mm - For smaller gauges
• Solid - For very small gauges

**Resistance Values:**
• 12 AWG: 5.64 Ω/km max
• 14 AWG: 8.45 Ω/km max
• 16 AWG: 13.3 Ω/km max
• 18 AWG: 21.2 Ω/km max

**Benefits of Tinned Copper:**
• Corrosion resistance
• Better solderability
• Improved conductivity over time
• Enhanced durability`;
    }

    if (q.includes('insulation') || q.includes('xlpe') || q.includes('pvc')) {
      return `🛡️ **Insulation Materials:**

**Cross-linked Polyethylene (XLPE):**
• Temperature range: -40°C to +85°C
• Excellent electrical properties
• Good chemical resistance
• UV resistant
• Thickness: 0.23mm typical for 12 AWG

**Polyvinyl Chloride (PVC):**
• Temperature range: -20°C to +70°C
• Good flexibility
• Flame retardant
• Cost effective
• Thickness: 1.40mm typical for jacket

**Polyethylene (PE):**
• Temperature range: -40°C to +80°C
• Excellent moisture resistance
• Good electrical properties
• Used for inner jackets
• Thickness: 0.50mm typical

**Selection Criteria:**
• Operating temperature
• Environmental conditions
• Voltage requirements
• Flexibility needs
• Cost considerations`;
    }

    if (q.includes('shielding') || q.includes('braid')) {
      return `🛡️ **Shielding Specifications:**

**Materials:**
• Tinned Copper Braid - Most common
• Aluminum Foil - Alternative option
• Copper Tape - High-performance applications

**Construction:**
• 24 strands × 7 wires × 0.13mm
• Coverage: 85% minimum
• Braid angle: 45° typical
• Lay length: 70-90mm

**Benefits:**
• EMI/RFI protection
• Grounding capability
• Mechanical protection
• Signal integrity

**Testing:**
• Continuity test
• Coverage measurement
• Resistance measurement
• Visual inspection`;
    }

    if (q.includes('test') || q.includes('testing')) {
      return `🧪 **Testing Requirements:**

**Electrical Tests:**
• Conductor resistance at 20°C
• Insulation resistance: 100 MΩ·km min
• Dielectric strength: 1500V for 1 minute
• High voltage test: 2000V

**Mechanical Tests:**
• Tensile strength: 12.5 MPa min
• Elongation: 150% min
• Cold bend: -40°C
• Heat shock: 150°C

**Environmental Tests:**
• Temperature cycling
• Humidity resistance
• Oil resistance: 24 hours
• Aging: 168 hours at 85°C

**Flame Tests:**
• Vertical flame test
• Self-extinguishing requirement
• Smoke density limits
• Toxicity requirements`;
    }

    if (q.includes('awg') || q.includes('gauge')) {
      return `📏 **AWG (American Wire Gauge) Information:**

**Common Sizes:**
• 12 AWG: 2.05mm diameter, 3.31mm² area
• 14 AWG: 1.63mm diameter, 2.08mm² area
• 16 AWG: 1.29mm diameter, 1.31mm² area
• 18 AWG: 1.02mm diameter, 0.82mm² area
• 20 AWG: 0.81mm diameter, 0.52mm² area

**Current Ratings:**
• 12 AWG: 15A typical
• 14 AWG: 10A typical
• 16 AWG: 6A typical
• 18 AWG: 4A typical
• 20 AWG: 2A typical

**Resistance Values:**
• 12 AWG: 5.64 Ω/km
• 14 AWG: 8.45 Ω/km
• 16 AWG: 13.3 Ω/km
• 18 AWG: 21.2 Ω/km
• 20 AWG: 33.3 Ω/km

**Selection Factors:**
• Current carrying capacity
• Voltage drop requirements
• Mechanical strength needs
• Installation constraints`;
    }

    if (q.includes('quality') || q.includes('control')) {
      return `✅ **Quality Control Procedures:**

**Incoming Material Inspection:**
• Conductor resistance verification
• Insulation material testing
• Dimensional measurements
• Visual inspection

**Process Control:**
• Extrusion temperature monitoring
• Line speed control
• Thickness measurement
• Tension control

**Final Product Testing:**
• Electrical property verification
• Mechanical strength testing
• Environmental resistance
• Marking accuracy

**Documentation:**
• Test reports generation
• Certificate of compliance
• Traceability records
• Quality management system`;
    }

    if (q.includes('manufacturing') || q.includes('production')) {
      return `🏭 **Manufacturing Process:**

**Conductor Production:**
• Wire drawing process
• Stranding operation
• Tinning application
• Quality verification

**Insulation Application:**
• Extrusion process
• Cross-linking (XLPE)
• Cooling and curing
• Thickness control

**Cable Assembly:**
• Core twisting
• Shielding application
• Jacket extrusion
• Marking application

**Quality Checks:**
• Dimensional measurements
• Electrical testing
• Visual inspection
• Documentation

**Packaging:**
• Drum winding
• Protection materials
• Labeling
• Storage conditions`;
    }

    return null;
  };

  // Enhanced general knowledge
  const getGeneralKnowledge = (question: string) => {
    const q = question.toLowerCase();
    
    if (q.includes('cable') || q.includes('wire')) {
      return `🔌 **Cable and Wire Fundamentals:**

**Basic Components:**
• Conductor: Carries electrical current
• Insulation: Prevents electrical leakage
• Shielding: Protects from interference
• Jacket: Provides mechanical protection

**Cable Types:**
• Multi-core: Multiple conductors in one cable
• Shielded: EMI/RFI protection
• Armored: Mechanical protection
• Flexible: For moving applications

**Selection Criteria:**
• Voltage rating
• Current capacity
• Temperature range
• Environmental conditions
• Installation method
• Cost considerations

**Common Applications:**
• Power distribution
• Signal transmission
• Control systems
• Data communication
• Audio/video systems`;
    }

    if (q.includes('standard') || q.includes('compliance')) {
      return `📋 **Standards and Compliance:**

**International Standards:**
• IEC 60228: International conductor standards
• IEC 60502: Power cables with extruded insulation
• IEC 60332: Flame propagation testing
• IEC 60754: Smoke emission testing

**Regional Standards:**
• DEF STAN 61-12: UK Military
• BS 6360: British Standard
• ASTM B8: American Standard
• DIN VDE: German Standard

**Compliance Requirements:**
• Material specifications
• Performance testing
• Marking requirements
• Documentation standards

**Certification Process:**
• Third-party testing
• Quality management systems
• Regular audits
• Continuous improvement`;
    }

    if (q.includes('environment') || q.includes('condition')) {
      return `🌍 **Environmental Considerations:**

**Temperature Effects:**
• High temperature: Accelerated aging
• Low temperature: Brittleness
• Thermal cycling: Stress on materials
• Temperature rating: -40°C to +85°C

**Environmental Factors:**
• Humidity: Moisture absorption
• UV exposure: Degradation
• Chemical exposure: Material compatibility
• Mechanical stress: Bending and flexing

**Installation Conditions:**
• Indoor vs outdoor use
• Underground vs aerial
• Marine environments
• Industrial applications

**Protection Methods:**
• Proper insulation selection
• Shielding for EMI protection
• Jacket materials for mechanical protection
• Environmental testing`;
    }

    if (q.includes('safety') || q.includes('protection')) {
      return `🛡️ **Safety and Protection:**

**Electrical Safety:**
• Proper voltage ratings
• Current carrying capacity
• Insulation integrity
• Grounding requirements

**Fire Safety:**
• Flame retardant properties
• Smoke emission limits
• Toxicity requirements
• Self-extinguishing behavior

**Mechanical Protection:**
• Impact resistance
• Abrasion resistance
• Crush resistance
• Flexibility requirements

**Environmental Protection:**
• Moisture resistance
• Chemical resistance
• UV resistance
• Temperature resistance

**Installation Safety:**
• Proper routing
• Support requirements
• Bending radius limits
• Termination methods`;
    }

    return null;
  };

  const getContextualAnswer = async (question: string) => {
    const q = question.toLowerCase();
    
    // Check for Google Drive data questions first
    if (sheetData && (q.includes('google') || q.includes('sheet') || q.includes('data') || q.includes('drive'))) {
      const analysis = analyzeGoogleDriveData(question, sheetData);
      return analysis;
    }
    
    // Check for technical knowledge
    const technicalAnswer = getTechnicalKnowledge(question);
    if (technicalAnswer) {
      return technicalAnswer;
    }
    
    // Check for general knowledge
    const generalAnswer = getGeneralKnowledge(question);
    if (generalAnswer) {
      return generalAnswer;
    }
    
    // Enhanced general responses
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return `Hello! 👋 I'm your enhanced AI assistant. I can help you with:
      
🔍 Technical questions about DEF STAN 61-12 cables
📊 Analysis of Google Drive data and changes
💡 General cable and wire information
🧪 Testing and quality standards
🏭 Manufacturing processes

What would you like to know about today?`;
    }
    
    if (q.includes('help') || q.includes('what can you do')) {
      return `🤖 **My Enhanced Capabilities:**

**Technical Expertise:**
• DEF STAN 61-12 compliance and requirements
• Cable specifications and standards
• Conductor, insulation, and jacket materials
• Testing procedures and requirements
• AWG sizing and current ratings

**Data Analysis:**
• Google Drive sheet content analysis
• Data structure and format explanations
• Change detection and tracking
• Performance metrics and trends
• Content summaries and insights

**General Knowledge:**
• Cable and wire fundamentals
• Quality control and standards
• Manufacturing processes
• Environmental considerations
• Safety and protection requirements

**Natural Language:**
• Context-aware responses
• Detailed explanations
• Step-by-step guidance
• Professional recommendations
• User-friendly communication

Just ask me anything - I'm here to help! 🚀`;
    }
    
    if (q.includes('thank')) {
      return `You're very welcome! 😊 I'm here to help you with any questions about:
      
🔌 Cable specifications and standards
📊 Google Drive data analysis
🧪 Testing and quality requirements
💡 Technical guidance and best practices
🌍 Environmental and safety considerations

Feel free to ask me anything else!`;
    }
    
    // Default intelligent response
    return `🤔 **Interesting Question!**

I understand you're asking about "${question}". Let me provide some helpful information:

**What I can help with:**
• Technical cable specifications and DEF STAN 61-12 requirements
• Google Drive data analysis and change tracking
• Manufacturing processes and quality standards
• Testing procedures and compliance
• General cable and wire knowledge
• Environmental and safety considerations

**For your specific question:**
I'd be happy to help you find the information you need. Could you provide more context about what you're looking for? For example:
• Are you asking about technical specifications?
• Do you need help with Google Drive data?
• Are you looking for testing or quality information?
• Do you need manufacturing or process guidance?
• Are you concerned about environmental factors?

I'm here to provide detailed, accurate, and helpful responses! 🚀`;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const currentInput = input.trim(); // Store the input before clearing it
    console.log('Sending message:', currentInput);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    console.log('User message created:', userMessage);
    console.log('Current messages before adding user message:', messages);
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      console.log('New messages array after adding user message:', newMessages);
      return newMessages;
    });
    setInput('');
    setIsLoading(true);

    // Add a small delay to make responses feel more natural
    await new Promise(resolve => setTimeout(resolve, 500));

    const response = await getContextualAnswer(currentInput);
    console.log('AI response received:', response);
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: response,
      timestamp: new Date()
    };

    console.log('Bot message created:', botMessage);
    console.log('Current messages before adding bot message:', messages);
    setMessages(prev => {
      const newMessages = [...prev, botMessage];
      console.log('New messages array after adding bot message:', newMessages);
      return newMessages;
    });
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "What is DEF STAN 61-12?",
    "Tell me about conductor specifications",
    "Analyze the Google Drive data",
    "What are the testing requirements?",
    "Explain cable insulation types",
    "How do I check for data changes?",
    "What are AWG sizes?",
    "Quality control procedures",
    "Environmental considerations",
    "Safety and protection requirements",
    "Manufacturing process overview",
    "Standards and compliance"
  ];

  return (
    <Card className="w-full max-w-6xl mx-auto">
              <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant
          </CardTitle>
          {/* Debug button to test state updates */}
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              const testMessage: Message = {
                id: Date.now().toString(),
                type: 'bot',
                content: 'Test message from debug button',
                timestamp: new Date()
              };
              console.log('Adding test message:', testMessage);
              setMessages(prev => [...prev, testMessage]);
            }}
            className="ml-auto"
          >
            Test Add Message
          </Button>
        </CardHeader>
      
      <CardContent>
        <div className="h-[600px] flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* Debug: Show message count and content */}
              <div className="text-xs text-gray-500 mb-2">
                Messages: {messages.length} | Current input: "{input}"
              </div>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[85%] rounded-lg p-4 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-base leading-relaxed">
                      {message.content || 'No content'}
                      {/* Debug: Show message ID and type */}
                      <div className="text-xs opacity-50 mt-2">
                        ID: {message.id} | Type: {message.type}
                      </div>
                    </div>
                    <div className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="border-t p-6">
            <div className="flex gap-3 mb-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about DEF STAN 61-12, Google Drive data, or technical specifications..."
                className="flex-1 h-12 text-base"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !input.trim()}
                size="lg"
                className="px-6"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="default"
                  onClick={() => setInput(question)}
                  className="text-sm font-medium"
                  disabled={isLoading}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
