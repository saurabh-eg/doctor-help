class LabAddress {
  final String line1;
  final String city;
  final String state;
  final String pincode;

  LabAddress({
    required this.line1,
    required this.city,
    required this.state,
    required this.pincode,
  });

  factory LabAddress.fromJson(Map<String, dynamic> json) {
    return LabAddress(
      line1: (json['line1'] ?? '').toString(),
      city: (json['city'] ?? '').toString(),
      state: (json['state'] ?? '').toString(),
      pincode: (json['pincode'] ?? '').toString(),
    );
  }
}

class LabVerificationDocument {
  final String documentType;
  final String documentUrl;
  final String? originalFileName;
  final DateTime? uploadedAt;

  LabVerificationDocument({
    required this.documentType,
    required this.documentUrl,
    this.originalFileName,
    this.uploadedAt,
  });

  factory LabVerificationDocument.fromJson(Map<String, dynamic> json) {
    return LabVerificationDocument(
      documentType: (json['documentType'] ?? '').toString(),
      documentUrl: (json['documentUrl'] ?? '').toString(),
      originalFileName: (json['originalFileName'] ?? '').toString().isEmpty
          ? null
          : (json['originalFileName'] ?? '').toString(),
      uploadedAt: DateTime.tryParse((json['uploadedAt'] ?? '').toString()),
    );
  }
}

class LabSummary {
  final String id;
  final String name;
  final String? contactName;
  final String phone;
  final String email;
  final LabAddress address;
  final double rating;
  final int ratingCount;
  final bool isNablCertified;
  final double? distanceKm;
  final List<LabVerificationDocument> verificationDocuments;

  LabSummary({
    required this.id,
    required this.name,
    this.contactName,
    required this.phone,
    required this.email,
    required this.address,
    required this.rating,
    required this.ratingCount,
    required this.isNablCertified,
    this.distanceKm,
    this.verificationDocuments = const [],
  });

