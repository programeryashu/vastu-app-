# Vastu Compass

A modern mobile application that helps users understand traditional Vastu direction-based guidance and use their phone as a live compass to identify directions.

## Features

### 🧭 Live Compass
- Real-time compass with smooth animations
- Displays current heading in degrees
- Shows all 8 directions (N, NE, E, SE, S, SW, W, NW)
- Direction-specific Vastu information
- Simulation mode for devices without compass sensors

### 🗺️ Direction Guide
- Interactive exploration of all 8 Vastu directions
- Detailed information for each direction
- Traditional names, elements, and deities
- Recommended activities and suitable rooms
- Things to avoid according to traditional principles

### 🏠 Vastu Guide (What Should Go Where?)
- Room and object placement guidance
- 12 different categories (Entrance, Bedroom, Kitchen, etc.)
- Preferred and alternative directions
- Directions traditionally avoided
- Detailed traditional explanations

## Technology Stack

- React Native with Expo
- React Navigation for screen management
- Expo Sensors for compass functionality
- Clean, modular architecture

## Project Structure

```
VastuCompass/
├── App.js                    # Main navigation setup
├── src/
│   ├── screens/             # All screen components
│   │   ├── HomeScreen.js
│   │   ├── CompassScreen.js
│   │   ├── DirectionGuideScreen.js
│   │   ├── DirectionDetailScreen.js
│   │   ├── VastuGuideScreen.js
│   │   └── VastuGuideDetailScreen.js
│   ├── components/          # Reusable components
│   ├── data/                # Vastu data and knowledge base
│   │   ├── vastuDirections.js
│   │   └── vastuGuide.js
│   └── styles/              # Theme and styling
│       └── theme.js
├── assets/                  # App assets
├── package.json
└── app.json
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open the app on your device using Expo Go or run on simulator:
   ```bash
   npm run ios     # for iOS
   npm run android # for Android
   npm run web     # for Web
   ```

## Important Notes

### Traditional Vastu Guidance

This app provides traditional Vastu guidance based on ancient Indian principles. All recommendations are presented as traditional guidance and are not scientifically proven. The app is for educational and informational purposes only.

### Compass Functionality

- On mobile devices, the app uses real compass sensors when available
- On web or devices without compass sensors, a simulation mode is provided
- The simulation mode demonstrates compass functionality for testing

## Future Enhancements

The architecture is designed to support future additions:

- 16 directions
- Vastu Purusha Mandala
- House analysis
- Floor plan upload
- AI Vastu assistant
- Camera-based room analysis
- Personalized Vastu reports
- Multiple languages
- User profiles

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

The Vastu recommendations provided in this app are based on traditional beliefs and practices. They are not scientifically proven and should be considered as cultural and traditional guidance only. Always consult professionals for architectural or design decisions.
