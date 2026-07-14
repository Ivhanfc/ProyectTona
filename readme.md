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