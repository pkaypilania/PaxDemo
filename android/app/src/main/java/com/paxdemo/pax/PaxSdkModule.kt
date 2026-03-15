package com.paxdemo.pax

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.paxdemo.NativePaxSdkSpec

@ReactModule(name = PaxSdkModule.NAME)
class PaxSdkModule(reactContext: ReactApplicationContext) : NativePaxSdkSpec(reactContext) {
  private val deviceClient: PaxDeviceClient = ReflectivePaxDeviceClient(reactContext)

  override fun getName(): String = NAME

  override fun getCapabilities(promise: Promise) {
    promise.resolve(deviceClient.getCapabilities().toWritableMap())
  }

  override fun initialize(promise: Promise) {
    val result =
        runCatching { deviceClient.initialize() }
            .getOrElse { error ->
              PaxInitResult(
                  success = false,
                  runtimeMode = "native",
                  message = error.message.orEmpty().ifBlank { "Unable to initialize PAX SDK." },
                  deviceId = "",
                  serialNumber = "",
                  sdkVersion = deviceClient.getCapabilities().sdkVersion,
                  rawResponse = error.stackTraceToString(),
              )
            }

    promise.resolve(result.toWritableMap())
  }

  override fun sale(request: ReadableMap, promise: Promise) {
    val transactionRequest = request.toTransactionRequest()
    val result =
        runCatching { deviceClient.sale(transactionRequest) }
            .getOrElse { error ->
              buildTransactionFailure(
                  type = "sale",
                  request = transactionRequest,
                  message = error.message.orEmpty().ifBlank { "Sale request failed." },
                  rawResponse = error.stackTraceToString(),
              )
            }

    promise.resolve(result.toWritableMap())
  }

  override fun refund(request: ReadableMap, promise: Promise) {
    val transactionRequest = request.toTransactionRequest()
    val result =
        runCatching { deviceClient.refund(transactionRequest) }
            .getOrElse { error ->
              buildTransactionFailure(
                  type = "refund",
                  request = transactionRequest,
                  message = error.message.orEmpty().ifBlank { "Refund request failed." },
                  rawResponse = error.stackTraceToString(),
              )
            }

    promise.resolve(result.toWritableMap())
  }

  override fun scanBarcode(promise: Promise) {
    deviceClient.scanBarcode { result ->
      promise.resolve(result.toWritableMap())
    }
  }

  override fun printReceipt(request: ReadableMap, promise: Promise) {
    val printRequest =
        PaxPrintRequest(
            html = request.getString("html").orEmpty(),
            title = request.getString("title").orEmpty(),
        )

    deviceClient.printReceipt(printRequest) { result ->
      val resolvedResult =
          result.getOrElse { error ->
            PaxPrintResult(
                success = false,
                runtimeMode = "native",
                message = error.message.orEmpty().ifBlank { "Receipt print failed." },
                previewHtml = printRequest.html,
                rawResponse = error.stackTraceToString(),
            )
          }

      promise.resolve(resolvedResult.toWritableMap())
    }
  }

  private fun buildTransactionFailure(
      type: String,
      request: PaxTransactionRequest,
      message: String,
      rawResponse: String,
  ): PaxTransactionResult {
    return PaxTransactionResult(
        success = false,
        runtimeMode = "native",
        type = type,
        amount = request.amount,
        transactionId = "",
        referenceId = request.referenceId,
        authorizationCode = "",
        cardType = "",
        maskedPan = "",
        responseCode = "ERROR",
        message = message,
        timestamp = java.time.Instant.now().toString(),
        rawResponse = rawResponse,
    )
  }

  private fun ReadableMap.toTransactionRequest(): PaxTransactionRequest {
    return PaxTransactionRequest(
        amount = getString("amount").orEmpty(),
        referenceId = getString("referenceId").orEmpty(),
    )
  }

  companion object {
    const val NAME = "PaxSdkModule"
  }
}