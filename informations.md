# API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication
All requests except login/register require a Bearer token in the Authorization header:
```http
Authorization: Bearer <jwt_token>

Models & Interfaces
User

interface User {
  id: string;
  username: string;
  role: 'commercial' | 'caissier' | 'vendeuse' | 'manager_foire' | 'manager_grossiste' | 'admin';
  permissions: string[];
  isActive: boolean;
}

Article

interface Article {
  Code: string;
  CodeBar: string;
  Designation: string;
  Stock: number;
  Famille: string;
  Marque: string;
  PrixAchatHT: number;
  MB: number;
  TVA: number;
  PventeTTC: number;
  PventePubHT: number;
  CodeFrs: string;
  IntituleFrs: string;
  DateCreation: Date;
  DateModification: Date;
  Ecrivain: string;
  Collection: string;
  RemiseFidelite: number;
  DernierePUHT: number;
  DerniereRemise: number;
}

Client
interface Client {
  CodeClient: string;
  Intitule: string;
  Tel1: string;
  Tel2: string;
  Profession: string;
  Societe: string;
  Mail: string;
  Adresse: string;
}
driver 

interface Driver {
  name: string;
  phoneNumber: string;
  licenses: Array<{
    number: string;
    type: string;
    expiryDate: Date;
  }>;
  address?: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
}

invoice 

interface Invoice {
  invoiceNumber: string;
  client: string; // Client ID
  driver?: string; // Driver ID
  user: string; // User ID
  items: Array<{
    article: string; // Article ID
    quantity: number;
    unitPrice: number;
    discount: number;
    totalHT: number;
    totalTTC: number;
    tva: number;
  }>;
  subTotalHT: number;
  totalDiscount: number;
  totalTVA: number;
  totalTTC: number;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'CANCELLED' | 'OVERDUE';
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  paymentMethod?: 'CASH' | 'CHECK' | 'BANK_TRANSFER';
  paymentReference?: string;
  paymentDate?: Date;
  issueDate: Date;
  dueDate: Date;
  notes?: string;
  termsAndConditions?: string;
}

API Endpoints
Authentication

POST /api/auth/register
POST /api/auth/login

Login Request
interface LoginRequest {
  username: string;
  password: string;
}
Login Response
interface LoginResponse {
  user: User;
  token: string;
}

Articles
List Articles

GET /api/articles

Query Parameters:

page (default: 1)
limit (default: 50)
search (optional)
Get Single Article
GET /api/articles/:id
Create Article
POST /api/articles

Update Article
PUT /api/articles/:id

Delete Article
DELETE /api/articles/:id

Import/Export Articles
POST /api/articles/import
GET /api/articles/export

Clients
List Clients
GET /api/clients

Query Parameters:

page (default: 1)
limit (default: 50)
search (optional)
Get Single Client
GET /api/clients/:id
Create Client
POST /api/clients
Update Client
PUT /api/clients/:id
Delete Client
DELETE /api/clients/:id
Import/Export Clients
POST /api/clients/import
GET /api/clients/export

Drivers
List Drivers
GET /api/drivers

Query Parameters:

page (default: 1)
limit (default: 50)
search (optional)
Get Single Driver
GET /api/drivers/:id
Create Driver
POST /api/drivers
Update Driver
PUT /api/drivers/:id
Delete Driver
DELETE /api/drivers/:id
Invoices
List Invoices
GET /api/invoices
Query Parameters:

page (default: 1)
limit (default: 50)
status
paymentStatus
startDate
endDate
minAmount
maxAmount
clientId
userId
Get Single Invoice
GET /api/invoices/:id
Create Invoice
POST /api/invoices
Update Invoice
PUT /api/invoices/:id
Delete Invoice
DELETE /api/invoices/:id
Role-Based Permissions

const ROLE_PERMISSIONS = {
  admin: [
    'manage:users',
    'manage:invoices',
    'manage:inventory',
    'manage:sales',
    'manage:clients',
    'manage:drivers',
    'view:reports',
    'view:inventory',
    'view:clients',
    'view:drivers',
    'view:invoices'
  ],
  manager_foire: [
    'manage:inventory',
    'manage:sales',
    'manage:clients',
    'manage:drivers',
    'view:reports',
    'view:inventory',
    'view:clients',
    'view:drivers'
  ],
  manager_grossiste: [
    'manage:inventory',
    'manage:sales',
    'manage:clients',
    'manage:drivers',
    'view:reports',
    'view:inventory',
    'view:clients',
    'view:drivers'
  ],
  commercial: [
    'manage:sales',
    'manage:clients',
    'view:inventory',
    'view:clients',
    'view:reports'
  ],
  caissier: [
    'manage:sales',
    'view:inventory',
    'view:clients',
    'view:reports'
  ],
  vendeuse: [
    'manage:sales',
    'view:inventory',
    'view:clients'
  ]
}
Error Handling
All endpoints return errors in this format:

interface ErrorResponse {
  error: string;
  status?: string;
}

Common HTTP Status Codes:

200: Success
201: Created
400: Bad Request
401: Unauthorized
403: Forbidden
404: Not Found
500: Internal Server Error
Pagination Response Format
All paginated endpoints return data in this format:

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pages: number;
  currentPage: number;
}


This documentation provides all the necessary information for your frontend developer to:
1. Understand the data models
2. Know all available API endpoints
3. Handle authentication and permissions
4. Implement proper error handling
5. Work with pagination
6. Make proper API requests

Let me know if you need any clarification or additional information added to the documentation.This documentation provides all the necessary information for your frontend developer to:
1. Understand the data models
2. Know all available API endpoints
3. Handle authentication and permissions
4. Implement proper error handling
5. Work with pagination
6. Make proper API requests

Let me know if you need any clarification or additional information added to the documentation.

