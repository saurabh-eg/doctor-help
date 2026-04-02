import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/constants.dart';
import '../../models/lab.dart';
import '../../navigation/app_router.dart';
import '../../providers/providers.dart';
import '../../widgets/lab_bottom_nav.dart';

class LabCatalogScreen extends ConsumerStatefulWidget {
  const LabCatalogScreen({super.key});

  @override
  ConsumerState<LabCatalogScreen> createState() => _LabCatalogScreenState();
}

class _LabCatalogScreenState extends ConsumerState<LabCatalogScreen> {
  late Future<LabCatalog?> _catalogFuture;
  int _selectedTabIndex = 0;

  @override
  void initState() {
    super.initState();
    _catalogFuture = _fetchCatalog();
  }

  Future<LabCatalog?> _fetchCatalog() {
    return ref.read(labServiceProvider).getLabProviderCatalog(
          includeInactive: true,
        );
  }

  Future<void> _refresh() async {
    final next = _fetchCatalog();
    setState(() {
      _catalogFuture = next;
    });
    await next;
  }

  List<String> _parseInstructionInput(String raw) {
    return raw
        .split(RegExp(r'[\n,]'))
        .map((item) => item.trim())
        .where((item) => item.isNotEmpty)
        .toList();
  }

  Future<void> _showTestDialog({
    required LabCatalog catalog,
    LabTest? existing,
  }) async {
    final isEdit = existing != null;
    final codeController = TextEditingController(text: existing?.code ?? '');
    final nameController = TextEditingController(text: existing?.name ?? '');
    final categoryController =
        TextEditingController(text: existing?.category ?? '');
    final priceController = TextEditingController(
      text: existing == null ? '' : existing.price.toStringAsFixed(0),
    );
    final discountedPriceController = TextEditingController(
      text: existing?.discountedPrice == null
          ? ''
          : existing!.discountedPrice!.toStringAsFixed(0),
    );
    final instructionsController = TextEditingController(
      text: existing?.preparationInstructions.join(', ') ?? '',
    );
    final fastingController = TextEditingController(
      text: existing?.fastingHours?.toString() ?? '',
    );
    final sampleTypeController =
        TextEditingController(text: existing?.sampleType ?? '');
    final turnaroundController = TextEditingController(
      text: existing?.turnaroundHours?.toString() ?? '',
    );
    bool isActive = existing?.isActive ?? true;
    bool isSubmitting = false;

    await showDialog<void>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text(isEdit ? 'Edit Test' : 'Add Test'),
          content: SizedBox(
            width: double.maxFinite,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: codeController,
                    decoration: const InputDecoration(labelText: 'Test Code'),
                  ),
                  TextField(
                    controller: nameController,
                    decoration: const InputDecoration(labelText: 'Test Name'),
                  ),
                  TextField(
                    controller: categoryController,
                    decoration: const InputDecoration(labelText: 'Category'),
                  ),
                  TextField(
                    controller: priceController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Price'),
                  ),
                  TextField(
                    controller: discountedPriceController,
                    keyboardType: TextInputType.number,
                    decoration:
                        const InputDecoration(labelText: 'Discounted Price'),
                  ),
                  TextField(
                    controller: instructionsController,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      labelText: 'Preparation Instructions',
                      hintText: 'Comma or new-line separated',
                    ),
                  ),
                  TextField(
                    controller: fastingController,
                    keyboardType: TextInputType.number,
                    decoration:
                        const InputDecoration(labelText: 'Fasting Hours'),
                  ),
                  TextField(
                    controller: sampleTypeController,
                    decoration: const InputDecoration(labelText: 'Sample Type'),
                  ),
                  TextField(
                    controller: turnaroundController,
                    keyboardType: TextInputType.number,
                    decoration:
                        const InputDecoration(labelText: 'Turnaround Hours'),
                  ),
                  const SizedBox(height: UIConstants.spacingSmall),
                  SwitchListTile(
                    dense: true,
                    value: isActive,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Active'),
                    onChanged: (value) => setDialogState(() {
                      isActive = value;
                    }),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed:
                  isSubmitting ? null : () => Navigator.of(dialogContext).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: isSubmitting
                  ? null
                  : () async {
                      final messenger = ScaffoldMessenger.of(this.context);
                      final code = codeController.text.trim();
                      final name = nameController.text.trim();
                      final price =
                          double.tryParse(priceController.text.trim());
                      final discounted = discountedPriceController.text.trim();
                      final discountedPrice = discounted.isEmpty
                          ? null
                          : double.tryParse(discounted);
                      final fasting = fastingController.text.trim();
                      final fastingHours =
                          fasting.isEmpty ? null : int.tryParse(fasting);
                      final turnaround = turnaroundController.text.trim();
                      final turnaroundHours =
                          turnaround.isEmpty ? null : int.tryParse(turnaround);

                      if (code.isEmpty || name.isEmpty || price == null) {
                        messenger.showSnackBar(
                          const SnackBar(
                            content:
                                Text('Code, name and valid price are required'),
                            backgroundColor: Colors.red,
                          ),
                        );
                        return;
                      }

                      if (code.length < 2) {
                        messenger.showSnackBar(
                          const SnackBar(
                            content:
                                Text('Test code must be at least 2 characters'),
                            backgroundColor: Colors.red,
                          ),
                        );
                        return;
                      }

                      if (discountedPrice != null && discountedPrice > price) {
                        messenger.showSnackBar(
                          const SnackBar(
                            content: Text(
                                'Discounted price cannot be greater than price'),
                            backgroundColor: Colors.red,
                          ),
                        );
                        return;
                      }

                      setDialogState(() => isSubmitting = true);

                      final service = ref.read(labServiceProvider);
                      final instructions = _parseInstructionInput(
                        instructionsController.text,
                      );

                      final result = isEdit
                          ? await service.updateLabProviderTest(
                              existing.id,
                              code: code,
                              name: name,
                              category: categoryController.text.trim().isEmpty
                                  ? null
                                  : categoryController.text.trim(),
                              price: price,
                              discountedPrice: discountedPrice,
                              clearDiscountedPrice:
                                  discountedPriceController.text.trim().isEmpty,
                              preparationInstructions: instructions,
                              fastingHours: fastingHours,
                              clearFastingHours: fasting.isEmpty,
                              sampleType:
                                  sampleTypeController.text.trim().isEmpty
                                      ? null
                                      : sampleTypeController.text.trim(),
                              clearSampleType:
                                  sampleTypeController.text.trim().isEmpty,
                              turnaroundHours: turnaroundHours,
                              clearTurnaroundHours: turnaround.isEmpty,
                              isActive: isActive,
                            )
                          : await service.createLabProviderTest(
                              code: code,
                              name: name,
                              category: categoryController.text.trim().isEmpty
                                  ? null
                                  : categoryController.text.trim(),
                              price: price,
                              discountedPrice: discountedPrice,
                              preparationInstructions: instructions,
                              fastingHours: fastingHours,
                              sampleType:
                                  sampleTypeController.text.trim().isEmpty
                                      ? null
                                      : sampleTypeController.text.trim(),
                              turnaroundHours: turnaroundHours,
                              isActive: isActive,
                            );

                      if (!mounted) return;

                      if (result == null) {
                        setDialogState(() => isSubmitting = false);
                        messenger.showSnackBar(
                          SnackBar(
                            content: Text(
                              isEdit
                                  ? 'Failed to update test. Check code/price and try again.'
                                  : 'Failed to create test. Check code/price and try again.',
                            ),
                            backgroundColor: Colors.red,
                          ),
                        );
                        return;
                      }

                      if (!dialogContext.mounted) return;
                      Navigator.of(dialogContext).pop();
                      await _refresh();
                      messenger.showSnackBar(
                        SnackBar(
                          content: Text(
                            isEdit
                                ? 'Test updated successfully'
                                : 'Test added successfully',
                          ),
                          backgroundColor: Colors.green,
                        ),
                      );
                    },
              child: isSubmitting
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(isEdit ? 'Save' : 'Add'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showPackageDialog({
    required LabCatalog catalog,
    LabPackage? existing,
  }) async {
    final isEdit = existing != null;
    final codeController = TextEditingController(text: existing?.code ?? '');
    final nameController = TextEditingController(text: existing?.name ?? '');
    final descriptionController =
        TextEditingController(text: existing?.description ?? '');
    final priceController = TextEditingController(
      text: existing == null ? '' : existing.price.toStringAsFixed(0),
    );
    final discountedPriceController = TextEditingController(
      text: existing?.discountedPrice == null
          ? ''
          : existing!.discountedPrice!.toStringAsFixed(0),
    );
    final instructionsController = TextEditingController(
      text: existing?.preparationInstructions.join(', ') ?? '',
    );
    final selectedTestIds = <String>{
      ...(existing?.items.map((item) => item.testId) ?? const <String>[]),
    };
    bool isActive = existing?.isActive ?? true;
    bool isSubmitting = false;

    await showDialog<void>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text(isEdit ? 'Edit Package' : 'Add Package'),
          content: SizedBox(
            width: double.maxFinite,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextField(
                    controller: codeController,
                    decoration:
                        const InputDecoration(labelText: 'Package Code'),
                  ),
                  TextField(
                    controller: nameController,
                    decoration:
                        const InputDecoration(labelText: 'Package Name'),
                  ),
                  TextField(
                    controller: descriptionController,
                    maxLines: 2,
                    decoration: const InputDecoration(labelText: 'Description'),
                  ),
                  TextField(
                    controller: priceController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Price'),
                  ),
                  TextField(
                    controller: discountedPriceController,
                    keyboardType: TextInputType.number,
                    decoration:
                        const InputDecoration(labelText: 'Discounted Price'),
                  ),
                  TextField(
                    controller: instructionsController,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      labelText: 'Preparation Instructions',
                      hintText: 'Comma or new-line separated',
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingSmall),
                  Text(
                    'Included Tests',
                    style: Theme.of(context)
                        .textTheme
                        .titleSmall
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: UIConstants.spacingSmall),
                  if (catalog.tests.isEmpty)
                    const Text('Add tests first to build packages.')
                  else
                    ...catalog.tests.map(
                      (test) => CheckboxListTile(
                        dense: true,
                        controlAffinity: ListTileControlAffinity.leading,
                        contentPadding: EdgeInsets.zero,
                        value: selectedTestIds.contains(test.id),
                        title: Text(
                            '${test.name} (₹${test.effectivePrice.toStringAsFixed(0)})'),
                        subtitle: Text(test.code),
                        onChanged: (checked) => setDialogState(() {
                          if (checked == true) {
                            selectedTestIds.add(test.id);
                          } else {
                            selectedTestIds.remove(test.id);
                          }
                        }),
                      ),
                    ),
                  const SizedBox(height: UIConstants.spacingSmall),
                  SwitchListTile(
                    dense: true,
                    value: isActive,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Active'),
                    onChanged: (value) => setDialogState(() {
                      isActive = value;
                    }),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed:
                  isSubmitting ? null : () => Navigator.of(dialogContext).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: isSubmitting
                  ? null
                  : () async {
                      final messenger = ScaffoldMessenger.of(this.context);
                      final code = codeController.text.trim();
                      final name = nameController.text.trim();
                      final price =
                          double.tryParse(priceController.text.trim());
                      final discounted = discountedPriceController.text.trim();
                      final discountedPrice = discounted.isEmpty
                          ? null
                          : double.tryParse(discounted);

                      if (code.isEmpty || name.isEmpty || price == null) {
                        messenger.showSnackBar(
                          const SnackBar(
                            content:
                                Text('Code, name and valid price are required'),
                            backgroundColor: Colors.red,
                          ),
                        );
                        return;
                      }

                      if (code.length < 2) {
                        messenger.showSnackBar(
                          const SnackBar(
                            content: Text(
                                'Package code must be at least 2 characters'),
                            backgroundColor: Colors.red,
                          ),
                        );
                        return;
                      }

                      if (selectedTestIds.isEmpty) {
                        messenger.showSnackBar(
                          const SnackBar(
                            content: Text('Please select at least one test'),
                            backgroundColor: Colors.red,
                          ),
                        );
                        return;
                      }

                      if (discountedPrice != null && discountedPrice > price) {
                        messenger.showSnackBar(
                          const SnackBar(
                            content: Text(
                                'Discounted price cannot be greater than price'),
                            backgroundColor: Colors.red,
                          ),
                        );
                        return;
                      }

                      setDialogState(() => isSubmitting = true);

                      final service = ref.read(labServiceProvider);
                      final instructions = _parseInstructionInput(
                        instructionsController.text,
                      );

                      final result = isEdit
                          ? await service.updateLabProviderPackage(
                              existing.id,
                              code: code,
                              name: name,
                              description:
                                  descriptionController.text.trim().isEmpty
                                      ? null
                                      : descriptionController.text.trim(),
                              clearDescription:
                                  descriptionController.text.trim().isEmpty,
                              testIds: selectedTestIds.toList(),
                              price: price,
                              discountedPrice: discountedPrice,
                              clearDiscountedPrice:
                                  discountedPriceController.text.trim().isEmpty,
                              preparationInstructions: instructions,
                              isActive: isActive,
                            )
                          : await service.createLabProviderPackage(
                              code: code,
                              name: name,
                              description:
                                  descriptionController.text.trim().isEmpty
                                      ? null
                                      : descriptionController.text.trim(),
                              testIds: selectedTestIds.toList(),
                              price: price,
                              discountedPrice: discountedPrice,
                              preparationInstructions: instructions,
                              isActive: isActive,
                            );

                      if (!mounted) return;

                      if (result == null) {
                        setDialogState(() => isSubmitting = false);
                        messenger.showSnackBar(
                          SnackBar(
                            content: Text(
                              isEdit
                                  ? 'Failed to update package'
                                  : 'Failed to create package',
                            ),
                            backgroundColor: Colors.red,
                          ),
                        );
                        return;
                      }

                      if (!dialogContext.mounted) return;
                      Navigator.of(dialogContext).pop();
                      await _refresh();
                      messenger.showSnackBar(
                        SnackBar(
                          content: Text(
                            isEdit
                                ? 'Package updated successfully'
                                : 'Package added successfully',
                          ),
                          backgroundColor: Colors.green,
                        ),
                      );
                    },
              child: isSubmitting
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(isEdit ? 'Save' : 'Add'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTestsList(LabCatalog catalog) {
    if (catalog.tests.isEmpty) {
      return const Center(child: Text('No tests added yet'));
    }

    return ListView.separated(
      padding: const EdgeInsets.all(UIConstants.spacingLarge),
      itemCount: catalog.tests.length,
      separatorBuilder: (_, __) =>
          const SizedBox(height: UIConstants.spacingSmall),
      itemBuilder: (context, index) {
        final test = catalog.tests[index];
        return Card(
          child: ListTile(
            title: Text(test.name),
            subtitle: Text(
              '${test.code} • ₹${test.effectivePrice.toStringAsFixed(0)}${test.category.isNotEmpty ? ' • ${test.category}' : ''}',
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (!test.isActive)
                  const Padding(
                    padding: EdgeInsets.only(right: 6),
                    child: Icon(Icons.pause_circle, color: Colors.orange),
                  ),
                IconButton(
                  icon: const Icon(Icons.edit_outlined),
                  onPressed: () =>
                      _showTestDialog(catalog: catalog, existing: test),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPackagesList(LabCatalog catalog) {
    if (catalog.packages.isEmpty) {
      return const Center(child: Text('No packages added yet'));
    }

    return ListView.separated(
      padding: const EdgeInsets.all(UIConstants.spacingLarge),
      itemCount: catalog.packages.length,
      separatorBuilder: (_, __) =>
          const SizedBox(height: UIConstants.spacingSmall),
      itemBuilder: (context, index) {
        final pkg = catalog.packages[index];
        return Card(
          child: ListTile(
            title: Text(pkg.name),
            subtitle: Text(
              '${pkg.code} • ₹${pkg.effectivePrice.toStringAsFixed(0)} • ${pkg.items.length} tests',
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (!pkg.isActive)
                  const Padding(
                    padding: EdgeInsets.only(right: 6),
                    child: Icon(Icons.pause_circle, color: Colors.orange),
                  ),
                IconButton(
                  icon: const Icon(Icons.edit_outlined),
                  onPressed: () =>
                      _showPackageDialog(catalog: catalog, existing: pkg),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Catalog'),
        centerTitle: true,
        actions: [
          FutureBuilder<LabCatalog?>(
            future: _catalogFuture,
            builder: (context, snapshot) {
              final catalog = snapshot.data;
              return IconButton(
                tooltip: _selectedTabIndex == 0 ? 'Add Test' : 'Add Package',
                onPressed: catalog == null
                    ? null
                    : () {
                        if (_selectedTabIndex == 0) {
                          _showTestDialog(catalog: catalog);
                        } else {
                          _showPackageDialog(catalog: catalog);
                        }
                      },
                icon: const Icon(Icons.add_circle_outline),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(
                UIConstants.spacingLarge,
                UIConstants.spacingMedium,
                UIConstants.spacingLarge,
                0,
              ),
              child: SegmentedButton<int>(
                segments: const [
                  ButtonSegment<int>(
                    value: 0,
                    icon: Icon(Icons.science_outlined),
                    label: Text('Tests'),
                  ),
                  ButtonSegment<int>(
                    value: 1,
                    icon: Icon(Icons.medication_outlined),
                    label: Text('Packages'),
                  ),
                ],
                selected: {_selectedTabIndex},
                onSelectionChanged: (selection) {
                  setState(() {
                    _selectedTabIndex = selection.first;
                  });
                },
              ),
            ),
            const SizedBox(height: UIConstants.spacingSmall),
            Expanded(
              child: RefreshIndicator(
                onRefresh: _refresh,
                child: FutureBuilder<LabCatalog?>(
                  future: _catalogFuture,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    }

                    if (snapshot.hasError || snapshot.data == null) {
                      return ListView(
                        children: const [
                          SizedBox(height: 180),
                          Center(child: Text('Unable to load catalog')),
                        ],
                      );
                    }

                    final catalog = snapshot.data!;
                    return _selectedTabIndex == 0
                        ? _buildTestsList(catalog)
                        : _buildPackagesList(catalog);
                  },
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar:
          const LabBottomNav(currentRoute: AppRoutes.labCatalog),
    );
  }
}
