# OSINT System Architecture

**Complete System Design & Data Flow**

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         React/Next.js Frontend                       │   │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────┐    │   │
│  │  │   OSINT    │ │   Search   │ │   Results    │    │   │
│  │  │   Panel    │ │   Forms    │ │   Display    │    │   │
│  │  └────────────┘ └────────────┘ └──────────────┘    │   │
│  └────────────────────┬─────────────────────────────────┘   │
└─────────────────────────┼────────────────────────────────────┘
                          │ HTTP/REST
          ┌───────────────┼───────────────┐
          │               │               │
┌─────────▼──────────────────────────────▼──────────────────┐
│                    API GATEWAY / CONTROLLER                │
│              (osint.controller.ts - 450 lines)            │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────┐   │
│  │  Route /     │ │  Validation  │ │  Response      │   │
│  │  Username    │ │  & Error     │ │  Formatting    │   │
│  │  /Email      │ │  Handling    │ │               │   │
│  │  /Phone      │ │              │ │               │   │
│  │  /Domain     │ └──────────────┘ └────────────────┘   │
│  │  /IP         │                                         │
│  │  /Image      │                                         │
│  └──────────────┘                                         │
└──┬────┬─────────────────────────────────────────────────┬──┘
   │    │                                                 │
   │    ├─────────────────┬────────────────────┬──────────┘
   │    │                 │                    │
┌──▼────▼─────────────┐ ┌─▼──────────────────────▼──────┐
│  OSINT AGGREGATOR   │ │   IMAGE SEARCH SERVICE         │
│  SERVICE            │ │   (400 lines)                  │
│  (600 lines)        │ │                                │
│                     │ │ ┌────────────────────────────┐ │
│ ┌─────────────────┐ │ │ │ Qdrant Vector DB           │ │
│ │searchUsername() │ │ │ │ + CLIP Embeddings          │ │
│ │searchEmail()    │ │ │ └────────────────────────────┘ │
│ │searchPhone()    │ │ │                                │
│ │searchDomain()   │ │ │ ┌────────────────────────────┐ │
│ │searchIP()       │ │ │ │ MRISA Web Search           │ │
│ │searchName()     │ │ │ └────────────────────────────┘ │
│ └─────────────────┘ │ │                                │
│                     │ │ Deduplication & Ranking        │
│ ┌─────────────────┐ │ │ (by similarity/accuracy)       │
│ │Tool Executors   │ │ └────────────────────────────────┘
│ │├─Blackbird      │ │
│ │├─SpiderFoot     │ │ ┌────────────────────────────────┐
│ │├─PhoneInfoga    │ │ │  BREACH/ENHANCEMENT SERVICES   │
│ │├─theHarvester   │ │ │                                │
│ │└─MRISA          │ │ │ ┌──────────────────────────┐   │
│ └─────────────────┘ │ │ │ Self-Hosted HIBP         │   │
│                     │ │ │ (Breach Detection)       │   │
│ Result Dedup &      │ │ └──────────────────────────┘   │
│ Ranking             │ │                                │
└─────────────────────┘ │ ┌──────────────────────────┐   │
                         │ │ Elasticsearch            │   │
                         │ │ (Result Indexing)       │   │
                         │ └──────────────────────────┘   │
                         └────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────┐
│  USER QUERY (Frontend)                                    │
│  {                                                        │
│    "query": "john_doe",                                  │
│    "type": "username",                                   │
│    "searchScope": "quick"                                │
│  }                                                        │
└────────────────────┬─────────────────────────────────────┘
                     │ HTTP POST
                     ▼
        ┌────────────────────────────────┐
        │   API CONTROLLER               │
        │   - Route by type              │
        │   - Validate input             │
        │   - Check cache (Redis)        │
        └────────────────────────────────┘
                     │
            ┌────────┴────────┐
            │ (Cache Hit)     │ (Cache Miss)
            │                 │
            ▼                 ▼
        ┌────────┐  ┌──────────────────────────┐
        │ Redis  │  │ OSINT Aggregator Service │
        │ Cache  │  │                          │
        └────────┘  │ 1. Determine scope       │
            │       │    (quick/comprehensive) │
            │       │                          │
            │       │ 2. Execute tools:        │
            │       │    - Blackbird           │
            │       │    - SpiderFoot          │
            │       │    - PhoneInfoga         │
            │       │    - theHarvester        │
            │       │    - MRISA               │
            │       │                          │
            │       │ 3. Parallel execution    │
            │       │    with timeouts         │
            │       │                          │
            │       │ 4. Collect results       │
            │       │                          │
            │       │ 5. Deduplicate          │
            │       │                          │
            │       │ 6. Rank by accuracy      │
            │       │                          │
            │       │ 7. Format response       │
            │       └──────────┬───────────────┘
            │                  │
            └──────────┬───────┘
                       │
            ┌──────────▼──────────┐
            │  Store in Cache     │
            │  (Redis, 24h TTL)   │
            │  & Index            │
            │  (Elasticsearch)    │
            └──────────┬──────────┘
                       │
            ┌──────────▼──────────────┐
            │  Formatted Response      │
            │  {                       │
            │    success: true,        │
            │    data: {               │
            │      results: [...],     │
            │      summary: {...},     │
            │      searchTime: 12500   │
            │    }                     │
            │  }                       │
            └──────────┬───────────────┘
                       │ HTTP Response
                       ▼
            ┌──────────────────────┐
            │  Frontend            │
            │  Display Results     │
            └──────────────────────┘
