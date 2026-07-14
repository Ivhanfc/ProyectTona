
1. Project Overview

The primary objective of this project is to develop a food delivery simulator inspired by platforms like Uber Eats and Rappi. The system allows users to browse menus and view nearby delivery drivers in real time. Concurrently, drivers have access to an order queue, enabling them to select and claim pending orders based on proximity or preference.
2. Technology Stack

To ensure high performance and scalability, the platform is built using the following technologies:

    Backend: FastAPI (Python), chosen for its asynchronous capabilities, speed, and efficient API development.

    Frontend: React Native with Expo, providing a cross-platform, responsive, and interactive mobile user interface.

    Geolocational Routing: OSRM (Open Source Routing Machine). This engine is utilized to calculate optimal routes, measure precise distance between drivers, restaurant, and users, and compute Estimated Times of Arrival.

        🔗 Official Resource: project-osrm.org

3. Data Structures and Algorithms Applied

As a core requirement for the Data Structures course, the System implements the following foundational concepts:

    Order Management (Queues): Incoming customer orders are handled using a queue structure. Drivers Interact with this queue to view, select, and process pending deliveries.

    Ranking System (Bubble Sort): The Bubble Sort algorithm is implemented to dynamically sort and generate a leaderboard, showcasing the top-rated restaurants and drivers based on star rating.

    History Orders (Stack): Completed user orders are managed using a Stack. This ensures that when the user opens the application, the user can see the history of orders.

4. Network and Communication Protocols

Data transmission within the simulator utilizes specific networking protocols to balance speed:

    HTTP/2: Used for efficient, multiplexed communication between the frontend client and the FastAPI backend, using API REST.

    WebSockets: Used for the real-time communication in the driver ubication and server to response.

🏛️ Architectural Pattern

We implement the MVC (Model-View-Controller) architecture to ensure clean code separation, enhance maintainability, and accelerate development speed.
```mermaid
graph TD
    %% Base Setup
    root[PROYECTTONA/] 
    config[config.py]
    db_file[(database.db)]
    main[main.py]

    %% Main connections
    root --> app[app/]
    root --> config
    root --> db_file
    root --> main

    %% Inside App (MVC Structure)
    app --> controllers[controllers/]
    app --> models[models/]
    app --> routes[routes/]
    app --> db_py[database.py]

    %% Controllers
    controllers --> dc[driver_Controller.py]
    controllers --> uc[user_Controller.py]

    %% Models
    models --> dm[driver_model.py]
    models --> um[user_model.py]

    %% Routes
    routes --> dr[driver_routes.py]
    routes --> ur[user_routes.py]

    %% Styling to look professional
    style root fill:#1F2937,stroke:#374151,stroke-width:2px,color:#fff
    style app fill:#0F766E,stroke:#115E59,stroke-width:2px,color:#fff
    style controllers fill:#B45309,stroke:#92400E,stroke-width:1px,color:#fff
    style models fill:#0369A1,stroke:#075985,stroke-width:1px,color:#fff
    style routes fill:#4D7C0F,stroke:#3F6212,stroke-width:1px,color:#fff
    style db_file fill:#4B5563,stroke:#374151,color:#fff
    ```