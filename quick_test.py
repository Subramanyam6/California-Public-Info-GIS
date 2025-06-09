#!/usr/bin/env python3
"""
Quick test of California Water Quality API
"""
import requests
import json
import time

def test_api():
    base_url = 'http://localhost:5001/api/v1'
    
    print("🧪 Testing California Water Quality API")
    print("=" * 50)
    
    # Wait for server to be ready
    print("⏳ Waiting for server...")
    time.sleep(3)
    
    endpoints = [
        ('/counties', 'Counties data'),
        ('/water-quality/statistics', 'Water quality statistics'),
        ('/treatment-plants', 'Treatment plants'),
        ('/counties/boundaries', 'County boundaries')
    ]
    
    success_count = 0
    
    for endpoint, description in endpoints:
        try:
            print(f"\n📍 Testing: {description}")
            response = requests.get(f"{base_url}{endpoint}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'status' in data and data['status'] == 'success':
                    count = data.get('count', 'N/A')
                    print(f"✅ {description}: {count} records")
                    success_count += 1
                else:
                    print(f"❌ {description}: Invalid response format")
            else:
                print(f"❌ {description}: HTTP {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ {description}: Connection failed")
        except Exception as e:
            print(f"❌ {description}: {str(e)}")
    
    print("\n" + "=" * 50)
    print(f"📊 Results: {success_count}/{len(endpoints)} endpoints working")
    
    if success_count == len(endpoints):
        print("🎉 ALL TESTS PASSED! API is working correctly.")
        
        # Test a specific county
        try:
            response = requests.get(f"{base_url}/counties/Los Angeles", timeout=5)
            if response.status_code == 200:
                data = response.json()
                county = data['data']
                print(f"\n📋 Sample Data (Los Angeles County):")
                print(f"   Population: {county.get('total_population', 'N/A'):,}")
                print(f"   Lead: {county.get('lead_avg_ug_per_L', 'N/A')} μg/L")
                print(f"   Arsenic: {county.get('arsenic_avg_ug_per_L', 'N/A')} μg/L")
                print(f"   Nitrate: {county.get('nitrate_avg_mg_per_L', 'N/A')} mg/L")
        except:
            pass
            
        print(f"\n🚀 Backend is ready at http://localhost:5001")
        print("📋 Available endpoints:")
        print("   GET /api/v1/counties")
        print("   GET /api/v1/water-quality")
        print("   GET /api/v1/treatment-plants")
        print("   GET /api/v1/counties/boundaries")
        
    else:
        print("⚠️ Some tests failed. Check server logs.")

if __name__ == '__main__':
    test_api() 