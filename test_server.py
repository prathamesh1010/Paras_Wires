from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
import json
from Google_Drive import (
    authenticate, 
    get_latest_production_datasheet, 
    integrate_datasheet_into_report,
    search_production_datasheets_by_wire_name
)
import traceback
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Google Drive Integration API is running',
        'version': '1.0.0'
    })

@app.route('/api/search-datasheets', methods=['POST'])
def search_datasheets():
    """Search for production datasheets by wire name"""
    try:
        data = request.get_json()
        wire_name = data.get('wire_name', '').strip()
        
        if not wire_name:
            return jsonify({
                'success': False,
                'error': 'Wire name is required'
            }), 400
        
        print(f"🔍 Frontend request: Searching for datasheets for wire '{wire_name}'")
        
        # Authenticate with Google Drive
        creds = authenticate()
        
        # Search for datasheets
        matching_files = search_production_datasheets_by_wire_name(wire_name, creds)
        
        if not matching_files:
            return jsonify({
                'success': True,
                'message': f'No datasheets found for wire: {wire_name}',
                'datasheets': [],
                'wire_name': wire_name
            })
        
        # Return matching datasheets (without full data extraction for performance)
        datasheet_summaries = []
        for file_info in matching_files[:10]:  # Limit to top 10 results
            datasheet_summaries.append({
                'id': file_info['id'],
                'name': file_info['name'],
                'url': file_info['url'],
                'modified_time': file_info['modifiedTime'],
                'relevance_score': file_info['relevance_score'],
                'matched_keywords': file_info['matched_keywords'],
                'mime_type': file_info['mimeType']
            })
        
        return jsonify({
            'success': True,
            'message': f'Found {len(matching_files)} datasheets for wire: {wire_name}',
            'datasheets': datasheet_summaries,
            'wire_name': wire_name,
            'total_count': len(matching_files)
        })
        
    except Exception as e:
        print(f"❌ Error in search_datasheets: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': f'Failed to search datasheets: {str(e)}'
        }), 500

@app.route('/api/get-datasheet', methods=['POST'])
def get_datasheet():
    """Get full datasheet data for a specific file"""
    try:
        data = request.get_json()
        file_id = data.get('file_id', '').strip()
        wire_name = data.get('wire_name', '').strip()
        
        if not file_id:
            return jsonify({
                'success': False,
                'error': 'File ID is required'
            }), 400
        
        print(f"📄 Frontend request: Getting datasheet data for file ID '{file_id}'")
        
        # Authenticate with Google Drive
        creds = authenticate()
        
        # Get the datasheet data
        datasheet_data = get_latest_production_datasheet(wire_name, creds)
        
        if not datasheet_data:
            return jsonify({
                'success': False,
                'error': f'Failed to extract datasheet data for wire: {wire_name}'
            }), 404
        
        # Prepare response data (exclude large DataFrames for JSON serialization)
        response_data = {
            'file_name': datasheet_data['file_name'],
            'file_id': datasheet_data['file_id'],
            'file_url': datasheet_data['file_url'],
            'modified_time': datasheet_data['modified_time'],
            'sheets': {},
            'summary': datasheet_data.get('summary', {})
        }
        
        # Add sheet summaries (without full data)
        if 'sheets' in datasheet_data:
            for sheet_name, sheet_data in datasheet_data['sheets'].items():
                response_data['sheets'][sheet_name] = {
                    'row_count': sheet_data['row_count'],
                    'column_count': sheet_data['column_count'],
                    'headers': sheet_data['headers'],
                    'summary': sheet_data['summary']
                }
        
        # Add document content if available
        if 'content' in datasheet_data:
            response_data['content'] = {
                'text_content': datasheet_data['content'][:2000] + '...' if len(datasheet_data['content']) > 2000 else datasheet_data['content'],
                'full_length': datasheet_data['content_length']
            }
        
        return jsonify({
            'success': True,
            'message': f'Successfully retrieved datasheet data for {datasheet_data["file_name"]}',
            'datasheet': response_data
        })
        
    except Exception as e:
        print(f"❌ Error in get_datasheet: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': f'Failed to get datasheet: {str(e)}'
        }), 500

@app.route('/api/integrate-datasheet', methods=['POST'])
def integrate_datasheet():
    """Integrate datasheet data into a report"""
    try:
        data = request.get_json()
        wire_name = data.get('wire_name', '').strip()
        report_data = data.get('report_data', {})
        
        if not wire_name:
            return jsonify({
                'success': False,
                'error': 'Wire name is required'
            }), 400
        
        if not report_data:
            return jsonify({
                'success': False,
                'error': 'Report data is required'
            }), 400
        
        print(f"🔗 Frontend request: Integrating datasheet for wire '{wire_name}' into report")
        
        # Authenticate with Google Drive
        creds = authenticate()
        
        # Integrate datasheet into report
        enhanced_report = integrate_datasheet_into_report(wire_name, report_data, creds)
        
        return jsonify({
            'success': True,
            'message': f'Successfully integrated datasheet data for wire: {wire_name}',
            'enhanced_report': enhanced_report
        })
        
    except Exception as e:
        print(f"❌ Error in integrate_datasheet: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': f'Failed to integrate datasheet: {str(e)}'
        }), 500