```

---

## 🔌 Service Communication Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         NestJS API                           │
│                    (osint.controller.ts)                     │
└──────┬────────────────────────┬─────────────────────┬────────┘
       │                        │                     │
       │ (Calls)               │ (Calls)             │ (Calls)
       │                        │                     │
┌──────▼────────────────┐ ┌────▼──────────────────┐ ▼─────────────┐
│ OSINT Aggregator      │ │ Image Search Service  │ Breach DB    │
│ Service               │ │                       │              │
│                       │ │ HTTP Calls to:        │ ┌──────────┐ │
│ CLI Calls to:         │ │ • Qdrant              │ │PostgreSQL│ │
│ • Blackbird           │ │ • MRISA               │ └──────────┘ │
│ • theHarvester        │ │ • Embeddings Service  │              │
│ • PhoneInfoga         │ │                       │              │
│ • SpiderFoot (API)    │ │ Python Service:       │              │
│                       │ │ • CLIP Model          │              │
│                       │ │ • FastAPI Server      │              │
│ HTTP Calls to:        │ │                       │              │
│ • SpiderFoot (API)    │ │                       │              │
│ • PhoneInfoga (API)   │ │                       │              │
└──────┬────────────────┘ └────┬──────────────────┘ └─────────────┘
       │                       │
       └───────────┬───────────┘
                   │ All Results Flowing to:
                   │
       ┌───────────┴────────────┬───────────────┐
       │                        │               │
   ┌───▼────────┐        ┌──────▼────────┐  ┌──▼─────────┐
   │ Redis      │        │ Elasticsearch  │  │SearXNG     │
   │            │        │                │  │(Meta-Search
   │ Caching    │        │ Indexing       │  │            │
   │ + Rate     │        │ Full-text      │  │50+ Engines)
   │ Limiting   │        │ Search         │  │            │
   └────────────┘        └────────────────┘  └────────────┘
```

---

## 📦 Component Interaction Map

```
User Input (Frontend)
    │
    ▼
┌─────────────────────────────────┐
│ OSINTSearchPanel                │
│ (Main Container)                │
└──────────────┬──────────────────┘
               │
         ┌─────▼─────┐
         │ Route to  │
         │ Form Type │
         └─────┬─────┘
               │
    ┌──────────┼──────────┬─────────────┐
    │          │          │             │
┌───▼────────┐ ▼─────────┐ ▼────────────▼─────────┐
│ Username   │ Email     │ Phone       │ Domain   │
│ Search     │ Search    │ Search      │ Search   │
│ Form       │ Form      │ Form        │ Form     │
└───┬────────┴─┬─────────┴─┬────────────┴─────────┘
    │          │          │
    └──────────┼──────────┘
               │
        ┌──────▼──────┐
        │ API Call    │
        │ (useOSINT   │
        │  Hook)      │
        └──────┬──────┘
               │
        ┌──────▼──────────────────┐
        │ Backend Processing      │
        │ (osint-aggregator.ts)   │
        └──────┬──────────────────┘
               │
        ┌──────▼──────┐
        │ Collect &   │
        │ Format      │
        │ Results     │
        └──────┬──────┘
               │
        ┌──────▼────────────────┐
        │ Display in Results    │
        │ View / Dashboard      │
        └──────────────────────┘
```

---

## 🗄️ Database Schema (Simplified)

