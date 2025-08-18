# POS-to-CRM Invoice Integration Setup

This document explains how to set up the POS-to-CRM invoice integration feature that automatically creates paid invoices in the CRM system when customers make purchases in the POS.

## Features

- ✅ Automatic invoice creation in CRM when customer is selected during POS sale
- ✅ Paid invoice status (since POS sales are immediate transactions)
- ✅ Complete line item details including SKU references
- ✅ Error handling and fallback behavior
- ✅ Service availability detection
- ✅ Maintains existing inventory integration functionality

## Environment Variables

Add these environment variables to your POS system:

```bash
# CRM Integration Configuration
CRM_API_URL=http://localhost:3001  # URL of your CRM system
CRM_API_KEY=your-secret-api-key    # API key for CRM authentication
```

### Getting the CRM API Key

1. Access your CRM system admin panel
2. Navigate to Settings > External Integrations  
3. Generate a new API key for POS integration
4. Copy the API key and set it as `CRM_API_KEY` environment variable

## How It Works

### When Customer is Selected
1. Customer makes a purchase in POS
2. Cashier selects customer during checkout
3. POS processes sale normally (inventory updates, receipt generation)
4. **NEW**: POS automatically creates paid invoice in CRM system
5. CRM invoice includes:
   - Customer information
   - All purchased items with quantities and prices
   - Payment method used
   - Reference to POS sale ID
   - Paid status (immediate)

### When No Customer Selected
- POS operates normally
- No CRM invoice is created
- Inventory integration continues as before

### Error Handling
- If CRM service is unavailable, sale still completes
- Warning message indicates CRM integration status
- All errors are logged for troubleshooting
- Inventory integration operates independently

## Testing the Integration

Run the test script to verify everything works:

```bash
cd /home/alain/projects/pos retail
node test-crm-integration.js
```

The test will:
1. Test sale with customer (should create CRM invoice)
2. Test sale without customer (should skip CRM)
3. Verify error handling and service availability

## API Response Format

When a sale includes CRM integration, the response includes:

```json
{
  "success": true,
  "saleId": "POS_1642878934567_abc123",
  "message": "Sale completed successfully with inventory updates and CRM invoice INV-2025-0001",
  "crmStatus": {
    "serviceAvailable": true,
    "invoiceCreated": true,
    "invoice_id": "uuid-of-invoice",
    "invoice_number": "INV-2025-0001",
    "error": null
  },
  "inventoryStatus": {
    "serviceAvailable": true,
    "updatesSuccessful": true,
    "summary": {
      "total_items": 2,
      "successful_updates": 2,
      "failed_updates": 0
    }
  }
}
```

## Troubleshooting

### CRM Service Unavailable
- Check `CRM_API_URL` is correct and CRM system is running
- Verify network connectivity between POS and CRM
- Check CRM system logs for authentication errors

### Invalid API Key
- Verify `CRM_API_KEY` matches the key generated in CRM admin
- Check for extra spaces or characters in environment variable
- Regenerate API key if necessary

### Invoice Creation Fails
- Check CRM system database connectivity
- Verify customer exists in CRM system
- Review CRM logs for validation errors

## Integration Points

### POS Sales API (`/api/sales`)
- Added CRM integration to POST endpoint
- New fields: `customerId`, `customerName`, `currency`
- Response includes `crmStatus` object

### CRM Integration Service (`/lib/services/crm-integration.ts`)
- Handles API communication with CRM
- Error handling and timeout management
- Service availability detection

### CRM External API (`/api/external/invoices`)
- POST endpoint for creating invoices
- CORS support for cross-origin requests
- Auto-generated invoice numbers
- Comprehensive validation

## Security Notes

- API keys are transmitted via secure headers (`x-api-key`)
- All requests use HTTPS in production
- Input validation on both POS and CRM sides
- No sensitive data logged in console outputs