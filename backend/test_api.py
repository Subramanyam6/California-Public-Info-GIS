"""
Comprehensive API test runner
Test the California Water Quality API endpoints
"""
import requests
import json
import time
import sys

BASE_URL = 'http://localhost:5001/api/v1'

class APITester:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        
    def test_endpoint(self, endpoint, expected_status=200, method='GET', data=None):
        """Test a single API endpoint"""
        try:
            print(f"\n{'='*60}")
            print(f"Testing: {method} {endpoint}")
            print(f"{'='*60}")
            
            if method == 'GET':
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            elif method == 'POST':
                response = requests.post(f"{BASE_URL}{endpoint}", json=data, timeout=10)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == expected_status:
                result = response.json()
                
                # Check response structure
                if 'status' in result:
                    print(f"Status: {result['status']}")
                    
                if 'count' in result:
                    print(f"Records: {result['count']}")
                    
                if 'data' in result:
                    data_len = len(result['data']) if isinstance(result['data'], list) else 'N/A'
                    print(f"Data Length: {data_len}")
                    
                    # Show sample data
                    if isinstance(result['data'], list) and len(result['data']) > 0:
                        print(f"Sample Data: {json.dumps(result['data'][0], indent=2)[:200]}...")
                    elif isinstance(result['data'], dict):
                        print(f"Data Keys: {list(result['data'].keys())}")
                
                print("✅ PASSED")
                self.passed += 1
                return result
                
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:200]}...")
                self.failed += 1
                self.errors.append(f"{endpoint}: Status {response.status_code}")
                return None
                
        except requests.exceptions.ConnectionError:
            print("❌ FAILED - Connection Error")
            print("Make sure the API server is running on http://localhost:5001")
            self.failed += 1
            self.errors.append(f"{endpoint}: Connection Error")
            return None
            
        except Exception as e:
            print(f"❌ FAILED - {str(e)}")
            self.failed += 1
            self.errors.append(f"{endpoint}: {str(e)}")
            return None
    
    def run_all_tests(self):
        """Run comprehensive API tests"""
        
        print("🚀 Starting California Water Quality API Tests")
        print("=" * 60)
        
        # Test 1: Counties endpoints
        print("\n📍 TESTING COUNTIES ENDPOINTS")
        counties_result = self.test_endpoint('/counties')
        self.test_endpoint('/counties/population')
        self.test_endpoint('/counties/boundaries')
        
        # Test specific county if we have data
        if counties_result and 'data' in counties_result and len(counties_result['data']) > 0:
            county_name = counties_result['data'][0]['county_name']
            self.test_endpoint(f'/counties/{county_name}')
        
        # Test 2: Water Quality endpoints
        print("\n💧 TESTING WATER QUALITY ENDPOINTS")
        wq_result = self.test_endpoint('/water-quality')
        self.test_endpoint('/water-quality/statistics')
        self.test_endpoint('/water-quality/worst-counties')
        self.test_endpoint('/water-quality/worst-counties?limit=5')
        
        # Test specific county water quality
        if counties_result and 'data' in counties_result and len(counties_result['data']) > 0:
            county_name = counties_result['data'][0]['county_name']
            self.test_endpoint(f'/water-quality/{county_name}')
        
        # Test filtering
        self.test_endpoint('/water-quality?max_lead=5.0')
        self.test_endpoint('/water-quality?max_arsenic=5.0&max_nitrate=5.0')
        
        # Test 3: Treatment Plants endpoints
        print("\n🏭 TESTING TREATMENT PLANTS ENDPOINTS")
        plants_result = self.test_endpoint('/treatment-plants')
        self.test_endpoint('/treatment-plants?public_access=true')
        
        # Test specific facility if we have data
        if plants_result and 'data' in plants_result and len(plants_result['data']) > 0:
            facility_id = plants_result['data'][0]['facility_id']
            self.test_endpoint(f'/treatment-plants/{facility_id}')
        
        # Test nearby search
        self.test_endpoint('/treatment-plants/nearby?lat=37.7749&lng=-122.4194&radius=100')
        self.test_endpoint('/treatment-plants/nearby?lat=34.0522&lng=-118.2437&radius=50')
        
        # Test county plants
        if counties_result and 'data' in counties_result and len(counties_result['data']) > 0:
            county_name = counties_result['data'][0]['county_name']
            self.test_endpoint(f'/treatment-plants/county/{county_name}')
        
        # Test 4: Error handling
        print("\n⚠️  TESTING ERROR HANDLING")
        self.test_endpoint('/counties/NonexistentCounty', expected_status=404)
        self.test_endpoint('/water-quality/NonexistentCounty', expected_status=404)
        self.test_endpoint('/treatment-plants/99999', expected_status=404)
        self.test_endpoint('/treatment-plants/nearby?lat=invalid', expected_status=400)
        
        # Test 5: Performance test
        print("\n⚡ PERFORMANCE TEST")
        start_time = time.time()
        self.test_endpoint('/counties')
        self.test_endpoint('/water-quality/statistics')
        self.test_endpoint('/treatment-plants')
        end_time = time.time()
        
        print(f"\nPerformance: 3 requests completed in {end_time - start_time:.2f} seconds")
        
        # Final summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("🎯 TEST SUMMARY")
        print("="*60)
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"📊 Success Rate: {(self.passed/(self.passed + self.failed)*100):.1f}%")
        
        if self.errors:
            print(f"\n❌ Errors:")
            for error in self.errors:
                print(f"  - {error}")
        
        if self.failed == 0:
            print("\n🎉 ALL TESTS PASSED! API is working correctly.")
        else:
            print(f"\n⚠️  {self.failed} tests failed. Please check the errors above.")

def test_server_connectivity():
    """Test if the server is running"""
    try:
        response = requests.get('http://localhost:5001', timeout=5)
        return True
    except:
        return False

if __name__ == '__main__':
    print("🔍 Checking server connectivity...")
    
    if not test_server_connectivity():
        print("❌ Cannot connect to server at http://localhost:5001")
        print("Please start the Flask server first:")
        print("  cd backend")
        print("  python app.py")
        sys.exit(1)
    
    print("✅ Server is running!")
    
    tester = APITester()
    tester.run_all_tests() 