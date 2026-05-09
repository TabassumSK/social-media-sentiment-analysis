# PulseAI - Social Media Sentiment Analysis Platform

PulseAI is an advanced AI-powered platform for real-time social media sentiment analysis, data visualization, and comparative analytics. It aggregates data from multiple social media platforms including Twitter, Reddit, Instagram, YouTube, HackerNews, and NewsAPI to provide comprehensive sentiment insights.

## 🚀 Features

- **Multi-Platform Analysis**: Analyze sentiment across Twitter, Reddit, Instagram, YouTube, HackerNews, and NewsAPI
- **Real-time Sentiment Analysis**: BERT-based sentiment classification with confidence scores
- **Interactive Visualizations**: 3D charts, heatmaps, trend analysis, and comparative dashboards
- **AI-Powered Insights**: Aspect-based sentiment analysis and keyword extraction
- **User Authentication**: Secure user registration and login system
- **Report Generation**: Export analysis results to PDF reports
- **Responsive Design**: Modern React-based frontend with mobile support

## 🛠 Tech Stack

### Backend

- **FastAPI**: High-performance async web framework
- **Transformers**: BERT sentiment analysis models
- **SQLAlchemy**: Database ORM
- **JWT**: Authentication tokens
- **ReportLab**: PDF report generation

### Frontend

- **React 19**: Modern JavaScript framework
- **Three.js**: 3D visualizations
- **Recharts**: Data visualization library
- **Framer Motion**: Animation library
- **Axios**: HTTP client

## 📁 Project Structure

```
social_media_analysis/
├── pluseai-backend/          # FastAPI backend
│   ├── main.py              # Main application
│   ├── backend.py           # Additional backend logic
│   ├── requirements.txt     # Python dependencies
│   ├── core/
│   │   ├── auth.py          # Authentication
│   │   ├── database.py      # Database configuration
│   ├── models/
│   │   ├── schemas.py       # Pydantic models
│   │   └── bert_sentiment/  # BERT model files
│   └── services/
│       ├── analyzer.py      # Sentiment analysis
│       └── fetchers.py      # Data fetching
├── pluseai-frontend/         # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── charts/          # Chart components
│   │   └── dashboard/       # Dashboard features
│   └── package.json         # Node dependencies
└── README.md
```

## 🏗 Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- Git

### Backend Setup

1. Navigate to the backend directory:

```bash
cd pluseai-backend
```

2. Create a virtual environment:

```bash
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On macOS/Linux
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Download the BERT sentiment model:

```bash
python -c "
from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained('cardiffnlp/twitter-roberta-base-sentiment-latest')
tokenizer.save_pretrained('models/bert_sentiment')
print('Tokenizer saved!')
"
```

5. Start the backend server:

```bash
python -m uvicorn main:app --reload --port 8000
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd pluseai-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🚀 Usage

1. **Registration/Login**: Create an account or login to access the platform
2. **Single Text Analysis**: Analyze sentiment of individual text inputs
3. **Multi-Platform Search**: Search and analyze sentiment across social media platforms
4. **Comparative Analysis**: Compare sentiment between two different queries
5. **Visualization Dashboard**: Explore interactive charts and 3D visualizations
6. **Report Generation**: Export analysis results as PDF reports

## 🔧 API Endpoints

- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /analyze` - Multi-platform sentiment analysis
- `POST /compare` - Comparative analysis
- `POST /single` - Single text analysis
- `POST /chat` - AI assistant interaction

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **PulseAI Team** - Initial development and maintenance

## 📑 Acknowledgments

- CardiffNLP for the Twitter RoBERTa sentiment model
- FastAPI community for the excellent framework
- React ecosystem for the frontend tools
