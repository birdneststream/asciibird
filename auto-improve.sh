#!/usr/bin/env bash
set -uo pipefail

# ============================================================================
# ASCIIBIRD — Autonomous Improvement Loop
# ============================================================================
# Fully autonomous planner → builder loop.
# Zero user interaction. Self-iterating with quality gates and code review.
#
# Flow per iteration (GLM only):
#   GLM Plan → GLM Build (reviewed by GLM + Qwen + Hy3)
#   Gitea issues feed back into next planner iteration
#
# Migration phases (strict order):
#   Phase 1: Vite migration (replace vue-cli/webpack) ✅ DONE
#   Phase 2: TypeScript migration (ascii.js → .ts first) ✅ DONE
#   Phase 3: Comprehensive test coverage ✅ DONE
#   Phase 4: Review, audit, refactor, simplify ✅ DONE
#   Phase 5: Vue 3 migration with Headless UI + Tailwind CSS + VueUse ✅ DONE
#   Phase 6: UI Polish — Obsidian Creative System design ✅ DONE
#   Phase 7: Fixes, Refactoring, New Features (CURRENT)
#
# Priority order per iteration:
#   1. Fix ALL open bugs from Gitea issues
#   2. Review/refactor/simplify while preserving original functionality
#   3. Add new features that improve the editor experience
#
# Usage:
#   ./auto-improve.sh                          # infinite loop
#   ./auto-improve.sh 10                       # 10 iterations
#   ./auto-improve.sh 10 "custom prompt here"  # custom prompt
# ============================================================================

SCREEN_NAME="asciibird-auto-improve"
DEV_SERVER_PORT=5180
CHROME_DEBUG_PORT=9230
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEV_SERVER_PID=""
CHROME_PID=""

# Gitea config
GITEA_URL="https://git.georgebush.dev"
GITEA_REPO="hughbord/asciibird"
# Token loaded from .env (not committed to git)
if [ -f ".env" ]; then
    source .env
fi
GITEA_TOKEN="${GITEA_ACCESS_TOKEN:-}"

if [ -z "${STY:-}" ]; then
    if ! command -v screen &>/dev/null; then
        echo "ERROR: 'screen' is not installed. Install it or run without screen support."
        exit 1
    fi

    EXISTING=$(screen -ls "$SCREEN_NAME" 2>/dev/null | grep -oP '\d+\.' || true)
    if [ -n "$EXISTING" ]; then
        echo "Found existing screen session '${SCREEN_NAME}':"
        screen -ls "$SCREEN_NAME"
        echo ""
        echo "Options:"
        echo "  screen -r ${SCREEN_NAME}  — reattach"
        echo "  screen -S ${SCREEN_NAME} -X quit  — kill it"
        exit 1
    fi

    echo "Starting auto-improve in screen session '${SCREEN_NAME}'..."
    screen -dmS "$SCREEN_NAME" -Logfile "auto-improve-screen.log" "$0" "$@"
    sleep 0.5
    exec screen -r "$SCREEN_NAME"
fi

export OPENCODE_ENABLE_EXA=1

# ============================================================================
# Dev server management
# ============================================================================

start_dev_server() {
    local existing
    existing=$(lsof -ti:${DEV_SERVER_PORT} 2>/dev/null || true)
    if [ -n "$existing" ]; then
        log "${YELLOW}[DevServer]${NC} Killing existing process on port ${DEV_SERVER_PORT} (PID: ${existing})"
        kill "$existing" 2>/dev/null || true
        sleep 0.5
    fi

    log "${CYAN}[DevServer]${NC} Starting dev server on port ${DEV_SERVER_PORT}..."

    # Detect which dev server to use based on current tooling
    if grep -q '"dev"' package.json 2>/dev/null; then
        # Vite is set up
        yarn dev --port ${DEV_SERVER_PORT} --host > /dev/null 2>&1 &
    else
        # Still on vue-cli
        yarn serve --port ${DEV_SERVER_PORT} > /dev/null 2>&1 &
    fi
    DEV_SERVER_PID=$!
    sleep 2

    if curl -s -o /dev/null -w '' "http://localhost:${DEV_SERVER_PORT}/" 2>/dev/null; then
        log "${GREEN}[DevServer]${NC} Running on http://localhost:${DEV_SERVER_PORT} (PID: ${DEV_SERVER_PID})"
    else
        log "${RED}[DevServer]${NC} WARNING: Server may not have started correctly"
    fi
}

