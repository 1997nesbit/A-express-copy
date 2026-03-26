# Customers API

Base URL: `/api/`

All endpoints require authentication (HttpOnly cookie JWT).

---

## Customers

### GET `/api/customers/`
List all customers.

**Query Parameters**

| Param | Description |
|---|---|
| `search` | Search by customer name |
| `customer_type` | `Normal` or `Repairman` |
| `ordering` | e.g. `name`, `-created_at` |

**Response `200 OK`**
```json
[
  {
    "id": 7,
    "name": "Juma Ali",
    "customer_type": "Normal",
    "phone_numbers": [
      { "id": 3, "phone_number": "+255712000000" },
      { "id": 4, "phone_number": "+255768000001" }
    ],
    "created_at": "2024-06-15T10:00:00Z"
  }
]
```

> **Note:** Phone numbers are stored encrypted in the database. They are decrypted automatically when serialized.

---

### POST `/api/customers/`
Create a new customer.

**Request**
```json
{
  "name": "Amina Salim",
  "customer_type": "Normal",
  "phone_numbers": [
    { "phone_number": "+255754321000" }
  ]
}
```

**Response `201 Created`** — full customer shape.

---

### GET `/api/customers/{id}/`
Retrieve a single customer with their task history.

**Response `200 OK`** — full customer shape + `tasks` array (list representation).

---

### PATCH `/api/customers/{id}/`
Partially update a customer (name, type, phone numbers).

**Request**
```json
{
  "name": "Amina S.",
  "phone_numbers": [
    { "id": 5, "phone_number": "+255754321099" }
  ]
}
```

---

### DELETE `/api/customers/{id}/`
Delete a customer. **Manager role required.**

**Response `204 No Content`**

---

## Referrers

People or businesses that refer customers to the shop. Tracked for commission or analytics.

### GET `/api/referrers/`

**Response `200 OK`**
```json
[
  {
    "id": 1,
    "name": "Tech Hub",
    "phone": "+255700111222",
    "created_at": "2024-03-01T00:00:00Z"
  }
]
```

### POST `/api/referrers/`

**Request**
```json
{
  "name": "Digital City",
  "phone": "+255700333444"
}
```

### PATCH `/api/referrers/{id}/`
### DELETE `/api/referrers/{id}/`
