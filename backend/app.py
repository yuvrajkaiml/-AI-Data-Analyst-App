from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"])

df = None


def local_data_analysis(df, question):
    q = question.lower()
    
    # Name lookup — search for any value from the question in string columns
    str_cols = df.select_dtypes(include=['object']).columns.tolist()
    for col in str_cols:
        mask = df[col].astype(str).str.lower().str.contains(
            '|'.join(w for w in q.split() if len(w) > 3), na=False
        )
        if mask.any():
            row = df[mask].iloc[0].to_dict()
            insight = ' | '.join(f"{k}: {v}" for k, v in row.items())
            return {
                'insight': insight,
                'chart_type': 'bar',
                'x_col': None,
                'y_col': None,
                'data': df[mask].to_dict('records')
            }
    
    # ... rest of existing function unchangednumeric_cols = df.select_dtypes(include=['number']).columns.tolist()
    if len(numeric_cols) == 0:
        return {
            'insight': 'No numeric data available for chart generation.',
            'chart_type': 'bar',
            'x_col': None,
            'y_col': None,
            'data': df.head(5).to_dict('records')
        }

    if any(k in question.lower() for k in ['top', 'highest', 'largest', 'most frequent']):
        col = numeric_cols[0]
        top = df.nlargest(5, col)
        x_col = df.columns.tolist()[0] if len(df.columns) > 1 else col
        return {
            'insight': f'Top 5 values of {col}',
            'chart_type': 'bar',
            'x_col': x_col,
            'y_col': col,
            'data': top[[x_col, col]].to_dict('records') if x_col != col else top[[col]].to_dict('records')
        }

    if 'distribution' in question.lower():
        col = numeric_cols[0]
        counts = df[col].value_counts().reset_index()
        counts.columns = [col, 'count']
        return {
            'insight': f'Distribution of {col}',
            'chart_type': 'pie',
            'x_col': col,
            'y_col': 'count',
            'data': counts.to_dict('records')
        }

    col = numeric_cols[0]
    mean_val = df[col].mean()
    return {
        'insight': f'Average value of {col} is {mean_val:.2f}',
        'chart_type': 'line',
        'x_col': df.index.name if df.index.name else 'index',
        'y_col': col,
        'data': df[[col]].reset_index().to_dict('records')
    }


@app.route('/upload', methods=['POST'])
def upload():
    global df
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'File must be CSV'}), 400

    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > 5 * 1024 * 1024:
        return jsonify({'error': 'File too large (max 5MB)'}), 400

    try:
        df = pd.read_csv(file)
        columns = df.columns.tolist()
        preview = df.head(5).to_dict('records')
        return jsonify({'columns': columns, 'preview': preview})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/ask', methods=['POST'])
def ask():
    global df
    if df is None:
        return jsonify({'error': 'No CSV uploaded'}), 400

    data = request.get_json() or {}
    question = data.get('question', '').strip()
    if not question:
        return jsonify({'error': 'No question provided'}), 400

    columns = df.columns.tolist()
    dtypes = df.dtypes.astype(str).to_dict()
    sample_df = df.head(5)
    sample = sample_df.to_csv(index=False)  # CSV is far more token-efficient than to_string()

    prompt = f"""You are a data analyst. Given the CSV with columns: {columns}
Data types: {dtypes}
Sample data (first 5 rows as CSV):
{sample}

Full dataframe has {len(df)} rows. Column names: {columns}

User question: {question}

Return ONLY a valid JSON object with these exact keys:
- insight: a brief textual insight about the data
- chart_type: one of 'bar', 'line', 'pie'
- x_col: column name for x-axis (string, or null if not applicable)
- y_col: column name for y-axis (string, or null if not applicable)
- data: array of objects, each with keys matching the column names, representing the chart data points

Do not include any markdown or extra text. Just the JSON."""

    api_key = os.getenv('OPENROUTER_API_KEY')
    if not api_key:
        return jsonify(local_data_analysis(df, question))

    try:
        from openai import OpenAI
    except ImportError:
        return jsonify({'error': 'openai client library not installed. Run: pip install openai'}), 500

    try:
        client = OpenAI(
            api_key=api_key,
            base_url='https://openrouter.ai/api/v1'
        )
        response = client.chat.completions.create(
            model='openai/gpt-4-turbo-preview',
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            temperature=0.3,
        )

        result_text = response.choices[0].message.content.strip()

        # Strip markdown code fences if present
        if result_text.startswith('```'):
            result_text = result_text.split('```')[1]
            if result_text.startswith('json'):
                result_text = result_text[4:]
        result_text = result_text.strip()

        import json
        parsed = json.loads(result_text)

        required_keys = ['insight', 'chart_type', 'x_col', 'y_col', 'data']
        if not all(k in parsed for k in required_keys):
            return jsonify({'error': 'LLM result missing required keys', 'raw': parsed}), 500

        return jsonify(parsed)
    except Exception as e:
        local = local_data_analysis(df, question)
        local['warning'] = f'Fallback to local analysis: {str(e)}'
        return jsonify(local)


@app.route('/', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'CSV QA backend is running'}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)