<<<<<<< HEAD
=======
---

# 📚 WordWave

Multi-user blogging website

![Blog Screenshot](https://github.com/user-attachments/assets/7ef5a3d6-b1e1-4c1a-ad33-c0f80a99c3a8)

---

## ✅ Features

1. **User Table Creation**
   Structured database table to manage user data.

2. **Get All Users Route**
   API endpoint to retrieve a list of all users.

3. **Update User (POST Method)**
   Endpoint to update user information via POST request.

4. **Soft Delete User**
   Users are soft-deleted, meaning they are marked as inactive instead of being removed from the database.

5. **Superuser Flag**
   `is_superuser` field in the database to identify admin users.
   ➤ This field is **immutable from the frontend UI** for security purposes.

---

## ⚙️ Non-Functional Requirements

* **Security:** Sensitive fields like `is_superuser` must not be modifiable from the frontend.
* **Performance:** User routes should handle multiple concurrent requests efficiently.
* **Scalability:** The system should support an increasing number of users and posts with minimal changes.
* **Maintainability:** Code should be clean and modular for easy updates and debugging.

---
>>>>>>> origin/main
