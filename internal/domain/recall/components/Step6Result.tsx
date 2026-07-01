"use client";

interface Props {
  respondentName?: string;
  onFinish: () => void;
  onFillAgain?: () => void;
}

export function Step6Result({ respondentName, onFinish, onFillAgain }: Props) {
  return (
    <div className="step-content step-content--centered">
      <div className="result-success-icon">✅</div>
      <h2 className="step-title">Meal Report Submitted!</h2>
      <p className="step-subtitle">
        Thank you{respondentName ? `, ${respondentName}` : ""}! Your meal recall has been
        successfully recorded. Our nutritionists will analyze your data to provide personalized
        recommendations.
      </p>

      <div className="result-summary">
        <div className="result-summary__item">
          <span className="result-summary__icon">🥗</span>
          <span className="result-summary__label">Your data has been saved</span>
        </div>
        <div className="result-summary__item">
          <span className="result-summary__icon">📊</span>
          <span className="result-summary__label">Nutritional analysis in progress</span>
        </div>
        <div className="result-summary__item">
          <span className="result-summary__icon">💡</span>
          <span className="result-summary__label">Personalized insights coming soon</span>
        </div>
      </div>

      <div className="result-actions">
        {onFillAgain && (
          <button type="button" className="btn-secondary" onClick={onFillAgain}>
            Fill Another Meal
          </button>
        )}
        <button type="button" className="btn-continue" onClick={onFinish}>
          Finish
        </button>
      </div>
    </div>
  );
}
