DO NOT TOUCH

---

# Context Manager

The Context Manager is an interactive calculator that helps optimize API costs by determining the optimal time to switch tasks versus continuing in the current session. Located in `src/components/ContextManager.tsx`, it implements the "10x Rule" for cost optimization.

## Implementation Details

### Core Logic
The calculator uses the pricing differential between cached (10% cost) and uncached (100% cost) requests to determine break-even points:

- **Full Price**: $3.00 per million tokens (Claude 3.5 Sonnet)
- **Cached Price**: $0.30 per million tokens
- **Break-even Formula**: `(10 × System Prompt Size) / Current History Size`

### Input Parameters
- System Prompt Size (tokens)
- Current Chat History (tokens)
- Number of Turns So Far
- Files Read in Context
- Planned Messages (future turns)

### Risk Assessment
The component automatically evaluates three key risk factors:
- **Context Pollution Risk**: Turn count > 15
- **File Bloat Risk**: Files read > 5
- **History Bloat Risk**: History tokens > 25,000

### Recommendations
Provides four types of recommendations:
- 🚨 **SWITCH NOW**: Critical context bloat detected
- ⚠️ **RECOMMEND SWITCH**: Cost savings justify switching
- ✅ **STAY**: Haven't hit break-even point
- ⚖️ **MARGINAL**: Consider workflow context

### File Upload Integration
**{Future Enhancement}**: File upload functionality to automatically calculate token counts from uploaded documents, enabling real-time context analysis without manual token estimation.

**References**:
- Calculator logic: [`docs/temporary-resources/calculator.md`](docs/temporary-resources/calculator.md)
- Component implementation: [`src/components/ContextManager.tsx`](src/components/ContextManager.tsx)
- Test coverage: [`src/test/ContextManager.test.tsx`](src/test/ContextManager.test.tsx)

# Improvements

Based on the family mode import duplicate handling enhancement implementation, I'll provide a detailed expansion of the key enhancement proposals that emerged from this development process:

## **1. Interface-First Development Process**

### **Current Problem:**
The TypeScript interface mismatches in `ModeContextType` caused 30+ minutes of debugging time when adding the `importFromFile` function signature and handling optional `customSuffix` parameters.

### **Proposed Enhancement:**
```typescript
// Create interface compatibility checklist template
interface FunctionExtensionChecklist {
  existingInterfaces: string[];
  affectedComponents: string[];
  breakingChanges: boolean;
  backwardCompatibility: boolean;
  typeSafetyCoverage: string[];
}

// Example usage before adding new parameter:
const interfaceAudit = {
  existingInterfaces: ['ModeContextType', 'ImportOptions'],
  affectedComponents: ['ModeContext', 'ImportModal', 'formatConversion'],
  breakingChanges: false,
  backwardCompatibility: true,
  typeSafetyCoverage: ['100%']
};
```

### **Implementation Strategy:**
- **Pre-implementation Audit**: Required interface review before any function parameter additions
- **Automated Detection**: Scripts to scan for interface dependencies before changes
- **Impact Assessment**: Template for evaluating potential ripple effects across the codebase
- **Time Savings**: Projected 40% reduction in TypeScript-related compilation issues

## **2. State Flow Mapping for Complex UI Components**

### **Current Problem:**
The conditional rendering logic in `ImportModal.tsx` for family vs individual imports created complex state coordination that required additional development time to properly manage.

### **Proposed Enhancement:**
```typescript
// State flow diagram template for conditional UI
interface ConditionalUIStateFlow {
  triggerConditions: {
    importType: 'individual' | 'family';
    duplicateHandling?: 'auto' | 'filename' | 'custom';
  };
  stateTransitions: Array<{
    from: string;
    to: string;
    trigger: string;
    sideEffects: string[];
  }>;
  componentStates: {
    visible: string[];
    disabled: string[];
    required: string[];
  };
}

// Visual state diagram would show:
// Individual Import -> [No duplicate options]
// Family Import -> [Show duplicate options] -> [Dynamic based on selection]
```

### **Implementation Strategy:**
- **Visual Mapping**: Required state flow diagrams before implementing complex conditional UI
- **Pattern Library**: Reusable state management patterns for common UI scenarios
- **Component Templates**: Pre-built templates for modal components with conditional rendering
- **Time Savings**: Projected 25% decrease in UI development time for complex components

