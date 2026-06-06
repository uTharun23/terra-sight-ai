# 🌱 TerraSight AI – Intelligent Plant Health Monitoring System

[![Live Demo](https://img.shields.io/badge/🌿%20Live%20Demo-Visit%20Now-22C55E?style=for-the-badge\&logo=vercel\&logoColor=white)](https://terra-sight-ai-3zns.vercel.app/)

### AI-Powered Plant Health Analysis Using Computer Vision & Colorimetry 🚀

**Live Application:**
https://terra-sight-ai-3zns.vercel.app/

---

## 📖 About the Project

TerraSight AI is an intelligent plant health monitoring system that leverages Computer Vision and colorimetric analysis to assess crop and houseplant health non-destructively. By analyzing leaf pigmentation in the HSV (Hue, Saturation, Value) color space, the system identifies healthy vegetation, chlorosis (yellowing), and potential signs of nutrient deficiencies or plant stress.

The project combines a modern interactive web dashboard with a powerful Python-based computer vision tool, enabling users to perform real-time diagnostics through image uploads, webcam feeds, and automated command-line analysis. TerraSight AI provides a simple, accessible, and technology-driven approach to early plant health assessment for students, researchers, hobbyists, and smart agriculture enthusiasts.

---

## 🎯 Project Objective

The objective of TerraSight AI is to provide an accessible and lightweight solution for monitoring plant health through image analysis. The system helps users detect early signs of stress, nutrient deficiencies, and leaf discoloration without requiring expensive agricultural equipment, making plant diagnostics more efficient through computer vision and automation.

---

## 🌟 Key Features

### 🌿 Real-Time Plant Diagnostics

Analyze plant leaves instantly using image uploads or webcam feeds.

### 📷 Computer Vision-Based Analysis

Detect healthy vegetation, chlorosis, and leaf discoloration through HSV color segmentation.

### 🎛️ Interactive Web Dashboard

Premium single-page dashboard with responsive layouts and real-time analytics.

### 📊 Dynamic Health Metrics

Visualize healthy vs unhealthy tissue percentages using interactive gauges and charts.

### 🔬 Plant Profile Calibration

Choose optimized analysis settings for:

* Standard Foliage
* Tomato Plants
* Monstera
* Succulents
* Pothos

### 🎥 Webcam Monitoring

Perform live diagnostics directly from your device camera.

### 📄 Professional Reports

Generate print-friendly diagnostic reports for analysis and documentation.

### ⚙️ Python CLI Automation

Batch-process plant images and export results in machine-readable JSON format.

### 🌙 Modern User Experience

Dark mode, animated diagnostics, ambient effects, and premium dashboard styling.

---

## 🏆 Core Capabilities

| Module                     | Functionality                             |
| -------------------------- | ----------------------------------------- |
| 🌿 Plant Health Analysis   | Detect healthy and unhealthy leaf regions |
| 📷 Webcam Diagnostics      | Real-time plant monitoring                |
| 📊 Health Dashboard        | Interactive visual analytics              |
| 🔬 HSV Segmentation Engine | Advanced colorimetric analysis            |
| 📄 PDF Reporting           | Generate professional reports             |
| ⚙️ CLI Automation Tool     | Batch image processing                    |
| 📈 Timeline Analytics      | Track plant health metrics                |
| 🎛️ Plant Profile System   | Species-specific calibration              |

---

## 🛠️ Technologies Used

Built using modern web technologies and computer vision frameworks to deliver accurate plant diagnostics and an interactive user experience.

### 👁️ Computer Vision & AI

* OpenCV
* HSV Color Space Analysis
* Image Thresholding
* Pixel-Level Colorimetry

### 🐍 Backend & Processing

* Python 3
* NumPy

### 🌐 Frontend Development

* HTML5
* CSS3
* JavaScript (ES6)

### 📊 Visualization & Analytics

* HTML5 Canvas
* Dynamic Charts
* Interactive Gauges

### ☁️ Deployment

* Vercel

---

## 🚀 Key Highlights

✅ Real-Time Plant Monitoring

✅ Computer Vision Diagnostics

✅ Crop & Houseplant Analysis

✅ Interactive Dashboard

✅ Webcam Integration

✅ Automated Report Generation

✅ JSON Data Export

✅ Responsive Design

✅ Smart Agriculture Application

---

## 📂 Project Structure

```text
TerraSight_AI/
│
├── .gitignore
├── vercel.json
├── index.html
├── styles.css
├── app.js
├── plant_monitor.py
├── requirements.txt
├── plant.png
├── plant.jpg
└── README.md
```

---

## 🌐 Running the Web Dashboard

The web dashboard runs entirely client-side and requires no backend services.

### Open Directly

Simply open:

```bash
index.html
```

in any modern browser.

### Local Server (Recommended)

```bash
python -m http.server 8000
```

or

```bash
npx serve .
```

Then visit:

```text
http://localhost:8000
```

---

## 🐍 Running the Python CLI Tool

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Execute

```bash
python plant_monitor.py
```

### Get Help

```bash
python plant_monitor.py --help
```

---

## ⚙️ Command-Line Options

| Option        | Description             |
| ------------- | ----------------------- |
| `--image`     | Input image path        |
| `--save`      | Save processed image    |
| `--save-mask` | Save binary mask        |
| `--json`      | Export JSON results     |
| `--headless`  | Disable GUI windows     |
| `--lower`     | Custom HSV lower bounds |
| `--upper`     | Custom HSV upper bounds |

### Example Commands

```bash
python plant_monitor.py --image plant.png --save-mask mask.png --headless
```

```bash
python plant_monitor.py --image plant.png --json
```

---

## 🔍 Methodology

TerraSight AI performs image analysis by converting RGB images into the HSV color space.

### Hue (H)

Represents pigment information and helps distinguish healthy green vegetation from yellow or brown tissue.

### Saturation (S)

Measures color intensity and filters dull or irrelevant regions.

### Value (V)

Represents brightness and helps remove shadows and dark artifacts.

By combining these channels, the system isolates chlorophyll-rich regions and calculates plant health indicators with improved reliability compared to standard RGB analysis.

---

## 🌟 Why This Project Stands Out

Unlike traditional plant monitoring demonstrations, TerraSight AI combines:

* Computer Vision
* Interactive Dashboard
* Webcam Diagnostics
* Plant Profile Calibration
* CLI Automation
* PDF Reporting
* Real-Time Analytics

into a single unified platform.

This creates a practical smart agriculture solution capable of assisting hobbyists, students, researchers, and agricultural enthusiasts in monitoring plant health efficiently.

---

## 👨‍💻 Developed By

### Ummadala Tharun

🎓 B.Tech Information Technology Student

💻 Python Developer | Full Stack Enthusiast | AI & Computer Vision Builder

📧 [tharunummadala@gmail.com](mailto:tharunummadala@gmail.com)

🔗 GitHub: https://github.com/uTharun23

🔗 LinkedIn: https://www.linkedin.com/in/tharunummadala

---

## 📜 License

This project was developed by **Ummadala Tharun** for educational, research, and portfolio demonstration purposes.

Copyright © 2026 Ummadala Tharun. All Rights Reserved.

This repository showcases expertise in:

* 🌱 Smart Agriculture Solutions
* 👁️ Computer Vision
* 🤖 Artificial Intelligence Applications
* 🐍 Python Development
* 📊 Image Processing & Analytics
* 🌐 Frontend Web Development

Unauthorized commercial redistribution or reproduction of this project without prior permission is prohibited.

---

### 🌟 TerraSight AI

**Empowering Smarter Plant Health Monitoring Through Computer Vision and Intelligent Diagnostics.**

🚀 Developed by Ummadala Tharun
