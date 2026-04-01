/* ─── STATE ─── */
let cvFile = null;
let cvText = '';
let currentStep = 1;

// --- EXTRACT DOCX TEXT ---
function readDocx(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const arrayBuffer = event.target.result;
        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
            .then(function (result) {
                cvText = result.value;
            })
            .catch(err => console.error(err));
    };
    reader.readAsArrayBuffer(file);
}

// --- EXTRACT PDF TEXT ---
async function readPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // Join individual text items into a string
        const pageText = textContent.items.map(item => item.str).join(" ");
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }
    cvText = fullText;
}

/* ─── STEP NAVIGATION ─── */
function goToStep(step) {
    currentStep = step;
    ['upload', 'job', 'loading', 'results'].forEach((name, i) => {
        document.getElementById('panel-' + name).classList.toggle('active', i + 1 === step);
    });
    // Update step bar
    for (let i = 1; i <= 3; i++) {
        const circle = document.getElementById('sc' + i);
        const label = document.getElementById('sl' + i);
        circle.classList.remove('active', 'done');
        label.classList.remove('active');
        if (i < step) { circle.classList.add('done'); circle.innerHTML = ''; }
        else if (i === step) { circle.classList.add('active'); label.classList.add('active'); if (circle.innerHTML === '') circle.innerHTML = '<span>' + i + '</span>'; }
        else { if (circle.innerHTML === '') circle.innerHTML = '<span>' + i + '</span>'; }
        if (i < 3) {
            document.getElementById('cn' + i).classList.toggle('done', i < step);
        }
    }
}

/* ─── FILE UPLOAD ─── */
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('cv-file');

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });

function handleFile(file) {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(file.type) && !['pdf', 'doc', 'docx'].includes(ext)) return alert('Please upload a PDF or DOCX file.');
    if (file.size > 2 * 1024 * 1024) return alert('File must be under 2 MB.');
    cvFile = file;
    document.getElementById('file-name-display').textContent = file.name;
    document.getElementById('file-size-display').textContent = (file.size / 1024).toFixed(0) + ' KB';
    document.getElementById('file-selected').classList.add('show');
    document.getElementById('btn-step1').disabled = false;

    if (file.type === "application/pdf") {
        readPDF(file);
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        readDocx(file);
    }
}

document.getElementById('file-remove').addEventListener('click', () => {
    cvFile = null; cvText = '';
    fileInput.value = '';
    document.getElementById('file-selected').classList.remove('show');
    document.getElementById('btn-step1').disabled = true;
});

/* ─── JOB DESC ─── */
function updateCharCount() {
    const val = document.getElementById('job-desc').value;
    document.getElementById('char-count').textContent = val.length;
    document.getElementById('btn-step2').disabled = val.trim().length < 200;    //minimum 200 characters
}

