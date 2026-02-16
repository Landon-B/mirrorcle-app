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
            Color(red: 168/255, green: 85/255, blue: 247/255)
          }
      } else {
        AffirmationWidgetPlaceholder()
          .containerBackground(for: .widget) {
            Color(red: 168/255, green: 85/255, blue: 247/255)
          }
      }
    }
    .configurationDisplayName("Daily Affirmation")
    .description("A new affirmation to inspire you every time you check your phone")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    .contentMarginsDisabled()
  }
}

struct AffirmationWidgetPlaceholder: View {
  var body: some View {
    VStack(spacing: 8) {
      Text("mirrorcle")
        .font(.system(size: 10, weight: .medium, design: .rounded))
        .foregroundColor(Color(red: 236/255, green: 72/255, blue: 153/255))
      Spacer()
      Text("I am worthy of love and respect")
        .font(.system(size: 18, weight: .bold, design: .rounded))
        .foregroundColor(.white)
        .multilineTextAlignment(.center)
        .padding(.horizontal, 4)
      Spacer()
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .padding(20)
    .background(Color(red: 168/255, green: 85/255, blue: 247/255))
  }
}
