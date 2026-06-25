import React from 'react';

export default function PredictPage({
  singleText, setSingle,
  predictSingle, singleResult
}) {
  return (
    <div className="predict-wrap">
      <h2 className="section-title">AI Text Predictor</h2>
      <textarea className="text-area" rows={5} value={singleText} onChange={(e) => setSingle(e.target.value)} placeholder="Paste review text here..." />
      <button className="btn-primary" onClick={predictSingle}>Predict Sentiment →</button>
      {singleResult && (
        <div className={`result-box ${singleResult.label.toLowerCase()}`}>
          <h3>Result: {singleResult.label}</h3>
          <p>Confidence: {(singleResult.confidence * 100).toFixed(1)}%</p>
          <p>Emotion detected: {singleResult.emotion}</p>
        </div>
      )}
    </div>
  );
}
