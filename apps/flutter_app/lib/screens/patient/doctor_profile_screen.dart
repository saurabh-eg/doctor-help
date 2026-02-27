import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/doctor.dart';
import '../../models/review.dart';
import '../../providers/providers.dart';
import '../../navigation/app_router.dart';
import '../../config/constants.dart';
import '../../widgets/app_button.dart';

class DoctorProfileScreen extends ConsumerStatefulWidget {
  final String doctorId;

  const DoctorProfileScreen({super.key, required this.doctorId});

  @override
  ConsumerState<DoctorProfileScreen> createState() =>
      _DoctorProfileScreenState();
}

class _DoctorProfileScreenState extends ConsumerState<DoctorProfileScreen> {
  late Future<Doctor?> _doctorFuture;

  @override
  void initState() {
    super.initState();
    _doctorFuture =
        ref.read(doctorServiceProvider).getDoctorById(widget.doctorId);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: FutureBuilder<Doctor?>(
        future: _doctorFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError || snapshot.data == null) {
            return Scaffold(
              appBar: AppBar(),
              body: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.error_outline,
                      size: 64,
                      color: Colors.grey[400],
                    ),
                    const SizedBox(height: UIConstants.spacingMedium),
                    Text(
                      'Doctor not found',
                      style: theme.textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            );
          }

          final doctor = snapshot.data!;

          return SafeArea(
            child: CustomScrollView(
              slivers: [
                // App Bar
                SliverAppBar(
                  expandedHeight: 200,
                  pinned: true,
                  flexibleSpace: FlexibleSpaceBar(
                    background: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            theme.primaryColor,
                            theme.primaryColor.withOpacity(0.7),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: Center(
                        child: Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(
                              UIConstants.radiusLarge,
                            ),
                          ),
                          child: doctor.photoUrl != null
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(
                                    UIConstants.radiusLarge,
                                  ),
                                  child: Image.network(
                                    doctor.photoUrl!,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) {
                                      return Icon(
                                        Icons.person,
                                        size: 60,
                                        color: theme.primaryColor,
                                      );
                                    },
                                  ),
                                )
                              : Icon(
                                  Icons.person,
                                  size: 60,
                                  color: theme.primaryColor,
                                ),
                        ),
                      ),
                    ),
                  ),
                ),
                // Content
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(UIConstants.spacingLarge),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Doctor Info Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    doctor.userId.name ?? 'Doctor',
                                    style:
                                        theme.textTheme.headlineSmall?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    doctor.specialization,
                                    style: theme.textTheme.bodyMedium?.copyWith(
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (doctor.isVerified)
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.green.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(
                                  Icons.verified,
                                  color: Colors.green,
                                  size: 24,
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: UIConstants.spacingLarge),

                        // Stats Row
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _StatCard(
                              label: 'Experience',
                              value: '${doctor.experience} years',
                            ),
                            _StatCard(
                              label: 'Rating',
                              value: doctor.rating.toStringAsFixed(1),
                              icon: Icons.star_rounded,
                            ),
                            _StatCard(
                              label: 'Reviews',
                              value: '${doctor.reviewCount}',
                            ),
                          ],
                        ),
                        const SizedBox(height: UIConstants.spacingLarge),

                        // Consultation Fee
                        Container(
                          padding:
                              const EdgeInsets.all(UIConstants.spacingMedium),
                          decoration: BoxDecoration(
                            color: theme.primaryColor.withOpacity(0.1),
                            borderRadius:
                                BorderRadius.circular(UIConstants.radiusMedium),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Consultation Fee',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: Colors.grey[700],
                                ),
                              ),
                              Text(
                                '₹${doctor.consultationFee}',
                                style: theme.textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: theme.primaryColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: UIConstants.spacingLarge),

                        // About Section
                        if (doctor.bio != null) ...[
                          Text(
                            'About',
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: UIConstants.spacingSmall),
                          Text(
                            doctor.bio!,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: Colors.grey[700],
                              height: 1.5,
                            ),
                          ),
                          const SizedBox(height: UIConstants.spacingLarge),
                        ],

                        // Qualifications
                        if (doctor.qualification.isNotEmpty) ...[
                          Text(
                            'Qualifications',
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: UIConstants.spacingSmall),
                          Text(
                            doctor.qualification,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: Colors.grey[700],
                            ),
                          ),
                          const SizedBox(height: UIConstants.spacingLarge),
                        ],

                        // Available Slots Section
                        Text(
                          'Available Slots',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: UIConstants.spacingMedium),
                        if (doctor.availableSlots.isEmpty)
                          Text(
                            'No slots available',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: Colors.grey[600],
                            ),
                          )
                        else
                          Column(
                            children: doctor.availableSlots.map((slot) {
                              final days = [
                                'Sunday',
                                'Monday',
                                'Tuesday',
                                'Wednesday',
                                'Thursday',
                                'Friday',
                                'Saturday'
                              ];

                              return Container(
                                margin: const EdgeInsets.only(
                                  bottom: UIConstants.spacingSmall,
                                ),
                                padding: const EdgeInsets.all(
                                  UIConstants.spacingMedium,
                                ),
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: Colors.grey[300]!,
                                  ),
                                  borderRadius: BorderRadius.circular(
                                    UIConstants.radiusMedium,
                                  ),
                                ),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      days[slot.day],
                                      style:
                                          theme.textTheme.bodyMedium?.copyWith(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    Text(
                                      '${slot.startTime} - ${slot.endTime}',
                                      style:
                                          theme.textTheme.bodySmall?.copyWith(
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                        const SizedBox(height: UIConstants.spacing2XLarge),

                        // Reviews Section
                        _ReviewsSection(doctorId: doctor.id),
                        const SizedBox(height: UIConstants.spacing2XLarge),

                        // Book Appointment Button
                        AppButton(
                          label: 'Book Appointment',
                          onPressed: () {
                            context.push(
                              '${AppRoutes.bookAppointment}?doctorId=${doctor.id}',
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData? icon;

  const _StatCard({
    required this.label,
    required this.value,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
        Row(
          children: [
            if (icon != null) ...[
              Icon(
                icon,
                color: Colors.amber,
                size: 20,
              ),
              const SizedBox(width: 4),
            ],
            Text(
              value,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }
}

class _ReviewsSection extends ConsumerStatefulWidget {
  final String doctorId;
  const _ReviewsSection({required this.doctorId});

  @override
  ConsumerState<_ReviewsSection> createState() => _ReviewsSectionState();
}

class _ReviewsSectionState extends ConsumerState<_ReviewsSection> {
  List<Review>? _reviews;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  Future<void> _loadReviews() async {
    try {
      final reviews = await ref
          .read(reviewServiceProvider)
          .getDoctorReviews(widget.doctorId, limit: 5);
      if (mounted) {
        setState(() {
          _reviews = reviews;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Patient Reviews',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: UIConstants.spacingMedium),
        if (_isLoading)
          const Center(child: CircularProgressIndicator())
        else if (_error != null)
          Text('Could not load reviews',
              style: TextStyle(color: Colors.grey[500]))
        else if (_reviews == null || _reviews!.isEmpty)
          Container(
            padding: const EdgeInsets.all(UIConstants.spacingLarge),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
            ),
            child: Center(
              child: Column(
                children: [
                  Icon(Icons.rate_review_outlined,
                      size: 40, color: Colors.grey[400]),
                  const SizedBox(height: 8),
                  Text('No reviews yet',
                      style: TextStyle(color: Colors.grey[500])),
                ],
              ),
            ),
          )
        else
          Column(
            children: _reviews!
                .map((review) => _ReviewCard(review: review))
                .toList(),
          ),
      ],
    );
  }
}

class _ReviewCard extends StatelessWidget {
  final Review review;
  const _ReviewCard({required this.review});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.only(bottom: UIConstants.spacingSmall),
      padding: const EdgeInsets.all(UIConstants.spacingMedium),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[200]!),
        borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: theme.primaryColor.withOpacity(0.1),
                backgroundImage: review.patientId.avatar != null
                    ? NetworkImage(review.patientId.avatar!)
                    : null,
                child: review.patientId.avatar == null
                    ? Icon(Icons.person,
                        size: 18, color: theme.primaryColor)
                    : null,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  review.patientId.name ?? 'Patient',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              // Stars
              Row(
                children: List.generate(5, (i) {
                  return Icon(
                    i < review.rating
                        ? Icons.star_rounded
                        : Icons.star_outline_rounded,
                    size: 16,
                    color: i < review.rating ? Colors.amber : Colors.grey[300],
                  );
                }),
              ),
            ],
          ),
          if (review.comment != null && review.comment!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              review.comment!,
              style: theme.textTheme.bodySmall?.copyWith(
                color: Colors.grey[700],
                height: 1.4,
              ),
            ),
          ],
          if (review.createdAt != null) ...[
            const SizedBox(height: 6),
            Text(
              _formatDate(review.createdAt!),
              style: theme.textTheme.labelSmall?.copyWith(
                color: Colors.grey[400],
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inDays == 0) return 'Today';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays} days ago';
    if (diff.inDays < 30) return '${(diff.inDays / 7).floor()} weeks ago';
    return '${date.day}/${date.month}/${date.year}';
  }
}
