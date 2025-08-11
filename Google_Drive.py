from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
import pandas as pd
import os
import re
from datetime import datetime
from typing import Dict, List, Optional, Tuple

# Scopes for Drive and Sheets
SCOPES = ['https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/spreadsheets.readonly']

# Configuration
OUTPUT_FOLDER_ID = '1Kov8AGSLwywk28rBgr9HaFVzCMwdQnJN'  # Your output folder ID
PRODUCTION_DATASHEET_KEYWORDS = [
    'production', 'datasheet', 'specification', 'technical', 'data sheet',
    'wire', 'cable', 'conductor', 'insulation', 'jacket'
]

def authenticate():
    """Authenticate with Google Drive API"""
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('Paras_credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)

        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    
    return creds

def search_production_datasheets_by_wire_name(wire_name: str, creds) -> List[Dict]:
    """
    Search for production datasheets in the output folder based on wire name
    
    Args:
        wire_name: The name of the wire to search for
        creds: Google credentials
    
    Returns:
        List of matching datasheet files with metadata
    """
    drive_service = build('drive', 'v3', credentials=creds)
    
    # Clean and normalize wire name for search
    normalized_wire_name = re.sub(r'[^\w\s-]', '', wire_name.lower()).strip()
    wire_keywords = normalized_wire_name.split()
    
    print(f"🔍 Searching for datasheets matching wire: '{wire_name}'")
    print(f"📝 Normalized keywords: {wire_keywords}")
    
    # Search in the output folder
    query = f"'{OUTPUT_FOLDER_ID}' in parents and trashed = false"
    results = drive_service.files().list(
        q=query, 
        fields="files(id, name, mimeType, modifiedTime, size)",
        orderBy="modifiedTime desc"
    ).execute()
    
    files = results.get('files', [])
    print(f"📁 Found {len(files)} files in output folder")
    
    matching_files = []
    
    for file in files:
        file_name = file['name'].lower()
        file_id = file['id']
        modified_time = file['modifiedTime']
        
        # Check if file is a spreadsheet or document
        if file['mimeType'] not in [
            'application/vnd.google-apps.spreadsheet',
            'application/vnd.google-apps.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ]:
            continue
        
        # Score the file based on relevance
        relevance_score = 0
        matched_keywords = []
        
        # Check for wire name keywords
        for keyword in wire_keywords:
            if keyword in file_name:
                relevance_score += 10
                matched_keywords.append(keyword)
        
        # Check for production datasheet keywords
        for keyword in PRODUCTION_DATASHEET_KEYWORDS:
            if keyword in file_name:
                relevance_score += 5
                matched_keywords.append(keyword)
        
        # Bonus for exact wire name match
        if normalized_wire_name in file_name:
            relevance_score += 20
        
        # Bonus for recent modifications
        try:
            modified_date = datetime.fromisoformat(modified_time.replace('Z', '+00:00'))
            days_old = (datetime.now().astimezone() - modified_date).days
            if days_old <= 7:  # Last week
                relevance_score += 15
            elif days_old <= 30:  # Last month
                relevance_score += 10
            elif days_old <= 90:  # Last 3 months
                relevance_score += 5
        except:
            pass
        
        if relevance_score > 0:
            matching_files.append({
                'id': file_id,
                'name': file['name'],
                'mimeType': file['mimeType'],
                'modifiedTime': modified_time,
                'relevance_score': relevance_score,
                'matched_keywords': list(set(matched_keywords)),
                'url': f"https://docs.google.com/spreadsheets/d/{file_id}" if 'spreadsheet' in file['mimeType'] else f"https://docs.google.com/document/d/{file_id}"
            })
    
    # Sort by relevance score (highest first)
    matching_files.sort(key=lambda x: x['relevance_score'], reverse=True)
    
    print(f"🎯 Found {len(matching_files)} relevant datasheets")
    for file in matching_files[:5]:  # Show top 5
        print(f"   📄 {file['name']} (Score: {file['relevance_score']}, Keywords: {file['matched_keywords']})")
    
    return matching_files

def extract_datasheet_data(file_info: Dict, creds) -> Optional[Dict]:
    """
    Extract data from a production datasheet
    
    Args:
        file_info: File information from search
        creds: Google credentials
    
    Returns:
        Extracted data or None if failed
    """
    try:
        if 'spreadsheet' in file_info['mimeType']:
            return extract_spreadsheet_data(file_info, creds)
        else:
            return extract_document_data(file_info, creds)
    except Exception as e:
        print(f"❌ Failed to extract data from {file_info['name']}: {e}")
        return None

def extract_spreadsheet_data(file_info: Dict, creds) -> Dict:
    """Extract data from Google Spreadsheet"""
    sheets_service = build('sheets', 'v4', credentials=creds)
    spreadsheet_id = file_info['id']
    
    print(f"📊 Extracting data from spreadsheet: {file_info['name']}")
    
    # Get spreadsheet info
            spreadsheet = sheets_service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
    
    extracted_data = {
        'file_name': file_info['name'],
        'file_id': file_info['id'],
        'file_url': file_info['url'],
        'modified_time': file_info['modifiedTime'],
        'sheets': {},
        'summary': {}
    }
            
            for sheet in spreadsheet['sheets']:
                sheet_title = sheet['properties']['title']
        print(f"   ➤ Processing sheet: {sheet_title}")
                
        try:
            # Read sheet data
                range_name = f"{sheet_title}!A:Z"
                result = sheets_service.spreadsheets().values().get(
                    spreadsheetId=spreadsheet_id,
                    range=range_name
                ).execute()

                values = result.get('values', [])
                if not values:
                    continue

                header = values[0]
                data_rows = values[1:]

                # Normalize rows
                normalized_data = []
                for row in data_rows:
                    normalized_row = row + [''] * (len(header) - len(row))
                    normalized_row = normalized_row[:len(header)]
                    normalized_data.append(normalized_row)
                
            # Create DataFrame
                df = pd.DataFrame(normalized_data, columns=header)
            
            # Store sheet data
            extracted_data['sheets'][sheet_title] = {
                'data': df,
                'row_count': len(df),
                'column_count': len(df.columns),
                'headers': header
            }
            
            # Extract key information
            extracted_data['summary'][sheet_title] = extract_key_information(df, sheet_title)
        
        except Exception as e:
            print(f"      ❌ Failed to process sheet {sheet_title}: {e}")
    
    return extracted_data

def extract_document_data(file_info: Dict, creds) -> Dict:
    """Extract data from Google Document"""
    docs_service = build('docs', 'v1', credentials=creds)
    document_id = file_info['id']
    
    print(f"📄 Extracting data from document: {file_info['name']}")
    
    try:
        document = docs_service.documents().get(documentId=document_id).execute()
        
        # Extract text content
        content = document.get('body', {}).get('content', [])
        text_content = []
        
        for element in content:
            if 'paragraph' in element:
                for para_element in element['paragraph']['elements']:
                    if 'textRun' in para_element:
                        text_content.append(para_element['textRun']['content'])
        
        full_text = ''.join(text_content)
        
        return {
            'file_name': file_info['name'],
            'file_id': file_info['id'],
            'file_url': file_info['url'],
            'modified_time': file_info['modifiedTime'],
            'content': full_text,
            'content_length': len(full_text),
            'type': 'document'
        }
        
    except Exception as e:
        print(f"❌ Failed to extract document data: {e}")
        return None

def extract_key_information(df: pd.DataFrame, sheet_name: str) -> Dict:
    """Extract key information from a sheet"""
    summary = {
        'row_count': len(df),
        'column_count': len(df.columns),
        'has_numeric_data': False,
        'has_specifications': False,
        'key_fields': [],
        'data_types': {}
    }
    
    if len(df) == 0:
        return summary
    
    # Check for numeric data
    numeric_columns = df.select_dtypes(include=['number']).columns
    if len(numeric_columns) > 0:
        summary['has_numeric_data'] = True
        summary['numeric_columns'] = list(numeric_columns)
    
    # Check for specification-related fields
    spec_keywords = ['spec', 'parameter', 'value', 'unit', 'requirement', 'standard']
    for col in df.columns:
        col_lower = str(col).lower()
        if any(keyword in col_lower for keyword in spec_keywords):
            summary['has_specifications'] = True
            summary['key_fields'].append(col)
    
    # Analyze data types
    for col in df.columns:
        col_data = df[col].dropna()
        if len(col_data) > 0:
            # Check if column contains numeric data
            try:
                pd.to_numeric(col_data.iloc[:10])  # Check first 10 values
                summary['data_types'][col] = 'numeric'
            except:
                summary['data_types'][col] = 'text'
    
    return summary

def get_latest_production_datasheet(wire_name: str, creds) -> Optional[Dict]:
    """
    Get the latest production datasheet for a specific wire
    
    Args:
        wire_name: Name of the wire
        creds: Google credentials
    
    Returns:
        Latest datasheet data or None if not found
    """
    print(f"\n🚀 Searching for latest production datasheet for wire: '{wire_name}'")
    
    # Search for matching datasheets
    matching_files = search_production_datasheets_by_wire_name(wire_name, creds)
    
    if not matching_files:
        print(f"❌ No datasheets found for wire: '{wire_name}'")
        return None
    
    # Get the most relevant (highest score) datasheet
    best_match = matching_files[0]
    print(f"🏆 Best match: {best_match['name']} (Score: {best_match['relevance_score']})")
    
    # Extract data from the best match
    datasheet_data = extract_datasheet_data(best_match, creds)
    
    if datasheet_data:
        print(f"✅ Successfully extracted data from {best_match['name']}")
        return datasheet_data
    else:
        print(f"❌ Failed to extract data from {best_match['name']}")
        return None

def integrate_datasheet_into_report(wire_name: str, report_data: Dict, creds) -> Dict:
    """
    Integrate production datasheet data into the report
    
    Args:
        wire_name: Name of the wire
        report_data: Existing report data
        creds: Google credentials
    
    Returns:
        Enhanced report with datasheet data
    """
    print(f"\n🔗 Integrating production datasheet data for wire: '{wire_name}'")
    
    # Get the latest production datasheet
    datasheet_data = get_latest_production_datasheet(wire_name, creds)
    
    if not datasheet_data:
        print("⚠️ No datasheet data found, returning original report")
        return report_data
    
    # Enhance the report with datasheet data
    enhanced_report = report_data.copy()
    
    # Add datasheet metadata
    enhanced_report['production_datasheet'] = {
        'source_file': datasheet_data['file_name'],
        'source_url': datasheet_data['file_url'],
        'last_updated': datasheet_data['modified_time'],
        'extraction_time': datetime.now().isoformat()
    }
    
    # Extract and map actual datasheet values to report fields
    if 'sheets' in datasheet_data:
        enhanced_report['datasheet_sheets'] = {}
        
        # Process each sheet to extract key information
        for sheet_name, sheet_data in datasheet_data['sheets'].items():
            print(f"📊 Processing sheet: {sheet_name}")
            
            try:
                # Store sheet metadata with safe access
                enhanced_report['datasheet_sheets'][sheet_name] = {
                    'summary': sheet_data.get('summary', {}),
                    'headers': sheet_data.get('headers', []),
                    'row_count': sheet_data.get('row_count', 0),
                    'column_count': sheet_data.get('column_count', 0)
                }
                
                # Extract key values for report fields
                if 'data' in sheet_data and sheet_data['data'] is not None:
                    df = sheet_data['data']
                    
                    # Map common datasheet fields to report fields
                    field_mappings = {
                        'itemDescription': ['Product Name', 'Wire Name', 'Cable Type', 'Description', 'Item Description'],
                        'conductor': ['Conductor Type', 'Conductor Material', 'Material'],
                        'insulation': ['Insulation Type', 'Insulation Material', 'Insulation'],
                        'voltage': ['Voltage Rating', 'Rated Voltage', 'Voltage'],
                        'temperature': ['Temperature Rating', 'Operating Temperature', 'Temp Rating'],
                        'standards': ['Standards', 'Reference Standard', 'Standard'],
                        'awg_size': ['AWG Size', 'Conductor Size', 'Size', 'Gauge']
                    }
                    
                    # Extract values for each field
                    for report_field, datasheet_fields in field_mappings.items():
                        for datasheet_field in datasheet_fields:
                            try:
                                # Search for the field in the datasheet
                                if df.shape[0] > 0 and df.shape[1] > 0:
                                    # Check if first column contains string data
                                    first_col = df.iloc[:, 0]
                                    if first_col.dtype == 'object':  # String column
                                        matching_rows = df[first_col.str.contains(datasheet_field, case=False, na=False)]
                                        
                                        if not matching_rows.empty:
                                            # Get the value from the second column
                                            value = matching_rows.iloc[0, 1] if matching_rows.iloc[0].shape[0] > 1 else ''
                                            
                                            if pd.notna(value) and str(value).strip():
                                                print(f"   ✅ Found {datasheet_field}: {value}")
                                                
                                                # Update the report with extracted values
                                                if report_field == 'itemDescription' and not enhanced_report.get('itemDescription'):
                                                    enhanced_report['itemDescription'] = str(value).strip()
                                                elif report_field == 'conductor' and not enhanced_report.get('conductor_type'):
                                                    enhanced_report['conductor_type'] = str(value).strip()
                                                elif report_field == 'insulation' and not enhanced_report.get('insulation_type'):
                                                    enhanced_report['insulation_type'] = str(value).strip()
                                                elif report_field == 'voltage' and not enhanced_report.get('voltage_rating'):
                                                    enhanced_report['voltage_rating'] = str(value).strip()
                                                elif report_field == 'temperature' and not enhanced_report.get('temperature_rating'):
                                                    enhanced_report['temperature_rating'] = str(value).strip()
                                                elif report_field == 'standards' and not enhanced_report.get('referenceStandard'):
                                                    enhanced_report['referenceStandard'] = str(value).strip()
                                                elif report_field == 'awg_size' and not enhanced_report.get('awg_size'):
                                                    enhanced_report['awg_size'] = str(value).strip()
                                                
                                                break  # Found the field, move to next report field
                            except Exception as e:
                                print(f"      ⚠️ Error processing field {datasheet_field}: {e}")
                                continue
            except Exception as e:
                print(f"      ❌ Error processing sheet {sheet_name}: {e}")
                # Store minimal sheet info if processing fails
                enhanced_report['datasheet_sheets'][sheet_name] = {
                    'summary': {},
                    'headers': [],
                    'row_count': 0,
                    'column_count': 0,
                    'error': str(e)
                }
    
    # Add document content if it's a document
    if 'content' in datasheet_data:
        enhanced_report['datasheet_content'] = {
            'text_content': datasheet_data['content'][:1000] + '...' if len(datasheet_data['content']) > 1000 else datasheet_data['content'],
            'full_length': datasheet_data['content_length']
        }
    
    print(f"✅ Successfully integrated datasheet data into report")
    print(f"📋 Extracted fields: {list(enhanced_report.keys())}")
    return enhanced_report

# Example usage functions
def search_and_extract_example():
    """Example of how to use the enhanced functionality"""
    creds = authenticate()
    
    # Example wire names to search for
    wire_names = [
        "12 AWG XLPE Cable",
        "16 AWG PVC Wire",
        "Multi-core Shielded Cable"
    ]
    
    for wire_name in wire_names:
        print(f"\n{'='*60}")
        print(f"🔍 SEARCHING FOR: {wire_name}")
        print(f"{'='*60}")
        
        datasheet_data = get_latest_production_datasheet(wire_name, creds)
        
        if datasheet_data:
            print(f"📊 Datasheet Summary:")
            print(f"   File: {datasheet_data['file_name']}")
            print(f"   Modified: {datasheet_data['modified_time']}")
            
            if 'sheets' in datasheet_data:
                print(f"   Sheets: {list(datasheet_data['sheets'].keys())}")
                for sheet_name, sheet_data in datasheet_data['sheets'].items():
                    print(f"     - {sheet_name}: {sheet_data['row_count']} rows, {sheet_data['column_count']} columns")
        else:
            print(f"❌ No datasheet found for {wire_name}")

if __name__ == '__main__':
    print("🚀 Enhanced Google Drive Integration for Production Datasheets")
    print("=" * 70)
    
    # Run example search
    search_and_extract_example()
