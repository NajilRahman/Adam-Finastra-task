# Engineering Decisions

This document outlines the technical architecture, design patterns, and engineering decisions implemented in the Aura EMR Appointment Management System.

---

## 1. Project Architecture (Clean Service-Oriented Architecture)

The backend follows a **Service-Layer Architecture** rather than putting business logic inside controllers or model hooks.

### Rationale
* **Separation of Concerns**: Controllers are lightweight wrappers that receive requests, call Joi validators, invoke services, and structure responses. They are agnostic of database operations or validation rules.
* **Reusable Business Logic**: The logic for booking validations, slot checking, and schedule parsing is encapsulated inside services (e.g., `slot.service.js`, `appointment.service.js`). This makes it easy to expose functionality via CLI scripts, cron jobs, or WebSocket event listeners without duplicating code.
* **Testability**: Services are purely functional and accept parameters. This allows testing business rules independently of HTTP request/response mocks.

---

## 2. MongoDB Schema Design & Relationships

We modeled the entities with MongoDB references (`ObjectId`) to enforce normalized document schemas for clinical staff and patient records:

1. **User Collection**: Holds authentication credentials, salt-hashed passwords, active sessions, and roles (`super_admin`, `receptionist`, `doctor`).
2. **Doctor Collection**: Extends User for practitioners. It maintains a 1-to-1 link to `User` along with clinical attributes (department, specialization, contact details).
3. **Patient Collection**: Maintains patient profiles. The `mobileNumber` and `patientId` are unique identifiers.
4. **Schedule Collection**: Connects 1-to-1 with `Doctor`. It contains structured working days, slot duration, and nested arrays for sessions and breaks. Storing these inside a single document per doctor keeps lookups fast and atomic.
5. **Appointment Collection**: The transactional core. It references `Patient`, `Doctor`, and holds date and time intervals.
6. **AuditLog Collection**: Flat document structure logging user IDs, action names, target entities, and metadata.

---

## 3. Concurrency Handling & Double Booking Prevention

Double booking is strictly prevented using a **Database-Level Compound Partial Unique Index** on the `Appointment` collection:
```javascript
appointmentSchema.index(
  { doctor: 1, date: 1, 'slot.startTime': 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: { $in: ['scheduled', 'arrived', 'completed'] } } 
  }
);
```

### Why this strategy was chosen
* **Distributed Scalability**: Unlike memory locks or single-process Mutexes, this database-level constraint works across multiple application server instances (e.g., behind a load balancer).
* **Robustness**: Even if two parallel HTTP threads check availability simultaneously and both see the slot as free (a classic race condition), MongoDB resolves the conflict at write time. One request successfully writes, while the second yields code `11000` (duplicate key error).
* **Partial Filtering**: By using a partial index filtering on active statuses (`scheduled`, `arrived`, `completed`), a cancelled appointment is excluded from the unique constraint. If an appointment is cancelled, the slot automatically becomes available for booking again without requiring database cleanups.
* **Note on MongoDB `$ne` Limitation**: MongoDB partial indexes do not support negative operators (`$ne`). Therefore, we defined the filter using `$in` matching all active states, which is fully supported and matches our status workflow.

---

## 4. Database Indexing Strategy

We configured specific indexes to ensure fast response times during lookups:

* `{ email: 1 }` (User): Speeds up login credentials verification.
* `{ doctor: 1, date: 1 }` (Schedule): Quick loading of doctor working configurations.
* `{ doctor: 1, date: 1, status: 1 }` (Appointment): Rapid retrieval of booked slots for slot generation.
* `{ patient: 1 }`, `{ doctor: 1 }` (Appointment): Accelerates patient history loads and doctor dashboard queries.
* `{ date: 1 }`, `{ status: 1 }` (Appointment): Fast date range filters and status metrics.
* `{ name: 'text', patientId: 'text' }` (Patient): Text indexes for fast regex searches by receptionist desks.

---

## 5. Security Measures

* **JWT Access & Refresh Token Rotation**: Long-lived sessions are avoided. Access tokens expire in 15 minutes, while refresh tokens (valid for 7 days) are hashed and stored in database. When a new access token is requested, the refresh token is rotated.
* **Bcrypt Password Hashing**: Passwords are hashed with salt-rounds of 10 during user creation. The raw password is explicitly excluded from Mongoose selections by default (`select: false`).
* **Strict RBAC Middleware**: The `restrictTo(...roles)` middleware protects mutation operations at the router level.
* **Query Injection Isolation**: Even if a doctor attempts to query other practitioners' appointments, the service layer automatically overrides query filters with their own doctor profile ID derived from the verified JWT context.
* **Input Sanitization**: Joi schemas enforce strict schemas, stripping off unknown properties to prevent parameter pollution.

---

## 6. Performance Optimizations

* **Vite React Bundle Build**: Assets are modularly compiled, minified, and cached.
* **Transpiled ES Modules**: Enabled `"type": "module"` in Node.js for modern EcmaScript support.
* **Axios Interceptor Queueing**: Prevents duplicate refresh token calls. If multiple API calls fail with 401 simultaneously, they are queued while a single refresh token request is executed, after which the queue is flushed with the new token.
* **Lightweight Pagination**: Page counts and counts are calculated using `countDocuments` with filters instead of fetching all documents and slicing in memory.

---

## 7. Scaling to Millions of Appointments

If Aura EMR grows to support millions of appointments, the following architectural upgrades would be recommended:

1. **Database Sharding**: Shard the `appointments` collection by `doctor` or `date`. Since queries are mostly filtered by date and doctor, this distributes read/write loads evenly across MongoDB nodes.
2. **Caching Slot Grids (Redis)**: Slot generation is computationally heavy. We can cache doctor schedules and daily slots in Redis. When an appointment is booked or cancelled, the cache is invalidated.
3. **Queueing (BullMQ/RabbitMQ)**: Place booking requests into a message queue to handle traffic spikes. The queue workers process writes sequentially, flattening load spikes.
4. **Read/Write Replica Segregation**: Send dashboard reads and reports to MongoDB read-replicas, keeping the primary node dedicated to booking mutations.
