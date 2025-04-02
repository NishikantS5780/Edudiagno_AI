
#!/usr/bin/env python3
"""
Utility script to validate API endpoints in the backend.
This script checks for common issues in FastAPI routers.
"""

import importlib
import inspect
import os
import sys
from typing import List, Dict, Any, Set
from collections import defaultdict

# Add the project root to the path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def get_router_files() -> List[str]:
    """Get all router files in the project."""
    router_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "routers")
    return [f for f in os.listdir(router_dir) if f.endswith(".py") and f != "__init__.py"]

def extract_endpoints(router_module) -> List[Dict[str, Any]]:
    """Extract all endpoints from a router module."""
    endpoints = []
    
    for name, obj in inspect.getmembers(router_module):
        if hasattr(obj, "__module__") and "routers" in obj.__module__ and callable(obj):
            # This is likely a route handler function
            if hasattr(obj, "__fastapi_route__"):
                path = obj.__fastapi_route__.path
                methods = obj.__fastapi_route__.methods
                
                # Check if this endpoint uses authentication
                uses_auth = False
                if hasattr(obj, "__dependencies__"):
                    for dep in obj.__dependencies__:
                        if "get_current_user" in str(dep.dependency):
                            uses_auth = True
                            break
                
                endpoints.append({
                    "name": name,
                    "path": path,
                    "methods": methods,
                    "uses_auth": uses_auth,
                    "has_response_model": hasattr(obj, "__response_model__"),
                    "module": router_module.__name__
                })
    
    return endpoints

def validate_endpoints():
    """Validate all endpoints in the project."""
    router_files = get_router_files()
    all_endpoints = []
    path_methods = defaultdict(set)
    issues = []
    
    for router_file in router_files:
        module_name = f"routers.{router_file[:-3]}"
        try:
            router_module = importlib.import_module(module_name)
            endpoints = extract_endpoints(router_module)
            
            for endpoint in endpoints:
                all_endpoints.append(endpoint)
                
                # Check for duplicate paths and methods
                for method in endpoint["methods"]:
                    path_method = (endpoint["path"], method)
                    if path_method in path_methods:
                        issues.append(f"Duplicate endpoint: {method} {endpoint['path']} in {endpoint['module']} and {path_methods[path_method]}")
                    path_methods[path_method].add(endpoint["module"])
                
                # Check for missing authentication
                if not endpoint["uses_auth"] and "public" not in endpoint["path"]:
                    issues.append(f"Potential missing authentication: {endpoint['methods']} {endpoint['path']} in {endpoint['module']}")
                
                # Check for missing response model
                if not endpoint["has_response_model"] and "DELETE" not in endpoint["methods"]:
                    issues.append(f"Missing response model: {endpoint['methods']} {endpoint['path']} in {endpoint['module']}")
        
        except Exception as e:
            issues.append(f"Error analyzing {module_name}: {str(e)}")
    
    # Print results
    print(f"Found {len(all_endpoints)} endpoints in {len(router_files)} router files")
    print(f"Found {len(issues)} potential issues:")
    for i, issue in enumerate(issues, 1):
        print(f"{i}. {issue}")
    
    return all_endpoints, issues

if __name__ == "__main__":
    validate_endpoints()
