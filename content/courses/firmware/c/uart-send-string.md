+++
date = '2026-07-05T22:00:00+05:30'
draft = true
title = 'UART Send String'
difficulty = 'medium'
language = 'c'
topic_weight = 2
subtopic_weight = 2
weight = 2
initial_code = '''void uart_putc(char c);

void uart_send_string(const char *str) {
    // Send each character until the null terminator
}
'''

[[test_cases]]
input = '"Hello"'
expected = 'String transmitted'
+++

## Problem Statement

Implement a function `uart_send_string` that transmits a null-terminated string over UART one character at a time. Use the provided blocking function `void uart_putc(char c)` to send each individual character. Do not use any standard library string functions.

## Theory and Concepts

- **UART communication**: Universal Asynchronous Receiver-Transmitter is a serial protocol for data exchange between devices. Characters are sent one bit at a time.
- **Blocking I/O**: `uart_putc` waits until the character has been transmitted before returning. This simplifies the code at the cost of tying up the CPU during transmission.
- **Null-terminated iteration**: The function reads characters from the string until it encounters the `'\0'` terminator.

## Real World Application

UART is one of the most common communication interfaces in embedded systems — used for debug logging, sensor data output, configuring modules via AT commands, and communicating with Wi-Fi/Bluetooth chips. Transmitting strings (human-readable messages, formatted data, command responses) is a frequent requirement in firmware development.

===EXPLANATION===

UART (Universal Asynchronous Receiver-Transmitter) is the simplest and most universal serial communication protocol in embedded systems. Sending a string over UART is the firmware equivalent of printing to the console on a desktop—it is how embedded devices talk to the outside world, whether for debug logging, sensor data reporting, or command-response protocols with external modules. Every embedded engineer must master this operation because UART debugging is often the only window into what a microcontroller is doing.

The UART protocol dates back to the 1960s with the RS-232 standard, used for teletype machines and mainframe terminals. Today's embedded UARTs are descendants of the 16550 UART chip popularized by early PCs. The protocol is elegantly simple: data is sent one bit at a time on a single wire (TX), at a negotiated baud rate (bits per second). A start bit (low) signals the beginning, followed by 5–9 data bits, an optional parity bit, and one or more stop bits (high). No clock signal is shared—the receiver synchronizes to the start bit edge and samples the data bits at the agreed rate.

The intuition is straightforward: `uart_putc(c)` writes a single character to the UART transmit data register. The UART hardware serializes the character: it adds the start bit, shifts out each data bit at the baud rate clock, adds the parity and stop bits, and drives the TX pin. The function returns only when the character has been completely transmitted (blocking mode) or when the data register is ready for the next character. `uart_send_string(str)` loops over each byte of the string, calling `uart_putc` for each, until it hits the null terminator (`\0`).

In professional firmware, string output over UART is used for both development and production communication. During development, UART printf is the primary debug output method before ITM/SWO or semihosting is set up. In production, UART is used for firmware update protocols (bootloader communication), AT command modems (ESP8266, GSM modules), sensor data streaming (GPS NMEA sentences), and command-line interfaces (CLI). Many production devices expose a UART debug console that never appeared in the schematics—engineers add it as a header for field diagnostics.

Picture the signal on the wire with a logic analyzer: idle is high. For the character 'A' (0x41 = 0b01000001), the line goes low for one bit period (start bit), then the bits are sent LSB-first: 1, 0, 0, 0, 0, 0, 1, 0 (data bits), then high for one or more bit periods (stop bit). At 115200 baud, each bit period is about 8.7 µs, so one character takes about 87 µs. A 100-character string takes about 8.7 ms to transmit—a significant blocking delay in a real-time system, which is why production code often uses DMA or interrupt-driven UART.

Key points:
1. String transmission is blocking by default—the CPU spins while each character is sent. Use interrupt or DMA for non-blocking operation.
2. Baud rate must match between sender and receiver within about 2% error tolerance.
3. The standard UART frame is 8-N-1: 8 data bits, No parity, 1 stop bit.
4. `uart_putc` typically polls the TXE (transmit data register empty) flag before writing the data register to avoid overwriting a byte being shifted out.
5. For binary data, do not use string functions—send the raw bytes along with a length or framing protocol.
6. Buffered UART drivers use a circular buffer for TX: the ISR pulls bytes from the buffer when the shift register is empty, minimizing CPU load.


References:
1. "Embedded Systems: Introduction to ARM Cortex-M Microcontrollers" by Jonathan Valvano (Chapter 6 on serial communication), STM32 Reference Manual (USART chapter), "Serial Port Complete" by Jan Axelson (comprehensive guide to RS-232 and UART), and the Linux serial programming guide (termios documentation).
