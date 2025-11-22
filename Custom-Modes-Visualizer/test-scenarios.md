# Lego-Style Prompt Display Test Scenarios

## Test Environment Setup
- Application running at: http://localhost:5173
- Development mode with hot reload enabled
- Using Prompt Builder interface for testing

## Test Scenarios

### 1. Empty State Testing
- [ ] Navigate to Prompt Builder page
- [ ] Verify no base mode selected shows empty block display
- [ ] Check responsive behavior with empty content

### 2. Base Mode Only Testing  
- [ ] Select a single base mode (e.g., "Test Assistant")
- [ ] Verify single base block displays correctly
- [ ] Check block styling and content rendering
- [ ] Test "Show Raw" toggle functionality

### 3. Single Feature Testing
- [ ] Enable one feature (e.g., "Empathy & Friendly Tone Guidelines")
- [ ] Verify feature block appears alongside base block
- [ ] Check feature ordering and visual hierarchy
- [ ] Validate color consistency

### 4. Multiple Features Testing
- [ ] Enable 3-4 different features across categories
- [ ] Test drag-and-drop reordering of features
- [ ] Verify order matches display in blocks
- [ ] Check all features render with correct styling

### 5. Custom Instructions Testing
- [ ] Add custom instructions text
- [ ] Verify custom instructions display in separate block
- [ ] Test with and without features enabled
- [ ] Check text formatting and spacing

### 6. Full Combination Testing
- [ ] Test complete workflow: base mode + multiple features + custom instructions
- [ ] Verify all block types display correctly
- [ ] Check total count indicator updates properly
- [ ] Test all functionality together

### 7. Responsive Design Testing
- [ ] Test on mobile viewport (375px width)
- [ ] Test on tablet viewport (768px width)  
- [ ] Test on desktop viewport (1024px+ width)
- [ ] Verify blocks stack properly on smaller screens

### 8. Backward Compatibility Testing
- [ ] Test copy to clipboard functionality
- [ ] Test raw text toggle still works
- [ ] Verify feature legend displays correctly
- [ ] Check all interactive elements function

### 9. Edge Cases Testing
- [ ] Very long custom instructions text
- [ ] Maximum number of features enabled
- [ ] Special characters in text content
- [ ] Unicode and emoji handling

### 10. Color System Integration
- [ ] Verify block colors match feature colors
- [ ] Check color consistency across all block types
- [ ] Test hover states and transitions
- [ ] Validate color accessibility

## Expected Behaviors
✅ Blocks render as discrete Lego-style components
✅ Features display in drag-drop order
✅ Color system integrates seamlessly
✅ Responsive design works across screen sizes
✅ All existing functionality preserved
✅ Raw text toggle functions correctly
✅ Copy functionality works for both views

## Issues to Document
- Any rendering problems
- Responsive design issues
- Color inconsistencies
- Functionality regressions
- Performance concerns