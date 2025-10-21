// ============================================
// Global Variables
// ============================================
let diaries = [];
let currentDiaryId = null;
let selectedMood = '😃';

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadDiaries();
    renderDiaries();
    initializeNewDiaryDate();
});

// ============================================
// Load Diaries from LocalStorage
// ============================================
function loadDiaries() {
    const saved = localStorage.getItem('myDiaries');
    if (saved) {
        try {
            diaries = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading diaries:', e);
            diaries = [];
        }
    }
}

// ============================================
// Save Diaries to LocalStorage
// ============================================
function saveDiariesToStorage() {
    localStorage.setItem('myDiaries', JSON.stringify(diaries));
}

// ============================================
// Initialize New Diary Date
// ============================================
function initializeNewDiaryDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('newDate').value = today;
}

// ============================================
// Select Mood
// ============================================
function selectMood(mood) {
    selectedMood = mood;
    // Update active state
    const buttons = document.querySelectorAll('.mood-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('data-mood') === mood) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ============================================
// Save New Diary
// ============================================
function saveDiary() {
    const date = document.getElementById('newDate').value;
    const title = document.getElementById('newTitle').value.trim();
    const content = document.getElementById('newContent').value.trim();

    if (!date || !title || !content) {
        alert('모든 필드를 입력해주세요!');
        return;
    }

    const diary = {
        id: Date.now(),
        date: date,
        mood: selectedMood,
        title: title,
        content: content,
        comments: [],
        createdAt: new Date().toISOString()
    };

    diaries.unshift(diary); // Add to beginning
    saveDiariesToStorage();
    renderDiaries();

    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('newDiaryModal'));
    modal.hide();
    resetNewDiaryForm();

    // Show success message
    showToast('일기가 저장되었습니다!');
}

// ============================================
// Reset New Diary Form
// ============================================
function resetNewDiaryForm() {
    document.getElementById('newTitle').value = '';
    document.getElementById('newContent').value = '';
    initializeNewDiaryDate();
    selectMood('😃');
}

// ============================================
// Render Diaries
// ============================================
function renderDiaries() {
    const container = document.getElementById('diaryList');
    const emptyState = document.getElementById('emptyState');

    if (diaries.length === 0) {
        container.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');

    container.innerHTML = diaries.map(diary => `
        <div class="col-md-6 col-lg-4">
            <div class="diary-card" onclick="viewDiary(${diary.id})">
                <div class="diary-card-header">
                    <span class="diary-mood">${diary.mood}</span>
                    <span class="diary-date">${formatDate(diary.date)}</span>
                </div>
                <h3 class="diary-card-title">${escapeHtml(diary.title)}</h3>
                <p class="diary-card-preview">${escapeHtml(diary.content)}</p>
                <div class="diary-card-footer">
                    <span class="comment-badge">
                        <i class="bi bi-chat-dots"></i> ${diary.comments.length}개의 댓글
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// View Diary
// ============================================
function viewDiary(id) {
    const diary = diaries.find(d => d.id === id);
    if (!diary) return;

    currentDiaryId = id;

    // Populate modal
    document.getElementById('viewDiaryTitle').textContent = diary.title;
    document.getElementById('viewDiaryMood').textContent = diary.mood;
    document.getElementById('viewDiaryDate').textContent = formatDate(diary.date);
    document.getElementById('viewDiaryContent').textContent = diary.content;

    // Render comments
    renderComments(diary.comments);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('viewDiaryModal'));
    modal.show();
}

// ============================================
// Render Comments
// ============================================
function renderComments(comments) {
    const container = document.getElementById('commentsList');
    const countBadge = document.getElementById('commentCount');

    countBadge.textContent = comments.length;

    if (comments.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">아직 댓글이 없습니다</p>';
        return;
    }

    container.innerHTML = comments.map((comment, index) => `
        <div class="comment-item">
            <div>
                <div class="comment-text">${escapeHtml(comment.text)}</div>
                <div class="comment-time">${formatDateTime(comment.createdAt)}</div>
            </div>
            <button class="comment-delete" onclick="deleteComment(${index})" title="삭제">
                <i class="bi bi-x-circle"></i>
            </button>
        </div>
    `).join('');
}

// ============================================
// Add Comment
// ============================================
function addComment() {
    const input = document.getElementById('newComment');
    const text = input.value.trim();

    if (!text) {
        alert('댓글을 입력해주세요!');
        return;
    }

    const diary = diaries.find(d => d.id === currentDiaryId);
    if (!diary) return;

    const comment = {
        text: text,
        createdAt: new Date().toISOString()
    };

    diary.comments.push(comment);
    saveDiariesToStorage();
    renderComments(diary.comments);
    renderDiaries(); // Update comment count in list

    input.value = '';
}

// ============================================
// Delete Comment
// ============================================
function deleteComment(index) {
    if (!confirm('이 댓글을 삭제하시겠습니까?')) return;

    const diary = diaries.find(d => d.id === currentDiaryId);
    if (!diary) return;

    diary.comments.splice(index, 1);
    saveDiariesToStorage();
    renderComments(diary.comments);
    renderDiaries(); // Update comment count in list
}

// ============================================
// Delete Diary
// ============================================
function deleteDiary() {
    if (!confirm('이 일기를 삭제하시겠습니까?')) return;

    diaries = diaries.filter(d => d.id !== currentDiaryId);
    saveDiariesToStorage();
    renderDiaries();

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('viewDiaryModal'));
    modal.hide();

    showToast('일기가 삭제되었습니다');
}

// ============================================
// Clear All Diaries
// ============================================
function clearAllDiaries() {
    if (!confirm('모든 일기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    diaries = [];
    saveDiariesToStorage();
    renderDiaries();

    showToast('모든 일기가 삭제되었습니다');
}

// ============================================
// Format Date
// ============================================
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
    return date.toLocaleDateString('ko-KR', options);
}

// ============================================
// Format DateTime
// ============================================
function formatDateTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

// ============================================
// Escape HTML
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Show Toast Notification
// ============================================
function showToast(message) {
    // Simple alert for now (can be replaced with toast library)
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ============================================
// Keyboard Shortcuts
// ============================================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to save comment
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const commentInput = document.getElementById('newComment');
        if (commentInput === document.activeElement) {
            addComment();
        }
    }
});

// ============================================
// Reset form when modal is closed
// ============================================
document.getElementById('newDiaryModal').addEventListener('hidden.bs.modal', function () {
    resetNewDiaryForm();
});

// ============================================
// Clear comment input when view diary modal is closed
// ============================================
document.getElementById('viewDiaryModal').addEventListener('hidden.bs.modal', function () {
    document.getElementById('newComment').value = '';
    currentDiaryId = null;
});

// ============================================
// Add animations
// ============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// Console Easter Egg
// ============================================
console.log('%c📔 My Diary', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('%c노마드의 여행 일기장', 'font-size: 14px; color: #764ba2;');
console.log('%c세계 곳곳에서의 추억을 기록하세요 ✨', 'font-size: 12px; color: #666;');
