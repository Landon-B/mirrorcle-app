import WidgetKit
import SwiftUI
internal import ExpoWidgets

struct AffirmationWidget: Widget {
  let name: String = "AffirmationWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: name, provider: WidgetsTimelineProvider(name: name)) { entry in
      if #available(iOS 17.0, *) {
        WidgetsEntryView(entry: entry)
          .containerBackground(for: .widget) {}
      } else {
        WidgetsEntryView(entry: entry)
      }
    }
    .configurationDisplayName("Daily Affirmation")
    .description("A new affirmation to inspire you every time you check your phone")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}