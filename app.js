import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQa3LJ7a7QPbDLR8NkFyBe-CM9Sg4C8RY",
  authDomain: "library-escape.firebaseapp.com",
  projectId: "library-escape",
  storageBucket: "library-escape.firebasestorage.app",
  messagingSenderId: "765610754235",
  appId: "1:765610754235:web:4a9e941fa8313f20a8699e",
  measurementId: "G-Z442XEZ08X"
};

let db = null;
let firebaseReady = false;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  firebaseReady = !firebaseConfig.apiKey.includes("여기에");
} catch (error) {
  console.warn("Firebase 초기화 실패:", error);
}

const TOTAL_TIME = 20 * 60;
const STORAGE_KEY = "libraryEscapeState_v3";

const missions = [
  {
    title: "사라진 숫자",
    tag: "도서관 입구 · BEST 대출도서",
    story:
`[도서관 보안 시스템 경고]

오늘 새벽, 사서가 남긴 첫 번째 메모가 발견되었습니다.

“첫 번째 단서는 가장 많이 읽힌 책 근처에 있다.”

도서관 입구의 BEST 대출도서 코너로 이동하세요.
그곳에 숨겨진 QR 또는 메모를 찾아 암호를 입력하세요.

암호 문장:
책은 ___이다.`,
    answer: ["마음"],
    hint: "『어린 왕자』 또는 마음과 관련된 유명한 문장을 떠올려 보세요."
  },
  {
    title: "사라진 페이지",
    tag: "소설 코너 · 813.7",
    story:
`사서는 마지막으로 “가장 외로운 존재”를 찾고 있었습니다.

813.7 구역으로 이동하세요.
『아몬드』 책 근처에 숨겨진 단서를 확인하세요.

메모에 적힌 페이지를 펼쳐 마지막 단어를 입력하세요.

※ 실제 운영 시 책 안쪽 메모에 페이지와 답을 학교 상황에 맞게 바꿔 넣으세요.`,
    answer: ["눈물"],
    hint: "책 사이에 끼워 둔 작은 메모를 먼저 찾아야 합니다. 예시 정답은 ‘눈물’입니다."
  },
  {
    title: "금지된 문장",
    tag: "시집 코너",
    story:
`세 번째 기록은 시집 코너에 숨겨져 있습니다.

사서의 메모:
“밤하늘을 세어 본 사람만 다음 문을 열 수 있다.”

윤동주 시집 또는 ‘별 헤는 밤’ 자료를 찾아보세요.

문제:
‘별 헤는 밤’에서 가장 많이 반복되는 핵심 단어는 무엇일까요?`,
    answer: ["별"],
    hint: "제목에도 들어 있고, 시 전체의 중심 이미지입니다."
  },
  {
    title: "왜곡된 기록 1",
    tag: "책 제목 복구",
    story:
`도서관 시스템 오류로 책 제목 일부가 사라졌습니다.

다음 책 제목에서 사라진 한 글자를 입력하세요.

○ 득 이

정답은 한 글자입니다.`,
    answer: ["완"],
    hint: "김려령 작가의 청소년소설입니다."
  },
  {
    title: "왜곡된 기록 2",
    tag: "책 제목 복구",
    story:
`두 번째 책 제목도 손상되었습니다.

다음 책 제목에서 사라진 한 글자를 입력하세요.

아 ○ 드

정답은 한 글자입니다.`,
    answer: ["몬"],
    hint: "감정을 잘 느끼지 못하는 소년의 성장 이야기입니다."
  },
  {
    title: "마지막 기록",
    tag: "FINAL MISSION",
    story:
`지금까지 복구한 단어를 떠올려 보세요.

마음 · 눈물 · 별 · 완득이 · 아몬드

사서가 마지막으로 남긴 문장입니다.

“책은 읽는 순간 끝나는 것이 아니라,
사람 안에 ______으로 남는다.”

빈칸에 들어갈 마지막 암호를 입력하세요.`,
    answer: ["기억"],
    hint: "처음 오프닝에서 사라졌던 바로 그것입니다."
  }
];

const $ = (id) => document.getElementById(id);

const screens = {
  start: $("startScreen"),
  game: $("gameScreen"),
  ending: $("endingScreen"),
  ranking: $("rankingScreen")
};

const els = {
  teamName: $("teamName"),
  startBtn: $("startBtn"),
  rankingBtn: $("rankingBtn"),
  missionTitle: $("missionTitle"),
  timer: $("timer"),
  progressBar: $("progressBar"),
  missionTag: $("missionTag"),
  missionStory: $("missionStory"),
  missionHintBox: $("missionHintBox"),
  missionHint: $("missionHint"),
  answerInput: $("answerInput"),
  submitBtn: $("submitBtn"),
  hintBtn: $("hintBtn"),
  feedback: $("feedback"),
  currentTeam: $("currentTeam"),
  hintCount: $("hintCount"),
  missionCount: $("missionCount"),
  endingText: $("endingText"),
  resultTeam: $("resultTeam"),
  resultTime: $("resultTime"),
  resultHints: $("resultHints"),
  showRankingBtn: $("showRankingBtn"),
  restartBtn: $("restartBtn"),
  rankingList: $("rankingList"),
  backBtn: $("backBtn"),
  toast: $("toast")
};

