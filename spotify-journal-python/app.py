from flask import Flask, render_template, request, redirect, url_for
from textblob import TextBlob
import requests
import json
from datetime import date

app = Flask(__name__)

# In-memory storage for journal entries (later, you can use a database)
journal_entries = []

# Mock function for fetching a recommended playlist (Spotify integration goes here)
def fetch_playlist():
    pass
    '''return [
        {"title": "Song 1", "link": "#", "img": "https://via.placeholder.com/100"},
        {"title": "Song 2", "link": "#", "img": "https://via.placeholder.com/100"},
        {"title": "Song 3", "link": "#", "img": "https://via.placeholder.com/100"}
    ]'''
# Home route with journal form
@app.route('/', methods=['GET', 'POST'])
def home():
    sentiment = 0
    if request.method == 'POST':
        journal_entry = request.form['journalEntry']
        
        # Sentiment analysis
        analysis = TextBlob(journal_entry)
        sentiment = analysis.sentiment.polarity
        
        # Store the journal entry
        journal_entries.append({
            "entry": journal_entry,
            "sentiment": sentiment,
            "date": date.today()  # Use the current date
        })
        
        return render_template('home.html', sentiment=sentiment, journal_entries=journal_entries)

    return render_template('home.html', sentiment=sentiment)

# Route for showing journal entries
@app.route('/entries')
def journal_entries_page():
    return render_template('journal_entries.html', entries=journal_entries)

# Route for showing sentiment graph
@app.route('/sentiment')
def sentiment_graph():
    return render_template('sentiment_graph.html', entries=journal_entries)

if __name__ == '__main__':
    app.run(debug=True)
