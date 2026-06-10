// =========================
// Firebase
// =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQa3LJ7a7QPbDLR8NkFyBe-CM9Sg4C8RY",
  authDomain: "library-escape.firebaseapp.com",
  projectId: "library-escape",
  storageBucket: "library-escape.firebasestorage.app",
  messagingSenderId: "765610754235",
  appId: "1:765610754235:web:4a9e941fa8313f20a8699e",
  measurementId: "G-Z442XEZ08X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// =========================
// 공통
// =========================
const $ = (id) => document.getElementById(id);

const els = {

  startScreen: $("startScreen"),
  introScreen: $("introScreen"),
  gameScreen: $("gameScreen"),
  endingScreen: $("endingScreen"),
  rankingScreen: $("rankingScreen"),

  startBtn: $("startBtn"),
  rankingBtn: $("rankingBtn"),
  enterBtn: $("enterBtn"),

  missionTitle: $("missionTitle"),
  missionTag: $("missionTag"),
  missionStory: $("missionStory"),

  answerInput: $("answerInput"),

  answerInput1: $("answerInput1"),
  answerInput2: $("answerInput2"),

  customMissionBox: $("customMissionBox"),

  hintText1: $("hintText1"),
  hintText2: $("hintText2"),

  submitBtn: $("submitBtn"),
  hintBtn: $("hintBtn"),

  feedback: $("feedback"),

  progressBar: $("progressBar"),

  timer: $("timer"),

  currentTeam: $("currentTeam"),
  hintCount: $("hintCount"),
  missionCount: $("missionCount"),

  endingText: $("endingText"),
  resultTeam: $("resultTeam"),
  resultTime: $("resultTime"),
  resultHints: $("resultHints"),

  rankingList: $("rankingList"),

  showRankingBtn: $("showRankingBtn"),
  restartBtn: $("restartBtn"),
  backBtn: $("backBtn"),

  teamName: $("teamName"),

  introTyping: $("introTyping")
};


// =========================
// 상태
// =========================
const state = {
  currentMission: 0,
  hintUsed: 0,
  startedAt: null,
  timerInterval: null,
  teamName: ""
};


// =========================
// 미션
// =========================
const missions = [

  {
    title: "사라진 숫자",
    tag: "신간도서",
    story:
`도서실 신간도서 코너를 둘러봅니다.
첫 번째 단서를 찾기 위해서는

『걷는 독서』 책을 찾아야 합니다!

암호 문장:

__의 완성은 삶이기에.
그리하여 우리 모두는 저마다 한 권의 책을 써나가는 사람이다. 삶이라는 단 한 권의 책을!`,

    answer: ["독서"],

    hint:
"『걷는 독서』의 서문에 있는 문장입니다. 도서관 서가에서 책을 찾아 서문을 읽어보세요"
  },

  {
    title: "사라진 페이지",
    tag: "소설 코너",

    story:
`813.7 구역으로 이동하세요.

『아몬드』 책 근처에 숨겨진 단서를 확인하세요.`,

    answer: ["사랑"],

    hint:
"책 사이에 끼워 둔 작은 메모를 먼저 찾아야 합니다."
  },

  {
    title: "금지된 문장",
    tag: "시집 코너",

    story:
`윤동주 시집 또는
‘별 헤는 밤’을 찾아보세요.

가장 많이 반복되는 핵심 단어는?`,

    answer: ["별"],

    hint:
"윤동주의 시에서 가장 중요한 이미지입니다."
  },

  {
    title: "왜곡된 기록 1",
    tag: "책 제목 복구",

    story:
`전지적 ○○시점

사라진 두 글자를 입력하세요.`,

    answer: ["독자"],

    hint:
"웹툰과 영화로도 제작되었습니다."
  },

  {
    title: "왜곡된 기록 2",
    tag: "책 제목 복구",

    story:
`달러구트 ○ 백화점

사라진 한 글자를 입력하세요.`,

    answer: ["꿈"],

    hint:
"잠들면 꿈을 사고파는 신비한 백화점 이야기입니다."
  },

  {
    title: "사서의 기억",
    tag: "도서관 탐색 미션",

    customMission: true,

    story:
`도서관 시스템 복구를 위해서는
사서선생님의 마지막 기록을 확인해야 합니다.`,

    answer1: ["최성환"],
    answer2: ["김보영"],

    hint1:
`도서실 사서선생님 자리 명패를 확인하세요!
아니면 가까이 있는 도서부원에게 물어보세요~`,

    hint2:
`가까이 있는 도서부원에게 물어보세요~`
  },

  {
    title: "마지막 기록",
    tag: "최종 복구",

    story:
`모든 기록이 연결되었습니다.

마지막 암호를 입력하세요.

책은 읽는 순간 끝나는 것이 아니라,
사람 안에 기억으로 남습니다!`,

    answer: ["기억"],

    hint:
"마지막 문장의 핵심 단어입니다."
  }

];


