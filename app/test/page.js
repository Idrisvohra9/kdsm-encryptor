"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { runTests } from "@/utils/test-kdsm";

export default function TestPage() {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRunTests = () => {
    setIsRunning(true);
    // Use setTimeout to allow the UI to update before running tests
    setTimeout(() => {
      const testResults = runTests();
      setResults(testResults);
      setIsRunning(false);
    }, 100);
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="w-full max-w-3xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">KDSM Algorithm Tests</CardTitle>
            <CardDescription>
              Run comprehensive tests to verify the KDSM encryption/decryption algorithm
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Button 
              onClick={handleRunTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? "Running Tests..." : "Run All Tests"}
            </Button>
            
            {results && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Test Results</h3>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md">
                      Passed: {results.passed}
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md">
                      Failed: {results.failed}
                    </span>
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Test</th>
                        <th className="p-2 text-left">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.tests.map((test, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                          <td className="p-2">{test.name}</td>
                          <td className="p-2">
                            {test.passed ? (
                              <span className="text-green-600">✓ Passed</span>
                            ) : (
                              <div>
                                <span className="text-red-600">✗ Failed</span>
                                {test.error && (
                                  <div className="text-xs text-red-500 mt-1">{test.error}</div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="text-sm text-muted-foreground">
              <p>These tests verify:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Basic encryption/decryption functionality</li>
                <li>Handling of special cases (empty strings, no key)</li>
                <li>Performance with large inputs (1000+ characters)</li>
                <li>Special character handling</li>
                <li>Unicode support</li>
                <li>Wrong key behavior</li>
                <li>Whitespace preservation</li>
                <li>Case preservation</li>
              </ul>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <div>KDSM Test Suite</div>
            <Button variant="outline" size="sm" onClick={() => window.location.href = "/"}>
              Back to Encryptor
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}