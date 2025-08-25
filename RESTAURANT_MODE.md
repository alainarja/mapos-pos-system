# Restaurant Mode Feature

## Overview
Restaurant Mode transforms the POS system into a comprehensive table management system designed for restaurants. This feature includes table layout configuration, individual table cart tracking, and a modern graphical interface optimized for restaurant operations.

## Features

### 1. Table Configuration Interface
- **Visual Layout Designer**: Drag-and-drop interface to design your restaurant floor plan
- **Table Shapes**: Support for square, round, and rectangular tables
- **Table Sizes**: Small, medium, and large table options
- **Preset Layouts**: Quick-start templates for small cafes, restaurants, and large venues
- **Grid System**: Snap-to-grid functionality for precise table placement
- **Import/Export**: Save and load floor plan configurations

### 2. Table Management
- **Individual Table Carts**: Each table maintains its own cart/order
- **Table Status Tracking**: Available, Occupied, Reserved, Cleaning states
- **Server Assignment**: Track which server is handling each table
- **Guest Count**: Monitor number of guests per table
- **Time Tracking**: Automatic tracking of table duration
- **Table Transfer**: Move orders between tables when needed

### 3. Restaurant POS Interface
- **Modern UI**: Ultra-thin, modern graphical interface with glassmorphism effects
- **Real-time Stats**: Occupancy rate, average table time, total revenue
- **Quick Navigation**: Tabbed interface for Tables, Menu, Cart, and Configuration
- **Category Filtering**: Organized menu items by category (Appetizers, Mains, Desserts, etc.)
- **Visual Table Selection**: Color-coded table status for quick identification

## Enabling Restaurant Mode

### Method 1: Environment Variable
Set the environment variable in your `.env.local` file:

```env
NEXT_PUBLIC_RESTAURANT_MODE=true
```

### Method 2: Toggle at Runtime
The restaurant mode can be toggled dynamically through the settings if needed.

## How to Use

### Initial Setup
1. Enable restaurant mode in `.env.local`
2. Restart the development server: `npm run dev`
3. Navigate to `/restaurant` (or the app will auto-redirect if restaurant mode is enabled)
4. Log in with your credentials

### Configuring Your Floor Plan
1. Go to the "Configure" tab
2. Use the "Add" panel to create new tables:
   - Set table number and seat count
   - Choose shape (square, round, rectangle)
   - Select size (small, medium, large)
3. Drag tables to position them on the floor
4. Use preset layouts for quick setup:
   - Small Cafe (10 tables)
   - Restaurant (15 tables)
   - Large Venue (25 tables)
5. Export your layout for backup or sharing

### Managing Tables
1. **Starting a New Table**:
   - Click on an available (green) table
   - Enter server name and guest count
   - Add optional notes (allergies, special requests)
   - Click "Start Table"

2. **Taking Orders**:
   - Select the active table
   - Navigate to the "Menu" tab
   - Click products to add them to the table's cart
   - Use categories to filter menu items

3. **Managing Cart**:
   - Go to "Cart" tab to review the order
   - Adjust quantities with +/- buttons
   - Remove items if needed
   - View subtotal, tax, and total

4. **Processing Payment**:
   - Click "Process Payment" when ready
   - The table will be marked for cleaning
   - After cleaning, it returns to available status

### Table States
- **Green (Available)**: Table is ready for new guests
- **Red (Occupied)**: Table has active guests and orders
- **Yellow (Reserved)**: Table is reserved for future guests
- **Blue (Cleaning)**: Table is being cleaned after checkout

## Data Storage
All table configurations and active table carts are stored in browser local storage, ensuring data persistence across sessions. In production, this would sync with your backend database.

## Technical Details

### New Components
- `/components/restaurant/table-configuration.tsx`: Visual floor plan designer
- `/components/restaurant/table-selection.tsx`: Table grid and management UI
- `/components/restaurant/restaurant-pos.tsx`: Main restaurant POS interface
- `/app/restaurant/page.tsx`: Restaurant mode page with authentication

### New Store
- `/stores/tables.ts`: Zustand store for table management
  - Floor plan configuration
  - Table cart management
  - Analytics calculations

### Environment Variable
- `NEXT_PUBLIC_RESTAURANT_MODE`: Enable/disable restaurant mode

## Best Practices

1. **Regular Backups**: Export your floor plan configuration regularly
2. **Server Assignment**: Always assign servers to tables for accountability
3. **Guest Count**: Track accurate guest counts for analytics
4. **Table Notes**: Use notes for special requests and allergies
5. **Quick Turnover**: Use the cleaning status to manage table turnover efficiently

## Future Enhancements
- Reservation system integration
- Kitchen display system
- Table-specific timing alerts
- Split bill functionality
- Course management (appetizer, main, dessert timing)
- Waiter call system
- Table-specific printer routing
- Analytics dashboard with heat maps

## Troubleshooting

### Restaurant Mode Not Working
1. Ensure `NEXT_PUBLIC_RESTAURANT_MODE=true` is set in `.env.local`
2. Restart the development server after changing environment variables
3. Clear browser cache and local storage if needed

### Tables Not Saving
1. Check browser local storage is enabled
2. Ensure you're not in private/incognito mode
3. Check browser console for any errors

### Performance Issues
1. Limit floor plan to reasonable size (25x20 grid max recommended)
2. Clear completed table carts regularly
3. Use modern browsers for best performance

## Support
For issues or feature requests related to Restaurant Mode, please refer to the main project documentation or contact support.