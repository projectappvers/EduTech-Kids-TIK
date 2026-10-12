tailwind.config = {
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#eef2ff', 100: '#e0e7ff', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
                },
                kidsYellow: '#fbbf24', kidsGreen: '#10b981', kidsOrange: '#f97316', kidsPurple: '#8b5cf6',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Fredoka', 'sans-serif'],
            }
        }
    }
};
const STORAGE_KEY_USERS = 'eduTech_users_v8';
const STORAGE_KEY_MODULES = 'eduTech_modules_v8';
const STORAGE_KEY_QUIZZES = 'eduTech_quizzes_v8';
const STORAGE_KEY_RESULTS = 'eduTech_results_v8';
const STORAGE_KEY_READ_LOGS = 'eduTech_read_logs_v8';
const STORAGE_KEY_NOTIFICATIONS_READ = 'eduTech_notifications_read_v1';
const AUTH_SESSION_KEY = 'edutech_auth_session_v1';
const MONTHS_KEYS = ["JULI", "AGUST", "SEPT", "OKT", "NOV", "DES", "JAN", "FEB", "MAR", "APR", "MEI", "JUN"];
let currentUser = null;
let activeAbsenceDay = new Date().getDate();
let activeTeacherModuleGrade = '5';
let activeStudentSection = 'dashboard';
let activeTeacherSection = 'dashboard';
let activeAuthTab = 'login';
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar.classList.contains('-translate-x-[110%]')) {
        sidebar.classList.remove('-translate-x-[110%]');
        sidebar.classList.add('translate-x-0');
        overlay.classList.remove('hidden');
    } else {
        closeSidebar();
    }
}
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
        sidebar.classList.remove('translate-x-0');
        sidebar.classList.add('-translate-x-[110%]');
        overlay.classList.add('hidden');
    }
}
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
    if (modalId === 'printAttendanceModal') {
        document.body.classList.remove('is-printing-attendance');
    }
    if (modalId === 'printGradingModal') {
        document.body.classList.remove('is-printing-grading');
    }
}
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
}
function updateAcademicYearDisplays() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const taStr = month >= 7 ? `T.A ${year}/${year + 1}` : `T.A ${year - 1}/${year}`;
    document.querySelectorAll('.ta-display').forEach(el => el.innerText = taStr);
}
function updateClock() {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dateElement = document.getElementById('liveDateDisplay');
    if (dateElement) {
        dateElement.innerText = `${days[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }
    const clockElement = document.getElementById('liveClockDisplay');
    if (clockElement) {
        clockElement.innerText = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;
    }
}
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-emerald-600' : 'bg-rose-600';
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    toast.className = `${bgColor} text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold pointer-events-auto transition-all duration-300 transform translate-y-2 opacity-0 z-50`;
    toast.innerHTML = `<i class="fa-solid ${icon} text-base"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}
function triggerSyncEvent() {
    window.dispatchEvent(new Event('eduTech:datachange'));
}
function initCleanStorage() {
    if (!localStorage.getItem(STORAGE_KEY_USERS)) localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([]));
    if (!localStorage.getItem(STORAGE_KEY_MODULES)) localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify([]));
    if (!localStorage.getItem(STORAGE_KEY_QUIZZES)) localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify([]));
    if (!localStorage.getItem(STORAGE_KEY_READ_LOGS)) localStorage.setItem(STORAGE_KEY_READ_LOGS, JSON.stringify({}));
    if (!localStorage.getItem(STORAGE_KEY_RESULTS)) localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify([]));
}
function resetSystemData() {
    if (confirm('APAKAH ANDA YAKIN? Ini akan MENGHAPUS SELURUH DATA sistem secara permanen!')) {
        localStorage.removeItem(STORAGE_KEY_USERS);
        localStorage.removeItem(STORAGE_KEY_MODULES);
        localStorage.removeItem(STORAGE_KEY_QUIZZES);
        localStorage.removeItem(STORAGE_KEY_RESULTS);
        localStorage.removeItem(STORAGE_KEY_READ_LOGS);
        sessionStorage.removeItem('eduTech_session');
        localStorage.removeItem(AUTH_SESSION_KEY);
        currentUser = null;
        initCleanStorage();
        showToast('Seluruh data sistem telah dibersihkan!');
        triggerSyncEvent();
        renderAppView();
    }
}
function dataURLtoBlob(dataurl) {
    try {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--) u8arr[n] = bstr.charCodeAt(n);
        return new Blob([u8arr], {type:mime});
    } catch (e) {
        return null;
    }
}
function openExternalModuleByMeeting(meetingNum, grade = null) {
    const modules = JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]');
    const targetGrade = grade || ((currentUser && currentUser.class && currentUser.class.startsWith('6')) ? '6' : '5');
    const mod = modules.find(m => m.meeting === meetingNum && (m.grade || '5') === targetGrade);
    if (!mod || !mod.link) return showToast('File modul tidak tersedia', 'error');
    if (mod.link.startsWith('data:')) {
        const blob = dataURLtoBlob(mod.link);
        if (blob) window.open(URL.createObjectURL(blob), '_blank');
        else showToast('Format file tidak didukung.', 'error');
    } else {
        window.open(mod.link, '_blank');
    }
}
function downloadModuleByMeeting(meetingNum, grade = null) {
    const modules = JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]');
    const targetGrade = grade || ((currentUser && currentUser.class && currentUser.class.startsWith('6')) ? '6' : '5');
    const mod = modules.find(m => m.meeting === meetingNum && (m.grade || '5') === targetGrade);
    if (!mod || !mod.link) return showToast('File modul tidak tersedia', 'error');
    const fileName = (mod.title || `Modul_Kelas_${targetGrade}_Pertemuan_${meetingNum}`) + '.pdf';
    if (mod.link.startsWith('data:')) {
        const blob = dataURLtoBlob(mod.link);
        if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        } else showToast('Gagal mengunduh file!', 'error');
    } else {
        const a = document.createElement('a');
        a.href = mod.link;
        a.target = '_blank';
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
function updateRoleSelectorUI(role) {
    const siswaLabel = document.getElementById('roleSiswaLabel');
    const guruLabel = document.getElementById('roleGuruLabel');
    const siswaBadge = document.getElementById('roleSiswaBadge');
    const guruBadge = document.getElementById('roleGuruBadge');
    if (role === 'siswa') {
        siswaLabel.className = 'p-3.5 border-2 rounded-2xl cursor-pointer transition-all duration-200 bg-white/80 border-brand-500 shadow-md flex items-center justify-between relative overflow-hidden group';
        guruLabel.className = 'p-3.5 border-2 rounded-2xl cursor-pointer transition-all duration-200 bg-white/30 border-slate-200/80 hover:bg-white/60 flex items-center justify-between relative overflow-hidden group';
        if (siswaBadge) siswaBadge.classList.remove('hidden');
        if (guruBadge) guruBadge.classList.add('hidden');
    } else {
        guruLabel.className = 'p-3.5 border-2 rounded-2xl cursor-pointer transition-all duration-200 bg-white/80 border-purple-500 shadow-md flex items-center justify-between relative overflow-hidden group';
        siswaLabel.className = 'p-3.5 border-2 rounded-2xl cursor-pointer transition-all duration-200 bg-white/30 border-slate-200/80 hover:bg-white/60 flex items-center justify-between relative overflow-hidden group';
        if (guruBadge) guruBadge.classList.remove('hidden');
        if (siswaBadge) siswaBadge.classList.add('hidden');
    }
}
function switchAuthTab(tab) {
    activeAuthTab = tab;
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const resetForm = document.getElementById('resetForm');
    loginForm.reset();
    registerForm.reset();
    resetForm.reset();
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    resetForm.classList.add('hidden');
    document.getElementById('tabBtnLogin').className = "flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all text-slate-600 hover:text-slate-800";
    document.getElementById('tabBtnRegister').className = "flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all text-slate-600 hover:text-slate-800";
    document.getElementById('tabBtnReset').className = "flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all text-slate-600 hover:text-slate-800";
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        document.getElementById('tabBtnLogin').className = "flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all bg-white shadow-md text-brand-600";
        updateRoleSelectorUI('siswa');
    } else if (tab === 'register') {
        registerForm.classList.remove('hidden');
        document.getElementById('tabBtnRegister').className = "flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all bg-white shadow-md text-brand-600";
        setRegisterRole('siswa');
    } else if (tab === 'reset') {
        resetForm.classList.remove('hidden');
        document.getElementById('tabBtnReset').className = "flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all bg-white shadow-md text-brand-600";
    }
    updateSidebarUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function setRegisterRole(role) {
    document.getElementById('regRole').value = role;
    const btnSiswa = document.getElementById('regRoleBtnSiswa');
    const btnGuru = document.getElementById('regRoleBtnGuru');
    const studentFields = document.getElementById('regStudentFields');
    const teacherFields = document.getElementById('regTeacherFields');
    if (role === 'siswa') {
        btnSiswa.className = "py-2 text-xs font-bold rounded-lg bg-white text-brand-600 shadow-sm flex items-center justify-center gap-1";
        btnGuru.className = "py-2 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-800 flex items-center justify-center gap-1";
        studentFields.classList.remove('hidden');
        teacherFields.classList.add('hidden');
    } else {
        btnGuru.className = "py-2 text-xs font-bold rounded-lg bg-white text-brand-600 shadow-sm flex items-center justify-center gap-1";
        btnSiswa.className = "py-2 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-800 flex items-center justify-center gap-1";
        teacherFields.classList.remove('hidden');
        studentFields.classList.add('hidden');
    }
}
function getSafeSessionUser(user) {
    if (!user || !user.username || !['siswa', 'guru'].includes(user.role)) return null;
    return {
        username: String(user.username),
        name: String(user.name || user.username),
        role: user.role,
        class: user.class || '-',
        nip: user.nip || '-'
    };
}
function saveAuthSession(user) {
    const safeUser = getSafeSessionUser(user);
    if (!safeUser) return;
    const serialized = JSON.stringify(safeUser);
    try {
        sessionStorage.setItem('eduTech_session', serialized);
        localStorage.setItem(AUTH_SESSION_KEY, serialized);
    } catch (error) {
        console.warn('[EduTech] Sesi hanya dapat disimpan sementara:', error);
        try { sessionStorage.setItem('eduTech_session', serialized); } catch (_) {}
    }
}
function clearAuthSession() {
    try { sessionStorage.removeItem('eduTech_session'); } catch (_) {}
    try { localStorage.removeItem(AUTH_SESSION_KEY); } catch (_) {}
}
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const role = document.querySelector('input[name="loginRole"]:checked').value;
    const loginButton = document.querySelector('#loginForm button[type="submit"]');
    const originalButtonText = loginButton ? loginButton.innerHTML : '';
    if (loginButton) {
        loginButton.disabled = true;
        loginButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Memeriksa akun...';
    }

    let users = [];
    let foundUser = null;
    let refreshFailed = false;
    try {
        users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
        foundUser = users.find(u => u && u.username && String(u.username).toLowerCase() === username.toLowerCase() && u.password === password && u.role === role);

        // Profil Chrome lama bisa memiliki daftar akun lokal yang ketinggalan.
        // Jika login lokal tidak cocok, minta snapshot akun penuh dari Apps Script,
        // lalu ulangi pencarian sebelum menyatakan akun belum terdaftar.
        if (!foundUser && window.EduTechGASSync && typeof window.EduTechGASSync.refreshUsersNow === 'function') {
            try {
                await window.EduTechGASSync.refreshUsersNow();
                users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
                foundUser = users.find(u => u && u.username && String(u.username).toLowerCase() === username.toLowerCase() && u.password === password && u.role === role);
            } catch (syncError) {
                refreshFailed = true;
                console.warn('[EduTech] Tidak dapat memperbarui daftar akun sebelum login:', syncError);
            }
        }

        if (foundUser) {
            currentUser = foundUser;
            saveAuthSession(foundUser);
            document.getElementById('loginForm').reset();
            showToast(`Selamat datang kembali, ${foundUser.name}!`);
            renderAppView();
        } else if (refreshFailed) {
            showToast('Daftar akun belum berhasil disegarkan dari server. Periksa koneksi lalu coba lagi.', 'error');
        } else {
            showToast('Username, password, atau peran tidak cocok / Belum terdaftar!', 'error');
        }
    } finally {
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.innerHTML = originalButtonText;
        }
    }
}
function handleRegister(e) {
    e.preventDefault();
    const role = document.getElementById('regRole').value;
    const name = document.getElementById('regFullName').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    let newUser = null;
    if (role === 'siswa') {
        const username = document.getElementById('regUsername').value.trim();
        const selectedClass = document.getElementById('regClass').value;
        if (!username) return showToast('Username Siswa wajib diisi!', 'error');
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) return showToast('Username sudah terpakai!', 'error');
        newUser = { username, password, name, role: 'siswa', class: selectedClass };
    } else {
        const username = document.getElementById('regTeacherUsername').value.trim();
        const nip = document.getElementById('regTeacherNip').value.trim() || '-';
        if (!username) return showToast('Username Guru wajib diisi!', 'error');
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) return showToast('Username Guru sudah terpakai!', 'error');
        newUser = { username, password, name, role: 'guru', class: '-', nip: nip };
    }
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    currentUser = newUser;
    saveAuthSession(newUser);
    document.getElementById('registerForm').reset();
    triggerSyncEvent();
    showToast(`Pendaftaran Berhasil! Selamat datang, ${newUser.name}.`);
    renderAppView();
}
function handleResetPassword(e) {
    e.preventDefault();
    const role = document.getElementById('resetRole').value;
    const username = document.getElementById('resetUsername').value.trim();
    const newPassword = document.getElementById('resetNewPassword').value.trim();
    let users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const index = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase() && u.role === role);
    if (index !== -1) {
        users[index].password = newPassword;
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
        triggerSyncEvent();
        document.getElementById('resetForm').reset();
        showToast(`Password akun ${role.toUpperCase()} (${username}) berhasil direset!`);
        switchAuthTab('login');
    } else {
        showToast('Akun tidak ditemukan!', 'error');
    }
}
function handleLogout() {
    currentUser = null;
    clearAuthSession();
    if (document.getElementById('loginForm')) document.getElementById('loginForm').reset();
    if (document.getElementById('registerForm')) document.getElementById('registerForm').reset();
    if (document.getElementById('resetForm')) document.getElementById('resetForm').reset();
    showToast('Anda telah keluar dari aplikasi.');
    renderAppView();
}
function checkSession() {
    let savedSession = null;
    try {
        savedSession = localStorage.getItem(AUTH_SESSION_KEY) || sessionStorage.getItem('eduTech_session');
        if (savedSession) {
            const parsed = JSON.parse(savedSession);
            currentUser = getSafeSessionUser(parsed);
            if (currentUser) {
                saveAuthSession(currentUser);
            } else {
                clearAuthSession();
            }
        } else {
            currentUser = null;
        }
    } catch (error) {
        console.warn('[EduTech] Sesi tersimpan tidak dapat dibaca:', error);
        currentUser = null;
        clearAuthSession();
    }
    renderAppView();
}
function renderAppView() {
    const authSec = document.getElementById('authSection');
    const stdSec = document.getElementById('studentDashboard');
    const tchSec = document.getElementById('teacherDashboard');
    const navBar = document.getElementById('navUserBar');
    if (!currentUser) {
        document.body.className = "landing-page text-slate-800 font-sans min-h-screen flex flex-col relative transition-colors duration-300";
        authSec.classList.remove('hidden');
        stdSec.classList.add('hidden');
        tchSec.classList.add('hidden');
        navBar.innerHTML = `<span class="text-xs bg-white/60 backdrop-blur-md text-slate-700 px-3.5 py-1.5 rounded-xl font-semibold border border-white/80">Belum Login</span>`;
        updateRoleSelectorUI('siswa');
    } else {
        if (currentUser.role === 'siswa') {
            document.body.className = "dashboard-page text-slate-800 font-sans min-h-screen flex flex-col relative transition-colors duration-300";
            authSec.classList.add('hidden');
            stdSec.classList.remove('hidden');
            tchSec.classList.add('hidden');
            navBar.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="text-right hidden sm:block">
                        <p class="text-xs font-bold text-slate-800">${currentUser.name}</p>
                        <p class="text-[11px] text-brand-600 font-semibold">Siswa Kelas ${currentUser.class}</p>
                    </div>
                    <button onclick="handleLogout()" class="px-3.5 py-2 bg-rose-50/90 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-200/60 backdrop-blur-sm">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i>
                        <span class="hidden sm:inline">Logout</span>
                    </button>
                </div>
            `;
            initStudentView();
        } else if (currentUser.role === 'guru') {
            document.body.className = "teacher-dashboard-page text-slate-800 font-sans min-h-screen flex flex-col relative transition-colors duration-300";
            authSec.classList.add('hidden');
            stdSec.classList.add('hidden');
            tchSec.classList.remove('hidden');
            navBar.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="text-right hidden sm:block">
                        <p class="text-xs font-bold text-slate-800">${currentUser.name}</p>
                        <p class="text-[11px] text-kidsPurple font-semibold">Guru Pengampu TIK</p>
                    </div>
                    <button onclick="handleLogout()" class="px-3.5 py-2 bg-rose-50/90 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-200/60 backdrop-blur-sm">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i>
                        <span class="hidden sm:inline">Logout</span>
                    </button>
                </div>
            `;
            initTeacherView();
        }
    }
    renderNotifications();
    updateSidebarUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function updateSidebarUI() {
    const navTitle = document.getElementById('sidebarNavTitle');
    const navLinks = document.getElementById('sidebarNavLinks');
    const accountArea = document.getElementById('sidebarAccountArea');
    const hamburgerBtn = document.getElementById('hamburgerMenuBtn');
    if (hamburgerBtn) {
        hamburgerBtn.classList.remove('hidden');
        hamburgerBtn.classList.add('flex');
    }
    if (!currentUser) {
        navTitle.innerText = "AUTENTIKASI";
        const isLogin = activeAuthTab === 'login';
        const isRegister = activeAuthTab === 'register';
        const isReset = activeAuthTab === 'reset';
        navLinks.innerHTML = `
            <button onclick="switchAuthTab('login'); closeSidebar();" class="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-3 sidebar-btn-modern ${isLogin ? 'active' : ''}">
                ${isLogin ? '<span class="active-pill-indicator"></span>' : ''}
                <div class="w-9 h-9 rounded-xl ${isLogin ? '' : 'bg-indigo-50 text-indigo-600'} flex items-center justify-center shrink-0 icon-box transition">
                    <i class="fa-solid fa-right-to-bracket text-sm"></i>
                </div>
                <span class="tracking-wide">Masuk Akun</span>
            </button>
            <button onclick="switchAuthTab('register'); closeSidebar();" class="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-3 sidebar-btn-modern ${isRegister ? 'active' : ''}">
                ${isRegister ? '<span class="active-pill-indicator"></span>' : ''}
                <div class="w-9 h-9 rounded-xl ${isRegister ? '' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center shrink-0 icon-box transition">
                    <i class="fa-solid fa-user-plus text-sm"></i>
                </div>
                <span class="tracking-wide">Buat Akun Baru</span>
            </button>
            <button onclick="switchAuthTab('reset'); closeSidebar();" class="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-3 sidebar-btn-modern ${isReset ? 'active' : ''}">
                ${isReset ? '<span class="active-pill-indicator"></span>' : ''}
                <div class="w-9 h-9 rounded-xl ${isReset ? '' : 'bg-amber-50 text-amber-600'} flex items-center justify-center shrink-0 icon-box transition">
                    <i class="fa-solid fa-key text-sm"></i>
                </div>
                <span class="tracking-wide">Lupa Password</span>
            </button>
        `;
        accountArea.innerHTML = `
            <div class="flex items-center gap-3 p-1">
                <div class="w-10 h-10 rounded-2xl bg-slate-200/80 border border-slate-300/60 flex items-center justify-center text-slate-500 font-bold shrink-0 shadow-inner">
                    <i class="fa-solid fa-user-ghost text-sm"></i>
                </div>
                <div class="overflow-hidden">
                    <p class="text-xs font-extrabold text-slate-800 truncate">Tamu</p>
                    <p class="text-[10px] text-slate-500 font-semibold truncate">Belum Terautentikasi</p>
                </div>
            </div>
            <div class="pt-2 mt-2 border-t border-slate-200/60 text-center">
                <p class="text-[10px] font-medium text-slate-400">
                    Created by <span class="font-extrabold text-brand-600">Naufal Kurniawan</span>
                </p>
            </div>
        `;
    } else {
        if (currentUser.role === 'siswa') {
            navTitle.innerText = "NAVIGASI SISWA";
            const isDash = activeStudentSection === 'dashboard';
            const isMod = activeStudentSection === 'modules';
            const isQuiz = activeStudentSection === 'quizzes';
            const isTool = activeStudentSection === 'tools';
            navLinks.innerHTML = `
                <button onclick="switchStudentSection('dashboard'); closeSidebar();" class="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-3 sidebar-btn-modern ${isDash ? 'active' : ''}">
                    ${isDash ? '<span class="active-pill-indicator"></span>' : ''}
                    <div class="w-9 h-9 rounded-xl ${isDash ? '' : 'bg-indigo-50 text-indigo-600'} flex items-center justify-center shrink-0 icon-box transition">
                        <i class="fa-solid fa-house text-sm"></i>
                    </div>
                    <span>Dashboard Utama</span>
                </button>
                <button onclick="switchStudentSection('modules'); closeSidebar();" class="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-3 sidebar-btn-modern ${isMod ? 'active' : ''}">
                    ${isMod ? '<span class="active-pill-indicator"></span>' : ''}
                    <div class="w-9 h-9 rounded-xl ${isMod ? '' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center shrink-0 icon-box transition">
                        <i class="fa-solid fa-book-open text-sm"></i>
                    </div>
                    <span>Modul Pertemuan (1-16)</span>
                </button>
                <button onclick="switchStudentSection('quizzes'); closeSidebar();" class="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-3 sidebar-btn-modern ${isQuiz ? 'active' : ''}">
                    ${isQuiz ? '<span class="active-pill-indicator"></span>' : ''}
                    <div class="w-9 h-9 rounded-xl ${isQuiz ? '' : 'bg-amber-50 text-amber-600'} flex items-center justify-center shrink-0 icon-box transition">
                        <i class="fa-solid fa-pen-to-square text-sm"></i>
                    </div>
                    <span>Kuis & Ujian TIK</span>
                </button>
                <button onclick="switchStudentSection('tools'); closeSidebar();" class="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-3 sidebar-btn-modern ${isTool ? 'active' : ''}">
                    ${isTool ? '<span class="active-pill-indicator"></span>' : ''}
                    <div class="w-9 h-9 rounded-xl ${isTool ? '' : 'bg-cyan-50 text-cyan-600'} flex items-center justify-center shrink-0 icon-box transition">
                        <i class="fa-solid fa-wand-magic-sparkles text-sm"></i>
                    </div>
                    <span>Panduan Scratch & Canva</span>
                </button>
            `;
        } else if (currentUser.role === 'guru') {
            navTitle.innerText = "PANEL GURU TIK";
            const isDash = activeTeacherSection === 'dashboard';
            const isStud = activeTeacherSection === 'students';
            const isMod = activeTeacherSection === 'modules';
            const isAtt = activeTeacherSection === 'attendance';
            const isQuiz = activeTeacherSection === 'quizzes';
            const isGrd = activeTeacherSection === 'grading';
            navLinks.innerHTML = `
                <button onclick="switchTeacherSection('dashboard'); closeSidebar();" class="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-3 sidebar-btn-modern ${isDash ? 'active' : ''}">
                    ${isDash ? '<span class="active-pill-indicator"></span>' : ''}
                    <div class="w-9 h-9 rounded-xl ${isDash ? '' : 'bg-indigo-50 text-indigo-600'} flex items-center justify-center shrink-0 icon-box transition">
                        <i class="fa-solid fa-house text-sm"></i>
                    </div>
                    <span>Dashboard Utama</span>
                </button>
                <button onclick="switchTeacherSection('students'); closeSidebar();" class="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-3 sidebar-btn-modern ${isStud ? 'active' : ''}">
                    ${isStud ? '<span class="active-pill-indicator"></span>' : ''}
                    <div class="w-9 h-9 rounded-xl ${isStud ? '' : 'bg-blue-50 text-blue-600'} flex items-center justify-center shrink-0 icon-box transition">
                        <i class="fa-solid fa-users text-sm"></i>
                    </div>
                    <span>Kelola Akun Siswa</span>
                </button>
                <button onclick="switchTeacherSection('modules'); closeSidebar();" class="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-3 sidebar-btn-modern ${isMod ? 'active' : ''}">
                    ${isMod ? '<span class="active-pill-indicator"></span>' : ''}
                    <div class="w-9 h-9 rounded-xl ${isMod ? '' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center shrink-0 icon-box transition">
                        <i class="fa-solid fa-folder-plus text-sm"></i>
                    </div>
                    <span>Kelola Modul TIK</span>
                </button>
                <button onclick="switchTeacherSection('attendance'); closeSidebar();" class="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-3 sidebar-btn-modern ${isAtt ? 'active' : ''}">
                    ${isAtt ? '<span class="active-pill-indicator"></span>' : ''}
                    <div class="w-9 h-9 rounded-xl ${isAtt ? '' : 'bg-amber-50 text-amber-600'} flex items-center justify-center shrink-0 icon-box transition">
                        <i class="fa-solid fa-clipboard-user text-sm"></i>
                    </div>
                    <span>Presensi Kelas</span>
                </button>
                <button onclick="switchTeacherSection('quizzes'); closeSidebar();" class="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-3 sidebar-btn-modern ${isQuiz ? 'active' : ''}">
                    ${isQuiz ? '<span class="active-pill-indicator"></span>' : ''}
                    <div class="w-9 h-9 rounded-xl ${isQuiz ? '' : 'bg-purple-50 text-purple-600'} flex items-center justify-center shrink-0 icon-box transition">
                        <i class="fa-solid fa-file-pen text-sm"></i>
                    </div>
                    <span>Pembuat Kuis</span>
                </button>
                <button onclick="switchTeacherSection('grading'); closeSidebar();" class="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-3 sidebar-btn-modern ${isGrd ? 'active' : ''}">
                    ${isGrd ? '<span class="active-pill-indicator"></span>' : ''}
                    <div class="w-9 h-9 rounded-xl ${isGrd ? '' : 'bg-rose-50 text-rose-600'} flex items-center justify-center shrink-0 icon-box transition">
                        <i class="fa-solid fa-square-poll-vertical text-sm"></i>
                    </div>
                    <span>Koreksi & Rekap</span>
                </button>
                <div class="pt-3 border-t border-slate-200/80">
                    <button onclick="resetSystemData(); closeSidebar();" class="w-full text-left px-3.5 py-2.5 rounded-2xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-3 sidebar-btn-modern">
                        <div class="w-9 h-9 rounded-xl bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0 icon-box transition">
                            <i class="fa-solid fa-rotate-left text-sm"></i>
                        </div>
                        <span>Reset Sistem</span>
                    </button>
                </div>
            `;
        }
        accountArea.innerHTML = `
            <div class="flex items-center justify-between gap-2 p-1">
                <div class="flex items-center gap-3 overflow-hidden">
                    <div class="relative shrink-0">
                        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md border-2 border-white">
                            ${currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div class="overflow-hidden">
                        <p class="text-xs font-extrabold text-slate-800 truncate">${currentUser.name}</p>
                        <p class="text-[10px] text-brand-600 font-bold truncate">${currentUser.role === 'siswa' ? 'Siswa Kelas ' + currentUser.class : 'Guru Pengampu TIK'}</p>
                    </div>
                </div>
                <button onclick="handleLogout(); closeSidebar();" class="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold transition border border-rose-200/60 shrink-0" title="Keluar">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i>
                </button>
            </div>
            <div class="pt-2 mt-2 border-t border-slate-200/60 text-center">
                <p class="text-[10px] font-medium text-slate-400">
                    Created by <span class="font-extrabold text-brand-600">Naufal Kurniawan</span>
                </p>
            </div>
        `;
    }
}
function getStudentNotifications() {
    if (!currentUser || currentUser.role !== 'siswa') return [];
    const modules = JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]');
    const quizzes = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    const studentGrade = (currentUser.class && currentUser.class.startsWith('6')) ? '6' : '5';
    const targetQuizzes = quizzes.filter(q => q.targetClass === 'ALL' || q.targetClass === currentUser.class);
    const notifications = [];
    modules.filter(m => (m.grade || '5') === studentGrade).forEach(m => {
        const stamp = m.updatedAt ? String(m.updatedAt).replace(/[^0-9]/g, '') : 'legacy';
        notifications.push({
            id: `module-${m.grade || '5'}-${m.meeting}-${stamp}`,
            title: `Modul Kelas ${studentGrade} Pertemuan ${m.meeting} Terupload`,
            desc: m.title || 'Modul pembelajaran baru',
            icon: 'fa-book-open', color: 'text-brand-600 bg-brand-50', action: 'modules',
            sortTime: m.updatedAt ? Date.parse(m.updatedAt) || 0 : 0
        });
    });
    targetQuizzes.forEach(q => {
        notifications.push({
            id: `quiz-${q.id}`,
            title: 'Kuis Baru Terupload',
            desc: q.title || 'Kuis TIK baru',
            icon: 'fa-pen-to-square', color: 'text-purple-600 bg-purple-50', action: 'quizzes',
            sortTime: Number(String(q.id || '').replace(/\D/g, '')) || 0
        });
    });
    return notifications.sort((a, b) => b.sortTime - a.sortTime);
}
function getNotificationsReadState() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY_NOTIFICATIONS_READ) || '{}');
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (_) {
        return {};
    }
}
function ensureNotificationReadBaseline(notifications) {
    if (!currentUser || currentUser.role !== 'siswa') return new Set();
    const state = getNotificationsReadState();
    const username = currentUser.username;
    return new Set(Array.isArray(state[username]) ? state[username] : []);
}
function markStudentNotificationsRead(ids) {
    if (!currentUser || currentUser.role !== 'siswa' || !Array.isArray(ids) || !ids.length) return;
    const state = getNotificationsReadState();
    const username = currentUser.username;
    const existing = Array.isArray(state[username]) ? state[username] : [];
    state[username] = [...new Set([...existing, ...ids])];
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS_READ, JSON.stringify(state));
}
function toggleNotifDropdown() {
    const dropdown = document.getElementById('notifDropdown');
    if (!dropdown) return;
    const isOpening = dropdown.classList.contains('hidden');
    if (isOpening) {
        dropdown.classList.remove('hidden');
        const notifications = getStudentNotifications();
        renderNotifications();
        markStudentNotificationsRead(notifications.map(n => n.id));
        const badge = document.getElementById('notifBadge');
        if (badge) badge.classList.add('hidden');
    } else {
        const notifications = getStudentNotifications();
        markStudentNotificationsRead(notifications.map(n => n.id));
        dropdown.classList.add('hidden');
        renderNotifications();
    }
}
function openStudentNotification(notificationId, section) {
    markStudentNotificationsRead([notificationId]);
    const dropdown = document.getElementById('notifDropdown');
    if (dropdown) dropdown.classList.add('hidden');
    if (section === 'modules') switchStudentSection('modules');
    else if (section === 'quizzes') switchStudentSection('quizzes');
    renderNotifications();
}
function renderNotifications() {
    const notifContainer = document.getElementById('notifContainer');
    const notifBadge = document.getElementById('notifBadge');
    const notifList = document.getElementById('notifList');
    const notifCountTag = document.getElementById('notifCountTag');
    if (!currentUser || currentUser.role !== 'siswa') {
        if (notifContainer) notifContainer.classList.add('hidden');
        return;
    }
    if (!notifContainer || !notifBadge || !notifList) return;
    notifContainer.classList.remove('hidden');
    const notifications = getStudentNotifications();
    const readIds = ensureNotificationReadBaseline(notifications);
    const unread = notifications.filter(n => !readIds.has(n.id));
    const read = notifications.filter(n => readIds.has(n.id));
    notifBadge.innerText = String(unread.length);
    notifBadge.classList.toggle('hidden', unread.length === 0);
    if (notifCountTag) notifCountTag.innerText = `${unread.length} Baru • ${read.length} Lama`;
    if (notifications.length === 0) {
        notifList.innerHTML = `<div class="text-center py-6 text-xs text-slate-400">Belum ada notifikasi modul atau kuis dari Guru.</div>`;
        return;
    }
    const renderGroup = (items, heading, isNew) => {
        if (!items.length) return '';
        return `
            <div class="space-y-2">
                <div class="flex items-center justify-between px-1 pt-1">
                    <p class="text-[10px] font-extrabold uppercase tracking-wider ${isNew ? 'text-rose-600' : 'text-slate-400'}">${heading}</p>
                    <span class="text-[10px] font-bold ${isNew ? 'text-rose-600 bg-rose-50' : 'text-slate-400 bg-slate-100'} px-2 py-0.5 rounded-full">${items.length}</span>
                </div>
                ${items.map(n => `
                    <button type="button" onclick="openStudentNotification('${n.id}', '${n.action}')" class="w-full text-left p-3 ${isNew ? 'bg-indigo-50/80 border-indigo-200' : 'bg-slate-50 border-slate-200/80'} hover:bg-slate-100 rounded-2xl border cursor-pointer transition flex items-start gap-3">
                        <div class="w-8 h-8 rounded-xl ${n.color} flex items-center justify-center text-xs shrink-0 mt-0.5"><i class="fa-solid ${n.icon}"></i></div>
                        <div class="min-w-0 flex-1">
                            <p class="text-xs font-bold text-slate-800">${n.title}</p>
                            <p class="text-[11px] text-slate-600 break-words">${n.desc}</p>
                        </div>
                        ${isNew ? '<span class="mt-1 w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Belum dibaca"></span>' : ''}
                    </button>
                `).join('')}
            </div>`;
    };
    notifList.innerHTML = `${renderGroup(unread, 'Notifikasi Baru', true)}${renderGroup(read, 'Notifikasi Sebelumnya', false)}`;
}
function initStudentView() {
    document.getElementById('studentGreetingName').innerText = currentUser.name;
    document.getElementById('studentGreetingClass').innerText = currentUser.class;
    if (document.getElementById('stdBioName')) document.getElementById('stdBioName').innerText = currentUser.name;
    if (document.getElementById('stdBioUsername')) document.getElementById('stdBioUsername').innerText = currentUser.username;
    if (document.getElementById('stdBioClass')) document.getElementById('stdBioClass').innerText = `Kelas ${currentUser.class}`;
    const savedSection = sessionStorage.getItem(`eduTech_last_student_section_${String(currentUser.username).toLowerCase()}`);
    const allowedSections = ['dashboard', 'modules', 'quizzes', 'tools'];
    switchStudentSection(allowedSections.includes(savedSection) ? savedSection : 'dashboard');
}
function switchStudentSection(section) {
    activeStudentSection = section;
    if (currentUser && currentUser.username) {
        try { sessionStorage.setItem(`eduTech_last_student_section_${String(currentUser.username).toLowerCase()}`, section); } catch (_) {}
    }
    ['dashboard', 'modules', 'quizzes', 'tools'].forEach(v => {
        const el = document.getElementById('studentSubView' + v.charAt(0).toUpperCase() + v.slice(1));
        if (el) {
            if (v === section) el.classList.remove('hidden');
            else el.classList.add('hidden');
        }
    });
    if (section === 'modules') renderStudentModules();
    if (section === 'quizzes') { renderStudentQuizzes(); renderStudentQuizHistory(); }
    if (section === 'dashboard') { updateStudentReadProgress(); updateStudentQuizProgress(); }
    updateSidebarUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function updateStudentReadProgress() {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEY_READ_LOGS) || '{}');
    const readCount = (logs[currentUser.username] || []).length;
    const displayPct = Math.round((readCount / 16) * 100);
    document.getElementById('studentProgressText').innerText = `${displayPct}%`;
    document.getElementById('studentProgressBar').style.width = `${Math.min(displayPct, 100)}%`;
    document.getElementById('studentModulesReadCount').innerText = `${readCount} dari 16 Modul diselesaikan`;
}
function updateStudentQuizProgress() {
    if (!currentUser) return;
    const quizzes = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    const results = JSON.parse(localStorage.getItem(STORAGE_KEY_RESULTS) || '[]');
    const targetQuizzes = quizzes.filter(q => q.targetClass === 'ALL' || q.targetClass === currentUser.class);
    const completedQuizIds = new Set(results.filter(r => r.studentUsername === currentUser.username).map(r => r.quizId));
    const doneCount = targetQuizzes.filter(q => completedQuizIds.has(q.id)).length;
    const pct = targetQuizzes.length > 0 ? Math.round((doneCount / targetQuizzes.length) * 100) : 0;
    document.getElementById('studentQuizProgressText').innerText = `${pct}%`;
    document.getElementById('studentQuizProgressBar').style.width = `${Math.min(pct, 100)}%`;
    document.getElementById('studentQuizzesDoneCount').innerText = `${doneCount} dari ${targetQuizzes.length} Kuis diselesaikan`;
}
function toggleModuleReadStatus(meetingNumber) {
    let logs = JSON.parse(localStorage.getItem(STORAGE_KEY_READ_LOGS) || '{}');
    let studentLogs = logs[currentUser.username] || [];
    if (studentLogs.includes(meetingNumber)) {
        studentLogs = studentLogs.filter(m => m !== meetingNumber);
        showToast(`Pertemuan ${meetingNumber} ditandai belum selesai.`);
    } else {
        studentLogs.push(meetingNumber);
        showToast(`Hebat! Pertemuan ${meetingNumber} berhasil diselesaikan. 🎉`);
    }
    logs[currentUser.username] = studentLogs;
    localStorage.setItem(STORAGE_KEY_READ_LOGS, JSON.stringify(logs));
    triggerSyncEvent();
    renderStudentModules();
    updateStudentReadProgress();
}
function openViewModuleModal(meetingNum) {
    const modules = JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]');
    const studentGrade = (currentUser.class && currentUser.class.startsWith('6')) ? '6' : '5';
    const mod = modules.find(m => m.meeting === meetingNum && (m.grade || '5') === studentGrade);
    if (!mod || !mod.link) return showToast('File modul tidak tersedia untuk dibuka.', 'error');
    document.getElementById('viewModMeetingBadge').innerText = `Kelas ${studentGrade} - Pertemuan ${mod.meeting}`;
    document.getElementById('viewModTitle').innerText = mod.title;
    document.getElementById('viewModDesc').innerText = mod.description;
    const iframe = document.getElementById('viewModIframe');
    if (mod.link.startsWith('data:')) {
        const blob = dataURLtoBlob(mod.link);
        iframe.src = blob ? URL.createObjectURL(blob) : mod.link;
    } else {
        iframe.src = mod.link;
    }
    document.getElementById('viewModDownloadBtn').onclick = () => downloadModuleByMeeting(meetingNum, studentGrade);
    document.getElementById('viewModExternalBtn').onclick = () => openExternalModuleByMeeting(meetingNum, studentGrade);
    const markBtn = document.getElementById('viewModMarkReadBtn');
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEY_READ_LOGS) || '{}');
    const isRead = (logs[currentUser.username] || []).includes(meetingNum);
    markBtn.className = isRead ? "px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl" : "px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl";
    markBtn.innerHTML = isRead ? `<i class="fa-solid fa-rotate-left"></i> Tandai Belum Selesai` : `<i class="fa-solid fa-check"></i> Tandai Selesai Dibaca`;
    markBtn.onclick = () => { toggleModuleReadStatus(meetingNum); openViewModuleModal(meetingNum); };
    openModal('viewModuleModal');
}
function renderStudentModules() {
    const container = document.getElementById('studentModuleGrid');
    const modules = JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]');
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEY_READ_LOGS) || '{}');
    const readMeetings = logs[currentUser.username] || [];
    const studentGrade = (currentUser.class && currentUser.class.startsWith('6')) ? '6' : '5';
    const gradeTag = document.getElementById('studentModuleGradeTag');
    if (gradeTag) gradeTag.innerText = `Kelas ${studentGrade} SD`;
    container.innerHTML = '';
    for (let i = 1; i <= 16; i++) {
        const mod = modules.find(m => m.meeting === i && (m.grade || '5') === studentGrade);
        const isRead = readMeetings.includes(i);
        const card = document.createElement('div');
        card.className = `glass-card glass-card-hover rounded-3xl p-5 border transition-all flex flex-col justify-between ${isRead ? 'border-emerald-400/80 bg-emerald-50/25 shadow-md' : 'border-white/60'}`;
        if (mod) {
            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-start gap-2 mb-2.5">
                        <span class="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl ${isRead ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-50 text-brand-700'}">Pertemuan ${i}</span>
                        ${isRead ? '<span class="text-xs font-bold text-emerald-600 flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Selesai</span>' : '<span class="text-xs font-medium text-slate-400">Belum Dibaca</span>'}
                    </div>
                    <h4 class="font-display font-bold text-slate-800 text-base mb-1.5 break-words-custom">${mod.title}</h4>
                    <p class="text-xs text-slate-600 leading-relaxed mb-4 break-words-custom">${mod.description}</p>
                </div>
                <div class="space-y-2 pt-3 border-t border-slate-200/60">
                    <div class="flex items-center gap-2">
                        <button onclick="openViewModuleModal(${i})" class="flex-1 py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"><i class="fa-solid fa-book-open"></i> Buka Modul</button>
                        <button onclick="downloadModuleByMeeting(${i}, '${studentGrade}')" class="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200" title="Unduh Modul"><i class="fa-solid fa-download"></i></button>
                    </div>
                    <button onclick="toggleModuleReadStatus(${i})" class="w-full py-2 px-3 ${isRead ? 'bg-white text-slate-600 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'} text-xs font-bold rounded-xl border">
                        <i class="fa-solid ${isRead ? 'fa-rotate-left' : 'fa-check'}"></i> ${isRead ? 'Tandai Belum Selesai' : 'Tandai Selesai Dibaca'}
                    </button>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div>
                    <span class="text-[10px] font-bold uppercase bg-slate-100 text-slate-400 px-2.5 py-1 rounded-xl">Pertemuan ${i}</span>
                    <h4 class="font-display font-bold text-slate-400 text-sm mt-2 mb-1">Materi Belum Diunggah</h4>
                    <p class="text-xs text-slate-400">Guru TIK belum mengunggah materi pembelajaran Kelas ${studentGrade} untuk pertemuan ini.</p>
                </div>
                <div class="pt-3 border-t border-slate-200/60">
                    <button disabled class="w-full py-2.5 px-3 bg-slate-100/80 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed">Modul Belum Tersedia</button>
                </div>
            `;
        }
        container.appendChild(card);
    }
}
function renderStudentQuizzes() {
    const container = document.getElementById('studentQuizList');
    const quizzes = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    const filteredQuizzes = quizzes.filter(q => q.targetClass === 'ALL' || q.targetClass === currentUser.class);
    if (filteredQuizzes.length === 0) {
        container.innerHTML = `
            <div class="col-span-full glass-card p-8 rounded-3xl text-center border border-white/90 shadow-sm flex flex-col items-center justify-center">
                <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-3 shadow-inner">
                    <i class="fa-solid fa-list-check"></i>
                </div>
                <h4 class="font-display font-bold text-slate-800 text-base mb-1">Belum Ada Kuis Aktif</h4>
                <p class="text-xs text-slate-600 max-w-md">Belum ada kuis aktif yang dibuat oleh Guru TIK untuk kelas kamu.</p>
            </div>
        `;
        return;
    }
    container.innerHTML = filteredQuizzes.map(q => `
        <div class="glass-card p-5 rounded-2xl border border-indigo-100 flex flex-col justify-between">
            <div>
                <div class="flex items-center gap-2 mb-2">
                    <span class="bg-brand-100 text-brand-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Kuis TIK</span>
                    <span class="text-xs text-slate-500">${q.questions.length} Soal</span>
                </div>
                <h4 class="font-display font-bold text-slate-800 text-base mb-2 break-words-custom">${q.title}</h4>
            </div>
            <button onclick="openTakeQuizModal('${q.id}')" class="mt-4 w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2">
                <i class="fa-solid fa-pen-nib"></i> Kerjakan Kuis Sekarang
            </button>
        </div>
    `).join('');
}
function renderStudentQuizHistory() {
    const tbody = document.getElementById('studentQuizHistoryBody');
    const results = JSON.parse(localStorage.getItem(STORAGE_KEY_RESULTS) || '[]');
    const quizzes = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    const studentResults = results.filter(r => r.studentUsername === currentUser.username);
    if (studentResults.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="px-4 py-4 text-center text-xs text-slate-400">Kamu belum pernah mengerjakan kuis.</td></tr>`;
        return;
    }
    tbody.innerHTML = studentResults.map(r => {
        const q = quizzes.find(item => item.id === r.quizId);
        const quizTitle = q ? q.title : 'Kuis TIK';
        const badgeStyle = r.status === 'Sudah Terkoreksi' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
        return `
            <tr class="hover:bg-white/40">
                <td class="px-4 py-3 text-center font-semibold text-slate-800 break-words-custom">${quizTitle}</td>
                <td class="px-4 py-3 text-center font-bold text-slate-700">Percobaan Ke-${r.attemptCount}</td>
                <td class="quiz-history-date px-4 py-3 text-center text-xs text-slate-500">${r.date}</td>
                <td class="quiz-history-status px-4 py-3 text-center"><span class="px-2.5 py-1 ${badgeStyle} rounded-full text-[10px] font-bold">${r.status || 'Belum Terkoreksi'}</span></td>
            </tr>
        `;
    }).join('');
}
function openTakeQuizModal(quizId) {
    const quizzes = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    document.getElementById('takeQuizId').value = quiz.id;
    document.getElementById('takeQuizTitle').innerText = quiz.title;
    document.getElementById('takeQuizSubtitle').innerText = `Jumlah Soal: ${quiz.questions.length}`;
    const container = document.getElementById('takeQuizQuestionsContainer');
    container.innerHTML = quiz.questions.map((q, idx) => {
        if (q.type === 'pg') {
            return `
                <div class="bg-white/60 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <p class="font-bold text-slate-800 text-sm break-words-custom">${idx + 1}. ${q.question}</p>
                    <div class="space-y-2">
                        ${q.options.map((opt, optIdx) => `
                            <label class="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer text-xs font-medium text-slate-700">
                                <input type="radio" name="q_${idx}" value="${optIdx}" required class="text-brand-600">
                                <span class="break-words-custom">${opt}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="bg-white/60 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <p class="font-bold text-slate-800 text-sm break-words-custom">${idx + 1}. ${q.question} <span class="text-xs text-brand-600 font-normal">(Soal Essay)</span></p>
                    <textarea name="q_${idx}" required rows="3" class="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs" placeholder="Tuliskan jawaban kamu..."></textarea>
                </div>
            `;
        }
    }).join('');
    openModal('takeQuizModal');
}
function submitStudentQuiz(e) {
    e.preventDefault();
    const quizId = document.getElementById('takeQuizId').value;
    const quizzes = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    const results = JSON.parse(localStorage.getItem(STORAGE_KEY_RESULTS) || '[]');
    const attemptCount = results.filter(r => r.quizId === quizId && r.studentUsername === currentUser.username).length + 1;
    let correctPG = 0, totalPG = 0, keyedPG = 0, studentAnswers = [], essayAnswers = [];
    quiz.questions.forEach((q, idx) => {
        if (q.type === 'pg') {
            totalPG++;
            const selected = document.querySelector(`input[name="q_${idx}"]:checked`);
            const val = selected ? parseInt(selected.value, 10) : -1;
            studentAnswers.push(val);
            const hasKey = Number(quiz.keyVersion) >= 2 && Number.isInteger(q.answer) && q.answer >= 0 && Array.isArray(q.options) && q.answer < q.options.length;
            if (hasKey) {
                keyedPG++;
                if (val === q.answer) correctPG++;
            }
        } else {
            const field = document.querySelector(`textarea[name="q_${idx}"]`);
            const text = field ? field.value.trim() : '';
            studentAnswers.push(text);
            essayAnswers.push(text);
        }
    });
    const allPGKeyed = keyedPG === totalPG;
    const pgScore = totalPG > 0 && allPGKeyed ? Math.round((correctPG / totalPG) * 100) : null;
    const hasEssay = quiz.questions.some(q => q.type === 'essay');
    const needsManualReview = hasEssay || !allPGKeyed;
    results.push({
        id: 'res_' + Date.now(),
        quizId: quiz.id,
        studentUsername: currentUser.username,
        studentName: currentUser.name,
        studentClass: currentUser.class,
        attemptCount: attemptCount,
        date: new Date().toISOString().split('T')[0],
        pgScore: pgScore,
        studentAnswers: studentAnswers,
        essayAnswers: essayAnswers,
        essayGrade: hasEssay ? null : pgScore,
        finalScore: needsManualReview ? null : pgScore,
        status: needsManualReview ? 'Belum Terkoreksi' : 'Sudah Terkoreksi'
    });
    localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(results));
    triggerSyncEvent();
    closeModal('takeQuizModal');
    showToast(`Kuis berhasil dikirim! (Percobaan Ke-${attemptCount})`);
    renderStudentQuizHistory();
    updateStudentQuizProgress();
}
function initTeacherView() {
    document.getElementById('statTeacherName').innerText = currentUser.name;
    if (document.getElementById('tchBioName')) document.getElementById('tchBioName').innerText = currentUser.name;
    if (document.getElementById('tchBioUsername')) document.getElementById('tchBioUsername').innerText = currentUser.username;
    if (document.getElementById('tchBioNip')) document.getElementById('tchBioNip').innerText = (currentUser.nip && currentUser.nip !== '-') ? currentUser.nip : '-';
    populateMeetingSelectOptions();
    const savedSection = sessionStorage.getItem(`eduTech_last_teacher_section_${String(currentUser.username).toLowerCase()}`);
    const allowedSections = ['dashboard', 'students', 'modules', 'attendance', 'quizzes', 'grading'];
    switchTeacherSection(allowedSections.includes(savedSection) ? savedSection : 'dashboard');
}
function switchTeacherSection(section) {
    activeTeacherSection = section;
    if (currentUser && currentUser.username) {
        try { sessionStorage.setItem(`eduTech_last_teacher_section_${String(currentUser.username).toLowerCase()}`, section); } catch (_) {}
    }
    ['dashboard', 'students', 'modules', 'attendance', 'quizzes', 'grading'].forEach(v => {
        const el = document.getElementById('teacherSubView' + v.charAt(0).toUpperCase() + v.slice(1));
        if (el) {
            if (v === section) el.classList.remove('hidden');
            else el.classList.add('hidden');
        }
    });
    if (section === 'dashboard') {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
        const modules = JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]');
        const quizzes = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
        document.getElementById('statTotalStudents').innerText = `${users.filter(u => u.role === 'siswa').length} Siswa`;
        document.getElementById('statTotalModules').innerText = `${modules.length} / 32`;
        document.getElementById('statTotalQuizzes').innerText = `${quizzes.length} Kuis`;
    }
    if (section === 'students') renderTeacherStudentList();
    if (section === 'modules') renderTeacherModules();
    if (section === 'attendance') loadAttendanceForm();
    if (section === 'quizzes') renderTeacherQuizList();
    if (section === 'grading') { populateTeacherQuizSelectOptions(); renderTeacherGradingTable(); }
    updateSidebarUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function renderTeacherStudentList() {
    const filterClass = document.getElementById('teacherClassFilter').value;
    const tbody = document.getElementById('teacherStudentTableBody');
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const readLogs = JSON.parse(localStorage.getItem(STORAGE_KEY_READ_LOGS) || '{}');
    const quizzes = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    const results = JSON.parse(localStorage.getItem(STORAGE_KEY_RESULTS) || '[]');
    let students = users.filter(u => u.role === 'siswa');
    if (filterClass !== 'ALL') students = students.filter(s => s.class === filterClass);
    if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-xs text-slate-500">Belum ada siswa terdaftar pada kelas ini.</td></tr>`;
        return;
    }
    tbody.innerHTML = students.map(s => {
        const logs = readLogs[s.username] || [];
        const readPct = Math.round((logs.length / 16) * 100);
        const targetQuizzes = quizzes.filter(q => q.targetClass === 'ALL' || q.targetClass === s.class);
        const completedQuizIds = new Set(results.filter(r => r.studentUsername === s.username).map(r => r.quizId));
        const doneQuizzes = targetQuizzes.filter(q => completedQuizIds.has(q.id)).length;
        const quizPct = targetQuizzes.length > 0 ? Math.round((doneQuizzes / targetQuizzes.length) * 100) : 0;
        return `
            <tr class="hover:bg-white/80 transition">
                <td class="px-6 py-4 font-bold text-slate-900">${s.name}</td>
                <td class="px-6 py-4 text-xs font-semibold text-slate-600">${s.username}</td>
                <td class="px-6 py-4"><span class="px-3 py-1 bg-brand-100 text-brand-800 font-extrabold rounded-lg text-xs">${s.class}</span></td>
                <td class="px-6 py-4">
                    <div class="w-32 space-y-1">
                        <div class="flex justify-between text-[11px] font-bold text-slate-700">
                            <span>${logs.length}/16 Modul</span>
                            <span class="text-emerald-600 font-extrabold">${readPct}%</span>
                        </div>
                        <div class="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden p-0.5 border border-slate-300/40">
                            <div class="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300" style="width: ${readPct}%"></div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="w-32 space-y-1">
                        <div class="flex justify-between text-[11px] font-bold text-slate-700">
                            <span>${doneQuizzes}/${targetQuizzes.length} Kuis</span>
                            <span class="text-purple-600 font-extrabold">${quizPct}%</span>
                        </div>
                        <div class="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden p-0.5 border border-slate-300/40">
                            <div class="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-300" style="width: ${quizPct}%"></div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-right space-x-1.5">
                    <button onclick="openEditStudentModal('${s.username}')" class="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-xl text-xs font-bold"><i class="fa-solid fa-pen mr-1"></i> Edit</button>
                    <button onclick="resetStudentPasswordPrompt('${s.username}')" class="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold"><i class="fa-solid fa-key mr-1"></i> Reset</button>
                    <button onclick="deleteStudentAccount('${s.username}')" class="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}
function openAddStudentModal() {
    document.getElementById('addStudentForm').reset();
    document.getElementById('studentModalTitle').innerText = 'Tambah Siswa Baru';
    document.getElementById('editOriginalUsername').value = '';
    document.getElementById('addStdName').value = '';
    document.getElementById('addStdUsername').value = '';
    document.getElementById('addStdPass').value = '123456';
    openModal('addStudentModal');
}
function openEditStudentModal(username) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const student = users.find(u => u.username === username);
    if (!student) return;
    document.getElementById('studentModalTitle').innerText = 'Edit Data Siswa';
    document.getElementById('editOriginalUsername').value = student.username;
    document.getElementById('addStdName').value = student.name;
    document.getElementById('addStdUsername').value = student.username;
    document.getElementById('addStdClass').value = student.class;
    document.getElementById('addStdPass').value = student.password;
    openModal('addStudentModal');
}
function handleAddStudentSubmit(e) {
    e.preventDefault();
    const origUsername = document.getElementById('editOriginalUsername').value;
    const name = document.getElementById('addStdName').value.trim();
    const username = document.getElementById('addStdUsername').value.trim();
    const selectedClass = document.getElementById('addStdClass').value;
    const password = document.getElementById('addStdPass').value.trim();
    let users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    if (origUsername) {
        const idx = users.findIndex(u => u.username === origUsername);
        if (idx !== -1) {
            users[idx] = { username, password, name, role: 'siswa', class: selectedClass };
        }
    } else {
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) return showToast('Username sudah terpakai!', 'error');
        users.push({ username, password, name, role: 'siswa', class: selectedClass });
    }
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    triggerSyncEvent();
    document.getElementById('addStudentForm').reset();
    closeModal('addStudentModal');
    showToast('Data akun siswa berhasil disimpan!');
    renderTeacherStudentList();
}
function resetStudentPasswordPrompt(username) {
    const newPass = prompt(`Masukkan password baru untuk ${username}:`, '123456');
    if (newPass && newPass.trim() !== '') {
        let users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
        const idx = users.findIndex(u => u.username === username);
        if (idx !== -1) {
            users[idx].password = newPass.trim();
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
            triggerSyncEvent();
            showToast(`Password ${username} direset!`);
        }
    }
}
function deleteStudentAccount(username) {
    if (confirm(`Yakin ingin menghapus akun siswa ${username}?`)) {
        let users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
        users = users.filter(u => u.username !== username);
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
        triggerSyncEvent();
        showToast('Akun siswa telah dihapus.');
        renderTeacherStudentList();
    }
}
function getMonthDaysAndYear(monthKey) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 7 ? year : year - 1;
    const endYear = startYear + 1;
    const monthMap = {
        "JULI": { mIndex: 6, year: startYear }, "AGUST": { mIndex: 7, year: startYear },
        "SEPT": { mIndex: 8, year: startYear }, "OKT": { mIndex: 9, year: startYear },
        "NOV": { mIndex: 10, year: startYear }, "DES": { mIndex: 11, year: startYear },
        "JAN": { mIndex: 0, year: endYear }, "FEB": { mIndex: 1, year: endYear },
        "MAR": { mIndex: 2, year: endYear }, "APR": { mIndex: 3, year: endYear },
        "MEI": { mIndex: 4, year: endYear }, "JUN": { mIndex: 5, year: endYear }
    };
    const info = monthMap[monthKey] || { mIndex: 7, year: startYear };
    const daysInMonth = new Date(info.year, info.mIndex + 1, 0).getDate();
    return { daysCount: daysInMonth, year: info.year, mIndex: info.mIndex };
}
function isAttendanceWeekend(monthKey, day) {
    const monthInfo = getMonthDaysAndYear(monthKey);
    const dateObj = new Date(monthInfo.year, monthInfo.mIndex, Number(day));
    return dateObj.getDay() === 0 || dateObj.getDay() === 6;
}
function loadAttendanceForm() {
    const selectedClass = document.getElementById('attClassSelect').value;
    const currentMonth = document.getElementById('attMonthSelect').value;
    const monthInfo = getMonthDaysAndYear(currentMonth);
    const totalDays = monthInfo.daysCount;
    const monthOpt = document.getElementById('attMonthSelect');
    const monthText = monthOpt.options[monthOpt.selectedIndex].text;
    if (document.getElementById('currentMonthLabel')) document.getElementById('currentMonthLabel').innerText = monthText;
    if (document.getElementById('currentMonthProgressLabel')) document.getElementById('currentMonthProgressLabel').innerText = monthText;
    if (document.getElementById('quickBoxClassLabel')) document.getElementById('quickBoxClassLabel').innerText = `Kelas ${selectedClass}`;
    activeAbsenceDay = Math.min(Math.max(Number(activeAbsenceDay) || 1, 1), totalDays);
    if (isAttendanceWeekend(currentMonth, activeAbsenceDay)) {
        let replacementDay = null;
        for (let distance = 1; distance < totalDays; distance++) {
            const previousDay = activeAbsenceDay - distance;
            const nextDay = activeAbsenceDay + distance;
            if (previousDay >= 1 && !isAttendanceWeekend(currentMonth, previousDay)) {
                replacementDay = previousDay;
                break;
            }
            if (nextDay <= totalDays && !isAttendanceWeekend(currentMonth, nextDay)) {
                replacementDay = nextDay;
                break;
            }
        }
        if (replacementDay !== null) activeAbsenceDay = replacementDay;
    }
    const activeDaySelect = document.getElementById('attActiveDaySelect');
    if (activeDaySelect) {
        activeDaySelect.innerHTML = '';
        const monthInfoForDay = getMonthDaysAndYear(currentMonth);
        for (let d = 1; d <= totalDays; d++) {
            const opt = document.createElement('option');
            const isWeekend = isAttendanceWeekend(currentMonth, d);
            const weekday = new Date(monthInfoForDay.year, monthInfoForDay.mIndex, d).getDay();
            const weekdayName = weekday === 6 ? 'Sabtu' : 'Minggu';
            opt.value = d;
            opt.innerText = isWeekend ? `Tanggal ${d} (${weekdayName} - Libur)` : `Tanggal ${d}`;
            opt.disabled = isWeekend;
            if (isWeekend) opt.style.color = '#b91c1c';
            if (d === activeAbsenceDay) opt.selected = true;
            activeDaySelect.appendChild(opt);
        }
    }
    if (document.getElementById('tanggalHeaderGroup')) document.getElementById('tanggalHeaderGroup').colSpan = totalDays;
    const daysHeader = document.getElementById('absensiDaysHeader');
    if (daysHeader) {
        daysHeader.innerHTML = '';
        for (let d = 1; d <= totalDays; d++) {
            const isWeekend = isAttendanceWeekend(currentMonth, d);
            daysHeader.innerHTML += `<th title="${isWeekend ? 'Sabtu/Minggu: presensi tidak tersedia' : ''}" class="p-1 text-center w-7 ${isWeekend ? 'is-weekend' : ''}">${d}</th>`;
        }
    }
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const students = users.filter(u => u.role === 'siswa' && u.class === selectedClass);
    const storageKey = `eduTech_abs_${selectedClass}_${currentMonth}`;
    const monthData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const tbody = document.getElementById('attendanceListBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${totalDays + 7}" class="p-6 text-center text-xs text-slate-400 font-medium">Belum ada siswa terdaftar di Kelas ${selectedClass}.</td></tr>`;
        buildStudentPickerGrid();
        updateAbsenceProgressTracker();
        renderRekapAttendance();
        return;
    }
    students.forEach((st, idx) => {
        const studentAbs = monthData[st.username] || {};
        let daysHtml = '';
        for (let d = 1; d <= totalDays; d++) {
            const val = studentAbs[d] || '';
            const isWeekend = isAttendanceWeekend(currentMonth, d);
            let statusClass = '';
            const code = val.toUpperCase().trim();
            if (code === 'H' || code === '.' || code === '1') statusClass = 'filled-h';
            else if (code === 'S') statusClass = 'filled-s';
            else if (code === 'I') statusClass = 'filled-i';
            else if (code === 'A') statusClass = 'filled-a';
            daysHtml += `<td title="${isWeekend ? 'Sabtu/Minggu: presensi tidak tersedia' : ''}" class="text-center p-1 ${isWeekend ? 'is-weekend' : ''}">
                <input type="text" title="${isWeekend ? 'Presensi tidak dapat diisi pada akhir pekan' : ''}" class="day-cell ${statusClass}" data-username="${st.username}" data-day="${d}" value="${isWeekend ? '' : val}" maxlength="1" ${isWeekend ? 'disabled' : ''}>
            </td>`;
        }
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-indigo-50/40 transition';
        tr.innerHTML = `
            <td class="p-2 text-center font-bold text-slate-500 sticky left-0 bg-white z-20 border-r border-slate-200 w-[48px] min-w-[48px] max-w-[48px]">${idx + 1}</td>
            <td class="p-2 font-bold text-slate-800 sticky left-[48px] bg-white z-20 border-r-2 border-slate-200 whitespace-nowrap w-[220px] min-w-[220px] max-w-[220px] sticky-shadow">${st.name}</td>
            ${daysHtml}
            <td class="text-center font-bold text-slate-800 p-1" id="stat_h_${st.username}">0</td>
            <td class="text-center font-bold text-slate-800 p-1" id="stat_s_${st.username}">0</td>
            <td class="text-center font-bold text-slate-800 p-1" id="stat_i_${st.username}">0</td>
            <td class="text-center font-bold text-slate-800 p-1" id="stat_a_${st.username}">0</td>
            <td class="text-center p-1"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200" id="stat_pct_${st.username}">0%</span></td>
        `;
        tbody.appendChild(tr);
        calcStudentAbsensi(st.username, storageKey, currentMonth);
    });
    document.querySelectorAll('#attendanceListBody input.day-cell:not(:disabled)').forEach(input => {
        input.addEventListener('input', e => {
            const username = e.target.dataset.username;
            const day = e.target.dataset.day;
            const val = e.target.value.toUpperCase();
            e.target.value = val;
            e.target.classList.remove('filled-h', 'filled-s', 'filled-i', 'filled-a');
            if (val === 'H' || val === '.' || val === '1') e.target.classList.add('filled-h');
            else if (val === 'S') e.target.classList.add('filled-s');
            else if (val === 'I') e.target.classList.add('filled-i');
            else if (val === 'A') e.target.classList.add('filled-a');
            saveAbsensiVal(selectedClass, currentMonth, username, day, val);
            calcStudentAbsensi(username, storageKey, currentMonth);
            updateAbsenceProgressTracker();
            renderRekapAttendance();
        });
    });
    buildStudentPickerGrid();
    updateAbsenceProgressTracker();
    renderRekapAttendance();
}
function changeActiveAbsenceDay(dayVal) {
    const currentMonth = document.getElementById('attMonthSelect').value;
    const requestedDay = parseInt(dayVal, 10);
    if (!Number.isInteger(requestedDay) || isAttendanceWeekend(currentMonth, requestedDay)) {
        const activeDaySelect = document.getElementById('attActiveDaySelect');
        if (activeDaySelect) activeDaySelect.value = String(activeAbsenceDay);
        showToast(`Tanggal ${dayVal} adalah Sabtu/Minggu dan tidak dapat dipilih untuk presensi.`, 'error');
        return;
    }
    activeAbsenceDay = requestedDay;
    if (document.getElementById('quickBoxDayLabel')) document.getElementById('quickBoxDayLabel').innerText = requestedDay;
    if (document.getElementById('activeDayProgressText')) document.getElementById('activeDayProgressText').innerText = requestedDay;
    updateAbsenceProgressTracker();
}
function saveAbsensiVal(selectedClass, currentMonth, username, day, val) {
    const storageKey = `eduTech_abs_${selectedClass}_${currentMonth}`;
    const monthData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (!monthData[username]) monthData[username] = {};
    monthData[username][day] = val;
    localStorage.setItem(storageKey, JSON.stringify(monthData));
    triggerSyncEvent();
}
function calcStudentAbsensi(username, storageKey, monthKey) {
    const monthData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const studentAbs = monthData[username] || {};
    const resolvedMonthKey = monthKey || storageKey.split('_').slice(3).join('_');
    let h = 0, s = 0, i = 0, a = 0;
    Object.entries(studentAbs).forEach(([day, v]) => {
        if (isAttendanceWeekend(resolvedMonthKey, day)) return;
        const code = String(v).toUpperCase().trim();
        if (code === 'H' || code === '.' || code === '1') h++;
        else if (code === 'S') s++;
        else if (code === 'I') i++;
        else if (code === 'A') a++;
    });
    const total = h + s + i + a;
    const pct = total > 0 ? Math.round((h / total) * 100) : 0;
    if (document.getElementById(`stat_h_${username}`)) document.getElementById(`stat_h_${username}`).innerText = h;
    if (document.getElementById(`stat_s_${username}`)) document.getElementById(`stat_s_${username}`).innerText = s;
    if (document.getElementById(`stat_i_${username}`)) document.getElementById(`stat_i_${username}`).innerText = i;
    if (document.getElementById(`stat_a_${username}`)) document.getElementById(`stat_a_${username}`).innerText = a;
    const elPct = document.getElementById(`stat_pct_${username}`);
    if (elPct) {
        elPct.innerText = `${pct}%`;
        elPct.className = `px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200`;
    }
}
function updateAbsenceProgressTracker() {
    const selectedClass = document.getElementById('attClassSelect').value;
    const currentMonth = document.getElementById('attMonthSelect').value;
    const storageKey = `eduTech_abs_${selectedClass}_${currentMonth}`;
    const monthData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const students = users.filter(u => u.role === 'siswa' && u.class === selectedClass);
    let completed = 0;
    let lastDoneName = '-';
    const activeDayIsWeekend = isAttendanceWeekend(currentMonth, activeAbsenceDay);
    if (!activeDayIsWeekend) {
        students.forEach(st => {
            const val = (monthData[st.username] || {})[activeAbsenceDay] || '';
            if (String(val).trim() !== '') {
                completed++;
                lastDoneName = st.name;
            }
        });
    } else {
        lastDoneName = 'Sabtu/Minggu (libur)';
    }
    if (document.getElementById('completedAbsenceCount')) {
        document.getElementById('completedAbsenceCount').innerText = activeDayIsWeekend ? `Hari Libur / ${students.length} Siswa` : `${completed} / ${students.length} Siswa`;
    }
    if (document.getElementById('lastAbsenceDoneName')) document.getElementById('lastAbsenceDoneName').innerText = lastDoneName;
}
function buildStudentPickerGrid() {
    const grid = document.getElementById('studentPickerGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const selectedClass = document.getElementById('attClassSelect').value;
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const students = users.filter(u => u.role === 'siswa' && u.class === selectedClass);
    if (document.getElementById('pickerGridTitle')) {
        document.getElementById('pickerGridTitle').innerText = `2. Pilih Siswa Pengecualian Kelas ${selectedClass} (Sakit / Izin / Alpa):`;
    }
    if (students.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-slate-400 italic text-[11px] p-2 text-center">Tidak ada siswa terdaftar di Kelas ${selectedClass}.</p>`;
        return;
    }
    students.forEach((st, idx) => {
        const item = document.createElement('label');
        item.className = 'flex items-center gap-2 p-2 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-200/80 cursor-pointer font-semibold text-slate-800 truncate transition';
        item.innerHTML = `<input type="checkbox" class="student-select-cb text-brand-600 rounded" data-username="${st.username}"> <span class="font-extrabold text-indigo-600 text-xs">${idx + 1}.</span> <span class="truncate text-xs">${st.name}</span>`;
        grid.appendChild(item);
    });
}
function applyAutoHadirAll() {
    const selectedClass = document.getElementById('attClassSelect').value;
    const currentMonth = document.getElementById('attMonthSelect').value;
    const monthInfo = getMonthDaysAndYear(currentMonth);
    const dateObj = new Date(monthInfo.year, monthInfo.mIndex, activeAbsenceDay);
    if (dateObj.getDay() === 0 || dateObj.getDay() === 6) return showToast(`Tanggal ${activeAbsenceDay} adalah hari libur (Sabtu/Minggu).`, 'error');
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const students = users.filter(u => u.role === 'siswa' && u.class === selectedClass);
    if (students.length === 0) return showToast(`Belum ada siswa di Kelas ${selectedClass}!`, 'error');
    const storageKey = `eduTech_abs_${selectedClass}_${currentMonth}`;
    const monthData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    students.forEach(st => {
        if (!monthData[st.username]) monthData[st.username] = {};
        monthData[st.username][activeAbsenceDay] = 'H';
    });
    localStorage.setItem(storageKey, JSON.stringify(monthData));
    triggerSyncEvent();
    showToast(`Semua siswa Kelas ${selectedClass} diset HADIR (H) Tanggal ${activeAbsenceDay}!`);
    loadAttendanceForm();
}
function applyExclusionToSelected(statusCode) {
    const selectedClass = document.getElementById('attClassSelect').value;
    const checkboxes = document.querySelectorAll('.student-select-cb:checked');
    if (checkboxes.length === 0) return showToast('Silakan centang siswa pengecualian terlebih dahulu.', 'error');
    const currentMonth = document.getElementById('attMonthSelect').value;
    if (isAttendanceWeekend(currentMonth, activeAbsenceDay)) {
        return showToast(`Tanggal ${activeAbsenceDay} adalah Sabtu/Minggu dan tidak dapat diisi presensi.`, 'error');
    }
    const storageKey = `eduTech_abs_${selectedClass}_${currentMonth}`;
    const monthData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    checkboxes.forEach(cb => {
        const username = cb.dataset.username;
        if (!monthData[username]) monthData[username] = {};
        monthData[username][activeAbsenceDay] = statusCode;
    });
    localStorage.setItem(storageKey, JSON.stringify(monthData));
    triggerSyncEvent();
    showToast(`Status siswa tercentang di Kelas ${selectedClass} diubah ke ${statusCode}!`);
    loadAttendanceForm();
}
function clearAbsenceActiveDay() {
    const selectedClass = document.getElementById('attClassSelect').value;
    const currentMonth = document.getElementById('attMonthSelect').value;
    if (isAttendanceWeekend(currentMonth, activeAbsenceDay)) {
        return showToast(`Tanggal ${activeAbsenceDay} adalah Sabtu/Minggu dan tidak dapat diubah.`, 'error');
    }
    if (!confirm(`Hapus seluruh data absensi Tanggal ${activeAbsenceDay} untuk Kelas ${selectedClass}?`)) return;
    const storageKey = `eduTech_abs_${selectedClass}_${currentMonth}`;
    const monthData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    Object.keys(monthData).forEach(u => {
        if (monthData[u][activeAbsenceDay]) delete monthData[u][activeAbsenceDay];
    });
    localStorage.setItem(storageKey, JSON.stringify(monthData));
    triggerSyncEvent();
    showToast(`Data absensi Tanggal ${activeAbsenceDay} Kelas ${selectedClass} dibersihkan.`);
    loadAttendanceForm();
}
function renderRekapAttendance() {
    const selectedClass = document.getElementById('attClassSelect').value;
    const tbody = document.getElementById('rekapAttendanceBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const students = users.filter(u => u.role === 'siswa' && u.class === selectedClass);
    if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="51" class="p-4 text-center text-xs text-slate-400">Tidak ada data siswa di Kelas ${selectedClass}.</td></tr>`;
        return;
    }
    students.forEach((st, idx) => {
        let monthCols = '';
        let totH = 0, totS = 0, totI = 0, totA = 0;
        MONTHS_KEYS.forEach(mKey => {
            const storageKey = `eduTech_abs_${selectedClass}_${mKey}`;
            const mData = JSON.parse(localStorage.getItem(storageKey) || '{}');
            const stAbs = mData[st.username] || {};
            let h = 0, s = 0, i = 0, a = 0;
            Object.entries(stAbs).forEach(([day, v]) => {
                if (isAttendanceWeekend(mKey, day)) return;
                const code = String(v).toUpperCase().trim();
                if (code === 'H' || code === '.' || code === '1') h++;
                else if (code === 'S') s++;
                else if (code === 'I') i++;
                else if (code === 'A') a++;
            });
            totH += h; totS += s; totI += i; totA += a;
            monthCols += `
                <td class="${h > 0 ? 'text-slate-800 font-semibold' : 'text-slate-400'}">${h || '-'}</td>
                <td class="${s > 0 ? 'text-slate-800 font-semibold' : 'text-slate-400'}">${s || '-'}</td>
                <td class="${i > 0 ? 'text-slate-800 font-semibold' : 'text-slate-400'}">${i || '-'}</td>
                <td class="${a > 0 ? 'text-slate-800 font-semibold' : 'text-slate-400'}">${a || '-'}</td>
            `;
        });
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 transition';
        tr.innerHTML = `
            <td class="p-2 font-bold text-slate-500 text-center sticky left-0 bg-white z-20 border-r border-slate-200 w-[48px] min-w-[48px] max-w-[48px]">${idx + 1}</td>
            <td class="p-2 font-bold text-slate-800 text-left whitespace-nowrap sticky left-[48px] bg-white z-20 border-r-2 border-slate-200 w-[220px] min-w-[220px] max-w-[220px] sticky-shadow">${st.name}</td>
            ${monthCols}
            <td class="font-bold text-slate-900 bg-slate-100">${totH || '-'}</td>
            <td class="font-bold text-slate-900 bg-slate-100">${totS || '-'}</td>
            <td class="font-bold text-slate-900 bg-slate-100">${totI || '-'}</td>
            <td class="font-bold text-slate-900 bg-slate-100">${totA || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}
function chunkPrintRows(items, pageSize = 24) {
    const safeSize = Math.max(1, Number(pageSize) || 24);
    const chunks = [];
    for (let index = 0; index < items.length; index += safeSize) {
        chunks.push(items.slice(index, index + safeSize));
    }
    return chunks;
}
let attendancePrintMode = 'month';
function openAttendancePrintModal(mode = 'month') {
    attendancePrintMode = mode;
    renderAttendancePrintReport();
    openModal('printAttendanceModal');
    document.body.classList.add('is-printing-attendance');
}
function closeAttendancePrintModal() {
    closeModal('printAttendanceModal');
    document.body.classList.remove('is-printing-attendance');
}
function switchAttendancePrintMode(mode) {
    attendancePrintMode = mode;
    renderAttendancePrintReport();
}
function executeAttendancePrint() {
    document.body.classList.add('is-printing-attendance');
    window.print();
}
function renderAttendancePrintReport() {
    const sheet = document.getElementById('attendancePrintSheet');
    if (!sheet) return;
    const classSelect = document.getElementById('attClassSelect');
    const selectedClass = classSelect ? classSelect.value : '5A';
    const monthSelect = document.getElementById('attMonthSelect');
    const currentMonthKey = monthSelect ? monthSelect.value : 'AGUST';
    const monthName = monthSelect && monthSelect.selectedIndex >= 0
        ? monthSelect.options[monthSelect.selectedIndex].text
        : currentMonthKey;
    const btnMonth = document.getElementById('btnPrintModeMonth');
    const btnYear = document.getElementById('btnPrintModeYear');
    if (btnMonth && btnYear) {
        if (attendancePrintMode === 'month') {
            btnMonth.className = 'px-3 py-1.5 rounded-lg font-bold transition bg-white text-brand-700 shadow-sm';
            btnYear.className = 'px-3 py-1.5 rounded-lg font-bold transition text-indigo-200 hover:text-white';
        } else {
            btnYear.className = 'px-3 py-1.5 rounded-lg font-bold transition bg-white text-brand-700 shadow-sm';
            btnMonth.className = 'px-3 py-1.5 rounded-lg font-bold transition text-indigo-200 hover:text-white';
        }
    }
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const students = users.filter(u => u.role === 'siswa' && u.class === selectedClass);
    const teacherName = currentUser ? currentUser.name : 'Guru Pengampu TIK';
    const teacherNip = (currentUser && currentUser.nip && currentUser.nip !== '-') ? currentUser.nip : '-';
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const formattedDate = `${days[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const periodLabel = attendancePrintMode === 'month'
        ? `Bulan ${monthName} (T.A 2026/2027)`
        : 'Tahun Ajaran 2026/2027 Penuh (12 Bulan)';
    let sumH = 0, sumS = 0, sumI = 0, sumA = 0, totalPctSum = 0;
    const reportRows = students.map((st, index) => {
        let h = 0, s = 0, i = 0, a = 0;
        const countValue = value => {
            const code = String(value).toUpperCase().trim();
            if (code === 'H' || code === '.' || code === '1') h++;
            else if (code === 'S') s++;
            else if (code === 'I') i++;
            else if (code === 'A') a++;
        };
        if (attendancePrintMode === 'month') {
            const storageKey = `eduTech_abs_${selectedClass}_${currentMonthKey}`;
            const monthData = JSON.parse(localStorage.getItem(storageKey) || '{}');
            Object.entries(monthData[st.username] || {}).forEach(([day, value]) => {
                if (!isAttendanceWeekend(currentMonthKey, day)) countValue(value);
            });
        } else {
            MONTHS_KEYS.forEach(monthKey => {
                const storageKey = `eduTech_abs_${selectedClass}_${monthKey}`;
                const monthData = JSON.parse(localStorage.getItem(storageKey) || '{}');
                Object.entries(monthData[st.username] || {}).forEach(([day, value]) => {
                    if (!isAttendanceWeekend(monthKey, day)) countValue(value);
                });
            });
        }
        const total = h + s + i + a;
        const pct = total > 0 ? Math.round((h / total) * 100) : 0;
        sumH += h; sumS += s; sumI += i; sumA += a; totalPctSum += pct;
        return { student: st, index, h, s, i, a, pct };
    });
    const avgPct = students.length ? Math.round(totalPctSum / students.length) : 0;
    const pageChunks = reportRows.length ? chunkPrintRows(reportRows, 24) : [[]];
    const totalPages = pageChunks.length;
    const pagesHtml = pageChunks.map((pageRows, pageIndex) => {
        const rowsHtml = pageRows.length
            ? pageRows.map(row => `
                <tr class="attendance-student-row">
                    <td class="p-2.5 border border-slate-400 text-center font-bold w-12">${row.index + 1}</td>
                    <td class="p-2.5 border border-slate-400 font-bold">${row.student.name}</td>
                    <td class="p-2.5 border border-slate-400 text-center font-bold w-16">${row.h}</td>
                    <td class="p-2.5 border border-slate-400 text-center font-bold w-16">${row.s}</td>
                    <td class="p-2.5 border border-slate-400 text-center font-bold w-16">${row.i}</td>
                    <td class="p-2.5 border border-slate-400 text-center font-bold w-16">${row.a}</td>
                    <td class="p-2.5 border border-slate-400 text-center font-bold w-20">${row.pct}%</td>
                </tr>`).join('')
            : `<tr class="attendance-empty-row"><td aria-hidden="true"></td><td class="attendance-empty-message-cell">Belum ada siswa terdaftar di Kelas ${selectedClass}.</td><td></td><td></td><td></td><td></td><td></td></tr>`;
        const attendanceRowHeight = pageRows.length >= 19
            ? Math.max(26, Math.min(30, Math.round(45.2 - (0.8 * pageRows.length))))
            : 26;
        return `
        <section class="print-page attendance-report-page" data-print-page="${pageIndex + 1}" style="--attendance-row-height:${attendanceRowHeight}px">
            <div class="pb-3 mb-3 border-b-2 border-slate-900">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 shrink-0 flex items-center justify-center">
                        <img src="asset/EduTech Kids.png" alt="EduTech Kids Logo" class="w-full h-full object-contain">
                    </div>
                    <div class="flex-1 text-center pr-12">
                        <h2 class="text-base sm:text-lg font-black tracking-wider uppercase">EduTech Kids eLearning TIK</h2>
                        <h3 class="text-xs sm:text-sm font-extrabold uppercase tracking-wide mt-0.5">Laporan Rekapitulasi Presensi Peserta Didik</h3>
                        <p class="text-[11px] sm:text-xs font-medium mt-0.5">Portal Pembelajaran Interaktif TIK SD • Tahun Ajaran 2026/2027</p>
                    </div>
                </div>
            </div>
            <div class="print-report-info grid grid-cols-2 gap-3 mb-3 text-xs p-3 border border-slate-400">
                <div class="space-y-1">
                    <p><span class="font-bold inline-block w-28">Kelas TIK</span>: <span class="font-extrabold">Kelas ${selectedClass}</span></p>
                    <p><span class="font-bold inline-block w-28">Periode Rekap</span>: <span class="font-extrabold">${periodLabel}</span></p>
                    <p><span class="font-bold inline-block w-28">Mata Pelajaran</span>: <span class="font-semibold">Teknologi Informasi & Komunikasi (TIK)</span></p>
                </div>
                <div class="space-y-1">
                    <p><span class="font-bold inline-block w-28">Tahun Ajaran</span>: <span class="font-extrabold">2026 / 2027</span></p>
                    <p class="print-teacher-line"><span class="font-bold print-teacher-label">Guru Pengampu</span><span class="print-teacher-separator">:</span><span class="font-extrabold print-teacher-name">${teacherName}</span></p>
                    <p><span class="font-bold inline-block w-28">Tanggal Cetak</span>: <span class="font-semibold">${formattedDate}</span></p>
                </div>
            </div>
            <p class="text-right text-[10px] mb-1">Halaman ${pageIndex + 1} dari ${totalPages}</p>
            <table class="print-report-table attendance-print-table w-full text-xs text-left border-collapse border border-slate-400">
                <colgroup><col style="width:7%"><col style="width:43%"><col style="width:9.5%"><col style="width:9.5%"><col style="width:9.5%"><col style="width:9.5%"><col style="width:12%"></colgroup>
                <thead>
                    <tr class="font-extrabold text-center uppercase tracking-wider">
                        <th class="p-2.5 border border-slate-400 w-12 text-center">NO.</th>
                        <th class="p-2.5 border border-slate-400 text-center">NAMA SISWA</th>
                        <th class="p-2.5 border border-slate-400 w-16"><span>HADIR</span><br><span>(H)</span></th>
                        <th class="p-2.5 border border-slate-400 w-16"><span>SAKIT</span><br><span>(S)</span></th>
                        <th class="p-2.5 border border-slate-400 w-16"><span>IZIN</span><br><span>(I)</span></th>
                        <th class="p-2.5 border border-slate-400 w-16"><span>ALPA</span><br><span>(A)</span></th>
                        <th class="p-2.5 border border-slate-400 w-20"><span>HADIR</span><br><span>%</span></th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
                <tfoot>
                    <tr class="font-bold border-t-2 border-slate-400">
                        <td colspan="2" class="p-2.5 text-center uppercase border border-slate-400 tracking-wide font-extrabold">Total & Rata-Rata Kelas (${students.length} Siswa)</td>
                        <td class="p-2.5 text-center border border-slate-400 font-extrabold text-sm">${sumH}</td>
                        <td class="p-2.5 text-center border border-slate-400 font-extrabold text-sm">${sumS}</td>
                        <td class="p-2.5 text-center border border-slate-400 font-extrabold text-sm">${sumI}</td>
                        <td class="p-2.5 text-center border border-slate-400 font-extrabold text-sm">${sumA}</td>
                        <td class="p-2.5 text-center border border-slate-400 font-extrabold text-sm">${avgPct}%</td>
                    </tr>
                </tfoot>
            </table>
            <div class="mt-5 pt-2 flex justify-between items-end text-xs break-inside-avoid">
                <div class="space-y-1 max-w-sm">
                    <p class="font-bold">Keterangan Singkatan:</p>
                    <p>• <b>H</b> = Hadir & Mengikuti Pembelajaran TIK</p>
                    <p>• <b>S</b> = Sakit dengan Surat / Pemberitahuan</p>
                    <p>• <b>I</b> = Izin / Dispensasi Kegiatan Sekolah</p>
                    <p>• <b>A</b> = Alpa / Tanpa Keterangan</p>
                </div>
                <div class="text-center min-w-[200px]">
                    <p class="mb-1">Dicetak pada: ${formattedDate}</p>
                    <p class="font-bold">Guru Pengampu TIK,</p>
                    <div class="h-14"></div>
                    <p class="font-extrabold underline text-sm tracking-wide">${teacherName}</p>
                    <p class="font-medium text-[11px] mt-0.5">NIP: ${teacherNip}</p>
                </div>
            </div>
        </section>`;
    }).join('');
    sheet.innerHTML = pagesHtml;
}
function openGradingPrintModal() {
    renderGradingPrintReport();
    openModal('printGradingModal');
    document.body.classList.add('is-printing-grading');
}
function closeGradingPrintModal() {
    closeModal('printGradingModal');
    document.body.classList.remove('is-printing-grading');
}
function executeGradingPrint() {
    document.body.classList.add('is-printing-grading');
    window.print();
}
function renderGradingPrintReport() {
    const sheet = document.getElementById('gradingPrintSheet');
    if (!sheet) return;
    const quizSelect = document.getElementById('rekapQuizSelect');
    const quizId = quizSelect ? quizSelect.value : '';
    const quizTitle = quizSelect && quizSelect.selectedIndex >= 0
        ? quizSelect.options[quizSelect.selectedIndex].text
        : 'Kuis TIK';
    const classSelect = document.getElementById('rekapClassSelect');
    const filterClass = classSelect ? classSelect.value : 'ALL';
    const allClassLabel = 'Semua Kelas (5 & 6)';
    const results = JSON.parse(localStorage.getItem(STORAGE_KEY_RESULTS) || '[]');
    const quizzesForPrint = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    const selectedQuizData = quizzesForPrint.find(q => q.id === quizId);
    const selectedQuizNeedsManualReview = selectedQuizData && (Number(selectedQuizData.keyVersion) || 0) < 2 && selectedQuizData.questions.some(q => q.type === 'pg');
    let filteredResults = results.filter(result => result.quizId === quizId);
    if (filterClass !== 'ALL') {
        filteredResults = filteredResults.filter(result => result.studentClass === filterClass);
    }
    const teacherName = currentUser ? currentUser.name : 'Guru Pengampu TIK';
    const teacherNip = (currentUser && currentUser.nip && currentUser.nip !== '-') ? currentUser.nip : '-';
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const formattedDate = `${days[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
    let groupedResults;
    if (filterClass === 'ALL' && filteredResults.length) {
        const classOrder = ['5A', '5B', '5C', '5D', '6A', '6B', '6C', '6D'];
        const distinctClasses = [...new Set(filteredResults.map(result => result.studentClass || '-'))];
        distinctClasses.sort((a, b) => {
            const ai = classOrder.indexOf(a);
            const bi = classOrder.indexOf(b);
            if (ai === -1 && bi === -1) return String(a).localeCompare(String(b));
            if (ai === -1) return 1;
            if (bi === -1) return -1;
            return ai - bi;
        });
        groupedResults = distinctClasses.map(className => ({
            className,
            results: filteredResults.filter(result => (result.studentClass || '-') === className)
        }));
    } else {
        groupedResults = [{
            className: filterClass === 'ALL' ? allClassLabel : filterClass,
            results: filteredResults
        }];
    }
    const pages = [];
    groupedResults.forEach(group => {
        const chunks = group.results.length ? chunkPrintRows(group.results, 24) : [[]];
        chunks.forEach((chunk, chunkIndex) => {
            pages.push({
                className: group.className,
                allResults: group.results,
                rows: chunk,
                pageWithinClass: chunkIndex + 1,
                pagesInClass: chunks.length
            });
        });
    });
    if (!pages.length) pages.push({ className: filterClass === 'ALL' ? allClassLabel : filterClass, allResults: [], rows: [], pageWithinClass: 1, pagesInClass: 1 });
    const totalPages = pages.length;
    const pagesHtml = pages.map((page, pageIndex) => {
        const pageClassLabel = filterClass === 'ALL'
            ? (page.className === allClassLabel ? allClassLabel : `Kelas ${page.className}`)
            : `Kelas ${filterClass}`;
        const rowsHtml = page.rows.length
            ? page.rows.map(result => `
                <tr class="grading-student-row">
                    <td class="border border-slate-400 text-center font-bold">${page.allResults.indexOf(result) + 1}</td>
                    <td class="border border-slate-400 font-bold">${result.studentName || '-'}</td>
                    <td class="border border-slate-400 text-center font-semibold">${result.studentClass || '-'}</td>
                    <td class="border border-slate-400 text-center">${result.date || '-'}</td>
                    <td class="border border-slate-400 text-center font-extrabold">${selectedQuizNeedsManualReview && !result.manualReviewed ? 'Perlu koreksi' : (result.finalScore === null || result.finalScore === undefined ? 'Belum dinilai' : `${Number(result.finalScore) || 0} / 100`)}</td>
                </tr>`).join('')
            : `<tr class="grading-empty-row"><td colspan="5" class="border border-slate-400 text-center italic">Belum ada data pengerjaan untuk kuis ini.</td></tr>`;
        const scoredResults = page.allResults.filter(result => result.finalScore !== null && result.finalScore !== undefined && result.finalScore !== '' && !(selectedQuizNeedsManualReview && !result.manualReviewed));
        const sumScore = scoredResults.reduce((sum, result) => sum + (Number(result.finalScore) || 0), 0);
        const avgScore = scoredResults.length ? Math.round(sumScore / scoredResults.length) : 0;
        const avgLabel = filterClass === 'ALL' ? pageClassLabel : `Kelas ${filterClass}`;
        const gradingRowHeight = page.rows.length >= 19
            ? Math.max(24, Math.min(29, Math.round(48 - page.rows.length)))
            : 28;
        return `
        <section class="print-page grading-report-page" data-print-page="${pageIndex + 1}" data-print-class="${page.className}" data-result-count="${page.rows.length}" style="--grading-row-height:${gradingRowHeight}px">
            <div class="pb-3 mb-3 border-b-2 border-slate-900">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 shrink-0 flex items-center justify-center">
                        <img src="asset/EduTech Kids.png" alt="EduTech Kids Logo" class="w-full h-full object-contain">
                    </div>
                    <div class="flex-1 text-center pr-12">
                        <h2 class="text-base sm:text-lg font-black tracking-wider uppercase">EduTech Kids eLearning TIK</h2>
                        <h3 class="text-xs sm:text-sm font-extrabold uppercase tracking-wide mt-0.5">Laporan Rekapitulasi Nilai Kuis Peserta Didik</h3>
                        <p class="text-[11px] sm:text-xs font-medium mt-0.5">Portal Pembelajaran Interaktif TIK SD • Tahun Ajaran 2026/2027</p>
                    </div>
                </div>
            </div>
            <div class="print-report-info grid grid-cols-2 gap-3 mb-3 text-xs p-3 border border-slate-400">
                <div class="space-y-1">
                    <p><span class="font-bold inline-block w-28">Nama Kuis</span>: <span class="font-extrabold">${quizTitle}</span></p>
                    <p><span class="font-bold inline-block w-28">Target Kelas</span>: <span class="font-extrabold">${pageClassLabel}</span></p>
                    <p><span class="font-bold inline-block w-28">Mata Pelajaran</span>: <span class="font-semibold">Teknologi Informasi & Komunikasi (TIK)</span></p>
                </div>
                <div class="space-y-1">
                    <p><span class="font-bold inline-block w-28">Tahun Ajaran</span>: <span class="font-extrabold">2026 / 2027</span></p>
                    <p class="print-teacher-line"><span class="font-bold print-teacher-label">Guru Pengampu</span><span class="print-teacher-separator">:</span><span class="font-extrabold print-teacher-name">${teacherName}</span></p>
                    <p><span class="font-bold inline-block w-28">Tanggal Cetak</span>: <span class="font-semibold">${formattedDate}</span></p>
                </div>
            </div>
            <p class="text-right text-[10px] mb-1">Halaman ${pageIndex + 1} dari ${totalPages}${filterClass === 'ALL' ? ` • ${page.pageWithinClass}/${page.pagesInClass} halaman kelas` : ''}</p>
            <table class="print-report-table grading-print-table w-full text-xs text-left border-collapse border border-slate-400">
                <thead>
                    <tr class="font-extrabold text-center uppercase tracking-wider">
                        <th class="p-2.5 border border-slate-400 w-12">No.</th>
                        <th class="p-2.5 border border-slate-400 text-left">Siswa (Nama Lengkap)</th>
                        <th class="p-2.5 border border-slate-400 w-24">Kelas</th>
                        <th class="p-2.5 border border-slate-400 w-36">Tanggal Kerjakan</th>
                        <th class="p-2.5 border border-slate-400 w-28">Nilai Akhir</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
                <tfoot>
                    <tr class="font-bold border-t-2 border-slate-400">
                        <td colspan="4" class="p-2.5 text-center uppercase border border-slate-400 tracking-wide font-extrabold">Rata-Rata Nilai Akhir ${avgLabel} (${scoredResults.length} Siswa Dinilai)</td>
                        <td class="p-2.5 text-center border border-slate-400 font-black text-sm">${avgScore} / 100</td>
                    </tr>
                </tfoot>
            </table>
            <div class="mt-5 pt-2 flex justify-between items-end text-xs break-inside-avoid">
                <div class="space-y-1 max-w-sm">
                    <p class="font-bold">Catatan:</p>
                    <p>• Rekapitulasi nilai ini digenerate otomatis melalui Portal EduTech Kids.</p>
                    <p>• Nilai akhir ditampilkan setelah penilaian otomatis dan/atau koreksi guru selesai.</p>
                </div>
                <div class="text-center min-w-[200px]">
                    <p class="mb-1">Dicetak pada: ${formattedDate}</p>
                    <p class="font-bold">Guru Pengampu TIK,</p>
                    <div class="h-14"></div>
                    <p class="font-extrabold underline text-sm tracking-wide">${teacherName}</p>
                    <p class="font-medium text-[11px] mt-0.5">NIP: ${teacherNip}</p>
                </div>
            </div>
        </section>`;
    }).join('');
    sheet.innerHTML = pagesHtml;
}
function setTeacherModuleGrade(grade) {
    activeTeacherModuleGrade = grade;
    const btn5 = document.getElementById('modGradeBtn5');
    const btn6 = document.getElementById('modGradeBtn6');
    if (btn5 && btn6) {
        if (grade === '5') {
            btn5.className = 'px-4 py-2 text-xs font-bold rounded-xl transition bg-white text-brand-600 shadow-sm';
            btn6.className = 'px-4 py-2 text-xs font-bold rounded-xl transition text-slate-600 hover:text-slate-800';
        } else {
            btn6.className = 'px-4 py-2 text-xs font-bold rounded-xl transition bg-white text-brand-600 shadow-sm';
            btn5.className = 'px-4 py-2 text-xs font-bold rounded-xl transition text-slate-600 hover:text-slate-800';
        }
    }
    renderTeacherModules();
}
function populateMeetingSelectOptions() {
    const select = document.getElementById('modMeetingNumber');
    if (!select) return;
    select.innerHTML = '';
    for (let i = 1; i <= 16; i++) {
        select.innerHTML += `<option value="${i}">Pertemuan ${i}</option>`;
    }
}
function renderTeacherModules() {
    const container = document.getElementById('teacherModulesGrid');
    const modules = JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]');
    container.innerHTML = '';
    for (let i = 1; i <= 16; i++) {
        const mod = modules.find(m => m.meeting === i && (m.grade || '5') === activeTeacherModuleGrade);
        const card = document.createElement('div');
        card.className = "glass-card glass-card-hover rounded-3xl p-6 shadow-xl flex flex-col justify-between border border-white/90";
        if (mod) {
            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[10px] font-extrabold uppercase bg-brand-100 text-brand-800 px-3 py-1 rounded-xl">Kelas ${activeTeacherModuleGrade} - Pertemuan ${i}</span>
                        <span class="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full">Tersedia</span>
                    </div>
                    <h4 class="font-display font-bold text-slate-900 text-lg mt-2 mb-1.5 break-words-custom">${mod.title}</h4>
                    <p class="text-xs text-slate-600 line-clamp-2 mb-4 break-words-custom">${mod.description}</p>
                </div>
                <div class="flex gap-2 pt-3 border-t border-slate-200">
                    <button onclick="openEditModuleModal(${i}, '${activeTeacherModuleGrade}')" class="flex-1 py-2.5 bg-brand-50 hover:bg-brand-600 hover:text-white text-brand-700 text-xs font-bold rounded-xl transition"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button onclick="deleteModule(${i}, '${activeTeacherModuleGrade}')" class="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 text-xs font-bold rounded-xl transition"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div>
                    <span class="text-[10px] font-extrabold uppercase bg-slate-200 text-slate-500 px-3 py-1 rounded-xl">Kelas ${activeTeacherModuleGrade} - Pertemuan ${i}</span>
                    <h4 class="font-display font-bold text-slate-400 text-base mt-2 mb-1">Pertemuan ${i}: Materi Kosong</h4>
                    <p class="text-xs text-slate-400 line-clamp-2 mb-4">Belum ada modul yang diunggah untuk Kelas ${activeTeacherModuleGrade}.</p>
                </div>
                <button onclick="openEditModuleModal(${i}, '${activeTeacherModuleGrade}')" class="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition"><i class="fa-solid fa-upload"></i> Upload Modul ${i}</button>
            `;
        }
        container.appendChild(card);
    }
}
function deleteModule(meetingNum, grade = '5') {
    if (confirm(`Yakin ingin menghapus modul Kelas ${grade} Pertemuan ${meetingNum}?`)) {
        let modules = JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]');
        modules = modules.filter(m => !(m.meeting === meetingNum && (m.grade || '5') === grade));
        localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(modules));
        triggerSyncEvent();
        showToast(`Modul Kelas ${grade} Pertemuan ${meetingNum} dihapus.`);
        renderTeacherModules();
    }
}
function openEditModuleModal(meetingNum = 1, grade = null) {
    document.getElementById('saveModuleForm').reset();
    const selectedGrade = grade || activeTeacherModuleGrade;
    document.getElementById('modGradeSelect').value = selectedGrade;
    document.getElementById('modMeetingNumber').value = meetingNum;
    const modules = JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]');
    const mod = modules.find(m => m.meeting === meetingNum && (m.grade || '5') === selectedGrade);
    if (mod) {
        document.getElementById('modTitle').value = mod.title;
        document.getElementById('modDescription').value = mod.description;
        document.getElementById('modLink').value = mod.link || '';
    } else {
        document.getElementById('modTitle').value = '';
        document.getElementById('modDescription').value = '';
        document.getElementById('modLink').value = '';
    }
    openModal('moduleModal');
}
function handleSaveModule(e) {
    e.preventDefault();
    const grade = document.getElementById('modGradeSelect').value;
    const meetingNum = parseInt(document.getElementById('modMeetingNumber').value);
    const title = document.getElementById('modTitle').value.trim();
    const description = document.getElementById('modDescription').value.trim();
    let link = document.getElementById('modLink').value.trim();
    const fileInput = document.getElementById('modFileInput');
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            link = evt.target.result;
            saveModuleData(meetingNum, grade, title, description, link);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveModuleData(meetingNum, grade, title, description, link);
    }
}
function saveModuleData(meetingNum, grade, title, description, link) {
    let modules = JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]');
    modules = modules.filter(m => !(m.meeting === meetingNum && (m.grade || '5') === grade));
    modules.push({ meeting: meetingNum, grade: grade, title, description, link, updatedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(modules));
    triggerSyncEvent();
    document.getElementById('saveModuleForm').reset();
    closeModal('moduleModal');
    showToast(`Modul Kelas ${grade} Pertemuan ${meetingNum} berhasil disimpan!`);
    activeTeacherModuleGrade = grade;
    setTeacherModuleGrade(grade);
}
let builderQuestions = [];
function openCreateQuizModal() {
    document.getElementById('saveQuizForm').reset();
    builderQuestions = [{ type: 'pg', question: '', options: ['', '', '', ''] }];
    document.getElementById('newQuizTitle').value = '';
    renderQuizBuilderQuestions();
    openModal('createQuizModal');
}
function addQuestionBuilderField() {
    if (builderQuestions.length >= 100) return showToast('Maksimal 100 Soal!', 'error');
    builderQuestions.push({ type: 'pg', question: '', options: ['', '', '', ''] });
    renderQuizBuilderQuestions();
}
function removeQuestionBuilderField(idx) {
    if (builderQuestions.length <= 1) return showToast('Kuis minimal 1 soal!', 'error');
    builderQuestions.splice(idx, 1);
    renderQuizBuilderQuestions();
}
function renderQuizBuilderQuestions() {
    document.getElementById('builderQuestionCount').innerText = builderQuestions.length;
    const container = document.getElementById('quizQuestionsBuilderList');
    container.innerHTML = builderQuestions.map((q, idx) => `
        <div class="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <div class="flex justify-between items-center">
                <span class="font-bold text-slate-800 text-xs">Soal Nomor #${idx + 1}</span>
                <div class="flex items-center gap-2">
                    <select onchange="updateQuestionType(${idx}, this.value)" class="px-2.5 py-1 bg-white border rounded-xl text-xs font-semibold">
                        <option value="pg" ${q.type === 'pg' ? 'selected' : ''}>Pilihan Ganda</option>
                        <option value="essay" ${q.type === 'essay' ? 'selected' : ''}>Essay</option>
                    </select>
                    <button type="button" onclick="removeQuestionBuilderField(${idx})" class="text-rose-600 text-xs font-bold px-2.5 py-1 bg-rose-50 rounded-xl hover:bg-rose-100 transition">Hapus</button>
                </div>
            </div>
            <input type="text" oninput="builderQuestions[${idx}].question = this.value" value="${q.question}" required placeholder="Pertanyaan..." class="w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs">
            ${q.type === 'pg' ? `
                <div class="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        ${q.options.map((opt, optIdx) => `
                            <div class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
                                <span class="text-[10px] font-extrabold text-slate-500 shrink-0">${String.fromCharCode(65 + optIdx)}.</span>
                                <input type="text" oninput="builderQuestions[${idx}].options[${optIdx}] = this.value" value="${opt}" required placeholder="Isi opsi ${optIdx + 1}" class="min-w-0 flex-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : '<p class="text-[11px] text-slate-500 italic">Jawaban essay dinilai manual oleh Guru.</p>'}
        </div>
    `).join('');
}
function updateQuestionType(idx, val) {
    builderQuestions[idx].type = val;
    if (val === 'pg') {
        if (!Array.isArray(builderQuestions[idx].options) || builderQuestions[idx].options.length !== 4) {
            builderQuestions[idx].options = ['', '', '', ''];
        }
        delete builderQuestions[idx].answer;
    }
    renderQuizBuilderQuestions();
}
function handleSaveQuiz(e) {
    e.preventDefault();
    const title = document.getElementById('newQuizTitle').value.trim();
    const targetClass = document.getElementById('newQuizClass').value;
    const quizzes = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    const savedQuestions = builderQuestions.map(q => {
        const saved = { ...q, options: Array.isArray(q.options) ? [...q.options] : [] };
        delete saved.answer;
        return saved;
    });
    quizzes.push({ id: 'q_' + Date.now(), title, targetClass, questions: savedQuestions, createdAt: new Date().toISOString(), keyVersion: 1 });
    localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(quizzes));
    triggerSyncEvent();
    document.getElementById('saveQuizForm').reset();
    closeModal('createQuizModal');
    showToast(`Kuis Baru Berhasil Diterbitkan!`);
    renderTeacherQuizList();
    populateTeacherQuizSelectOptions();
}
function renderTeacherQuizList() {
    const container = document.getElementById('teacherQuizListGrid');
    const quizzes = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    if (quizzes.length === 0) {
        container.innerHTML = `
            <div class="col-span-full glass-card p-8 rounded-3xl text-center border border-white/90 shadow-sm flex flex-col items-center justify-center">
                <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-3 shadow-inner">
                    <i class="fa-solid fa-file-pen"></i>
                </div>
                <h4 class="font-display font-bold text-slate-800 text-base mb-1">Belum Ada Kuis</h4>
                <p class="text-xs text-slate-600 max-w-md">Belum ada kuis yang dibuat. Klik tombol <b>"Buat Kuis Baru"</b> di atas untuk menambahkan kuis interaktif bagi siswa.</p>
            </div>
        `;
        return;
    }
    container.innerHTML = quizzes.map(q => `
        <div class="glass-card p-6 rounded-3xl shadow-xl flex justify-between items-center border border-white/90">
            <div>
                <div class="flex items-center gap-2 mb-1.5">
                    <span class="bg-brand-100 text-brand-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-lg uppercase">Target: ${q.targetClass}</span>
                    <span class="text-xs text-slate-600 font-bold">${q.questions.length} Soal</span>
                </div>
                <h4 class="font-display font-bold text-slate-900 text-base break-words-custom">${q.title}</h4>
            </div>
            <button onclick="deleteQuiz('${q.id}')" class="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition">Hapus</button>
        </div>
    `).join('');
}
function deleteQuiz(quizId) {
    if (confirm('Yakin ingin menghapus kuis ini?')) {
        let quizzes = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
        quizzes = quizzes.filter(q => q.id !== quizId);
        localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(quizzes));
        triggerSyncEvent();
        showToast('Kuis berhasil dihapus.');
        renderTeacherQuizList();
        populateTeacherQuizSelectOptions();
    }
}
function populateTeacherQuizSelectOptions() {
    const select = document.getElementById('rekapQuizSelect');
    if (!select) return;
    const quizzes = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    select.innerHTML = quizzes.map(q => `<option value="${q.id}">${q.title}</option>`).join('');
    if (quizzes.length === 0) select.innerHTML = `<option value="">Belum ada kuis</option>`;
}
function renderTeacherGradingTable() {
    const quizId = document.getElementById('rekapQuizSelect').value;
    const filterClass = document.getElementById('rekapClassSelect').value;
    const tbody = document.getElementById('gradingTableBody');
    const results = JSON.parse(localStorage.getItem(STORAGE_KEY_RESULTS) || '[]');
    let filteredResults = results.filter(r => r.quizId === quizId);
    if (filterClass !== 'ALL') filteredResults = filteredResults.filter(r => r.studentClass === filterClass);
    if (filteredResults.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-4 text-center text-xs text-slate-500">Belum ada pengerjaan kuis ini.</td></tr>`;
        return;
    }
    const quizCatalog = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    tbody.innerHTML = filteredResults.map(r => {
        const resultQuiz = quizCatalog.find(q => q.id === r.quizId);
        const hasLegacyPG = resultQuiz && (Number(resultQuiz.keyVersion) || 0) < 2 && resultQuiz.questions.some(q => q.type === 'pg') && !r.manualReviewed;
        const scoreLabel = hasLegacyPG
            ? 'Perlu koreksi'
            : (r.finalScore === null || r.finalScore === undefined || r.finalScore === '' ? 'Belum dinilai' : `${r.finalScore} / 100`);
        const statusLabel = hasLegacyPG ? 'Kunci perlu dicek' : (r.status || 'Belum Terkoreksi');
        return `
        <tr class="hover:bg-slate-50 transition">
            <td class="px-5 py-3.5 font-bold text-slate-900">${r.studentName}</td>
            <td class="px-5 py-3.5 text-xs font-semibold text-slate-700">${r.studentClass}</td>
            <td class="px-5 py-3.5 text-xs text-slate-600">${r.date}</td>
            <td class="px-5 py-3.5 font-bold text-slate-900 text-sm">${scoreLabel}</td>
            <td class="px-5 py-3.5">
                ${hasLegacyPG ? '<span class="text-amber-700 text-xs font-bold">Kunci perlu dicek</span>' : `<select onchange="updateResultStatus('${r.id}', this.value)" class="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"><option value="Belum Terkoreksi" ${r.status === 'Belum Terkoreksi' ? 'selected' : ''}>Belum Terkoreksi</option><option value="Sudah Terkoreksi" ${r.status === 'Sudah Terkoreksi' ? 'selected' : ''}>Sudah Terkoreksi</option></select>`}
            </td>
            <td class="px-5 py-3.5 text-right space-x-1.5 no-print">
                <button onclick="openReviewGradeModal('${r.id}')" class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">Review</button>
            </td>
        </tr>`;
    }).join('');
}
function updateResultStatus(resultId, newStatus) {
    let results = JSON.parse(localStorage.getItem(STORAGE_KEY_RESULTS) || '[]');
    const idx = results.findIndex(r => r.id === resultId);
    if (idx !== -1) {
        results[idx].status = newStatus;
        localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(results));
        triggerSyncEvent();
        showToast(`Status penilaian diubah ke "${newStatus}"`);
        renderTeacherGradingTable();
    }
}
function deleteQuizResult(resultId) {
    if (confirm('Hapus pengerjaan kuis siswa ini?')) {
        let results = JSON.parse(localStorage.getItem(STORAGE_KEY_RESULTS) || '[]');
        results = results.filter(r => r.id !== resultId);
        localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(results));
        triggerSyncEvent();
        showToast('Hasil kuis dihapus.');
        renderTeacherGradingTable();
    }
}
function openReviewGradeModal(resultId) {
    const results = JSON.parse(localStorage.getItem(STORAGE_KEY_RESULTS) || '[]');
    const quizzes = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    const res = results.find(r => r.id === resultId);
    if (!res) return;
    const quiz = quizzes.find(q => q.id === res.quizId);
    const container = document.getElementById('reviewGradeContent');
    if (!quiz) {
        container.innerHTML = `<p class="text-xs text-slate-500">Data kuis tidak ditemukan.</p>`;
        openModal('reviewGradeModal');
        return;
    }
    let html = `
        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4 text-xs space-y-1">
            <p><strong>Nama Siswa:</strong> ${res.studentName} (${res.studentClass})</p>
            <p><strong>Percobaan Ke:</strong> ${res.attemptCount}</p>
            <p><strong>Nilai Akhir:</strong> <span class="text-slate-900 font-bold">${(Number(quiz.keyVersion) || 0) < 2 && quiz.questions.some(q => q.type === 'pg') && !res.manualReviewed ? 'Perlu koreksi manual' : (res.finalScore === null || res.finalScore === undefined ? 'Belum dinilai' : `${res.finalScore} / 100`)}</span></p>
        </div>
        <form onsubmit="saveGradeCorrection(event, '${res.id}')" class="space-y-4">
    `;
    quiz.questions.forEach((q, idx) => {
        const studentAns = res.studentAnswers ? res.studentAnswers[idx] : null;
        if (q.type === 'pg') {
            const hasKey = Number(quiz.keyVersion) >= 2 && Number.isInteger(q.answer) && q.answer >= 0 && Array.isArray(q.options) && q.answer < q.options.length;
            const isCorrect = hasKey && studentAns === q.answer;
            const cardClass = hasKey ? (isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50') : 'border-amber-200 bg-amber-50';
            html += `
                <div class="p-3.5 rounded-2xl border ${cardClass} text-xs space-y-1">
                    <p class="font-bold text-slate-800">${idx + 1}. ${q.question}</p>
                    <p class="text-slate-600">Jawaban Siswa: <span class="font-semibold">${(studentAns !== null && studentAns !== -1 && q.options[studentAns]) ? q.options[studentAns] : 'Tidak dijawab'}</span></p>
                    ${hasKey ? `<p class="text-emerald-700">Kunci Jawaban: <span class="font-semibold">${q.options[q.answer]}</span></p><p class="font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}">${isCorrect ? 'Benar' : 'Salah'}</p>` : ''}
                </div>
            `;
        } else {
            html += `
                <div class="p-3.5 rounded-2xl border border-slate-300 bg-slate-50 text-xs space-y-2">
                    <p class="font-bold text-slate-800">${idx + 1}. ${q.question} <span class="font-bold text-slate-700">(Essay)</span></p>
                    <div class="p-2.5 bg-white rounded-xl border border-slate-200 italic font-medium text-slate-700">"${studentAns || 'Tidak ada jawaban'}"</div>
                </div>
            `;
        }
    });
    html += `
        <div class="pt-2">
            <label class="block text-xs font-bold text-slate-700 mb-1">Nilai Akhir Hasil Koreksi (0-100)</label>
            <input type="number" id="corrFinalScore" min="0" max="100" value="${(Number(quiz.keyVersion) || 0) < 2 && quiz.questions.some(q => q.type === 'pg') && !res.manualReviewed ? '' : (res.finalScore === null || res.finalScore === undefined ? '' : res.finalScore)}" required class="w-full px-3.5 py-2 bg-white border rounded-xl text-xs font-bold mb-3">
            <div class="flex justify-end gap-2">
                <button type="button" onclick="closeModal('reviewGradeModal')" class="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl">Batal</button>
                <button type="submit" class="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl">Simpan Nilai Koreksi</button>
            </div>
        </div>
    </form>`;
    container.innerHTML = html;
    openModal('reviewGradeModal');
}
function saveGradeCorrection(e, resultId) {
    e.preventDefault();
    const newScore = parseInt(document.getElementById('corrFinalScore').value);
    let results = JSON.parse(localStorage.getItem(STORAGE_KEY_RESULTS) || '[]');
    const idx = results.findIndex(r => r.id === resultId);
    if (idx !== -1) {
        results[idx].finalScore = newScore;
        results[idx].status = 'Sudah Terkoreksi';
        results[idx].manualReviewed = true;
        localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(results));
        triggerSyncEvent();
        showToast('Nilai koreksi siswa disimpan!');
        closeModal('reviewGradeModal');
        renderTeacherGradingTable();
    }
}
function refreshCurrentSectionAfterDataChange() {
    if (!currentUser) return;
    try {
        if (currentUser.role === 'siswa') {
            const section = activeStudentSection || 'dashboard';
            if (section === 'modules') {
                renderStudentModules();
            } else if (section === 'quizzes') {
                renderStudentQuizzes();
                renderStudentQuizHistory();
            } else if (section === 'dashboard') {
                updateStudentReadProgress();
                updateStudentQuizProgress();
            }
            renderNotifications();
        } else if (currentUser.role === 'guru') {
            const section = activeTeacherSection || 'dashboard';
            if (section === 'students') {
                renderTeacherStudentList();
            } else if (section === 'modules') {
                renderTeacherModules();
            } else if (section === 'attendance') {
                loadAttendanceForm();
            } else if (section === 'quizzes') {
                renderTeacherQuizList();
            } else if (section === 'grading') {
                populateTeacherQuizSelectOptions();
                renderTeacherGradingTable();
            } else if (section === 'dashboard') {
                const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
                const modules = JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]');
                const quizzes = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
                const students = document.getElementById('statTotalStudents');
                const moduleCount = document.getElementById('statTotalModules');
                const quizCount = document.getElementById('statTotalQuizzes');
                if (students) students.innerText = `${users.filter(user => user.role === 'siswa').length} Siswa`;
                if (moduleCount) moduleCount.innerText = `${modules.length} / 32`;
                if (quizCount) quizCount.innerText = `${quizzes.length} Kuis`;
            }
        }
        updateSidebarUI();
    } catch (error) {
        console.warn('[EduTech] Bagian aktif belum dapat diperbarui:', error);
    }
}
function restoreAuthSessionSafely() {
    try {
        const saved = localStorage.getItem(AUTH_SESSION_KEY) || sessionStorage.getItem('eduTech_session');
        if (!saved) return false;
        const parsed = JSON.parse(saved);
        const safeUser = getSafeSessionUser(parsed);
        if (!safeUser) return false;
        currentUser = safeUser;
        saveAuthSession(safeUser);
        return true;
    } catch (error) {
        console.warn('[EduTech] Gagal memulihkan sesi:', error);
        return false;
    }
}
window.addEventListener('pagehide', function() {
    if (currentUser) saveAuthSession(currentUser);
});
window.addEventListener('pageshow', function() {
    if (!currentUser) {
        restoreAuthSessionSafely();
        renderAppView();
    }
});
window.onload = function() {
    initCleanStorage();
    updateAcademicYearDisplays();
    if (!restoreAuthSessionSafely()) checkSession();
    else renderAppView();
    updateClock();
    setInterval(updateClock, 1000);
    window.addEventListener('eduTech:datachange', refreshCurrentSectionAfterDataChange);
    window.addEventListener('storage', function(event) {
        if (event && event.key && !String(event.key).startsWith('eduTech_')) return;
        refreshCurrentSectionAfterDataChange();
    });
    window.addEventListener('afterprint', function() {
        document.body.classList.remove('is-printing-attendance');
        document.body.classList.remove('is-printing-grading');
    });
};