// =========================
// 시작
// =========================
els.startBtn.addEventListener("click", () => {

  const name = els.teamName.value.trim();

  if (!name) {
    toast("이름을 입력해 주세요.");
    return;
  }

  state.teamName = name;

  showScreen("introScreen");

  startIntroTyping();
});


// =========================
// 오프닝
// =========================
function startIntroTyping() {

  const lines = [

`도서관 폐쇄까지 남은 시간:
20분`,

`오늘 새벽,
도서관의 마지막 기록이 사라졌습니다.`,

`그리고 사서가 남긴
의문의 메시지가 발견되었습니다.`,

`“책을 읽지 않는 순간,
기억도 사라진다.”`,

`도서관 곳곳에 숨겨진 단서를 찾아
마지막 기록을 복구하세요.`,

`실패할 경우,
도서관은 영구 폐쇄됩니다.`
  ];

  let lineIndex = 0;

  els.introTyping.innerHTML = "";

  function typeLine() {

    if (lineIndex >= lines.length) {

      els.enterBtn.classList.remove("hidden");
      return;
    }

    const lineDiv = document.createElement("div");
    lineDiv.className = "typing-line";

    els.introTyping.appendChild(lineDiv);

    const text = lines[lineIndex];

    let charIndex = 0;

    const typing = setInterval(() => {

      lineDiv.textContent += text[charIndex];

      charIndex++;

      if (charIndex >= text.length) {

        clearInterval(typing);

        lineIndex++;

        setTimeout(typeLine, 500);
      }

    }, 40);
  }

  typeLine();
}


// =========================
// 입장
// =========================
els.enterBtn.addEventListener("click", () => {

  document.body.classList.add("dark-mode");

  showScreen("gameScreen");

  startGame();
});


// =========================
// 게임 시작
// =========================
function startGame() {

  state.currentMission = 0;
  state.hintUsed = 0;

  state.startedAt = Date.now();

  els.currentTeam.textContent = state.teamName;

  startTimer();

  renderMission();
}



// =========================
// 미션 타이핑 효과
// =========================
function typeMissionStory(text) {

  els.missionStory.innerHTML = "";

  const lines = text.split("\n");

  let lineIndex = 0;
  let charIndex = 0;
  let currentLineElement = null;

  function typeNextCharacter() {

    if (lineIndex >= lines.length) {

      const cursor =
        els.missionStory.querySelector(".typing-cursor");

      if (cursor)
        cursor.classList.remove("typing-cursor");

      return;
    }

    if (charIndex === 0) {

      const oldCursor =
        els.missionStory.querySelector(".typing-cursor");

      if (oldCursor) {

        oldCursor.classList.remove("typing-cursor");

        oldCursor.classList.add("line-done");
      }

      currentLineElement =
        document.createElement("span");

      currentLineElement.className =
        "typing-line typing-cursor";

      els.missionStory.appendChild(currentLineElement);
    }

    const currentLineText = lines[lineIndex];

    if (currentLineText.length === 0) {

      currentLineElement.innerHTML = "&nbsp;";

      currentLineElement.classList.remove("typing-cursor");

      currentLineElement.classList.add("line-done");

      lineIndex++;
      charIndex = 0;

      setTimeout(typeNextCharacter, 260);

      return;
    }

    currentLineElement.textContent +=
      currentLineText[charIndex];

    charIndex++;

    if (charIndex >= currentLineText.length) {

      currentLineElement.classList.remove("typing-cursor");

      currentLineElement.classList.add("line-done");

      lineIndex++;
      charIndex = 0;

      setTimeout(typeNextCharacter, 430);

    } else {

      setTimeout(typeNextCharacter, 45);
    }
  }

  typeNextCharacter();
}


