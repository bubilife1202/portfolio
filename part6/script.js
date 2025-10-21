// ============================================
// City Data with Flags
// ============================================
const cityData = {
    'Asia/Seoul': { name: '서울', country: 'Korea', flag: '🇰🇷' },
    'America/New_York': { name: '뉴욕', country: 'USA', flag: '🇺🇸' },
    'Europe/London': { name: '런던', country: 'UK', flag: '🇬🇧' },
    'Asia/Tokyo': { name: '도쿄', country: 'Japan', flag: '🇯🇵' },
    'Asia/Bangkok': { name: '방콕', country: 'Thailand', flag: '🇹🇭' },
    'Asia/Singapore': { name: '싱가포르', country: 'Singapore', flag: '🇸🇬' },
    'Europe/Paris': { name: '파리', country: 'France', flag: '🇫🇷' },
    'Asia/Dubai': { name: '두바이', country: 'UAE', flag: '🇦🇪' },
    'Australia/Sydney': { name: '시드니', country: 'Australia', flag: '🇦🇺' },
    'America/Los_Angeles': { name: 'LA', country: 'USA', flag: '🇺🇸' },
    'Asia/Hong_Kong': { name: '홍콩', country: 'Hong Kong', flag: '🇭🇰' },
    'Europe/Berlin': { name: '베를린', country: 'Germany', flag: '🇩🇪' },
    'America/Toronto': { name: '토론토', country: 'Canada', flag: '🇨🇦' },
    'Asia/Shanghai': { name: '상하이', country: 'China', flag: '🇨🇳' }
};

// Default cities to display
let activeCities = ['Asia/Seoul', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadSavedCities();
    renderWorldClocks();
    updateAllClocks();
    setInterval(updateAllClocks, 1000);

    setupConverterListeners();
    setupMeetingPlanner();
});

// ============================================
// Load Saved Cities from LocalStorage
// ============================================
function loadSavedCities() {
    const saved = localStorage.getItem('timezone-cities');
    if (saved) {
        try {
            activeCities = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading saved cities:', e);
        }
    }
}

// ============================================
// Save Cities to LocalStorage
// ============================================
function saveCities() {
    localStorage.setItem('timezone-cities', JSON.stringify(activeCities));
}

// ============================================
// Render World Clocks
// ============================================
function renderWorldClocks() {
    const container = document.getElementById('worldClocks');
    container.innerHTML = '';

    activeCities.forEach(timezone => {
        const city = cityData[timezone];
        if (!city) return;

        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3';

        const card = document.createElement('div');
        card.className = 'clock-card card-fade-in';
        card.innerHTML = `
            <div class="clock-header">
                <div>
                    <div class="city-flag">${city.flag}</div>
                    <div class="city-name">${city.name}</div>
                </div>
                <button class="remove-btn" onclick="removeCity('${timezone}')">
                    <i class="bi bi-x-circle"></i>
                </button>
            </div>
            <div class="current-time" id="time-${timezone.replace(/\//g, '-')}">--:--:--</div>
            <div class="current-date" id="date-${timezone.replace(/\//g, '-')}">---- -- --</div>
            <div class="timezone-info">
                <span class="timezone-offset" id="offset-${timezone.replace(/\//g, '-')}">UTC+0</span>
                <span class="time-status" id="status-${timezone.replace(/\//g, '-')}">Day</span>
            </div>
        `;

        col.appendChild(card);
        container.appendChild(col);
    });
}

// ============================================
// Update All Clocks
// ============================================
function updateAllClocks() {
    activeCities.forEach(timezone => {
        updateClock(timezone);
    });
}

