// ============================================
// DOM Elements
// ============================================
const textInput = document.getElementById('textInput');

// Live counters
const liveChars = document.getElementById('liveChars');
const liveWords = document.getElementById('liveWords');
const liveReadTime = document.getElementById('liveReadTime');

// Statistics
const totalChars = document.getElementById('totalChars');
const charsNoSpace = document.getElementById('charsNoSpace');
const wordCount = document.getElementById('wordCount');
const sentenceCount = document.getElementById('sentenceCount');
const paragraphCount = document.getElementById('paragraphCount');
const avgSentence = document.getElementById('avgSentence');

// Reading time
const readingTime = document.getElementById('readingTime');

// Character breakdown
const koreanCount = document.getElementById('koreanCount');
const englishCount = document.getElementById('englishCount');
const numberCount = document.getElementById('numberCount');
const specialCount = document.getElementById('specialCount');

// Keywords
const keywordsContainer = document.getElementById('keywords');

// Readability
const readabilityScore = document.getElementById('readabilityScore');
const readabilityDesc = document.getElementById('readabilityDesc');
const readabilityTips = document.getElementById('readabilityTips');

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Load saved text if any
    const savedText = localStorage.getItem('writing-analyzer-text');
    if (savedText) {
        textInput.value = savedText;
    }

    // Add input listener
    textInput.addEventListener('input', () => {
        analyzeText();
        // Save to localStorage
        localStorage.setItem('writing-analyzer-text', textInput.value);
    });

    // Initial analysis
    analyzeText();
});

// ============================================
// Main Analysis Function
// ============================================
function analyzeText() {
    const text = textInput.value;

    // Basic statistics
    const stats = getBasicStats(text);
    updateBasicStats(stats);

    // Character breakdown
    const charBreakdown = analyzeCharacters(text);
    updateCharacterBreakdown(charBreakdown);

    // Keywords
    const keywords = extractKeywords(text);
    displayKeywords(keywords);

    // Readability
    const readability = calculateReadability(stats);
    displayReadability(readability);
}

// ============================================
// Basic Statistics
// ============================================
function getBasicStats(text) {
    const totalLength = text.length;
    const noSpaceLength = text.replace(/\s/g, '').length;

    // Count words (Korean and English)
    const words = text.match(/[\w가-힣]+/g) || [];
    const wordLength = words.length;

    // Count sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const sentenceLength = sentences.length || (text.trim().length > 0 ? 1 : 0);

    // Count paragraphs
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    const paragraphLength = paragraphs.length;

    // Average sentence length
    const avgSentenceLength = sentenceLength > 0
        ? Math.round(noSpaceLength / sentenceLength)
        : 0;

    // Reading time (200 chars per minute in Korean)
    const readTime = Math.ceil(noSpaceLength / 200);

    return {
        totalLength,
        noSpaceLength,
        wordLength,
        sentenceLength,
        paragraphLength,
        avgSentenceLength,
        readTime,
        sentences,
        words
    };
}

function updateBasicStats(stats) {
    // Live counters
    liveChars.textContent = stats.totalLength;
    liveWords.textContent = stats.wordLength;
    liveReadTime.textContent = stats.readTime;

    // Detailed stats
    totalChars.textContent = stats.totalLength.toLocaleString();
    charsNoSpace.textContent = stats.noSpaceLength.toLocaleString();
    wordCount.textContent = stats.wordLength.toLocaleString();
    sentenceCount.textContent = stats.sentenceLength.toLocaleString();
    paragraphCount.textContent = stats.paragraphLength.toLocaleString();
    avgSentence.textContent = stats.avgSentenceLength.toLocaleString();

    // Reading time
    readingTime.textContent = stats.readTime;
}

// ============================================
// Character Analysis
// ============================================
function analyzeCharacters(text) {
    let korean = 0;
    let english = 0;
    let number = 0;
    let special = 0;

    for (let char of text) {
        if (/[가-힣]/.test(char)) {
            korean++;
        } else if (/[a-zA-Z]/.test(char)) {
            english++;
        } else if (/[0-9]/.test(char)) {
            number++;
        } else if (/[^\s]/.test(char)) {
            special++;
        }
    }

    return { korean, english, number, special };
}

function updateCharacterBreakdown(breakdown) {
    koreanCount.textContent = breakdown.korean.toLocaleString();
    englishCount.textContent = breakdown.english.toLocaleString();
    numberCount.textContent = breakdown.number.toLocaleString();
    specialCount.textContent = breakdown.special.toLocaleString();
}

