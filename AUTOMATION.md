# n8n Automation Setup Guide

This document provides step-by-step instructions for setting up n8n automation workflows to handle repository ingestion and enrichment.

## Overview

The automation system consists of:

1. **Repository Ingestion** - Runs every 1 hour to fetch NEW repositories from external sources
2. **Repository Processing** - Processes existing repositories that need image/metadata updates
3. **Repository Enrichment** - Runs every 5 minutes to enrich repositories with AI-generated content
4. **Health Monitoring** - Endpoint for monitoring system health
5. **Status Tracking** - Endpoint for tracking automation progress

## Workflow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   External      │    │    Ingestion     │    │   Enrichment    │    │   Cache         │
│   Sources       │───▶│    Endpoint      │───▶│    Endpoint     │───▶│   Revalidation  │
│                 │    │                  │    │                 │    │                 │
│ • OSS Insight   │    │ • Fetch new      │    │ • AI summaries  │    │ • Clear SSG     │
│ • GitHub        │    │   repositories   │    │ • Tags & levels │    │   cache         │
│ • Papers        │    │ • Add to DB      │    │ • Content gen   │    │ • Fresh data    │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └─────────────────┘
```

## API Endpoints

All automation endpoints require an API key (`X-API-Key` header) and are located at:

Base URL: `https://yourdomain.com/api/automation/`

### 1. Health Check

- **Endpoint**: `GET /api/automation/health`
- **Purpose**: Check system health and configuration
- **Headers**: `X-API-Key: your-api-key`

### 2. Status Check

- **Endpoint**: `GET /api/automation/status`
- **Purpose**: Get current automation statistics
- **Headers**: `X-API-Key: your-api-key`

### 3. Repository Ingestion (NEW)

- **Endpoint**: `POST /api/automation/ingest`
- **Purpose**: Fetch NEW repositories from external sources (OSS Insight, Papers, Trending)
- **Headers**: `X-API-Key: your-api-key`
- **Schedule**: Every 1 hour
- **Limit**: Maximum 20 repositories per hour
- **Process**:
  1. Calls `/api/ossinsight` to get trending repos
  2. Calls `/api/paper` to get research paper repos
  3. Calls `/api/trending` to get GitHub trending repos
  4. Limits to 20 repositories total (prevents overload)
  5. Adds basic repository records to database
  6. Marks as `ingested: false` and `enriched: false` for later processing
  7. **Does NOT do full processing** - just adds to database

### 4. Repository Processing

- **Endpoint**: `POST /api/automation/process`
- **Purpose**: Process existing repositories that need image/metadata updates
- **Headers**: `X-API-Key: your-api-key`
- **Schedule**: As needed (can be triggered manually or scheduled)
- **Process**: Handles repositories with `ingested: false`

### 5. Repository Enrichment (SMART)

- **Endpoint**: `POST /api/automation/enrich`
- **Purpose**: Enrich repositories with AI-generated content
- **Headers**: `X-API-Key: your-api-key`
- **Schedule**: Every 5 minutes
- **Process**:
  1. Finds repositories that are ingested but not enriched
  2. Generates AI summaries and descriptions
  3. Adds experience levels, tags, and usability ratings
  4. Handles repositories added by the ingest endpoint

### 6. Cache Revalidation

- **Endpoint**: `POST /api/revalidate`
- **Purpose**: Clear Next.js SSG cache to show fresh data
- **Headers**: `Content-Type: application/json`
- **Body**: `{ "secret": "REVALIDATION_SECRET", "path": "/" }`
- **Schedule**: Triggered by N8N after successful ingestion/enrichment
- **Process**:
  1. Validates secret token
  2. Revalidates specified path (usually "/")
  3. Forces Next.js to regenerate static pages
  4. Ensures new repositories appear immediately

## Optimized Workflow

```
External Sources (unlimited)
         ↓
   Ingest (20/hour) → Database (basic records)
         ↓
   Process (as needed) → Full metadata
         ↓
   Enrich (every 5min) → AI content
         ↓
   Revalidate Cache → Fresh SSG pages
         ↓
   Published repositories
```

**Benefits**:

- ✅ **Rate limiting**: Only 20 new repos per hour prevents overload
- ✅ **Separation**: Ingest just adds to DB, processing happens separately
- ✅ **Efficiency**: Enrich endpoint handles all new repos every 5 minutes
- ✅ **Scalability**: Can handle large numbers of discovered repos without timeout
- ✅ **Fresh data**: Cache revalidation ensures new data appears immediately

