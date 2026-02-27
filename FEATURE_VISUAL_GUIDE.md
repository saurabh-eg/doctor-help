# 📋 Doctor Verification Screen - Feature Visual Guide

## Screen Layout

```
┌─────────────────────────────────────┐
│    Doctor Verification              │  ← AppBar
├─────────────────────────────────────┤
│                                     │
│  Complete Your Profile              │  ← Header
│  Provide your professional details  │
│  for verification                   │
│                                     │
├─────────────────────────────────────┤
│  PERSONAL INFORMATION               │  ← Section
├─────────────────────────────────────┤
│ [Full Name            ]             │
│ [Email                ]             │
├─────────────────────────────────────┤
│  PROFESSIONAL INFORMATION           │
├─────────────────────────────────────┤
│ [▼ Specialization     ]             │
│ [Qualifications       ]             │
│ [Years of Experience  ]             │
│ [Medical License      ]             │
├─────────────────────────────────────┤
│  PRACTICE INFORMATION               │
├─────────────────────────────────────┤
│ [Consultation Fee     ]             │
│ [Bio                  ]             │
│ [                     ]             │
│ [                     ]             │
├─────────────────────────────────────┤
│  DOCUMENTS  ← NEW SECTION           │
├─────────────────────────────────────┤
│  ┌──────────────────────────────┐   │
│  │  Upload Medical Documents    │   │
│  │  e.g., Degree Certificate,   │   │
│  │  License, Registration, etc. │   │
│  │                              │   │
│  │ [Doc Name/Reference  ] [+]   │   │
│  │                              │   │
│  │ Uploaded Documents (2):      │   │
│  │ ✓ MBBS Certificate     [×]   │   │
│  │ ✓ Medical License      [×]   │   │
│  └──────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  [Submit for Verification]          │  ← Button
│                                     │
│  Your profile will be reviewed by   │
│  our admin team. You'll receive     │
│  confirmation once verified.        │  ← Info
│                                     │
└─────────────────────────────────────┘
```

## User Interaction Flow

### 1. **Adding a Document**
```
Doctor fills form fields...
    ↓
Enters document name: "MBBS Certificate"
    ↓
Clicks [+] button
    ↓
✓ Document added to list
  Input field cleared
  Ready for next document
```

### 2. **Multiple Documents**
```
Doctor can add multiple documents:
  ✓ MBBS Certificate
  ✓ Medical License
  ✓ Specialization Certificate
  ✓ Registration Certificate
  
Each can be removed by clicking [×]
```

### 3. **Form Submission**
```
Doctor fills all form fields
    ↓
Adds at least 1 document
    ↓
Clicks [Submit for Verification]
    ↓
Form validation runs
    ↓
API request sent to backend
    ↓
Success: Navigate to Dashboard
OR
Error: Show error message & allow retry
```

## Key UI Elements

### 📄 Documents Section Container
```
┌────────────────────────────────┐
│ 📚 Upload Medical Documents    │
│                                │
│ e.g., Degree Certificate,      │
│ License, Registration,         │
│ Specialization Certificate     │
│                                │
│ [Document Name] [+]            │  ← Add Row
│                                │
│ Uploaded Documents (2):        │
│ ✓ Doc 1             [×]        │  ← Docs List
│ ✓ Doc 2             [×]        │
└────────────────────────────────┘

Colors:
- Background: Blue (0.05 opacity)
- Border: Blue (0.2 opacity)
- Text: Dark with hint in grey
```

### ✅ Document Chip
```
┌─────────────────────────────┐
│ ✓ MBBS Certificate    [×]   │
└─────────────────────────────┘

Colors:
- Background: Green (0.1 opacity)
- Border: Green (0.3 opacity)
- Icon: Green checkmark
- Close button: Red X
```

### 🔘 Add Button
```
┌─────┐
│  ➕  │  Normal state (Blue)
└─────┘

┌─────┐
│  ➕  │  Disabled state (Grey)
└─────┘
```

## Data Flow

### State Management
```
_uploadedDocuments: List<String>
    │
    ├─ _addDocument()
    │   └─ Validates & adds to list
    │
    ├─ _removeDocument()
    │   └─ Removes from list
    │
    └─ _handleVerification()
        └─ Sends to backend via doctorService.registerDoctor()
```

### Form Validation Chain
```
User clicks Submit
    ↓
_formKey.currentState!.validate()
    ├─ Name: required, non-empty
    ├─ Email: required, valid format
    ├─ Specialization: required
    ├─ Qualifications: required
    ├─ Experience: required, valid number
    ├─ License: required
    ├─ Fee: required, valid decimal
    │
    └─ _uploadedDocuments.isEmpty
        └─ Show error: "Please upload at least one document"

All valid?
    ↓
Send to API → Response handling → Navigation
```

## Error Handling

### Document Name Validation
```
Empty input → ❌ "Please enter a document name"
Duplicate   → ❌ "This document is already uploaded"
Valid       → ✅ Document added
```

### Form Submission Validation
```
No documents    → ❌ "Please upload at least one document"
Missing field   → ❌ "Field is required"
Invalid format  → ❌ "Please enter a valid {type}"
API error       → ❌ "Error: {error message}"
Success         → ✅ "Registration submitted successfully!"
```

## Success Flow

```
Form submitted with all documents
    ↓
API Request: POST /api/doctors/register
    ↓
Backend Response: 200 OK
    ↓
Show Success Message:
"Registration submitted successfully!
 Awaiting admin verification."
    ↓
Wait 2 seconds
    ↓
Navigate to Doctor Dashboard
    ↓
Doctor sees "Pending Verification" badge
```

## Constants Used

```dart
// Spacing
spacingSmall          // Button padding
spacingMedium         // Field spacing
spacingLarge          // Section padding
spacing2XLarge        // Between sections
spacing3XLarge        // Before submit button

// Border Radius
radiusSmall           // Document chips
radiusMedium          // Input fields, container
```

## Accessibility Features

- ✅ Clear error messages
- ✅ Visible validation feedback
- ✅ Disabled state for buttons during loading
- ✅ High contrast colors
- ✅ Proper icon labels via context
- ✅ Touch-friendly button sizes (56x56 minimum)

## Testing Scenarios

### Happy Path
1. Fill all form fields
2. Add 1-3 documents
3. Click Submit
4. See success message
5. Navigate to dashboard ✅

### Error Cases
1. Submit without documents → Error message ✅
2. Add empty document → Error message ✅
3. Add duplicate → Error message ✅
4. API failure → Error message with retry ✅
5. Missing form field → Form validation error ✅

### Edge Cases
1. Add same document name twice → Prevented ✅
2. Remove all documents → Can re-add ✅
3. Network timeout during submit → Error handling ✅
4. Very long document name → Text truncation handled ✅
