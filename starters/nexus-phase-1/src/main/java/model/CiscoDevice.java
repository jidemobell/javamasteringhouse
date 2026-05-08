package model;

import java.time.Instant;

/**
 * A concrete Resource. Cisco router, switch, anything addressable.
 *
 * TODO: implement the Resource interface.
 *   - id     should come from the constructor
 *   - type   should be the constant "cisco-device"
 *   - lastSeen starts at Instant.now() and is refreshed via touch()
 */
public class CiscoDevice {
    private final String id;
    private Instant lastSeen;

    public CiscoDevice(String id) {
        this.id = id;
        this.lastSeen = Instant.now();
    }

    public void touch() {
        this.lastSeen = Instant.now();
    }
}
