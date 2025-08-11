# PDS Report Generator Tool

Professional Production Data Sheet Generator for Cable Manufacturing with Google Drive Integration

## 🚀 New Feature: Google Drive Production Datasheet Integration

The application now includes advanced Google Drive integration that automatically searches for and integrates production datasheets based on wire names.

### How It Works

1. **Input Wire Name**: Enter a wire specification in the frontend (e.g., "12 AWG XLPE Cable", "16 AWG PVC Wire")
2. **Automatic Search**: Click "Search Datasheets" to search Google Drive output folder
3. **Smart Matching**: System finds the most relevant production datasheets using intelligent scoring
4. **Data Integration**: Automatically integrate found datasheet data into generated reports
5. **Enhanced Reports**: Reports now include real production data from Google Drive

### Features

- **Intelligent Search**: Uses wire name keywords and production datasheet indicators
- **Relevance Scoring**: Ranks results by wire name match, file type, and recency
- **Multiple Formats**: Supports Google Sheets, Google Docs, Excel files
- **Automatic Integration**: Seamlessly adds datasheet data to reports
- **Real-time Status**: Shows search progress and integration status

## 🛠️ Setup Instructions

### 1. Python Backend Setup

```bash
# Optional: Only if you need Google Drive integration
pip install -r requirements.txt
# Configure Google Drive credentials as 'Paras_credentials.json'
# Start the Flask API server (optional)
python test_server.py
```

The server will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### Feature Flags (to avoid runtime errors in deployment)

Create `.env` (or `.env.local`) in the project root:

```
VITE_ENABLE_DRIVE_INTEGRATION=false
VITE_ENABLE_SHEET_FETCH=false
```

- When both flags are false (default), the app does not call Flask/Drive and will not show connection errors.
- Set to `true` only when you have the Python server running and credentials configured.

## 📁 Google Drive Configuration

### Required Setup

1. **Output Folder**: Configure your Google Drive output folder ID in `Google_Drive.py`
2. **Credentials**: Place your Google service account credentials in `Paras_credentials.json`
3. **Permissions**: Ensure the service account has access to the output folder

### Folder Structure

```
Google Drive Output Folder/
├── Production_Datasheet_12AWG_XLPE.xlsx
├── Technical_Specs_16AWG_PVC.docx
├── Cable_Specifications_MultiCore.xlsx
└── Wire_Standards_DEF_STAN.xlsx
```

## 🔍 API Endpoints

### Search Datasheets
```http
POST /api/search-datasheets
{
  "wire_name": "12 AWG XLPE Cable"
}
```

### Get Datasheet Data
```http
POST /api/get-datasheet
{
  "file_id": "file_id_here",
  "wire_name": "12 AWG XLPE Cable"
}
```

### Integrate into Report
```http
POST /api/integrate-datasheet
{
  "wire_name": "12 AWG XLPE Cable",
  "report_data": { ... }
}
```

### Auto-generate Report
```http
POST /api/auto-generate-report
{
  "wire_name": "12 AWG XLPE Cable",
  "standard_name": "DEF STAN 61-12"
}
```

## 💡 Usage Examples

### Example 1: Search for Cable Datasheets
1. Enter wire name: "Multi-core Shielded Cable"
2. Click "Search Datasheets"
3. View found datasheets with relevance scores
4. Click "Integrate into Report" to include data

### Example 2: Auto-generate Enhanced Report
1. Enter wire name: "16 AWG PVC Wire"
2. Select standard: "DEF STAN 61-12"
3. Click "Generate Report"
4. System automatically searches and integrates datasheet data

## 🔧 Technical Details

### Search Algorithm
- **Keyword Matching**: Extracts wire name keywords for search
- **File Type Detection**: Identifies spreadsheets, documents, and Excel files
- **Relevance Scoring**: Combines keyword match, file type, and modification date
- **Smart Filtering**: Prioritizes production-related files

### Data Extraction
- **Spreadsheets**: Extracts all sheets with headers and data
- **Documents**: Extracts text content and metadata
- **Excel Files**: Converts to structured data format

### Integration Process
1. Search for matching datasheets
2. Extract relevant data
3. Enhance report structure
4. Include datasheet metadata and content
5. Update report generation process

## 📊 Report Enhancement

Reports now include:
- **Datasheet Source**: File name, URL, and modification date
- **Extracted Data**: Sheet summaries, headers, and data types
- **Integration Status**: Success/failure indicators
- **Enhanced Specifications**: Real production data when available

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Errors**: Check Google credentials and permissions
2. **No Results Found**: Verify wire name format and folder access
3. **Integration Failures**: Check API server status and network connectivity

### Debug Information

- Frontend console shows detailed search progress
- Backend logs display API request details
- Integration status indicators show current state

## 🔮 Future Enhancements

- **Batch Processing**: Process multiple wire names simultaneously
- **Advanced Filtering**: Date range and file type filters
- **Data Validation**: Verify extracted data quality
- **Template Matching**: Auto-detect datasheet formats
- **Real-time Updates**: Monitor folder changes automatically

## 📝 License

This project is proprietary software for Paras Wires.

---

**Note**: Ensure your Google Drive credentials are properly configured and the output folder contains production datasheets for optimal functionality.