// =========================
// 미션 렌더
// =========================
function renderMission() {

  const mission = missions[state.currentMission];

  els.missionTitle.textContent = mission.title;
  els.missionTag.textContent = mission.tag;
  typeMissionStory(mission.story);

  els.feedback.textContent = "";

  els.missionCount.textContent =
    `${state.currentMission + 1}/${missions.length}`;

  els.progressBar.style.width =
    `${((state.currentMission + 1) / missions.length) * 100}%`;

if (mission.customMission) {

  els.customMissionBox.classList.remove("hidden");

  document.querySelector(".answer-area")
    .classList.add("hidden");

  els.hintText1.textContent = mission.hint1;
  els.hintText2.textContent = mission.hint2;

  $("hintText1").classList.remove("show");
  $("hintText2").classList.remove("show");

  els.answerInput1.value = "";
  els.answerInput2.value = "";

  } else {

  els.customMissionBox.classList.add("hidden");

  $("missionHintBox").classList.add("hidden");

  document.querySelector(".answer-area")
    .classList.remove("hidden");

  els.answerInput.value = "";
}
}


// =========================
// 힌트
// =========================
els.hintBtn.addEventListener("click", () => {

  const mission = missions[state.currentMission];

  const hintBox =
    $("missionHintBox");

  const hintText =
    $("missionHint");

  hintText.textContent =
    mission.hint;

  hintBox.classList.remove("hidden");

  state.hintUsed++;

  els.hintCount.textContent =
    `${state.hintUsed}회`;
});


// =========================
// 정답 확인
// =========================
els.submitBtn.addEventListener("click", checkAnswer);
$("customSubmitBtn").addEventListener("click", checkAnswer);

$("customHintBtn1").addEventListener("click", () => {
  $("hintText1").classList.toggle("show");
});

$("customHintBtn2").addEventListener("click", () => {
  $("hintText2").classList.toggle("show");
});

function normalize(str) {
  return str.trim().replace(/\s+/g, "");
}

function checkAnswer() {

  const mission = missions[state.currentMission];

  let isCorrect = false;

  if (mission.customMission) {

    const answer1 =
      normalize(els.answerInput1.value);

    const answer2 =
      normalize(els.answerInput2.value);

    const correct1 =
      mission.answer1.some(
        ans => normalize(ans) === answer1
      );

    const correct2 =
      mission.answer2.some(
        ans => normalize(ans) === answer2
      );

    isCorrect = correct1 && correct2;

  } else {

    const userAnswer =
      normalize(els.answerInput.value);

    if (!userAnswer) {

      toast("정답을 입력해 주세요.");
      return;
    }

    isCorrect =
      mission.answer.some(
        ans => normalize(ans) === userAnswer
      );
  }

  if (!isCorrect) {

    els.feedback.textContent =
      "암호가 맞지 않습니다.";

    els.feedback.className =
      "feedback no";

    return;
  }

  els.feedback.textContent =
    "정답입니다.";

  els.feedback.className =
    "feedback ok";

  setTimeout(() => {

    state.currentMission++;

    if (state.currentMission >= missions.length) {
      completeGame();
    } else {
      renderMission();
    }

  }, 700);
}


// =========================
// 타이머
// =========================
function startTimer() {

  clearInterval(state.timerInterval);

  state.timerInterval = setInterval(() => {

    const elapsed =
      Math.floor((Date.now() - state.startedAt) / 1000);

    const remain = 1200 - elapsed;

    if (remain <= 0) {

      clearInterval(state.timerInterval);

      failGame();
      return;
    }

    const min =
      String(Math.floor(remain / 60)).padStart(2, "0");

    const sec =
      String(remain % 60).padStart(2, "0");

    els.timer.textContent =
      `${min}:${sec}`;

  }, 1000);
}


