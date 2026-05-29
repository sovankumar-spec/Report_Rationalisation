/**
 * generate-ceo-ppt.mjs
 * Creates a 5-slide CEO-ready PowerPoint for the Report Rationalizer platform.
 * Run: node scripts/generate-ceo-ppt.mjs
 */

import PptxGenJS from 'pptxgenjs';

const prs = new PptxGenJS();
prs.layout  = 'LAYOUT_WIDE';   // 13.33" × 7.5"
prs.title   = 'Report Rationalizer — CEO Briefing';
prs.subject = 'Enterprise BI Modernization';
prs.author  = 'Report Rationalizer Platform';

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  navy:   '0D1B3E',  navyM:  '1A3260',  navyL:  '2A4A7F',
  blue:   '1D4ED8',  blueM:  '3B82F6',  blueL:  'DBEAFE',
  green:  '14532D',  greenM: '16A34A',  greenL: 'DCFCE7',  greenT: 'BBF7D0',
  amber:  '78350F',  amberM: 'D97706',  amberL: 'FEF3C7',  amberT: 'FDE68A',
  red:    '7F1D1D',  redM:   'DC2626',  redL:   'FEE2E2',  redT:   'FECACA',
  white:  'FFFFFF',  bg:     'F8FAFC',
  textD:  '111827',  textM:  '374151',  textL:  '6B7280',
  line:   'E5E7EB',  lineM:  'CBD5E0',  divider:'E2E8F0',
};

// ── Shared layout helpers ─────────────────────────────────────────────────────

function hdr(slide, title, sub = '') {
  slide.addShape('rect', { x:0, y:0, w:13.33, h:1.2, fill:{color:C.navy}, line:{color:C.navy} });
  // Accent pip on left edge
  slide.addShape('rect', { x:0, y:0, w:0.07, h:1.2, fill:{color:C.blueM}, line:{color:C.blueM} });
  slide.addText(title, { x:0.4, y:0.08, w:12.5, h:0.62, fontSize:24, fontFace:'Calibri', color:C.white, bold:true });
  if (sub) slide.addText(sub, { x:0.4, y:0.73, w:12.5, h:0.38, fontSize:11, fontFace:'Calibri', color:'94A3B8' });
  // Accent underline
  slide.addShape('rect', { x:0, y:1.2, w:13.33, h:0.045, fill:{color:C.blue}, line:{color:C.blue} });
}

function ftr(slide) {
  slide.addShape('rect', { x:0, y:7.22, w:13.33, h:0.28, fill:{color:C.navyM}, line:{color:C.navyM} });
  slide.addText(
    'Report Rationalizer  ·  Enterprise BI Modernization Program  ·  Confidential',
    { x:0.3, y:7.23, w:12.7, h:0.25, fontSize:7.5, fontFace:'Calibri', color:'64748B', italic:true }
  );
}

