import React from 'react';
import type { InvoiceResult as IInvoiceResult } from '../../services/invoiceService';

interface Props {
  result: IInvoiceResult | null;
  error: string;
}

const InvoiceResult: React.FC<Props> = ({ result, error }) => {
  const val = (v: any) => (v && v !== 'null' && v !== null ? v : '—');

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="dot" style={{ background: 'var(--accent2)', boxShadow: '0 0 8px var(--accent2)' }}></div>
          辨識結果
        </div>
        <div className="result-panel">
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#ff6b6b' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>辨識發生錯誤</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: "'Space Mono', monospace" }}>
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="dot" style={{ background: 'var(--accent2)', boxShadow: '0 0 8px var(--accent2)' }}></div>
          辨識結果
        </div>
        <div className="result-panel">
          <div className="result-empty">
            <span className="icon">📋</span>
            上傳並辨識發票後
            <br />
            結果將顯示於此
          </div>
        </div>
      </div>
    );
  }

  const conf =
    result.confidence === 'high' ? (
      <span className="confidence high">● 高信心度</span>
    ) : (
      <span className="confidence mid">● 中信心度</span>
    );

  return (
    <div className="card">
      <div className="card-header">
        <div className="dot" style={{ background: 'var(--accent2)', boxShadow: '0 0 8px var(--accent2)' }}></div>
        辨識結果
      </div>
      <div className="result-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingTop: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: "'Space Mono', monospace" }}>
            INVOICE PARSED
          </span>
          {conf}
        </div>

        <div className="field-group" style={{ animationDelay: '0.0s' }}>
          <div className="field-row">
            <span className="field-label">發票號碼</span>
            <span className="field-value highlight">{val(result.invoiceNo)}</span>
          </div>
          <div className="field-row">
            <span className="field-label">發票日期</span>
            <span className="field-value">{val(result.invoiceDate)}</span>
          </div>
          <div className="field-row">
            <span className="field-label">幣別</span>
            <span className="field-value">{val(result.currency)}</span>
          </div>
        </div>

        <div className="field-group" style={{ animationDelay: '0.1s' }}>
          <div className="field-row">
            <span className="field-label">賣方名稱</span>
            <span className="field-value">{val(result.seller)}</span>
          </div>
          <div className="field-row">
            <span className="field-label">賣方統編</span>
            <span className="field-value">{val(result.sellerTaxId)}</span>
          </div>
          <div className="field-row">
            <span className="field-label">買方名稱</span>
            <span className="field-value">{val(result.buyer)}</span>
          </div>
          <div className="field-row">
            <span className="field-label">買方統編</span>
            <span className="field-value">{val(result.buyerTaxId)}</span>
          </div>
        </div>

        <div className="field-group" style={{ animationDelay: '0.2s' }}>
          <div className="field-row">
            <span className="field-label">未稅金額</span>
            <span className="field-value">{val(result.subtotal)}</span>
          </div>
          <div className="field-row">
            <span className="field-label">稅額</span>
            <span className="field-value">{val(result.tax)}</span>
          </div>
          <div className="field-row">
            <span className="field-label">含稅總額</span>
            <span className="field-value amount">$ {val(result.total)}</span>
          </div>
        </div>

        {result.items && result.items.length > 0 && (
          <>
            <div className="items-label">— 品項明細 —</div>
            <table className="items-table">
              <thead>
                <tr>
                  <th>品名</th>
                  <th>數量</th>
                  <th>單位</th>
                  <th>單價</th>
                  <th>金額</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{val(item.name)}</td>
                    <td className="num">{val(item.qty)}</td>
                    <td className="num">{val(item.unit)}</td>
                    <td className="num">{val(item.unitPrice)}</td>
                    <td className="num">{val(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {result.notes && (
          <>
            <div className="divider"></div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.6' }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                備註
              </span>
              <div style={{ marginTop: '6px', color: 'var(--text)' }}>{result.notes}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceResult;
