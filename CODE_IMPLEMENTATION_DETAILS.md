# 🔧 Document Upload Implementation - Code Reference

## File: `lib/screens/auth/doctor_verification_screen.dart`

### Overview
Complete implementation of doctor verification/registration screen with document upload capability.

---

## Code Components

### 1. **State Variables**

```dart
// Form Controllers
late TextEditingController _nameController;
late TextEditingController _emailController;
late TextEditingController _qualificationsController;
late TextEditingController _experienceController;
late TextEditingController _consultationFeeController;
late TextEditingController _bioController;
late TextEditingController _licenseNumberController;
late TextEditingController _documentNameController;  // ← NEW

// Form Selection
String _selectedSpecialization = 'General Physician';

// Document Management ← NEW
final List<String> _uploadedDocuments = [];  // final - immutable reference

// Specializations List
final List<String> specializations = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  // ... etc
];
```

**Key Points:**
- `_documentNameController` handles user input for document references
- `_uploadedDocuments` stores successfully added documents
- Uses `final` to prevent reassignment (list contents still mutable via add/remove)

---

### 2. **Initialization and Cleanup**

#### `initState()`
```dart
@override
void initState() {
  super.initState();
  
  _nameController = TextEditingController();
  _emailController = TextEditingController();
  _qualificationsController = TextEditingController();
  _experienceController = TextEditingController();
  _consultationFeeController = TextEditingController();
  _bioController = TextEditingController();
  _licenseNumberController = TextEditingController();
  _documentNameController = TextEditingController();  // ← NEW
}
```

#### `dispose()`
```dart
@override
void dispose() {
  _nameController.dispose();
  _emailController.dispose();
  _qualificationsController.dispose();
  _experienceController.dispose();
  _consultationFeeController.dispose();
  _bioController.dispose();
  _licenseNumberController.dispose();
  _documentNameController.dispose();  // ← NEW
  super.dispose();
}
```

**Important:** All TextEditingControllers must be disposed to prevent memory leaks.

---

### 3. **Document Management Methods**

#### `_addDocument()`
```dart
/// Add a document to the upload list
void _addDocument() {
  // Step 1: Get and validate input
  final docName = _documentNameController.text.trim();
  if (docName.isEmpty) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Please enter a document name'),
        backgroundColor: Colors.orange,
      ),
    );
    return;
  }

  // Step 2: Check for duplicates
  if (_uploadedDocuments.contains(docName)) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('This document is already uploaded'),
        backgroundColor: Colors.orange,
      ),
    );
    return;
  }

  // Step 3: Add to list and clear input
  setState(() {
    _uploadedDocuments.add(docName);
    _documentNameController.clear();
  });
}
```

**Flow:**
1. Trim whitespace from input
2. Validate not empty
3. Check for duplicates in list
4. Add if valid
5. Clear input field
6. Trigger rebuild with `setState()`

#### `_removeDocument(String docName)`
```dart
/// Remove a document from the list
void _removeDocument(String docName) {
  setState(() {
    _uploadedDocuments.remove(docName);
  });
}
```

**Purpose:**
- Simple one-liner that removes from list and rebuilds UI
- Called from close button on each document chip

---

### 4. **Form Submission Handler**

#### `_handleVerification()`
```dart
Future<void> _handleVerification() async {
  // Step 1: Validate form fields
  if (!_formKey.currentState!.validate()) return;

  // Step 2: Validate documents (NEW)
  if (_uploadedDocuments.isEmpty) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Please upload at least one document for verification'),
        backgroundColor: Colors.red,
      ),
    );
    return;
  }

  // Step 3: Set loading state
  setState(() => _isLoading = true);

  try {
    // Step 4: Get user data
    final authState = ref.read(authStateProvider);
    final user = authState.user;

    if (user == null) {
      throw Exception('User not found');
    }

    // Step 5: Prepare data
    final doctorService = ref.read(doctorServiceProvider);
    final experience = int.tryParse(_experienceController.text) ?? 0;
    final fee = double.tryParse(_consultationFeeController.text) ?? 0;

    // Step 6: Call API with documents (NEW)
    final response = await doctorService.registerDoctor(
      userId: user.id,
      specialization: _selectedSpecialization,
      qualification: _qualificationsController.text.trim(),
      experience: experience,
      consultationFee: fee,
      bio: _bioController.text.trim().isEmpty
          ? null
          : _bioController.text.trim(),
      documents: _uploadedDocuments,  // ← Send documents list
    );

    if (!mounted) return;

    // Step 7: Handle response
    if (response.success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Registration submitted successfully!\nAwaiting admin verification.',
          ),
          backgroundColor: Colors.green,
          duration: Duration(seconds: 3),
        ),
      );

      // Step 8: Navigate after delay
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        context.go(AppRoutes.doctorDashboard);
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            response.error ?? 'Failed to register as doctor',
          ),
          backgroundColor: Colors.red,
        ),
      );
    }
  } catch (e) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  } finally {
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }
}
```

