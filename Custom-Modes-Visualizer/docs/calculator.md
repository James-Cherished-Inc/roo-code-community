I've created an interactive calculator that helps you decide when to switch Roo Code tasks versus staying in your current one. It analyzes your context size, turn count, and files read to provide cost-based recommendations with specific dollar amounts. The calculator uses the "10x Rule" we discussed and factors in context pollution risks to give you actionable advice for optimizing your API costs.

### Enhanced Cost Calculation with Output Tokens

The calculator now provides comprehensive cost analysis including both **input and output token costs**:

- **Input Costs**: Based on system prompt + history tokens (cached vs. full price)
- **Output Costs**: ~2000 tokens per turn for model responses (consistent across both scenarios)
- **Total Cost Analysis**: Compares full cost scenarios over your planned messages

### Pricing Configuration

The calculator supports customizable pricing for different API providers:
- **Input Full Price**: $3.00 per million tokens (uncached requests)
- **Input Cached Price**: $0.30 per million tokens (cached requests)
- **Output Price**: $15.00 per million tokens (model responses)

### The "10x Rule" for Optimization

To determine the exact break-even point, we can use a mathematical heuristic based on the pricing difference between **Cached** (10% cost) and **Uncached** (100% cost) requests.

Since the Uncached price is **10x higher** than the Cached price, the "System Prompt Penalty" determines your strategy.

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
- **Staying**: (22,000 tokens × $0.30/M) + (20,000 tokens × $15.00/M) = $0.0066 + $0.3000 = **$0.3066 per turn**
- **Switching**: (2,000 tokens × $3.00/M) + (20,000 tokens × $15.00/M) = $0.0060 + $0.3000 = **$0.3060 first turn, then $0.3066**
- **Total for 10 messages**: Stay = $3.066, Switch = $3.066 + $0.006 = $3.072

**Enhanced Verdict:** With output costs included, the difference is minimal. Context quality and task continuity become more important factors.

### 1. When is it SUB-EFFICIENT to create a new task? (Don't Switch)
**Scenario:** You have Heavy Rules but a Short Chat.
*   **System Prompt (Rules):** 5,000 tokens (Detailed guidelines).
*   **History:** 2,000 tokens (Just started).
*   **Calculation:** $(10 \times 5,000) / 2,000 = \textbf{25 Turns}$.
*   **Verdict:** You would need to send **25 messages** in the new task just to "break even" on the cost of reloading those heavy rules at full price.
*   **Enhanced Analysis:** Including output costs ($0.03 per turn), staying for 25 turns costs ~$0.75 while switching costs ~$0.78 + context loss.
*   **Strategy:** **STAY.** It is cheaper to pay the small "rent" on the 2k history than to pay the huge "moving fee" for the 5k rules.

### 2. When is it SUB-EFFICIENT to keep the same task? (Switch Now)
**Scenario:** You have Light Rules but a Long Chat (or many files read).
*   **System Prompt:** 2,000 tokens.
*   **History:** 20,000 tokens (Bloated with read files/chat).
*   **Calculation:** $(10 \times 2,000) / 20,000 = \textbf{1 Turn}$.
*   **Verdict:** If you plan to send even **one more message**, it is already cheaper to switch.
*   **Enhanced Analysis:** Output costs are symmetric ($0.03/turn), so input cost differences dominate the decision.
*   **Strategy:** **SWITCH IMMEDIATELY.** You are paying more "rent" per turn on the history ($0.006) than the one-time cost of starting fresh ($0.006).

***

### Practical "Sweet Spot" Recommendations

While the math gives exact points, "Context Quality" (the AI knowing what you are talking about) is worth money too. Here are the practical limits:

#### The Token Limit: **20k - 30k Tokens**
*   **Why?** At 30k tokens, your "rent" per message is ~$0.01.
*   If you stay for another 30 turns, you waste $0.30.
*   Starting a new task costs ~$0.01 - $0.03.
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

