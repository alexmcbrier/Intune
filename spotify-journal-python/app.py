from flask import Flask, render_template, request, redirect, url_for
from textblob import TextBlob
import requests
import json
from datetime import date
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure
import io
from flask import Response
import random
import os

app = Flask(__name__)

# Path to the JSON file
JSON_FILE_PATH = 'sentiments.json'

# Load existing journal entries from the JSON file
def load_entries():
    if os.path.exists(JSON_FILE_PATH):
        with open(JSON_FILE_PATH, 'r') as file:
            return json.load(file)
    return []

# Save journal entries to the JSON file
def save_entries(entries):
    with open(JSON_FILE_PATH, 'w') as file:
        json.dump(entries, file, indent=2)

# Load existing entries into memory
journal_entries = load_entries()

# Home route with journal form
@app.route('/', methods=['GET', 'POST'])
def home():
    sentiment = 0
    if request.method == 'POST':
        journal_entry = request.form['journalEntry']
        
        # Sentiment analysis
        analysis = TextBlob(journal_entry)
        sentiment = analysis.sentiment.polarity
        
        # Create a new journal entry
        new_entry = {
            "entry": journal_entry,
            "sentiment": sentiment,
            "date": str(date.today())  # Use the current date as a string
        }
        
        # Append the new entry to the existing journal entries
        journal_entries.append(new_entry)

        # Save the updated entries to the JSON file
        save_entries(journal_entries)
        
        return render_template('home.html', sentiment=sentiment, journal_entries=journal_entries)

    return render_template('home.html', sentiment=sentiment)

# Route for showing journal entries
@app.route('/entries')
def journal_entries_page():
    return render_template('journal_entries.html', entries=journal_entries)

# Route for showing sentiment graph
@app.route('/sentiment')
def sentiment_graph():
    return render_template('sentiment_graph.html', graph="")

@app.route('/plot.png')
def plot_png():
    fig = create_figure()
    output = io.BytesIO()
    FigureCanvas(fig).print_png(output)
    return Response(output.getvalue(), mimetype='image/png')


def create_figure():
    fig = Figure()
    axis = fig.add_subplot(1, 1, 1)
    xs = range(10)
    #ys = [random.randint(1, 50) for x in xs]
    ys = [2**x for x in xs[0:6]] + [2**-x for x in xs[6:11]]
    axis.plot(xs, ys)
    return fig

if __name__ == '__main__':
    app.run(debug=True)