```
┌─────────────────────────────────────┐
│  PostgreSQL (HIBP Breaches)         │
│  ┌────────────────────────────────┐ │
│  │ breaches                       │ │
│  ├────────────────────────────────┤ │
│  │ id (PK)                        │ │
│  │ name: VARCHAR                  │ │
│  │ title: VARCHAR                 │ │
│  │ domain: VARCHAR                │ │
│  │ date_of_breach: DATE           │ │
│  │ data_classes: JSONB            │ │
│  │ affected_count: INTEGER        │ │
│  │ added_date: TIMESTAMP          │ │
│  │ modified_date: TIMESTAMP       │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │ search_results                 │ │
│  ├────────────────────────────────┤ │
│  │ id (PK)                        │ │
│  │ search_type: VARCHAR           │ │
│  │ query: VARCHAR                 │ │
│  │ result_data: JSONB             │ │
│  │ created_at: TIMESTAMP          │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Qdrant Vector Database              │
│  ┌──────────────────────────────────┐│
│  │ Collection: "images"             ││
│  ├──────────────────────────────────┤│
│  │ Vector Config:                   ││
│  │ • Size: 512 dimensions           ││
│  │ • Distance: Cosine               ││
│  │ • Engine: QDRANT                 ││
│  │                                  ││
│  │ Points (Indexed Images):         ││
│  │ {                                ││
│  │   "id": "image_hash",            ││
│  │   "vector": [0.1, 0.2, ...],     ││
│  │   "payload": {                   ││
│  │     "url": "...",                ││
│  │     "source": "instagram",       ││
│  │     "similarity": 0.98,          ││
│  │     "indexed_at": "2026-04-02"   ││
│  │   }                              ││
│  │ }                                ││
│  └──────────────────────────────────┘│
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Redis (Cache & Sessions)            │
│  ┌──────────────────────────────────┐│
│  │ Keys:                            ││
│  │ • osint:username:john_doe        ││
│  │   → {results, TTL: 24h}          ││
│  │ • rate_limit:user123:            ││
│  │   → {count: 25/30}               ││
│  │ • session:token123:              ││
│  │   → {user_id, exp_time}          ││
│  └──────────────────────────────────┘│
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Elasticsearch (Search Indexing)     │
│  ┌──────────────────────────────────┐│
│  │ Index: "osint_results"           ││
│  │ ┌────────────────────────────────┤│
│  │ │ _id: "uuid"                    │││
│  │ │ query: "john_doe"              │││
│  │ │ query_type: "username"         │││
│  │ │ source: "Blackbird"            │││
│  │ │ results: {...}                 │││
│  │ │ accuracy: 0.9                  │││
│  │ │ created_at: "2026-04-02"       │││
│  │ │ expires_at: "2026-04-03"       │││
│  │ └────────────────────────────────┤│
│  └──────────────────────────────────┘│
└──────────────────────────────────────┘
```

---

## 🔄 Request/Response Cycle

### Username Search Example

**1. Frontend Request:**
```json
{
  "username": "john_doe",
  "comprehensive": false,
  "timeout": 30000
}
```

**2. API Validation:**
- Username format: alphanumeric + underscore/dot
- Scope: quick (2-3 tools) vs comprehensive (all tools)
- Timeout: 5000-60000ms

**3. Service Processing:**
```
OSINTAggregator.searchUsername("john_doe", {scope: "quick"})
  │
  ├─ Execute Blackbird (CLI) [timeout: 8s]
  │  └─ Parse JSON output
  │  └─ Extract results
  │
  ├─ Query SpiderFoot API [timeout: 8s]
  │  └─ POST /scan/start
  │  └─ Poll for results
  │
  └─ Parallel execution
     └─ Wait for all, or timeout
     └─ Collect responses
     └─ Deduplicate by URL
     └─ Rank by accuracy score
```

**4. Result Formatting:**
```json
{
  "results": [
    {
      "source": "Blackbird",
      "type": "username_presence",
      "data": [
        "github.com/john_doe",
        "twitter.com/john_doe"
      ],
      "accuracy": 0.95,
      "verified": true
    },
    {
      "source": "SpiderFoot",
      "type": "social_media",
      "data": [...],
      "accuracy": 0.87,
      "verified": false
    }
  ],
  "summary": {
    "totalSources": 8,
    "criticalFindings": 0,
    "warnings": []
  },
  "searchTime": 12500
}
```

**5. Caching & Indexing:**
- Store in Redis (24h TTL)
- Index in Elasticsearch
- Return to frontend

---

## 🚀 Deployment Architecture

