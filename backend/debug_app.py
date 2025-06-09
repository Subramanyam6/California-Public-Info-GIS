#!/usr/bin/env python3
"""
Debug script to test Flask app setup
"""
from app import create_app

def main():
    print("🔧 Creating Flask app...")
    app = create_app()
    print("✅ Flask app created successfully!")
    
    print("\n📋 Registered routes:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule.rule} -> {rule.endpoint}")
    
    print(f"\n🌐 Starting server on http://localhost:5001...")
    try:
        app.run(host='0.0.0.0', port=5001, debug=True)
    except Exception as e:
        print(f"❌ Server failed to start: {e}")

if __name__ == '__main__':
    main() 