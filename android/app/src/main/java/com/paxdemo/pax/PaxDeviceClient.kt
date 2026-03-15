package com.paxdemo.pax

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

data class PaxCapabilities(
    val platform: String,
    val runtimeMode: String,
    val isNativeSupported: Boolean,
    val isSdkAvailable: Boolean,
    val canInitialize: Boolean,
    val canTransact: Boolean,
    val canScan: Boolean,
    val canPrint: Boolean,
    val manufacturer: String,
    val model: String,
    val sdkVersion: String,
    val reason: String,
) {
  fun toWritableMap(): WritableMap =
      Arguments.createMap().apply {
        putString("platform", platform)
        putString("runtimeMode", runtimeMode)
        putBoolean("isNativeSupported", isNativeSupported)
        putBoolean("isSdkAvailable", isSdkAvailable)
        putBoolean("canInitialize", canInitialize)
        putBoolean("canTransact", canTransact)
        putBoolean("canScan", canScan)
        putBoolean("canPrint", canPrint)
        putString("manufacturer", manufacturer)
        putString("model", model)
        putString("sdkVersion", sdkVersion)
        putString("reason", reason)
      }
}

data class PaxInitResult(
    val success: Boolean,
    val runtimeMode: String,
    val message: String,
    val deviceId: String,
    val serialNumber: String,
    val sdkVersion: String,
    val rawResponse: String,
) {
  fun toWritableMap(): WritableMap =
      Arguments.createMap().apply {
        putBoolean("success", success)
        putString("runtimeMode", runtimeMode)
        putString("message", message)
        putString("deviceId", deviceId)
        putString("serialNumber", serialNumber)
        putString("sdkVersion", sdkVersion)
        putString("rawResponse", rawResponse)
      }
}

data class PaxTransactionRequest(
    val amount: String,
    val referenceId: String,
)

data class PaxTransactionResult(
    val success: Boolean,
    val runtimeMode: String,
    val type: String,
    val amount: String,
    val transactionId: String,
    val referenceId: String,
    val authorizationCode: String,
    val cardType: String,
    val maskedPan: String,
    val responseCode: String,
    val message: String,
    val timestamp: String,
    val rawResponse: String,
) {
  fun toWritableMap(): WritableMap =
      Arguments.createMap().apply {
        putBoolean("success", success)
        putString("runtimeMode", runtimeMode)
        putString("type", type)
        putString("amount", amount)
        putString("transactionId", transactionId)
        putString("referenceId", referenceId)
        putString("authorizationCode", authorizationCode)
        putString("cardType", cardType)
        putString("maskedPan", maskedPan)
        putString("responseCode", responseCode)
        putString("message", message)
        putString("timestamp", timestamp)
        putString("rawResponse", rawResponse)
      }
}

data class PaxScanResult(
    val success: Boolean,
    val runtimeMode: String,
    val code: String,
    val format: String,
    val message: String,
    val rawResponse: String,
) {
  fun toWritableMap(): WritableMap =
      Arguments.createMap().apply {
        putBoolean("success", success)
        putString("runtimeMode", runtimeMode)
        putString("code", code)
        putString("format", format)
        putString("message", message)
        putString("rawResponse", rawResponse)
      }
}

data class PaxPrintRequest(
    val html: String,
    val title: String,
)

data class PaxPrintResult(
    val success: Boolean,
    val runtimeMode: String,
    val message: String,
    val previewHtml: String,
    val rawResponse: String,
) {
  fun toWritableMap(): WritableMap =
      Arguments.createMap().apply {
        putBoolean("success", success)
        putString("runtimeMode", runtimeMode)
        putString("message", message)
        putString("previewHtml", previewHtml)
        putString("rawResponse", rawResponse)
      }
}

interface PaxDeviceClient {
  fun getCapabilities(): PaxCapabilities

  fun initialize(): PaxInitResult

  fun sale(request: PaxTransactionRequest): PaxTransactionResult

  fun refund(request: PaxTransactionRequest): PaxTransactionResult

  fun scanBarcode(onResult: (PaxScanResult) -> Unit)

  fun printReceipt(request: PaxPrintRequest, onResult: (Result<PaxPrintResult>) -> Unit)
}