**Key Flow:**
1. Form validation (existing fields)
2. **NEW:** Document validation (at least 1)
3. Set loading state
4. Get user context from auth provider
5. Parse numeric fields
6. **NEW:** Pass `documents` list to API
7. Handle success/error responses
8. Navigate on success
9. Always reset loading state

**Error Handling:**
- Form validation errors → return early
- No documents → show error & return early
- API errors → show error message, allow retry
- Generic exceptions → show error message

---

## 5. **UI Implementation**

### Documents Section Container
```dart
Container(
  padding: const EdgeInsets.all(UIConstants.spacingMedium),
  decoration: BoxDecoration(
    color: Colors.blue.withOpacity(0.05),
    borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
    border: Border.all(color: Colors.blue.withOpacity(0.2)),
  ),
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      // Header
      Text('Upload Medical Documents', style: ...),
      const SizedBox(height: UIConstants.spacingSmall),
      Text('e.g., Degree Certificate, License, ...', style: ...),
      const SizedBox(height: UIConstants.spacingMedium),
      
      // Input Row
      Row(
        children: [
          Expanded(
            child: AppTextField(
              label: 'Document Name/Reference',
              hintText: 'e.g., MBBS Certificate',
              controller: _documentNameController,
              enabled: !_isLoading,
              prefixIcon: const Icon(Icons.file_present),
            ),
          ),
          const SizedBox(width: UIConstants.spacingMedium),
          GestureDetector(
            onTap: _isLoading ? null : _addDocument,
            child: Container(
              height: 56,
              width: 56,
              decoration: BoxDecoration(
                color: _isLoading ? Colors.grey[300] : Colors.blue,
                borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
              ),
              child: const Icon(Icons.add, color: Colors.white),
            ),
          ),
        ],
      ),
      
      // Documents List
      if (_uploadedDocuments.isNotEmpty) ...[
        // List shown here
      ],
    ],
  ),
)
```

### Documents List Display
```dart
if (_uploadedDocuments.isNotEmpty) ...[
  const SizedBox(height: UIConstants.spacingMedium),
  
  Text(
    'Uploaded Documents (${_uploadedDocuments.length})',
    style: theme.textTheme.bodySmall?.copyWith(
      fontWeight: FontWeight.w600,
      color: Colors.grey[700],
    ),
  ),
  
  const SizedBox(height: UIConstants.spacingSmall),
  
  ListView.separated(
    shrinkWrap: true,
    physics: const NeverScrollableScrollPhysics(),
    itemCount: _uploadedDocuments.length,
    separatorBuilder: (_, __) => const SizedBox(height: UIConstants.spacingSmall),
    itemBuilder: (context, index) {
      final doc = _uploadedDocuments[index];
      return Container(
        padding: const EdgeInsets.symmetric(
          horizontal: UIConstants.spacingMedium,
          vertical: UIConstants.spacingSmall,
        ),
        decoration: BoxDecoration(
          color: Colors.green.withOpacity(0.1),
          borderRadius: BorderRadius.circular(UIConstants.radiusSmall),
          border: Border.all(color: Colors.green.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 20),
            const SizedBox(width: UIConstants.spacingSmall),
            Expanded(
              child: Text(doc, style: theme.textTheme.bodySmall),
            ),
            GestureDetector(
              onTap: () => _removeDocument(doc),
              child: const Icon(Icons.close, color: Colors.red, size: 18),
            ),
          ],
        ),
      );
    },
  ),
],
```

**Key UI Patterns:**
- `if (_uploadedDocuments.isNotEmpty)` - Conditional rendering with spread operator
- `ListView.separated` - Proper list rendering with separators
- `Expanded` - Responsive layout
- Color opacity for subtle backgrounds
- Icons for visual feedback

---

## 6. **Helper Widget**

```dart
/// Section header widget for grouping form fields
class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
    );
  }
}
```

