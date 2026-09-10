import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

process.env.RUNTIME_NODE_MODULES = 'C:/Users/blueorange/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';

const workspaceDir = 'C:/Users/blueorange/Desktop/Boweb';
const SKILL_DIR = 'C:/Users/blueorange/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations';
const TMP_DIR = path.join(workspaceDir, '.codex-ppt-build');
const FINAL_PPTX = path.join(workspaceDir, 'output', 'Playground_AI_Creative_Challenge.pptx');
const RUNTIME_PYTHON = 'C:/Users/blueorange/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const { finalizePresentation } = await import(pathToFileURL(path.join(SKILL_DIR, 'container_tools/artifact_tool_utils.mjs')).href);

const p = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const FONT = 'Malgun Gothic';
const C = { bg: '#090B18', panel: '#12162A', panel2: '#171C34', white: '#F8FAFC', muted: '#A7B0C7', purple: '#8B5CF6', blue: '#4F7CFF', cyan: '#38BDF8', line: '#303857', green: '#34D399' };

function box(slide, x, y, w, h, fill = C.panel, line = 'none', radius = false) {
  return slide.shapes.add({ geometry: radius ? 'roundRect' : 'rect', position: { left: x, top: y, width: w, height: h }, fill, line: { fill: line, width: line === 'none' ? 0 : 1.5 } });
}
function text(slide, value, x, y, w, h, size = 22, color = C.white, bold = false, align = 'left') {
  const s = slide.shapes.add({ geometry: 'textbox', position: { left: x, top: y, width: w, height: h }, fill: 'none', line: { fill: 'none', width: 0 } });
  s.text = value;
  s.text.style = { typeface: FONT, fontSize: size, bold, color, alignment: align, verticalAlignment: 'middle', autoFit: 'shrinkText', marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0 };
  return s;
}
function title(slide, no, heading, sub) {
  text(slide, String(no).padStart(2, '0'), 64, 42, 48, 28, 14, C.purple, true);
  text(slide, heading, 64, 82, 1120, 56, 34, C.white, true);
  if (sub) text(slide, sub, 64, 140, 1100, 40, 17, C.muted);
}
function footer(slide, no) {
  text(slide, 'PLAYGROUND AI CREATIVE', 64, 678, 300, 18, 10, '#69728D', true);
  text(slide, `${no} / 09`, 1140, 678, 76, 18, 10, '#69728D', true, 'right');
}
function screenshot(slide, x, y, w, h, label, hint = '이 영역에 화면 캡처를 삽입하세요') {
  box(slide, x, y, w, h, '#0D1020', C.line, true);
  text(slide, 'SCREEN CAPTURE', x + 24, y + h / 2 - 38, w - 48, 22, 11, C.purple, true, 'center');
  text(slide, label, x + 24, y + h / 2 - 10, w - 48, 34, 20, C.white, true, 'center');
  text(slide, hint, x + 24, y + h / 2 + 28, w - 48, 26, 12, C.muted, false, 'center');
}
function feature(slide, y, num, heading, body, accent = C.purple) {
  text(slide, num, 70, y, 42, 38, 13, accent, true);
  text(slide, heading, 124, y - 2, 360, 32, 19, C.white, true);
  text(slide, body, 124, y + 31, 390, 56, 14, C.muted);
}
function pill(slide, label, x, y, w, color = C.purple) {
  box(slide, x, y, w, 30, C.panel2, color, true);
  text(slide, label, x + 10, y + 2, w - 20, 26, 11, color, true, 'center');
}
function detailList(slide, items, x, y, w) {
  items.forEach((item, i) => {
    text(slide, String(i + 1).padStart(2, '0'), x, y + i * 76, 34, 28, 12, C.purple, true);
    text(slide, item[0], x + 46, y + i * 76 - 2, w - 46, 28, 17, C.white, true);
    text(slide, item[1], x + 46, y + i * 76 + 28, w - 46, 38, 13, C.muted);
  });
}

// 1. Cover
{
  const s = p.slides.add(); s.background.fill = C.bg;
  box(s, 0, 0, 18, 720, C.purple);
  text(s, 'INTERNAL CHALLENGE 2026', 72, 92, 420, 24, 12, C.cyan, true);
  text(s, 'Playground\nAI Creative', 72, 148, 760, 176, 54, C.white, true);
  text(s, '이미지 제작부터 비교와 활용까지 이어지는 AI 크리에이티브 워크스페이스', 76, 350, 680, 70, 21, C.muted);
  box(s, 820, 108, 330, 440, '#10152B', C.line, true);
  text(s, 'AI', 858, 146, 250, 180, 108, C.purple, true, 'center');
  text(s, 'CREATE\nCOMPARE\nEXPLORE', 858, 352, 250, 120, 20, C.white, true, 'center');
  text(s, 'PLAYGROUND', 76, 630, 250, 28, 13, '#69728D', true);
}

