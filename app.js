/* -------------------------------------------------------------
   TERRASIGHT AI - APPLICATION LOGIC
   ------------------------------------------------------------- */

// Define standard plant profiles
const PLANT_PROFILES = [
    {
        id: "standard",
        name: "Standard Foliage",
        scientific: "General Chlorophyll Range",
        desc: "Best suited for typical garden plants, grass, weeds, and indoor green leafy plants.",
        iconBg: "linear-gradient(135deg, #10b981, #059669)",
        specs: { light: "Indirect", water: "Medium", soil: "Loamy" },
        hsv: { hueMin: 25, hueMax: 90, satMin: 40, valMin: 40, decayMax: 24 }
    },
    {
        id: "tomato",
        name: "Tomato & Nightshades",
        scientific: "Solanum lycopersicum",
        desc: "Calibrated for crop farming. Sensitive to early blight yellowing and nitrogen depletion.",
        iconBg: "linear-gradient(135deg, #ef4444, #b91c1c)",
        specs: { light: "Full Sun", water: "High", soil: "Rich/Acidic" },
        hsv: { hueMin: 32, hueMax: 85, satMin: 45, valMin: 45, decayMax: 27 }
    },
    {
        id: "monstera",
        name: "Monstera & Philodendrons",
        scientific: "Monstera deliciosa",
        desc: "Designed for deep dark green leaves. Filters out shadows caused by leaf splits.",
        iconBg: "linear-gradient(135deg, #047857, #065f46)",
        specs: { light: "Partial Shade", water: "Low-Med", soil: "Aerate/Peat" },
        hsv: { hueMin: 28, hueMax: 95, satMin: 50, valMin: 30, decayMax: 22 }
    },
    {
        id: "succulent",
        name: "Succulents & Cacti",
        scientific: "Crassulaceae",
        desc: "For pale, waxy, or blue-green leaves. Detects root rot yellowing or watering stress.",
        iconBg: "linear-gradient(135deg, #6366f1, #4f46e5)",
        specs: { light: "Direct Sun", water: "Very Low", soil: "Sandy/Dry" },
        hsv: { hueMin: 35, hueMax: 105, satMin: 25, valMin: 35, decayMax: 28 }
    },
    {
        id: "pothos",
        name: "Variegated Pothos",
        scientific: "Epipremnum aureum",
        desc: "Configured for dual-toned leaves. Prevents natural yellow variegation from triggering disease warnings.",
        iconBg: "linear-gradient(135deg, #eab308, #ca8a04)",
        specs: { light: "Any Light", water: "Medium", soil: "Standard" },
        hsv: { hueMin: 27, hueMax: 88, satMin: 60, valMin: 55, decayMax: 20 }
    }
];

// App State
const state = {
    currentTab: "page-overview",
    activeProfile: PLANT_PROFILES[0],
    history: [],
    uploadedImage: null,
    webcamStream: null,
    canvasData: {
        original: null,
        mask: null
    }
};

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    loadHistory();
    renderPlantLibrary();
    setupEventListeners();
    applyProfileThresholds(state.activeProfile);
    renderHistoryTable();
    renderHistoryChart();
});