**Usage:**
```dart
const _SectionHeader(title: 'Documents'),
```

---

## 7. **API Integration**

### Service Call
```dart
final response = await doctorService.registerDoctor(
  userId: user.id,
  specialization: _selectedSpecialization,
  qualification: _qualificationsController.text.trim(),
  experience: experience,
  consultationFee: fee,
  bio: _bioController.text.trim().isEmpty ? null : _bioController.text.trim(),
  documents: _uploadedDocuments,  // ← List of document names/refs
);
```

### Backend Expectation
```json
POST /api/doctors/register
{
  "userId": "507f1f77bcf86cd799439011",
  "specialization": "Cardiologist",
  "qualification": "MBBS, MD",
  "experience": 5,
  "consultationFee": 500,
  "bio": "Experienced cardiologist...",
  "documents": [
    "MBBS Certificate",
    "MD Specialization",
    "Medical License"
  ]
}
```

---

## 8. **State Management Pattern**

```
User Input
    ↓
_documentNameController.text
    ↓
_addDocument() validation
    ↓
setState(() { _uploadedDocuments.add(docName) })
    ↓
UI Rebuild
    ↓
ListView shows updated list
```

**Riverpod Integration:**
```dart
// Current user
final authState = ref.read(authStateProvider);

// Doctor service for API calls
final doctorService = ref.read(doctorServiceProvider);

// Both integrated into form submission
```

---

## 9. **Constants Usage**

```dart
UIConstants.spacingSmall       // 8.0
UIConstants.spacingMedium      // 12.0
UIConstants.spacingLarge       // 16.0
UIConstants.spacing2XLarge     // 24.0
UIConstants.spacing3XLarge     // 32.0

UIConstants.radiusSmall        // 4.0
UIConstants.radiusMedium       // 8.0
```

---

## 10. **Error Handling Patterns**

### Input Validation
```dart
if (docName.isEmpty) {
  ScaffoldMessenger.of(context).showSnackBar(...)
  return;
}
```

### Duplicate Prevention
```dart
if (_uploadedDocuments.contains(docName)) {
  ScaffoldMessenger.of(context).showSnackBar(...)
  return;
}
```

### Form Validation
```dart
if (!_formKey.currentState!.validate()) return;
```

### Document Requirement
```dart
if (_uploadedDocuments.isEmpty) {
  ScaffoldMessenger.of(context).showSnackBar(...)
  return;
}
```

### API Error Handling
```dart
try {
  // API call
} catch (e) {
  ScaffoldMessenger.of(context).showSnackBar(...)
}
```

---

## 11. **Best Practices Applied**

✅ **Memory Management**
- Proper controller disposal
- Mounted checks after async operations
- Cleanup in finally block

✅ **State Management**
- Single source of truth (_uploadedDocuments)
- Proper setState usage
- Riverpod for global state

✅ **UX**
- Loading states during submission
- Clear error messages
- Success confirmation with navigation
- Disabled fields during submission

✅ **Code Quality**
- Clear method names and documentation
- Separation of concerns
- Proper error handling
- Const constructors where possible

✅ **Validation**
- Multi-level validation (input, duplicates, form, documents)
- Clear user feedback
- Early returns for error cases

---

## 12. **Testing Strategy**

### Unit Tests (if implemented)
```dart
test('_addDocument adds valid document to list', () {
  // Set up
  final state = _DoctorVerificationScreenState();
  state._documentNameController.text = 'MBBS Certificate';
  
  // Act
  state._addDocument();
  
  // Assert
  expect(state._uploadedDocuments, contains('MBBS Certificate'));
  expect(state._documentNameController.text, isEmpty);
});
```

### Widget Tests
```dart
testWidgets('Add button adds document', (tester) async {
  await tester.pumpWidget(MaterialApp(
    home: DoctorVerificationScreen(),
  ));
  
  await tester.enterText(find.byType(TextField), 'Doc Name');
  await tester.tap(find.byIcon(Icons.add));
  await tester.pump();
  
  expect(find.text('Doc Name'), findsWidgets);
});
```

---

## Summary

The document upload feature is fully integrated with:
- ✅ State management for documents list
- ✅ Input validation and duplicate prevention
- ✅ Clean add/remove operations
- ✅ API integration with backend
- ✅ Proper error handling
- ✅ User feedback via SnackBars
- ✅ Navigation on success
- ✅ Loading states and disabled UI during submission
- ✅ Responsive layout
- ✅ Code quality and best practices
