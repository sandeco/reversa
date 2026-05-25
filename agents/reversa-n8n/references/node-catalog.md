# N8N Node Catalog and Python Mapping

Quick reference used by `reversa-n8n` to interpret node types and suggest equivalent Python libraries. It is not exhaustive, it covers the most common nodes. When a node type is not listed, infer it from the name (`type` follows the pattern `n8n-nodes-base.<service>` or `@n8n/n8n-nodes-langchain.<service>`) and from `parameters`.

## Conventions

- **Type in JSON**: the node `type` field
- **Semantic meaning**: what the node represents in business terms
- **Python**: recommended library and usage pattern

---

## 1. Triggers (workflow input)

| Type in JSON | Meaning | Python |
|---|---|---|
| `n8n-nodes-base.webhook` | HTTP endpoint that triggers the flow | FastAPI or Flask. POST/GET route with `parameters.path` |
| `n8n-nodes-base.scheduleTrigger` | Periodic trigger (cron) | APScheduler (`BlockingScheduler`) or systemd timer |
| `n8n-nodes-base.cron` | Classic cron (old versions) | APScheduler or crontab |
| `n8n-nodes-base.intervalTrigger` | Fixed-time loop | `while True: ... time.sleep(N)` or APScheduler |
| `n8n-nodes-base.manualTrigger` | Manual execution | CLI script (Typer, argparse) |
| `n8n-nodes-base.emailReadImap` | IMAP inbox reading | `imapclient` + `email` |
| `n8n-nodes-base.executeWorkflowTrigger` | Sub-workflow called by another | Callable Python function |
| `n8n-nodes-base.errorTrigger` | Trigger on error in another workflow | Exception hook, error decorator |

Service triggers (pattern `<service>Trigger`) map to webhooks or polling in the service SDK (e.g. `slackTrigger` becomes Slack webhook or polling via `slack-sdk`).

---

## 2. HTTP and APIs

| Type in JSON | Meaning | Python |
|---|---|---|
| `n8n-nodes-base.httpRequest` | Generic HTTP call | `httpx` (recommended, supports sync and async) or `requests` |
| `n8n-nodes-base.respondToWebhook` | Response to received webhook | Return from FastAPI/Flask route |
| `n8n-nodes-base.graphql` | GraphQL query | `gql` or direct `httpx` |
| `n8n-nodes-base.webhook` (output) | Webhook confirmation | Route response |

---

## 3. Logic and flow

| Type in JSON | Meaning | Python |
|---|---|---|
| `n8n-nodes-base.if` | Binary conditional | `if/else` |
| `n8n-nodes-base.switch` | Multi-branch by value | `match/case` (Python 3.10+) or `if/elif` |
| `n8n-nodes-base.merge` | Join parallel branches | Combining lists, `dict.update`, `pandas.concat` |
| `n8n-nodes-base.splitInBatches` | Batch processing | `itertools.batched` (3.12+) or manual loop |
| `n8n-nodes-base.itemLists` | List operations (split, aggregation) | List comprehension, `itertools` |
| `n8n-nodes-base.wait` | Wait between steps | `time.sleep(s)` or `await asyncio.sleep(s)` |
| `n8n-nodes-base.noOp` | Direct pass-through | `pass` or identity function |
| `n8n-nodes-base.stopAndError` | Stop with error | `raise Exception(...)` |
| `n8n-nodes-base.executeWorkflow` | Calls another workflow | Python function/module call |

---

## 4. Data manipulation

| Type in JSON | Meaning | Python |
|---|---|---|
| `n8n-nodes-base.set` | Set values in fields | Assignment in dict |
| `n8n-nodes-base.editFields` | Edit item structure | `dict.update`, list comp, dataclasses |
| `n8n-nodes-base.removeDuplicates` | Remove duplicates | `set()`, `dict.fromkeys()`, `pandas.drop_duplicates` |
| `n8n-nodes-base.aggregate` | Grouping and aggregation | `itertools.groupby` or `pandas.groupby` |
| `n8n-nodes-base.dateTime` | Date manipulation | `datetime`, `dateutil`, `arrow`, `pendulum` |
| `n8n-nodes-base.crypto` | Hash, cryptography | `hashlib`, `hmac`, `cryptography` |
| `n8n-nodes-base.compression` | Zip, gzip | `zipfile`, `gzip`, `tarfile` |
| `n8n-nodes-base.xml` | Parse/build XML | `xml.etree.ElementTree`, `lxml` |
| `n8n-nodes-base.html` | Parse HTML | `beautifulsoup4`, `lxml` |
| `n8n-nodes-base.markdown` | Markdown conversion | `markdown`, `mistune` |
| `n8n-nodes-base.spreadsheetFile` | Read/write XLSX/CSV | `openpyxl`, `pandas`, `csv` |