// =========================
// 성공
// =========================
async function completeGame() {

  clearInterval(state.timerInterval);

  document.body.classList.remove("dark-mode");

  const used =
    Math.floor((Date.now() - state.startedAt) / 1000);

  const min =
    String(Math.floor(used / 60)).padStart(2, "0");

  const sec =
    String(used % 60).padStart(2, "0");

  els.resultTeam.textContent =
    state.teamName;

  els.resultTime.textContent =
    `${min}:${sec}`;

  els.resultHints.textContent =
    `${state.hintUsed}회`;

  els.endingText.innerHTML = `
도서관 시스템이 정상화되었습니다.<br><br>

<span class="ending-highlight">
<span class="book-red">책은</span>
읽는 순간 끝나는 것이 아니라,<br>
사람 안에 기억으로 남습니다!
</span>
`;

  try {

    await addDoc(
      collection(db, "escapeRankings"),
      {
        name: state.teamName,
        usedTime: used,
        hints: state.hintUsed,
        createdAt: Date.now()
      }
    );

  } catch (e) {
    console.error(e);
  }

  showScreen("endingScreen");
}


// =========================
// 실패
// =========================
function failGame() {

  document.body.classList.add("dark-mode");

  els.resultTeam.textContent =
    state.teamName;

  els.resultTime.textContent =
    "시간 초과";

  els.resultHints.textContent =
    `${state.hintUsed}회`;

  document.querySelector(".eyebrow")
    .textContent =
    "FAILED TO RESTORE RECORD";

  document.querySelector("#endingScreen h2")
    .textContent =
    "기록 복구 실패";

  els.endingText.innerHTML = `
제한시간이 종료되었습니다.<br><br>
도서관은 영구 폐쇄되었습니다.
`;

  showScreen("endingScreen");
}


// =========================
// 랭킹
// =========================
els.rankingBtn.addEventListener("click", openRanking);
els.showRankingBtn.addEventListener("click", openRanking);

async function openRanking() {

  document.body.classList.remove("dark-mode");

  showScreen("rankingScreen");

  els.rankingList.innerHTML =
    `<p class="empty-text">불러오는 중...</p>`;

  try {

    const q = query(
      collection(db, "escapeRankings"),
      orderBy("usedTime", "asc"),
      limit(50)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      els.rankingList.innerHTML =
        `<p class="empty-text">랭킹이 없습니다.</p>`;
      return;
    }

    els.rankingList.innerHTML = "";

    let rank = 1;

    snapshot.forEach(doc => {

      const data = doc.data();

      const displayName =
        data.name || data.teamName || "이름 없음";

      const usedTime =
        data.usedTime || 0;

      const hintCount =
        data.hints ?? data.hintUsed ?? 0;

      const item = document.createElement("div");
      item.className = "rank-item";

      item.innerHTML = `
        <div class="rank-num">${rank}</div>

        <div>
          <div class="rank-team">${escapeHtml(displayName)}</div>
          <div class="rank-meta">힌트 ${hintCount}회 사용</div>
        </div>

        <div class="rank-time">${formatRankingTime(usedTime)}</div>
      `;

      els.rankingList.appendChild(item);

      rank++;
    });

  } catch (e) {

    console.error(e);

    els.rankingList.innerHTML =
      `<p class="empty-text">랭킹을 불러오지 못했습니다.</p>`;
  }
}

function formatRankingTime(seconds) {
  const safe = Math.max(0, seconds || 0);
  const min = String(Math.floor(safe / 60)).padStart(2, "0");
  const sec = String(safe % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// =========================
// 뒤로가기
// =========================
els.backBtn.addEventListener("click", () => {

  showScreen("startScreen");
});


// =========================
// 다시 시작
// =========================
els.restartBtn.addEventListener("click", () => {

  location.reload();
});


// =========================
// 화면 전환
// =========================
function showScreen(id) {

  document.querySelectorAll(".screen")
    .forEach(screen =>
      screen.classList.remove("active")
    );

  $(id).classList.add("active");
}


// =========================
// 토스트
// =========================
function toast(msg) {

  const toast = $("toast");

  toast.textContent = msg;

  toast.classList.add("show");

  setTimeout(() => {

    toast.classList.remove("show");

  }, 3000);
}