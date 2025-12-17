#!/usr/bin/env python3
""" Handle api interactions involving sign in"""
from models.user import User
from models import storage
from api.v1.views import app_views
from flask import abort, jsonify, make_response, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash


def users_search(data=""):
    """
    Retrieves a user object with a certain username
    """
    if not data or not len(data): 
        return None

    all_users = storage.all(User).values()
    for user in all_users:
        if user.email == data:
            return user
    return None


@app_views.route('/login', methods=["POST"], strict_slashes=False)
def login_user():
    """
    Log in an existing user and return a JWT access token.
    Expects JSON data with 'email' and 'password'.
    """
    data = request.get_json()
    email = data.get("email", None)
    password = data.get("password", None)

    print(f"[LOGIN DEBUG] Attempting login for email: {email}")
    
    user = users_search(email)
    
    if not user:
        print(f"[LOGIN DEBUG] User not found for email: {email}")
        return jsonify({"message": "Invalid email or password"}), 401
    
    print(f"[LOGIN DEBUG] User found: {user.id}, checking password...")
    
    if not check_password_hash(user.password, password):
        print(f"[LOGIN DEBUG] Password check failed for user: {email}")
        return jsonify({"message": "Invalid email or password"}), 401
    
    print(f"[LOGIN DEBUG] Login successful for user: {email}")
    
    # Create the access token for the logged-in user
    access_token = create_access_token(identity=user.id)
    return jsonify(access_token=access_token), 200

@app_views.route("/dashboard", methods=["GET"])
@jwt_required()
def user_dashboard():
    """
    A protected route that requires a valid JWT access Token.
    Returns a personalized welcome message for the user
    """
    current_user_id = get_jwt_identity()
    user = storage.get(User, current_user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    return jsonify({
        "all": user.to_dict()
    }), 200
