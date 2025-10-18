// Auto-fill DG Operations Form for Testing
// Run this script in browser console when on the DG Operations page

(function () {
  console.log("🚀 Auto-filling DG Operations form...");

  const testData = {
    // Skip: date, shift, eodInShift (as requested)
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

  let filled = 0;
  let skipped = 0;

  Object.keys(testData).forEach((fieldName) => {
    const input = document.getElementById(fieldName);
    if (input) {
      // Trigger React state update
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;

      nativeInputValueSetter.call(input, testData[fieldName]);

      // Dispatch events to trigger React handlers
      const event = new Event("input", { bubbles: true });
      input.dispatchEvent(event);

      const changeEvent = new Event("change", { bubbles: true });
      input.dispatchEvent(changeEvent);

      filled++;
      console.log(`✅ Filled: ${fieldName} = ${testData[fieldName]}`);
    } else {
      skipped++;
      console.warn(`⚠️  Field not found: ${fieldName}`);
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Filled: ${filled} fields`);
  console.log(`   ⚠️  Skipped: ${skipped} fields`);
  console.log(
    `   ℹ️  Remember to fill: Date/Time, Shift, and EOD in Shift manually`
  );
  console.log(`\n✨ Auto-fill complete!`);
})();
