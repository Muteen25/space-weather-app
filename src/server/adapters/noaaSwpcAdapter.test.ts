import {
  parseAlertsProduct,
  parseKpProduct,
  parseMagProduct,
  parsePlasmaProduct,
  parseScalesProduct,
  resolveSolarWindEndpoint
} from "./noaaSwpcAdapter";

describe("NOAA SWPC adapter parsers", () => {
  it("parses solar wind plasma header-row products into typed telemetry", () => {
    const result = parsePlasmaProduct([
      ["time_tag", "density", "speed", "temperature"],
      ["2026-05-14 05:42:00.000", "2.98", "455.9", "48030"],
      ["2026-05-14 05:43:00.000", null, "476.1", "97788"]
    ]);

    expect(result).toEqual([
      {
        timestamp: "2026-05-14T05:42:00.000Z",
        densityPerCc: 2.98,
        speedKmPerSec: 455.9,
        temperatureK: 48030
      },
      {
        timestamp: "2026-05-14T05:43:00.000Z",
        densityPerCc: null,
        speedKmPerSec: 476.1,
        temperatureK: 97788
      }
    ]);
  });

  it("parses current RTSW solar wind plasma object products", () => {
    const result = parsePlasmaProduct([
      {
        time_tag: "2026-07-28T04:39:00",
        proton_density: 2.75,
        proton_speed: 369.14,
        proton_temperature: 24385
      }
    ]);

    expect(result).toEqual([
      {
        timestamp: "2026-07-28T04:39:00.000Z",
        densityPerCc: 2.75,
        speedKmPerSec: 369.14,
        temperatureK: 24385
      }
    ]);
  });

  it("parses magnetic field rows with Bz and Bt values", () => {
    const result = parseMagProduct([
      ["time_tag", "bx_gsm", "by_gsm", "bz_gsm", "lon_gsm", "lat_gsm", "bt"],
      ["2026-05-14 05:43:00.000", "-0.30", "6.87", "0.54", "92.48", "4.49", "6.89"]
    ]);

    expect(result).toEqual([
      {
        timestamp: "2026-05-14T05:43:00.000Z",
        bxGsmNt: -0.3,
        byGsmNt: 6.87,
        bzGsmNt: 0.54,
        longitudeGsmDeg: 92.48,
        latitudeGsmDeg: 4.49,
        btNt: 6.89
      }
    ]);
  });

  it("parses current RTSW magnetic field object products", () => {
    const result = parseMagProduct([
      {
        time_tag: "2026-07-28T04:39:00",
        bx_gsm: 4.12,
        by_gsm: -5.87,
        bz_gsm: 2.42,
        theta_gsm: 18.67,
        phi_gsm: 305.12,
        bt: 7.57
      }
    ]);

    expect(result).toEqual([
      {
        timestamp: "2026-07-28T04:39:00.000Z",
        bxGsmNt: 4.12,
        byGsmNt: -5.87,
        bzGsmNt: 2.42,
        longitudeGsmDeg: 305.12,
        latitudeGsmDeg: 18.67,
        btNt: 7.57
      }
    ]);
  });

  it("maps dashboard ranges to official NOAA solar-wind product paths", () => {
    expect(resolveSolarWindEndpoint("2h", "plasma")).toBe("/json/rtsw/rtsw_wind_1m.json");
    expect(resolveSolarWindEndpoint("6h", "mag")).toBe("/json/rtsw/rtsw_mag_1m.json");
    expect(resolveSolarWindEndpoint("24h", "plasma")).toBe("/json/rtsw/rtsw_wind_1m.json");
    expect(resolveSolarWindEndpoint("3d", "mag")).toBe("/json/rtsw/rtsw_mag_1m.json");
  });

  it("parses planetary K index rows and sorts latest last", () => {
    const result = parseKpProduct([
      { time_tag: "2026-05-14T03:00:00", Kp: 2.67, a_running: 8, station_count: 7 },
      { time_tag: "2026-05-14T00:00:00", Kp: 1.33, a_running: 5, station_count: 8 }
    ]);

    expect(result).toEqual([
      {
        timestamp: "2026-05-14T00:00:00.000Z",
        value: 1.33,
        aRunning: 5,
        stationCount: 8
      },
      {
        timestamp: "2026-05-14T03:00:00.000Z",
        value: 2.67,
        aRunning: 8,
        stationCount: 7
      }
    ]);
  });

  it("parses current and forecast NOAA G/R/S scales", () => {
    const result = parseScalesProduct({
      "0": {
        DateStamp: "2026-05-14",
        TimeStamp: "07:41:00",
        R: { Scale: "0", Text: "none" },
        S: { Scale: "1", Text: "minor" },
        G: { Scale: "2", Text: "moderate" }
      },
      "1": {
        DateStamp: "2026-05-15",
        TimeStamp: "00:00:00",
        R: { MinorProb: "40", MajorProb: "5" },
        S: { Prob: "5" },
        G: { Scale: "1", Text: "minor" }
      }
    });

    expect(result.current).toMatchObject({
      timestamp: "2026-05-14T07:41:00.000Z",
      gScale: "G2",
      rScale: "R0",
      sScale: "S1"
    });
    expect(result.forecast).toHaveLength(1);
  });

  it("extracts alert metadata and impacted systems from NOAA alert messages", () => {
    const result = parseAlertsProduct(
      [
        {
          product_id: "A30F",
          issue_datetime: "2026-05-13 09:07:51.300",
          message:
            "WATCH: Geomagnetic Storm Category G2 Predicted\nValid From: 2026 May 13 0907 UTC\nValid To: 2026 May 16 0000 UTC\nPotential Impacts: Spacecraft - Satellite orientation irregularities may occur.\nRadio - HF radio propagation can fade.\nAurora - Aurora may be seen."
        }
      ],
      new Date("2026-05-14T00:00:00.000Z")
    );

    expect(result[0]).toEqual(
      expect.objectContaining({
        id: "A30F-2026-05-13T09:07:51.300Z",
        title: "WATCH: Geomagnetic Storm Category G2 Predicted",
        status: "active",
        scale: "G2",
        affectedSystems: expect.arrayContaining(["Satellites", "HF radio communication", "Aurora visibility"])
      })
    );
  });
});
