import {
  resolveCache
} from './utils/dom';

// 메인 파일 삽입
// 업데이트 시 즉각적으로 업데이트를 반영하기 위해 이러한 방식을 사용함
const scriptElement = document.createElement('script');
scriptElement.src = resolveCache('https://nbsp1221.github.io/klas-helper/dist/main.js', 60);
document.head.appendChild(scriptElement);

// window.onload 설정
window.addEventListener('load', () => {
  // internalPathFunctions 함수 실행
  for (const path in internalPathFunctions) {
    if (path === location.pathname) {
      internalPathFunctions[path]();
    }
  }
});

// 태그에 삽입되지 않는 함수 목록
// GM 기능을 사용하기 위해 유저 스크립트 내부의 함수가 필요
const internalPathFunctions = {
  // 온라인 강의 화면
  '/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do': () => {
    // 온라인 강의 동영상 다운로드
    const downloadVideo = (videoCode) => {
      GM.xmlHttpRequest({
        method: 'GET',
        url: 'https://kwcommons.kw.ac.kr/viewer/ssplayer/uniplayer_support/content.php?content_id=' + videoCode,
        onload: function (response) {
          const documentXML = response.responseXML;
          const videoList = [];

          // 분할된 동영상 등 다양한 상황 처리
          if (documentXML.getElementsByTagName('desktop').length > 0) {
            videoList.push({
              url: documentXML.getElementsByTagName('media_uri')[0].innerHTML,
              type: documentXML.getElementsByTagName('content_type')[0].innerHTML
            });
          }
          else {
            const mediaURI = documentXML.getElementsByTagName('media_uri')[0].innerHTML;
            const videoNames = documentXML.getElementsByTagName('main_media');
            const videoTypes = documentXML.getElementsByTagName('story_type');

            for (let i = 0; i < videoNames.length; i++) {
              videoList.push({
                url: mediaURI.replace('[MEDIA_FILE]', videoNames[i].innerHTML),
                type: videoTypes[i].innerHTML
              });
            }
          }

          // 다운로드 버튼 렌더링
          for (let i = 0; i < videoList.length; i++) {
            const videoURL = videoList[i].url;
            const videoType = videoList[i].type === 'video1' ? '동영상' : '오디오';

            const labelElement = document.createElement('label');
            labelElement.innerHTML = `
              <a href="${videoURL}" target="_blank" style="background-color: brown; padding: 10px; text-decoration: none">
                <span style="color: white; font-weight: bold">${videoType} 받기 #${i + 1}</span>
              </a>
            `;

            document.querySelector('.mvtopba > label:last-of-type').after(labelElement);
          }
        }
      });
    };

    // 고유 번호를 받을 때까지 대기
    const waitTimer = setInterval(() => {
      const videoCode = document.body.getAttribute('data-video-code');

      if (videoCode) {
        clearInterval(waitTimer);
        downloadVideo(videoCode);
      }
    }, 100);

    // 일정 시간이 지날 경우 타이머 해제
    setTimeout(() => {
      clearInterval(waitTimer);
    }, 10000);
  }
};