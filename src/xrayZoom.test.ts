import { XRAY_ZOOM_POINT_COUNTS } from "./xrayZoom";

describe("X-ray zoom ranges", () => {
  it("uses one-minute point counts for each GOES X-ray zoom preset", () => {
    expect(XRAY_ZOOM_POINT_COUNTS).toEqual({
      "6h": 360,
      "1d": 1440,
      "3d": 4320,
      "7d": 10080
    });
  });
});

