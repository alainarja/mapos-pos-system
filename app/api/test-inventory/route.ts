import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing inventory API endpoints...');
    
    const apiKey = process.env.INVENTORY_API_KEY || 'pos_integration_key_2024';
    const baseUrl = process.env.INVENTORY_API_URL || 'https://inventorymarble.vercel.app';
    
    // First, get inventory items to see what's available
    console.log('📦 Testing GET /api/external/inventory...');
    const getResponse = await fetch(`${baseUrl}/api/external/inventory`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('GET inventory response:', {
      status: getResponse.status,
      ok: getResponse.ok
    });
    
    if (!getResponse.ok) {
      return NextResponse.json({
        error: `GET failed: ${getResponse.status} ${getResponse.statusText}`,
        details: await getResponse.text()
      });
    }
    
    const data = await getResponse.json();
    console.log('📦 Sample inventory data:', data);
    
    if (data.data && data.data.length > 0) {
      const firstItem = data.data[0];
      console.log('🧪 Testing update methods with item:', firstItem);
      
      // Test different possible endpoints for updates
      const testResults = [];
      
      const testEndpoints = [
        { endpoint: `/api/external/inventory/${firstItem.sku || firstItem.id}`, method: 'PUT' },
        { endpoint: `/api/external/inventory/${firstItem.sku || firstItem.id}`, method: 'PATCH' },
        { endpoint: `/api/external/inventory/${firstItem.sku || firstItem.id}/quantity`, method: 'PUT' },
        { endpoint: `/api/external/inventory/${firstItem.sku || firstItem.id}/quantity`, method: 'PATCH' },
        { endpoint: `/api/external/inventory/${firstItem.sku || firstItem.id}/quantity`, method: 'POST' },
        { endpoint: `/api/external/inventory/update`, method: 'POST' },
        { endpoint: `/api/inventory/${firstItem.sku || firstItem.id}`, method: 'PUT' },
        { endpoint: `/api/inventory/${firstItem.sku || firstItem.id}/update`, method: 'POST' },
      ];
      
      for (const test of testEndpoints) {
        try {
          console.log(`🔧 Testing ${test.method} to ${test.endpoint}...`);
          
          const testBody = test.endpoint.includes('quantity') 
            ? { quantity: firstItem.quantity - 1, operation: 'deduct', reason: 'POS Sale Test' }
            : { quantity: firstItem.quantity - 1 };
            
          const response = await fetch(`${baseUrl}${test.endpoint}`, {
            method: test.method,
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(testBody)
          });
          
          const responseText = response.status === 204 ? 'No Content' : await response.text();
          
          testResults.push({
            endpoint: test.endpoint,
            method: test.method,
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            response: responseText
          });
          
          console.log(`${test.method} ${test.endpoint}:`, response.status, response.statusText);
          
        } catch (error) {
          testResults.push({
            endpoint: test.endpoint,
            method: test.method,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          console.log(`❌ Error testing ${test.endpoint}:`, error);
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'API endpoint testing completed',
        sampleItem: firstItem,
        testResults: testResults
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'No inventory items found to test with',
      data: data
    });
    
  } catch (error) {
    console.error('❌ Error testing inventory API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test inventory API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}