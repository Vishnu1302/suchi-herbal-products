# New Service Prompt — Suchi Kids Fashion

## How to Use

Open Copilot Chat, type:

```
/new-service [name] — [what it does]
```

Example:

```
/new-service wishlist — stores and retrieves user's saved products using signals
```

---

## What Copilot Will Generate

1. `frontend/src/app/core/services/[name].service.ts` — Angular service
2. Optional: matching mock data if `environment.useMockData` is relevant
3. Usage snippet showing how to inject the service in a component

---

## Prompt Template (Copilot reads this)

You are working on **Suchi Kids Fashion** — Angular 17+ with signals, Firebase auth, and a Node.js/Express backend.

Create a new Angular service following ALL of these rules:

### Service Rules

- `@Injectable({ providedIn: 'root' })`
- Use `inject()` for HttpClient and other dependencies — no constructor params
- Expose reactive state via **signals**: `signal()`, `computed()`
- Use `toSignal()` to convert HTTP observables where appropriate
- Check `environment.useMockData` — if true, return mock data from `core/mocks/`
- Use `HttpClient` for backend calls to `environment.apiUrl`

### Method Naming

- `getAll()` → returns `Observable<T[]>`
- `getById(id)` → returns `Observable<T>`
- `create(data)` → returns `Observable<T>` — POST
- `update(id, data)` → returns `Observable<T>` — PATCH
- `delete(id)` → returns `Observable<void>` — DELETE

### Error Handling

Use `catchError` + `throwError` in RxJS pipe, or `try/catch` with async calls.

### Backend API base

```typescript
private apiUrl = inject(/* environment */) // environment.apiUrl + '/resource-name'
private http = inject(HttpClient);
```

---

## Service Request

Service name: **{{SERVICE_NAME}}Service**

Purpose: {{SERVICE_DESCRIPTION}}

Backend endpoint: `{{API_ENDPOINT}}`

Data model: `{{MODEL_NAME}}` from `core/models/{{model}}.model.ts`

Mock data file: `core/mocks/{{model}}.mock.ts`

Special logic: {{ANY_EXTRA_REQUIREMENTS}}