/* ─── ANALYSIS ─── */
async function startAnalysis() {
    console.log(cvText);
    goToStep(3);
    const jobDesc = document.getElementById('job-desc').value;
    animateLoadingSteps();

    const prompt = `You are an expert CV/resume analyst and career coach. A user has submitted their CV and a job description for analysis. Provide a thorough, structured analysis.

CV CONTENT (may be partial text extraction):
"""
${cvText.substring(0, 4000) || '[File uploaded - analyze based on typical CV structure and the job requirements]'}
"""

JOB DESCRIPTION:
"""
${jobDesc.substring(0, 3000)}
"""

Analyze and respond with ONLY a valid JSON object (no markdown, no code fences) in this exact structure:
{
  "overallScore": <number 0-100>,
  "grade": "<Excellent|Strong|Good|Needs Work|Poor>",
  "summary": "<2-3 sentence honest assessment>",
  "topStrength": "<one key strength>",
  "topWeakness": "<one key area to improve>",
  "categories": [
    {
      "name": "ATS Compatibility",
      "icon": "ats",
      "score": <0-100>,
      "checks": [
        {"name": "<check name>", "status": "<pass|warn|fail>", "detail": "<specific actionable feedback>"},
        {"name": "<check name>", "status": "<pass|warn|fail>", "detail": "<specific actionable feedback>"},
        {"name": "<check name>", "status": "<pass|warn|fail>", "detail": "<specific actionable feedback>"}
      ]
    },
    {
      "name": "Keyword Match",
      "icon": "keywords",
      "score": <0-100>,
      "matchedKeywords": ["<kw1>","<kw2>","<kw3>","<kw4>","<kw5>"],
      "missingKeywords": ["<kw1>","<kw2>","<kw3>","<kw4>","<kw5>"],
      "checks": [
        {"name": "<check name>", "status": "<pass|warn|fail>", "detail": "<specific actionable feedback>"},
        {"name": "<check name>", "status": "<pass|warn|fail>", "detail": "<specific actionable feedback>"}
      ]
    },
    {
      "name": "Content Quality",
      "icon": "content",
      "score": <0-100>,
      "checks": [
        {"name": "<check name>", "status": "<pass|warn|fail>", "detail": "<specific actionable feedback>"},
        {"name": "<check name>", "status": "<pass|warn|fail>", "detail": "<specific actionable feedback>"},
        {"name": "<check name>", "status": "<pass|warn|fail>", "detail": "<specific actionable feedback>"}
      ]
    },
    {
      "name": "Formatting & Structure",
      "icon": "format",
      "score": <0-100>,
      "checks": [
        {"name": "<check name>", "status": "<pass|warn|fail>", "detail": "<specific actionable feedback>"},
        {"name": "<check name>", "status": "<pass|warn|fail>", "detail": "<specific actionable feedback>"}
      ]
    }
  ]
}`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1800,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) throw new Error('API error ' + response.status);
        const data = await response.json();
        const rawText = data.content.map(b => b.text || '').join('');

        let analysis;
        try {
            const clean = rawText.replace(/```json|```/g, '').trim();
            analysis = JSON.parse(clean);
        } catch (e) {
            throw new Error('Could not parse analysis response.');
        }

        renderResults(analysis, jobTitle, jobCompany);
    } catch (err) {
        document.getElementById('loading-wrap') && (document.querySelector('#panel-loading .loading-wrap').style.opacity = '0.4');
        document.getElementById('error-container').innerHTML = `
      <div class="error-box">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div><strong>Analysis failed:</strong> ${err.message}. Please try again or check your connection.</div>
      </div>
      <div class="action-row" style="margin-top:1.5rem;">
        <button class="btn-back" onclick="goToStep(2)" style="margin-left:auto;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to edit
        </button>
      </div>`;
    }
}

/* ─── LOADING ANIMATION ─── */
function animateLoadingSteps() {
    const delays = [0, 2000, 5000, 8000, 12000, 16000];
    delays.forEach((delay, i) => {
        setTimeout(() => {
            if (i > 0) { const prev = document.getElementById('ls' + (i - 1)); if (prev) { prev.classList.remove('active'); prev.classList.add('done'); } }
            const curr = document.getElementById('ls' + i);
            if (curr) curr.classList.add('active');
        }, delay);
    });
}

