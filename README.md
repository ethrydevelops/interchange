# interchange
Secure E2EE messaging for all

## Security, Privacy & Transparency
Interchange is end-to-end encrypted, using AES-256 for symmetric encryption and [OpenPGP.js](https://openpgpjs.org/) for asymmetric encryption.

PGP is not yet quantum-safe and therefore may currently be susceptible to Harvest Now, Decrypt Later (HNDL) attacks. Due to this risk, it is recommended that high-profile or high-threat journalists and activist organizations consider self-hosting Interchange on a server they control. Proton, the maintainers of OpenPGP.js are [aware of this risk](https://proton.me/blog/post-quantum-encryption), and Interchange will be updated to use this safer standard when it is standardized and feasible to do so.

Although unrelated to this repository, the main public instance of Interchange is hosted in New Zealand. Warrants or court orders for this instance issued by New Zealand authorities may expose the limited metadata we hold.