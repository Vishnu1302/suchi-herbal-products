# Infrastructure

> Deployment configs, Docker files, and CI/CD pipelines will live here.

## Deployment Strategy (Free Tier)

| Service  | Platform             | Notes                                          |
| -------- | -------------------- | ---------------------------------------------- |
| Frontend | **Vercel**           | Auto-deploy from `frontend/` on push to `main` |
| Backend  | **Render.com**       | Free web service, auto-deploy from `backend/`  |
| Database | **MongoDB Atlas**    | M0 Free cluster (512MB)                        |
| Domain   | **Vercel** subdomain | Free `.vercel.app` domain                      |

## Files (planned)

```
infrastructure/
├── docker/
│   ├── Dockerfile.frontend
│   └── Dockerfile.backend
├── render.yaml          # Render.com deploy config
├── vercel.json          # Vercel deploy config
└── .github/
    └── workflows/
        └── ci.yml       # GitHub Actions CI
```