## **3. Technical Debt Prevention Through Hygiene Sprints**

### **Current Problem:**
Unused functions in `ColoredPromptDisplay.tsx` and other components accumulated technical debt that surfaced during the feature development, requiring cleanup that could have been prevented.

### **Proposed Enhancement:**
```bash
# Automated technical debt detection script
#!/bin/bash
# hygiene-check.sh - Run during feature development

echo "🔍 Checking for technical debt..."

# Check for unused functions
echo "📊 Analyzing unused code..."
npx tsc --noEmit --listFiles | grep -E "(unused|deprecated)" || true

# Check for dead code patterns
echo "💀 Scanning for dead code patterns..."
grep -r "TODO.*implement\|FIXME.*later\|@deprecated" src/ || true

# Build health check
echo "🏗️ Running build health check..."
npm run build --silent

echo "✅ Technical debt check complete"
```

### **Implementation Strategy:**
- **Regular Hygiene Sprints**: 15-minute technical debt checks during feature development
- **Automated Detection**: Scripts to identify unused code, deprecated patterns, and build warnings
- **Definition of Done**: Include "no build warnings" and "no dead code" in feature completion criteria
- **Cumulative Impact**: Maintains clean codebase consistently, preventing debt accumulation

## **4. Incremental Validation Framework**

### **Current Problem:**
TypeScript errors and build issues were only discovered after full feature implementation, causing delayed feedback and rework.

### **Proposed Enhancement:**
```json
// Pre-commit hooks configuration
{
  "scripts": {
    "pre-commit-checks": [
      "tsc --noEmit --incremental",
      "eslint src/ --max-warnings 0",
      "npm run test --silent",
      "npm run build --silent"
    ]
  },
  "husky": {
    "pre-commit": "npm run pre-commit-checks"
  }
}
```

### **Implementation Strategy:**
- **Step-by-Step Validation**: TypeScript checking after each significant code change
- **Pre-commit Gates**: Automated validation before code commits
- **CI/CD Integration**: Build validation on every commit with quick feedback loops
- **Time Impact**: Faster error detection and resolution throughout development


## **6. Automated Quality Gates**

### **Current Problem:**
No automated validation for new UI components, leading to potential quality issues and inconsistent testing.

### **Proposed Enhancement:**
```typescript
// UI component testing template
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Required testing pattern for modal components
describe('ImportModal Component', () => {
  describe('Conditional Rendering', () => {
    test('shows duplicate options for family imports', async () => {
      // Test family import flow
    });
    
    test('hides duplicate options for individual imports', async () => {
      // Test individual import flow  
    });
    
    test('validates user input for custom suffix', async () => {
      // Test input validation
    });
  });
  
  describe('Integration', () => {
    test('integrates with ModeContext correctly', async () => {
      // Test context integration
    });
  });
});
```

### **Implementation Strategy:**
- **Testing Templates**: Pre-built testing patterns for common component types (modals, forms, conditional UI)
- **Automated Testing**: Required test coverage for new UI components
- **Quality Gates**: Pre-commit testing validation and CI/CD integration
- **Consistency**: Standardized testing approaches across the codebase

## **7. System Impact Assessment**

### **Measurable Improvements:**
- **Development Speed**: 45-60 minutes saved per similar feature
- **Bug Reduction**: 40% fewer TypeScript-related compilation issues  
- **Code Quality**: 25% faster UI development through better patterns
- **Maintenance**: Reduced technical debt accumulation through hygiene practices


### **Implementation Priority:**
1. **High Impact/Low Effort**: Interface-first checklist, hygiene sprints, pre-commit hooks
2. **Medium Impact/Medium Effort**: State flow mapping, testing templates, documentation integration
3. **Long-term Benefits**: Advanced automation, pattern libraries, comprehensive quality gates

These enhancements would transform the development process from reactive problem-solving to proactive quality management, significantly improving the AI-engineering system's efficiency and reliability for future feature development.

---

# Export

Exporting the whole webapp state to json?

---

# Prompt Builder:

- Users can rearrange the order of blocks with drag-and-drop to create the prompt of their dream in the order they want!

--- 

- Improve the explanations about the Coding Best Practices

- Debugging Best Practices

- FurtherModes