---

## 5. Code execution

| Type in JSON | Meaning | Python |
|---|---|---|
| `n8n-nodes-base.function` | Arbitrary JS code (legacy) | Pure Python function. Read `parameters.functionCode` and describe the logic |
| `n8n-nodes-base.functionItem` | JS applied per item | List comprehension or `map()` |
| `n8n-nodes-base.code` | JS or Python code (new version) | Pure Python function. Check `parameters.language` |

When translating Function/Code nodes into `design.md`: describe the logic in pseudocode, do not copy the literal JS. The Python equivalent should be idiomatic.

---

## 6. Databases

| Type in JSON | Meaning | Python |
|---|---|---|
| `n8n-nodes-base.postgres` | Postgres | `psycopg[binary]` (v3) or `asyncpg` |
| `n8n-nodes-base.mysql` | MySQL/MariaDB | `pymysql` or `mysql-connector-python`, `aiomysql` |
| `n8n-nodes-base.mongoDb` | MongoDB | `pymongo` or `motor` (async) |
| `n8n-nodes-base.redis` | Redis | `redis-py` (supports sync and async) |
| `n8n-nodes-base.supabase` | Supabase | `supabase-py` |
| `n8n-nodes-base.microsoftSql` | SQL Server | `pyodbc` or `pymssql` |
| `n8n-nodes-base.snowflake` | Snowflake | `snowflake-connector-python` |
| `n8n-nodes-base.questDb` | QuestDB | `psycopg` (compatible with PG wire) |

Suggested ORMs when the workflow has many relational operations: `SQLAlchemy 2.x` or `SQLModel`.

---

## 7. Communication

| Type in JSON | Meaning | Python |
|---|---|---|
| `n8n-nodes-base.emailSend` | Send email via SMTP | `smtplib` + `email`, `yagmail`, `aiosmtplib` |
| `n8n-nodes-base.gmail` | Gmail (API) | `google-api-python-client` |
| `n8n-nodes-base.slack` | Slack (messages, channels) | `slack-sdk` |
| `n8n-nodes-base.discord` | Discord | `discord.py` or direct webhook via `httpx` |
| `n8n-nodes-base.telegram` | Telegram Bot | `python-telegram-bot` or `aiogram` |
| `n8n-nodes-base.whatsApp` | WhatsApp Business API | direct `httpx` (there is no mature official Python SDK) |
| `n8n-nodes-base.twilio` | Twilio SMS/voice | `twilio` SDK |
| `n8n-nodes-base.sendGrid` | SendGrid | `sendgrid` SDK |
| `n8n-nodes-base.mailchimp` | Mailchimp | `mailchimp-marketing` |

---

## 8. AI and LLM

| Type in JSON | Meaning | Python |
|---|---|---|
| `n8n-nodes-base.openAi` or `@n8n/n8n-nodes-langchain.openAi` | OpenAI (chat, embeddings, images) | `openai` SDK |
| `@n8n/n8n-nodes-langchain.lmChatAnthropic` | Anthropic Claude | `anthropic` SDK |
| `@n8n/n8n-nodes-langchain.lmChatGoogleGemini` | Google Gemini | `google-generativeai` |
| `@n8n/n8n-nodes-langchain.embeddingsOpenAi` | Embeddings | `openai` SDK |
| `@n8n/n8n-nodes-langchain.vectorStorePinecone` | Pinecone | `pinecone-client` |
| `@n8n/n8n-nodes-langchain.vectorStoreSupabase` | Supabase pgvector | `supabase-py` + `pgvector` |
| `@n8n/n8n-nodes-langchain.vectorStoreQdrant` | Qdrant | `qdrant-client` |
| `@n8n/n8n-nodes-langchain.agent` | LangChain Agent | `langchain` or `langgraph` |
| `@n8n/n8n-nodes-langchain.chainLlm` | Basic chain | Direct call to the LLM SDK |
| `n8n-nodes-base.huggingFace` | Hugging Face | `transformers`, `huggingface_hub` |

For new projects, consider whether LangChain/LangGraph is necessary or whether a direct call to the LLM SDK is simpler.

---

## 9. Files and cloud storage

| Type in JSON | Meaning | Python |
|---|---|---|
| `n8n-nodes-base.readBinaryFile` | Read local file | `open(path, 'rb')` |
| `n8n-nodes-base.writeBinaryFile` | Write local file | `open(path, 'wb')` |
| `n8n-nodes-base.s3` | AWS S3 | `boto3` |
| `n8n-nodes-base.googleDrive` | Google Drive | `google-api-python-client` + `google-auth` |
| `n8n-nodes-base.googleCloudStorage` | GCS | `google-cloud-storage` |
| `n8n-nodes-base.dropbox` | Dropbox | `dropbox` SDK |
| `n8n-nodes-base.ftp` | FTP/SFTP | `ftplib` or `paramiko` |
| `n8n-nodes-base.ssh` | SSH | `paramiko` or `fabric` |
| `n8n-nodes-base.box` | Box | `boxsdk` |

