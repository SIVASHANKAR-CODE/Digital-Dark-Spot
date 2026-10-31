# API Documentation

## Base URL

Development: `http://localhost:3001/api/v1`

## Authentication

No authentication required for the hackathon version. Future versions will implement JWT-based auth.

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-01T00:00:00.000Z"
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Research question must be between 5 and 500 characters"
  }
}
```

## Endpoints

### Health Check

```
GET /api/v1/health
```

Returns service health and dependency status.

### Research

#### Create Research Session

```
POST /api/v1/research
Content-Type: application/json

{
  "question": "What should students verify before applying for scholarships?",
  "objective": "Comprehensive verification checklist",
  "sourceUrls": [
    "https://example.com/scholarship-guide"
  ]
}
```

#### List All Research Sessions

```
GET /api/v1/research
```

#### Get Research Session

```
GET /api/v1/research/:id
```

#### Delete Research Session

```
DELETE /api/v1/research/:id
```

### Sources

#### Add Sources to Research

```
POST /api/v1/research/:id/sources
Content-Type: application/json

{
  "urls": ["https://example.com/article"]
}
```

#### Get Sources for Research

```
GET /api/v1/research/:id/sources
```

### Analysis

#### Start Analysis

```
POST /api/v1/research/:id/analyze
```

This triggers the full analysis pipeline: content extraction → AI analysis → result assembly.

#### Get Analysis Status

```
GET /api/v1/research/:id/status
```

### Reports

#### Get Research Report

```
GET /api/v1/research/:id/report
```

Returns formatted report data suitable for rendering or export.

## Rate Limits

- 100 requests per 15-minute window (configurable)
- Analysis requests are rate-limited more aggressively

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `EXTRACTION_FAILED` | 502 | Content extraction failed |
| `AI_PROVIDER_ERROR` | 502 | AI analysis failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

