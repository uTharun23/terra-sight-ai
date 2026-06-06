import cv2
import argparse
import json
import os
import sys

def main():
    parser = argparse.ArgumentParser(description="TerraSight AI - Plant Health Monitor CLI Tool")
    parser.add_argument("-i", "--image", type=str, default="plant.jpg", help="Path to input plant image")
    parser.add_argument("-s", "--save", type=str, default=None, help="Path to save the analyzed result image")
    parser.add_argument("-m", "--save-mask", type=str, default=None, help="Path to save the generated green mask")
    parser.add_argument("-j", "--json", action="store_true", help="Output results in JSON format")
    parser.add_argument("--headless", action="store_true", help="Run without showing GUI display windows")
    parser.add_argument("--lower", type=int, nargs=3, default=[25, 40, 40], help="Lower HSV bound for green color detection (H S V)")
    parser.add_argument("--upper", type=int, nargs=3, default=[90, 255, 255], help="Upper HSV bound for green color detection (H S V)")
    
    args = parser.parse_args()
    
    # Verify image file exists
    if not os.path.exists(args.image):
        error_msg = f"Error: Image file '{args.image}' not found."
        if args.json:
            print(json.dumps({"error": error_msg}))
        else:
            print(error_msg, file=sys.stderr)
        sys.exit(1)
        
    # Read image
    image = cv2.imread(args.image)
    if image is None:
        error_msg = f"Error: Failed to load image '{args.image}'. It may be corrupted or in an unsupported format."
        if args.json:
            print(json.dumps({"error": error_msg}))
        else:
            print(error_msg, file=sys.stderr)
        sys.exit(1)
        
    # Resize for standard processing & display size
    h, w = image.shape[:2]
    aspect_ratio = w / h
    target_width = 400
    target_height = int(target_width / aspect_ratio)
    processed_img = cv2.resize(image, (target_width, target_height))
    
    # Convert to HSV
    hsv = cv2.cvtColor(processed_img, cv2.COLOR_BGR2HSV)
    
    # Parse bounds
    lower_green = tuple(args.lower)
    upper_green = tuple(args.upper)
    
    # Mask green areas
    mask = cv2.inRange(hsv, lower_green, upper_green)
    
    # Calculate percentage of green
    green_pixels = cv2.countNonZero(mask)
    total_pixels = processed_img.shape[0] * processed_img.shape[1]
    green_ratio = green_pixels / total_pixels
    
    # Determine plant health status based on green ratio (standard threshold: 50% green)
    if green_ratio > 0.5:
        status = "Healthy Plant"
        color = (0, 255, 0) # Green text for healthy
    else:
        status = "Unhealthy Plant"
        color = (0, 0, 255) # Red text for unhealthy
        
    # Create copy of processed image to draw overlay on
    overlay_img = processed_img.copy()
    cv2.putText(overlay_img, f"{status} ({green_ratio*100:.1f}%)", (15, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2, cv2.LINE_AA)
                
    # Prepare outputs
    results = {
        "input_image": args.image,
        "width": w,
        "height": h,
        "green_pixels": green_pixels,
        "total_pixels": total_pixels,
        "green_ratio": round(green_ratio, 4),
        "green_percentage": round(green_ratio * 100, 2),
        "status": status,
        "lower_threshold": list(lower_green),
        "upper_threshold": list(upper_green)
    }
    
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print("====== TerraSight AI Analysis Report ======")
        print(f"File Analysed: {args.image}")
        print(f"Dimensions: {w}x{h}")
        print(f"Green Ratio  : {green_ratio*100:.2f}%")
        print(f"Verdict      : {status}")
        print("===========================================")
        
    # Save files if requested
    if args.save:
        cv2.imwrite(args.save, overlay_img)
    if args.save_mask:
        cv2.imwrite(args.save_mask, mask)
        
    # Show GUI windows if not headless
    if not args.headless:
        cv2.imshow("TerraSight AI - Analysis Overlay", overlay_img)
        cv2.imshow("TerraSight AI - Green Mask", mask)
        print("Press any key in the OpenCV windows to exit...")
        cv2.waitKey(0)
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()