## n8n Workflow Configurations

### Workflow 1: Repository Ingestion (Hourly)

```json
{
  "name": "Repository Ingestion - Hourly",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "hoursInterval": 1
            }
          ]
        }
      },
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "url": "https://yourdomain.com/api/automation/ingest",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "X-API-Key",
              "value": "={{$credentials.apiKey}}"
            }
          ]
        },
        "options": {
          "timeout": 300000
        }
      },
      "name": "Trigger Ingestion",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.success}}",
              "value2": true
            }
          ]
        }
      },
      "name": "Check Success",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "message": "✅ Repository ingestion completed successfully!\n\nProcessed: {{$json.processed}}\nErrors: {{$json.errors}}\nTimestamp: {{$json.timestamp}}"
      },
      "name": "Success Notification",
      "type": "n8n-nodes-base.noOp",
      "typeVersion": 1,
      "position": [900, 200]
    },
    {
      "parameters": {
        "message": "❌ Repository ingestion failed!\n\nError: {{$json.error}}\nTimestamp: {{$json.timestamp}}"
      },
      "name": "Error Notification",
      "type": "n8n-nodes-base.noOp",
      "typeVersion": 1,
      "position": [900, 400]
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "Trigger Ingestion",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Trigger Ingestion": {
      "main": [
        [
          {
            "node": "Check Success",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check Success": {
      "main": [
        [
          {
            "node": "Success Notification",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Error Notification",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Workflow 2: Repository Enrichment (Every 5 minutes)

```json
{
  "name": "Repository Enrichment - 5min",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "minutes",
              "minutesInterval": 5
            }
          ]
        }
      },
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "url": "https://yourdomain.com/api/automation/status",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "X-API-Key",
              "value": "={{$credentials.apiKey}}"
            }
          ]
        }
      },
      "name": "Check Status",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.nextActions.shouldRunEnrichment}}",
              "value2": true
            }
          ]
        }
      },
      "name": "Should Run Enrichment?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "url": "https://yourdomain.com/api/automation/enrich",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "X-API-Key",
              "value": "={{$credentials.apiKey}}"
            }
          ]
        },
        "options": {
          "timeout": 300000
        }
      },
      "name": "Trigger Enrichment",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [900, 200]
    },
    {
      "parameters": {
        "message": "ℹ️ No repositories need enrichment at this time."
      },
      "name": "Skip Notification",
      "type": "n8n-nodes-base.noOp",
      "typeVersion": 1,
      "position": [900, 400]
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "Check Status",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check Status": {
      "main": [
        [
          {
            "node": "Should Run Enrichment?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Should Run Enrichment?": {
      "main": [
        [
          {
            "node": "Trigger Enrichment",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Skip Notification",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Workflow 3: Health Monitoring (Every 15 minutes)

```json
{
  "name": "Health Monitor - 15min",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "minutes",
              "minutesInterval": 15
            }
          ]
        }
      },
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "url": "https://yourdomain.com/api/automation/health",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "X-API-Key",
              "value": "={{$credentials.apiKey}}"
            }
          ]
        }
      },
      "name": "Health Check",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.status}}",
              "value2": "healthy"
            }
          ]
        }
      },
      "name": "Is Healthy?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "message": "🚨 System health check failed!\n\nStatus: {{$json.status}}\nError: {{$json.error}}\nMissing env vars: {{$json.environment.missingEnvVars}}"
      },
      "name": "Alert Notification",
      "type": "n8n-nodes-base.noOp",
      "typeVersion": 1,
      "position": [900, 400]
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "Health Check",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Health Check": {
      "main": [
        [
          {
            "node": "Is Healthy?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Is Healthy?": {
      "main": [
        [],
        [
          {
            "node": "Alert Notification",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Setup Instructions

### 1. Create API Key Credentials in n8n

1. Go to n8n credentials section
2. Create a new credential of type "Generic Credential"
3. Name it "Spy API Key"
4. Add field: `apiKey` with your `API_SECRET_KEY` value

5. Create another credential for revalidation:
6. Create a new credential of type "Generic Credential"
7. Name it "Revalidation Secret"
8. Add field: `secret` with your `REVALIDATION_SECRET` value

### 2. Import Workflows

1. Copy each workflow JSON above
2. In n8n, go to Workflows
3. Click "Import from JSON"
4. Paste the workflow JSON
5. Update the domain URL in HTTP Request nodes
6. Set the API credential to "Spy API Key"
7. Set the revalidation credential to "Revalidation Secret" (for workflows with revalidation)
8. Activate the workflow

### 4. Environment Variables

Ensure these environment variables are set in your application:

```bash
# Required for automation
API_SECRET_KEY=your-secret-api-key-here
REVALIDATION_SECRET=your-revalidation-secret-here
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database connection
SUPABASE_DATABASE_HOST=your-host
SUPABASE_DATABASE_NAME=postgres
SUPABASE_DATABASE_USER=your-user
SUPABASE_DATABASE_PASSWORD=your-password
SUPABASE_DATABASE_PORT=5432

# External APIs
GITHUB_TOKEN=your-github-token
OPENAI_API_KEY=your-openai-key
OPENAI_API_URL=https://api.upstage.ai/v1/chat/completions
OPENAI_API_MODEL=solar-mini
```

### 5. Testing

Test each endpoint manually first:

```bash
# Health check
curl -X GET "https://yourdomain.com/api/automation/health" \
  -H "X-API-Key: your-api-key"

# Status check
curl -X GET "https://yourdomain.com/api/automation/status" \
  -H "X-API-Key: your-api-key"

# Test ingestion
curl -X POST "https://yourdomain.com/api/automation/ingest" \
  -H "X-API-Key: your-api-key"

# Test enrichment
curl -X POST "https://yourdomain.com/api/automation/enrich" \
  -H "X-API-Key: your-api-key"

# Test revalidation
curl -X POST "https://yourdomain.com/api/revalidate" \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-revalidation-secret", "path": "/"}'
```

## Simplified Cache Management

Instead of using Supabase webhooks, this setup uses N8N workflows to handle cache revalidation:

**Advantages:**

- ✅ **Centralized**: All automation logic in N8N
- ✅ **Reliable**: Direct control over when revalidation happens
- ✅ **Simple**: No need for webhook configuration in Supabase
- ✅ **Flexible**: Easy to modify timing and conditions

**Flow:**

1. N8N triggers ingestion/enrichment
2. On success, N8N immediately calls revalidation endpoint
3. Cache is cleared and fresh data appears on the site

## Manual Cache Management

You can also trigger revalidation manually:

```bash
# Using the script
bun run revalidate

# Using the script with options
bun run revalidate --verbose
bun run revalidate --path /specific-page

# Direct API call
curl -X POST "https://yourdomain.com/api/revalidate" \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-secret", "path": "/"}'
```

## Monitoring and Troubleshooting

### Common Issues

1. **API Key Authentication Failed**

   - Verify `API_SECRET_KEY` is set in environment
   - Check n8n credential configuration
   - Ensure `X-API-Key` header is included

2. **Revalidation Failed**

   - Verify `REVALIDATION_SECRET` is set in environment
   - Check n8n revalidation credential configuration
   - Ensure JSON body format is correct

3. **Database Connection Failed**

   - Verify all `SUPABASE_DATABASE_*` variables are set
   - Test database connectivity

4. **GitHub Rate Limit**

   - Ensure `GITHUB_TOKEN` is set for higher limits
   - Monitor GitHub API usage

5. **OpenAI/Upstage API Errors**
   - Verify `OPENAI_API_KEY` is valid
   - Check API quota and billing
   - Monitor rate limits

### Logs

Check application logs for detailed error information:

- Ingestion logs: Look for "Repository ingestion" messages
- Enrichment logs: Look for "Repository enrichment" messages
- API errors: Check for HTTP error codes and messages

### Performance

- **Ingestion**: Processes ~20 repositories per hour (3-second delays)
- **Enrichment**: Processes ~12 repositories per hour (5-minute intervals)
- **Rate Limits**: Respects GitHub (60/hour) and OpenAI limits

## Scaling Considerations

For high-volume processing:

1. **Increase API Limits**: Use GitHub Apps or OpenAI paid tiers
2. **Parallel Processing**: Modify scripts to process multiple repositories concurrently
3. **Queue System**: Implement Redis-based job queues
4. **Database Optimization**: Add indexes for automation queries
5. **Monitoring**: Add detailed metrics and alerting
