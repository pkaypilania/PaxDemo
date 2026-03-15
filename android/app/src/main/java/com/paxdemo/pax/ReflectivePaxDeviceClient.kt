package com.paxdemo.pax

import android.content.Context
import android.os.Build
import com.izettle.html2bitmap.Html2Bitmap
import com.izettle.html2bitmap.content.WebViewContent
import com.pax.poslink.CommSetting
import com.pax.poslink.ManageRequest
import com.pax.poslink.POSLinkAndroid
import com.pax.poslink.PaymentRequest
import com.pax.poslink.ProcessTransResult
import com.pax.poslink.PosLink
import com.pax.poslink.entity.ScanResult
import com.pax.poslink.peripheries.POSLinkPrinter
import com.pax.poslink.peripheries.POSLinkScanner
import com.pax.poslink.peripheries.ProcessResult
import java.time.Instant

class ReflectivePaxDeviceClient(private val context: Context) : PaxDeviceClient {
  private val appContext = context.applicationContext

  override fun getCapabilities(): PaxCapabilities {
    val manufacturer = Build.MANUFACTURER.orEmpty().ifBlank { "Unknown" }
    val model = Build.MODEL.orEmpty().ifBlank { "Unknown" }
    val sdkVersion = resolveSdkVersion()

    val probeResult = runCatching { initPosLinkTransaction() }
    val isNativeSupported =
        probeResult.isSuccess &&
            probeResult.getOrNull()?.Code == ProcessTransResult.ProcessTransResultCode.OK

    val reason =
        when {
          isNativeSupported -> "PAX SDK is available and native runtime probe succeeded."
          probeResult.isFailure ->
              "PAX SDK runtime probe failed: ${probeResult.exceptionOrNull()?.message.orEmpty().ifBlank { "Unknown runtime error" }}"
          else -> {
            val trans = probeResult.getOrNull()
            "PAX SDK runtime probe failed with code=${trans?.Code} message=${trans?.Msg}"
          }
        }

    return PaxCapabilities(
        platform = "android",
        runtimeMode = if (isNativeSupported) "native" else "mock",
        isNativeSupported = isNativeSupported,
        isSdkAvailable = true,
        canInitialize = isNativeSupported,
        canTransact = isNativeSupported,
        canScan = isNativeSupported,
        canPrint = isNativeSupported,
        manufacturer = manufacturer,
        model = model,
        sdkVersion = sdkVersion,
        reason = reason,
    )
  }

  override fun initialize(): PaxInitResult {
    return try {
      val trans = initPosLinkTransaction()
      PaxInitResult(
          success = trans.Code == ProcessTransResult.ProcessTransResultCode.OK,
          runtimeMode = "native",
          message = trans.Msg.toString(),
          deviceId = Build.DEVICE.orEmpty(),
          serialNumber = "",
          sdkVersion = resolveSdkVersion(),
          rawResponse = mapOf("code" to trans.Code.toString(), "message" to trans.Msg.toString()).toString(),
      )
    } catch (error: Throwable) {
      PaxInitResult(
          success = false,
          runtimeMode = "native",
          message = error.message.orEmpty().ifBlank { "Unable to initialize PAX SDK." },
          deviceId = Build.DEVICE.orEmpty(),
          serialNumber = "",
          sdkVersion = resolveSdkVersion(),
          rawResponse = error.stackTraceToString(),
      )
    }
  }

  override fun sale(request: PaxTransactionRequest): PaxTransactionResult =
      processTransaction(request = request, transactionType = "SALE", resultType = "sale")

  override fun refund(request: PaxTransactionRequest): PaxTransactionResult =
      processTransaction(request = request, transactionType = "RETURN", resultType = "refund")

  override fun scanBarcode(onResult: (PaxScanResult) -> Unit) {
    try {
      val scanner = POSLinkScanner.getPOSLinkScanner(appContext, "FRONT")
      val openResult = scanner.open()
      if (openResult.code != ProcessResult.CODE_OK) {
        onResult(
            PaxScanResult(
                success = false,
                runtimeMode = "native",
                code = "",
                format = "",
                message = openResult.message.orEmpty().ifBlank { "Failed to start barcode scanning." },
                rawResponse = mapOf("code" to openResult.code, "message" to openResult.message).toString(),
            ))
        return
      }

      var barcode = ""
      var barcodeFormat = ""
      scanner.start(
          object : POSLinkScanner.IScanListener {
            override fun onRead(scanResult: ScanResult) {
              barcode = scanResult.content.orEmpty()
              barcodeFormat = scanResult.format.orEmpty()
            }

            override fun onFinish() {
              scanner.close()
              onResult(
                  PaxScanResult(
                      success = barcode.isNotBlank(),
                      runtimeMode = "native",
                      code = barcode,
                      format = barcodeFormat,
                      message =
                          if (barcode.isNotBlank()) {
                            "Barcode captured successfully."
                          } else {
                            "Scanner completed without barcode data."
                          },
                      rawResponse =
                          mapOf("barcode" to barcode, "format" to barcodeFormat).toString(),
                  ))
            }
          })
    } catch (error: Throwable) {
      onResult(
          PaxScanResult(
              success = false,
              runtimeMode = "native",
              code = "",
              format = "",
              message = error.message.orEmpty().ifBlank { "Unable to scan barcode." },
              rawResponse = error.stackTraceToString(),
          ))
    }
  }

