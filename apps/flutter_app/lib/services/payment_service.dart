import '../config/api_config.dart';
import '../models/api_response.dart';
import 'api_service.dart';

class PaymentService {
  final ApiService _apiService;

  PaymentService(this._apiService);

  Future<ApiResponse<Map<String, dynamic>>> initiateDemoPayment({
    required String appointmentId,
    required double amount,
    String purpose = 'doctor_consultation',
  }) {
    return _apiService.post(
      ApiEndpoints.initiatePayment,
      body: {
        'appointmentId': appointmentId,
        'amount': amount,
        'currency': 'INR',
        'purpose': purpose,
      },
      fromJson: (json) => json,
    );
  }

  Future<ApiResponse<Map<String, dynamic>>> getPaymentStatus(String paymentId) {
    return _apiService.get(
      ApiEndpoints.getPaymentStatus.replaceFirst(':paymentId', paymentId),
      fromJson: (json) => json,
    );
  }
}