function card(slide, x, y, w, h, opts = {}) {
  // Shadow
  slide.addShape('rect', { x:x+0.05, y:y+0.05, w, h, fill:{color:'D1D5DB'}, line:{color:'D1D5DB'} });
  // Card body
  slide.addShape('rect', { x, y, w, h,
    fill:{ color: opts.bg   ?? C.white },
    line:{ color: opts.bord ?? C.line, pt:1 },
  });
  if (opts.topBarColor) {
    slide.addShape('rect', { x, y, w, h:0.06, fill:{color:opts.topBarColor}, line:{color:opts.topBarColor} });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Title
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  s.background = { color: C.navy };

  // Left accent bar
  s.addShape('rect', { x:0, y:0, w:0.08, h:7.5, fill:{color:C.blue}, line:{color:C.blue} });

  // Right decorative panel
  s.addShape('rect', { x:9.5, y:0, w:3.83, h:7.5, fill:{color:C.navyM}, line:{color:C.navyM} });

  // Subtle grid lines in right panel
  for (let i = 0; i < 6; i++) {
    s.addShape('rect', { x:9.65, y:0.4 + i*1.17, w:3.55, h:0.018, fill:{color:'203A6B'}, line:{color:'203A6B'} });
  }

  // RR badge
  s.addShape('rect', { x:0.38, y:1.1, w:0.72, h:0.72, fill:{color:C.blue}, line:{color:C.blue} });
  s.addText('RR', { x:0.38, y:1.1, w:0.72, h:0.72, fontSize:15, fontFace:'Calibri', color:C.white, bold:true, align:'center', valign:'middle' });

  // Main title
  s.addText('Report Rationalizer', {
    x:0.38, y:2.05, w:8.8, h:1.1,
    fontSize:46, fontFace:'Calibri', color:C.white, bold:true,
  });

  // Subtitle
  s.addText('Enterprise BI Modernization Workbench', {
    x:0.38, y:3.2, w:8.8, h:0.58,
    fontSize:20, fontFace:'Calibri', color:'93C5FD',
  });

  // Divider
  s.addShape('rect', { x:0.38, y:3.92, w:5.8, h:0.045, fill:{color:C.blue}, line:{color:C.blue} });

  // Program tag
  s.addText('BI Portfolio Rationalization Program  ·  Automated Disposition at Scale', {
    x:0.38, y:4.05, w:8.8, h:0.4,
    fontSize:13, fontFace:'Calibri', color:'60A5FA',
  });

  // Date / confidential
  s.addText('May 2026  ·  Confidential', {
    x:0.38, y:6.9, w:4, h:0.3,
    fontSize:10, fontFace:'Calibri', color:'475569',
  });

  // Right panel decorative text
  s.addText('Analyze.\nDecide.\nModernize.', {
    x:9.7, y:2.2, w:3.4, h:3.2,
    fontSize:30, fontFace:'Calibri', color:'1E3A6E', bold:true,
    align:'center', valign:'middle',
  });

  // Disposition badges in right panel
  const badges = [
    { y:5.8, label:'Rationalize', bg:C.greenM },
    { y:6.25, label:'Consolidate', bg:C.amberM },
    { y:6.70, label:'Migrate',     bg:C.redM   },
  ];
  badges.forEach(b => {
    s.addShape('rect', { x:9.8, y:b.y, w:3.2, h:0.35, fill:{color:b.bg}, line:{color:b.bg} });
    s.addText(b.label, { x:9.8, y:b.y, w:3.2, h:0.35, fontSize:12, fontFace:'Calibri', color:C.white, bold:true, align:'center', valign:'middle' });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — The Business Challenge
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  s.background = { color: C.bg };
  hdr(s, 'The Business Challenge', 'Why BI report rationalization is a strategic priority now');
  ftr(s);

  const challenges = [
    {
      x:0.22, topColor:C.redM, headBg:C.redL,
      title:'Report Sprawl',
      icon:'⚠',
      body:'Hundreds of legacy reports with overlapping KPIs, duplicate logic, and inconsistent definitions circulate across business units — creating analyst confusion and data trust issues.',
      impact:'200+ reports  →  Unknown overlap',
    },
    {
      x:4.58, topColor:C.amberM, headBg:C.amberL,
      title:'Manual Analysis Bottleneck',
      icon:'⏱',
      body:'Each source-to-target comparison requires 2–4 engineer-days of manual review: reading SQL, mapping KPIs, and documenting findings — with no reproducibility guarantee.',
      impact:'~3 days/report  ×  200+  =  months of effort',
    },
    {
      x:8.94, topColor:C.blue, headBg:C.blueL,
      title:'No Consistent Framework',
      icon:'❓',
      body:'Without a defined, algorithmic framework for retire vs. rebuild decisions, every disposition is a judgment call. This creates governance risk, migration delays, and unbudgeted rework.',
      impact:'Subjective decisions  →  Audit risk',
    },
  ];

  challenges.forEach(ch => {
    card(s, ch.x, 1.35, 4.1, 5.6, { topBarColor: ch.topColor });

    // Title bar
    s.addShape('rect', { x:ch.x, y:1.35, w:4.1, h:1.05, fill:{color:ch.headBg}, line:{color:ch.topColor, pt:0.5} });
    s.addText(ch.title, {
      x:ch.x+0.18, y:1.5, w:3.74, h:0.5,
      fontSize:16, fontFace:'Calibri', color:C.textD, bold:true,
    });

    // Body
    s.addText(ch.body, {
      x:ch.x+0.18, y:2.52, w:3.74, h:2.8,
      fontSize:12, fontFace:'Calibri', color:C.textM, align:'left', valign:'top',
    });

    // Impact strip
    s.addShape('rect', { x:ch.x, y:6.57, w:4.1, h:0.38, fill:{color:ch.topColor}, line:{color:ch.topColor} });
    s.addText(ch.impact, {
      x:ch.x+0.1, y:6.58, w:3.9, h:0.36,
      fontSize:10, fontFace:'Calibri', color:C.white, bold:true, align:'center', valign:'middle',
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — The Intelligence Engine
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  s.background = { color: C.bg };
  hdr(s, 'The Intelligence Engine: KPI Overlap Scoring', 'Deterministic algorithm — same inputs always produce the same disposition');
  ftr(s);

  const steps = [
    {
      x:0.22, num:'01', numBg:C.blue,
      title:'Ingest',
      icon:'\u{1F4C2}',
      body:'Point to any folder of source and reference reports. No manual conversion required.\n\nSupported formats:\n• SQL query files (.sql)\n• Spreadsheets (.xlsx, .xls)\n• Comma-separated data (.csv)\n• Power BI Desktop (.pbix)\n• Tableau Workbooks (.twbx/.twb)\n• Qlik Sense Apps (.qvf)',
    },
    {
      x:4.58, num:'02', numBg:C.navyL,
      title:'Extract & Match',
      icon:'\u{1F50D}',
      body:'For each source report the engine extracts:\n\n• KPI alias names (what the metric is called)\n• Underlying column names (what data it reads)\n• Source table names (which data assets it touches)\n\nThese are matched against every reference report to produce a pairwise overlap matrix.',
    },
    {
      x:8.94, num:'03', numBg:C.greenM,
      title:'Score & Decide',
      icon:'✅',
      body:'A weighted composite overlap score is computed for each source–target pair:\n\n• KPI Name Match  ×  50 %\n• Column Match     ×  30 %\n• Table Match      ×  20 %\n\nThe best-scoring reference becomes the target match. The score maps to one of the three dispositions.',
    },
  ];

  steps.forEach((st, i) => {
    card(s, st.x, 1.35, 4.1, 4.92, {});

    // Number badge
    s.addShape('ellipse', { x:st.x+1.45, y:1.45, w:1.2, h:1.2, fill:{color:st.numBg}, line:{color:st.numBg} });
    s.addText(st.num, { x:st.x+1.45, y:1.45, w:1.2, h:1.2, fontSize:26, fontFace:'Calibri', color:C.white, bold:true, align:'center', valign:'middle' });

    // Step title
    s.addText(st.title, {
      x:st.x+0.15, y:2.78, w:3.8, h:0.48,
      fontSize:17, fontFace:'Calibri', color:C.textD, bold:true, align:'center',
    });

    // Body
    s.addText(st.body, {
      x:st.x+0.18, y:3.32, w:3.74, h:2.8,
      fontSize:11, fontFace:'Calibri', color:C.textM, valign:'top',
    });

    // Connector arrow (between boxes)
    if (i < 2) {
      s.addShape('rect', { x:st.x+4.18, y:2.9, w:0.32, h:0.07, fill:{color:C.lineM}, line:{color:C.lineM} });
      s.addText('▶', { x:st.x+4.28, y:2.82, w:0.2, h:0.25, fontSize:10, fontFace:'Calibri', color:C.lineM, align:'center' });
    }
  });

  // Algorithm formula bar
  s.addShape('rect', { x:0, y:6.38, w:13.33, h:0.84, fill:{color:C.navy}, line:{color:C.navy} });
  s.addText([
    { text:'Overlap Score  =  ', options:{ color:'94A3B8', fontSize:13 } },
    { text:'KPI Name Match × 50%', options:{ color:'93C5FD', bold:true, fontSize:13 } },
    { text:'  +  ', options:{ color:'94A3B8', fontSize:13 } },
    { text:'Column Match × 30%', options:{ color:'6EE7B7', bold:true, fontSize:13 } },
    { text:'  +  ', options:{ color:'94A3B8', fontSize:13 } },
    { text:'Table Match × 20%', options:{ color:'FCD34D', bold:true, fontSize:13 } },
    { text:'   →   0–100% score   →   One disposition per report, every time', options:{ color:'64748B', fontSize:11 } },
  ], { x:0.4, y:6.4, w:12.6, h:0.76, fontFace:'Calibri', align:'center', valign:'middle' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — Decision Framework
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  s.background = { color: C.bg };
  hdr(s, 'The Decision Framework: Three Outcomes, No Subjectivity', 'Every source report receives one of three deterministic dispositions based on KPI overlap score');
  ftr(s);

  const decisions = [
    {
      x:0.22,
      pct:'100%', pctColor:'4ADE80',
      label:'RATIONALIZE',
      tagline:'Full Coverage — Retire the Source',
      hdrBg:C.green,  cardBg:C.greenL, bord:C.greenM,
      bullets:[
        'Every source KPI exists in the reference report',
        'Zero new development required',
        'Retire source after parallel-run validation',
        'Sign-off, documentation, and decommission',
        'Fastest path to portfolio reduction',
      ],
      effortBg: C.greenM,
      effort:'Effort: ~0 engineer-days',
    },
    {
      x:4.58,
      pct:'70 – 99%', pctColor:'FCD34D',
      label:'CONSOLIDATE',
      tagline:'Partial Coverage — Extend the Target',
      hdrBg:C.amber,  cardBg:C.amberL, bord:C.amberM,
      bullets:[
        'Most source KPIs already exist in reference',
        'Small number of gap KPIs must be added',
        'Extend reference report to absorb gaps',
        'Source decommissioned after sign-off',
        'Low-to-moderate engineering effort',
      ],
      effortBg: C.amberM,
      effort:'Effort: 1–3 days per gap KPI',
    },
    {
      x:8.94,
      pct:'< 70%', pctColor:'FCA5A5',
      label:'MIGRATE',
      tagline:'Insufficient Coverage — Rebuild',
      hdrBg:C.red,  cardBg:C.redL, bord:C.redM,
      bullets:[
        'Source KPI set has insufficient match in target',
        'Cannot be absorbed without major rework',
        'Build net-new reference artifacts on target platform',
        'Prioritize by business usage frequency',
        'Highest engineering effort — plan carefully',
      ],
      effortBg: C.redM,
      effort:'Effort: 3–10 days per unmatched KPI',
    },
  ];

  decisions.forEach(d => {
    // Card with colored bg
    card(s, d.x, 1.32, 4.1, 5.78, { bg:d.cardBg, bord:d.bord });

    // Header block
    s.addShape('rect', { x:d.x, y:1.32, w:4.1, h:1.45, fill:{color:d.hdrBg}, line:{color:d.hdrBg} });

    // Overlap % (large)
    s.addText(d.pct, {
      x:d.x+0.1, y:1.34, w:3.9, h:0.78,
      fontSize:34, fontFace:'Calibri', color:d.pctColor, bold:true, align:'center',
    });

    // Label badge
    s.addShape('rect', { x:d.x+0.6, y:2.06, w:2.9, h:0.52, fill:{color:d.hdrBg}, line:{color:d.pctColor, pt:1} });
    s.addText(d.label, {
      x:d.x+0.6, y:2.06, w:2.9, h:0.52,
      fontSize:14, fontFace:'Calibri', color:d.pctColor, bold:true, align:'center', valign:'middle',
    });

    // Tagline
    s.addText(d.tagline, {
      x:d.x+0.15, y:2.72, w:3.8, h:0.42,
      fontSize:11, fontFace:'Calibri', color:C.textD, bold:true, align:'center', italic:true,
    });

    // Bullets
    const bulletArr = d.bullets.map(b => ({ text:b, options:{ bullet:true } }));
    s.addText(bulletArr, {
      x:d.x+0.22, y:3.22, w:3.66, h:2.55,
      fontSize:11, fontFace:'Calibri', color:C.textM, valign:'top',
    });

    // Effort footer
    s.addShape('rect', { x:d.x, y:6.68, w:4.1, h:0.42, fill:{color:d.effortBg}, line:{color:d.effortBg} });
    s.addText(d.effort, {
      x:d.x+0.1, y:6.69, w:3.9, h:0.4,
      fontSize:10.5, fontFace:'Calibri', color:C.white, bold:true, align:'center', valign:'middle',
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — Results & Strategic Value
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  s.background = { color: C.bg };
  hdr(s, 'Results & Strategic Value', '10 CSV source reports analyzed automatically — all three disposition outcomes confirmed');
  ftr(s);

  // ── Left: Results table ───────────────────────────────────────────────────
  card(s, 0.22, 1.32, 7.0, 5.78, {});

  s.addText('Live Analysis — 10 Source Reports (CSV Format)', {
    x:0.38, y:1.42, w:6.68, h:0.42,
    fontSize:12.5, fontFace:'Calibri', color:C.textD, bold:true, align:'center',
  });

  // Column headers
  s.addShape('rect', { x:0.22, y:1.9, w:7.0, h:0.38, fill:{color:C.navy}, line:{color:C.navy} });
  [['0.32','2.2','Report Name'],['3.22','1.8','Domain'],['5.12','1.0','Overlap'],['6.1','1.0','Decision']].forEach(([x,w,t]) => {
    s.addText(t, { x:Number(x), y:1.91, w:Number(w), h:0.36, fontSize:10, fontFace:'Calibri', color:C.white, bold:true, valign:'middle' });
  });

  const rows = [
    { id:'src-01', name:'Billing Revenue Summary',    domain:'Finance',          pct:'100%', dec:'Rationalize', dc:C.greenM, db:C.greenL },
    { id:'src-02', name:'Subscriber Churn Report',    domain:'Customer Success', pct:'100%', dec:'Rationalize', dc:C.greenM, db:C.greenL },
    { id:'src-03', name:'Sales Core Metrics',         domain:'Sales',            pct:'100%', dec:'Rationalize', dc:C.greenM, db:C.greenL },
    { id:'src-04', name:'Billing Extended KPIs',      domain:'Finance',          pct:' 80%', dec:'Consolidate', dc:C.amberM, db:C.amberL },
    { id:'src-05', name:'Network Site Performance',   domain:'Network Ops',      pct:' 80%', dec:'Consolidate', dc:C.amberM, db:C.amberL },
    { id:'src-06', name:'Deal Funnel Analytics',      domain:'Sales',            pct:' 84%', dec:'Consolidate', dc:C.amberM, db:C.amberL },
    { id:'src-07', name:'Campaign Performance',       domain:'Marketing',        pct:' 84%', dec:'Consolidate', dc:C.amberM, db:C.amberL },
    { id:'src-08', name:'HR Workforce Analytics',     domain:'Human Resources',  pct:'  0%', dec:'Migrate',     dc:C.redM,   db:C.redL   },
    { id:'src-09', name:'Legal Contract Intelligence',domain:'Legal',            pct:'  0%', dec:'Migrate',     dc:C.redM,   db:C.redL   },
    { id:'src-10', name:'Supply Chain Operations',    domain:'Supply Chain',     pct:'  0%', dec:'Migrate',     dc:C.redM,   db:C.redL   },
  ];

  rows.forEach((r, i) => {
    const ry = 2.33 + i * 0.47;
    const rowBg = i % 2 === 0 ? C.white : 'F1F5F9';
    s.addShape('rect', { x:0.22, y:ry, w:7.0, h:0.46, fill:{color:rowBg}, line:{color:C.line, pt:0.5} });
    s.addText(r.id,    { x:0.32, y:ry+0.05, w:0.82, h:0.36, fontSize:9,  fontFace:'Calibri', color:C.textL, italic:true });
    s.addText(r.name,  { x:1.16, y:ry+0.05, w:2.0,  h:0.36, fontSize:9.5,fontFace:'Calibri', color:C.textD });
    s.addText(r.domain,{ x:3.22, y:ry+0.05, w:1.8,  h:0.36, fontSize:9.5,fontFace:'Calibri', color:C.textM });
    s.addText(r.pct,   { x:5.12, y:ry+0.05, w:0.9,  h:0.36, fontSize:10, fontFace:'Calibri', color:r.dc, bold:true, align:'center' });
    // Decision pill
    s.addShape('rect',{ x:6.1, y:ry+0.07, w:1.0, h:0.32, fill:{color:r.db}, line:{color:r.dc, pt:0.5} });
    s.addText(r.dec,  { x:6.1, y:ry+0.07, w:1.0, h:0.32, fontSize:8.5, fontFace:'Calibri', color:r.dc, bold:true, align:'center', valign:'middle' });
  });

  // Summary bar at bottom of table
  s.addShape('rect', { x:0.22, y:7.03, w:7.0, h:0.07, fill:{color:C.divider}, line:{color:C.divider} });
  [
    { x:0.5,  w:2.0, t:'3  Rationalize', c:C.greenM },
    { x:2.9,  w:2.0, t:'4  Consolidate', c:C.amberM },
    { x:5.2,  w:2.0, t:'3  Migrate',     c:C.redM   },
  ].forEach(b => {
    s.addText(b.t, { x:b.x, y:7.05, w:b.w, h:0.12, fontSize:9, fontFace:'Calibri', color:b.c, bold:true, align:'center' });
  });

  // ── Right: Strategic value panel ──────────────────────────────────────────
  s.addShape('rect', { x:7.45, y:1.32, w:5.65, h:5.78, fill:{color:C.navy}, line:{color:C.navy} });
  s.addText('Strategic Value', { x:7.65, y:1.45, w:5.25, h:0.48, fontSize:15, fontFace:'Calibri', color:C.white, bold:true });
  s.addShape('rect', { x:7.65, y:1.98, w:5.05, h:0.035, fill:{color:C.navyL}, line:{color:C.navyL} });

  const values = [
    { icon:'⚡', head:'Instant Analysis',       rest:'\nDays of manual effort reduced to seconds per report.' },
    { icon:'🎯', head:'No Subjectivity',  rest:'\nSame inputs → same disposition, always. Algorithm-driven.' },
    { icon:'📋', head:'Audit-Ready',       rest:'\nConfidence scores, KPI gap lists, and AI rationale on every decision.' },
    { icon:'🔌', head:'Format Agnostic',   rest:'\nSQL, CSV, Excel, Power BI, Tableau, Qlik — native ingestion.' },
    { icon:'💰', head:'Cost Transparency', rest:'\nEffort estimates per outcome enable precise project budgeting.' },
  ];

  values.forEach((v, i) => {
    const vy = 2.12 + i * 0.98;
    s.addShape('rect', { x:7.55, y:vy, w:5.45, h:0.88, fill:{color:'0F2447'}, line:{color:C.navyL, pt:0.5} });
    s.addText([
      { text:v.icon+'  ', options:{ fontSize:15 } },
      { text:v.head,      options:{ bold:true, color:'93C5FD', fontSize:12 } },
      { text:v.rest,      options:{ color:'94A3B8', fontSize:10.5 } },
    ], { x:7.7, y:vy+0.04, w:5.15, h:0.8, fontFace:'Calibri', valign:'top' });
  });
}

// ── Save ──────────────────────────────────────────────────────────────────────
const outFile = 'C:/Users/sovan/OneDrive/Desktop/Report_Rationalizer_CEO.pptx';
await prs.writeFile({ fileName: outFile });
console.log('✅ Saved:', outFile);