// ============================================
// Update Single Clock
// ============================================
function updateClock(timezone) {
    const now = new Date();
    const safeId = timezone.replace(/\//g, '-');

    try {
        // Format time
        const timeStr = now.toLocaleTimeString('ko-KR', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        // Format date
        const dateStr = now.toLocaleDateString('ko-KR', {
            timeZone: timezone,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });

        // Get offset
        const formatter = new Intl.DateTimeFormat('en', {
            timeZone: timezone,
            timeZoneName: 'short'
        });
        const parts = formatter.formatToParts(now);
        const tzPart = parts.find(part => part.type === 'timeZoneName');
        const offset = tzPart ? tzPart.value : '';

        // Get hour for status
        const hour = parseInt(now.toLocaleTimeString('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            hour12: false
        }));

        // Update DOM
        const timeEl = document.getElementById(`time-${safeId}`);
        const dateEl = document.getElementById(`date-${safeId}`);
        const offsetEl = document.getElementById(`offset-${safeId}`);
        const statusEl = document.getElementById(`status-${safeId}`);

        if (timeEl) timeEl.textContent = timeStr;
        if (dateEl) dateEl.textContent = dateStr;
        if (offsetEl) offsetEl.textContent = offset;

        if (statusEl) {
            let status, className;
            if (hour >= 6 && hour < 12) {
                status = '오전';
                className = 'status-morning';
            } else if (hour >= 12 && hour < 18) {
                status = '오후';
                className = 'status-afternoon';
            } else if (hour >= 18 && hour < 22) {
                status = '저녁';
                className = 'status-evening';
            } else {
                status = '밤';
                className = 'status-night';
            }
            statusEl.textContent = status;
            statusEl.className = `time-status ${className}`;
        }
    } catch (error) {
        console.error(`Error updating clock for ${timezone}:`, error);
    }
}

// ============================================
// Add City
// ============================================
function addCity() {
    const select = document.getElementById('newCitySelect');
    const timezone = select.value;

    if (!activeCities.includes(timezone)) {
        activeCities.push(timezone);
        saveCities();
        renderWorldClocks();
        updateAllClocks();
    }

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addCityModal'));
    modal.hide();
}

// ============================================
// Remove City
// ============================================
function removeCity(timezone) {
    if (activeCities.length <= 1) {
        alert('최소 1개의 도시는 유지해야 합니다.');
        return;
    }

    activeCities = activeCities.filter(tz => tz !== timezone);
    saveCities();
    renderWorldClocks();
    updateAllClocks();
}

// ============================================
// Time Converter
// ============================================
function setupConverterListeners() {
    const fromDateTime = document.getElementById('fromDateTime');
    const fromTimezone = document.getElementById('fromTimezone');
    const toTimezone = document.getElementById('toTimezone');

    // Set default time to now
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localTime = new Date(now - offset);
    fromDateTime.value = localTime.toISOString().slice(0, 16);

    // Add listeners
    fromDateTime.addEventListener('change', convertTime);
    fromTimezone.addEventListener('change', convertTime);
    toTimezone.addEventListener('change', convertTime);

    // Initial conversion
    convertTime();
}

function convertTime() {
    const fromDateTime = document.getElementById('fromDateTime').value;
    const fromTimezone = document.getElementById('fromTimezone').value;
    const toTimezone = document.getElementById('toTimezone').value;

    if (!fromDateTime) {
        document.getElementById('convertedTime').textContent = '시간을 선택하세요';
        return;
    }

    try {
        // Create date object
        const date = new Date(fromDateTime);

        // Format for target timezone
        const options = {
            timeZone: toTimezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };

        const formatted = new Intl.DateTimeFormat('ko-KR', options).format(date);

        document.getElementById('convertedTime').textContent = formatted;

        // Calculate time difference
        const fromOffset = getTimezoneOffset(date, fromTimezone);
        const toOffset = getTimezoneOffset(date, toTimezone);
        const diffHours = (toOffset - fromOffset) / 60;

        const diffText = diffHours >= 0
            ? `+${diffHours}시간`
            : `${diffHours}시간`;

        document.getElementById('timeDifference').textContent = `시간차: ${diffText}`;
    } catch (error) {
        console.error('Conversion error:', error);
        document.getElementById('convertedTime').textContent = '변환 오류';
    }
}

function getTimezoneOffset(date, timezone) {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return (tzDate.getTime() - utcDate.getTime()) / 60000;
}

// ============================================
// Meeting Planner
// ============================================
function setupMeetingPlanner() {
    const meetingTime = document.getElementById('meetingTime');

    // Set default time
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localTime = new Date(now - offset);
    meetingTime.value = localTime.toISOString().slice(0, 16);

    meetingTime.addEventListener('change', updateMeetingTimes);
    updateMeetingTimes();
}

function updateMeetingTimes() {
    const meetingTime = document.getElementById('meetingTime').value;
    const container = document.getElementById('meetingTimes');

    if (!meetingTime) {
        container.innerHTML = '<p class="text-muted text-center">회의 시간을 선택하세요</p>';
        return;
    }

    const date = new Date(meetingTime);
    const meetingCities = ['Asia/Seoul', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Asia/Bangkok'];

    container.innerHTML = '';

    meetingCities.forEach(timezone => {
        const city = cityData[timezone];
        if (!city) return;

        const localTime = new Intl.DateTimeFormat('ko-KR', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);

        const hour = parseInt(new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            hour12: false
        }).format(date));

        // Check if it's working hours (9-18)
        const isWorkingHours = hour >= 9 && hour < 18;
        const warningClass = isWorkingHours ? '' : 'meeting-warning';

        const item = document.createElement('div');
        item.className = `meeting-time-item ${warningClass}`;
        item.innerHTML = `
            <span class="meeting-city">${city.flag} ${city.name}</span>
            <span class="meeting-time">${localTime}</span>
        `;

        container.appendChild(item);
    });
}

// ============================================
// Console Easter Egg
// ============================================
console.log('%c⏰ Timezone Master', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('%c디지털 노마드를 위한 시간대 관리 도구', 'font-size: 14px; color: #764ba2;');
console.log('%c노마드코작이 만들었습니다 🌏', 'font-size: 12px; color: #666;');