```
┌──────────────────────────────────────────────────┐
│         PRODUCTION ENVIRONMENT                    │
│                                                   │
│  ┌──────────────────────────────────────────┐   │
│  │  Load Balancer (Nginx/HAProxy)           │   │
│  │  └─ SSL/TLS Termination                  │   │
│  │  └─ Rate Limiting                        │   │
│  └────────────────┬─────────────────────────┘   │
│                   │                              │
│    ┌──────────────┼──────────────┐              │
│    │              │              │              │
│ ┌──▼──┐      ┌──▼──┐      ┌──▼──┐             │
│ │API1 │      │API2 │      │API3 │             │
│ │(3000)      │(3001)      │(3002)             │
│ └──┬──┘      └──┬──┘      └──┬──┘             │
│    │              │              │              │
│    └──────────────┼──────────────┘              │
│                   │                              │
│        ┌──────────▼──────────┐                 │
│        │ Shared Services:     │                 │
│        │ - PostgreSQL         │                 │
│        │ - Redis              │                 │
│        │ - Qdrant             │                 │
│        │ - Elasticsearch      │                 │
│        │ - External Tools     │                 │
│        └──────────────────────┘                 │
│                                                   │
│  ┌──────────────────────────────────────────┐   │
│  │  Monitoring & Logging                    │   │
│  │  - Prometheus                            │   │
│  │  - ELK Stack                             │   │
│  │  - Alerts                                │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

---

## 📊 Performance Characteristics

### Search Time Breakdown

```
Username Search (Quick Scope):
├─ Blackbird CLI:       3-5 seconds
├─ SpiderFoot API:      5-8 seconds  
├─ Parallel overhead:   1-2 seconds
├─ Deduplication:       <500ms
├─ Caching/Indexing:    <1 second
└─ Total:               8-16 seconds

Reverse Image Search:
├─ Generate embeddings: 2-4 seconds
├─ Qdrant similarity:   1-2 seconds
├─ MRISA web search:    3-5 seconds
├─ Deduplication:       <500ms
└─ Total:               6-12 seconds

Email Breach Check:
├─ Self-hosted HIBP:    <500ms
├─ Index search:        <200ms
├─ Result formatting:   <200ms
└─ Total:               <1 second
```

### Scalability Numbers

```
Single Instance (1 API + shared services):
├─ Concurrent users:     50-100
├─ Requests/min:         300-500
├─ Max search time:      30 seconds
└─ Memory usage:         4-6 GB

3x Instances (with load balancer):
├─ Concurrent users:     150-300
├─ Requests/min:         900-1500
├─ Max search time:      30 seconds
└─ Memory usage:         12-18 GB

Kubernetes (auto-scaling):
├─ Concurrent users:     1000+
├─ Requests/min:         5000+
├─ Max search time:      30 seconds
└─ Memory usage:         Dynamic
```

---

## 🔐 Security Flow

```
┌─────────────────────────────────────┐
│  Incoming Request                   │
└────────────────────┬────────────────┘
                     │
        ┌────────────▼────────────┐
        │  1. TLS/SSL             │
        │  (Load Balancer)        │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  2. Authentication      │
        │  (JWT / API Key)        │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  3. Authorization       │
        │  (RBAC / Scopes)        │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  4. Rate Limiting       │
        │  (Redis)                │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  5. Input Validation    │
        │  (Schema + Regex)       │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  6. Processing          │
        │  (Sandboxed Execution)  │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  7. Audit Logging       │
        │  (ELK Stack)            │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  8. Response Filtering   │
        │  (PII Redaction)        │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Response to Client     │
        └────────────────────────┘
```

---

## 📈 Monitoring & Observability

```
┌──────────────────────────────────────────┐
│       Metrics Collection (Prometheus)     │
│  ┌──────────────────────────────────────┐│
│  │ • API Response Time                  ││
│  │ • Request Count                      ││
│  │ • Error Rate                         ││
│  │ • Cache Hit Rate                     ││
│  │ • Service Availability               ││
│  │ • Database Connection Pool           ││
│  └──────────────────────────────────────┘│
└──────────────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   Data Storage      │
        │   (Time Series DB)  │
        └──────────┬──────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼────────┐ ┌──▼──────────┐ ┌─▼──────────┐
│ Grafana    │ │ Alert Mgr   │ │ Kibana     │
│ Dashboards │ │ (Alerts)    │ │ Logs       │
└────────────┘ └─────────────┘ └────────────┘
```

---

**Version:** 1.0  
**Status:** ✅ Complete  
**Last Updated:** April 2, 2026