// ============================================
// Keyword Extraction
// ============================================
function extractKeywords(text) {
    if (text.trim().length === 0) return {};

    // Remove special characters and split into words
    const words = text
        .toLowerCase()
        .replace(/[^\w가-힣\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= 2); // Minimum 2 characters

    // Common Korean stop words
    const stopWords = new Set([
        '이', '그', '저', '것', '수', '등', '및', '또는', '하다', '있다', '되다', '하는',
        '있는', '되는', '그리고', '그러나', '하지만', '때문', '위해', '통해', '대해',
        '에서', '으로', '에게', '에', '는', '은', '이', '가', '을', '를', '의', '과', '와',
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did'
    ]);

    // Count word frequency
    const wordFreq = {};
    words.forEach(word => {
        if (!stopWords.has(word)) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });

    // Get top keywords
    const sortedWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

    return Object.fromEntries(sortedWords);
}

function displayKeywords(keywords) {
    const entries = Object.entries(keywords);

    if (entries.length === 0) {
        keywordsContainer.innerHTML = '<p class="text-muted text-center py-4">글을 입력하면 주요 키워드를 추출합니다</p>';
        return;
    }

    const keywordCloud = document.createElement('div');
    keywordCloud.className = 'keyword-cloud';

    entries.forEach(([word, count]) => {
        const tag = document.createElement('div');
        tag.className = 'keyword-tag';
        tag.innerHTML = `
            ${word}
            <span class="keyword-count">${count}</span>
        `;
        keywordCloud.appendChild(tag);
    });

    keywordsContainer.innerHTML = '';
    keywordsContainer.appendChild(keywordCloud);
}

// ============================================
// Readability Score
// ============================================
function calculateReadability(stats) {
    if (stats.noSpaceLength === 0) {
        return {
            score: 0,
            level: '없음',
            description: '글을 입력하세요',
            tips: [
                '짧고 명확한 문장을 사용하세요',
                '한 문단에 하나의 주제를 담으세요',
                '적절한 문단 나누기를 활용하세요'
            ]
        };
    }

    let score = 100;
    const tips = [];

    // Check average sentence length
    if (stats.avgSentenceLength > 100) {
        score -= 20;
        tips.push('문장이 너무 깁니다. 짧게 나누는 것을 고려하세요.');
    } else if (stats.avgSentenceLength > 70) {
        score -= 10;
        tips.push('문장 길이를 좀 더 짧게 하면 읽기 쉬워집니다.');
    }

    // Check paragraph count
    const avgParagraphLength = stats.sentenceLength / (stats.paragraphLength || 1);
    if (avgParagraphLength > 6) {
        score -= 15;
        tips.push('문단이 너무 깁니다. 더 자주 나누는 것이 좋습니다.');
    }

    // Check sentence variety
    if (stats.sentenceLength > 5) {
        const sentenceLengths = stats.sentences.map(s => s.trim().length);
        const variance = calculateVariance(sentenceLengths);
        if (variance < 100) {
            score -= 10;
            tips.push('문장 길이에 변화를 주면 더 흥미롭습니다.');
        }
    }

    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));

    // Determine level
    let level, description;
    if (score >= 90) {
        level = '매우 좋음';
        description = '읽기 매우 쉬운 글입니다!';
    } else if (score >= 75) {
        level = '좋음';
        description = '읽기 좋은 글입니다.';
    } else if (score >= 60) {
        level = '보통';
        description = '적당한 난이도의 글입니다.';
    } else if (score >= 40) {
        level = '어려움';
        description = '약간 복잡한 글입니다.';
    } else {
        level = '매우 어려움';
        description = '개선이 필요한 글입니다.';
    }

    if (tips.length === 0) {
        tips.push('훌륭한 글입니다! 계속 유지하세요.');
    }

    return { score, level, description, tips };
}

function calculateVariance(numbers) {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squareDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squareDiffs.reduce((a, b) => a + b, 0) / numbers.length;
}

function displayReadability(readability) {
    readabilityScore.textContent = readability.score;
    readabilityDesc.textContent = readability.description;

    // Update tips
    readabilityTips.innerHTML = '<h5>가독성 팁</h5><ul>' +
        readability.tips.map(tip => `<li>${tip}</li>`).join('') +
        '</ul>';

    // Animate score
    const circle = readabilityScore.parentElement;
    circle.style.animation = 'none';
    setTimeout(() => {
        circle.style.animation = 'pulse 0.5s ease';
    }, 10);
}

