"use client";

import { createContext, useContext } from "react";

/**
 * Device preview mode for the tracking page. Because Tailwind's responsive prefixes
 * are viewport-based (not container-based), narrowing the frame alone won't collapse
 * the layout — components read this context to force a single-column mobile layout.
 */
export const DeviceContext = createContext<"desktop" | "mobile">("desktop");

export const useDevice = () => useContext(DeviceContext);
