# Database API Documentation

## Architecture Overview
The application uses a three-layer architecture for database operations:

1. HTTP Service Layer (`http.service.ts`)
   - Handles all HTTP communications
   - Manages request/response lifecycle
   - Handles errors and authentication

2. Database CRUD Layer (`dbNodeCRUD.service.ts`)
   - Provides generic MongoDB operations
   - Handles basic CRUD operations
   - Manages data types and transformations

3. Domain Services Layer
   - Implements business logic
   - Provides domain-specific operations
   - Uses lower layers for database access

## API Routes

### Generic Data Routes
The application provides a set of standardized routes for generic data operations:

| Method | Route | Purpose | Example Usage |
|--------|-------|---------|--------------|
| GET    | `/api/query` | Query data with filters | Fetch messages with conditions |
| POST   | `/api/query` | Query data with complex params | Create or query with request body |
| POST   | `/api/create/:collection` | Create document in specified collection | Create new message |
| POST   | `/api/create/with-script/:scriptName` | Create document using a script | Create with validation script |
| PUT    | `/api/update/:collection` | Update document in specified collection | Update message content |
| PUT    | `/api/update/with-script/:scriptName` | Update document using a script | Update with validation script |
| DELETE | `/api/delete/:collection/:id` | Delete document by ID | Delete a message |
| GET    | `/api/get/:collection/:id` | Retrieve document by ID | Get message details |

> **Note:** Some services like messaging may use legacy transaction-related endpoints (`/api/query/session`, `/api/query/commit`, `/api/query/abort`) which are maintained for backward compatibility.

### Feature-Specific Routes
In addition to generic data routes, feature-specific routes handle specialized business logic:

| Feature | Method | Route | Purpose |
|---------|--------|-------|---------|
| Messaging | GET | `/api/messages` | Fetch user's messages with states |
| Messaging | POST | `/api/messages/move` | Move messages between folders |
| Messaging | POST | `/api/messages/flag` | Toggle message flags (star, important) |

### When to Use Each Route Type

- **Generic Data Routes**: Use for simple CRUD operations without complex business logic
  - Direct database operations
  - Simple queries and updates
  - Operations that don't require additional processing

- **Feature-Specific Routes**: Use when operations require:
  - Complex business logic
  - Multiple database operations
  - Specialized validation
  - Custom response formats
  - Specific authorization rules

## Creating a New Service

### 1. Define Your Data Types
```typescript
// Define your main data interface
interface YourDataType {
    _id?: string;
    // Add your specific fields
    [key: string]: any;
}
```

### 2. Create the Service Class
```typescript
export class YourService {
    private collectionName = 'your_collection_name';

    constructor(private httpService: HttpService) {}

    // Example: Get items with query
    async getItems(query: Record<string, MongoQuery>): Promise<YourDataType[]> {
        return this.httpService.get('/api/query', {
            collection: this.collectionName,
            q: query,
            h: {
                $fields: {
                    // Specify fields to return
                    _id: 1,
                    // other fields...
                }
            }
        }).then(i => i.data);
    }

    // Example: Create item
    async createItem(data: Omit<YourDataType, '_id'>): Promise<YourDataType> {
        return this.httpService.post(
            `/api/create/${this.collectionName}`, 
            data
        ).then(i => i.data);
    }
    
    // Example: Update item
    async updateItem(id: string, data: Partial<YourDataType>): Promise<YourDataType> {
        return this.httpService.put(
            `/api/update/${this.collectionName}`, 
            { _id: id, ...data }
        ).then(i => i.data);
    }
    
    // Example: Delete item
    async deleteItem(id: string): Promise<void> {
        return this.httpService.delete(
            `/api/delete/${this.collectionName}/${id}`
        );
    }
    
    // Example: Get item by ID
    async getItemById(id: string): Promise<YourDataType> {
        return this.httpService.get(
            `/api/get/${this.collectionName}/${id}`
        ).then(i => i.data);
    }
}
```

### 3. Register the Service
```typescript
export const useYourService = serviceComposableFactory(
    'yourService',
    () => new YourService(httpService)
);
```

## Creating a Custom Feature Endpoint

For operations requiring custom business logic, create feature-specific endpoints:

1. Create a controller:
```javascript
// /server/controllers/yourFeatureController.js
const db = require('../services/database');

async function getFeatureData(req, res) {
  try {
    // Implement your custom logic
    const userId = req.user._id;
    const data = await yourCustomLogic(userId);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in feature operation:', error);
    return res.status(500).json({ error: 'Operation failed' });
  }
}

module.exports = {
  getFeatureData,
};
```

2. Register the route:
```javascript
// In your routes file
router.get('/your-feature', yourFeatureController.getFeatureData);
```

## Query Patterns

### Basic Query Structure
```typescript
interface QueryParams {
    collection: string;
    q?: Record<string, MongoQuery>; // Query conditions
    h?: MongoQueryOptions;          // Options like sort, limit
}
```

### Common Query Patterns
```typescript
// Equality match
{ field: value }

// Array operations
{ field: { $all: ['value1', 'value2'] } }

// Existence check
{ field: { $exists: true } }

// Comparison
{ field: { $gt: value } }

// Logical operators
{ $and: [condition1, condition2] }
```

### Query Options
```typescript
interface MongoQueryOptions {
    limit?: number;
    skip?: number;
    sort?: Record<string, 1 | -1>;
    fields?: Record<string, 1 | 0>;
}
```

## Error Handling
Every service should implement proper error handling:

```typescript
async function serviceMethod() {
    try {
        const response = await this.httpService.get(...);
        return response.data;
    } catch (error) {
        console.error('Service operation failed:', error);
        throw error;
    }
}
```

## Missing Information Needed
1. Authentication/Authorization details
2. Rate Limiting specifications
3. Database Configuration
4. Caching Strategy
5. API Versioning
6. Data Validation rules
7. Error Codes and Formats
8. Batch Operation limits

## Best Practices
1. Always use TypeScript interfaces for data models
2. Implement error handling in service methods
3. Use meaningful collection names
4. Document service methods with JSDoc
5. Follow the established pattern for service registration
6. Use the provided MongoDB query interfaces
7. Use generic routes for simple operations and custom routes for complex business logic
8. Validate all input data before performing database operations