@app.route('/api/auto-generate-report', methods=['POST'])
def auto_generate_report():
    """Automatically generate a report with datasheet integration"""
    try:
        data = request.get_json()
        wire_name = data.get('wire_name', '').strip()
        standard_name = data.get('standard_name', 'DEF STAN 61-12')
        additional_data = data.get('additional_data', {})
        
        if not wire_name:
            return jsonify({
                'success': False,
                'error': 'Wire name is required'
            }), 400
        
        print(f"🚀 Frontend request: Auto-generating report for wire '{wire_name}' with standard '{standard_name}'")
        
        # Authenticate with Google Drive
        creds = authenticate()
        
        # Create base report structure
        base_report = {
            'wire_name': wire_name,
            'standard_name': standard_name,
            'generation_time': datetime.now().isoformat(),
            'additional_data': additional_data,
            'status': 'generated'
        }
        
        # Try to integrate datasheet data
        try:
            enhanced_report = integrate_datasheet_into_report(wire_name, base_report, creds)
            base_report = enhanced_report
            base_report['datasheet_integration'] = 'success'
        except Exception as e:
            print(f"⚠️ Datasheet integration failed: {str(e)}")
            base_report['datasheet_integration'] = 'failed'
            base_report['datasheet_error'] = str(e)
        
        return jsonify({
            'success': True,
            'message': f'Successfully generated report for wire: {wire_name}',
            'report': base_report
        })
        
    except Exception as e:
        print(f"❌ Error in auto_generate_report: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': f'Failed to generate report: {str(e)}'
        }), 500

@app.route('/api/test-connection', methods=['GET'])
def test_connection():
    """Test Google Drive connection and authentication"""
    try:
        print("🧪 Testing Google Drive connection...")
        
        # Test authentication
        creds = authenticate()
        
        # Test basic folder access
        matching_files = search_production_datasheets_by_wire_name("test", creds)
        
        return jsonify({
            'success': True,
            'message': 'Google Drive connection successful',
            'connection_status': 'connected',
            'folder_access': 'success',
            'files_found': len(matching_files)
        })
        
    except Exception as e:
        print(f"❌ Google Drive connection test failed: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': f'Google Drive connection failed: {str(e)}',
            'connection_status': 'failed'
        }), 500

@app.route('/sheet-data', methods=['GET'])
def get_sheet_data():
    """Legacy endpoint for backward compatibility with existing frontend"""
    try:
        print("📊 Frontend request: Getting sheet data from legacy endpoint")
        
        # Authenticate with Google Drive
        creds = authenticate()
        
        # Get some sample data from the output folder
        matching_files = search_production_datasheets_by_wire_name("production", creds)
        
        if not matching_files:
            return jsonify({
                'success': False,
                'error': 'No production datasheets found'
            }), 404
        
        # Return a sample structure that the frontend expects
        sample_data = {
            'Production Sheet': [
                ['Parameter', 'Value', 'Unit'],
                ['Conductor Type', 'Tinned Copper', ''],
                ['AWG Size', '12', 'AWG'],
                ['Insulation', 'XLPE', ''],
                ['Temperature Rating', '-40 to +85', '°C'],
                ['Voltage Rating', '600', 'V'],
                ['Standards', 'DEF STAN 61-12', ''],
                ['Test Voltage', '1500', 'V'],
                ['Flame Retardant', 'Yes', ''],
                ['Shield Type', 'Tinned Copper Braid', ''],
                ['Jacket Material', 'PVC', ''],
                ['Outer Diameter', '8.5', 'mm'],
                ['Weight', '120', 'kg/km']
            ]
        }
        
        return jsonify(sample_data)
            
    except Exception as e:
        print(f"❌ Error in get_sheet_data: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': f'Failed to get sheet data: {str(e)}'
        }), 500

@app.route('/list-sheets', methods=['GET'])
def list_sheets():
    """Legacy endpoint for listing available sheets"""
    try:
        print("📋 Frontend request: Listing available sheets")
        
        # Authenticate with Google Drive
        creds = authenticate()
        
        # Get available datasheets
        matching_files = search_production_datasheets_by_wire_name("production", creds)
        
        sheets_info = []
        for file_info in matching_files[:5]:  # Limit to top 5
            sheets_info.append({
                'name': file_info['name'],
                'id': file_info['id'],
                'url': file_info['url'],
                'modified': file_info['modifiedTime'],
                'type': 'production_datasheet'
            })
        
        return jsonify({
            'success': True,
            'sheets': sheets_info,
            'total_count': len(matching_files)
        })
        
    except Exception as e:
        print(f"❌ Error in list_sheets: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': f'Failed to list sheets: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Google Drive Integration API Server...")
    print("=" * 60)
    print("Available endpoints:")
    print("  GET  /api/health              - Health check")
    print("  POST /api/search-datasheets   - Search for datasheets by wire name")
    print("  POST /api/get-datasheet       - Get full datasheet data")
    print("  POST /api/integrate-datasheet - Integrate datasheet into report")
    print("  POST /api/auto-generate-report - Auto-generate report with datasheet")
    print("  GET  /api/test-connection     - Test Google Drive connection")
    print("  GET  /sheet-data              - Legacy endpoint for sheet data")
    print("  GET  /list-sheets             - Legacy endpoint for listing sheets")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)



