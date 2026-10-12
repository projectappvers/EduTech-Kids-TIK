const EDU_TECH_GAS_CONFIG = {
    webAppUrl: 'https://script.google.com/macros/s/AKfycbyW76ZDFrx1GyJH5f7yJAahztewn6bAxJ54_5hwDDFHJ6vZmXtlMFiwbtMBbvVFmJU3/exec',
    pollIntervalMs: 1000,
    requestTimeoutMs: 15000
};
(function () {
    'use strict';
    const DATA_PREFIX = 'eduTech_';
    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;
    const originalGetItem = Storage.prototype.getItem;
    const clientId = getClientId();
    const pendingWrites = new Map();
    const writeTimers = new Map();
    const retryTimers = new Map();
    const latestClientSeq = new Map();
    const knownVersions = new Map();
    let initialized = false;
    let applyingRemote = false;
    let lastRevision = 0;
    let polling = false;
    let syncStarted = false;
    let originalWindowOnload = window.onload;
    function getClientId() {
        // ID baru untuk setiap pemuatan halaman. Jangan pakai ID sessionStorage:
        // clientSeq dimulai ulang setiap reload dan GAS akan menganggap write berikutnya duplikat.
        return 'client-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
    }
    function isConfigured() {
        return EDU_TECH_GAS_CONFIG.webAppUrl.startsWith('https://script.google.com/macros/s/') &&
            !EDU_TECH_GAS_CONFIG.webAppUrl.includes('TEMPEL_');
    }
    function getLocalDataKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(DATA_PREFIX)) keys.push(key);
        }
        return keys;
    }
    function jsonpRequest(sinceRevision, forceFullSnapshot = false) {
        return new Promise((resolve, reject) => {
            // Nama callback unik mencegah dua request JSONP saling menimpa, misalnya
            // saat startSync dan login meminta snapshot pada waktu yang berdekatan.
            const callbackName = '__eduTechGasSyncCallback_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
            const script = document.createElement('script');
            let finished = false;
            const timeout = setTimeout(() => finish(new Error('Timeout menunggu Google Apps Script.')), EDU_TECH_GAS_CONFIG.requestTimeoutMs);
            function cleanup() {
                clearTimeout(timeout);
                script.remove();
                try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
            }
            function finish(error, result) {
                if (finished) return;
                finished = true;
                cleanup();
                if (error) reject(error);
                else resolve(result);
            }
            window[callbackName] = result => finish(null, result);
            script.onerror = () => finish(new Error('Tidak dapat mengakses URL Web App GAS.'));
            const url = new URL(EDU_TECH_GAS_CONFIG.webAppUrl);
            url.searchParams.set('action', 'sync');
            url.searchParams.set('since', String(sinceRevision));
            if (forceFullSnapshot) url.searchParams.set('full', '1');
            url.searchParams.set('callback', callbackName);
            url.searchParams.set('_', String(Date.now()));
            script.src = url.toString();
            document.head.appendChild(script);
        });
    }
    function scheduleWriteRetry(key, write, delay = 5000) {
        if (retryTimers.has(key)) clearTimeout(retryTimers.get(key));
        retryTimers.set(key, setTimeout(() => {
            retryTimers.delete(key);
            if (pendingWrites.get(key) !== write || write.acknowledged) return;
            if (write.attempts >= 8) {
                console.error('[EduTech GAS] Perubahan belum terkonfirmasi setelah beberapa percobaan:', key);
                return;
            }
            postWrite(key, write);
        }, delay));
    }
    async function postWrite(key, write) {
        if (pendingWrites.get(key) !== write || write.acknowledged) return;
        write.attempts = (write.attempts || 0) + 1;
        const body = {
            action: 'write',
            key,
            value: write.value,
            deleted: write.deleted,
            clientId,
            clientSeq: write.seq
        };
        try {
            await fetch(EDU_TECH_GAS_CONFIG.webAppUrl, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-store',
                headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
                body: JSON.stringify(body)
            });
            // no-cors memberi opaque response. Keberhasilan baru dipastikan saat record
            // dengan clientId/clientSeq yang sama kembali melalui polling JSONP.
            write.sent = true;
            scheduleWriteRetry(key, write, 5000);
        } catch (error) {
            write.sent = false;
            console.error('[EduTech GAS] Gagal mengirim perubahan:', key, error);
            scheduleWriteRetry(key, write, 3000);
        }
    }
    function scheduleWrite(key, value, deleted) {
        if (!initialized || applyingRemote || !key.startsWith(DATA_PREFIX)) return;
        const seq = (latestClientSeq.get(key) || 0) + 1;
        latestClientSeq.set(key, seq);
        const write = { value: value == null ? '' : String(value), deleted: Boolean(deleted), seq, sent: false, attempts: 0, acknowledged: false };
        pendingWrites.set(key, write);
        if (writeTimers.has(key)) clearTimeout(writeTimers.get(key));
        writeTimers.set(key, setTimeout(() => {
            writeTimers.delete(key);
            const latest = pendingWrites.get(key);
            if (latest) postWrite(key, latest);
        }, 250));
    }
    Storage.prototype.setItem = function (key, value) {
        originalSetItem.call(this, key, value);
        if (this === window.localStorage && typeof key === 'string') {
            scheduleWrite(key, String(value), false);
        }
    };
    Storage.prototype.removeItem = function (key) {
        originalRemoveItem.call(this, key);
        if (this === window.localStorage && typeof key === 'string') {
            scheduleWrite(key, '', true);
        }
    };
    function clearPendingTimers(key) {
        if (writeTimers.has(key)) {
            clearTimeout(writeTimers.get(key));
            writeTimers.delete(key);
        }
        if (retryTimers.has(key)) {
            clearTimeout(retryTimers.get(key));
            retryTimers.delete(key);
        }
    }
    function replacePendingWrite(key, value, deleted = false) {
        // Batalkan percobaan lama sebelum membuat snapshot gabungan yang lebih baru.
        // clientSeq baru membuat backend menolak kiriman lama dari klien yang sama.
        clearPendingTimers(key);
        const seq = (latestClientSeq.get(key) || 0) + 1;
        latestClientSeq.set(key, seq);
        const write = {
            value: value == null ? '' : String(value),
            deleted: Boolean(deleted),
            seq,
            sent: false,
            attempts: 0,
            acknowledged: false
        };
        pendingWrites.set(key, write);
        if (initialized) {
            writeTimers.set(key, setTimeout(() => {
                writeTimers.delete(key);
                if (pendingWrites.get(key) === write) postWrite(key, write);
            }, 250));
        }
        return write;
    }
    function applyRemoteRecord(record, changedKeys) {
        if (!record || !record.key || !record.key.startsWith(DATA_PREFIX)) return;

        const key = record.key;
        const revision = Number(record.revision) || 0;
        const previousRevision = knownVersions.get(key) || 0;
        const pending = pendingWrites.get(key);

        // Akui kiriman milik perangkat ini meskipun revisi tersebut sudah pernah dibaca.
        if (pending && record.clientId === clientId && Number(record.clientSeq) >= pending.seq) {
            pending.acknowledged = true;
            pendingWrites.delete(key);
            clearPendingTimers(key);
        }
        if (revision <= previousRevision) return;

        // Snapshot server menjadi sumber kebenaran. Jangan gabungkan akun lokal lama,
        // karena akun yang sudah direset akan hidup kembali dari cache browser.
        if (key === 'eduTech_users_v8') {
            const remoteValue = record.deleted ? '[]' : String(record.value ?? '[]');
            if (originalGetItem.call(localStorage, key) !== remoteValue) {
                applyingRemote = true;
                try { originalSetItem.call(localStorage, key, remoteValue); }
                finally { applyingRemote = false; }
                changedKeys.add(key);
            }
            knownVersions.set(key, revision);
            const currentPending = pendingWrites.get(key);
            if (currentPending && currentPending.value === remoteValue && !currentPending.deleted) {
                pendingWrites.delete(key);
                clearPendingTimers(key);
            }
            return;
        }

        // Untuk kunci selain akun, pertahankan kebijakan lama untuk menghindari menimpa
        // perubahan lokal yang masih menunggu konfirmasi.
        const currentPending = pendingWrites.get(key);
        if (currentPending) return;

        applyingRemote = true;
        try {
            if (record.deleted) {
                if (originalGetItem.call(localStorage, key) !== null) {
                    originalRemoveItem.call(localStorage, key);
                    changedKeys.add(key);
                }
            } else if (originalGetItem.call(localStorage, key) !== String(record.value ?? '')) {
                originalSetItem.call(localStorage, key, String(record.value ?? ''));
                changedKeys.add(key);
            }
        } finally {
            applyingRemote = false;
        }
        knownVersions.set(key, revision);
    }
    function mergeUserRecords(localValue, remoteValue) {
        let localUsers = [], remoteUsers = [];
        try { localUsers = JSON.parse(localValue || '[]'); } catch (_) {}
        try { remoteUsers = JSON.parse(remoteValue || '[]'); } catch (_) {}
        if (!Array.isArray(localUsers)) localUsers = [];
        if (!Array.isArray(remoteUsers)) remoteUsers = [];
        const merged = new Map();
        remoteUsers.forEach(user => { if (user && user.username) merged.set(String(user.username).toLowerCase(), user); });
        localUsers.forEach(user => { if (user && user.username) merged.set(String(user.username).toLowerCase(), user); });
        return JSON.stringify(Array.from(merged.values()));
    }
    async function initializeFromSheet() {
        const response = await jsonpRequest(0, true);
        if (!response || !response.ok) throw new Error(response && response.error ? response.error : 'Respons GAS tidak valid.');
        lastRevision = Number(response.revision) || 0;
        const records = Array.isArray(response.records) ? response.records : [];
        const remoteKeys = new Set(records.map(record => record.key));
        const changedKeys = new Set();
        records.forEach(record => applyRemoteRecord(record, changedKeys));
        initialized = true;
        const mergedUsersWrite = pendingWrites.get('eduTech_users_v8');
        if (mergedUsersWrite) postWrite('eduTech_users_v8', mergedUsersWrite);
        getLocalDataKeys().forEach(key => {
            if (!remoteKeys.has(key)) {
                const value = originalGetItem.call(localStorage, key);
                if (value !== null) scheduleWrite(key, value, false);
            }
        });
        if (changedKeys.size) refreshAppAfterRemoteChange(changedKeys);
        console.info('[EduTech GAS] Sinkronisasi aktif. Versi data:', lastRevision);
    }
    async function refreshUsersNow() {
        if (!isConfigured()) throw new Error('URL Google Apps Script belum dikonfigurasi.');

        // Jika sinkronisasi awal belum selesai, lakukan terlebih dahulu.
        if (!initialized) await initializeFromSheet();

        // Minta snapshot penuh (since=0), bukan hanya perubahan setelah lastRevision.
        // Ini memperbaiki profil browser yang penanda revisinya sudah maju tetapi daftar
        // akun lokalnya belum memuat akun yang tersedia di server.
        const response = await jsonpRequest(0, true);
        if (!response || !response.ok) {
            throw new Error(response && response.error ? response.error : 'Gagal memperbarui daftar akun dari server.');
        }

        const key = 'eduTech_users_v8';
        const accountRecord = (Array.isArray(response.records) ? response.records : [])
            .find(record => record && record.key === key && !record.deleted);
        if (!accountRecord) {
            throw new Error('Daftar akun tidak ditemukan pada snapshot sinkronisasi server.');
        }

        const remoteValue = String(accountRecord.value == null ? '[]' : accountRecord.value);
        const changedKeys = new Set();
        if (originalGetItem.call(localStorage, key) !== remoteValue) {
            applyingRemote = true;
            try { originalSetItem.call(localStorage, key, remoteValue); }
            finally { applyingRemote = false; }
            changedKeys.add(key);
        }

        const revision = Number(accountRecord.revision) || 0;
        knownVersions.set(key, Math.max(knownVersions.get(key) || 0, revision));

        const currentPending = pendingWrites.get(key);
        if (currentPending && currentPending.value !== remoteValue) {
            pendingWrites.delete(key);
            clearPendingTimers(key);
        }
        if (changedKeys.size) refreshAppAfterRemoteChange(changedKeys);
        return { ok: true, accountCount: safeParseArrayLength(remoteValue), revision };
    }

    function safeParseArrayLength(value) {
        try {
            const parsed = JSON.parse(value || '[]');
            return Array.isArray(parsed) ? parsed.length : 0;
        } catch (_) {
            return 0;
        }
    }

    async function pollSheet() {
        if (!initialized || polling || !isConfigured()) return;
        polling = true;
        try {
            const response = await jsonpRequest(lastRevision);
            if (!response || !response.ok) throw new Error(response && response.error ? response.error : 'Respons GAS tidak valid.');
            const changedKeys = new Set();
            (Array.isArray(response.records) ? response.records : []).forEach(record => {
                applyRemoteRecord(record, changedKeys);
                lastRevision = Math.max(lastRevision, Number(record.revision) || 0);
            });
            lastRevision = Math.max(lastRevision, Number(response.revision) || 0);
            if (changedKeys.size) refreshAppAfterRemoteChange(changedKeys);
        } catch (error) {
            console.warn('[EduTech GAS] Sinkronisasi tertunda:', error.message || error);
        } finally {
            polling = false;
        }
    }
    function refreshAppAfterRemoteChange(changedKeys) {
        const contentChanged = changedKeys.has('eduTech_modules_v8') || changedKeys.has('eduTech_quizzes_v8');
        if (typeof currentUser !== 'undefined' && currentUser) {
            try {
                if (currentUser.role === 'siswa') {
                    const section = typeof activeStudentSection !== 'undefined' ? activeStudentSection : 'dashboard';
                    if (section === 'modules' && typeof renderStudentModules === 'function') renderStudentModules();
                    else if (section === 'quizzes') {
                        if (typeof renderStudentQuizzes === 'function') renderStudentQuizzes();
                        if (typeof renderStudentQuizHistory === 'function') renderStudentQuizHistory();
                    } else if (section === 'dashboard') {
                        if (typeof updateStudentReadProgress === 'function') updateStudentReadProgress();
                        if (typeof updateStudentQuizProgress === 'function') updateStudentQuizProgress();
                    }
                } else if (currentUser.role === 'guru') {
                    const section = typeof activeTeacherSection !== 'undefined' ? activeTeacherSection : 'dashboard';
                    if (section === 'students' && typeof renderTeacherStudentList === 'function') renderTeacherStudentList();
                    else if (section === 'modules' && typeof renderTeacherModules === 'function') renderTeacherModules();
                    else if (section === 'attendance' && typeof loadAttendanceForm === 'function') loadAttendanceForm();
                    else if (section === 'quizzes' && typeof renderTeacherQuizList === 'function') renderTeacherQuizList();
                    else if (section === 'grading') {
                        if (typeof populateTeacherQuizSelectOptions === 'function') populateTeacherQuizSelectOptions();
                        if (typeof renderTeacherGradingTable === 'function') renderTeacherGradingTable();
                    } else if (section === 'dashboard') {
                        if (typeof switchTeacherSection === 'function') {
                            const users = JSON.parse(localStorage.getItem('eduTech_users_v8') || '[]');
                            const modules = JSON.parse(localStorage.getItem('eduTech_modules_v8') || '[]');
                            const quizzes = JSON.parse(localStorage.getItem('eduTech_quizzes_v8') || '[]');
                            const students = document.getElementById('statTotalStudents');
                            const moduleCount = document.getElementById('statTotalModules');
                            const quizCount = document.getElementById('statTotalQuizzes');
                            if (students) students.innerText = `${users.filter(user => user.role === 'siswa').length} Siswa`;
                            if (moduleCount) moduleCount.innerText = `${modules.length} / 32`;
                            if (quizCount) quizCount.innerText = `${quizzes.length} Kuis`;
                        }
                    }
                }
                if (typeof updateSidebarUI === 'function') updateSidebarUI();
            } catch (error) {
                console.warn('[EduTech GAS] Tampilan belum dapat diperbarui:', error);
            }
        }
        if (typeof renderNotifications === 'function') renderNotifications();
    }
    async function startSync() {
        if (!isConfigured()) {
            console.info('[EduTech GAS] URL Web App belum diatur. Aplikasi berjalan lokal seperti biasa.');
            return;
        }
        try {
            await initializeFromSheet();
        } catch (error) {
            console.warn('[EduTech GAS] Belum terhubung saat halaman dibuka:', error.message || error);
        }
        if (!syncStarted) {
            syncStarted = true;
            setInterval(() => {
                if (!initialized) {
                    initializeFromSheet().catch(error => console.warn('[EduTech GAS] Menunggu koneksi:', error.message || error));
                } else {
                    pollSheet();
                }
            }, EDU_TECH_GAS_CONFIG.pollIntervalMs);
            window.addEventListener('online', () => initialized ? pollSheet() : initializeFromSheet().catch(() => {}));
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    if (initialized) pollSheet();
                    else initializeFromSheet().catch(() => {});
                }
            });
        }
    }
    async function resetRemoteData() {
        // Batalkan snapshot tertunda agar penulisan lama tidak menghidupkan kembali data.
        for (const key of Array.from(pendingWrites.keys())) {
            pendingWrites.delete(key);
            clearPendingTimers(key);
        }
        const body = JSON.stringify({ action: 'reset' });
        await fetch(EDU_TECH_GAS_CONFIG.webAppUrl, {
            method: 'POST', mode: 'no-cors', cache: 'no-store',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body
        });
        // no-cors tidak mengembalikan status server. Paksa polling snapshot terbaru.
        await new Promise(resolve => setTimeout(resolve, 1200));
        await initializeFromSheet();
        return { ok: true };
    }
    window.EduTechGASSync = {
        getStatus: () => ({
            configured: isConfigured(),
            initialized,
            polling,
            lastRevision,
            pendingWrites: Array.from(pendingWrites.entries()).map(([key, write]) => ({ key, seq: write.seq, attempts: write.attempts, sent: write.sent }))
        }),
        syncNow: () => initialized ? pollSheet() : initializeFromSheet(),
        refreshUsersNow,
        resetRemoteData
    };
    window.onload = async function (event) {
        await startSync();
        if (typeof originalWindowOnload === 'function') originalWindowOnload.call(window, event);
    };
})();