stop_dev_server() {
    if [ -n "${DEV_SERVER_PID:-}" ]; then
        log "${YELLOW}[DevServer]${NC} Stopping (PID: ${DEV_SERVER_PID})"
        kill "$DEV_SERVER_PID" 2>/dev/null || true
        DEV_SERVER_PID=""
    fi
}

# ============================================================================
# Headless Chrome management (for Chrome DevTools MCP)
# ============================================================================

start_chrome() {
    local existing
    existing=$(lsof -ti:${CHROME_DEBUG_PORT} 2>/dev/null || true)
    if [ -n "$existing" ]; then
        log "${YELLOW}[Chrome]${NC} Killing existing process on port ${CHROME_DEBUG_PORT} (PID: ${existing})"
        kill "$existing" 2>/dev/null || true
        sleep 0.5
    fi

    log "${CYAN}[Chrome]${NC} Starting headless Chromium with remote debugging on port ${CHROME_DEBUG_PORT}..."
    /usr/bin/chromium \
        --headless \
        --no-sandbox \
        --disable-gpu \
        --remote-debugging-port=${CHROME_DEBUG_PORT} \
        --disable-dev-shm-usage \
        --window-size=1280,720 \
        --user-data-dir=/tmp/asciibird-chrome-profile-9230 \
        about:blank \
        > /dev/null 2>&1 &
    CHROME_PID=$!
    sleep 2

    if curl -s -o /dev/null -w '' "http://127.0.0.1:${CHROME_DEBUG_PORT}/json/version" 2>/dev/null; then
        log "${GREEN}[Chrome]${NC} Headless Chromium ready on port ${CHROME_DEBUG_PORT} (PID: ${CHROME_PID})"
    else
        log "${RED}[Chrome]${NC} WARNING: Chrome may not have started — MCP browser tests may fail"
    fi
}

stop_chrome() {
    if [ -n "${CHROME_PID:-}" ]; then
        log "${YELLOW}[Chrome]${NC} Stopping (PID: ${CHROME_PID})"
        kill "$CHROME_PID" 2>/dev/null || true
        CHROME_PID=""
    fi
    rm -rf /tmp/asciibird-chrome-profile-9230 2>/dev/null || true
}

# ============================================================================
# Gitea issue management
# ============================================================================

# Create a Gitea issue. Usage: gitea_create_issue "Title" "Body text"
gitea_create_issue() {
    local title="$1"
    local body="$2"
    local labels="${3:-}"

    local label_arg=""
    if [ -n "$labels" ]; then
        label_arg=", \"labels\": [$(echo "$labels" | tr ',' '\n' | while read -r l; do printf '%s' "$l"; done | sed 's/ /,/g')]"
    fi

    local response
    response=$(curl -s -X POST \
        -H "Authorization: token ${GITEA_TOKEN}" \
        -H "Content-Type: application/json" \
        "${GITEA_URL}/api/v1/repos/${GITEA_REPO}/issues" \
        -d "$(python3 -c "
import json, sys
label_ids = [int(l.strip()) for l in sys.argv[3].split(',')] if sys.argv[3] else []
print(json.dumps({
    'title': sys.argv[1],
    'body': sys.argv[2],
    'labels': label_ids
}))
" "$title" "$body" "$labels")" 2>/dev/null)

    local number
    number=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin).get('number','?'))" 2>/dev/null || echo "?")
    log "${GREEN}[Gitea]${NC} Created issue #${number}: ${title}"
    echo "$number"
}

# List open issues. Returns JSON array.
gitea_list_issues() {
    curl -s -H "Authorization: token ${GITEA_TOKEN}" \
        "${GITEA_URL}/api/v1/repos/${GITEA_REPO}/issues?state=open&limit=50&type=issues" \
        2>/dev/null
}

# Close a Gitea issue by number.
gitea_close_issue() {
    local number="$1"
    curl -s -X PATCH \
        -H "Authorization: token ${GITEA_TOKEN}" \
        -H "Content-Type: application/json" \
        "${GITEA_URL}/api/v1/repos/${GITEA_REPO}/issues/${number}" \
        -d '{"state":"closed"}' > /dev/null 2>&1
    log "${GREEN}[Gitea]${NC} Closed issue #${number}"
}

