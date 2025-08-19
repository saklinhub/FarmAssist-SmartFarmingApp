from flask import Flask, render_template,request ,redirect, url_for, session, flash
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
import os
import numpy as np
import pickle
import json
from dotenv import load_dotenv
load_dotenv()


from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

app=Flask(__name__)


app.secret_key=os.getenv("SECRET_KEY")

app.config['SQLALCHEMY_DATABASE_URI']='sqlite:///users.db'
db=SQLAlchemy(app)

class User(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    username=db.Column(db.String(150),unique=True,nullable=False)
    password=db.Column(db.String(200),nullable=False)

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user' not in session:
            flash('Please log in first.')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

#Crop Recommendation Model
crop_model=pickle.load(open('crop_model.pkl', 'rb'))

#Disease Detection Model
#disease_model=load_model('crop_disease_detection.h5')
disease_model=load_model('Crop_disease_detection_model.h5')

# with open('static/data/class_labels.json') as f:
#     class_labels=json.load(f)
with open('static/data/class_indices_fresh.json') as f:
    class_labels=json.load(f)


with open('static/data/disease_cures.json') as f:
    DISEASE_CURES=json.load(f)


@app.route('/')
def home():
    return render_template('index.html')
# @app.route('/')
# def home():
#     if 'user' not in session:
#         return redirect(url_for('login'))
#     return render_template('index.html')


@app.route('/login',methods=['GET','POST'])
def login():
    error = None
    if request.method=='POST':
        username=request.form['username']
        password=request.form['password']
        user=User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password,password):
            session['user']=user.username
            flash('Login successful!')
            return redirect(url_for('home'))
        else:
            error='Invalid username or password.'
    return render_template('pages/login.html',error=error)

@app.route('/signup',methods=['GET','POST'])
def signup():
    error=None
    if request.method=='POST':
        username=request.form['username']
        password=request.form['password']
        if User.query.filter_by(username=username).first():
            error='Username already exists.'
        else:
            hashed_password=generate_password_hash(password)
            new_user=User(username=username,password=hashed_password)
            db.session.add(new_user)
            db.session.commit()
            flash('Signup successful! Please log in.')
            return redirect(url_for('login'))
    return render_template('pages/signup.html',error=error)

@app.route('/logout')
def logout():
    session.pop('user',None)
    flash("You have been logged out.")
    return redirect(url_for('login'))


@app.route('/crop-recommendation')
@login_required
def crop_recommendation_form():
    return render_template('pages/crop-recommendation.html')

# @app.route('/admin/users') #to see the registered users in route
# def view_users():
#     users = User.query.all()
#     return '<br>'.join([f"{user.id} | {user.username} | {user.password}" for user in users])


@app.route('/predict',methods=['POST'])
@login_required
def predict():
    try:
        features=[
            float(request.form['N']),
            float(request.form['P']),
            float(request.form['K']),
            float(request.form['temperature']),
            float(request.form['humidity']),
            float(request.form['ph']),
            float(request.form['rainfall'])
        ]

        prediction=crop_model.predict([features])[0]

        return render_template('pages/crop-recommendation.html',prediction=prediction,
                               inputs={
                                   'N': features[0],
                                   'P': features[1],
                                   'K': features[2],
                                   'temperature': features[3],
                                   'humidity': features[4],
                                   'ph': features[5],
                                   'rainfall': features[6]
                               })
    except Exception as e:
        return f"<h3>Error:</h3><pre>{str(e)}</pre>",400


@app.route('/disease-detection', methods=['GET', 'POST'])
@login_required
def disease_detection():
    prediction = None
    confidence = None
    image_path = None
    
    try:
        if request.method == 'POST':
            file = request.files['file']
            if file:
                filename = secure_filename(file.filename)
                image_path = os.path.join('static/uploads', filename)
                os.makedirs(os.path.dirname(image_path), exist_ok=True)
                file.save(image_path)

                
                # img = image.load_img(image_path, target_size=(128, 128))
                img=image.load_img(image_path,target_size=(224,224))
                img_array=image.img_to_array(img)
                img_array=img_array/255.0
                img_array=np.expand_dims(img_array,axis=0) 
                

                
                result = disease_model.predict(img_array)


                #raw_class = class_labels[np.argmax(result[0])]
                index_to_class = {v: k for k, v in class_labels.items()}

                predicted_index = int(np.argmax(result[0]))
                raw_class = index_to_class[predicted_index]


                predicted_class = raw_class.replace("___", " - ").replace("_", " ").title()


                cure_info = DISEASE_CURES.get(raw_class, {
                    "name": predicted_class,
                    "type": "Unknown",
                    "cure": "No specific treatment found. Please consult an expert."
                })  



                disease_keywords = predicted_class.lower().split()
                related_items = []
                for product in MARKETPLACE_PRODUCTS:
                    if any(tag in product['tags'] for tag in disease_keywords):
                        related_items.append(product)


                confidence = round(100 * np.max(result[0]), 2)

                return render_template('pages/disease-detection.html',
                                       prediction=predicted_class,
                                       confidence=confidence,
                                       image_path=image_path,
                                       cure=cure_info["cure"],
                                       disease_type=cure_info["type"],
                                       recommendations=related_items)

        return render_template('pages/disease-detection.html')

    except Exception as e:
        return f"<h3>Error:</h3><pre>{str(e)}</pre>", 500
    

@app.route('/marketplace')
@login_required
def marketplace():
    with open('static/data/products.json') as f:
        products=json.load(f)
    return render_template('pages/marketplace.html',products=products)    

with open('static/data/products.json') as f:
    MARKETPLACE_PRODUCTS=json.load(f)

if __name__ == '__main__':
    app.run(debug=True)



