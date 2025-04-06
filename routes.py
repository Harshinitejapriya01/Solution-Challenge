from flask import render_template, request, redirect, url_for, flash, session, jsonify
from app import app, db
from models import User, Progress, Achievement, get_modules, get_module_by_id
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
import logging

@app.route('/')
def index():
    modules = get_modules()
    return render_template('index.html', modules=modules)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/module/<module_id>')
def module(module_id):
    module_data = get_module_by_id(module_id)
    if module_data:
        # Check if user is logged in to track progress
        user_id = session.get('user_id')
        progress = 0
        
        if user_id:
            progress_entry = Progress.query.filter_by(user_id=user_id, module_id=module_id).first()
            if progress_entry:
                progress = progress_entry.completion_percentage
        
        return render_template('module.html', module=module_data, progress=progress)
    
    flash('Module not found', 'danger')
    return redirect(url_for('index'))

@app.route('/profile')
def profile():
    if 'user_id' not in session:
        flash('Please log in to view your profile', 'warning')
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    if not user:
        flash('User not found', 'danger')
        return redirect(url_for('index'))
    
    progress_entries = Progress.query.filter_by(user_id=user.id).all()
    achievements = Achievement.query.filter_by(user_id=user.id).all()
    
    modules = get_modules()
    
    # Calculate overall progress
    module_progress = []
    total_progress = 0
    
    for module in modules:
        progress_entry = next((p for p in progress_entries if p.module_id == module['id']), None)
        progress_value = progress_entry.completion_percentage if progress_entry else 0
        module_progress.append({
            'id': module['id'],
            'title': module['title'],
            'progress': progress_value
        })
        total_progress += progress_value
    
    overall_progress = total_progress / len(modules) if modules else 0
    
    return render_template('profile.html', 
                          user=user, 
                          module_progress=module_progress, 
                          overall_progress=overall_progress,
                          achievements=achievements)

@app.route('/update_progress', methods=['POST'])
def update_progress():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not logged in'}), 401
    
    data = request.get_json()
    module_id = data.get('module_id')
    percentage = data.get('percentage')
    
    if not module_id or percentage is None:
        return jsonify({'success': False, 'message': 'Missing data'}), 400
    
    progress_entry = Progress.query.filter_by(user_id=session['user_id'], module_id=module_id).first()
    
    if progress_entry:
        progress_entry.update_progress(percentage)
    else:
        progress_entry = Progress(
            user_id=session['user_id'],
            module_id=module_id,
            completion_percentage=percentage
        )
        db.session.add(progress_entry)
    
    # Check for achievements
    if percentage == 100:
        module = get_module_by_id(module_id)
        if module:
            achievement = Achievement(
                user_id=session['user_id'],
                achievement_name=f"Completed {module['title']}",
                achievement_description=f"Successfully completed all activities in the {module['title']} module!"
            )
            db.session.add(achievement)
    
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Progress updated'})

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            session['username'] = user.username
            flash('Login successful!', 'success')
            return redirect(url_for('profile'))
        else:
            flash('Login failed. Please check your username and password.', 'danger')
    
    return render_template('index.html', show_login=True)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('Username already exists', 'danger')
            return redirect(url_for('index', show_register=True))
        
        existing_email = User.query.filter_by(email=email).first()
        if existing_email:
            flash('Email already registered', 'danger')
            return redirect(url_for('index', show_register=True))
        
        new_user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        session['user_id'] = new_user.id
        session['username'] = new_user.username
        
        # Add welcome achievement
        welcome_achievement = Achievement(
            user_id=new_user.id,
            achievement_name="Welcome to Skill Grow!",
            achievement_description="You've taken the first step toward building essential life skills!"
        )
        db.session.add(welcome_achievement)
        db.session.commit()
        
        flash('Registration successful!', 'success')
        return redirect(url_for('profile'))
        
    return render_template('index.html', show_register=True)

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    flash('You have been logged out', 'info')
    return redirect(url_for('index'))

@app.errorhandler(404)
def page_not_found(e):
    return render_template('index.html', error='Page not found'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('index.html', error='An internal server error occurred'), 500
