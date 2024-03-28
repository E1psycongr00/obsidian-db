## 요약

초기 설정


## 변경 사항

- 0.1.0:
    - markdown 파일의 도메인을 구성할 스키마 구현(파일, 링크, 태그, 파일태그)
    - 쿼리 함수 구현(파일 쿼리, 태그 쿼리, 링크 쿼리) 
- 0.2.0:
    - markdownDB 인스턴스 초기화 및 쿼리 메서드 추가
- 0.2.1:
    - module import 문제 수정 
- 0.2.3:
    - gray matter import 오류 수정
- 0.2.4:
    - 기존 구조 개선(obsidianDB, read, parser)
    - link 오류 수정
- 0.2.5:
    - 링크 연결 오류시 오류 메시지 출력
- 0.2.6:
    - 파일 path 컬럼 유니크 설정
    - 링크 잘못된 오류 메시지 출력 수정
    - 링크 urlPath에 basePath가 나오지 않도록 수정
- 0.2.7:
    - Extractor 객체 분리 및 구조 개선
    - Wiki link Extractor, MdLinkExtractor 추가