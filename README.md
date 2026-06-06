# TerraSight AI – Plant Monitoring Dashboard & CLI Tool

TerraSight AI is an intelligent computer vision application designed to evaluate crop and houseplant health non-destructively. By utilizing pixel-level colorimetry analysis in the HSV (Hue, Saturation, Value) color space, the system isolates chlorophyll signatures to detect signs of early plant disease, necrosis, or chlorosis (yellowing leaves) due to watering and nutrient deficiencies.

This project has been enhanced from a simple demonstration script into a professional dual-system:
1. **Interactive Web Dashboard**: A premium, responsive single-page web app built with modern HTML5, Vanilla CSS, and JavaScript. Runs entirely client-side for zero-dependency real-time analysis (supports drag-and-drop file upload, live webcam diagnostics, plant profile presets, and PDF report printing).
2. **Robust Python CLI Tool**: A command-line utility with advanced argument configuration, custom thresholds support, automated image saving, and machine-readable JSON data outputs.

---

## 🌟 Key Features

* **Real-time Colorimetry Segmentation**: Extracts healthy green foliage versus unhealthy yellow/brown leaf tissue.
* **Standard Plant Profiles Calibration**: Choose between preset profiles (Standard Foliage, Tomato, Monstera, Succulent, Pothos) that automatically tune the HSV color bounds for specific leaf characteristics.
* **Dual-View Analysis Matrix**: View the original input feed side-by-side with the isolated AI diagnostic mask.
* **Webcam Diagnostic Streams**: Directly stream and capture frames from an integrated camera/webcam to audit live leaves in the field.
* **Dynamic Diagnostics Gauges**: Interactive dashboard meters showcasing percentage ratios of healthy green vs. chlorosis/decay.
* **Interactive Statistics Timeline**: View the progression of plant health indices across recent runs on an custom-rendered SVG/Canvas chart.
* **Professional Audit Reports**: Generate print-optimized diagnostic pages and save them as PDFs.
* **Automated CLI Execution**: Batch analyze images headlessly, export results into JSON format, and save masks programmatically.

---

## 📂 Project Structure

```text
TerraSight_AI/
├── index.html          # Web dashboard layout structure
├── styles.css          # Premium theme styling, glassmorphism UI, & animations
├── app.js              # Routing, canvas pixel calculations, and chart drawing
├── plant_monitor.py    # Python CLI computer vision tool (OpenCV)
├── requirements.txt    # Python packages dependencies listing
├── plant.png           # Sample leaf image (Generated PNG)
├── plant.jpg           # Sample leaf image (JPEG copy)
└── README.md           # Professional project documentation
```

---

## 🌐 1. Running the Web Dashboard

The web dashboard is fully client-side and does not require active server runtimes.

### Option A: Local Browser Launch
* Locate `index.html` inside the project folder.
* Double-click the file to open it in any modern browser (Chrome, Edge, Firefox, Safari).

### Option B: Local Development Server
To use the live webcam feature reliably, some browsers require a secure context (HTTPS or localhost). You can spin up a quick local web server:
```powershell
# Using Python built-in server
python -m http.server 8000

# Using Node.js npx
npx serve .
```
Then navigate to `http://localhost:8000` or `http://localhost:3000` in your web browser.

---

## 🐍 2. Running the Python CLI Tool

The CLI tool utilizes OpenCV to process local image files.

### Installation
Ensure Python 3.8+ is installed on your system. Run:
```powershell
pip install -r requirements.txt
```

### Usage
Run the script using python. If executed without arguments, it loads the default `plant.jpg` image in the workspace:
```powershell
python plant_monitor.py
```

### Command-Line Arguments
The CLI tool is fully configurable:
```powershell
python plant_monitor.py --help
```

* **`-i`, `--image <path>`**: Path to input image (default: `plant.jpg`).
* **`-s`, `--save <path>`**: Save the processed image with status text overlay.
* **`-m`, `--save-mask <path>`**: Save the black-and-white binary threshold mask.
* **`-j`, `--json`**: Output results in machine-readable JSON format instead of printing report text.
* **`--headless`**: Run headlessly without popping up OpenCV GUI windows (ideal for scripts/CI pipelines).
* **`--lower <H S V>`**: Custom lower HSV range boundary (default: `25 40 40`).
* **`--upper <H S V>`**: Custom upper HSV range boundary (default: `90 255 255`).

#### Examples:
```powershell
# Run headlessly and save the output mask
python plant_monitor.py --image plant.png --save-mask mask_output.png --headless

# Get analysis metrics in JSON format using custom HSV bounds
python plant_monitor.py --image plant.png --json --lower 30 50 50 --upper 85 255 255
```

---

## 🔍 Methodology Details

Colors are analyzed by converting standard RGB images into the **HSV (Hue, Saturation, Value)** model. Unlike RGB, HSV separates color hue (pigment) from saturation (color concentration) and value (lighting/intensity):
* **Hue (H)**: Measured from 0° to 180° in OpenCV. Healthy chlorophyll registers in the green range (typically 25°–90°). Yellowing decay registers in the lower range (typically 0°–24°).
* **Saturation (S) & Value (V)**: Scaled from 0 to 255. By filtering out low Saturation (dull/grayish colors) and low Value (deep shadows), the algorithm ignores non-leaf objects such as dry soil, shadows, and plant pots.

---

## 📝 Credits
* **Author**: Ummadala Tharun
* **Technologies**: Python, OpenCV, Javascript, HTML5 Canvas, CSS Grid/Variables.
