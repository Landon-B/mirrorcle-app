import WidgetKit
import SwiftUI
internal import ExpoWidgets

struct AffirmationWidget: Widget {
  let name: String = "AffirmationWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: name, provider: WidgetsTimelineProvider(name: name)) { entry in
      if let node = entry.node {
        WidgetsDynamicView(source: entry.source, kind: .widget, node: node)
          .containerBackground(for: .widget) {
            Color(red: 245/255, green: 242/255, blue: 238/255)
          }
      } else {
        AffirmationWidgetPlaceholder()
          .containerBackground(for: .widget) {
            Color(red: 245/255, green: 242/255, blue: 238/255)
          }
      }
    }
    .configurationDisplayName("Daily Affirmation")
    .description("A gentle reminder to pause, breathe, and reflect")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    .contentMarginsDisabled()
  }
}

struct AffirmationWidgetPlaceholder: View {
  private let cream = Color(red: 245/255, green: 242/255, blue: 238/255)
  private let terracotta = Color(red: 193/255, green: 118/255, blue: 102/255)
  private let terracottaLight = Color(red: 232/255, green: 160/255, blue: 144/255)
  private let textDark = Color(red: 45/255, green: 42/255, blue: 38/255)
  private let textMuted = Color(red: 176/255, green: 170/255, blue: 162/255)
  private let accentPeach = Color(red: 232/255, green: 208/255, blue: 198/255)
  private let creamDark = Color(red: 237/255, green: 232/255, blue: 226/255)

  var body: some View {
    ZStack {
      cream

      // Decorative circle — top right
      VStack {
        HStack {
          Spacer()
          Circle()
            .fill(accentPeach.opacity(0.3))
            .frame(width: 100, height: 100)
            .offset(x: 20, y: -20)
        }
        Spacer()
      }

      // Decorative circle — bottom left
      VStack {
        Spacer()
        HStack {
          Circle()
            .fill(creamDark.opacity(0.5))
            .frame(width: 80, height: 80)
            .offset(x: -30, y: 30)
          Spacer()
        }
      }

      // Main content
      VStack(alignment: .leading, spacing: 10) {
        // Brand label
        HStack(spacing: 6) {
          RoundedRectangle(cornerRadius: 2)
            .fill(terracotta)
            .frame(width: 14, height: 3)
          Text("MIRRORCLE")
            .font(.system(size: 10, weight: .semibold))
            .foregroundColor(textMuted)
            .kerning(2)
        }

        Spacer()

        // Affirmation text
        Text("I am worthy of love and respect")
          .font(.custom("Georgia", size: 20))
          .foregroundColor(textDark)
          .lineSpacing(6)
          .lineLimit(5)

        Spacer()

        // Bottom accent bar
        HStack(spacing: 12) {
          RoundedRectangle(cornerRadius: 2)
            .fill(terracotta)
            .frame(width: 32, height: 3)
          RoundedRectangle(cornerRadius: 2)
            .fill(terracottaLight.opacity(0.6))
            .frame(width: 16, height: 3)
        }
      }
      .padding(20)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
}