// -------------------------------------------------------------
// EVENT LISTENERS & ROUTING
// -------------------------------------------------------------
function setupEventListeners() {
    // Tab Navigation Routing
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = item.getAttribute("data-target");
            switchTab(targetId);
        });
    });

    // Mobile Sidebar Toggle
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebar = document.getElementById("app-sidebar");
    sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

    // Close sidebar on item click (mobile view)
    const sidebarItems = document.querySelectorAll(".nav-item");
    sidebarItems.forEach(item => {
        item.addEventListener("click", () => {
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove("open");
            }
        });
    });

    // Theme Toggle
    const themeBtn = document.getElementById("theme-toggle");
    themeBtn.addEventListener("click", toggleTheme);

    // File Upload Drag and Drop
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");

    dropZone.addEventListener("click", () => fileInput.click());
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });
    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });
    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
            handleUploadedFile(e.dataTransfer.files[0]);
        }
    });
    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleUploadedFile(e.target.files[0]);
        }
    });

    // Webcam source selection tabs
    const tabBtnUpload = document.getElementById("tab-btn-upload");
    const tabBtnWebcam = document.getElementById("tab-btn-webcam");
    const contentUpload = document.getElementById("content-upload");
    const contentWebcam = document.getElementById("content-webcam");

    tabBtnUpload.addEventListener("click", () => {
        tabBtnUpload.classList.add("active");
        tabBtnWebcam.classList.remove("active");
        contentUpload.classList.add("active");
        contentWebcam.classList.remove("active");
        stopWebcam();
    });

    tabBtnWebcam.addEventListener("click", () => {
        tabBtnWebcam.classList.add("active");
        tabBtnUpload.classList.remove("active");
        contentWebcam.classList.add("active");
        contentUpload.classList.remove("active");
    });

    // Webcam Stream Control Buttons
    const btnStartCamera = document.getElementById("btn-start-camera");
    const btnCapturePhoto = document.getElementById("btn-capture-photo");

    btnStartCamera.addEventListener("click", startWebcam);
    btnCapturePhoto.addEventListener("click", captureWebcamPhoto);

    // Threshold Sliders Live Inputs
    const sliders = [
        { id: "slider-hue-min", valId: "val-hue-min" },
        { id: "slider-hue-max", valId: "val-hue-max" },
        { id: "slider-sat-min", valId: "val-sat-min" },
        { id: "slider-val-min", valId: "val-val-min" },
        { id: "slider-decay-ratio", valId: "val-decay-max" }
    ];

    sliders.forEach(s => {
        const sliderEl = document.getElementById(s.id);
        const valEl = document.getElementById(s.valId);
        sliderEl.addEventListener("input", (e) => {
            valEl.innerText = e.target.value;
            // Retrigger analysis if an image is loaded
            if (state.uploadedImage) {
                runAnalysis();
            }
        });
    });

    // Reset sliders button
    const btnResetSliders = document.getElementById("btn-reset-sliders");
    btnResetSliders.addEventListener("click", () => {
        applyProfileThresholds(state.activeProfile);
        if (state.uploadedImage) {
            runAnalysis();
        }
    });

    // Viewport Mode Tabs (Side-by-Side vs Mask Only)
    const viewTabs = document.querySelectorAll(".display-tab-btn");
    const maskContainer = document.getElementById("viewport-mask-container");
    const viewports = document.getElementById("analysis-viewports");

    viewTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            viewTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            const mode = tab.getAttribute("data-view");
            if (mode === "split") {
                viewports.style.gridTemplateColumns = window.innerWidth <= 768 ? "1fr" : "1fr 1fr";
                maskContainer.style.display = "flex";
            } else {
                viewports.style.gridTemplateColumns = "1fr";
                maskContainer.style.display = "flex";
                // Hide original image viewport
                document.querySelector(".viewport-box:first-child").style.display = "none";
                return;
            }
            document.querySelector(".viewport-box:first-child").style.display = "flex";
        });
    });

    // Reset Table History
    const btnClearLogs = document.getElementById("btn-clear-logs");
    btnClearLogs.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear your plant scan history? This cannot be undone.")) {
            state.history = [];
            localStorage.removeItem("terrasight_history");
            renderHistoryTable();
            renderHistoryChart();
            showToast("Scan history cleared successfully.");
        }
    });

    // Print Diagnostics Report
    const btnExportPdf = document.getElementById("btn-export-pdf");
    btnExportPdf.addEventListener("click", exportDiagnosticsReport);
}

// -------------------------------------------------------------
// TAB NAVIGATION ROUTING
// -------------------------------------------------------------
function switchTab(tabId) {
    state.currentTab = tabId;
    
    // Toggle Nav Active state
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        if (item.getAttribute("data-target") === tabId) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // Toggle Page Visibility
    const pages = document.querySelectorAll(".dashboard-page");
    pages.forEach(page => {
        if (page.id === tabId) {
            page.classList.add("active");
        } else {
            page.classList.remove("active");
        }
    });

    // Update Header Title
    const pageTitle = document.getElementById("header-page-title");
    if (tabId === "page-overview") pageTitle.innerText = "Overview Dashboard";
    if (tabId === "page-analyze") pageTitle.innerText = "Computer Vision Leaf Analysis";
    if (tabId === "page-library") pageTitle.innerText = "Crop & Plant Library Profiles";
    if (tabId === "page-help") pageTitle.innerText = "Methodology & Calibration Guide";

    // Clean up webcam if we navigate away from analyze tab
    if (tabId !== "page-analyze") {
        stopWebcam();
    }
}

