# Testing Scripts

This folder contains utility scripts to help with testing and development.

## Auto-fill DG Operations Form

### Usage

1. **Open the DG Operations page** in your browser (http://localhost:3000/dg-operations)

2. **Open Browser Developer Tools** (Press F12 or Right-click → Inspect)

3. **Go to Console tab**

4. **Copy and paste the entire content** of `autofill-dg-form.js` into the console

5. **Press Enter** to execute

### What it does:

The script will automatically fill the following fields with test data:

- Testing Hours (From/To)
- Testing Progressive Hours
- Load Hours From
- Testing Hours To (2nd)
- Load Progressive Hours
- Hours Meter Reading
- Oil Level in Diesel Tank
- Lube Oil Level in Engine
- Oil Stock in Store
- Lube Oil Stock in Store
- Oil Filled in Liters
- Battery Condition
- Oil Pressure
- Oil Temperature
- On Duty Staff
- Remarks

### Fields you still need to fill manually:

- **Date & Time** (required)
- **Shift** (required)
- **EOD in Shift** (optional - dropdown or custom)

### Alternative: Bookmark Method

You can create a bookmarklet for even faster access:

1. Create a new bookmark in your browser
2. Set the name to: "Auto-fill DG Form"
3. Set the URL to the minified version below (all on one line):

```javascript
javascript: (function () {
  const d = {
    testingHrsFrom: "08:30",
    testingHrsTo: "09:30",
    testingProgressiveHrs: "1.5",
    loadHrsFrom: "10:00",
    testingHrsToSecond: "2.5",
    loadProgressiveHrs: "500",
    hrsMeterReading: "12500",
    oilLevelInDieselTank: "750",
    lubeOilLevelInEngine: "15",
    oilStockInStore: "5000",
    lubeOilStockInStore: "200",
    oilFilledInLiters: "100",
    batteryCondition: "Good",
    oilPressure: "45",
    oilTemperature: "85",
    onDutyStaff: "Test Operator",
    remarks: "Auto-filled test data",
  };
  Object.keys(d).forEach((f) => {
    const i = document.getElementById(f);
    if (i) {
      const s = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      s.call(i, d[f]);
      i.dispatchEvent(new Event("input", { bubbles: true }));
      i.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
  console.log("✨ Form auto-filled!");
})();
```

4. Save the bookmark
5. When on the DG Operations page, just click the bookmark!

### Tips:

- Adjust the test data values in the script as needed
- The script respects React's state management
- All numeric fields use realistic testing values
- Battery condition is set to "Good" by default
