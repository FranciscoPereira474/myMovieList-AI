# Movie Recommendation System – Detailed Requirements

## 1. Project Goal
Design and build a web application where users can register, browse and search a movie catalog, rate movies, and receive personalized recommendations.  
The system will include a REST API backend, a persistent database, a recommendation engine, a web frontend, automated CI/CD, and containerized/cloud deployment.

---

## 2. Stakeholders & Objectives
- **End Users** – discover and rate movies, receive recommendations.
- **Developers (team)** – build and maintain a modular, testable codebase.
- **Instructors/Graders** – evaluate correctness, reproducibility, and CI/CD.

---

## 3. Functional Requirements (FR)

| ID     | Requirement                                                                                           | Acceptance Criteria |
|--------|-------------------------------------------------------------------------------------------------------|---------------------|
| **FR-001** | **User registration & authentication** – users can sign up with email & password, log in with JWT. | `POST /auth/register` and `POST /auth/login` work; passwords hashed. |
| **FR-002** | **Profile management** – edit display name, favorite genres, optional profile picture.             | `GET/PUT /users/me` persists changes. |
| **FR-003** | **Catalog browsing** – paginated movie list with title, year, genre, plot, poster, average rating. | Response latency < 500 ms (95th percentile). |
| **FR-004** | **Search** – search by title, director, cast, or genre with fuzzy matching.                        | `GET /movies?query=...` returns relevant matches. |
| **FR-005** | **Movie detail page** – full metadata, average rating, user’s own rating, and similar movies.       | `GET /movies/{id}` returns all fields plus `recommended_for_user`. |
| **FR-006** | **Ratings** – users can rate 1–5 stars, edit or delete rating.                                      | `POST/PUT/DELETE /movies/{id}/rating` update aggregate rating. |
| **FR-007** | **Recommendation API** – personalized top-K movie list.                                            | `GET /users/{id}/recommendations?limit=10` returns ranked list. |
| **FR-008** | **Onboarding preferences** – optional favorite genres and liked movies at sign-up for cold start.   | Preferences saved and influence initial recommendations. |
| **FR-009** | **Admin import** – bulk import of movie metadata and trigger model training.                        | Admin endpoint validates and stores records. |
| **FR-010** | **Audit & logs** – track user actions (login, rate, search) for analytics and training.             | Events stored with timestamp and anonymized user id. |

---

## 4. Non-Functional Requirements (NFR)

| ID       | Requirement                                                                                                   |
|----------|---------------------------------------------------------------------------------------------------------------|
| **NFR-101** | **Performance** – recommendation endpoint 95th %ile latency ≤ 300 ms; movie listing/search ≤ 500 ms.        |
| **NFR-102** | **Scalability** – stateless API containers, horizontally scalable DB and caching (e.g., Redis).             |
| **NFR-103** | **Availability** – 99 % availability target for demo environment.                                           |
| **NFR-104** | **Security** – TLS, password hashing (Argon2/bcrypt), JWT auth, input validation, rate limiting.            |
| **NFR-105** | **Privacy** – support user data export/deletion and anonymized logs.                                        |
| **NFR-106** | **Maintainability** – linting, modular architecture, ≥ 60 % unit-test coverage.                              |
| **NFR-107** | **Observability** – structured logs, metrics (latency, error rate), and basic dashboard (Grafana/Sentry).    |
| **NFR-108** | **Reproducibility** – model pipeline stores random seeds, training data snapshot, and metadata.              |

---

## 5. Data Model (PostgreSQL Example)

