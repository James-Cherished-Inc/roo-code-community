I've created an interactive calculator that helps you decide when to switch Roo Code tasks versus staying in your current one. It analyzes your context size, turn count, and files read to provide cost-based recommendations with specific dollar amounts. The calculator uses the "10x Rule" we discussed and factors in context pollution risks to give you actionable advice for optimizing your API costs.

### Enhanced Cost Calculation with Output Tokens

The calculator now provides comprehensive cost analysis including both **input and output token costs**:

- **Input Costs**: Based on system prompt + history tokens (cached vs. full price)
- **Output Costs**: ~2000 tokens per turn for model responses (consistent across both scenarios)
- **Total Cost Analysis**: Compares full cost scenarios over your planned messages

### Pricing Configuration

The calculator supports customizable pricing for different API providers:
- **Input Price**: $3.00 per million tokens (with 10x rule for switching built-in)
- **Output Price**: $15.00 per million tokens (model responses)

### File Upload Integration
**Purpose:** Enables automatic token estimation from uploaded files to accurately assess file read costs without manual entry. *Last updated: 25-11-2025 14:22*

**Features:**
- Drag & drop UI or click-to-browse in dashed border zone [`src/components/ContextManager.tsx:399`](src/components/ContextManager.tsx:399)
- Supported formats: `.txt/.md/.ts/.tsx/.js/.jsx/.json/.css/.html` (text-based) [`src/components/ContextManager.tsx:197`](src/components/ContextManager.tsx:197)
- 10MB per-file limit, skips oversized/invalid [`src/components/ContextManager.tsx:198`](src/components/ContextManager.tsx:198)
- Token estimation: `estimateTokens(text)` (~4 chars/token) via FileReader + Promise.all [`src/components/ContextManager.tsx:212`](src/components/ContextManager.tsx:212) [`src/utils/tokenEstimation.ts`](src/utils/tokenEstimation.ts)
- Preview list w/ color badges: green (<1k tokens), yellow (<5k), red (>5k) + size/remove [`src/components/ContextManager.tsx:406`](src/components/ContextManager.tsx:406)
- **Add to History** merges `totalFileTokens` to `currentHistoryTokens`, clears list, triggers recalc [`src/components/ContextManager.tsx:238`](src/components/ContextManager.tsx:238)

**Benefits:** Precise auto-counting from actual docs/code files; eliminates manual estimation errors.

### The "10x Rule" for Optimization

To determine the exact break-even point, we use a mathematical heuristic based on the built-in pricing differential between **staying** (cached cost) and **switching** (full price × 10) requests.

Since switching costs **10x more** than staying for the first turn, the "System Prompt Penalty" determines your strategy.

#### The Golden Formula:
You should switch when the **"Dead Weight" (History)** you are carrying is significantly larger than your **"Fixed overhead" (System Prompt)**.

$$ \text{Switch Threshold (Turns)} \approx \frac{10 \times \text{System Prompt Size}}{\text{Current History Size}} $$

***

### Enhanced Cost Analysis Example

**Scenario:** Comparing total costs over 10 planned messages
- **System Prompt:** 2,000 tokens
- **History:** 20,000 tokens
- **Output Tokens:** 2,000 per turn × 10 turns = 20,000 tokens

**Cost Calculation:**
- **Staying**: (22,000 tokens × $3.00/M) + (20,000 tokens × $15.00/M) = $0.0660 + $0.3000 = **$0.3660 per turn**
- **Switching**: (2,000 tokens × $3.00/M × 10) + (20,000 tokens × $15.00/M) = $0.0600 + $0.3000 = **$0.3600 first turn, then $0.3660**
- **Total for 10 messages**: Stay = $3.660, Switch = $0.3600 + ($0.3660 × 9) = $3.654

**Enhanced Verdict:** With output costs included, the difference is minimal. Context quality and task continuity become more important factors.

### 1. When is it SUB-EFFICIENT to create a new task? (Don't Switch)
**Scenario:** You have Heavy Rules but a Short Chat.
*   **System Prompt (Rules):** 5,000 tokens (Detailed guidelines).
*   **History:** 2,000 tokens (Just started).
*   **Calculation:** $(10 \times 5,000) / 2,000 = \textbf{25 Turns}$.
*   **Verdict:** You would need to send **25 messages** in the new task just to "break even" on the cost of reloading those heavy rules at full price.
*   **Enhanced Analysis:** With simplified pricing (input $3.00/M, output $15.00/M, 10x rule), staying for 25 turns costs ~$9.15 while switching costs ~$9.75 + context loss.
*   **Strategy:** **STAY.** It is cheaper to pay the small "rent" on the 2k history than to pay the huge "moving fee" for the 5k rules.

### 2. When is it SUB-EFFICIENT to keep the same task? (Switch Now)
**Scenario:** You have Light Rules but a Long Chat (or many files read).
*   **System Prompt:** 2,000 tokens.
*   **History:** 20,000 tokens (Bloated with read files/chat).
*   **Calculation:** $(10 \times 2,000) / 20,000 = \textbf{1 Turn}$.
*   **Verdict:** If you plan to send even **one more message**, it is already cheaper to switch.
*   **Enhanced Analysis:** With simplified pricing (input $3.00/M, output $15.00/M, 10x rule), input cost differences dominate the decision.
*   **Strategy:** **SWITCH IMMEDIATELY.** You are paying more "rent" per turn on the history than the one-time cost of starting fresh with 10x penalty.

***

### Practical "Sweet Spot" Recommendations

While the math gives exact points, "Context Quality" (the AI knowing what you are talking about) is worth money too. Here are the practical limits:

#### The Token Limit: **20k - 30k Tokens**
*   **Why?** At 30k tokens, your "rent" per message becomes significant with the simplified pricing model.
*   If you stay for another 30 turns, you accumulate substantial input costs.
*   Starting a new task incurs the 10x switching penalty but eliminates ongoing history costs.
*   **Rule:** Once you hit **30k context**, finish your current thought and reset.

#### The Turn Limit: **10 - 15 Turns**
*   **Why?** Most coding tasks follow a "Plan \u2192 Do \u2192 Check" cycle.
*   By turn 15, you have likely accumulated "garbage" (failed attempts, error logs, file reads) that are no longer relevant.
*   **Rule:** If you haven't solved the problem in 15 turns, your context is likely "polluted" with confusion. A fresh start often makes the AI smarter because it stops looking at its own past mistakes.

### Summary Checklist

| Indicator | **STAY in Task** | **SWITCH Task** |
| :--- | :--- | :--- |
| **Token Count** | < 10,000 tokens | > 25,000 tokens |
| **Turn Count** | < 10 turns | > 15 turns |
| **Context State** | "I just read 1 file." | "I read 10 files and 3 error logs." |
| **Task Phase** | Debugging a specific error. | Finished feature A, starting feature B. |
| **Rule of Thumb** | "Just one more fix..." | "Okay, that works. What's next?" |

