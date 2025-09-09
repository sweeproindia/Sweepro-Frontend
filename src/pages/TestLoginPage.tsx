import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TestLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('Admin123!');

  const createTestAdmin = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/auth/create-test-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setTestResult({ 
        type: 'admin-creation', 
        success: response.ok, 
        data 
      });
    } catch (error) {
      setTestResult({ 
        type: 'admin-creation', 
        success: false, 
        error: error.message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setTestResult({ 
        type: 'login', 
        success: response.ok, 
        data, 
        status: response.status 
      });

      // Store token if login successful
      if (response.ok && data.data?.token) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
    } catch (error) {
      setTestResult({ 
        type: 'login', 
        success: false, 
        error: error.message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testBackendConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('http://localhost:3000/health');
      const data = await response.json();
      setTestResult({ 
        type: 'backend-connection', 
        success: response.ok, 
        data 
      });
    } catch (error) {
      setTestResult({ 
        type: 'backend-connection', 
        success: false, 
        error: error.message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Login Debug Tool</CardTitle>
            <CardDescription>
              Test backend connection, create test users, and debug login issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Backend Connection Test */}
            <div className="space-y-2">
              <h3 className="font-semibold">1. Test Backend Connection</h3>
              <Button 
                onClick={testBackendConnection} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? 'Testing...' : 'Test Backend Connection'}
              </Button>
            </div>

            {/* Create Test Admin */}
            <div className="space-y-2">
              <h3 className="font-semibold">2. Create Test Admin User</h3>
              <Button 
                onClick={createTestAdmin} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? 'Creating...' : 'Create Test Admin'}
              </Button>
              <p className="text-sm text-gray-600">
                Creates admin@test.com / Admin123! if it doesn't exist
              </p>
            </div>

            {/* Test Login */}
            <div className="space-y-2">
              <h3 className="font-semibold">3. Test Login</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={testLogin} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? 'Testing Login...' : 'Test Login'}
              </Button>
            </div>

            {/* Results */}
            {testResult && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">
                  Test Result ({testResult.type}):
                </h3>
                <div className={`p-4 rounded-md border ${
                  testResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="font-medium mb-2">
                    {testResult.success ? '✅ Success' : '❌ Failed'}
                    {testResult.status && ` (Status: ${testResult.status})`}
                  </div>
                  <pre className="text-sm overflow-auto bg-gray-100 p-2 rounded">
                    {JSON.stringify(testResult.data || testResult.error, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Current Configuration */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="font-semibold mb-2">Current Configuration:</h3>
              <div className="text-sm space-y-1">
                <div><strong>Frontend:</strong> http://localhost:8080 (this page)</div>
                <div><strong>Backend API:</strong> http://localhost:3000</div>
                <div><strong>CORS:</strong> {window.location.origin} should be allowed</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold mb-2">Instructions:</h3>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>First, test backend connection to ensure server is running on port 3000</li>
                <li>Create a test admin user to have login credentials</li>
                <li>Test login with the created credentials</li>
                <li>If successful, go back to the main login page at /login</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
