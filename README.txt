# 도서관 방탈출 웹페이지

## 파일 구성
- index.html
- style.css
- app.js

## 사용 방법
1. GitHub 저장소에 세 파일을 업로드합니다.
2. GitHub Pages를 활성화합니다.
3. Firebase 콘솔에서 웹앱을 만들고 app.js의 firebaseConfig를 교체합니다.
4. Firestore Database를 생성합니다.
5. 학생은 스마트폰으로 접속해 팀 이름 입력 후 진행합니다.

## Firestore 컬렉션
- escapeRankings

## 권장 Firestore Rules 예시
테스트용입니다. 운영 시 학교 상황에 맞게 제한하세요.

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /escapeRankings/{docId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false;
    }
  }
}