let state = {
  teamName: "",
  currentMission: 0,
  hintUsed: 0,
  startTime: null,
  endTime: null,
  completed: false
};

let timerId = null;
let typingTimerIds = [];

function normalize(value) {
  return String(value)
    .trim()
    .replace(/\s+/g, "")
    .replace(/[.,!?]/g, "")
    .toLowerCase();
}

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove("active"));
  screens[name].classList.add("active");
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;

  try {
    const saved = JSON.parse(raw);
    if (!saved || !saved.teamName || saved.completed) return false;
    state = saved;
    return true;
  } catch {
    return false;
  }
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  state = {
    teamName: "",
    currentMission: 0,
    hintUsed: 0,
    startTime: null,
    endTime: null,
    completed: false
  };
  stopTimer();
  clearTypingTimers();
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const m = String(Math.floor(safe / 60)).padStart(2, "0");
  const s = String(safe % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function elapsedSeconds() {
  if (!state.startTime) return 0;
  return Math.floor((Date.now() - state.startTime) / 1000);
}

function remainingSeconds() {
  return TOTAL_TIME - elapsedSeconds();
}

function startTimer() {
  stopTimer();

  timerId = setInterval(() => {
    const remain = remainingSeconds();
    els.timer.textContent = formatTime(remain);

    if (remain <= 60) {
      els.timer.style.color = "#ff5d5d";
    } else {
      els.timer.style.color = "";
    }

    if (remain <= 0) {
      failGame();
    }
  }, 300);
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function clearTypingTimers() {
  typingTimerIds.forEach(id => clearTimeout(id));
  typingTimerIds = [];
}

function typeMissionStory(text) {
  clearTypingTimers();
  els.missionStory.innerHTML = "";

  const lines = text.split("\n");

  let lineIndex = 0;
  let charIndex = 0;
  let currentLineElement = null;

  function typeNextCharacter() {
    if (lineIndex >= lines.length) {
      const cursor = els.missionStory.querySelector(".typing-cursor");
      if (cursor) cursor.classList.remove("typing-cursor");
      return;
    }

    if (charIndex === 0) {
      const oldCursor = els.missionStory.querySelector(".typing-cursor");

      if (oldCursor) {
        oldCursor.classList.remove("typing-cursor");
        oldCursor.classList.add("line-done");
      }

      currentLineElement = document.createElement("span");
      currentLineElement.className = "typing-line typing-cursor";
      els.missionStory.appendChild(currentLineElement);
    }

    const currentLineText = lines[lineIndex];

    if (currentLineText.length === 0) {
      currentLineElement.innerHTML = "&nbsp;";
      currentLineElement.classList.remove("typing-cursor");
      currentLineElement.classList.add("line-done");

      lineIndex++;
      charIndex = 0;

      const timer = setTimeout(typeNextCharacter, 260);
      typingTimerIds.push(timer);
      return;
    }

    currentLineElement.textContent += currentLineText[charIndex];
    charIndex++;

    if (charIndex >= currentLineText.length) {
      currentLineElement.classList.remove("typing-cursor");
      currentLineElement.classList.add("line-done");

      lineIndex++;
      charIndex = 0;

      const timer = setTimeout(typeNextCharacter, 430);
      typingTimerIds.push(timer);
    } else {
      const timer = setTimeout(typeNextCharacter, 45);
      typingTimerIds.push(timer);
    }
  }

  typeNextCharacter();
}

function renderMission() {
  const mission = missions[state.currentMission];

  els.missionTitle.textContent = mission.title;
  els.missionTag.textContent = mission.tag;
  typeMissionStory(mission.story);
  els.missionHint.textContent = mission.hint;
  els.missionHintBox.classList.add("hidden");
  els.answerInput.value = "";
  els.feedback.textContent = "";
  els.feedback.className = "feedback";

  els.currentTeam.textContent = state.teamName;
  els.hintCount.textContent = `${state.hintUsed}회`;
  els.missionCount.textContent = `${state.currentMission + 1}/${missions.length}`;

  const progress = (state.currentMission / missions.length) * 100;
  els.progressBar.style.width = `${progress}%`;

  saveState();

  setTimeout(() => {
    els.answerInput.focus();
  }, 100);
}

function startGame() {
  const name = els.teamName.value.trim();

  if (!name) {
    toast("팀 이름을 입력해 주세요.");
    els.teamName.focus();
    return;
  }

  state = {
    teamName: name,
    currentMission: 0,
    hintUsed: 0,
    startTime: Date.now(),
    endTime: null,
    completed: false
  };

  saveState();
  showScreen("game");
  renderMission();
  startTimer();
}

function checkAnswer() {
  const mission = missions[state.currentMission];
  const userAnswer = normalize(els.answerInput.value);

  if (!userAnswer) {
    toast("암호를 입력해 주세요.");
    return;
  }

  const isCorrect = mission.answer.some(ans => normalize(ans) === userAnswer);

  if (!isCorrect) {
    els.feedback.textContent = "암호가 맞지 않습니다. 다시 확인해 보세요.";
    els.feedback.className = "feedback no";
    return;
  }

  els.feedback.textContent = "정답입니다. 다음 기록이 열립니다.";
  els.feedback.className = "feedback ok";

  setTimeout(() => {
    state.currentMission += 1;

    if (state.currentMission >= missions.length) {
      completeGame();
    } else {
      renderMission();
    }
  }, 700);
}

function showHint() {
  if (els.missionHintBox.classList.contains("hidden")) {
    state.hintUsed += 1;
    els.hintCount.textContent = `${state.hintUsed}회`;
    els.missionHintBox.classList.remove("hidden");
    saveState();
  } else {
    els.missionHintBox.classList.add("hidden");
  }
}

async function completeGame() {
  stopTimer();
  clearTypingTimers();

  state.completed = true;
  state.endTime = Date.now();
  saveState();

  const usedTime = Math.floor((state.endTime - state.startTime) / 1000);

  els.progressBar.style.width = "100%";
  els.resultTeam.textContent = state.teamName;
  els.resultTime.textContent = formatTime(usedTime);
  els.resultHints.textContent = `${state.hintUsed}회`;

  els.endingText.textContent =
    "도서관 시스템이 정상화되었습니다. 책은 읽는 순간 끝나는 것이 아니라, 사람 안에 기억으로 남습니다.";

  showScreen("ending");

  await saveRanking({
    teamName: state.teamName,
    usedTime,
    hintUsed: state.hintUsed
  });
}

function failGame() {
  stopTimer();
  clearTypingTimers();

  state.completed = true;
  saveState();

  els.resultTeam.textContent = state.teamName;
  els.resultTime.textContent = "실패";
  els.resultHints.textContent = `${state.hintUsed}회`;

  els.endingText.textContent =
    "제한시간이 종료되었습니다. 도서관 기록 복구에 실패했습니다. 다시 도전해 보세요.";

  showScreen("ending");
}

async function saveRanking(result) {
  if (!firebaseReady || !db) {
    console.warn("Firebase 설정 전이므로 랭킹 저장 생략");
    return;
  }

  try {
    await addDoc(collection(db, "escapeRankings"), {
      teamName: result.teamName,
      usedTime: result.usedTime,
      hintUsed: result.hintUsed,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("랭킹 저장 실패:", error);
  }
}

async function loadRanking() {
  showScreen("ranking");

  els.rankingList.innerHTML = `<p class="empty-text">랭킹을 불러오는 중...</p>`;

  if (!firebaseReady || !db) {
    els.rankingList.innerHTML = `
      <p class="empty-text">
        Firebase 설정 전입니다.<br>
        app.js의 firebaseConfig를 교체하면 실시간 랭킹이 작동합니다.
      </p>`;
    return;
  }

  try {
    const q = query(
      collection(db, "escapeRankings"),
      orderBy("usedTime", "asc"),
      limit(10)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      els.rankingList.innerHTML = `<p class="empty-text">아직 등록된 기록이 없습니다.</p>`;
      return;
    }

    els.rankingList.innerHTML = "";
    let rank = 1;

    snapshot.forEach(doc => {
      const data = doc.data();

      const item = document.createElement("div");
      item.className = "rank-item";

      item.innerHTML = `
        <div class="rank-num">${rank}</div>
        <div>
          <div class="rank-team">${escapeHtml(data.teamName || "이름 없음")}</div>
          <div class="rank-meta">힌트 ${data.hintUsed ?? 0}회 사용</div>
        </div>
        <div class="rank-time">${formatTime(data.usedTime || 0)}</div>
      `;

      els.rankingList.appendChild(item);
      rank++;
    });
  } catch (error) {
    console.error(error);

    els.rankingList.innerHTML = `
      <p class="empty-text">
        랭킹을 불러오지 못했습니다.<br>
        Firestore 보안 규칙을 확인해 주세요.
      </p>`;
  }
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

els.startBtn.addEventListener("click", startGame);
els.submitBtn.addEventListener("click", checkAnswer);
els.hintBtn.addEventListener("click", showHint);
els.rankingBtn.addEventListener("click", loadRanking);
els.showRankingBtn.addEventListener("click", loadRanking);

els.restartBtn.addEventListener("click", () => {
  resetState();
  els.teamName.value = "";
  showScreen("start");
});

els.backBtn.addEventListener("click", () => {
  if (state.teamName && !state.completed) {
    showScreen("game");
    renderMission();
    startTimer();
  } else {
    showScreen("start");
  }
});

els.answerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkAnswer();
  }
});

window.addEventListener("load", () => {
  if (loadState()) {
    els.teamName.value = state.teamName;
    showScreen("game");
    renderMission();
    startTimer();
    toast("이전 진행 상황을 이어서 시작합니다.");
  }
});