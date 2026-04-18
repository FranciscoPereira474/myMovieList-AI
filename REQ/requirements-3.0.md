### Requirements

#### 1. **General Scope**
- The system must be a movie recommendation system that allows users to register, explore a catalog, rate items, and receive personalized suggestions.
- Target users: common users (viewers) and, optionally, administrators to manage the catalog.

#### 2. **Functional Requirements**
- The system must support registration, login, and basic user profile management.
- The system must be able to manage their profile (view and edit personal information).
- The system must allow navigation through a movie catalog with details (title, genre, description, average rating).
- The system must include search functionality by title.
- The system must allow users to rate items with 0.5-5 stars.
- The system must generate recommendations based on rating history or popularity.
- The system must provide filtering options through the movie catalog (e.g., by genre, rating, director, year).
- The system must provide ordering options through the movie catalog (e.g., by rating, release date, alphabetical, popularity).
- The system must store and manage user search history.
- The system must provide a backend with API for interaction between frontend and database.
- The system must use a database to store users, movies ratings and recommendations.
- The system must be accessible via web.
- The system must have a basic configuration for automation of builds, tests, and deployment.
- The system must be deployed in a cloud.


#### 4. **Non-Functional Requirements**
- **Performance**: The system must have fast response time.
- **Security**: The system must be secure, with authentication and sensitive data encryption.
- **Scalability**: The system must be scalable, supporting increasing numbers of users without performance degradation.
- **Usability**: The system must be usable, with a simple and intuitive interface, accessible on desktop and mobile.
- **Portability**: The system must be deployable in a cloud environment.
- **Trade-offs**: The system must balance recommendation accuracy with response time.
- **Compliance**: The system must have all source code versioned in Git with separate branches ensuring traceability and quality control.


#### 5. **User Stories (per actor)**
-**Actor: User**
- As a user, I want to register and log in, so that I can access personalized recommendations.
- As a user, I want to update my profile, so that the system can reflect my current preferences.
- As a user, I want to browse the catalog movies, so that I can explore available content.
- As a user, I want to search by title so that I can quickly find specific content.
- As a user, I want to rate movies, so that my ratings influence my future recommendations.
- As a user, I want to see a personalized recommendation list, so that I discover new items aligned with my interests.
- As a user, I want to filter and sort results, so that I can organize my search according to my preferences.


-**Actor: Anonymous visitor**
- As an anonymous visitor, I want to see the homepage with lists of popular movies, general recommendations (based on popularity), and a search box, so that I can explore content effortlessly.
- As an anonymous visitor, I want to search for movies by title, so that I can quickly find items of interest.
- As an anonymous visitor, I want to view a specific movie page with metadata (title, release date, runtime, genres, poster via TMDB, synopsis, average rating, and list of reviews), so that I can decide if it's worth watching.
- As an anonymous visitor, I want to filter and sort search results (by genre, year, runtime, popularity, or average rating), so that I can refine my discovery in a personalized way.
- As an anonymous visitor, I want to be able to register and log in, so that I can access additional features as a registered user.


#### 6. **Constraints**.
- The project must be manageable within the semester, starting with basic functionalities and expanding gradually.