/* ─── RENDER RESULTS ─── */
const catIcons = {
    ats: `<svg viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"/></svg>`,
    keywords: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    content: `<svg viewBox="0 0 24 24"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>`,
    format: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`
};
const catColors = { ats: 'teal', keywords: 'coral', content: 'amber', format: 'blue' };
const catFills = { teal: '#1D9E75', coral: '#D85A30', amber: '#BA7517', blue: '#185FA5' };

function renderResults(data, title, company) {
    goToStep(3);
    setTimeout(() => {
        goToStep(4);
        // Score ring
        const score = Math.max(0, Math.min(100, data.overallScore || 0));
        const circumference = 188.5;
        const offset = circumference - (score / 100) * circumference;
        const fill = document.getElementById('score-ring-fill');
        fill.style.strokeDashoffset = circumference;
        const colorClass = score >= 75 ? '' : score >= 50 ? 'amber' : 'red';
        fill.classList.add(colorClass);
        document.getElementById('score-num').textContent = score;
        document.getElementById('score-grade').textContent = data.grade || 'Score';
        const subtitle = title ? `for ${title}${company ? ' at ' + company : ''}` : 'Overall assessment';
        document.getElementById('score-label').textContent = subtitle;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => { fill.style.strokeDashoffset = offset; });
        });

        // Build content
        let html = '';

        // Summary callouts
        if (data.topStrength) {
            html += `<div class="result-callout callout-success"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg><div><strong>Top strength:</strong> ${esc(data.topStrength)}</div></div>`;
        }
        if (data.topWeakness) {
            html += `<div class="result-callout callout-warn"><svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><div><strong>Key improvement:</strong> ${esc(data.topWeakness)}</div></div>`;
        }

        // Categories
        (data.categories || []).forEach(cat => {
            const iconKey = cat.icon || 'ats';
            const color = catColors[iconKey] || 'teal';
            const fillColor = catFills[color] || '#1D9E75';
            const catScore = Math.max(0, Math.min(100, cat.score || 0));
            const barColor = catScore >= 70 ? '#1D9E75' : catScore >= 45 ? '#BA7517' : '#D85A30';
            html += `<div class="category-section">
        <div class="cat-header">
          <div class="cat-icon" style="background:var(--${color}-light); color:${fillColor}">${catIcons[iconKey] || catIcons.ats}</div>
          <div class="cat-title">${esc(cat.name)}</div>
          <div style="font-size:0.78rem;font-weight:600;color:${barColor};margin-right:8px;">${catScore}%</div>
          <div class="cat-score-bar"><div class="cat-score-fill" style="width:${catScore}%;background:${barColor};"></div></div>
        </div>`;

            // Keyword pills
            if (cat.matchedKeywords || cat.missingKeywords) {
                html += `<div style="margin-bottom:0.75rem;">`;
                if (cat.matchedKeywords?.length) {
                    html += `<div class="kw-label">✓ Found in your CV</div><div class="keywords-wrap">${cat.matchedKeywords.map(k => `<span class="kw-pill kw-match">${esc(k)}</span>`).join('')}</div>`;
                }
                if (cat.missingKeywords?.length) {
                    html += `<div class="kw-label">✗ Missing from your CV</div><div class="keywords-wrap">${cat.missingKeywords.map(k => `<span class="kw-pill kw-missing">${esc(k)}</span>`).join('')}</div>`;
                }
                html += `</div>`;
            }

            // Checks
            (cat.checks || []).forEach(chk => {
                const badgeClass = chk.status === 'pass' ? 'badge-pass' : chk.status === 'warn' ? 'badge-warn' : 'badge-fail';
                html += `<div class="check-item">
          <div class="check-badge ${badgeClass}"><svg viewBox="0 0 12 12">${chk.status === 'pass' ? '<polyline points="2,6 5,9 10,3"/>' : chk.status === 'warn' ? '<line x1="6" y1="3" x2="6" y2="7"/><line x1="6" y1="9" x2="6" y2="9.5"/>' : '<line x1="3" y1="3" x2="9" y2="9"/><line x1="9" y1="3" x2="3" y2="9"/>'}</svg></div>
          <div class="check-body">
            <div class="check-name">${esc(chk.name)}</div>
            <div class="check-detail">${esc(chk.detail)}</div>
          </div>
        </div>`;
            });
            html += `</div>`;
        });

        document.getElementById('results-content').innerHTML = html;
    }, 500);
}

function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ─── RESET ─── */
function resetAll() {
    cvFile = null; cvText = '';
    document.getElementById('cv-file').value = '';
    document.getElementById('file-selected').classList.remove('show');
    document.getElementById('btn-step1').disabled = true;
    document.getElementById('job-desc').value = '';
    document.getElementById('job-title').value = '';
    document.getElementById('job-company').value = '';
    document.getElementById('char-count').textContent = '0';
    document.getElementById('btn-step2').disabled = true;
    document.getElementById('error-container').innerHTML = '';
    document.getElementById('results-content').innerHTML = '';
    document.querySelectorAll('#loading-steps li').forEach(li => { li.classList.remove('active', 'done'); });
    document.getElementById('ls0').classList.add('active');
    // Re-add circle numbers
    for (let i = 1; i <= 3; i++) {
        const c = document.getElementById('sc' + i);
        c.innerHTML = '<span>' + i + '</span>';
    }
    goToStep(1);
}