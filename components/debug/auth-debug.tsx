"use client"

import { useState } from 'react'
import { maposUsersAuth } from '@/lib/services/maposusers-auth'

export function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [testResults, setTestResults] = useState<any[]>([])

  const runDebug = async () => {
    // Get configuration status
    const config = maposUsersAuth.getConfigStatus()
    
    // Test different PINs
    const testPins = ['0000', '1234', '5678', '9999']
    const results = []
    
    for (const pin of testPins) {
      try {
        const result = await maposUsersAuth.loginWithPin({ pin })
        results.push({ pin, success: true, user: result.user.fullName })
      } catch (error) {
        results.push({ pin, success: false, error: error.message })
      }
    }
    
    setDebugInfo({
      config,
      environment: {
        NEXT_PUBLIC_MAPOS_USERS_API_URL: process.env.NEXT_PUBLIC_MAPOS_USERS_API_URL,
        NEXT_PUBLIC_MAPOS_USERS_API_KEY: process.env.NEXT_PUBLIC_MAPOS_USERS_API_KEY ? 'SET' : 'NOT SET',
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        currentDomain: typeof window !== 'undefined' ? window.location.origin : 'SSR'
      }
    })
    setTestResults(results)
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">🔧 Authentication Debug</h3>
      
      <button 
        onClick={runDebug}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Run Debug Tests
      </button>
      
      {debugInfo && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded">
            <h4 className="font-semibold">📋 Configuration:</h4>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo.config, null, 2)}
            </pre>
          </div>
          
          <div className="bg-white p-3 rounded">
            <h4 className="font-semibold">🌍 Environment:</h4>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo.environment, null, 2)}
            </pre>
          </div>
          
          <div className="bg-white p-3 rounded">
            <h4 className="font-semibold">🧪 PIN Tests:</h4>
            {testResults.map((result, index) => (
              <div key={index} className={`p-2 rounded mb-2 ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <strong>PIN {result.pin}:</strong> {result.success ? `✅ ${result.user}` : `❌ ${result.error}`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}