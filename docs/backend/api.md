# API Documentation

## Authentication

### POST /auth/login

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

---

## Expenses

### POST /expenses

**Request:**
```json
{
  "amount": 1000,
  "description": "Groceries"
}
```

**Response:**
```json
{
  "id": "string",
  "amount": 1000
}
```

---

## Chores

### GET /chores

**Request:**
None

**Response:**
```json
[
  {
    "id": "string",
    "description": "Clean Kitchen",
    "completed": false
  }
]
```

---

## Inventory

### GET /inventory

**Request:**
None

**Response:**
```json
[
  {
    "id": "string",
    "name": "Milk",
    "quantity": 2
  }
]
```
