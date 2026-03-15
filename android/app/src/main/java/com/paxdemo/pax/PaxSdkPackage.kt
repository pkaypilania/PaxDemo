package com.paxdemo.pax

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.paxdemo.BuildConfig

class PaxSdkPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return when (name) {
      PaxSdkModule.NAME -> PaxSdkModule(reactContext)
      else -> null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    val moduleList: Array<Class<out NativeModule>> = arrayOf(PaxSdkModule::class.java)
    val reactModuleInfoMap = HashMap<String, ReactModuleInfo>()

    for (moduleClass in moduleList) {
      val reactModule = moduleClass.getAnnotation(ReactModule::class.java) ?: continue
      reactModuleInfoMap[reactModule.name] =
          ReactModuleInfo(
              reactModule.name,
              moduleClass.name,
              reactModule.canOverrideExistingModule,
              reactModule.needsEagerInit,
              reactModule.isCxxModule,
              BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          )
    }

    return ReactModuleInfoProvider { reactModuleInfoMap }
  }
}