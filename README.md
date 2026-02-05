# Contacts & Calls – Mobile Web App

A modern dark-theme contacts and call history app built with **HTML5**, **CSS3**, and **jQuery**. Features local storage for contacts, dynamic call logs, and **voice control** support.

## 🎯 Features

### Core Functionality
- **Contact Management**: Create and manage contacts from scratch (starts empty)
- **Call History**: Automatically logs all calls you make with duration
- **Local Storage**: All contacts and call logs persist using browser localStorage
- **Clean Status Bar**: Only displays battery level (removed time and network symbols)
- **Smart Tabs**: Switch between All (call logs), Missed, and Contacts views
- **Search**: Quickly find contacts by name

### 🎤 Voice Control (New!)
Control your calls hands-free using voice commands:

**During a call:**
- Say **"mute"** - Toggle microphone on/off
- Say **"speaker"** - Toggle speaker phone
- Say **"end"** or **"hang up"** - End the call
- Say **"volume up"** - Increase volume
- Say **"volume down"** - Decrease volume

**Incoming call:**
- Say **"answer"** or **"accept"** - Accept the call
- Say **"reject"** or **"decline"** - Reject the call

### 📱 Device Preview
- Choose from iPhone 14, iPhone 14 Pro, iPhone SE, Pixel 7, Samsung S23, Oppo, or custom sizes
- Toggle fullscreen mode for testing
- Responsive design works on any screen size
- No frame option for testing responsive behavior

## 🚀 Quick Start

### Run locally (desktop)

1. Clone or download this repo
2. Serve with an HTTP server (required for localStorage and PWA):

**Python 3:**
```bash
cd contact-calls-app
python3 -m http.server 8000
```
Then open: **http://localhost:8000**

**Python 2:**
```bash
cd contact-calls-app
python -m SimpleHTTPServer 8000
```

**Node (npx):**
```bash
cd contact-calls-app
npx serve
```

3. Use the **Device preview** dropdown to switch between device frames and test responsive behavior

## 📱 View on Your Phone

1. Start a local server on your computer
2. Find your computer's IP address (e.g. `192.168.1.10`)
3. On your phone (same Wi-Fi network), open: **http://YOUR_IP:8000**

The responsive app will adapt to your phone's screen automatically.

## 🌐 Deploy to GitHub

1. Create a new repository on GitHub (e.g. `contact-calls-app`)
2. Clone it to your computer:
```bash
git clone https://github.com/YOUR_USERNAME/contact-calls-app.git
cd contact-calls-app
```

3. Copy all files (index.html, app.js, styles.css, manifest.json, README.md) into the folder

4. Commit and push:
```bash
git add .
git commit -m "Initial commit: Contact management app with voice control"
git push origin main
```

5. Enable GitHub Pages in repo settings → select `main` branch → save

6. Your app will be live at: **https://YOUR_USERNAME.github.io/contact-calls-app**

## 💾 Data Storage

All contacts and call logs are stored in your browser's localStorage:
- **Contacts**: Saved with name, phone number, and creation date
- **Call logs**: Recorded with contact name, duration, time, and call type
- **Persistent**: Data remains even after closing the browser
- **Private**: Data stays on your device (not sent to any server)

To reset all data, open browser DevTools → Storage → Clear localStorage

## 📋 How to Use

### Create a Contact
1. Tap the **➕** button in the search bar
2. Enter name and phone number
3. Tap **Create Contact**
4. Contact appears in the Contacts tab

### Make a Call
1. Go to **Contacts** tab
2. Tap a contact to see the call screen
3. You'll see a timer, mute/speaker/end buttons
4. Use buttons or **voice commands** to control the call
5. When done, tap **End** button or say **"end"**
6. Call automatically logs with duration

### View Call History
1. Go to **All** tab to see recent calls
2. See call duration and how long ago it was
3. Tap any call to call that contact again

### Voice Commands
- Make sure your browser allows microphone access
- Commands are recognized during calls
- Speak clearly for best results

## 🛠️ Tech Stack

- **HTML5** - Semantic markup, device viewport, PWA manifest
- **CSS3** - Dark theme, flexbox layout, animations
- **jQuery** - DOM manipulation and event handling
- **Web Storage API** - localStorage for persistent data
- **Web Speech API** - Voice recognition for hands-free control
- **Mobile-first** - Responsive design that works on all devices

## 📁 File Structure

```
contact-calls-app/
├── index.html       # Main UI and page structure
├── styles.css       # Dark theme, layouts, animations
├── app.js           # Contact management, calls, voice control
├── manifest.json    # PWA configuration
├── README.md        # This file
└── start-server.sh  # Helper script to run local server
```

## 🎨 Design

- **Dark Theme**: Easy on the eyes, modern look
- **Mobile-First**: Designed for phones first
- **Accessible**: Proper labels and ARIA attributes
- **Smooth Animations**: Modal slide-ups, call screen transitions

## 🚀 Future Improvements

- Incoming call simulation
- Call recording
- Contact groups
- Call forwarding
- Video call preview
- Multiple phone numbers per contact

## 📄 License

MIT - Free to use and modify

## 🤝 Contributing

Feel free to fork, modify, and improve!

---

**Version 2.0** - Now with contact management, call history, and voice control! 🎉
