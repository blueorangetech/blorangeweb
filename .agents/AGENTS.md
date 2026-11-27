# Rules

- **Do not run any git-related commands.** Do not run any command starting with 'git' on the terminal under any circumstances (including git status, git add, git commit, git push, git checkout, git diff, etc.). The user will manage all Git operations themselves.
- **리포트 대시보드는 tab 시 2칸(2 spaces)만 이동하도록 규약 설정**
- **폴더 구조 및 신규 페이지/기능 개발 지침**: `docs/folder-structure.md`의 3계층 구조(`src/shared/`, `src/features/`, `src/pages/<client>/`)와 Client-First Colocation 원칙을 반드시 따릅니다. 신규 클라이언트 페이지는 `src/pages/<client>/`에 독립 폴더로 생성하고, CSS와 전용 컴포넌트/유틸을 같은 폴더에 배치합니다.
