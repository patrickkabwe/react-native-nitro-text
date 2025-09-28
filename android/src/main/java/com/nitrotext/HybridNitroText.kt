package com.nitrotext

import android.os.Build
import android.view.View
import androidx.annotation.Keep
import androidx.annotation.RequiresApi
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.uimanager.ThemedReactContext
import com.margelo.nitro.nitrotext.*

@Keep
@DoNotStrip
class HybridNitroText(val context: ThemedReactContext) : HybridNitroTextSpec() {
  override val view: NitroTextView = NitroTextView(context)
  private val impl = NitroTextImpl(view.textView)

  override var fragments: Array<Fragment>?
    get() = null
    set(value) {
      impl.setFragments(value)
    }

  override var selectable: Boolean?
    get() = null
    set(value) {
      impl.setSelectable(value)
    }

  override var allowFontScaling: Boolean?
    get() = null
    set(value) {
      impl.setAllowFontScaling(value)
    }

  override var ellipsizeMode: EllipsizeMode?
    get() = null
    set(value) {
      impl.setEllipsizeMode(value)
    }

  override var numberOfLines: Double?
    get() = null
    set(value) {
      impl.setNumberOfLines(value)
    }

  override var lineBreakStrategyIOS: LineBreakStrategyIOS?
    get() = null
    set(value) {
      // iOS only
    }

  override var dynamicTypeRamp: DynamicTypeRamp?
    get() = null
    set(value) {
      // iOS only
    }

  override var maxFontSizeMultiplier: Double?
    get() = null
    set(value) {
      impl.setMaxFontSizeMultiplier(value)
    }

  override var adjustsFontSizeToFit: Boolean?
    get() = null
    set(value) {
      // TODO: Implement adjustsFontSizeToFit
    }

  override var minimumFontScale: Double?
    get() = null
    set(value) { value }

  override var onTextLayout: ((TextLayoutEvent) -> Unit)?
    get() = null
    set(value) {
      // TODO: Implement onTextLayout
    }

  override var onPress: (() -> Unit)?
    get() = null
    set(value) {
      // TODO: Implement onPress
    }

  override var onPressIn: (() -> Unit)?
    get() = null
    set(value) {
      // TODO: Implement onPressIn
    }

  override var onPressOut: (() -> Unit)?
    get() = null
    set(value) {
      // TODO: Implement onPressOut
    }

  override var text: String?
    get() = null
    set(value) {
      impl.setText(value)
    }

  override var selectionColor: String?
    get() = null
    set(value) {
      impl.setSelectionColor(value)
    }

  override var fontSize: Double?
    get() = null
    set(value) { impl.setFontSize(value) }

  override var fontWeight: FontWeight?
    get() = null
    set(value) { impl.setFontWeight(value) }

  override var fontColor: String?
    get() = null
    set(value) {
      impl.setFontColor(value)
    }

  override var fragmentBackgroundColor: String?
    get() = null
    set(value) {
      // TODO: Implement fragmentBackgroundColor
    }

  override var fontStyle: FontStyle?
    get() = null
    set(value) {  impl.setFontStyle(value) }

  override var fontFamily: String?
    get() = null
    set(value) { impl.setFontFamily(value) }

  override var lineHeight: Double?
    get() = null
    set(value) { impl.setLineHeight(value) }

  override var letterSpacing: Double?
    get() = null
    set(value) { impl.setLetterSpacing(value) }

  override var textAlign: TextAlign?
    get() = null
    set(value) { impl.setTextAlign(value) }

  override var textTransform: TextTransform?
    get() = null
    set(value) { impl.setTextTransform(value) }

  override var textDecorationLine: TextDecorationLine?
    get() = null
    set(value) { impl.setTextDecorationLine(value) }

  override var textDecorationColor: String?
    get() = null
    set(value) {impl.setTextDecorationColor(value) }

  override var textDecorationStyle: TextDecorationStyle?
    get() = null
    set(value) { impl.setTextDecorationStyle(value) }

  override fun afterUpdate() {
    impl.commit()
    view.requestLayout()
    view.invalidate()
  }
}
