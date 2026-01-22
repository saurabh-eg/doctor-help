import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/constants.dart';
import '../../widgets/doctor_bottom_nav.dart';

class DoctorEarningsScreen extends ConsumerStatefulWidget {
  const DoctorEarningsScreen({super.key});

  @override
  ConsumerState<DoctorEarningsScreen> createState() =>
      _DoctorEarningsScreenState();
}

class _DoctorEarningsScreenState extends ConsumerState<DoctorEarningsScreen> {
  String _selectedPeriod = 'month'; // day, week, month, year

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Earnings'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Total Earnings Card
              Container(
                margin: const EdgeInsets.all(UIConstants.spacingLarge),
                padding: const EdgeInsets.all(UIConstants.spacingLarge),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      theme.primaryColor,
                      theme.primaryColor.withOpacity(0.8),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Total Earnings',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: Colors.white70,
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingSmall),
                    Text(
                      '₹15,450',
                      style: theme.textTheme.displaySmall?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingMedium),
                    const Row(
                      children: [
                        Expanded(
                          child: _EarningsMetric(
                            label: 'This Month',
                            value: '₹2,450',
                            color: Colors.white70,
                          ),
                        ),
                        SizedBox(width: UIConstants.spacingLarge),
                        Expanded(
                          child: _EarningsMetric(
                            label: 'Pending',
                            value: '₹500',
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Period Filter
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: UIConstants.spacingLarge,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Filter by Period',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingMedium),
                    Row(
                      children: [
                        _PeriodButton(
                          label: 'Day',
                          isSelected: _selectedPeriod == 'day',
                          onTap: () => setState(() => _selectedPeriod = 'day'),
                        ),
                        const SizedBox(width: UIConstants.spacingSmall),
                        _PeriodButton(
                          label: 'Week',
                          isSelected: _selectedPeriod == 'week',
                          onTap: () => setState(() => _selectedPeriod = 'week'),
                        ),
                        const SizedBox(width: UIConstants.spacingSmall),
                        _PeriodButton(
                          label: 'Month',
                          isSelected: _selectedPeriod == 'month',
                          onTap: () =>
                              setState(() => _selectedPeriod = 'month'),
                        ),
                        const SizedBox(width: UIConstants.spacingSmall),
                        _PeriodButton(
                          label: 'Year',
                          isSelected: _selectedPeriod == 'year',
                          onTap: () => setState(() => _selectedPeriod = 'year'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: UIConstants.spacingLarge),

              // Earnings Chart (Mock)
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: UIConstants.spacingLarge,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Earnings Trend',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingMedium),
                    Container(
                      height: 200,
                      padding: const EdgeInsets.all(UIConstants.spacingMedium),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey[300]!),
                        borderRadius: BorderRadius.circular(
                          UIConstants.radiusMedium,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          'Chart Placeholder\n(Implement with charts package)',
                          textAlign: TextAlign.center,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: UIConstants.spacingLarge),

              // Recent Transactions
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: UIConstants.spacingLarge,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Recent Transactions',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        TextButton(
                          onPressed: () {},
                          child: const Text('View All'),
                        ),
                      ],
                    ),
                    const SizedBox(height: UIConstants.spacingMedium),
                    ...[
                      (
                        patient: 'John Doe',
                        amount: '+₹500',
                        date: 'Jan 20, 2026',
                        type: 'consultation'
                      ),
                      (
                        patient: 'Jane Smith',
                        amount: '+₹450',
                        date: 'Jan 19, 2026',
                        type: 'consultation'
                      ),
                      (
                        patient: 'Withdrawal',
                        amount: '-₹5000',
                        date: 'Jan 15, 2026',
                        type: 'withdrawal'
                      ),
                      (
                        patient: 'Mike Johnson',
                        amount: '+₹500',
                        date: 'Jan 12, 2026',
                        type: 'consultation'
                      ),
                    ].map(
                      (transaction) => Padding(
                        padding: const EdgeInsets.only(
                          bottom: UIConstants.spacingMedium,
                        ),
                        child: _TransactionItem(
                          title: transaction.patient,
                          amount: transaction.amount,
                          date: transaction.date,
                          isWithdrawal: transaction.type == 'withdrawal',
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: UIConstants.spacingLarge),

              // Withdraw Button
              Padding(
                padding: const EdgeInsets.all(UIConstants.spacingLarge),
                child: ElevatedButton.icon(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('Request Withdrawal'),
                        content: const Text(
                          'Minimum withdrawal amount is ₹1000. You have ₹500 pending. Enter amount to withdraw:',
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text('Cancel'),
                          ),
                          ElevatedButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text('Request'),
                          ),
                        ],
                      ),
                    );
                  },
                  icon: const Icon(Icons.account_balance_wallet),
                  label: const Text('Request Withdrawal'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      vertical: UIConstants.spacingMedium,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: const DoctorBottomNav(
        currentRoute: '/doctor/earnings',
      ),
    );
  }
}

class _EarningsMetric extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _EarningsMetric({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: color,
              ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
        ),
      ],
    );
  }
}

class _PeriodButton extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _PeriodButton({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: UIConstants.spacingMedium,
          vertical: UIConstants.spacingSmall,
        ),
        decoration: BoxDecoration(
          color: isSelected ? theme.primaryColor : Colors.grey[200],
          borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
          border: Border.all(
            color: isSelected ? theme.primaryColor : Colors.transparent,
          ),
        ),
        child: Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: isSelected ? Colors.white : Colors.black87,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

class _TransactionItem extends StatelessWidget {
  final String title;
  final String amount;
  final String date;
  final bool isWithdrawal;

  const _TransactionItem({
    required this.title,
    required this.amount,
    required this.date,
    this.isWithdrawal = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final amountColor = amount.startsWith('-') ? Colors.red : Colors.green;

    return Container(
      padding: const EdgeInsets.all(UIConstants.spacingMedium),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(UIConstants.radiusMedium),
      ),
      child: Row(
        children: [
          // Icon
          CircleAvatar(
            backgroundColor: amountColor.withOpacity(0.1),
            child: Icon(
              isWithdrawal ? Icons.account_balance_wallet : Icons.trending_up,
              color: amountColor,
            ),
          ),
          const SizedBox(width: UIConstants.spacingMedium),

          // Title and Date
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  date,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),

          // Amount
          Text(
            amount,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: amountColor,
            ),
          ),
        ],
      ),
    );
  }
}