// 2. Problem
{
  const s = p.slides.add(); s.background.fill = C.bg; title(s, 2, '크리에이티브 제작 과정의 단절', '기획, 제작, 비교, 다운로드가 여러 도구와 반복 작업에 흩어져 있습니다');
  feature(s, 226, '01', '반복적인 시안 제작', '각도와 재질을 바꿀 때마다 별도의 요청과 파일 정리가 필요합니다.');
  feature(s, 340, '02', '참조 이미지 활용의 어려움', '편집 대상과 인물, 재질 이미지를 함께 반영하기 어렵습니다.', C.blue);
  feature(s, 454, '03', '결과 비교와 이력 손실', '새 결과가 이전 결과를 덮어쓰면 시안 간 차이를 빠르게 판단하기 어렵습니다.', C.cyan);
  box(s, 600, 220, 560, 330, C.panel, C.line, true);
  text(s, '한 화면에서 이어지는 작업', 640, 258, 480, 38, 24, C.white, true);
  text(s, '이미지 입력', 640, 334, 130, 32, 16, C.muted, true);
  text(s, 'AI 편집', 810, 334, 130, 32, 16, C.muted, true);
  text(s, '결과 검토', 980, 334, 130, 32, 16, C.muted, true);
  text(s, '01', 672, 388, 70, 70, 34, C.purple, true, 'center');
  text(s, '02', 842, 388, 70, 70, 34, C.blue, true, 'center');
  text(s, '03', 1012, 388, 70, 70, 34, C.cyan, true, 'center');
  text(s, 'Playground는 이 과정을 하나의 작업 공간으로 연결합니다', 640, 492, 480, 34, 15, C.white, true, 'center'); footer(s, 2);
}

// 3. Overview
{
  const s = p.slides.add(); s.background.fill = C.bg; title(s, 3, 'AI 크리에이티브 기능 구성', '목적에 맞는 탭을 선택하고 동일한 업로드, 생성, 검토 흐름을 사용합니다');
  const rows = [
    ['다양한 각도', '한 장의 이미지에서 선택한 카메라 구도를 일괄 생성'],
    ['리스타일', '구조를 유지하면서 표면 재질과 색감을 변환'],
    ['PhotoRoom 소재 제작', '배경 제거와 그림자, 여백을 적용한 광고 소재 제작'],
    ['이미지 확장', '목표 캔버스 비율에 맞춰 배경 영역을 자연스럽게 확장'],
    ['이미지 합성', '최대 3개의 참조 이미지와 자연어 지시를 결합'],
  ];
  rows.forEach((r, i) => {
    const y = 205 + i * 82; text(s, String(i + 1).padStart(2, '0'), 70, y, 38, 34, 12, i < 2 ? C.purple : i < 4 ? C.blue : C.cyan, true);
    text(s, r[0], 122, y - 2, 270, 32, 18, C.white, true); text(s, r[1], 420, y - 2, 720, 44, 15, C.muted);
    box(s, 122, y + 52, 1018, 1, C.line);
  }); footer(s, 3);
}

// 4. Multiple angles
{
  const s = p.slides.add(); s.background.fill = C.bg; title(s, 4, '다양한 각도 생성', '하나의 원본에서 필요한 카메라 구도를 선택해 여러 시안을 한 번에 생성합니다');
  screenshot(s, 64, 210, 700, 400, '다양한 각도 생성 화면', '각도 선택과 누적 결과 그리드가 보이는 캡처');
  pill(s, 'ComfyUI', 812, 210, 110); pill(s, '최대 9개 각도', 936, 210, 150, C.blue);
  detailList(s, [
    ['원본 이미지 입력', '클릭 또는 드래그로 제품과 인물 이미지를 업로드합니다.'],
    ['각도 선택', '정면, 클로즈업, 와이드, 좌우 45°와 90° 등을 선택합니다.'],
    ['결과 누적', '새로 생성한 이미지는 기존 결과를 유지한 채 앞쪽에 추가됩니다.'],
    ['상세 확인', '자세히 보기에서 결과 이미지의 고유 비율을 유지해 확인합니다.'],
  ], 812, 274, 390); footer(s, 4);
}

// 5. Restyle
{
  const s = p.slides.add(); s.background.fill = C.bg; title(s, 5, '리스타일', '가구와 공간의 형태를 유지하면서 재질과 색상을 자연스럽게 변경합니다');
  detailList(s, [
    ['구조 보존', '제품 형태와 공간 구도는 유지하고 표면 표현에 집중합니다.'],
    ['구체적인 프롬프트', '우드, 패브릭, 대리석처럼 재질과 색상을 직접 지정합니다.'],
    ['빠른 키워드 입력', '자주 사용하는 재질 프롬프트를 추천 칩으로 제공합니다.'],
    ['결과별 비교', '생성 당시 원본과 프롬프트를 카드에 함께 보존합니다.'],
  ], 68, 224, 430);
  screenshot(s, 550, 210, 660, 400, '리스타일 화면', '업로드, 프롬프트, 전후 비교 카드가 보이는 캡처'); footer(s, 5);
}

