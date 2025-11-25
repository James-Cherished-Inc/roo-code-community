# Context Manager Enhancements Summary

## Implemented (Current State)
- **🧠 4th Navbar Tab**: Seamless integration as view switch (App.tsx, Navbar.tsx, types.ts).
- **Interactive Calculator**: Full React conversion of [`resource/task-switching-calculator.html`](resource/task-switching-calculator.html):
  - 5 inputs (system/history tokens, turns, files, planned msgs).
  - Real-time "10x Rule": `breakEvenTurns = (10 × systemPrompt) / historyTokens`.
  - Cost calcs (Claude 3.5: $3/M full, $0.3/M cached).
  - Recos: STAY/⚠️SWITCH/🚨URGENT + risks (turns>15, files>5, history>25k).
  - Tailwind UI matching app style.
- **Tests**: 4 passing unit tests ([`src/test/ContextManager.test.tsx`](src/test/ContextManager.test.tsx)).
- **Docs**: Updated [`docs/next.md`](docs/next.md) #Context Manager section.

## Proposed Future (High Impact/Low Effort)
1. **File Upload Token Calc** (from docs/next.md):
   - Drag-drop → auto-fill `historyTokens` via tokenEstimation util.
   - **Benefit**: Live analysis; **Downside**: Privacy (local only); Alt: MCP token API.

2. **Live Roo Integration** (Perplexity MCP):
   - Fetch real context/turns from Roo API.
   - **Benefit**: Auto-fill; **Downside**: API key mgmt; Alt: Local storage.

3. **Test Suite Polish**:
   - Fix ResizeObserver mocks (setup.ts).
   - Update Navbar.test version to v5.0.0.
   - **Benefit**: Green CI; **Downside**: None.

4. **Dynamic Pricing**:
   - Model selector (Claude/GPT/etc).
   - **Benefit**: Multi-provider; **Downside**: Minor complexity.

**Priority**: 1>3>2>4. Total est: 2h. Aligned w/ docs/next.md "upload files to calculate token number, and cost".

*Generated post-implementation (commit 71baa60).*