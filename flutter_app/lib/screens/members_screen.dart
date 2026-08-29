import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/models.dart';
import '../services/gym_store.dart';
import '../widgets/custom_widgets.dart';
import 'add_edit_member_screen.dart';

class MembersScreen extends StatefulWidget {
  const MembersScreen({super.key});

  @override
  State<MembersScreen> createState() => _MembersScreenState();
}

class _MembersScreenState extends State<MembersScreen> {
  String _searchQuery = '';
  String _selectedSport = 'All';
  String _selectedStatus = 'All';

  @override
  Widget build(BuildContext context) {
    final store = context.watch<GymStore>();
    final allMembers = store.members;

    // Filter members
    final filtered = allMembers.where((m) {
      final matchesSearch = m.fullName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          m.phone.contains(_searchQuery) ||
          m.barcodeId.toLowerCase().contains(_searchQuery.toLowerCase());
      
      final matchesSport = _selectedSport == 'All' || m.sportType == _selectedSport;
      final matchesStatus = _selectedStatus == 'All' || m.status == _selectedStatus;

      return matchesSearch && matchesSport && matchesStatus;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'قائمة المشتركين (${filtered.length})',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.userPlus, color: AppColors.primary),
            tooltip: 'إضافة مشترك جديد',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const AddEditMemberScreen()),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search and Filters Bar
          Container(
            padding: const EdgeInsets.all(16),
            color: AppColors.cardBg,
            child: Column(
              children: [
                // Search Input
                TextField(
                  onChanged: (val) => setState(() => _searchQuery = val),
                  style: GoogleFonts.cairo(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'البحث بالاسم، رقم الهاتف، أو الباركود...',
                    hintStyle: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 13),
                    prefixIcon: const Icon(LucideIcons.search, color: AppColors.textMuted, size: 20),
                    filled: true,
                    fillColor: AppColors.background,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.primary),
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Filter chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      // Sport Filter
                      _buildFilterChip('الكل', _selectedSport == 'All', () => setState(() => _selectedSport = 'All')),
                      ...store.settings.sports.map((s) => _buildFilterChip(
                        s,
                        _selectedSport == s,
                        () => setState(() => _selectedSport = s),
                      )),
                      const SizedBox(width: 8),
                      const Text('|', style: TextStyle(color: AppColors.border)),
                      const SizedBox(width: 8),
                      _buildFilterChip('النشطين فقط', _selectedStatus == 'active', () {
                        setState(() => _selectedStatus = _selectedStatus == 'active' ? 'All' : 'active');
                      }),
                      _buildFilterChip('المنتهية فقط', _selectedStatus == 'expired', () {
                        setState(() => _selectedStatus = _selectedStatus == 'expired' ? 'All' : 'expired');
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Members List
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(LucideIcons.users, size: 48, color: AppColors.textMuted),
                        const SizedBox(height: 12),
                        Text(
                          'لا يوجد مشتركين يطابقون خيارات البحث',
                          style: GoogleFonts.cairo(color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (ctx, idx) {
                      final member = filtered[idx];
                      return _buildMemberCard(context, store, member);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isSelected, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: ChoiceChip(
        label: Text(label, style: GoogleFonts.cairo(fontSize: 12, fontWeight: FontWeight.w600)),
        selected: isSelected,
        onSelected: (_) => onTap(),
        selectedColor: AppColors.primary,
        backgroundColor: AppColors.background,
        labelStyle: TextStyle(color: isSelected ? Colors.black : Colors.white),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: BorderSide(color: isSelected ? AppColors.primary : AppColors.border),
        ),
      ),
    );
  }

  Widget _buildMemberCard(BuildContext context, GymStore store, Member member) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      member.fullName,
                      style: GoogleFonts.cairo(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            member.sportType,
                            style: GoogleFonts.cairo(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          member.phone,
                          style: GoogleFonts.cairo(fontSize: 12, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              StatusBadge(
                status: member.status,
                daysRemaining: member.isActive ? member.daysRemaining : null,
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: AppColors.border, height: 1),
          const SizedBox(height: 12),

          // Dates & Barcode Info
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'الانتهاء: ${member.endDate}',
                style: GoogleFonts.cairo(fontSize: 12, color: AppColors.textMuted),
              ),
              Text(
                'الباركود: ${member.barcodeId}',
                style: GoogleFonts.cairo(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Action Buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // WhatsApp Quick Contact
              IconButton(
                onPressed: () => _launchWhatsApp(member.phone, member.fullName),
                icon: const Icon(LucideIcons.messageCircle, color: AppColors.emerald, size: 20),
                tooltip: 'مراسلة عبر واتساب',
              ),
              // View Barcode Dialog
              IconButton(
                onPressed: () => showBarcodeDialog(context, member),
                icon: const Icon(LucideIcons.qrCode, color: AppColors.primary, size: 20),
                tooltip: 'عرض الباركود',
              ),
              // Renew
              ElevatedButton(
                onPressed: () {
                  _showRenewDialog(context, store, member);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.cardHover,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: const BorderSide(color: AppColors.border),
                  ),
                ),
                child: Text('تجديد', style: GoogleFonts.cairo(fontSize: 12, fontWeight: FontWeight.bold)),
              ),
              // Edit Member
              IconButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => AddEditMemberScreen(memberToEdit: member)),
                  );
                },
                icon: const Icon(LucideIcons.edit2, color: AppColors.blue, size: 18),
                tooltip: 'تعديل',
              ),
              // Delete Member
              IconButton(
                onPressed: () => _confirmDelete(context, store, member),
                icon: const Icon(LucideIcons.trash2, color: AppColors.red, size: 18),
                tooltip: 'حذف',
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _launchWhatsApp(String phone, String name) async {
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
    final uri = Uri.parse('https://wa.me/$cleanPhone?text=مرحباً $name، نود تذكيرك باشتراكك في القاعة الرياضية.');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _showRenewDialog(BuildContext context, GymStore store, Member member) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cardBg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.border),
        ),
        title: Text(
          'تجديد اشتراك: ${member.fullName}',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 16),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: Text('تجديد شهر واحد (+30 يوم)', style: GoogleFonts.cairo(color: Colors.white)),
              onTap: () {
                store.renewSubscription(member.id, 1);
                Navigator.pop(ctx);
                showAppSnackBar(context, 'تم تجديد الاشتراك لمدة شهر بنجاح!');
              },
            ),
            ListTile(
              title: Text('تجديد 3 أشهر (+90 يوم)', style: GoogleFonts.cairo(color: Colors.white)),
              onTap: () {
                store.renewSubscription(member.id, 3);
                Navigator.pop(ctx);
                showAppSnackBar(context, 'تم تجديد الاشتراك لمدة 3 أشهر بنجاح!');
              },
            ),
            ListTile(
              title: Text('تجديد سنة كاملة (+365 يوم)', style: GoogleFonts.cairo(color: Colors.white)),
              onTap: () {
                store.renewSubscription(member.id, 12);
                Navigator.pop(ctx);
                showAppSnackBar(context, 'تم تجديد الاشتراك لمدة سنة كاملة بنجاح!');
              },
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDelete(BuildContext context, GymStore store, Member member) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cardBg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.border),
        ),
        title: Text(
          'حذف المشترك',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold, color: AppColors.red, fontSize: 16),
        ),
        content: Text(
          'هل أنت متأكد من رغبتك في حذف المشترك "${member.fullName}" وسجلاته بالكامل؟',
          style: GoogleFonts.cairo(color: AppColors.textLight),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('إلغاء', style: GoogleFonts.cairo(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              store.deleteMember(member.id);
              Navigator.pop(ctx);
              showAppSnackBar(context, 'تم حذف المشترك بنجاح');
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.red),
            child: Text('تأكيد الحذف', style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