// ============================================
// Utility Functions
// ============================================
function clearText() {
    if (confirm('정말 모든 내용을 지우시겠습니까?')) {
        textInput.value = '';
        localStorage.removeItem('writing-analyzer-text');
        analyzeText();
    }
}

function loadSample() {
    const sampleText = `코딩하는 작가의 이야기

안녕하세요. 저는 디지털 노마드로 살아가며 코드를 작성하는 개발자입니다.

개발자이자 작가로서, 저는 코드와 글쓰기가 놀랍도록 닮아있다는 것을 발견했습니다. 좋은 코드는 읽기 쉽고, 명확하며, 목적이 분명합니다. 글쓰기도 마찬가지입니다.

클린 코드를 작성하는 것처럼, 명확한 글을 쓰는 것은 독자에 대한 배려입니다. 복잡한 개념을 단순하게 설명하고, 한 번에 하나의 아이디어를 전달하며, 불필요한 요소를 제거합니다.

세계 여러 도시를 여행하면서, 저는 다양한 카페와 코워킹 스페이스에서 코드를 작성했습니다. 방콕의 한 카페에서는 타임존 매스터를 만들었고, 발리의 해변가 카페에서는 글쓰기 분석기를 개발했습니다.

각 프로젝트는 실제 필요에서 시작되었습니다. 타임존 매스터는 여러 나라의 클라이언트와 일하면서 시간 조율이 어려웠던 경험에서, 글쓰기 분석기는 더 나은 기술 블로그를 쓰고 싶었던 욕구에서 탄생했습니다.

코드를 작성하는 것은 창작 활동입니다. 빈 화면 앞에 앉아 아이디어를 구체화하고, 논리를 구조화하며, 아름다운 솔루션을 만들어냅니다. 글을 쓰는 것도 똑같은 과정입니다.

이 도구가 여러분의 글쓰기에 도움이 되기를 바랍니다.`;

    textInput.value = sampleText;
    localStorage.setItem('writing-analyzer-text', sampleText);
    analyzeText();
}

function exportAsText() {
    const text = textInput.value;
    if (!text.trim()) {
        alert('내보낼 내용이 없습니다.');
        return;
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'writing-' + new Date().toISOString().slice(0, 10) + '.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function copyToClipboard() {
    const text = textInput.value;
    if (!text.trim()) {
        alert('복사할 내용이 없습니다.');
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        alert('클립보드에 복사되었습니다!');
    }).catch(err => {
        console.error('복사 실패:', err);
        alert('복사에 실패했습니다.');
    });
}

function exportReport() {
    const text = textInput.value;
    if (!text.trim()) {
        alert('분석할 내용이 없습니다.');
        return;
    }

    const stats = getBasicStats(text);
    const charBreakdown = analyzeCharacters(text);
    const keywords = extractKeywords(text);
    const readability = calculateReadability(stats);

    const report = `
===========================================
글쓰기 분석 보고서
Generated by Writing Analyzer - 노마드코작
===========================================

📊 기본 통계
- 총 글자 수: ${stats.totalLength.toLocaleString()}
- 공백 제외: ${stats.noSpaceLength.toLocaleString()}
- 단어 수: ${stats.wordLength.toLocaleString()}
- 문장 수: ${stats.sentenceLength.toLocaleString()}
- 문단 수: ${stats.paragraphLength.toLocaleString()}
- 평균 문장 길이: ${stats.avgSentenceLength.toLocaleString()}

⏱️ 읽기 시간
- 예상 읽기 시간: ${stats.readTime}분

🔤 문자 분석
- 한글: ${charBreakdown.korean.toLocaleString()}
- 영문: ${charBreakdown.english.toLocaleString()}
- 숫자: ${charBreakdown.number.toLocaleString()}
- 특수문자: ${charBreakdown.special.toLocaleString()}

🏷️ 주요 키워드
${Object.entries(keywords).map(([word, count]) => `- ${word} (${count}회)`).join('\n')}

📖 가독성 점수
- 점수: ${readability.score}점
- 등급: ${readability.level}
- 평가: ${readability.description}

💡 개선 팁
${readability.tips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

===========================================
생성 일시: ${new Date().toLocaleString('ko-KR')}
===========================================
`;

    const blob = new Blob([report], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis-report-' + new Date().toISOString().slice(0, 10) + '.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// ============================================
// Console Easter Egg
// ============================================
console.log('%c✍️ Writing Analyzer', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('%c코딩하는 작가를 위한 글쓰기 분석 도구', 'font-size: 14px; color: #764ba2;');
console.log('%c노마드코작이 만들었습니다 📝', 'font-size: 12px; color: #666;');