// 6. PhotoRoom
{
  const s = p.slides.add(); s.background.fill = C.bg; title(s, 6, 'PhotoRoom 소재 제작', '배경과 그림자를 조정해 광고와 커머스에 활용할 제품 이미지를 만듭니다');
  screenshot(s, 64, 210, 700, 400, 'PhotoRoom 소재 제작 화면', '옵션 패널과 결과 카드가 함께 보이는 캡처');
  detailList(s, [
    ['배경 처리', '투명 배경을 기본으로 제품 중심의 결과 이미지를 생성합니다.'],
    ['그림자 조정', '형태, 방향, 퍼짐, 부드러움과 강도를 세부 설정합니다.'],
    ['캔버스 구성', '여백과 종횡비를 조정해 매체 규격에 맞춥니다.'],
    ['후처리 옵션', '제품 보정과 조명 등 필요한 처리 옵션을 선택합니다.'],
  ], 812, 224, 390); footer(s, 6);
}

// 7. Expand
{
  const s = p.slides.add(); s.background.fill = C.bg; title(s, 7, '이미지 확장', '원본 피사체를 유지하면서 목표 비율의 빈 캔버스를 AI로 자연스럽게 채웁니다');
  detailList(s, [
    ['출력 크기 프리셋', '정사각형, 가로형, 와이드, 세로형과 스토리 규격을 제공합니다.'],
    ['사용자 지정 크기', '필요한 너비와 높이를 직접 입력할 수 있습니다.'],
    ['확장 여백', '원본 크기와 AI가 생성할 주변 영역의 비중을 조절합니다.'],
    ['시드 재사용', '동일한 입력과 시드로 유사한 확장 배경을 재현합니다.'],
  ], 68, 224, 440);
  screenshot(s, 560, 210, 650, 400, '이미지 확장 화면', '크기 설정과 확장 결과 카드가 보이는 캡처'); footer(s, 7);
}

// 8. Composition
{
  const s = p.slides.add(); s.background.fill = C.bg; title(s, 8, '이미지 합성', '편집 대상과 참조 이미지를 구분하고 자연어로 원하는 결과를 설명합니다');
  screenshot(s, 64, 210, 700, 400, '이미지 합성 화면', '3개 업로드 슬롯과 합성 결과가 보이는 캡처');
  detailList(s, [
    ['순차 이미지 입력', '1번은 편집 대상, 2번과 3번은 인물이나 재질 참조로 사용합니다.'],
    ['다중 참조', '최대 3장의 JPG, PNG, WebP 이미지를 함께 활용합니다.'],
    ['자연어 합성 지시', '이미지 번호를 포함해 배치, 재질 교체와 합성 조건을 설명합니다.'],
    ['생성 이력 보존', '원본과 프롬프트를 결과 카드에 저장해 반복 시안을 비교합니다.'],
  ], 812, 214, 394); footer(s, 8);
}

// 9. Review and use
{
  const s = p.slides.add(); s.background.fill = C.bg; title(s, 9, '결과 검토와 활용', '이전 시안을 유지하면서 차이를 비교하고 필요한 결과를 바로 활용합니다');
  screenshot(s, 64, 214, 610, 360, '누적 결과 카드', '전후 비교 슬라이더가 보이는 캡처');
  screenshot(s, 704, 214, 506, 360, '원본 비율 자세히 보기', '상세 보기 오버레이 캡처');
  pill(s, '최신 결과 우선', 66, 602, 140); pill(s, '마우스 전후 비교', 220, 602, 164, C.blue); pill(s, '원본 비율 상세 보기', 398, 602, 180, C.cyan); pill(s, '개별 다운로드', 592, 602, 140, C.green);
  text(s, '생성 결과를 덮어쓰지 않아 시안 탐색 과정과 선택 근거를 한 화면에서 유지합니다', 760, 602, 446, 34, 15, C.white, true, 'right'); footer(s, 9);
}

await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });
const requirements = { explicitTotalSlideCount: 9, requiredNativeTableOwnerSlides: [], requiredNativeChartOwnerSlides: [] };
const fontPolicy = { basis: 'design', families: [FONT] };
const stagingDir = path.join(workspaceDir, '.codex-finalizer');
await fs.mkdir(stagingDir, { recursive: true });
const candidatePath = path.join(stagingDir, 'playground-ai-creative-candidate.pptx');
await (await PresentationFile.exportPptx(p)).save(candidatePath);
await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, 'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath: path.join(SKILL_DIR, 'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-bullet-geometry', '--validate-heading-fit'],
  requiredNativeTableOwnerSlides: [],
  fontPolicy,
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, 'Playground_AI_Creative_Challenge.pptx.validation.json'),
});
console.log(FINAL_PPTX);
