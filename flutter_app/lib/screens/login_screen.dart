import 'package:flutter/material.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _gymNameController = TextEditingController();
  
  String _phoneNumber = '';
  String _currentLang = 'ar';
  bool _isSignUp = false;
  bool _isLoading = false;
  bool _obscurePassword = true;

  Future<void> _submit() async {
    setState(() => _isLoading = true);
    final supabase = Supabase.instance.client;

    try {
      if (_isSignUp) {
        await supabase.auth.signUp(
          email: _emailController.text.trim(),
          password: _passwordController.text.trim(),
          data: {
            'gym_name': _gymNameController.text.trim(),
            'phone': _phoneNumber,
          },
        );
      } else {
        await supabase.auth.signInWithPassword(
          email: _emailController.text.trim(),
          password: _passwordController.text.trim(),
        );
      }
    } on AuthException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isRtl = _currentLang == 'ar';

    return Directionality(
      textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        backgroundColor: const Color(0xFF121212),
        body: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 450),
              child: Column(
                children: [
                  // قائمة اللغات العصرية والمؤثرات البصرية
                  Align(
                    alignment: Alignment.topRight,
                    child: PopupMenuButton<String>(
                      color: const Color(0xFF1E1E1E),
                      icon: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          border: Border.all(color: const Color(0xFFD2FF1F)),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.language, color: Color(0xFFD2FF1F), size: 18),
                            const SizedBox(width: 6),
                            Text(
                              _currentLang == 'ar' ? 'العربية' : (_currentLang == 'en' ? 'English' : 'Français'),
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                      onSelected: (lang) => setState(() => _currentLang = lang),
                      itemBuilder: (context) => [
                        _buildMenuItem('ar', '🇲🇦  العربية'),
                        _buildMenuItem('en', '🇬🇧  English'),
                        _buildMenuItem('fr', '🇫🇷  Français'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  
                  // اللوجو والعنوان
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFD2FF1F),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.fitness_center, size: 40, color: Colors.black),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 32),

                  // الحقول
                  if (_isSignUp) ...[
                    TextField(
                      controller: _gymNameController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: 'اسم النادي الرياضي *',
                        prefixIcon: Icon(Icons.business, color: Color(0xFFD2FF1F)),
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 16),
                    IntlPhoneField(
                      decoration: const InputDecoration(
                        labelText: 'رقم الواتساب للتواصل',
                        border: OutlineInputBorder(),
                      ),
                      initialCountryCode: 'MA',
                      dropdownTextStyle: const TextStyle(color: Colors.white),
                      style: const TextStyle(color: Colors.white),
                      onChanged: (phone) => _phoneNumber = phone.completeNumber,
                    ),
                    const SizedBox(height: 16),
                  ],

                  TextField(
                    controller: _emailController,
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      labelText: 'البريد الإلكتروني *',
                      prefixIcon: Icon(Icons.email, color: Color(0xFFD2FF1F)),
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),

                  TextField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      labelText: 'كلمة المرور *',
                      prefixIcon: const Icon(Icons.lock, color: Color(0xFFD2FF1F)),
                      suffixIcon: IconButton(
                        icon: Icon(_obscurePassword ? Icons.visibility : Icons.visibility_off, color: Colors.grey),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                      border: const OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 24),

                  ElevatedButton(
                    onPressed: _isLoading ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFD2FF1F),
                      foregroundColor: Colors.black,
                      minimumSize: const Size.fromHeight(50),
                    ),
                    child: _isLoading
                        ? const CircularProgressIndicator(color: Colors.black)
                        : Text(_isSignUp ? 'إنشاء الحساب والدخول' : 'تسجيل الدخول', style: const TextStyle(fontWeight: FontWeight.bold)),
                  ),

                  TextButton(
                    onPressed: () => setState(() => _isSignUp = !_isSignUp),
                    child: Text(
                      _isSignUp ? 'لديك حساب بالفعل؟ سجل الدخول' : 'ليس لديك حساب؟ أنشئ حساباً لناديك',
                      style: const TextStyle(color: Color(0xFFD2FF1F)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  PopupMenuItem<String> _buildMenuItem(String value, String label) {
    return PopupMenuItem<String>(
      value: value,
      child: StatefulBuilder(
        builder: (context, setStateItem) {
          bool isHovered = false;
          return MouseRegion(
            onEnter: (_) => setStateItem(() => isHovered = true),
            onExit: (_) => setStateItem(() => isHovered = false),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
              decoration: BoxDecoration(
                color: isHovered ? const Color(0xFFD2FF1F).withOpacity(0.2) : Colors.transparent,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                label,
                style: TextStyle(
                  color: isHovered ? const Color(0xFFD2FF1F) : Colors.white,
                  fontWeight: isHovered ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
