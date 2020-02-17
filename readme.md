# Web-Based Editor

Source code for a web-based WYSIWYG web page editor used to create HMIs displaying live data from external devices.

Totally a learning prototype.

## Goals

- WYSIWYG for positioning controls on web page, with inspiration from WinForms
- Availability of editable controls should be extensible
- How data is pushed into the control should be decided by the application integrator
- A properties panel should be available for editing the properties of the controls/including
- Controls should be able to be absolutely positioned but be able to resize as the page resizes (should support anchoring)
- The control layout should be able to change based on the constraints available (desktop vs mobile)
- Controls can be data-bound to a data source coming from an external device

## Getting Started

To run the current prototype, clone the repository and run:

```bash
npm install
npm run start
```
