"use client"

import { useState } from 'react'
import { maposUsersAuth } from '@/lib/services/maposusers-auth'

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDebug = async () => {
    setIsLoading(true)
    try {
      // Get configuration status
      const config = maposUsersAuth.getConfigStatus()
      
      // Test different PINs
      const testPins = ['0000', '1234', '5678', '9999']
      const results = []
      
      for (const pin of testPins) {
        try {
          const result = await maposUsersAuth.loginWithPin({ pin })
          results.push({ pin, success: true, user: result.user.fullName, method: result.user.authMethod })
        } catch (error) {
          results.push({ pin, success: false, error: error.message })
        }
      }
      
      setDebugInfo({
        timestamp: new Date().toISOString(),
        config,
        environment: {
          NEXT_PUBLIC_MAPOS_USERS_API_URL: process.env.NEXT_PUBLIC_MAPOS_USERS_API_URL || 'NOT SET',
          NEXT_PUBLIC_MAPOS_USERS_API_KEY: process.env.NEXT_PUBLIC_MAPOS_USERS_API_KEY ? 'SET' : 'NOT SET',
          NODE_ENV: process.env.NODE_ENV,
          VERCEL: process.env.VERCEL || 'false',
          currentDomain: typeof window !== 'undefined' ? window.location.origin : 'SSR'
        },
        testResults: results
      })
    } catch (error) {
      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 POS Authentication Debug</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-gray-600 mb-4">
            This debug page helps identify authentication issues in the deployed POS system.
          </p>
          
          <button 
            onClick={runDebug}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium"
          >
            {isLoading ? '🔄 Running Tests...' : '🚀 Run Debug Tests'}
          </button>
        </div>
        
        {debugInfo && (
          <div className="space-y-6">
            {debugInfo.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h3>
                <p className="text-red-700">{debugInfo.error}</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Configuration Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Base URL:</span> 
                      <span className={debugInfo.config.baseUrl === 'Not configured' ? 'text-red-600' : 'text-green-600'}>
                        {debugInfo.config.baseUrl}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Has API Key:</span> 
                      <span className={debugInfo.config.hasApiKey ? 'text-green-600' : 'text-red-600'}>
                        {debugInfo.config.hasApiKey ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Using Mock Auth:</span> 
                      <span className={debugInfo.config.usingMockAuth ? 'text-yellow-600' : 'text-green-600'}>
                        {debugInfo.config.usingMockAuth ? '⚠️ Yes (Mock)' : '✅ No (Real API)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🌍 Environment Variables</h3>
                  <div className="space-y-2 font-mono text-sm">
                    {Object.entries(debugInfo.environment).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="font-medium w-60">{key}:</span>
                        <span className={value === 'NOT SET' ? 'text-red-600' : 'text-green-600'}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🧪 PIN Authentication Tests</h3>
                  <div className="space-y-3">
                    {debugInfo.testResults.map((result: any, index: number) => (
                      <div key={index} className={`p-4 rounded-lg border ${
                        result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">PIN {result.pin}:</span>
                          <span className={result.success ? 'text-green-700' : 'text-red-700'}>
                            {result.success ? `✅ ${result.user}` : `❌ ${result.error}`}
                          </span>
                        </div>
                        {result.method && (
                          <div className="text-sm text-gray-600 mt-1">
                            Auth Method: {result.method}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Expected Results</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• PIN 0000: Should be REJECTED (❌)</li>
                    <li>• PIN 1234: Should be ACCEPTED (✅) - Store Manager</li>
                    <li>• PIN 5678: Should be ACCEPTED (✅) - Store Cashier</li>
                    <li>• PIN 9999: Should be ACCEPTED (✅) - POS Administrator</li>
                  </ul>
                </div>
              </>
            )}
            
            <div className="text-sm text-gray-500 text-center">
              Debug run at: {debugInfo.timestamp}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}