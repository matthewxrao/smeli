# Smeli

Smeli is a web application that allows users to review and rate public restrooms. Users can search for nearby restrooms, view reviews, and add their own reviews. Placed 3rd Overall in Hack112 🥉. 

<img width="800" alt="image" src="https://github.com/user-attachments/assets/508430cf-6698-4e72-a059-e5eb5d4e0fe2">

<img width="800" alt="image" src="https://github.com/user-attachments/assets/b5f852c5-35b7-4a1c-9737-85b5850a3f10">

<img width="800" alt="image" src="https://github.com/user-attachments/assets/e6670395-5db8-4b16-9e83-11a7faff76e8">

<img width="800" alt="image" src="https://github.com/user-attachments/assets/47315c52-9fbc-48ba-9bf9-d89230ea4dc4">

<img width="800" alt="image" src="https://github.com/user-attachments/assets/ee626411-f377-4a47-8e5a-a50787f98a82">



## Technologies Used

### Backend

- **Flask**: A micro web framework for Python.
- **Flask-CORS**: A Flask extension for handling Cross-Origin Resource Sharing (CORS).
- **Flask-Migrate**: Handles SQLAlchemy database migrations for Flask applications using Alembic.
- **Flask-SQLAlchemy**: Adds SQLAlchemy support to Flask applications.
- **Werkzeug**: A comprehensive WSGI web application library.
- **PyJWT**: A Python library for generating and verifying JSON Web Tokens.

### Frontend

- **React**: A JavaScript library for building user interfaces.
- **Vite**: A build tool that provides a faster and leaner development experience for modern web projects.
- **React Icons**: A collection of popular icons for React.
- **React Leaflet**: A React wrapper for Leaflet, a JavaScript library for interactive maps.

## Project Structure

```
backend/
    config.py
    main.py
    models.py
    requirements.txt
frontend/
    .gitignore
    eslint.config.js
    index.html
    package.json
    README.md
    src/
        App.jsx
        components/
            LocationAutocomplete.jsx
            LoginForm.jsx
            MapReviewList.jsx
            NavigationBar.jsx
            ReviewForm.jsx
            SetStarRating.jsx
        index.css
        main.jsx
        styles/
            Auth.css
            Base.css
            LocationAutoComplete.css
            Modal.css
            NavBar.css
            Reviews.css
    vite.config.js
```

## Running the Project

### Backend

1. **Navigate to the backend directory:**

   ```sh
   cd backend
   ```

2. **Create a virtual environment and activate it:**

   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. **Install the required dependencies:**

   ```sh
   pip install -r requirements.txt
   ```

4. **Run the Flask application:**

   click run in VSCODE or source the python file in terminal

### Frontend

1. **Navigate to the frontend directory:**

   ```sh
   cd frontend
   ```

2. **Install the required dependencies:**

   ```sh
   npm install
   ```

3. **Run the development server:**
   ```sh
   npm run dev
   ```

The frontend application will be available at `http://localhost:3000` and the backend API will be available at `http://127.0.0.1:5000`.

## Features

- **User Authentication**: Users can register and log in.
- **Location Search**: Users can search for locations using the OpenStreetMap API.
- **Review Management**: Users can create, update, and delete reviews.
- **Interactive Map**: Users can view reviews on an interactive map using Leaflet.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
