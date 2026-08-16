'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { WHATSAPP_URL, WHATSAPP_NUMBER } from '../lib/constants';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const REFRESH_MS = 15_000;

export default function HomePage() {
  const [games, setGames]           = useState([]);
  const [todayDate, setTodayDate]   = useState('');
  const [yesterdayDate, setYDate]   = useState('');
  const [searchQ, setSearchQ]       = useState('');
  const [syncing, setSyncing]       = useState(false);
  const [chartMonth, setChartMonth] = useState(() => String(new Date().getMonth() + 1).padStart(2, '0'));
  const [chartYear, setChartYear]   = useState(() => String(new Date().getFullYear()));
  const [chartData, setChartData]   = useState(null);

  // Fetch today results from backend API
  const loadAnnouncement = useCallback(async () => {
    try {
      const res = await fetch('/api/announcement');
      const json = await res.json();
      if (json && json.success) setAnnouncement(json);
    } catch (e) {}
  }, []);

  const loadResults = useCallback(async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/results/today');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setGames(json.data);
        if (json.today_date) setTodayDate(json.today_date);
        if (json.yesterday_date) setYDate(json.yesterday_date);
      }
    } catch (e) {
      console.warn('[SK] API failed:', e.message);
    } finally {
      setTimeout(() => setSyncing(false), 800);
    }
  }, []);

  useEffect(() => {
    loadResults();
    loadAnnouncement();
    const id = setInterval(() => { loadResults(); loadAnnouncement(); }, REFRESH_MS);
    return () => clearInterval(id);
  }, [loadResults]);

  // Load monthly chart from backend API
  const loadChart = useCallback(async (month, year) => {
    try {
      const res = await fetch(`/api/chart/monthly?month=${month}&year=${year}`);
      const json = await res.json();
      if (json.success && json.rows) {
        setChartData(json);
      }
    } catch (e) {
      console.warn('[SK] Chart API failed:', e.message);
    }
  }, []);

  useEffect(() => {
    loadChart(chartMonth, chartYear);
  }, [loadChart, chartMonth, chartYear]);

  const filtered = searchQ
    ? games.filter(g => g.name.toLowerCase().includes(searchQ.toLowerCase()) || g.code.toLowerCase().includes(searchQ.toLowerCase()))
    : games;

  const royalLead = games.find(g => g.is_highlight && g.is_main) || games[0];

  const goToMonth = (month, year) => {
    setChartMonth(month);
    setChartYear(year);
  };

  const mIdx = parseInt(chartMonth, 10) - 1;
  const prevMIdx = mIdx === 0 ? 11 : mIdx - 1;
  const prevYear = mIdx === 0 ? parseInt(chartYear) - 1 : parseInt(chartYear);
  const nextMIdx = mIdx === 11 ? 0 : mIdx + 1;
  const nextYear = mIdx === 11 ? parseInt(chartYear) + 1 : parseInt(chartYear);
  const todayDay = todayDate ? todayDate.split('-')[2] : '';

  const fmtHindiDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const SpinnerIcon = () => (
    <span className="wait-spinner" title="लाइव रिजल्ट का इंतज़ार">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9.5" />
        <line className="clock-hand" x1="12" y1="12" x2="12" y2="6.5" />
      </svg>
    </span>
  );

  return (
    <div id="wrapper">
      {/* ── BREAKING FLASH BAR ── */}
      {royalLead && (
        <div className="lrs">
          <span className="lrs-tag"><i className="lrs-dot" />अभी आया रिजल्ट</span>
          <span className="lrs-game">{royalLead.name}</span>
          <span className="lrs-time">({royalLead.draw_time})</span>
          <span className="lrs-arrow">&#10148;</span>
          <span className="lrs-num">{!royalLead.today_number || royalLead.today_number === 'XX' || royalLead.today_number === '--' ? '??' : royalLead.today_number}</span>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-wa-festive" style={{ padding: '2px 10px', fontSize: '11px', marginLeft: 8 }}>
            💬 WhatsApp
          </a>
        </div>
      )}

      {/* ── HANGING TORAN BUNTING ── */}
      <div className="toran" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} style={{ animationDelay: `${(i % 5) * 0.2}s` }} />
        ))}
      </div>

      {/* ── ROYAL NAV ── */}
      <header className="nav">
        <span className="brand">SATTA KING MAX</span>
        <div className="links">
          <Link href="/" className="on">गृह पृष्ठ</Link>
          <a href="#monthly-chart">मासिक चार्ट</a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-wa-festive">
            💬 WhatsApp बुकिंग
          </a>
        </div>
      </header>

      {/* ── LIVE ANNOUNCEMENT / ADVERTISEMENT BANNER ── */}
      {announcement && announcement.active && announcement.text && (
        <div className="adv-banner" role="alert">
          <div className="adv-banner-inner">
            <span className="adv-badge">📢 SPECIAL NOTICE</span>
            <span className="adv-text" dangerouslySetInnerHTML={{
              __html: announcement.text.replace(
                /(https?:\/\/[^\s]+)/g,
                '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
              )
            }} />
          </div>
        </div>
      )}

      {/* ── ROTATING MANDALA MASTHEAD ── */}
      <section className="mast">
        <div className="mandala" aria-hidden="true" />
        <span className="om">ॐ</span>
        <h1>SATTA KING MAX</h1>
        <div className="rule">
          <i />
          <b>❖</b>
          <i />
        </div>
        <p className="date">{fmtHindiDate(todayDate || new Date())}</p>
        <p className="tag">
          शुभ सट्टा परिणाम &bull; {syncing ? 'लाइव सिंक...' : 'लाइव अपडेट'}
        </p>
      </section>

      <div className="wrap">
        {/* ── WHATSAPP BANNER ── */}
        <div className="wa-royal-banner">
          <div>
            <div className="wa-royal-title">👑 सीधा खाईवाल दरबार &bull; 100% ईमानदार गेम बुकिंग</div>
            <div className="wa-royal-sub">सिंगल जोड़ी और हरूफ प्राप्त करने के लिए WhatsApp करें: {WHATSAPP_NUMBER}</div>
          </div>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-wa-festive">
            📲 WhatsApp चैट शुरू करें
          </a>
        </div>

        {/* ── TEMPLE ARCH FEATURED RESULT ── */}
        {royalLead && (
          <div className="arch">
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner bl" />
            <span className="corner br" />

            <span className="lbl">शुभ दैनिक परिणाम</span>
            <h2>{royalLead.name}</h2>
            <div className="num">
              {!royalLead.today_number || royalLead.today_number === 'XX' || royalLead.today_number === '--' ? <SpinnerIcon /> : royalLead.today_number}
            </div>
            <p className="prevline">
              समय: <b>{royalLead.draw_time}</b> &nbsp;|&nbsp; कल का शुभ अंक: <b>{royalLead.yesterday_number || '—'}</b>
            </p>
            <div style={{ marginTop: 14 }}>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-wa-festive">
                💬 खाईवाल बुकिंग
              </a>
            </div>
          </div>
        )}

        {/* ── NOTICE ── */}
        <div className="notice">
          सभी बाज़ार के रिजल्ट सबसे तेज़ और सही पाने के लिए नीचे स्क्रॉल करें
        </div>

        {/* ── SEARCH BAR ── */}
        <div style={{ margin: '16px 0 24px' }}>
          <input
            type="text"
            style={{
              width: '100%',
              padding: '12px 18px',
              border: '1px solid var(--gold)',
              borderRadius: '25px',
              fontSize: '15px',
              background: 'rgba(0,0,0,0.3)',
              color: 'var(--cream)',
              fontFamily: 'var(--font-royal)',
              outline: 'none',
            }}
            placeholder="🔍 गेम खोजें (Gali, Desawar, Faridabad...)"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
        </div>

        {/* ── ROYAL INVITATION CARDS GRID ── */}
        <div className="sec-h">
          <span>सभी सट्टा बाज़ार परिणाम</span>
        </div>

        <div className="cards">
          {filtered.map((g) => {
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

        {/* ── MONTHLY ARCHIVE TABLE ── */}
        <div className="sec-h" id="monthly-chart" style={{ marginTop: 44 }}>
          <span>
            मासिक रिकॉर्ड तालिका &mdash; {chartData ? `${MONTH_NAMES[parseInt(chartData.month, 10) - 1]?.toUpperCase()} ${chartData.year}` : 'ARCHIVE'}
          </span>
        </div>

        <div className="royal-chart-card">
          <table className="royal-table" aria-label="Monthly Archive Chart">
            <thead>
              <tr>
                <th style={{ width: 60 }}>तारीख</th>
                <th>DESAWAR</th>
                <th>FARIDABAD</th>
                <th>GAZIYABAD</th>
                <th>GALI</th>
              </tr>
            </thead>
            <tbody>
              {chartData?.rows?.map((r) => {
                const isToday = r.day === todayDay;
                const hasNum = (val) => val && val !== 'XX' && val !== '--';
                return (
                  <tr key={r.day} className={isToday ? 'today-row' : ''}>
                    <td><b>{r.day}</b></td>
                    <td className={hasNum(r.DS) ? 'has-num' : ''}>{r.DS === 'XX' && isToday ? <SpinnerIcon /> : (r.DS || '—')}</td>
                    <td className={hasNum(r.FB) ? 'has-num' : ''}>{r.FB === 'XX' && isToday ? <SpinnerIcon /> : (r.FB || '—')}</td>
                    <td className={hasNum(r.GB) ? 'has-num' : ''}>{r.GB === 'XX' && isToday ? <SpinnerIcon /> : (r.GB || '—')}</td>
                    <td className={hasNum(r.GL) ? 'has-num' : ''}>{r.GL === 'XX' && isToday ? <SpinnerIcon /> : (r.GL || '—')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="royal-nav-btns">
            <button
              className="royal-btn"
              onClick={() => goToMonth(String(prevMIdx + 1).padStart(2, '0'), String(prevYear))}
            >
              ← पिछला महीना ({MONTH_NAMES[prevMIdx]?.substring(0, 3)} {prevYear})
            </button>
            <button
              className="royal-btn"
              onClick={() => goToMonth(String(nextMIdx + 1).padStart(2, '0'), String(nextYear))}
            >
              अगला महीना ({MONTH_NAMES[nextMIdx]?.substring(0, 3)} {nextYear}) →
            </button>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="royal-footer">
          <p style={{ color: 'var(--gold-2)', marginBottom: 12 }}>SATTA KING MAX ROYAL EDITION &bull; 2026</p>
          <div style={{ marginBottom: 16 }}>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-wa-festive">
              💬 24x7 WhatsApp सेवा: {WHATSAPP_NUMBER}
            </a>
          </div>
          <div>
            <select
              value={chartMonth}
              onChange={e => setChartMonth(e.target.value)}
              aria-label="Select month"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
              ))}
            </select>
            <select
              value={chartYear}
              onChange={e => setChartYear(e.target.value)}
              aria-label="Select year"
            >
              {[2026, 2025, 2024, 2023, 2022].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </footer>
      </div>

      {/* FLOATING WHATSAPP BUTTON */}
      <div className="floating-wa">
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="festive-fab-wa">
          💬 WhatsApp
        </a>
      </div>

      {/* FAB */}
      <div className="floating-bar">
        <button className="festive-fab" onClick={() => window.location.reload()}>
          ↻ ताज़ा करें
        </button>
      </div>
    </div>
  );
}