  factory LabSummary.fromJson(Map<String, dynamic> json) {
    return LabSummary(
      id: (json['_id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      contactName: (json['contactName'] ?? '').toString().isEmpty
          ? null
          : (json['contactName'] ?? '').toString(),
      phone: (json['phone'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      address: LabAddress.fromJson(
        (json['address'] as Map<String, dynamic>?) ?? <String, dynamic>{},
      ),
      rating: (json['rating'] as num?)?.toDouble() ?? 0,
      ratingCount: (json['ratingCount'] as num?)?.toInt() ?? 0,
      isNablCertified: json['isNablCertified'] == true,
      distanceKm: (json['distanceKm'] as num?)?.toDouble(),
      verificationDocuments:
          ((json['verificationDocuments'] as List?) ?? const <dynamic>[])
              .whereType<Map<String, dynamic>>()
              .map(LabVerificationDocument.fromJson)
              .toList(),
    );
  }
}

class LabTest {
  final String id;
  final String code;
  final String name;
  final String category;
  final double price;
  final double? discountedPrice;
  final List<String> preparationInstructions;
  final int? fastingHours;
  final String? sampleType;
  final int? turnaroundHours;
  final bool isActive;

  LabTest({
    required this.id,
    required this.code,
    required this.name,
    required this.category,
    required this.price,
    required this.discountedPrice,
    required this.preparationInstructions,
    required this.fastingHours,
    required this.sampleType,
    required this.turnaroundHours,
    required this.isActive,
  });

  double get effectivePrice => discountedPrice ?? price;

  factory LabTest.fromJson(Map<String, dynamic> json) {
    return LabTest(
      id: (json['_id'] ?? '').toString(),
      code: (json['code'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      category: (json['category'] ?? '').toString(),
      price: (json['price'] as num?)?.toDouble() ?? 0,
      discountedPrice: (json['discountedPrice'] as num?)?.toDouble(),
      preparationInstructions:
          ((json['preparationInstructions'] as List?) ?? const <dynamic>[])
              .map((e) => e.toString())
              .toList(),
      fastingHours: (json['fastingHours'] as num?)?.toInt(),
      sampleType: (json['sampleType'] ?? '').toString().isEmpty
          ? null
          : (json['sampleType'] ?? '').toString(),
      turnaroundHours: (json['turnaroundHours'] as num?)?.toInt(),
      isActive: json['isActive'] != false,
    );
  }
}

class LabPackageItem {
  final String testId;
  final String nameSnapshot;

  LabPackageItem({
    required this.testId,
    required this.nameSnapshot,
  });

  factory LabPackageItem.fromJson(Map<String, dynamic> json) {
    return LabPackageItem(
      testId: (json['testId'] ?? '').toString(),
      nameSnapshot: (json['nameSnapshot'] ?? '').toString(),
    );
  }
}

class LabPackage {
  final String id;
  final String code;
  final String name;
  final String description;
  final List<LabPackageItem> items;
  final double price;
  final double? discountedPrice;
  final List<String> preparationInstructions;
  final bool isActive;

  LabPackage({
    required this.id,
    required this.code,
    required this.name,
    required this.description,
    required this.items,
    required this.price,
    required this.discountedPrice,
    required this.preparationInstructions,
    required this.isActive,
  });

  double get effectivePrice => discountedPrice ?? price;

  factory LabPackage.fromJson(Map<String, dynamic> json) {
    return LabPackage(
      id: (json['_id'] ?? '').toString(),
      code: (json['code'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      description: (json['description'] ?? '').toString(),
      items: ((json['items'] as List?) ?? const <dynamic>[])
          .whereType<Map<String, dynamic>>()
          .map(LabPackageItem.fromJson)
          .toList(),
      price: (json['price'] as num?)?.toDouble() ?? 0,
      discountedPrice: (json['discountedPrice'] as num?)?.toDouble(),
      preparationInstructions:
          ((json['preparationInstructions'] as List?) ?? const <dynamic>[])
              .map((e) => e.toString())
              .toList(),
      isActive: json['isActive'] != false,
    );
  }
}

class LabCatalog {
  final LabSummary lab;
  final List<LabTest> tests;
  final List<LabPackage> packages;

  LabCatalog({
    required this.lab,
    required this.tests,
    required this.packages,
  });

  factory LabCatalog.fromJson(Map<String, dynamic> json) {
    final testsJson = (json['tests'] as List?) ?? const <dynamic>[];
    final packagesJson = (json['packages'] as List?) ?? const <dynamic>[];

    return LabCatalog(
      lab: LabSummary.fromJson(
          (json['lab'] as Map<String, dynamic>?) ?? <String, dynamic>{}),
      tests: testsJson
          .map((e) => LabTest.fromJson(e as Map<String, dynamic>))
          .toList(),
      packages: packagesJson
          .map((e) => LabPackage.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class TestComparison {
  final String labId;
  final String labName;
  final String city;
  final String state;
  final double rating;
  final String testId;
  final String testName;
  final double price;
  final double? distanceKm;

  TestComparison({
    required this.labId,
    required this.labName,
    required this.city,
    required this.state,
    required this.rating,
    required this.testId,
    required this.testName,
    required this.price,
    required this.distanceKm,
  });

  factory TestComparison.fromJson(Map<String, dynamic> json) {
    return TestComparison(
      labId: (json['labId'] ?? '').toString(),
      labName: (json['labName'] ?? '').toString(),
      city: (json['city'] ?? '').toString(),
      state: (json['state'] ?? '').toString(),
      rating: (json['rating'] as num?)?.toDouble() ?? 0,
      testId: (json['testId'] ?? '').toString(),
      testName: (json['testName'] ?? '').toString(),
      price: (json['price'] as num?)?.toDouble() ?? 0,
      distanceKm: (json['distanceKm'] as num?)?.toDouble(),
    );
  }
}

class LabOrder {
  final String id;
  final String status;
  final double amount;
  final String slotTime;
  final DateTime? slotDate;
  final List<String> preparationInstructions;
  final String? prescriptionUrl;
  final String? reportUrl;
  final DateTime? reportUploadedAt;
  final DateTime? sampleCollectedAt;
  final LabOrderAdminOverride? adminOverride;
  final LabOrderCollector? collector;
  final bool homeCollection;
  final String? address;
  final LabSummary? lab;
  final List<LabOrderItem> items;
  final LabOrderPatientProfile? patientProfile;
  final DateTime? createdAt;

  LabOrder({
    required this.id,
    required this.status,
    required this.amount,
    required this.slotTime,
    required this.slotDate,
    required this.preparationInstructions,
    this.prescriptionUrl,
    this.reportUrl,
    this.reportUploadedAt,
    this.sampleCollectedAt,
    this.adminOverride,
    this.collector,
    required this.homeCollection,
    this.address,
    required this.lab,
    required this.items,
    required this.patientProfile,
    required this.createdAt,
  });

  factory LabOrder.fromJson(Map<String, dynamic> json) {
    final labJson = json['labId'];
    final itemsJson = (json['items'] as List?) ?? const <dynamic>[];
    final patientJson = json['patientProfile'];

    return LabOrder(
      id: (json['_id'] ?? '').toString(),
      status: (json['status'] ?? '').toString(),
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      slotTime: (json['slotTime'] ?? '').toString(),
      slotDate: DateTime.tryParse((json['slotDate'] ?? '').toString()),
      preparationInstructions:
          ((json['preparationInstructions'] as List?) ?? const <dynamic>[])
              .map((e) => e.toString())
              .toList(),
      prescriptionUrl: (json['prescriptionUrl'] ?? '').toString().isEmpty
          ? null
          : (json['prescriptionUrl'] ?? '').toString(),
      reportUrl: (json['reportUrl'] ?? '').toString().isEmpty
          ? null
          : (json['reportUrl'] ?? '').toString(),
      reportUploadedAt:
          DateTime.tryParse((json['reportUploadedAt'] ?? '').toString()),
      sampleCollectedAt:
          DateTime.tryParse((json['sampleCollectedAt'] ?? '').toString()),
      adminOverride: json['adminOverride'] is Map<String, dynamic>
          ? LabOrderAdminOverride.fromJson(
              json['adminOverride'] as Map<String, dynamic>)
          : null,
      collector: json['collector'] is Map<String, dynamic>
          ? LabOrderCollector.fromJson(
              json['collector'] as Map<String, dynamic>)
          : null,
      homeCollection: json['homeCollection'] == true,
      address: (json['address'] ?? '').toString().isEmpty
          ? null
          : (json['address'] ?? '').toString(),
      lab:
          labJson is Map<String, dynamic> ? LabSummary.fromJson(labJson) : null,
      items: itemsJson
          .map((e) => LabOrderItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      patientProfile: patientJson is Map<String, dynamic>
          ? LabOrderPatientProfile.fromJson(patientJson)
          : null,
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()),
    );
  }
}

class LabOrderAdminOverride {
  final bool isEscalated;
  final String? escalationReason;
  final String? escalatedByRole;
  final DateTime? escalatedAt;

  LabOrderAdminOverride({
    required this.isEscalated,
    this.escalationReason,
    this.escalatedByRole,
    this.escalatedAt,
  });

  factory LabOrderAdminOverride.fromJson(Map<String, dynamic> json) {
    return LabOrderAdminOverride(
      isEscalated: json['isEscalated'] == true,
      escalationReason: (json['escalationReason'] ?? '').toString().isEmpty
          ? null
          : (json['escalationReason'] ?? '').toString(),
      escalatedByRole: (json['escalatedByRole'] ?? '').toString().isEmpty
          ? null
          : (json['escalatedByRole'] ?? '').toString(),
      escalatedAt: DateTime.tryParse((json['escalatedAt'] ?? '').toString()),
    );
  }
}

class LabOrderCollector {
  final String name;
  final String phone;
  final DateTime? eta;
  final DateTime? assignedAt;

  LabOrderCollector({
    required this.name,
    required this.phone,
    this.eta,
    this.assignedAt,
  });

  factory LabOrderCollector.fromJson(Map<String, dynamic> json) {
    return LabOrderCollector(
      name: (json['name'] ?? '').toString(),
      phone: (json['phone'] ?? '').toString(),
      eta: DateTime.tryParse((json['eta'] ?? '').toString()),
      assignedAt: DateTime.tryParse((json['assignedAt'] ?? '').toString()),
    );
  }
}

class LabProviderStats {
  final int totalOrders;
  final int pendingOrders;
  final int inProgressOrders;
  final int reportsReady;
  final int completedOrders;
  final double totalRevenue;

  LabProviderStats({
    required this.totalOrders,
    required this.pendingOrders,
    required this.inProgressOrders,
    required this.reportsReady,
    required this.completedOrders,
    required this.totalRevenue,
  });

  factory LabProviderStats.fromJson(Map<String, dynamic> json) {
    return LabProviderStats(
      totalOrders: (json['totalOrders'] as num?)?.toInt() ?? 0,
      pendingOrders: (json['pendingOrders'] as num?)?.toInt() ?? 0,
      inProgressOrders: (json['inProgressOrders'] as num?)?.toInt() ?? 0,
      reportsReady: (json['reportsReady'] as num?)?.toInt() ?? 0,
      completedOrders: (json['completedOrders'] as num?)?.toInt() ?? 0,
      totalRevenue: (json['totalRevenue'] as num?)?.toDouble() ?? 0,
    );
  }
}

class LabProviderDashboard {
  final LabSummary? lab;
  final LabProviderStats stats;
  final List<LabOrder> recentOrders;

  LabProviderDashboard({
    required this.lab,
    required this.stats,
    required this.recentOrders,
  });

  factory LabProviderDashboard.fromJson(Map<String, dynamic> json) {
    final recentOrdersJson =
        (json['recentOrders'] as List?) ?? const <dynamic>[];
    return LabProviderDashboard(
      lab: json['lab'] is Map<String, dynamic>
          ? LabSummary.fromJson(json['lab'] as Map<String, dynamic>)
          : null,
      stats: LabProviderStats.fromJson(
        (json['stats'] as Map<String, dynamic>?) ?? <String, dynamic>{},
      ),
      recentOrders: recentOrdersJson
          .map((e) => LabOrder.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class LabOrderItem {
  final String itemType;
  final String itemId;
  final String name;
  final double price;

  LabOrderItem({
    required this.itemType,
    required this.itemId,
    required this.name,
    required this.price,
  });

  factory LabOrderItem.fromJson(Map<String, dynamic> json) {
    return LabOrderItem(
      itemType: (json['itemType'] ?? '').toString(),
      itemId: (json['itemId'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      price: (json['price'] as num?)?.toDouble() ?? 0,
    );
  }
}

class LabOrderPatientProfile {
  final String name;
  final int age;
  final String gender;
  final String? relationship;

  LabOrderPatientProfile({
    required this.name,
    required this.age,
    required this.gender,
    this.relationship,
  });

  factory LabOrderPatientProfile.fromJson(Map<String, dynamic> json) {
    return LabOrderPatientProfile(
      name: (json['name'] ?? '').toString(),
      age: (json['age'] as num?)?.toInt() ?? 0,
      gender: (json['gender'] ?? '').toString(),
      relationship: (json['relationship'] ?? '').toString().isEmpty
          ? null
          : (json['relationship'] ?? '').toString(),
    );
  }
}
