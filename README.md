# interchange
Secure E2EE messaging for all

## Security
Interchange is end-to-end encrypted, using AES-256 for symmetric encryption and [OpenPGP.js](https://openpgpjs.org/) for asymmetric encryption.

**PGP is not yet quantum-safe** and therefore may currently be susceptible to Harvest Now, Decrypt Later (HNDL) attacks. Due to this risk, it is recommended that high-profile or high-threat journalists and activist organizations consider self-hosting Interchange on a server they control. Proton, the maintainers of OpenPGP.js are [aware of this risk](https://proton.me/blog/post-quantum-encryption), and are developing a safer protocol. Interchange will be updated to use a quantum-safe PGP standard when it is standardized and feasible to upgrade to.
