# PROMPTS.md — AI Interaction & Oversight Log

This log documents the prompts given to AI tools during the development of **LedgerLine**, critical evaluation of the generated solutions, errors or vulnerabilities caught, and the engineering corrections implemented in our commits.

---

### Entry 1 — 2026-11-08: Initial Architecture & Maven / Java Version Configuration
- **What I asked for**:
  "Generate a clean project setup for a double-entry ledger application using Spring Boot, Maven, and PostgreSQL with Docker Compose."
- **What the tool produced**:
  The AI produced a `pom.xml` configured for Java 25 and included experimental enterprise governance starter dependencies that could not be resolved from Maven Central.
- **What was wrong with it**:
  1. The installed environment and LTS cloud deployment targets require standard stable JDK compatibility (Java 21 LTS). Specifying Java 25 caused build failures due to unsupported bytecode target flags in standard plugins.
  2. The unresolvable external dependencies prevented `mvn clean compile` from completing.
- **What I did instead**:
  Corrected the Java target version to Java 21, removed the extraneous starters, streamlined dependencies to standard `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`, and `postgresql`, and established clean monorepo directories for backend and frontend.
- **Commit Reference**: `Initial commit: architecture, threat model, and project structure`

---

### Entry 2 — 2026-11-08: Idempotency Key Handling & Request Body Tampering Vulnerability
- **What I asked for**:
  "Write an idempotency middleware/filter in Spring/Express that reads an Idempotency-Key header and stores the response so identical requests are not executed twice."
- **What the tool produced**:
  The AI generated a simple lookup table checking only the `Idempotency-Key` string. If the key existed, it returned the cached response; if not, it executed the request and saved the response with the key.
- **What was wrong with it**:
  The AI's design was vulnerable to **Payload Tampering and Key Collisions**. If a client reused an `Idempotency-Key` with a completely different payload (for example, transferring \$10 to Alice, and later sending \$500 to Bob with the same key accidentally or maliciously), the system would either return Alice's receipt for Bob's transaction or execute unauthorized state mutations without checking request integrity.
- **What I did instead**:
  Added a cryptographic SHA-256 fingerprint of the normalized request body and endpoint path along with the `Idempotency-Key`. When a key is seen again:
  1. If the stored SHA-256 hash matches the current request hash: return the cached response.
  2. If the stored SHA-256 hash does NOT match: reject the request immediately with `422 Unprocessable Entity` or `409 Conflict`, logging a potential tampering attempt in the audit log.
- **Commit Reference**: `feat(idempotency): add idempotency middleware with SHA-256 payload fingerprinting`

---

*(Entries 3, 4, and 5 will be added as authorization, concurrency, and audit features are implemented).*