// -------------------------------------------------------------
// LIGHT/DARK THEME MANAGEMENT
// -------------------------------------------------------------
function initTheme() {
    const savedTheme = localStorage.getItem("terrasight_theme") || "dark";
    if (savedTheme === "light") {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
    } else {
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
    }
}

function toggleTheme() {
    if (document.body.classList.contains("dark-mode")) {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
        localStorage.setItem("terrasight_theme", "light");
        showToast("Switched to Light Mode theme");
    } else {
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
        localStorage.setItem("terrasight_theme", "dark");
        showToast("Switched to Dark Mode theme");
    }
    // Re-render chart to adjust color labels
    renderHistoryChart();
}

// -------------------------------------------------------------
// WEBCAM STREAMING CONTROLS
// -------------------------------------------------------------
async function startWebcam() {
    const video = document.getElementById("webcam-stream");
    const prompt = document.getElementById("webcam-prompt");
    const btnCapture = document.getElementById("btn-capture-photo");

    try {
        state.webcamStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" }, 
            audio: false 
        });
        video.srcObject = state.webcamStream;
        prompt.style.display = "none";
        btnCapture.disabled = false;
        showToast("Camera access granted.");
    } catch (err) {
        console.error("Camera access error: ", err);
        showToast("Failed to access camera. Please upload an image instead.");
    }
}

function stopWebcam() {
    if (state.webcamStream) {
        state.webcamStream.getTracks().forEach(track => track.stop());
        state.webcamStream = null;
    }
    const prompt = document.getElementById("webcam-prompt");
    const btnCapture = document.getElementById("btn-capture-photo");
    if (prompt) prompt.style.display = "flex";
    if (btnCapture) btnCapture.disabled = true;
}

function captureWebcamPhoto() {
    const video = document.getElementById("webcam-stream");
    if (!state.webcamStream) return;

    // Create virtual canvas to capture frame
    const captureCanvas = document.createElement("canvas");
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const ctx = captureCanvas.getContext("2d");
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

    const imgUrl = captureCanvas.toDataURL("image/jpeg");
    const img = new Image();
    img.onload = () => {
        state.uploadedImage = img;
        runAnalysis();
        showToast("Webcam photo captured successfully.");
    };
    img.src = imgUrl;
    
    // Stop camera stream to preserve resource usage
    stopWebcam();
    
    // Toggle active tab back to upload layout to display analysis
    document.getElementById("tab-btn-upload").click();
}

