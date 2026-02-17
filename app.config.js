import 'dotenv/config';

export default {
  expo: {
    name: "mirrorcle-ios",
    slug: "mirrorcle-ios",
    version: "2.0.0",
    scheme: "mirrorcle",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#F5F2EE"
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "Mirrorcle needs camera access to show your reflection during affirmation sessions.",
        NSSpeechRecognitionUsageDescription: "Mirrorcle uses speech recognition to help with affirmation practice.",
        NSMicrophoneUsageDescription: "Mirrorcle needs microphone access to listen during affirmation sessions.",
        NSPhotoLibraryUsageDescription: "Mirrorcle may save session photos to your library."
      },
      buildNumber: "6",
      bundleIdentifier: "com.anonymous.mirrorcleios"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#F5F2EE"
      },
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ],
      package: "com.anonymous.mirrorcleios"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#C17666"
        }
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Mirrorcle needs camera access for mirror sessions."
        }
      ],
      [
        "@react-native-voice/voice",
        {
          microphonePermission: "Mirrorcle needs microphone access to listen during affirmation sessions.",
          speechRecognitionPermission: "Mirrorcle uses speech recognition to highlight your affirmations."
        }
      ],
      [
        "expo-widgets",
        {
          bundleIdentifier: "com.anonymous.mirrorcleios.widgets",
          groupIdentifier: "group.com.anonymous.mirrorcleios",
          widgets: [
            {
              name: "AffirmationWidget",
              displayName: "Daily Affirmation",
              description: "A gentle reminder to pause, breathe, and reflect",
              supportedFamilies: ["systemSmall", "systemMedium", "systemLarge"]
            }
          ]
        }
      ]
    ],
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_API_KEY,
      eas: {
        projectId: "3473c6ed-a607-4017-9c40-f224d4543c01"
      }
    }
  }
};
