// The hanzogui (Tamagui) config the GuiProvider needs — same recipe the
// @hanzo/booker render harness proved. @hanzo/booker renders inside GuiProvider.
import { defaultConfig } from "@hanzogui/config/v4";
import { createGui } from "hanzogui";

export const config = createGui(defaultConfig);
export default config;
