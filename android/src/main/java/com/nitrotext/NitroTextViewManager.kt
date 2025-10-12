package com.nitrotext

import com.facebook.react.uimanager.ReactStylesDiffMap
import com.facebook.react.uimanager.StateWrapper
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.views.view.ReactViewManager
import com.margelo.nitro.nitrotext.views.HybridNitroTextStateUpdater


/**
 * Represents the React Native `ViewManager` for the "NitroText" Nitro HybridView.
 */
open class NitroTextViewManager: ReactViewManager() {
  private val views = hashMapOf<ReactViewGroup, HybridNitroText>()

  override fun getName(): String {
    return "NitroText"
  }

  override fun createViewInstance(context: ThemedReactContext): ReactViewGroup {
    val hybridView = HybridNitroText(context)
    val view = hybridView.view
    views[view] = hybridView
    return view
  }

  override fun setPadding(view: ReactViewGroup?, left: Int, top: Int, right: Int, bottom: Int) {
    view?.setPadding(left, top, right, bottom)
  }

  override fun onDropViewInstance(view: ReactViewGroup) {
    super.onDropViewInstance(view)
    views.remove(view)
  }

  override fun updateState(view: ReactViewGroup, props: ReactStylesDiffMap, stateWrapper: StateWrapper): Any? {
    val hybridView = views[view] ?: throw Error("Couldn't find view $view in local views table!")

    // 1. Update each prop individually
    hybridView.beforeUpdate()
    HybridNitroTextStateUpdater.updateViewProps(hybridView, stateWrapper)
    hybridView.afterUpdate()

    // 2. Continue in base View props
    return super.updateState(view, props, stateWrapper)
  }
}