// -------------------------------------------------------------
// IMAGE LOADING & FILE SELECTION
// -------------------------------------------------------------
function handleUploadedFile(file) {
    if (!file.type.startsWith("image/")) {
        showToast("Unsupported file type. Please upload an image file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            state.uploadedImage = img;
            runAnalysis();
            showToast("Image loaded successfully. Analysis complete.");
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// -------------------------------------------------------------
// PLANT LIBRARY RENDERING & SELECTION
// -------------------------------------------------------------
function renderPlantLibrary() {
    const grid = document.getElementById("plant-library-grid");
    grid.innerHTML = "";

    PLANT_PROFILES.forEach(profile => {
        const isActive = profile.id === state.activeProfile.id;
        const card = document.createElement("div");
        card.className = `card plant-card ${isActive ? 'active' : ''}`;
        
        card.innerHTML = `
            <div class="plant-banner" style="background: ${profile.iconBg}">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 3.25 1.55 6.14 3.94 8L12 22l6.06-2C20.45 18.14 22 15.25 22 12c0-5.52-4.48-10-10-10zm0 18H6.5c-.83 0-1.5-.67-1.5-1.5V12h7v8zm0-10H5V6.5c0-.83.67-1.5 1.5-1.5H12v5zm7 8.5c0 .83-.67 1.5-1.5 1.5H12v-8h7v6.5zm0-10H12V5h5.5c.83 0 1.5.67 1.5 1.5V10.03z"/>
                </svg>
            </div>
            <div class="plant-card-body">
                <div class="plant-info">
                    <h3>${profile.name}</h3>
                    <span class="scientific-name">${profile.scientific}</span>
                    <p class="plant-desc">${profile.desc}</p>
                </div>
                
                <div class="plant-specs-grid">
                    <div class="spec-item">
                        <span>Water Needs</span>
                        <strong>${profile.specs.water}</strong>
                    </div>
                    <div class="spec-item">
                        <span>Sunlight</span>
                        <strong>${profile.specs.light}</strong>
                    </div>
                </div>

                <button class="btn ${isActive ? 'btn-secondary' : 'btn-primary'} btn-full" id="btn-select-${profile.id}">
                    ${isActive ? 'Active Profile' : 'Apply Profile Calibration'}
                </button>
            </div>
        `;

        grid.appendChild(card);

        // Bind click event to selection
        const btn = document.getElementById(`btn-select-${profile.id}`);
        btn.addEventListener("click", () => {
            selectPlantProfile(profile.id);
        });
    });
}

function selectPlantProfile(profileId) {
    const profile = PLANT_PROFILES.find(p => p.id === profileId);
    if (!profile) return;

    state.activeProfile = profile;
    
    // Update active pill indicator
    document.getElementById("active-profile-name").innerText = profile.name;
    document.getElementById("overview-profile-name").innerText = profile.name;
    document.getElementById("overview-profile-desc").innerText = profile.desc;

    // Apply profiles thresholds
    applyProfileThresholds(profile);
    
    // Rerender Library Cards
    renderPlantLibrary();
    
    showToast(`Calibrated computer vision presets to: ${profile.name}`);

    // If there is an active image, re-run diagnosis
    if (state.uploadedImage) {
        runAnalysis();
    }
}

function applyProfileThresholds(profile) {
    document.getElementById("slider-hue-min").value = profile.hsv.hueMin;
    document.getElementById("val-hue-min").innerText = profile.hsv.hueMin;

    document.getElementById("slider-hue-max").value = profile.hsv.hueMax;
    document.getElementById("val-hue-max").innerText = profile.hsv.hueMax;

    document.getElementById("slider-sat-min").value = profile.hsv.satMin;
    document.getElementById("val-sat-min").innerText = profile.hsv.satMin;

    document.getElementById("slider-val-min").value = profile.hsv.valMin;
    document.getElementById("val-val-min").innerText = profile.hsv.valMin;

    document.getElementById("slider-decay-ratio").value = profile.hsv.decayMax;
    document.getElementById("val-decay-max").innerText = profile.hsv.decayMax;

    // Sync labels on Overview Page
    document.getElementById("lbl-param-hue-min").innerText = `${profile.hsv.hueMin}°`;
    document.getElementById("lbl-param-hue-max").innerText = `${profile.hsv.hueMax}°`;
}

// -------------------------------------------------------------
// COMPUTER VISION HSV ANALYSIS CORE
// -------------------------------------------------------------
function runAnalysis() {
    const image = state.uploadedImage;
    if (!image) return;

    const originalCanvas = document.getElementById("canvas-original");
    const maskCanvas = document.getElementById("canvas-mask");
    
    // Resize image for optimal scanning (max 400x400 aspect ratio)
    const aspect = image.width / image.height;
    let targetW = 400;
    let targetH = Math.round(targetW / aspect);
    
    originalCanvas.width = targetW;
    originalCanvas.height = targetH;
    maskCanvas.width = targetW;
    maskCanvas.height = targetH;

    const ctxOrig = originalCanvas.getContext("2d");
    const ctxMask = maskCanvas.getContext("2d");

    // Clear placeholders
    document.getElementById("placeholder-orig-text").style.display = "none";
    document.getElementById("placeholder-mask-text").style.display = "none";

    // Draw original immediately
    ctxOrig.drawImage(image, 0, 0, targetW, targetH);
    
    // Clear mask canvas to show active processing state
    ctxMask.fillStyle = "#05070d";
    ctxMask.fillRect(0, 0, targetW, targetH);
    
    // Add laser scanner bar element
    const wrappers = document.querySelectorAll(".canvas-wrapper");
    wrappers.forEach(w => w.classList.add("scanning"));

    // Temporarily lock controls & update diagnostics status to scanning
    document.getElementById("btn-export-pdf").disabled = true;
    document.getElementById("analysis-status-badge").innerText = "Analyzing Feed...";
    document.getElementById("analysis-status-badge").className = "badge badge-info";

    // Run actual calculations after visual scanner sweep (900ms delay)
    setTimeout(() => {
        // Retrieve values from sliders
        const hueMin = parseInt(document.getElementById("slider-hue-min").value);
        const hueMax = parseInt(document.getElementById("slider-hue-max").value);
        const satMin = parseInt(document.getElementById("slider-sat-min").value);
        const valMin = parseInt(document.getElementById("slider-val-min").value);
        const decayMax = parseInt(document.getElementById("slider-decay-ratio").value);

        // Perform processing via canvas pixel inspection
        const origData = ctxOrig.getImageData(0, 0, targetW, targetH);
        const maskData = ctxMask.createImageData(targetW, targetH);
        
        const pixels = origData.data;
        const maskPixels = maskData.data;
        const totalPixels = targetW * targetH;

        let greenCount = 0;
        let decayCount = 0;

        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i+1];
            const b = pixels[i+2];
            
            // Convert to HSV representation
            const hsv = rgbToHsv(r, g, b);
            const h = hsv.h; // 0 to 180 (OpenCV standard)
            const s = hsv.s; // 0 to 255 (OpenCV standard)
            const v = hsv.v; // 0 to 255 (OpenCV standard)

            // Threshold checks
            const isGreen = (h >= hueMin && h <= hueMax && s >= satMin && v >= valMin);
            const isDecay = (!isGreen && h <= decayMax && s >= 40 && v >= 40);

            if (isGreen) {
                greenCount++;
                // Healthy Green Overlay (bright emerald green)
                maskPixels[i] = 16;
                maskPixels[i+1] = 185;
                maskPixels[i+2] = 129;
                maskPixels[i+3] = 255;
            } else if (isDecay) {
                decayCount++;
                // Decay Orange/Yellow Overlay (amber warning)
                maskPixels[i] = 245;
                maskPixels[i+1] = 158;
                maskPixels[i+2] = 11;
                maskPixels[i+3] = 255;
            } else {
                // Ignored Soil/Background (dark slate grey representation)
                maskPixels[i] = 31;
                maskPixels[i+1] = 41;
                maskPixels[i+2] = 55;
                maskPixels[i+3] = 255;
            }
        }

        // Write modified pixels to mask canvas
        ctxMask.putImageData(maskData, 0, 0);

        // Calculate metrics ratios
        const greenRatio = greenCount / totalPixels;
        const decayRatio = decayCount / totalPixels;
        
        // Determine overall status verdict
        let verdict = "Awaiting Input";
        let statusClass = "badge-info";
        let alertDisplay = "none";
        let alertMsg = "";
        
        if (greenRatio > 0.50) {
            verdict = "Healthy Plant";
            statusClass = "badge-success";
        } else if (greenRatio > 0.30 && decayRatio < 0.15) {
            verdict = "Moderately Healthy";
            statusClass = "badge-warning";
        } else {
            verdict = "Unhealthy Plant";
            statusClass = "badge-error";
            alertDisplay = "flex";
            
            if (decayRatio > 0.12) {
                alertMsg = "High Chlorosis (Yellowing) levels detected. Possible Nitrogen deficiency, iron deficiency, or root rot.";
            } else {
                alertMsg = "Low chlorophyll concentration. Check for watering deficiencies or light deprivation.";
            }
        }

        // Update Diagnostics UI Components
        document.getElementById("analysis-status-badge").innerText = verdict;
        document.getElementById("analysis-status-badge").className = `badge ${statusClass}`;
        
        // Update gauges values
        const greenPercentage = Math.round(greenRatio * 100);
        const decayPercentage = Math.round(decayRatio * 100);
        
        document.getElementById("gauge-val-health").innerText = `${greenPercentage}%`;
        document.getElementById("gauge-val-decay").innerText = `${decayPercentage}%`;

        // SVG dashoffsets calculations (stroke-dasharray = 251.2 representing 2 * PI * R where r=40)
        const dashMax = 251.2;
        const greenOffset = dashMax - (greenRatio * dashMax);
        const decayOffset = dashMax - (decayRatio * dashMax);

        document.getElementById("gauge-health-svg").style.strokeDashoffset = greenOffset;
        document.getElementById("gauge-decay-svg").style.strokeDashoffset = decayOffset;

        // Diagnostics descriptions recommendations
        let guidanceText = "";
        if (verdict === "Healthy Plant") {
            guidanceText = `Excellent! The sample shows robust chlorophyll saturation (${greenPercentage}% healthy tissue). Photosynthetic activity is functioning normally. Maintain current watering and sunlight schedules for your ${state.activeProfile.name}.`;
        } else if (verdict === "Moderately Healthy") {
            guidanceText = `Foliage is moderately active. Healthy green pigments represent ${greenPercentage}% of leaf surface. Keep a close eye on dry leaf tips. Ensure consistent soil moisture.`;
        } else {
            guidanceText = `Attention required. Photosynthesis is severely degraded (healthy green covers only ${greenPercentage}%). Soil condition adjustments are advised. We recommend applying liquid fertilizer or testing soil pH parameters.`;
        }
        document.getElementById("analysis-guidance").innerText = guidanceText;

        // Alert Notification Box
        const alertBox = document.getElementById("analysis-alert");
        if (alertDisplay === "flex") {
            alertBox.style.display = "flex";
            document.getElementById("alert-desc").innerText = alertMsg;
        } else {
            alertBox.style.display = "none";
        }

        // Enable export button
        document.getElementById("btn-export-pdf").disabled = false;

        // Remove scanning class
        wrappers.forEach(w => w.classList.remove("scanning"));

        // Add record to history if it's a new unique scan
        const timestamp = new Date().toLocaleString();
        const newRecord = {
            timestamp: timestamp,
            profileName: state.activeProfile.name,
            greenPercentage: greenPercentage,
            decayPercentage: decayPercentage,
            status: verdict,
            statusClass: statusClass
        };
        
        // Append to beginning of state history
        state.history.unshift(newRecord);
        
        // Save to local storage
        saveHistory();

        // Refresh display indicators on the home Dashboard Overview
        renderHistoryTable();
        renderHistoryChart();
        updateOverviewStats();
    }, 900);
}

// Helper: RGB to HSV (returns Hue: 0-180, Sat: 0-255, Val: 0-255 to match OpenCV)
function rgbToHsv(r, g, b) {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const cMax = Math.max(rNorm, gNorm, bNorm);
    const cMin = Math.min(rNorm, gNorm, bNorm);
    const delta = cMax - cMin;

    let h = 0;
    if (delta === 0) {
        h = 0;
    } else if (cMax === rNorm) {
        h = 60 * (((gNorm - bNorm) / delta) % 6);
    } else if (cMax === gNorm) {
        h = 60 * (((bNorm - rNorm) / delta) + 2);
    } else if (cMax === bNorm) {
        h = 60 * (((rNorm - gNorm) / delta) + 4);
    }

    if (h < 0) h += 360;

    const opencvHue = Math.round(h / 2);
    const opencvSat = cMax === 0 ? 0 : Math.round((delta / cMax) * 255);
    const opencvVal = Math.round(cMax * 255);

    return { h: opencvHue, s: opencvSat, v: opencvVal };
}

// -------------------------------------------------------------
// PERSISTENT DATA STORAGE (LOCALSTORAGE)
// -------------------------------------------------------------
function loadHistory() {
    const data = localStorage.getItem("terrasight_history");
    if (data) {
        try {
            state.history = JSON.parse(data);
        } catch (e) {
            state.history = [];
        }
    } else {
        // Seed some mock initial records so user sees data immediately on first launch
        state.history = [
            { timestamp: "2026-06-03 14:20:00", profileName: "Standard Foliage", greenPercentage: 88, decayPercentage: 4, status: "Healthy Plant", statusClass: "badge-success" },
            { timestamp: "2026-06-04 09:15:30", profileName: "Tomato & Nightshades", greenPercentage: 74, decayPercentage: 8, status: "Healthy Plant", statusClass: "badge-success" },
            { timestamp: "2026-06-05 11:45:12", profileName: "Succulents & Cacti", greenPercentage: 42, decayPercentage: 26, status: "Unhealthy Plant", statusClass: "badge-error" }
        ];
        saveHistory();
    }
    updateOverviewStats();
}

function saveHistory() {
    localStorage.setItem("terrasight_history", JSON.stringify(state.history));
}

function updateOverviewStats() {
    if (state.history.length === 0) {
        document.getElementById("overview-avg-health").innerText = "0%";
        document.getElementById("overview-total-scans").innerText = "0";
        document.getElementById("overview-issue-count").innerText = "0";
        return;
    }

    // Total Scans
    document.getElementById("overview-total-scans").innerText = state.history.length;

    // Average Health
    const sumGreen = state.history.reduce((sum, rec) => sum + rec.greenPercentage, 0);
    const avgGreen = Math.round(sumGreen / state.history.length);
    document.getElementById("overview-avg-health").innerText = `${avgGreen}%`;

    // Unhealthy Counts
    const issuesCount = state.history.filter(rec => rec.status === "Unhealthy Plant").length;
    document.getElementById("overview-issue-count").innerText = issuesCount;
}

// -------------------------------------------------------------
// HISTORY LOG TABLE RENDERING
// -------------------------------------------------------------
function renderHistoryTable() {
    const tbody = document.getElementById("table-history-body");
    tbody.innerHTML = "";

    if (state.history.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">No analysis records yet. Go to the "Analyze Leaf" page to begin.</td>
            </tr>
        `;
        return;
    }

    state.history.forEach((record, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${record.timestamp}</td>
            <td><strong>${record.profileName}</strong></td>
            <td>${record.greenPercentage}%</td>
            <td>${record.decayPercentage}%</td>
            <td><span class="badge ${record.statusClass}">${record.status}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="showScanDetail(${index})">
                    View Specs
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showScanDetail(index) {
    const record = state.history[index];
    if (!record) return;
    
    alert(`--- TerraSight AI Analysis Detail ---
Date: ${record.timestamp}
Plant Profile: ${record.profileName}
Healthy Green Area: ${record.greenPercentage}%
Decay/Chlorosis Area: ${record.decayPercentage}%
Verdict Status: ${record.status}`);
}

// -------------------------------------------------------------
// TIMELINE CHART DRAWING (CUSTOM CANVAS LINE CHART)
// -------------------------------------------------------------
function renderHistoryChart() {
    const canvas = document.getElementById("chart-health-history");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    
    // Fit canvas sizing within card
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Chart Settings
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 30;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Detect Theme colors for grid lines
    const isLightMode = document.body.classList.contains("light-mode");
    const gridColor = isLightMode ? "#e2e8f0" : "#1e293b";
    const labelColor = isLightMode ? "#64748b" : "#94a3b8";

    // Draw grid Y lines & percentage markers (0, 25, 50, 75, 100)
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.font = "10px Inter, sans-serif";
    ctx.fillStyle = labelColor;
    ctx.textAlign = "right";

    const yTicks = [0, 25, 50, 75, 100];
    yTicks.forEach(tick => {
        const y = paddingTop + chartHeight - (tick / 100) * chartHeight;
        
        // Draw tick label
        ctx.fillText(`${tick}%`, paddingLeft - 10, y + 3);
        
        // Draw horizontal line
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.stroke();
    });

    // Handle empty state
    if (state.history.length === 0) {
        ctx.textAlign = "center";
        ctx.fillText("No scan trend data to present.", width / 2, height / 2);
        return;
    }

    // Chart Data calculations: draw up to last 10 scans chronologically (left to right)
    const displayRecords = [...state.history].slice(0, 10).reverse();
    const numPoints = displayRecords.length;
    
    const xStep = numPoints > 1 ? chartWidth / (numPoints - 1) : chartWidth;

    // Draw Line representing healthy green index
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#10b981"; // Healthy Emerald Green
    
    // Gradient fill beneath line
    const gradient = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + chartHeight);
    gradient.addColorStop(0, "rgba(16, 185, 129, 0.25)");
    gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");

    // Define coordinate points
    const points = [];
    displayRecords.forEach((rec, idx) => {
        const x = paddingLeft + (idx * xStep);
        const y = paddingTop + chartHeight - (rec.greenPercentage / 100) * chartHeight;
        points.push({ x, y, val: rec.greenPercentage });
    });

    // Draw gradient area
    if (points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, paddingTop + chartHeight);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, paddingTop + chartHeight);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    // Draw primary path
    if (points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
    }

    // Draw data points markers & labels
    points.forEach((p, idx) => {
        // Dot outer circle
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Dot inner dot
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, 2 * Math.PI);
        ctx.fill();

        // Label above point
        ctx.fillStyle = labelColor;
        ctx.textAlign = "center";
        ctx.font = "bold 9px Outfit, sans-serif";
        ctx.fillText(`${p.val}%`, p.x, p.y - 10);

        // Date labels on X-axis (Draw only some to prevent text overlaps)
        ctx.font = "8px Inter, sans-serif";
        const dateStr = displayRecords[idx].timestamp.split(" ")[0].slice(5); // e.g. '06-03'
        ctx.fillText(dateStr, p.x, paddingTop + chartHeight + 18);
    });
}

// -------------------------------------------------------------
// DIAGNOSTIC PDF EXPORT REPORT GENERATOR
// -------------------------------------------------------------
function exportDiagnosticsReport() {
    if (state.history.length === 0) return;
    
    const record = state.history[0]; // Retrieve the latest scan
    const origCanvas = document.getElementById("canvas-original");
    const maskCanvas = document.getElementById("canvas-mask");
    
    const origDataUrl = origCanvas.toDataURL("image/jpeg");
    const maskDataUrl = maskCanvas.toDataURL("image/jpeg");

    // Open clean window optimized for printing report details
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>TerraSight AI - Diagnosis Health Report</title>
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    padding: 40px;
                    color: #1e293b;
                    line-height: 1.5;
                }
                .header {
                    border-bottom: 2px solid #10b981;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #0f172a;
                }
                .logo span { color: #10b981; }
                .report-title {
                    font-size: 20px;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .meta-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }
                .meta-table td {
                    padding: 8px 12px;
                    border: 1px solid #e2e8f0;
                }
                .meta-table td.label {
                    background-color: #f8fafc;
                    font-weight: 600;
                    width: 25%;
                }
                .image-comparison {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .image-box {
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    padding: 10px;
                    text-align: center;
                }
                .image-box img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 4px;
                }
                .image-lbl {
                    font-size: 12px;
                    font-weight: 600;
                    color: #64748b;
                    margin-top: 8px;
                }
                .verdict-box {
                    background-color: #f0fdf4;
                    border-left: 5px solid #10b981;
                    padding: 20px;
                    border-radius: 4px;
                    margin-bottom: 30px;
                }
                .verdict-box.unhealthy {
                    background-color: #fef2f2;
                    border-left-color: #ef4444;
                }
                .verdict-title {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 6px;
                }
                .footer {
                    margin-top: 50px;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 20px;
                    text-align: center;
                    font-size: 11px;
                    color: #94a3b8;
                }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">TerraSight <span>AI</span></div>
                <div class="report-title">Plant Health Diagnostics Audit</div>
            </div>

            <table class="meta-table">
                <tr>
                    <td class="label">Date Generated</td>
                    <td>${record.timestamp}</td>
                    <td class="label">Calibration Profile</td>
                    <td>${record.profileName}</td>
                </tr>
                <tr>
                    <td class="label">Chlorophyll Level</td>
                    <td>${record.greenPercentage}% (Healthy Green Area)</td>
                    <td class="label">Necrosis/Chlorosis Ratio</td>
                    <td>${record.decayPercentage}% (Yellow/Brown area)</td>
                </tr>
            </table>

            <div class="verdict-box ${record.status === 'Unhealthy Plant' ? 'unhealthy' : ''}">
                <div class="verdict-title">Verdict: ${record.status}</div>
                <div>The non-destructive pixel colorimetry scans show that the leaf has an active health index of <strong>${record.greenPercentage}%</strong>. ${
                    record.status === 'Healthy Plant' 
                    ? 'This represents optimal foliage photosynthetic activity.' 
                    : 'This requires immediate intervention. Action should be taken to adjust nitrogen levels, hydration parameters, or light requirements.'
                }</div>
            </div>

            <div class="image-comparison">
                <div class="image-box">
                    <img src="${origDataUrl}" alt="Original Input" />
                    <div class="image-lbl">Original RGB Input Feed</div>
                </div>
                <div class="image-box">
                    <img src="${maskDataUrl}" alt="Analysis Mask" />
                    <div class="image-lbl">CV Pigment Masking Overlay</div>
                </div>
            </div>

            <div class="no-print" style="margin-top: 20px; text-align: center;">
                <button onclick="window.print();" style="padding: 10px 20px; background-color: #10b981; color: white; border: none; font-weight: bold; border-radius: 4px; cursor: pointer;">Print Report / Save as PDF</button>
            </div>

            <div class="footer">
                TerraSight AI is an automated visual plant diagnostics software utility. Author: Ummadala Tharun.
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    showToast("Opening report diagnostic print panel...");
}

// -------------------------------------------------------------
// UTILITY: SHOW TOAST NOTIFICATION
// -------------------------------------------------------------
function showToast(message) {
    const toast = document.getElementById("toast-notification");
    const toastMsg = document.getElementById("toast-message");
    
    toastMsg.innerText = message;
    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}
