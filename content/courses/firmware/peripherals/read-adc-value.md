+++
date = '2026-07-05T22:00:00+05:30'
draft = true
title = 'Read an ADC Value'
difficulty = 'easy'
language = 'c'
topic_weight = 2
subtopic_weight = 3
weight = 1
initial_code = '''#include <stdint.h>

uint16_t adc_read(int channel);

float read_voltage(void) {
    uint16_t raw = adc_read(0);
    float voltage = 0.0f;

    // Convert raw 12-bit ADC value to voltage (0.0 - 3.3V)

    return voltage;
}
'''

[[test_cases]]
input = '2048'
expected = 'ADC voltage in range'
+++

## Problem Statement

Read an analog value from ADC channel 0 and scale it to a voltage between 0.0 and 3.3 V. The ADC is 12-bit, so raw values range from 0 to 4095. Use the provided function `uint16_t adc_read(int channel)` to obtain the raw value. Compute `voltage = (raw / 4095.0) * 3.3` and return it as a `float`.

## Theory and Concepts

- **ADC resolution**: A 12-bit ADC produces 2¹² = 4096 discrete digital values. Each step represents 3.3 V / 4095 ≈ 0.8 mV.
- **Scaling**: The raw integer value must be converted to the corresponding voltage using the reference voltage and maximum digital value.
- **Floating-point arithmetic**: `float` is used for the result. Note the use of `4095.0` (a float literal) to force floating-point division instead of integer truncation.

## Real World Application

ADC reading is used in sensor interface firmware — measuring temperature (thermistors, thermocouples), light intensity (photodiodes), battery voltage, potentiometer position (joysticks, knobs), current sensing (motor drivers), and audio input. Scaling raw ADC values to engineering units is a daily task in embedded firmware development.

===EXPLANATION===

Analog-to-digital conversion is the bridge between the continuous physical world and the discrete digital domain of a microcontroller. Nearly every sensor in existence—temperature, pressure, light, sound, acceleration, magnetic field—produces an analog voltage that must be converted to a digital number before a CPU can process it. The ADC read and scale operation is therefore one of the most fundamental tasks in embedded firmware, performed billions of times per second across the world's microcontrollers.

The history of ADC technology spans from the early ramp-compare converters of the 1960s to today's high-speed successive approximation register (SAR) and sigma-delta converters integrated into every modern MCU. A typical Cortex-M microcontroller includes a 12-bit SAR ADC capable of 1–5 Msps. The resolution (12 bits = 4096 codes) determines the smallest detectable voltage change: with a 3.3 V reference, each LSB represents 3.3 / 4095 ≈ 0.8 mV. High-resolution applications (audio, precision sensing) use 16-bit or 24-bit sigma-delta ADCs.

The intuition is simple: the ADC produces an integer proportional to the input voltage relative to the reference voltage. If the reference is 3.3 V and the ADC reads 2048, the input voltage is approximately 3.3 * (2048 / 4095) = 1.65 V—exactly half the reference. The conversion formula `voltage = (raw / max_raw) * Vref` is universal. The gotcha is integer division: `raw / 4095` in C truncates to 0 for any raw < 4095. Using `4095.0` (a float literal) forces floating-point division. In production firmware, fixed-point arithmetic (scaling by a power of two) is often preferred to avoid floating-point overhead.

In professional firmware, ADC readings feed into control loops (motor current sensing), data acquisition (potentiometer joystick position for a drone), battery monitoring (fuel gauging in phones), and audio capture. The scaling step is typically followed by calibration—mapping the raw voltage to engineering units using a linear or polynomial transform. Temperature sensors may require a Steinhart-Hart equation; strain gauges need bridge completion and gain correction. The raw ADC-to-voltage conversion is just the first step in a chain of signal processing.

Picture the signal chain: a thermistor varies its resistance with temperature. A voltage divider converts this resistance to a voltage between 0 and 3.3 V. The ADC samples this voltage at a 12-bit resolution. The firmware reads the raw 12-bit value (0–4095), scales it to volts, then applies the thermistor's transfer function to compute temperature in degrees Celsius. The result is sent over I2C or displayed on an LCD. Each step—acquisition, scaling, calibration, output—must be correct and deterministic.

Key points:
1. Always use floating-point literals (e.g., `4095.0`) in the division to prevent integer truncation.
2. The reference voltage is not always exactly 3.3 V—measure it with a precision voltmeter and use the measured value for accuracy.
3. Oversampling and averaging can increase effective resolution: taking 64 samples and averaging gives 3 extra bits of resolution (12 + log2.
4. /2 = 15 bits).
5. ADC readings may require digital filtering (median filter, moving average) to remove noise.
6. The ADC Nyquist theorem requires sampling at >2× the highest frequency component in the signal.
7. The ADC input impedance may require a buffer amplifier for high-impedance sensors.


References:
1. STM32 Reference Manual (ADC chapter), "Embedded Systems: Introduction to ARM Cortex-M Microcontrollers" by Jonathan Valvano (Chapter on analog interfacing), Microchip AN693 (Understanding A/D Converter Performance Specifications), and "The Art of Electronics" by Horowitz and Hill (Chapter 13 on digital-to-analog and analog-to-digital conversion).