  override fun printReceipt(request: PaxPrintRequest, onResult: (Result<PaxPrintResult>) -> Unit) {
    try {
      val printer = POSLinkPrinter.getInstance(appContext)
      val recommendedWidth = printer.recommendWidth
      val bitmap =
          Html2Bitmap.Builder()
              .setContext(appContext)
              .setContent(WebViewContent.html(request.html))
              .setBitmapWidth(recommendedWidth)
              .build()
              .bitmap

      printer.print(
          bitmap,
          POSLinkPrinter.CutMode.FULL_PAPER_CUT,
          object : POSLinkPrinter.PrintListener {
            override fun onSuccess() {
              onResult(
                  Result.success(
                      PaxPrintResult(
                          success = true,
                          runtimeMode = "native",
                          message = "Receipt printed successfully.",
                          previewHtml = request.html,
                          rawResponse =
                              mapOf("title" to request.title, "recommendedWidth" to recommendedWidth).toString(),
                      )))
            }

            override fun onError(processResult: ProcessResult) {
              onResult(
                  Result.failure(
                      IllegalStateException(
                          processResult.message.orEmpty().ifBlank { "Receipt printing failed." })))
            }
          })
    } catch (error: Throwable) {
      onResult(Result.failure(error))
    }
  }

  private fun processTransaction(
      request: PaxTransactionRequest,
      transactionType: String,
      resultType: String,
  ): PaxTransactionResult {
    return try {
      val posLink = PosLink(appContext)
      posLink.SetCommSetting(createCommSetting())

      val paymentRequest = PaymentRequest()
      paymentRequest.TenderType = paymentRequest.ParseTenderType("DEBIT")
      paymentRequest.TransType = paymentRequest.ParseTransType(transactionType)
      paymentRequest.ECRRefNum = request.referenceId
      paymentRequest.Amount = request.amount
      paymentRequest.ExtData = "<ReceiptPrint>0</ReceiptPrint>"
      posLink.PaymentRequest = paymentRequest

      val processTrans = posLink.ProcessTrans()
      val timestamp = Instant.now().toString()
      if (processTrans.Code == ProcessTransResult.ProcessTransResultCode.OK) {
        val response = posLink.PaymentResponse
        PaxTransactionResult(
            success = response.ResultCode == "000000",
            runtimeMode = "native",
            type = resultType,
            amount = request.amount,
            transactionId = response.GatewayTransactionID.orEmpty(),
            referenceId = request.referenceId,
            authorizationCode = response.AuthCode.orEmpty(),
            cardType = response.CardType.orEmpty(),
            maskedPan = response.CardInfo?.toString().orEmpty(),
            responseCode = response.ResultCode.orEmpty(),
            message = response.ResultTxt.orEmpty().ifBlank { response.Message.orEmpty() },
            timestamp = timestamp,
            rawResponse =
                mapOf(
                        "GatewayTransactionID" to response.GatewayTransactionID,
                        "ResultCode" to response.ResultCode,
                        "ResultTxt" to response.ResultTxt,
                        "CardType" to response.CardType,
                        "CardInfo" to response.CardInfo?.toString(),
                    )
                    .toString(),
        )
      } else {
        PaxTransactionResult(
            success = false,
            runtimeMode = "native",
            type = resultType,
            amount = request.amount,
            transactionId = "",
            referenceId = request.referenceId,
            authorizationCode = "",
            cardType = "",
            maskedPan = "",
            responseCode = processTrans.Code.toString(),
            message = processTrans.Msg.orEmpty().ifBlank { "Transaction failed." },
            timestamp = timestamp,
            rawResponse = mapOf("Code" to processTrans.Code.toString(), "Msg" to processTrans.Msg).toString(),
        )
      }
    } catch (error: Throwable) {
      PaxTransactionResult(
          success = false,
          runtimeMode = "native",
          type = resultType,
          amount = request.amount,
          transactionId = "",
          referenceId = request.referenceId,
          authorizationCode = "",
          cardType = "",
          maskedPan = "",
          responseCode = "ERROR",
          message = error.message.orEmpty().ifBlank { "Transaction failed." },
          timestamp = Instant.now().toString(),
          rawResponse = error.stackTraceToString(),
      )
    }
  }

  private fun initPosLinkTransaction(): ProcessTransResult {
    val posLink = PosLink(appContext)
    posLink.SetCommSetting(createCommSetting())
    POSLinkAndroid.init(appContext)

    val manageReq = ManageRequest()
    manageReq.TransType = manageReq.ParseTransType("INIT")
    posLink.ManageRequest = manageReq
    return posLink.ProcessTrans()
  }

  private fun createCommSetting(): CommSetting {
    val commSetting = CommSetting()
    commSetting.type = CommSetting.AIDL
    commSetting.timeOut = "1200000"
    return commSetting
  }

  private fun resolveSdkVersion(): String {
    return POSLinkAndroid::class.java.`package`?.implementationVersion ?: "POSLink"
  }
}
