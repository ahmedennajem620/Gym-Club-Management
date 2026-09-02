import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';

import 'services/gym_store.dart';
import 'screens/login_screen.dart';
import 'demo_checker.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final gymStore = GymStore();
  await gymStore.initialize();

  runApp(
    ChangeNotifierProvider.value(
      value: gymStore,
      child: const GymApp(),
    ),
  );
}

class GymApp extends StatelessWidget {
  const GymApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Gym Club Management',
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('ar', ''),
      ],
      home: const DemoChecker(
        child: LoginScreen(),
      ),
    );
  }
}