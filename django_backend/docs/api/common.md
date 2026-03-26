# Common API

Base URL: `/api/`

Shared reference data: device brands, locations, and laptop models.

All endpoints require authentication.

---

## Brands

### GET `/api/brands/`
List all device brands.

**Response `200 OK`**
```json
[
  { "id": 1, "name": "HP" },
  { "id": 2, "name": "Dell" },
  { "id": 3, "name": "Lenovo" },
  { "id": 4, "name": "Apple" }
]
```

### POST `/api/brands/`
Create a brand. **Manager role required.**

**Request**
```json
{ "name": "Asus" }
```

### PATCH `/api/brands/{id}/`
### DELETE `/api/brands/{id}/`

---

## Locations

Branches or workshop locations where tasks are held.

### GET `/api/locations/`
List all active locations (sorted active-first, then alphabetically).

**Response `200 OK`**
```json
[
  { "id": 1, "name": "Main Branch", "is_workshop": false, "is_active": true },
  { "id": 2, "name": "Workshop Kariakoo", "is_workshop": true, "is_active": true }
]
```

> To retrieve **all** locations including inactive ones, pass `?include_inactive=true`.

### POST `/api/locations/`
Create a location. **Manager role required.**

**Request**
```json
{
  "name": "Upanga Branch",
  "is_workshop": false
}
```

### PATCH `/api/locations/{id}/`
Update a location.

### DELETE `/api/locations/{id}/`
Soft-deletes the location (sets `is_active = False`). The record is preserved in the database to protect task history. **Manager role required.**

---

## Device Models

Laptop models, grouped by brand.

### GET `/api/models/`
List all device models.

**Query Parameters:** `brand` (filter by brand ID)

**Response `200 OK`**
```json
[
  { "id": 1, "name": "Pavilion 15", "brand": 1 },
  { "id": 2, "name": "EliteBook 840", "brand": 1 },
  { "id": 5, "name": "IdeaPad 3", "brand": 3 }
]
```

### POST `/api/models/`
Create a device model. **Manager role required.**

**Request**
```json
{
  "name": "MacBook Air M2",
  "brand": 4
}
```

> `name + brand` must be unique.

### PATCH `/api/models/{id}/`
### DELETE `/api/models/{id}/`
