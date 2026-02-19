# Credentials & Account Creation

You can create **any** new account on the Signup page. The system does **not** check against `students.xlsx` anymore.

## 1. Existing Test Accounts (Try Logging In)
I already created these accounts during debugging. You can log in immediately with them:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student** | `test@example.com` | `password123` | Dept: Computer Science, Batch: 2024 |
| **Student** | `debug_user@example.com` | `password123` | Dept: Computer Science, Batch: 2024 |

## 2. Creating a NEW Student Account
You can enter any details, but ensure:
- **Email**: Must be unique (not used before).
- **Register Number**: Must be unique.
- **Batch**: Must be a number (e.g., 2024, 2025).

**Example Data:**
- Name: `Your Name`
- Email: `newuser@example.com`
- Department: `Computer Science`
- Register Number: `99999999`
- Batch: `2025`
- Password: `password123`

## 3. Creating a NEW Staff Account
**Important:** Staff accounts have strict ID validation.
- Select **Role**: `Staff` (if available in UI, otherwise default is Student).
- **Staff ID**: Must start with the Department name followed by 2 digits.
  - Example: If Dept is `CSE`, Staff ID must be `CSE01`, `CSE02`, etc.

**Example Data:**
- Name: `Staff Member`
- Email: `staff@example.com`
- Department: `CSE`
- Staff ID: `CSE01`
- Password: `password123`
