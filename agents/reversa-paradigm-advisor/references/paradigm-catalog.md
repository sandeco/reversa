> Local copy of the consultative catalog. The canonical source is at `templates/migration/catalogs/paradigm_catalog.md`.
> This copy is installed alongside the agent so it has access to the catalog within the user's project, without depending on the npm package location.

# Paradigm Catalog (local copy)

## Paradigm Catalog

### Procedural
- **Characteristics**: top-level functions, linear flow in controllers, absence of classes or ornamental use, data as dicts/structs, open side effects.
- **Legacy examples**: classic PHP scripts, COBOL batch, pre-OO Perl systems, shell scripts.
- **Signals in `_reversa_sdd/`**: domain described as "functions", linear flows in `process_flows`, absence of explicit aggregates.

### Classic OO
- **Characteristics**: class hierarchy, strong inheritance, Active Record pattern, logic coupled to models.
- **Legacy examples**: monolithic Rails, traditional Django, pre-DI Java EE, .NET WebForms / classic.
- **Signals in `_reversa_sdd/`**: classes with broad responsibilities, inheritance in domain model, anemic controllers calling model methods.

### OO with DI
- **Characteristics**: dependency injection containers, explicit interfaces, Repository / Service pattern, clear separation between layers.
- **Legacy examples**: modern Spring, .NET 6+, NestJS, modern Symfony.
- **Signals in `_reversa_sdd/`**: explicit aggregates, repository interfaces, absence of Active Record.

### Functional
- **Characteristics**: dominant immutability, pure functions, composition, absence of implicit side effects, rich typing.
- **Legacy examples**: Haskell, Elm, F#, functional Scala, Clojure.
- **Signals in `_reversa_sdd/`**: algebraic types, absence of classes, flow expressed as composition.

### Event-driven (asynchronous)
- **Characteristics**: queues / topics, decoupled handlers, absence of linear flow, eventual consistency, explicit idempotency.
- **Legacy examples**: modern queue-oriented Node backends, SQS / Kafka-heavy systems, asynchronous microservices.
- **Signals in `_reversa_sdd/`**: events in domain model, queue-based integrations, long-running processes with retry.

### Actor model
- **Characteristics**: isolated actors with mailboxes, supervision, state isolation.
- **Legacy examples**: Erlang / Elixir / OTP, Akka.
- **Signals in `_reversa_sdd/`**: supervised processes, messages between actors.

### Dataflow
- **Characteristics**: declarative pipelines, streaming transformations, absence of imperative loops in the domain.
- **Legacy examples**: classic ETLs, Spark, Flink.
- **Signals in `_reversa_sdd/`**: DAG description, transformations in stages.

## Stack → Natural Paradigm Mapping

| Target Stack | Natural Paradigm | Viable Alternatives | Notes |
|---|---|---|---|
| Node.js 20 (Fastify, Express, NestJS) | async event-driven | OO with DI (NestJS), light functional | async-first runtime; heavy CPU blocking goes to worker threads |
| Go (net/http, Echo, Fiber) | CSP / goroutines (light event-driven) | structured procedural | concurrency via channels; OO simulated via interfaces |
| Rust (axum, Actix, tokio) | ownership / functional async | event-driven | immutability by default, safety via types |
| Elixir / Phoenix | actor model (BEAM) | functional | supervision via OTP |
| Modern Python (FastAPI, Django 5) | OO with DI or rich procedural | event-driven (Celery, asyncio) | choice depends on the framework |
| Kotlin (Spring Boot, Ktor) | OO with DI | event-driven (Reactor) | coroutines enable ergonomic async |
| .NET 8 (ASP.NET Core, Minimal API) | OO with DI | event-driven (Channels, MediatR) | OO tradition + first-class async |
| Modern Java (Spring Boot 3, Quarkus) | OO with DI | event-driven (Project Reactor) | functional libraries possible but not dominant |
| Modern Ruby (Rails 7, Hanami) | Classic OO (Rails) or OO with DI (Hanami) | light functional (dry-rb) | Rails dictates Active Record; Hanami is DI-heavy |
| TypeScript serverless (AWS Lambda, Cloudflare Workers) | event-driven | functional | event-driven invocation; cold start influences design |

## Typical Gap Table by Pair

| From → To | Main Gap | Concrete Implications |
|---|---|---|
| procedural → event-driven | synchronous → asynchronous | response is no longer immediate; error handling becomes retry/DLQ; idempotency required; event ordering starts to matter |
| procedural → OO with DI | data as dict → aggregates | invariants move inside aggregates; logic moves out of controllers; dependencies via interfaces |
| procedural → functional | open side effects → pure + isolated | mutability becomes the exception; composition replaces sequencing; algebraic types for states |
| Classic OO → event-driven | synchronous flow → choreography | actions are no longer atomic; distributed transactions become sagas; strong consistency → eventual |
| Classic OO → OO with DI | inheritance → composition via interfaces | Active Record disappears; persistence becomes repository; tests gain natural mocks |
| Classic OO → functional | mutable encapsulation → immutability | methods with effects become pure functions + explicit updates; state expressed as a sequence of transformations |
| OO with DI → event-driven | synchronous command → event | return is no longer immediate; orchestration becomes choreography; ordering by key |
| OO with DI → functional | mocks → testable composition | DI shifts from interface-based to function argument-based |
| functional → event-driven | synchronous composition → messaging | latency increases; failure becomes a DLQ message; distributed state |
| event-driven → synchronous procedural | unnatural; only makes sense for small systems | collapse handlers into direct calls; lose decoupling; strong consistency returns |
| dataflow → event-driven | declarative DAG → mutable choreography | control becomes less predictable; order must be guaranteed by key |
| actor model → OO with DI | messages between actors → synchronous calls | loss of fault isolation; supervision must become try/catch or orchestrated retry |
