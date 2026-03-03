import React from 'react';

const InvoiceTips: React.FC = () => {
  return (
    <div className="tips">
      <div className="tips-grid">
        <div className="tip-card">
          <span className="tip-icon">💡</span>
          <div>
            <strong style={{ color: 'var(--text)' }}>清晰拍攝</strong>
            <br />
            確保發票平整、光線充足，避免反光和陰影
          </div>
        </div>
        <div className="tip-card">
          <span className="tip-icon">📐</span>
          <div>
            <strong style={{ color: 'var(--text)' }}>正面對齊</strong>
            <br />
            發票正面朝上，盡量保持水平，減少傾斜角度
          </div>
        </div>
        <div className="tip-card">
          <span className="tip-icon">🔍</span>
          <div>
            <strong style={{ color: 'var(--text)' }}>高解析度</strong>
            <br />
            使用 300 DPI 以上的圖片可大幅提升辨識準確率
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTips;
