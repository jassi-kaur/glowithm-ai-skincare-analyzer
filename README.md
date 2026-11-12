# Glowithm — AI Skincare Routine Analyzer

Glowithm is an AI-powered skincare routine analyzer that helps users understand their skin profile, review their existing skincare products, identify potential ingredient conflicts, and receive personalized morning and evening skincare routine suggestions.

The project combines a Flask backend, a locally hosted language model, ingredient compatibility data, and a machine-learning classifier with deterministic safety checks.

## Features

- **Personalized Skin Analysis:** Analyze skincare needs using skin type and skin concerns.
- **Product Analysis:** Review user-provided skincare products and their recognized ingredients.
- **Ingredient Compatibility:** Identify potential ingredient conflicts using compatibility data and machine-learning predictions.
- **AI Routine Generation:** Generate personalized AM and PM skincare routine suggestions.
- **Safety Validation:** Apply deterministic safety rules to validate and adjust AI-generated routines.
- **Ingredient Intelligence:** Explore ingredient information, benefits, usage guidance, and precautions.
- **Fallback Support:** Use a built-in routine generation pathway when the local language model is unavailable or returns an invalid response.
- **Pregnancy Mode:** Apply additional ingredient-related precautions when pregnancy mode is selected.

## Technology Stack

| Area | Technologies |
|---|---|
| Backend | Python, Flask |
| AI / LLM | Ollama, Llama 3.2 |
| Structured AI Output | Instructor, Pydantic |
| Machine Learning | Scikit-learn, Random Forest |
| Model Storage | Joblib |
| Data Processing | Pandas |
| Frontend | HTML, CSS, JavaScript |

## Project Structure

```text
AI Skincare Analyzer/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── data/
│   ├── evaluation/
│   ├── ml/
│   │   ├── conflict_model.joblib
│   │   ├── conflict_model_candidate.joblib
│   │   ├── train_conflict_model.py
│   │   ├── test_predictions.py
│   │   └── ML_EVALUATION.md
│   ├── ollama/
│   ├── schemas/
│   ├── scripts/
│   ├── services/
│   └── tests/
│
├── frontend/
│   ├── index.html
│   ├── analyzer.html
│   ├── skin-concerns.html
│   ├── concern-detail.html
│   ├── ingredients.html
│   ├── ingredient-library.html
│   ├── ingredient-detail.html
│   ├── assets/
│   ├── components/
│   ├── css/
│   ├── data/
│   ├── js/
│   ├── tests/
│   └── tools/
│
├── .gitignore
└── README.md

```