# Format open issues as text for planner context.
gitea_issues_context() {
    local issues
    issues=$(gitea_list_issues)

    local count
    count=$(echo "$issues" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")

    if [ "$count" = "0" ]; then
        echo "No open issues."
        return
    fi

    echo "=== Open Gitea Issues (${count}) ==="
    echo "$issues" | python3 -c "
import sys, json
for issue in json.load(sys.stdin):
    labels = ', '.join(l['name'] for l in issue.get('labels', []))
    print(f\"#{issue['number']} [{labels}] {issue['title']}\")
    body = issue.get('body','') or ''
    if body:
        print(f'   {body[:200]}...' if len(body) > 200 else f'   {body}')
" 2>/dev/null
}

# ============================================================================
# Git init check
# ============================================================================

ensure_git_repo() {
    if [ ! -d ".git" ]; then
        log "${YELLOW}[Git]${NC} Initializing git repository..."
        git init
        git add -A
        git commit -m "chore: initial project scaffold"
        log "${GREEN}[Git]${NC} Repository initialized"
    fi
}

# ============================================================================
# Configuration
# ============================================================================

ITERATIONS="${1:-0}"
DEFAULT_PROMPT="ASCIIBIRD Phase 7: Fixes, Refactoring, and New Features. Read AGENTS.md FIRST for current status, tech stack, data model, code conventions. ALL previous phases (1-6) are COMPLETE (Vite, TypeScript, Tests, Refactoring, Vue 3 migration, UI Polish). The UI is now solid with the Obsidian Creative System design. Focus on: (1) FIX all open bugs and regressions from Gitea issues — always top priority, every iteration. (2) REVIEW and REFACTOR the codebase — simplify complex functions, improve type safety, remove dead code, consolidate duplicates, improve performance — while PRESERVING all existing functionality. Do NOT change any user-facing behavior during refactoring. (3) If there are ZERO open issues, propose and implement NEW FEATURES that improve the editor. IMPORTANT: This is an IRC ASCII art editor — output gets pasted into IRC channels as static text. No animations. No server-side features (figlet etc. are future API work). Focus on QoL improvements that make creating/editing/exporting IRC art faster and easier. Fonts: JetBrains Mono for all UI, Hack for canvas only — DO NOT change canvas font. The design/ folder has the Obsidian Creative System spec and reference layouts — maintain visual consistency with the existing design. Use tailwind.config.js Obsidian palette for any new UI elements."
USER_PROMPT="${2:-$DEFAULT_PROMPT}"
COUNT=0
LOG_FILE="auto-improve.log"
COOLDOWN=10
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# ============================================================================
# Logging
# ============================================================================

log() {
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} $*" | tee -a "$LOG_FILE"
}

# ============================================================================
# Cleanup
# ============================================================================

cleanup() {
    echo ""
    log "${YELLOW}========================================${NC}"
    log "${YELLOW}Auto-improve stopped after ${COUNT} iteration(s)${NC}"
    log "${YELLOW}========================================${NC}"
    stop_dev_server
    stop_chrome
    if [ -n "${STY:-}" ]; then
        log "${CYAN}Screen session '${SCREEN_NAME}' ending. Detach with Ctrl-A d to keep it running.${NC}"
    fi
    exit 0
}
trap cleanup SIGINT SIGTERM

# ============================================================================
# Context gathering
# ============================================================================

gather_context() {
    local context=""

    local branch
    branch=$(git branch --show-current 2>/dev/null || echo "unknown")
    context+="Current branch: ${branch}
"

    context+="
Recent commits:
"
    context+=$(git log --oneline -5 2>/dev/null || echo "none")
    context+="
"

    # File counts
    local js_count vue_count ts_count test_count
    js_count=$(find src -name "*.js" 2>/dev/null | wc -l)
    vue_count=$(find src -name "*.vue" 2>/dev/null | wc -l)
    ts_count=$(find src -name "*.ts" 2>/dev/null | wc -l)
    test_count=$(find tests -name "*.spec.*" 2>/dev/null | wc -l)
    context+="
=== File Counts ===
src/*.js: ${js_count} files
src/*.vue: ${vue_count} files
src/*.ts: ${ts_count} files
tests/*.spec.*: ${test_count} files
"

    # Build tool detection
    context+="
=== Build Tool ==="
    if [ -f "vite.config.js" ] || [ -f "vite.config.ts" ]; then
        context+="
Vite: YES (migrated)"
    else
        context+="
Vite: NO (still on vue-cli)"
    fi
    if [ -f "tsconfig.json" ]; then
        context+="
TypeScript: YES (configured)"
    else
        context+="
TypeScript: NO"
    fi

    # Phase detection
    context+="
=== Phase Detection ===
"
    if [ ! -f "vite.config.js" ] && [ ! -f "vite.config.ts" ]; then
        context+="Phase: 1 - Vite Migration (vue-cli still in use)"
    elif [ ! -f "tsconfig.json" ]; then
        context+="Phase: 2 - TypeScript Migration (Vite done, no TS yet)"
    elif [ $(find tests -name "*.spec.*" 2>/dev/null | wc -l) -lt 10 ]; then
        context+="Phase: 3 - Test Coverage (TS done, need comprehensive tests)"
    elif [ $(wc -l < src/Dashboard.vue 2>/dev/null || echo "0") -gt 1000 ]; then
        context+="Phase: 4 - Review/Refactor (tests done, need to simplify large components)"
    elif ! grep -q '"vue":.*"3\.' package.json 2>/dev/null; then
        context+="Phase: 5 - Vue 3 Migration (codebase clean, ready for Vue 3)"
    elif ! grep -q '"surface"' tailwind.config.js 2>/dev/null; then
        context+="Phase: 6 - UI Polish (Vue 3 done, need Obsidian Creative System design)"
    else
        context+="Phase: 7 - Fixes, Refactoring, New Features (UI polish done)"
    fi

    # Only 5 most recent PROGRESS.md files, first 10 lines each
    if [ -d ".llm" ]; then
        context+="
=== Latest .llm/ Status (5 most recent) ===
"
        local progress_files
        progress_files=$(find .llm -maxdepth 2 -name "PROGRESS.md" -printf "%T@ %p\n" 2>/dev/null | sort -rn | head -5 | cut -d' ' -f2-)
        for f in $progress_files; do
            if [ -f "$f" ]; then
                context+="
--- $f ---
$(head -10 "$f")
"
            fi
        done
    fi

    local changes
    changes=$(git status --porcelain 2>/dev/null | head -10)
    if [ -n "$changes" ]; then
        context+="
=== Uncommitted Changes ===
${changes}
"
    fi

    echo -e "$context"
}

# ============================================================================
# Main loop
# ============================================================================

log "${CYAN}========================================${NC}"
log "${CYAN}  ASCIIBIRD Auto-Improve Loop${NC}"
log "${CYAN}  Iterations: $( [ "$ITERATIONS" -gt 0 ] && echo "$ITERATIONS" || echo "infinite" )${NC}"
log "${CYAN}  Flow: GLM Plan → GLM Build (reviewed by GLM + Qwen + Hy3)${NC}"
log "${CYAN}  Phases: 1-Vite → 2-TS → 3-Tests → 4-Refactor → 5-Vue3 → 6-UI Polish → 7-Fixes/Features${NC}"
log "${CYAN}  Focus: Bugs → Gitea issues → Refactor → New features${NC}"
log "${CYAN}  Issues: ${GITEA_URL}/${GITEA_REPO}/issues${NC}"
log "${CYAN}  Prompt: ${USER_PROMPT}${NC}"
log "${CYAN}========================================${NC}"

ensure_git_repo
start_dev_server
start_chrome

while true; do
    COUNT=$((COUNT + 1))

    PLAN_AGENT="glm-plan"
    BUILD_AGENT="glm-build"
    AGENT_MODEL="zai-coding-plan/glm-5.1"
    AGENT_LABEL="GLM"

    log "${GREEN}============================================${NC}"
    log "${GREEN}  Iteration ${COUNT} — ${AGENT_LABEL}${NC}"
    log "${GREEN}  Plan: ${PLAN_AGENT} | Build: ${BUILD_AGENT} | Review: GLM + Qwen + Hy3${NC}"
    log "${GREEN}============================================${NC}"

    # Health checks
    if ! kill -0 "${DEV_SERVER_PID:-}" 2>/dev/null; then
        log "${YELLOW}[DevServer]${NC} Server died, restarting..."
        start_dev_server
    fi
    if ! kill -0 "${CHROME_PID:-}" 2>/dev/null; then
        log "${YELLOW}[Chrome]${NC} Chrome died, restarting..."
        start_chrome
    fi

    CONTEXT=$(gather_context)
    TOTAL_DISPLAY=$( [ "$ITERATIONS" -gt 0 ] && echo " out of ${ITERATIONS}" || echo " (infinite loop)" )

    # ========================================================================
    # Step 1: PLAN
    # ========================================================================

    # Check for open issues to include in planning
    ISSUES_CONTEXT=$(gitea_issues_context)

    read -r -d '' PLAN_PROMPT <<PLAN_EOF
[Iteration ${COUNT}${TOTAL_DISPLAY}] [${AGENT_LABEL}]

IMPORTANT: Read AGENTS.md in the project root FIRST. It contains the full project guide — tech stack, directory structure, data model, code conventions, known issues, and MCP tool docs. You MUST follow its conventions.

Current project state:
${CONTEXT}

---
Project: ASCIIBIRD — browser-based IRC ASCII art editor for creating/editing mIRC art.
Tech: Vue 3.5, Pinia 3, Vite 8, Tailwind CSS 3, TypeScript, Vitest, Headless UI, VueUse
Dev server: http://localhost:${DEV_SERVER_PORT}
Chrome debug: http://127.0.0.1:${CHROME_DEBUG_PORT} (headless Chromium for MCP testing)

User request: ${USER_PROMPT}

${ISSUES_CONTEXT}

Based on the current state, create a plan. STRICT priority order:
1. Fix ALL open bugs from Gitea issues above (always first, every iteration)
2. Review/refactor/simplify codebase while PRESERVING all existing functionality
3. ONLY when there are ZERO open issues — propose NEW FEATURES that improve the editor
4. NEVER add new features while there are open bugs outstanding
5. NEVER change user-facing behavior during refactoring
6. Every change MUST be verified in the browser via Chrome DevTools MCP

Good feature candidates for an IRC ASCII art editor (QoL only, all client-side):
- Selection tools: select regions, move/copy/paste/rotate/flip selections
- Brush improvements: custom brush shapes, brush rotate/flip, eraser size
- Canvas navigation: zoom in/out, pan with middle-click, minimap
- Export improvements: ANSI export, plain text export, HTML export, line-wrapped mIRC
- Import improvements: better mIRC paste handling, ANSI import, plain text import
- Editor tools: line drawing, rectangle drawing, circle/ellipse drawing
- Grid helpers: coordinate display, ruler, character count, IRC line length indicator
- Layer improvements: merge layers, duplicate layer, layer opacity
- Undo/redo: visual history browser, branch/fork undo states
- Templates: starter art templates, border templates, logo templates
- Find and replace: search for characters, colors, or patterns across canvas
- Color tools: shade picker (lighter/darker), complementary color suggester
- Alignment: center text, left/right justify within selection
- Canvas resize: preserve content when resizing, crop to content
- Keyboard shortcuts: customizable hotkeys, vim-like modal editing
- Accessibility: screen reader support, high-contrast mode, keyboard-only editing

BAD feature candidates (do NOT propose):
- Animations or motion effects (IRC art is static)
- Server-side features (figlet, cloud storage, collaboration) — future API work
- External API integrations (no API keys, no network requests)
- Real-time anything (no websockets, no live sharing)
- Mobile-first redesign (desktop editor, mobile is future work)

Check .llm/ for existing plans/progress. Key files:
  - src/ascii.ts — Core engine (colors, parsing, export, canvas rendering)
  - src/store/index.ts — Main Pinia store (tabs, layers, undo/redo)
  - src/Dashboard.vue — Main orchestrator (menus, tabs, modals)
  - src/views/Editor.vue — Canvas editor (mouse/keyboard events)
  - src/components/ — All UI components
  - src/composables/ — Shared composables
  - src/utils/ — Shared utilities
  - tailwind.config.js — Obsidian Creative System palette

The design/ folder has the Obsidian Creative System spec and reference layouts — maintain visual consistency.

IMPORTANT: This is iteration ${COUNT}${TOTAL_DISPLAY}. When creating a git branch, use format 'fix/SHORT-DESC' for bugs, 'refactor/SHORT-DESC' for refactoring, or 'feat/SHORT-DESC' for features.

This is fully autonomous — zero user interaction. The builder will auto-commit and auto-merge to asciibird-v2.
PLAN_EOF

    log "${YELLOW}[Plan/${AGENT_LABEL}]${NC} Running ${PLAN_AGENT}..."
    if opencode run \
        --agent "${PLAN_AGENT}" \
        --model "${AGENT_MODEL}" \
        --dangerously-skip-permissions \
        --title "asciibird-plan-iter-${COUNT}" \
        "$PLAN_PROMPT"; then
        log "${GREEN}[Plan/${AGENT_LABEL}]${NC} Iteration ${COUNT} planning complete"
    else
        log "${RED}[Plan/${AGENT_LABEL}]${NC} Iteration ${COUNT} planning FAILED (exit $?)"
    fi

    # ========================================================================
    # Step 2: BUILD
    # ========================================================================

    BUILD_PROMPT="Implement the approved plan from the previous planning agent. This is iteration ${COUNT}${TOTAL_DISPLAY}.

IMPORTANT: Read AGENTS.md in the project root FIRST. It contains the full project guide — tech stack, data model, code conventions, known issues. You MUST follow its conventions.

IMPORTANT: Before implementing, create a new git branch using the plan's specified branch name (fix/DESC, refactor/DESC, or feat/DESC).

Quality gates for this project:
- yarn lint (ESLint — fix any errors in files you modified)
- yarn test (Vitest — all tests must pass)
- yarn build (production build must succeed)
- npx tsc --noEmit (TypeScript type checking)

Phase 7 specific rules:
- Bug fixes: include regression tests, verify root cause is addressed
- Refactoring: NEVER change user-facing behavior — preserve all functionality
- New features: verify they don't break existing functionality
- Maintain visual consistency with Obsidian Creative System design (tailwind.config.js palette)
- No console errors or Vue warnings in browser

Chrome debug at http://127.0.0.1:${CHROME_DEBUG_PORT} — use chrome-devtools MCP to verify UI renders correctly after EVERY runtime code change.

After ALL tasks are done and committed on the feature branch:
1. Switch to asciibird-v2: git checkout asciibird-v2
2. Merge feature branch: git merge <actual-branch-name>
3. Push: git push origin asciibird-v2
4. Delete the feature branch: git branch -d <actual-branch-name>

IMPORTANT — Close fixed Gitea issues:
After merging and pushing, close any Gitea issues that were fixed in this iteration. For each issue addressed:
- Verify the fix works in the browser (no console errors, correct behavior)
- Close the issue via gitea_issue_write with method 'update' and state 'closed'
- Add a comment noting the fix commit hash

Use the gitea MCP tools:
- gitea_issue_write(method='update', owner='hughbord', repo='asciibird', index=ISSUE_NUMBER, state='closed')
- gitea_issue_write(method='add_comment', owner='hughbord', repo='asciibird', index=ISSUE_NUMBER, body='Fixed in commit HASH. Verified in browser.')

Code review: You will be reviewed by 3 reviewers (GLM + Qwen + Hy3). Address all critical issues before proceeding.

This is fully autonomous — no user interaction needed. Follow the per-task cycle from your agent instructions exactly. You MUST merge to asciibird-v2 and push before finishing."

    log "${YELLOW}[Build/${AGENT_LABEL}]${NC} Running ${BUILD_AGENT}..."
    if opencode run \
        --agent "${BUILD_AGENT}" \
        --model "${AGENT_MODEL}" \
        --continue \
        --dangerously-skip-permissions \
        "$BUILD_PROMPT"; then
        log "${GREEN}[Build/${AGENT_LABEL}]${NC} Iteration ${COUNT} build complete"
    else
        log "${RED}[Build/${AGENT_LABEL}]${NC} Iteration ${COUNT} build FAILED (exit $?)"
    fi

    # Safety net: ensure builder merged back to asciibird-v2 and pushed
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "asciibird-v2")
    if [ "$CURRENT_BRANCH" != "asciibird-v2" ]; then
        log "${YELLOW}[Git]${NC} Builder left us on '${CURRENT_BRANCH}', merging to asciibird-v2..."
        git checkout asciibird-v2 2>/dev/null
        git merge "$CURRENT_BRANCH" 2>/dev/null
        git branch -d "$CURRENT_BRANCH" 2>/dev/null || true
    fi
    # Always push asciibird-v2
    git push origin asciibird-v2 2>/dev/null && \
        log "${GREEN}[Git]${NC} Pushed asciibird-v2 to origin" || \
        log "${YELLOW}[Git]${NC} Push failed or nothing to push"

    # ========================================================================
    # Step 3: Visual QA (every 5th iteration — verify the app still works)
    # ========================================================================

    if [ $((COUNT % 5)) -eq 0 ]; then
        log "${MAGENTA}[VisualQA]${NC} Running visual QA check..."

        read -r -d '' QA_PROMPT <<QA_EOF
[Visual QA — Iteration __COUNT__]

You are in VISUAL QA mode. Your job is to verify the ASCIIBIRD editor still works after recent changes. You are NOT writing code — only testing and reporting bugs.

App URL: http://localhost:__PORT__
Chrome debug: http://127.0.0.1:__CHROME_PORT__

Read AGENTS.md first to understand the app. Then verify:

═════════════════════════════════════════
BASIC LOAD
═════════════════════════════════════════
- App loads without JS console errors
- Canvas/editor renders visible grid
- Toolbar panel is visible and draggable
- Color palette renders (99 mIRC colors)

═════════════════════════════════════════
CORE FUNCTIONALITY
═════════════════════════════════════════
- New ASCII dialog opens and creates a new tab
- Character picker shows character grid
- Color picker shows foreground/background colors
- Brush preview updates when colors/chars change

═════════════════════════════════════════
IMPORT/EXPORT
═════════════════════════════════════════
- Paste mIRC art dialog opens
- mIRC paste renders correctly on canvas
- Export to mIRC format works
- Export to PNG works (if testable)

═════════════════════════════════════════
BROWSER CONSOLE
═════════════════════════════════════════
- Check for JS errors at startup
- Check for errors during each action
- Check for Vue warnings (deprecation notices, prop validation)
- Check for failed module loads

═════════════════════════════════════════
BUILD VERIFICATION
═════════════════════════════════════════
- Run: yarn build — must succeed
- Check dist/ for output files
- Verify no build warnings (or note them)

For EACH bug found, file a Gitea issue:
  curl -s -X POST -H "Authorization: token __GITEA_TOKEN__" -H "Content-Type: application/json" \
    "__GITEA_URL__/api/v1/repos/__GITEA_REPO__/issues" \
    -d '{"title": "[BUG] short description", "body": "steps to reproduce + expected vs actual + severity", "labels": []}'

Create labels as needed via the Gitea API if they don't exist.

Rules:
- Do NOT write code or fix bugs. Only TEST and REPORT.
- Do NOT create files. Only test and file issues.
- Take screenshots of every bug you find.
- Test EVERYTHING listed above — do not skip sections.
QA_EOF

        # Substitute variables in the heredoc
        QA_PROMPT="${QA_PROMPT//__COUNT__/${COUNT}}"
        QA_PROMPT="${QA_PROMPT//__PORT__/${DEV_SERVER_PORT}}"
        QA_PROMPT="${QA_PROMPT//__CHROME_PORT__/${CHROME_DEBUG_PORT}}"
        QA_PROMPT="${QA_PROMPT//__GITEA_TOKEN__/${GITEA_TOKEN}}"
        QA_PROMPT="${QA_PROMPT//__GITEA_URL__/${GITEA_URL}}"
        QA_PROMPT="${QA_PROMPT//__GITEA_REPO__/${GITEA_REPO}}"

        if opencode run \
            --agent glm-build \
            --model "zai-coding-plan/glm-5.1" \
            --dangerously-skip-permissions \
            --title "asciibird-qa-iter-${COUNT}" \
            "$QA_PROMPT"; then
            log "${GREEN}[VisualQA]${NC} Iteration ${COUNT} QA complete"
        else
            log "${RED}[VisualQA]${NC} Iteration ${COUNT} QA FAILED (exit $?)"
        fi
    else
        log "${YELLOW}[VisualQA]${NC} Skipping this iteration (every 5th)"
    fi

    # ========================================================================
    # Iteration limit check
    # ========================================================================

    if [ "$ITERATIONS" -gt 0 ] && [ "$COUNT" -ge "$ITERATIONS" ]; then
        log "${GREEN}Reached ${ITERATIONS} iterations. Done.${NC}"
        break
    fi

    log "Cooling down for ${COOLDOWN}s..."
    sleep "$COOLDOWN"
done

stop_dev_server
stop_chrome

log "${GREEN}========================================${NC}"
log "${GREEN}  ASCIIBIRD Auto-Improve Complete: ${COUNT} iteration(s)${NC}"
log "${GREEN}========================================${NC}"
