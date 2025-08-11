from flask import Flask, jsonify
from flask_cors import CORS
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import pandas as pd
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Scopes for Drive and Sheets
SCOPES = ['https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/spreadsheets.readonly']

def authenticate():
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

def get_sheet_data():
    try:
        creds = authenticate()
        drive_service = build('drive', 'v3', credentials=creds)
        sheets_service = build('sheets', 'v4', credentials=creds)
        
        # Try multiple folder IDs to find the Standard Technical Datasheet
        FOLDER_IDS = [
            '1Kov8AGSLwywk28rBgr9HaFVzCMwdQnJN',  # Current folder
            '1Kov8AGSLwywk28rBgr9HaFVzCMwdQnJN',  # Try same folder with different search
        ]
        
        all_files = []
        for FOLDER_ID in FOLDER_IDS:
            try:
                query = f"'{FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed = false"
                results = drive_service.files().list(q=query, fields="files(id, name)").execute()
                files = results.get('files', [])
                all_files.extend(files)
                print(f"Found {len(files)} files in folder {FOLDER_ID}")
            except Exception as e:
                print(f"Error accessing folder {FOLDER_ID}: {e}")
        
        # Remove duplicates
        unique_files = []
        seen_ids = set()
        for file in all_files:
            if file['id'] not in seen_ids:
                unique_files.append(file)
                seen_ids.add(file['id'])
        
        files = unique_files
        
        print(f"Fetching sheets from folder: {FOLDER_ID}")
        
        # List all spreadsheets in the folder
        query = f"'{FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed = false"
        results = drive_service.files().list(q=query, fields="files(id, name)").execute()
        files = results.get('files', [])
        
        print(f"Found {len(files)} spreadsheets in folder")
        
        # Also search for files by name to find Standard Technical Datasheet
        try:
            search_query = "name contains 'Standard Technical' or name contains 'Technical Datasheet' or name contains 'Standard Datasheet'"
            search_results = drive_service.files().list(q=search_query, fields="files(id, name)").execute()
            search_files = search_results.get('files', [])
            print(f"Found {len(search_files)} files matching technical datasheet search")
            
            # Add search results to files list
            for search_file in search_files:
                if not any(file['id'] == search_file['id'] for file in files):
                    files.append(search_file)
                    print(f"Added search result: {search_file['name']}")
        except Exception as e:
            print(f"Error in file search: {e}")
        
        all_data = {}
        for file in files:
            spreadsheet_id = file['id']
            spreadsheet_name = file['name']
            
            print(f"Reading spreadsheet: {spreadsheet_name} (ID: {spreadsheet_id})")
            
            try:
                # Get full spreadsheet info
                spreadsheet = sheets_service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
                
                for sheet in spreadsheet['sheets']:
                    sheet_title = sheet['properties']['title']
                    print(f"  Reading sheet: {sheet_title}")
                    
                    # Read all sheets, but prioritize non-production sheets
                    technical_keywords = ['technical', 'specification', 'standard', 'conductor', 'insulation', 'jacket']
                    is_technical_sheet = any(keyword in sheet_title.lower() for keyword in technical_keywords)
                    is_production_sheet = 'production data sheet' in sheet_title.lower()
                    
                    # Read data from each sheet
                    range_name = f"{sheet_title}!A:Z"
                    result = sheets_service.spreadsheets().values().get(
                        spreadsheetId=spreadsheet_id,
                        range=range_name
                    ).execute()
                    
                    values = result.get('values', [])
                    if not values:
                        print(f"    No data found in sheet: {sheet_title}")
                        continue
                    
                    header = values[0]
                    data_rows = values[1:]
                    
                    # Normalize rows
                    normalized_data = []
                    for row in data_rows:
                        normalized_row = row + [''] * (len(header) - len(row))
                        normalized_row = normalized_row[:len(header)]
                        normalized_data.append(normalized_row)
                    
                    # Use spreadsheet name and sheet title as key
                    key = f"{spreadsheet_name} - {sheet_title}"
                    all_data[key] = normalized_data
                    print(f"    Successfully read {len(normalized_data)} rows from {key}")
                    
                    # If this is a technical sheet, prioritize it by placing it first in the data
                    if is_technical_sheet:
                        # Move this sheet to the beginning of all_data
                        temp_data = {key: all_data[key]}
                        for k, v in list(all_data.items()):
                            if k != key:
                                temp_data[k] = v
                        all_data = temp_data
                        print(f"    Prioritized technical sheet: {key}")
                    elif is_production_sheet:
                        # Mark production sheets as lower priority but still include them
                        print(f"    Included production sheet: {key}")
                    
            except Exception as e:
                print(f"Error reading spreadsheet {spreadsheet_name} (ID: {spreadsheet_id}): {e}")
                continue
        
        return all_data
        
    except Exception as e:
        print(f"Error reading spreadsheet: {e}")
        import traceback
        traceback.print_exc()
        return None

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"status": "ok", "message": "Flask server is running"})

@app.route('/sheet-data', methods=['GET'])
def sheet_data():
    data = get_sheet_data()
    if data:
        return jsonify(data)
    else:
        return jsonify({"error": "Failed to fetch sheet data"}), 500

@app.route('/list-sheets', methods=['GET'])
def list_sheets():
    try:
        creds = authenticate()
        drive_service = build('drive', 'v3', credentials=creds)
        
        # Use the same folder ID as in Google_Drive.py
        FOLDER_ID = '1Kov8AGSLwywk28rBgr9HaFVzCMwdQnJN'
        
        query = f"'{FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed = false"
        results = drive_service.files().list(q=query, fields="files(id, name)").execute()
        files = results.get('files', [])
        
        sheets_info = []
        for file in files:
            sheets_info.append({
                'id': file['id'],
                'name': file['name'],
                'url': f"https://docs.google.com/spreadsheets/d/{file['id']}"
            })
        
        return jsonify({
            'folder_id': FOLDER_ID,
            'sheets': sheets_info,
            'count': len(sheets_info)
        })
        
    except Exception as e:
        print(f"Error listing sheets: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to list sheets: {e}"}), 500

@app.route('/list-sheets/<spreadsheet_id>', methods=['GET'])
def list_sheets_in_spreadsheet(spreadsheet_id):
    try:
        creds = authenticate()
        sheets_service = build('sheets', 'v4', credentials=creds)
        
        # Get full spreadsheet info
        spreadsheet = sheets_service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        
        sheets_info = []
        for sheet in spreadsheet['sheets']:
            sheet_title = sheet['properties']['title']
            sheets_info.append({
                'title': sheet_title,
                'sheet_id': sheet['properties']['sheetId']
            })
        
        return jsonify({
            'spreadsheet_id': spreadsheet_id,
            'sheets': sheets_info
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/test-sheet/<sheet_id>', methods=['GET'])
def test_sheet(sheet_id):
    try:
        creds = authenticate()
        sheets_service = build('sheets', 'v4', credentials=creds)
        
        # Get the first 10 rows of the specified sheet
        range_name = "A1:Z10"
        result = sheets_service.spreadsheets().values().get(
            spreadsheetId=sheet_id,
            range=range_name
        ).execute()
        
        values = result.get('values', [])
        
        return jsonify({
            'sheet_id': sheet_id,
            'first_10_rows': values
        })
        
    except Exception as e:
        print(f"Error testing sheet {sheet_id}: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to test sheet: {e}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
