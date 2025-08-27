# MilkTea POS API

## Auth
- POST /api/auth/login { email, password }

## Users (ADMIN)
- GET /api/users
- POST /api/users
...

## Inventory (ADMIN, INVENTORY)
- /api/inventory/categories, brands, variants, units
- /api/inventory/products
- /api/inventory/stock

## Sales (ADMIN, CASHIER)
- /api/sales
- /api/reports/summary/:period  (daily|weekly|monthly|annual)
- /api/reports/export/:period/csv
- /api/reports/export/:period/pdf
