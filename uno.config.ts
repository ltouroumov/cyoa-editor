import {defineConfig, presetAttributify, presetIcons, presetTypography, presetUno} from "unocss";

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons(),
    presetAttributify(),
    presetTypography()
  ]
})