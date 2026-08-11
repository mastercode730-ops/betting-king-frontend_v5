'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { WHATSAPP_URL, WHATSAPP_NUMBER } from '../../../../lib/constants';

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function GameChartPage() {
  const params = useParams();
  const gameCode = params.code?.toUpperCase() || 'FB';

  const currentYear = new Date().getFullYear();
  const [year, setYear]           = useState(String(currentYear));
  const [gameData, setGameData]   = useState(null);
  const [monthlyData, setMonthly] = useState({});
  const [todayResults, setToday]  = useState([]);
  const [todayDate, setTDate]     = useState('');
  const [yesterdayDate, setYDate] = useState('');
  const [loading, setLoading]     = useState(true);

  const loadGameChart = useCallback(async (yr) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/chart/game/${gameCode}?year=${yr}`);
      const json = await res.json();
      if (json.success && json.monthly_data) {
        setGameData(json.game || { name: gameCode, code: gameCode });
        setMonthly(json.monthly_data);
      }
    } catch (e) {
      console.warn('[SK] Failed to fetch game chart:', e.message);
    } finally {
      setLoading(false);
    }
  }, [gameCode]);

  const loadToday = useCallback(async () => {
    try {
      const res = await fetch('/api/results/today');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setToday(json.data);
        if (json.today_date) setTDate(json.today_date);
        if (json.yesterday_date) setYDate(json.yesterday_date);
      }
    } catch (e) {
      console.warn('[SK] Failed to fetch today results:', e.message);
    }
  }, []);

  useEffect(() => { loadGameChart(year); }, [loadGameChart, year]);
  useEffect(() => { loadToday(); const id = setInterval(loadToday, 15000); return () => clearInterval(id); }, [loadToday]);

  const years = [2026, 2025, 2024, 2023, 2022];
  const thisGame = todayResults.find(g => g.code === gameCode) || gameData;

  const SpinnerIcon = () => (
    <span className="wait-spinner" title="लाइव रिजल्ट का इंतज़ार">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9.5" />
        <line className="clock-hand" x1="12" y1="12" x2="12" y2="6.5" />
      </svg>
    </span>
  );

  return (
    <div id="wrapper">
      <div className="toran" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} style={{ animationDelay: `${(i % 5) * 0.2}s` }} />
        ))}
      </div>

      <header className="nav">
        <span className="brand">SATTA KING MAX</span>
        <div className="links">
          <Link href="/" className="on">← गृह पृष्ठ पर लौटें</Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-wa-festive">
            💬 WhatsApp
          </a>
        </div>
      </header>

      <div className="wrap" style={{ marginTop: 20 }}>
        {/* WHATSAPP BANNER */}
        <div className="wa-royal-banner">
          <div>
            <div className="wa-royal-title">👑 {gameData?.name || gameCode} लीक नंबर सीधे WhatsApp पर प्राप्त करें</div>
            <div className="wa-royal-sub">सुपरफास्ट रिजल्ट &bull; WhatsApp हेल्पलाइन: {WHATSAPP_NUMBER}</div>
          </div>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-wa-festive">
            📲 WhatsApp चैट
          </a>
        </div>

        {/* TEMPLE ARCH FEATURED RESULT */}
        {thisGame && (
          <div className="arch" style={{ marginTop: 20 }}>
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner bl" />
            <span className="corner br" />

            <span className="lbl">आज का शुभ परिणाम</span>
            <h2>{thisGame.name}</h2>
            <div className="num">
              {!thisGame.today_number || thisGame.today_number === 'XX' || thisGame.today_number === '--' ? <SpinnerIcon /> : thisGame.today_number}
            </div>
            <p className="prevline">
              समय: <b>{thisGame.draw_time || '—'}</b> &nbsp;|&nbsp; कल का अंक: <b>{thisGame.yesterday_number || '—'}</b>
            </p>
            <div style={{ marginTop: 14 }}>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-wa-festive">
                💬 खाईवाल बुकिंग
              </a>
            </div>
          </div>
        )}

        {/* YEAR NAV */}
        <div className="royal-nav-btns" style={{ margin: '24px 0' }}>
          {years.map(y => (
            <button
              key={y}
              className={`royal-btn ${year === String(y) ? 'active' : ''}`}
              onClick={() => setYear(String(y))}
            >
              {y} चार्ट
            </button>
          ))}
        </div>

        {/* ANNUAL CHART TABLE */}
        <div className="sec-h">
          <span>{gameData?.name || gameCode} वार्षिक रिकॉर्ड तालिका {year}</span>
        </div>

        <div className="royal-chart-card">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--gold-2)' }}>
              <SpinnerIcon /> [ चार्ट लोड हो रहा है... ]
            </div>
          ) : (
            <table className="royal-table" aria-label="Annual Game Chart">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>तारीख</th>
                  {MONTH_SHORT.map(m => <th key={m}>{m}</th>)}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 31 }, (_, i) => {
                  const dPad = String(i + 1).padStart(2, '0');
                  return (
                    <tr key={dPad}>
                      <td><b>{dPad}</b></td>
                      {Array.from({ length: 12 }, (_, m) => {
                        const mPad = String(m + 1).padStart(2, '0');
                        const num = monthlyData?.[mPad]?.[dPad];
                        const hasNum = num && num !== 'XX' && num !== '--';
                        return (
                          <td key={mPad} className={hasNum ? 'has-num' : ''}>
                            {num === 'XX' ? <SpinnerIcon /> : (num || '—')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ALL OTHER CARDS */}
        <div className="sec-h" style={{ marginTop: 36 }}>
          <span>अन्य सभी गेम परिणाम</span>
        </div>

        <div className="cards">
          {todayResults.map((g) => {
            const isPending = !g.today_number || g.today_number === 'XX' || g.today_number === '--';
            const chartHref = `/${g.slug || g.code.toLowerCase()}/satta-result-chart/${g.code.toLowerCase()}/`;

            return (
              <div key={g.code} className="card">
                <div className="card-in">
                  <div className="cname">{g.name}</div>
                  <div className="ctime">⏰ {g.draw_time}</div>
                  <div className="cbody">
                    <div className="col">
                      <span>कल आया</span>
                      <span className="old">{g.yesterday_number || '—'}</span>
                    </div>
                    <span className="divider">✦</span>
                    <div className="col">
                      <span>आज का रिजल्ट</span>
                      <span className={`new ${isPending ? 'pending' : ''}`}>
                        {isPending ? <SpinnerIcon /> : g.today_number}
                      </span>
                    </div>
                  </div>
                  <Link href={chartHref} className="clink">
                    शुभ रिकॉर्ड चार्ट देखें →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FLOATING WHATSAPP BUTTON */}
      <div className="floating-wa">
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="festive-fab-wa">
          💬 WhatsApp
        </a>
      </div>

      <div className="floating-bar">
        <button className="festive-fab" onClick={() => window.location.reload()}>
          ↻ ताज़ा करें
        </button>
      </div>
    </div>
  );
}
