import '../config/api_config.dart';
import '../models/lab.dart';
import 'api_service.dart';

class LabService {
  final ApiService _apiService;

  LabService(this._apiService);

  Future<List<LabSummary>> listLabs({
    String? search,
    String? city,
    String? state,
    double? lat,
    double? lng,
    int page = 1,
    int limit = 20,
  }) async {
    final query = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
      if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
      if (city != null && city.trim().isNotEmpty) 'city': city.trim(),
      if (state != null && state.trim().isNotEmpty) 'state': state.trim(),
      if (lat != null) 'lat': lat.toString(),
      if (lng != null) 'lng': lng.toString(),
    };

    final queryString = query.entries
        .map((e) => '${e.key}=${Uri.encodeQueryComponent(e.value)}')
        .join('&');

    final response = await _apiService.get<List<LabSummary>>(
      '${ApiEndpoints.listLabs}?$queryString',
      fromJson: (json) {
        final data = (json['data'] as List?) ?? const <dynamic>[];
        return data
            .map((e) => LabSummary.fromJson(e as Map<String, dynamic>))
            .toList();
      },
    );

    return response.data ?? <LabSummary>[];
  }

  Future<List<TestComparison>> compareTestsByName(
    String testName, {
    double? lat,
    double? lng,
  }) async {
    final params = <String, String>{
      if (lat != null) 'lat': lat.toString(),
      if (lng != null) 'lng': lng.toString(),
    };

    final query = params.isEmpty
        ? ''
        : '?${params.entries.map((e) => '${e.key}=${Uri.encodeQueryComponent(e.value)}').join('&')}';

    final response = await _apiService.get<List<TestComparison>>(
      '${ApiEndpoints.compareLabTests.replaceAll(':testName', Uri.encodeComponent(testName))}$query',
      fromJson: (json) {
        final data = (json['data'] as List?) ?? const <dynamic>[];
        return data
            .map((e) => TestComparison.fromJson(e as Map<String, dynamic>))
            .toList();
      },
    );

    return response.data ?? <TestComparison>[];
  }

  Future<LabCatalog?> getLabCatalog(String labId) async {
    final endpoint = ApiEndpoints.getLabCatalog.replaceAll(':id', labId);
    final response = await _apiService.get<LabCatalog>(
      endpoint,
      fromJson: (json) => LabCatalog.fromJson(json),
    );
    return response.data;
  }

  Future<String?> uploadPrescription(String filePath) async {
    final response = await _apiService.uploadFile<String>(
      ApiEndpoints.uploadLabPrescription,
      filePath: filePath,
      fieldName: 'prescription',
      fromJson: (json) => (json['url'] ?? '').toString(),
    );

    if (!response.success || response.data == null || response.data!.isEmpty) {
      return null;
    }

    return response.data;
  }

  Future<LabOrder?> createLabOrder({
    required String labId,
    required List<String> testIds,
    required List<String> packageIds,
    required String patientName,
    required int patientAge,
    required String patientGender,
    String? relationship,
    String? prescriptionUrl,
    required DateTime slotDate,
    required String slotTime,
    required bool homeCollection,
    required String address,
  }) async {
    final response = await _apiService.post<LabOrder>(
      ApiEndpoints.createLabOrder,
      body: {
        'labId': labId,
        'testIds': testIds,
        'packageIds': packageIds,
        'patientProfile': {
          'name': patientName,
          'age': patientAge,
          'gender': patientGender,
          if (relationship != null && relationship.trim().isNotEmpty)
            'relationship': relationship.trim(),
        },
        if (prescriptionUrl != null && prescriptionUrl.trim().isNotEmpty)
          'prescriptionUrl': prescriptionUrl.trim(),
        'slotDate':
            '${slotDate.year}-${slotDate.month.toString().padLeft(2, '0')}-${slotDate.day.toString().padLeft(2, '0')}',
        'slotTime': slotTime,
        'homeCollection': homeCollection,
        'address': address,
      },
      fromJson: (json) => LabOrder.fromJson(json),
    );

    return response.data;
  }

  Future<List<LabOrder>> getMyLabOrders() async {
    final response = await _apiService.get<List<LabOrder>>(
      ApiEndpoints.getMyLabOrders,
      fromJson: (json) {
        final data = (json['data'] as List?) ?? const <dynamic>[];
        return data
            .map((e) => LabOrder.fromJson(e as Map<String, dynamic>))
            .toList();
      },
    );

    return response.data ?? <LabOrder>[];
  }

  Future<LabOrder?> getLabOrderById(String orderId) async {
    final endpoint = ApiEndpoints.getLabOrderById.replaceAll(':id', orderId);
    final response = await _apiService.get<LabOrder>(
      endpoint,
      fromJson: (json) => LabOrder.fromJson(json),
    );
    return response.data;
  }

  Future<LabOrder?> cancelLabOrder(String orderId) async {
    final endpoint = ApiEndpoints.cancelLabOrder.replaceAll(':id', orderId);
    final response = await _apiService.post<LabOrder>(
      endpoint,
      fromJson: (json) => LabOrder.fromJson(json),
    );
    return response.data;
  }

  Future<LabSummary?> getLabProviderProfile() async {
    final response = await _apiService.get<LabSummary>(
      ApiEndpoints.getLabProviderProfile,
      fromJson: (json) => LabSummary.fromJson(json),
    );
    return response.data;
  }

  Future<LabSummary?> updateLabProviderProfile({
    String? contactName,
    String? labName,
    String? phone,
    String? email,
    required String addressLine1,
    required String city,
    required String state,
    required String pincode,
  }) async {
    final response = await _apiService.patch<LabSummary>(
      ApiEndpoints.updateLabProviderProfile,
      body: {
        if (contactName != null && contactName.trim().isNotEmpty)
          'contactName': contactName.trim(),
        if (labName != null && labName.trim().isNotEmpty)
          'labName': labName.trim(),
        if (phone != null && phone.trim().isNotEmpty) 'phone': phone.trim(),
        if (email != null) 'email': email.trim(),
        'address': {
          'line1': addressLine1,
          'city': city,
          'state': state,
          'pincode': pincode,
        },
      },
      fromJson: (json) => LabSummary.fromJson(json),
    );
    return response.data;
  }

  Future<LabProviderDashboard?> getLabProviderDashboard() async {
    final response = await _apiService.get<LabProviderDashboard>(
      ApiEndpoints.getLabProviderDashboard,
      fromJson: (json) => LabProviderDashboard.fromJson(json),
    );
    return response.data;
  }

  Future<LabCatalog?> getLabProviderCatalog({
    bool includeInactive = true,
  }) async {
    final endpoint =
        '${ApiEndpoints.getLabProviderCatalog}?includeInactive=$includeInactive';
    final response = await _apiService.get<LabCatalog>(
      endpoint,
      fromJson: (json) => LabCatalog.fromJson(json),
    );
    return response.data;
  }

  Future<LabTest?> createLabProviderTest({
    required String code,
    required String name,
    String? category,
    required double price,
    double? discountedPrice,
    List<String> preparationInstructions = const <String>[],
    int? fastingHours,
    String? sampleType,
    int? turnaroundHours,
    bool isActive = true,
  }) async {
    final response = await _apiService.post<LabTest>(
      ApiEndpoints.createLabProviderTest,
      body: {
        'code': code.trim(),
        'name': name.trim(),
        if (category != null && category.trim().isNotEmpty)
          'category': category.trim(),
        'price': price,
        if (discountedPrice != null) 'discountedPrice': discountedPrice,
        'preparationInstructions': preparationInstructions,
        if (fastingHours != null) 'fastingHours': fastingHours,
        if (sampleType != null && sampleType.trim().isNotEmpty)
          'sampleType': sampleType.trim(),
        if (turnaroundHours != null) 'turnaroundHours': turnaroundHours,
        'isActive': isActive,
      },
      fromJson: (json) => LabTest.fromJson(json),
    );
    return response.data;
  }

  Future<LabTest?> updateLabProviderTest(
    String testId, {
    String? code,
    String? name,
    String? category,
    double? price,
    double? discountedPrice,
    bool clearDiscountedPrice = false,
    List<String>? preparationInstructions,
    int? fastingHours,
    bool clearFastingHours = false,
    String? sampleType,
    bool clearSampleType = false,
    int? turnaroundHours,
    bool clearTurnaroundHours = false,
    bool? isActive,
  }) async {
    final endpoint =
        ApiEndpoints.updateLabProviderTest.replaceAll(':id', testId);
    final body = <String, dynamic>{
      if (code != null) 'code': code.trim(),
      if (name != null) 'name': name.trim(),
      if (category != null) 'category': category.trim(),
      if (price != null) 'price': price,
      if (discountedPrice != null) 'discountedPrice': discountedPrice,
      if (clearDiscountedPrice) 'discountedPrice': null,
      if (preparationInstructions != null)
        'preparationInstructions': preparationInstructions,
      if (fastingHours != null) 'fastingHours': fastingHours,
      if (clearFastingHours) 'fastingHours': null,
      if (sampleType != null) 'sampleType': sampleType.trim(),
      if (clearSampleType) 'sampleType': null,
      if (turnaroundHours != null) 'turnaroundHours': turnaroundHours,
      if (clearTurnaroundHours) 'turnaroundHours': null,
      if (isActive != null) 'isActive': isActive,
    };

    final response = await _apiService.patch<LabTest>(
      endpoint,
      body: body,
      fromJson: (json) => LabTest.fromJson(json),
    );
    return response.data;
  }

  Future<LabPackage?> createLabProviderPackage({
    required String code,
    required String name,
    String? description,
    required List<String> testIds,
    required double price,
    double? discountedPrice,
    List<String> preparationInstructions = const <String>[],
    bool isActive = true,
  }) async {
    final response = await _apiService.post<LabPackage>(
      ApiEndpoints.createLabProviderPackage,
      body: {
        'code': code.trim(),
        'name': name.trim(),
        if (description != null && description.trim().isNotEmpty)
          'description': description.trim(),
        'testIds': testIds,
        'price': price,
        if (discountedPrice != null) 'discountedPrice': discountedPrice,
        'preparationInstructions': preparationInstructions,
        'isActive': isActive,
      },
      fromJson: (json) => LabPackage.fromJson(json),
    );
    return response.data;
  }

  Future<LabPackage?> updateLabProviderPackage(
    String packageId, {
    String? code,
    String? name,
    String? description,
    bool clearDescription = false,
    List<String>? testIds,
    double? price,
    double? discountedPrice,
    bool clearDiscountedPrice = false,
    List<String>? preparationInstructions,
    bool? isActive,
  }) async {
    final endpoint =
        ApiEndpoints.updateLabProviderPackage.replaceAll(':id', packageId);
    final body = <String, dynamic>{
      if (code != null) 'code': code.trim(),
      if (name != null) 'name': name.trim(),
      if (description != null) 'description': description.trim(),
      if (clearDescription) 'description': null,
      if (testIds != null) 'testIds': testIds,
      if (price != null) 'price': price,
      if (discountedPrice != null) 'discountedPrice': discountedPrice,
      if (clearDiscountedPrice) 'discountedPrice': null,
      if (preparationInstructions != null)
        'preparationInstructions': preparationInstructions,
      if (isActive != null) 'isActive': isActive,
    };

    final response = await _apiService.patch<LabPackage>(
      endpoint,
      body: body,
      fromJson: (json) => LabPackage.fromJson(json),
    );
    return response.data;
  }

  Future<List<LabOrder>> getLabProviderOrders({
    String status = 'all',
    String? search,
    int page = 1,
    int limit = 30,
  }) async {
    final query = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
      'status': status,
      if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
    };

    final queryString = query.entries
        .map((e) => '${e.key}=${Uri.encodeQueryComponent(e.value)}')
        .join('&');

    final response = await _apiService.get<List<LabOrder>>(
      '${ApiEndpoints.getLabProviderOrders}?$queryString',
      fromJson: (json) {
        final data = (json['data'] as List?) ?? const <dynamic>[];
        return data
            .map((e) => LabOrder.fromJson(e as Map<String, dynamic>))
            .toList();
      },
    );

    return response.data ?? <LabOrder>[];
  }

  Future<LabOrder?> getLabProviderOrderById(String orderId) async {
    final endpoint =
        ApiEndpoints.getLabProviderOrderById.replaceAll(':id', orderId);
    final response = await _apiService.get<LabOrder>(
      endpoint,
      fromJson: (json) => LabOrder.fromJson(json),
    );
    return response.data;
  }

  Future<LabOrder?> updateLabProviderOrderStatus(
    String orderId,
    String status,
  ) async {
    final endpoint =
        ApiEndpoints.updateLabProviderOrderStatus.replaceAll(':id', orderId);
    final response = await _apiService.patch<LabOrder>(
      endpoint,
      body: {'status': status},
      fromJson: (json) => LabOrder.fromJson(json),
    );
    return response.data;
  }

  Future<LabOrder?> assignLabProviderCollector(
    String orderId, {
    required String collectorName,
    required String collectorPhone,
    DateTime? collectorEta,
  }) async {
    final endpoint =
        ApiEndpoints.assignLabProviderOrderCollector.replaceAll(':id', orderId);
    final response = await _apiService.patch<LabOrder>(
      endpoint,
      body: {
        'collectorName': collectorName,
        'collectorPhone': collectorPhone,
        if (collectorEta != null)
          'collectorEta': collectorEta.toUtc().toIso8601String(),
      },
      fromJson: (json) => LabOrder.fromJson(json),
    );
    return response.data;
  }

  Future<LabOrder?> uploadLabProviderReport(
    String orderId, {
    required String filePath,
  }) async {
    final endpoint =
        ApiEndpoints.uploadLabProviderOrderReport.replaceAll(':id', orderId);
    final response = await _apiService.uploadFile<LabOrder>(
      endpoint,
      filePath: filePath,
      fieldName: 'report',
      fromJson: (json) => LabOrder.fromJson(json),
    );
    return response.data;
  }

  Future<LabOrder?> escalateLabProviderOrder(
    String orderId, {
    required String escalationReason,
  }) async {
    final endpoint =
        ApiEndpoints.escalateLabProviderOrder.replaceAll(':id', orderId);
    final response = await _apiService.patch<LabOrder>(
      endpoint,
      body: {
        'escalationReason': escalationReason.trim(),
      },
      fromJson: (json) => LabOrder.fromJson(json),
    );
    return response.data;
  }
}
