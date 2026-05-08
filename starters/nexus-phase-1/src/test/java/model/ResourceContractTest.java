package model;

import org.junit.jupiter.api.Test;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;

class ResourceContractTest {

    @Test
    void ciscoDeviceIsAResource() {
        CiscoDevice d = new CiscoDevice("router-1");
        assertTrue(d instanceof Resource, "CiscoDevice must implement Resource");
    }

    @Test
    void ciscoDeviceExposesIdentity() {
        Resource r = new CiscoDevice("router-1");
        assertEquals("router-1", r.getId());
    }

    @Test
    void ciscoDeviceExposesType() {
        Resource r = new CiscoDevice("router-1");
        assertEquals("cisco-device", r.getType());
    }

    @Test
    void ciscoDeviceExposesFreshness() {
        Resource r = new CiscoDevice("router-1");
        Instant seen = r.getLastSeen();
        assertNotNull(seen);
        assertFalse(seen.isAfter(Instant.now()));
    }
}
