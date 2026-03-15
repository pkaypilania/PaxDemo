# PAX Demo App

[![Platform](https://img.shields.io/badge/platform-Android-green)](https://developer.android.com/)
[![React Native](https://img.shields.io/badge/React%20Native-0.84-blue)](https://reactnative.dev/)
[![Use Case](https://img.shields.io/badge/use%20case-Pax%20Sdk-orange)](#)

This repository is a reference React Native integration for PAX devices using the New Architecture. It is designed for two audiences:

- clients who need to see the end-to-end demo flows on a PAX terminal
- developers who want a clean, public codebase showing how to structure a PAX integration with TurboModules, typed service boundaries, and mock-mode fallbacks

## What The Demo Covers

- SDK capability detection at startup
- real device mode on supported PAX environments
- automatic mock mode on unsupported devices or when the PAX SDK artifact is not bundled
- sale flow with amount input
- refund flow with amount input
- barcode scanning
- receipt printing with a built-in HTML receipt template
- raw response inspection for each action

## Architecture

The demo intentionally separates the app into clear layers:

- `src/specs`: TurboModule codegen spec
- `src/services/pax`: typed runtime service, native provider, and mock provider
- `src/features/demo`: demo screen, demo receipt template, and controller logic
- `android/app/src/main/java/com/paxdemo/pax`: Android TurboModule package and native PAX adapter boundary

JS uses a single service interface. The UI does not know whether it is talking to the real device provider or the mock provider.

## Real Mode Versus Mock Mode

The app detects runtime support on startup.

Real mode requires:

- Android
- a supported PAX environment
- PAX SDK classes bundled into the Android app

If any of those requirements are missing, the app switches to mock mode and still demonstrates all flows with realistic responses.

## Adding The PAX SDK

This repository is safe to publish publicly because it does not embed private vendor artifacts.

To enable native mode, place the required PAX SDK `.jar` or `.aar` files in:

```text
android/app/libs/
```

The Android build is already configured to package artifacts from that directory.

If your integration uses the POSLink SDK, ensure the SDK classes are available to the app at runtime. The demo's Android native layer checks for those classes reflectively before enabling native mode.

## Receipt Printing Template

The print demo uses a built-in HTML receipt template. It is intentionally simple to replace:

- store header
- address
- timestamp
- terminal and invoice data
- line items
- totals
- payment summary
- thank-you footer

Replace the template in `src/features/demo/demoReceipt.ts` with your own branding or receipt schema.

## Running The Project

### Android

```sh
npm install
npm start
npm run android
```
