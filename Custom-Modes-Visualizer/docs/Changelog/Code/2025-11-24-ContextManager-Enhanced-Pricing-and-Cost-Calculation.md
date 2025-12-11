# 24-11-2025 13:57 - ContextManager Enhanced Pricing and Cost Calculation

## Short Summary
Enhanced ContextManager component with comprehensive cost analysis including input/output token pricing, realistic default values, and improved recommendation logic for API task switching optimization.

## Technical Implementation

### Why (ADR format)
- User requested more realistic default values reflecting actual usage patterns
- Need for comprehensive cost analysis including both input and output token costs
- Enhanced recommendation logic with better cost-benefit analysis
- Updated test assertions to handle emoji-containing text with function matchers
- Improved user experience with customizable pricing for different API providers

### Git Branch
- master branch

## Modified Files and Components

### Core Logic Changes
- **`src/components/ContextManager.tsx`**: Updated default values:
  - `turnCount`: 10 (was previous default)
  - `filesRead`: 3 (was previous default) 
  - `currentHistoryTokens`: 10,000 (was previous default)
- **`src/components/ContextManager.tsx`**: Added editable pricing fields:
  - `inputFullPrice`: $3.00 per million tokens
  - `inputCachedPrice`: $0.30 per million tokens
  - `outputPrice`: $15.00 per million tokens

### Cost Calculation Enhancement
- **`src/components/ContextManager.tsx`**: Enhanced cost calculation logic:
  - Added `OUTPUT_TOKENS_PER_TURN = 2000` constant
  - Integrated output costs (~$0.03 per turn) into all calculations
  - Updated `calculateRecommendation` to include output costs in both stay/switch scenarios
  - Modified `costIfStay` and `costIfSwitch` calculations for comprehensive analysis

### Recommendation Logic Updates
- **`src/components/ContextManager.tsx`**: Updated recommendation thresholds:
  - Critical bloat: turn count > 20 OR files > 8 OR history > 25,000 triggers urgent switch
  - Cost savings threshold: staying costs > 150% of switching triggers recommend switch
  - Enhanced risk assessment with context pollution, file bloat, and history bloat detection

### User Interface Enhancement
- **`src/components/ContextManager.tsx`**: Added pricing configuration section:
  - Three editable input fields for API provider pricing
  - Real-time cost breakdown display
  - Enhanced cost calculation output with per-turn and total costs

### Test Improvements
- **`src/test/ContextManager.test.tsx`**: Fixed test assertions:
  - Updated to use function matchers for emoji-containing text
  - Added test coverage for new pricing configuration
  - Enhanced edge case testing with various input combinations
  - All tests now passing with improved assertion robustness

## Functions and Attributes Modified

### Primary Functions
- `calculateRecommendation(): ContextRecommendation`
  - Enhanced with output cost integration
  - Updated break-even calculation
  - Improved recommendation thresholds

### State Variables
- `inputs` (ContextInputs interface):
  - Added `inputFullPrice`, `inputCachedPrice`, `outputPrice` fields
  - Updated default values for realistic usage patterns

### Constants Added
- `OUTPUT_TOKENS_PER_TURN = 2000`
- Enhanced pricing structure with three-tier pricing model

## Implementation Approach
- **Realistic Defaults**: Default values now reflect typical usage patterns
- **Comprehensive Cost Analysis**: Include both input and output token costs for accurate recommendations
- **User Customization**: Allow adjustment of pricing for different API providers
- **Backward Compatibility**: Existing functionality preserved while enhancing analysis

## Issues Encountered and Resolution

### Cost Calculation Complexity
- **Problem**: Initial calculations ignored output token costs, leading to incomplete analysis
- **Solution**: Integrated symmetric output costs (~2000 tokens per turn) into all cost calculations
- **Prevention**: Comprehensive cost analysis including all token types in future features

### Test Assertion Failures
- **Problem**: Emoji-containing text causing test failures with direct string matching
- **Solution**: Updated to use function matchers (`content.includes()`) for robust text testing
- **Prevention**: Use flexible text matching patterns for UI components with dynamic content

### Recommendation Logic Precision
- **Problem**: Initial recommendation thresholds too simplistic for real-world scenarios
- **Solution**: Implemented multi-factor analysis with 150% cost savings threshold for switch recommendations
- **Prevention**: Multi-criteria evaluation framework for recommendation systems

## Impact Assessment
- **User Experience**: More realistic and actionable cost optimization recommendations
- **Accuracy**: Comprehensive cost analysis including all token types and pricing factors
- **Flexibility**: Customizable pricing for different API providers and usage patterns
- **Test Reliability**: Robust test coverage with improved assertion methods

## Cross-Dependencies
- No breaking changes to existing components
- ContextManager integration with other components remains unchanged
- All existing functionality preserved while adding new features

## Further Improvements
- LocalStorage persistence for user pricing preferences
- Additional risk factors based on usage patterns
- Historical cost tracking and optimization suggestions
- Integration with actual API usage monitoring for real-time recommendations