# API Documentation

## Users

### GET /users/all
- **Description**: Retrieve all users.
- **Authentication**: Required
- **Response**:
  - Success: `{ "message": "Success", "data": [sanitized user objects] }`
  - Error: `{ "message": "User not found", "data": null }` (404)

### GET /users/profile
- **Description**: Retrieve the profile of the authenticated user.
- **Authentication**: Required
- **Response**:
  - Success: `{ "message": "Hello {user name}", "data": sanitized user object }`
  - Error: `{ "message": "User not found", "data": { "userId": "id" } }` (404)

## Auth

### POST /auth/register
- **Description**: Register a new user.
- **Body**: `{ "name": "string", "email": "string", "password": "string" }`
- **Authentication**: None
- **Response**:
  - Success: `{ "message": "User successfully created", "data": { "name": "string", "email": "string", "accessToken": "string" } }` (sets refresh token cookie)
  - Error: `{ "message": "Email already registered" }` (409), `{ "message": "Unable to create user" }` (409)

### POST /auth/login
- **Description**: Login a user.
- **Body**: `{ "email": "string", "password": "string" }`
- **Authentication**: None
- **Response**:
  - Success: `{ "message": "Welcome to Roommate {name}", "data": { "accessToken": "string", "name": "string", "email": "string" } }` (sets refresh token cookie)
  - Error: `{ "message": "User not found" }` (404), `{ "message": "Password mismatch" }` (403), `{ "message": "Unable to login" }`

### GET /auth/refresh
- **Description**: Refresh access token using refresh token from cookie.
- **Authentication**: None (uses cookie)
- **Response**:
  - Success: `{ "message": "Success", "data": { "userId": "string", "name": "string", "email": "string", "accessToken": "string" } }`
  - Error: `{ "message": "No refresh token provided" }` (401), `{ "message": "Refresh token invalid" }`, `{ "message": "User not found" }` (404), etc.

### GET /auth/logout
- **Description**: Logout user by clearing refresh token cookie.
- **Authentication**: None
- **Response**: Clears cookie, no body.

## Chore

### POST /chore/add
- **Description**: Add a new chore.
- **Authentication**: Required
- **Body**: `{ "householdId": "string", "description": "string", "frequency": "string", "assignedToId": "string", "nextDue": "date (optional)" }`
- **Response**:
  - Success: `{ "message": "Chore Created", "data": created chore object }` (201)

### POST /chore/update/:choreId
- **Description**: Update a chore (complete or reschedule).
- **Authentication**: Required
- **Params**: `choreId`
- **Body**: `{ "assignedToId": "string", "nextDue": "date", "completed": boolean }`
- **Response**:
  - Success: `{ "message": "Chore Created", "data": updated chore object }` (202)
  - Error: `{ "message": "Chore not found" }` (404)

## Expenses

### POST /expenses/add
- **Description**: Add a new expense.
- **Authentication**: Required
- **Body**: `{ "householdId": "string", "amount": number, "description": "string", "paidById": "string", "sharedWith": ["string"] }`
- **Response**:
  - Success: `{ "message": "Expense added" or "Added Expense with Expense split", "data": expense or {createdExpense, createdSplits} }` (201)
  - Error: `{ "message": "User is not a member of the household" }`, `{ "message": "Unable to add Expense" }` (409)

### GET /expenses/for/:householdId
- **Description**: Get expenses for a household.
- **Authentication**: Required
- **Params**: `householdId`
- **Response**:
  - Success: `{ "message": "Success", "data": [expenses] }`

### DELETE /expenses/:expenseId
- **Description**: Delete an expense.
- **Authentication**: Required
- **Params**: `expenseId`
- **Response**:
  - Success: `{ "message": "Expense Deleted", "data": delete response }` (202)
  - Error: `{ "message": "Expense Not found" }` (404)

### GET /expenses/for/:householdId/balances
- **Description**: Get balances for a household.
- **Authentication**: Required
- **Params**: `householdId`
- **Response**:
  - Success: `{ "message": "Success", "data": balances }`
  - Error: `{ "message": "Unable to fetch expenses for the household: {householdId}" }`

## Household Members

### POST /household-members/create
- **Description**: Create a household member for the authenticated user.
- **Authentication**: Required
- **Body**: None (optional householdId, role in service)
- **Response**:
  - Success: `{ "message": "Successfully created household member", "data": { "householdMember": object } }`
  - Error: `{ "message": "Unable to create household member" }` (409)

### GET /household-members/all/:householdId
- **Description**: Get all members of a household.
- **Authentication**: Required
- **Params**: `householdId`
- **Response**:
  - Success: `{ "message": "Successfully fetched household members", "data": [members] }`
  - Error: `{ "message": "Household not found" }` (404), `{ "message": "No members found for this household" }` (404)

## Households

### POST /households/create
- **Description**: Create a new household.
- **Authentication**: Required
- **Body**: `{ "name": "string" }`
- **Response**:
  - Success: `{ "message": "Household created", "data": { "household": object } }` (201)
  - Error: `{ "message": "User not found" }` (404), `{ "message": "Unable to create Household" }` (409)

### POST /households/join/:inviteCode
- **Description**: Join a household using invite code.
- **Authentication**: Required
- **Params**: `inviteCode`
- **Response**:
  - Success: `{ "message": "Joined the Household", "data": { "household": object } }` (201)
  - Error: `{ "message": "Household not found" }` (404), `{ "message": "User not found" }` (404), `{ "message": "User already exists in this household: {id}" }` (409), `{ "message": "Unable to join the Household" }` (409)

### GET /households/all
- **Description**: Get all households for the authenticated user.
- **Authentication**: Required
- **Response**:
  - Success: `{ "message": "Households for the user: {name}", "data": { "household": [households] } }`
  - Error: `{ "message": "User not found" }` (404), `{ "message": "Unable to fetch Households for the user: {id}" }` (409)

### POST /households/delete
- **Description**: Delete a household.
- **Authentication**: Required
- **Body**: `{ "householdId": "string" }`
- **Response**:
  - Success: `{ "message": "Household deleted successfully", "data": { "household": object } }`
  - Error: `{ "message": "Household not found" }` (404), `{ "message": "Unable to delete the Household: {id}" }` (409)

## Inventory

### GET /inventory/:householdId
- **Description**: Get inventory items for a household.
- **Authentication**: Required
- **Params**: `householdId`
- **Response**:
  - Success: `{ "message": "Success", "data": [items] }`
  - Error: `{ "message": "Household not found" }` (404)

### POST /inventory/add
- **Description**: Add a new inventory item.
- **Authentication**: Required
- **Body**: `{ "name": "string", "quantity": number, "lowThreshold": number, "householdId": "string" }`
- **Response**:
  - Success: `{ "message": "Inventory Item created", "data": created item }` (201)

### PATCH /inventory/:itemId
- **Description**: Update an inventory item.
- **Authentication**: Required
- **Params**: `itemId`
- **Body**: `{ "name": "string", "quantity": number, "lowThreshold": number }`
- **Response**:
  - Success: `{ "message": "Item Updated", "data": updated item }` (202)
  - Error: `{ "message": "Item not found" }` (404)

### DELETE /inventory/:itemId
- **Description**: Delete an inventory item.
- **Authentication**: Required
- **Params**: `itemId`
- **Response**:
  - Success: `{ "message": "Item deleted", "data": deleted item }` (202)
  - Error: `{ "message": "Item not found" }` (404)