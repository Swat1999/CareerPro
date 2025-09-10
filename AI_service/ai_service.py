import sys
from numpy import e
import requests
from bs4 import BeautifulSoup
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
from datetime import datetime, timedelta
import re
import os
import PyPDF2
import docx

# Initialize NLP
nltk.download('punkt')
nltk.download('stopwords')
stop_words = set(nltk.corpus.stopwords.words('english'))

class MarketAnalyzer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words=list(stop_words))
        self.gnews_api_key = os.getenv("GNEWS_API_KEY", "e3aea386e5fb4a835bc89582a64c536d")  # fallback default
        self.gnews_endpoint = (
            f'https://gnews.io/api/v4/search?q=technology&lang=en&country=us&max=10&apikey={self.gnews_api_key}'
        )
        self.course_db = self._init_course_database()

    def _init_course_database(self):
        return {
            "Developer": [
                {
                    "id": "dev-aws",
                    "title": "AWS Certified Developer",
                    "provider": "Udemy",
                    "url": "https://www.udemy.com/aws-certified-developer-associate/",
                    "keywords": ["cloud", "aws", "devops"]
                },
                # Add more developer courses
                {
                    "id": "dev-react",
                    "title": "React - The Complete Guide",
                    "provider": "Udemy",
                    "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
                    "keywords": ["javascript", "react", "frontend"]
                }
            ],
            "Engineer": [
                {
                    "id": "eng-ml",
                    "title": "Machine Learning Specialization",
                    "provider": "Coursera",
                    "url": "https://www.coursera.org/specializations/machine-learning",
                    "keywords": ["ai", "machine learning", "python"]
                },
                # Add more engineering courses
                {
                    "id": "eng-data",
                    "title": "Data Science Fundamentals",
                    "provider": "edX",
                    "url": "https://www.edx.org/course/data-science-fundamentals",
                    "keywords": ["data science", "python", "statistics"]
                }
            ]
        }

    def get_market_trends(self):
        """Fetch top tech news articles from GNews API"""
        try:
            response = requests.get(self.gnews_endpoint)
            if response.status_code == 200:
                data = response.json()
                headlines = [
                    article['title'] + ' ' + article.get('description', '')
                    for article in data.get('articles', [])
                ]
                return " ".join(headlines)
            else:
                print("GNews API Error:", response.status_code)
                return ""
        except Exception as e:
            print("Exception fetching GNews data:", str(e))
            return ""

    def analyze_user(self, user_data):
        text_parts = [
            " ".join(user_data.get("skills", [])),
            " ".join(user_data.get("careerPaths", [])),
            " ".join([exp.get("description", "") for exp in user_data.get("experience", [])])
        ]
        return " ".join(text_parts)
    
    def generate_recommendations(self, user_data):
        try:
            market_text = self.get_market_trends()
            user_text = self.analyze_user(user_data)
            
            if not market_text or not user_text:
                return [{
                    "id": "fallback-1",
                    "title": "Python Programming Fundamentals",
                    "provider": "Udemy",
                    "url": "https://www.udemy.com/topic/python/",
                    "matchReason": "Basic recommendation",
                    "matchScore": 0.8
                    }]
            tfidf_matrix = self.vectorizer.fit_transform([market_text, user_text])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
                
            recommendations = []
            
            for career_path in user_data.get("careerPaths", []):
                for course in self.course_db.get(career_path, []):
                    match_score = sum(
                        1 for keyword in course["keywords"]
                        if keyword in user_text.lower()
                    )
                    if match_score > 0:
                        recommendations.append({
                            **course,
                            "matchReason": f"Matches your {career_path} path",
                            "matchScore": min(1.0, (match_score + similarity) / 3)
                        })
                            
            if not recommendations:
                recommendations = [
                    {
                        "id": "fallback-2",
                        "title": "AI & Machine Learning Fundamentals",
                        "provider": "Coursera",
                        "url": "https://www.coursera.org/learn/machine-learning",
                        "matchReason": "Popular in current market trends",
                        "matchScore": 0.7
                    },
                    {
                        "id": "fallback-3",
                        "title": "Cybersecurity for Beginners",
                        "provider": "edX",
                        "url": "https://www.edx.org/course/cybersecurity-basics",
                        "matchReason": "Growing demand in all sectors",
                        "matchScore": 0.6
                    }
                ]
            return recommendations
        except Exception as e:
            print(f"Error generating recommendations: {str(e)}", file=sys.stderr)
            return [{
                "id": "error-fallback",
                "title": "Career Development Basics",
                "provider": "Udemy",
                "url": "https://www.udemy.com/",
                "matchReason": "Error fallback",
                "matchScore": 0.5
            }]


if __name__ == "__main__":
    analyzer = MarketAnalyzer()
    try:
        user_data = json.loads(sys.argv[1])
        recs = analyzer.generate_recommendations(user_data)
        sys.stdout.write(json.dumps(recs))
        sys.stdout.flush()
    except Exception as e:
        sys.stderr.write(f"Error in Python script: {str(e)}\n")
        sys.stderr.flush()
        sys.stdout.write("[]")
        sys.exit(1)
        
def extract_text_from_file(file_path):
    text = ""
    if file_path.endswith(".pdf"):
        try:
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() or ""
        except Exception as e:
            return f"Error reading PDF: {str(e)}"
    elif file_path.endswith(".docx"):
        try:
            doc = docx.Document(file_path)
            text = "\n".join([p.text for p in doc.paragraphs])
        except Exception as e:
            return f"Error reading DOCX: {str(e)}"
    else:
        text = "Unsupported file format"
    return text
        
def analyze_files(payload):
    results = []
    for doc_type in ["resume", "cv"]:
        file_path = payload.get(doc_type)
        if not file_path:
            continue
        if not os.path.exists(file_path):
            results.append({
                "file": doc_type,
                "feedback": [f"File not found: {file_path}"]
            })
            continue
        text_content = extract_text_from_file(file_path)
        feedback = []
        
        if len(text_content.split()) < 200:
            feedback.append("Document seems too short — add more details about projects and experience.")
        if "Python" not in text_content and "Java" not in text_content:
            feedback.append("Consider adding programming skills (Python/Java/etc.) if relevant.")
        if "experience" not in text_content.lower():
            feedback.append("Work experience section seems missing or unclear.")
        if "education" not in text_content.lower():
            feedback.append("Education section is missing — add details about your academic background.")
        if "linkedin" not in text_content.lower():
            feedback.append("Include your LinkedIn profile for better visibility.")

        results.append({
            "file": doc_type,
            "feedback": feedback if feedback else ["Looks good!"]
        })
    return results
        
if __name__ == "__main__":
    analyzer = MarketAnalyzer()
    try:
        user_data = json.loads(sys.argv[1])
        if isinstance(user_data, dict) and ("resume" in user_data or "cv" in user_data):
            recs = analyzer.analyze_files(user_data)
        else:
            recs = analyzer.generate_recommendations(user_data)
        sys.stdout.write(json.dumps(recs))
        sys.stdout.flush()
    except Exception as e:
        sys.stderr.write(f"Error in Python script: {str(e)}\n")
        sys.stderr.flush()
        sys.stdout.write("[]")
        sys.exit(1)