- **users**: `id`, `email`, `password_hash`, `display_name`, `favorite_genres` (json[]), `created_at`, `updated_at`
- **movies**: `id`, `title`, `year`, `description`, `runtime_min`, `poster_url`, `director`, `cast` (json[]), `genres` (json[]), `created_at`
- **ratings**: `id`, `user_id` (fk), `movie_id` (fk), `rating` (1-5), `comment`, `created_at`, `updated_at`
- **movie_stats**: `movie_id`, `avg_rating`, `rating_count`
- **recommendations**: `user_id`, `rec_list` (json array of movie_id + score + algorithm), `generated_at`, `model_version`
- **model_metadata**: `model_id`, `algorithm`, `params` (json), `metrics` (json), `trained_at`, `artifact_path`
- **audit_events**: `id`, `user_id` (nullable), `event_type`, `payload` (json), `timestamp`

---

## 6. API Endpoints (REST Examples)

- **Auth**
  - `POST /auth/register`
  - `POST /auth/login`
- **Movies**
  - `GET /movies?query=godfather&genre=crime&limit=20`
  - `GET /movies/{id}`
  - `POST /movies` (admin import)
- **Ratings**
  - `POST /movies/{id}/rating`
  - `GET /users/{id}/ratings`
- **Recommendations**
  - `GET /users/{id}/recommendations?limit=10`

Standard HTTP status codes and JSON error payloads must be used.

---

## 7. Recommendation Engine

- **Baseline**: global popularity and content similarity (TF-IDF on genres/plot).
- **Advanced**: item-based collaborative filtering, matrix factorization (ALS/SVD), or hybrid content + CF.
- **Serving**: nightly batch training, precompute per-user top-K, store in `recommendations`, cache in Redis.
- **Evaluation**: RMSE/MAE for rating prediction, Precision@K/Recall@K/NDCG@K for ranking.

---

## 8. CI/CD & Deployment

- **CI Pipeline**: lint → unit tests → build backend & frontend images → integration tests → push image to registry.
- **CD Pipeline**: deploy to staging automatically; manual approval to production.
- **Infrastructure**: Docker for services, Kubernetes or Cloud Run/Heroku for hosting, managed Postgres, Redis cache.
- **Secrets**: environment variables or secrets manager.

---

## 9. Testing & Monitoring

- Unit, integration, and end-to-end (Cypress) tests.
- Structured JSON logs, metrics (requests/sec, latency, errors).
- Alerts for high error rate or latency spikes.

---

## 10. Security & Privacy

- HTTPS/TLS everywhere.
- Passwords hashed with Argon2 or bcrypt.
- Input validation & prepared statements to prevent injection.
- Rate limiting and CORS policy enforced.
- Ability for users to export and delete their data.

---

## 11. Roadmap (Semester-Friendly)

1. **MVP (Weeks 1–6)**: Backend + database, user auth, movie catalog, ratings, popularity recommendations, basic React frontend, Docker, CI pipeline, cloud deploy.
2. **v1 (Weeks 7–10)**: Collaborative filtering & content-based recommender, onboarding preferences, caching & analytics.
3. **v2 (Weeks 11–14)**: Hybrid/advanced models, FAISS for ANN search, monitoring dashboards, final polish & documentation.

---

## 12. Deliverables

- Source code repository with CI/CD pipelines.
- Dockerfiles & deployment manifests.
- OpenAPI/Swagger API specification.
- Model documentation & evaluation report.
- Live demo URL or docker-compose for local run.

---

## 13. Risks & Mitigations

- **Data scarcity** – use MovieLens or other open datasets, synthetic users for testing.
- **Latency in recommendations** – precompute and cache results.
- **Time constraints** – focus on solid MVP before advanced ML.
- **Security gaps** – use proven libraries and automated security scanning.

---

## 14. Acceptance Criteria Checklist

- [ ] User registration/login with JWT
- [ ] List/search movies and view movie details
- [ ] Rate movies and see updated aggregates
- [ ] Baseline recommendations available
- [ ] ML recommendation pipeline integrated and evaluated
- [ ] API + frontend deployed in a containerized environment
- [ ] CI pipeline running tests and building images
- [ ] Documentation: README, API spec, model report
- [ ] Logging & monitoring operational
