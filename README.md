# VidRift public site and player documentation

Public landing page, embed examples and integration docs at https://vidrift.net.
The player is served from https://embed.vidrift.net; the legacy .in embed remains supported.

## Source names and selection (2026-10-18)

Orion is MovieBox. Vexon is the separate hosted movie source; Evion is the TV source.
Available hosted movies/TV start with the corresponding hosted source on our own
sites; explicit source choices remain available. Partner playback routing is unchanged.
A partner-owned CDN requires host-specific server provisioning and validation;
changing a global source URL is not a per-partner setting.

Keep this public repository free of internal topology, origin credentials,
signed playback URLs and account tokens. Use the existing deploy.sh for an
intentional site release; documentation-only maintenance needs no player restart.
