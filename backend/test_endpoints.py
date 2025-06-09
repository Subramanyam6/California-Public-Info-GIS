#!/usr/bin/env python3
"""
Quick test script to verify the latest code is deployed
"""
import requests
import sys
from datetime import datetime

def test_backend(backend_url):
    """Test backend health and basic functionality"""
    print(f"🔍 Testing Backend: {backend_url}")
    
    try:
        # Health check
        response = requests.get(f"{backend_url}/api/v1/health", timeout=10)
        if response.status_code == 200:
            print("✅ Backend health check passed")
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
            
        # Test counties endpoint
        response = requests.get(f"{backend_url}/api/v1/counties", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Counties endpoint working - {len(data)} counties loaded")
        else:
            print(f"❌ Counties endpoint failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Backend test failed: {e}")
        return False
    
    return True

def test_frontend(frontend_url):
    """Test frontend and check for latest changes"""
    print(f"🔍 Testing Frontend: {frontend_url}")
    
    try:
        response = requests.get(frontend_url, timeout=10)
        if response.status_code == 200:
            content = response.text
            
            # Check for our latest changes
            checks = [
                ("Made with 🔥 by", "Fire emoji footer"),
                ("github.com/Subramanyam6", "GitHub link"),  
                ("modern-title", "Modern title CSS class"),
                ("buzzy", "Buzzy animation class"),
                ("address-search-btn", "Modern search button"),
            ]
            
            passed = 0
            for check, description in checks:
                if check in content:
                    print(f"✅ {description} found")
                    passed += 1
                else:
                    print(f"❌ {description} missing")
            
            print(f"📊 Frontend checks: {passed}/{len(checks)} passed")
            return passed == len(checks)
            
    except Exception as e:
        print(f"❌ Frontend test failed: {e}")
        return False
    
    return False

def main():
    backend_url = "https://gis-api-backend-ateyduqy5a-uc.a.run.app"
    frontend_url = "https://gis-app-frontend-ateyduqy5a-uc.a.run.app"
    
    print("=" * 50)
    print(f"🚀 DEPLOYMENT VERIFICATION - {datetime.now()}")
    print("=" * 50)
    
    backend_ok = test_backend(backend_url)
    frontend_ok = test_frontend(frontend_url)
    
    print("\n" + "=" * 50)
    if backend_ok and frontend_ok:
        print("🎉 ALL TESTS PASSED - Latest changes deployed successfully!")
        print(f"🌐 Live App: {frontend_url}")
        sys.exit(0)
    else:
        print("❌ TESTS FAILED - Deployment issues detected")
        sys.exit(1)

if __name__ == "__main__":
    main() 