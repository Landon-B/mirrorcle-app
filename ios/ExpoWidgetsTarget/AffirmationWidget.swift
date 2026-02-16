import WidgetKit
import SwiftUI
internal import ExpoWidgets

struct AffirmationWidget: Widget {
  let name: String = "AffirmationWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: name, provider: WidgetsTimelineProvider(name: name)) { entry in
      WidgetsEntryView(entry: entry)
    }
    .configurationDisplayName("Daily Affirmation")
    .description("A gentle reminder to pause, breathe, and reflect")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}