---

## 10. Productivity and SaaS

| Type in JSON | Meaning | Python |
|---|---|---|
| `n8n-nodes-base.googleSheets` | Google Sheets | `gspread` or `google-api-python-client` |
| `n8n-nodes-base.googleCalendar` | Google Calendar | `google-api-python-client` |
| `n8n-nodes-base.googleDocs` | Google Docs | `google-api-python-client` |
| `n8n-nodes-base.airtable` | Airtable | `pyairtable` |
| `n8n-nodes-base.notion` | Notion | `notion-client` |
| `n8n-nodes-base.trello` | Trello | `py-trello` or direct `httpx` |
| `n8n-nodes-base.asana` | Asana | `asana` SDK |
| `n8n-nodes-base.jira` | Jira | `jira` SDK or `atlassian-python-api` |
| `n8n-nodes-base.gitHub` | GitHub | `PyGithub` or direct `httpx` |
| `n8n-nodes-base.gitLab` | GitLab | `python-gitlab` |
| `n8n-nodes-base.hubspot` | HubSpot | `hubspot-api-client` |
| `n8n-nodes-base.salesforce` | Salesforce | `simple-salesforce` |
| `n8n-nodes-base.shopify` | Shopify | `ShopifyAPI` |
| `n8n-nodes-base.stripe` | Stripe | `stripe` SDK |

---

## 11. Credentials and authentication

Mapping of N8N credential types to Python patterns:

| N8N credential type | Meaning | Python pattern |
|---|---|---|
| `httpHeaderAuth` | Custom header (usually API key) | Environment variable, header in every call |
| `httpBasicAuth` | Basic Auth | Tuple `(user, pass)` in `httpx`, coming from env vars |
| `httpQueryAuth` | API key in querystring | Fixed param in every call |
| `oAuth2Api` | OAuth2 (with refresh) | `authlib` or `requests-oauthlib`, persist refresh token |
| `oAuth1Api` | OAuth1 | `requests-oauthlib` |
| `<service>Api` (e.g. `slackApi`, `googleApi`) | Service-specific credential | Follow the official SDK of the service |

General recommendation: never hardcode. Use `pydantic-settings` or `python-dotenv` to read from `.env`. For production, use a secret manager (AWS Secrets Manager, HashiCorp Vault, etc.).

---

## 12. Suggested architectural patterns

Based on the main trigger:

| Trigger | Recommended Python architecture |
|---|---|
| Webhook | FastAPI (asynchronous, validation with Pydantic) |
| Schedule/Cron | Standalone script with APScheduler or systemd timer |
| Manual | CLI with Typer or argparse |
| Email IMAP | Daemon worker with polling loop |
| SaaS trigger (polling) | Async worker with asyncio |
| Multi-trigger | FastAPI with endpoints + embedded APScheduler |

Additional considerations:

- Workflow with many parallel HTTP calls: use `asyncio` + `httpx.AsyncClient`
- Workflow with long batches: use Celery, RQ, or Dramatiq
- Workflow with state between runs: persist in Postgres/Redis (not in memory)
- Critical workflow: add observability from the start (`structlog`, OpenTelemetry)

---

## 13. Error handling and retries

Common N8N behaviors and Python equivalent:

| N8N behavior | Python |
|---|---|
| `continueOnFail` on the node | `try/except` that logs and continues |
| `retryOnFail` with attempts | `tenacity` (decorator `@retry`) |
| `errorTrigger` (error workflow) | Global exception handler, alert via Slack/email |
| Timeout in HTTP request | Explicit `httpx.Timeout(...)` |
| Wait between retries | Exponential backoff via `tenacity` |

---

## 14. Observability

When the workflow has many steps or is critical, suggest in `design.md`:

- Structured logs (`structlog` or `loguru`)
- Distributed tracing (`opentelemetry-api` + exporter)
- Metrics (`prometheus-client`)
- Health check endpoint (FastAPI)
- Sentry for error capture

---

## Final notes

- This catalog covers the most common nodes. If an unknown type appears, record it as 🟡 INFERRED in the spec and ask the user for clarification.
- Node versions (`typeVersion`) can change internal parameters. Check whether the `parameters` structure matches the version.
- Community nodes (starting with `n8n-nodes-<community>`) may not have a direct Python equivalent. Handle case by case.
