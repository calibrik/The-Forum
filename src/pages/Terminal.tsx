import type { FC } from "react";
import styles from "../scss/systemApp.module.scss";
import { Terminal as TerminalIcon } from "../components/Icons";
interface ITerminalProps { };

export const Terminal: FC<ITerminalProps> = (_) => {
    return (
        <div className={styles.container}>
            <div className={styles.appContainer}>
                <div className={styles.headerDiv}>
                    <TerminalIcon className={styles.icon} />
                    <span className={styles.appLabel}>Terminal</span>
                </div>
                <div className={styles.contentDiv}>
                    <p className={styles.contentTerminal}>
                        {`root@97fc757e03d9:/home/ctf# apt update&&apt upgrade -y
Hit:1 http://deb.debian.org/debian trixie InRelease
Get:2 http://deb.debian.org/debian trixie-updates InRelease [47.3 kB]
Get:3 http://deb.debian.org/debian-security trixie-security InRelease [43.4 kB]
Get:4 http://deb.debian.org/debian-security trixie-security/main amd64 Packages [71.4 kB]
Fetched 162 kB in 0s (1260 kB/s)
4 packages can be upgraded. Run 'apt list --upgradable' to see them.
Upgrading:
  libssl3t64  linux-libc-dev  openssl  openssl-provider-legacy

Summary:
  Upgrading: 4, Installing: 0, Removing: 0, Not Upgrading: 0
  Download size: 6909 kB
  Space needed: 16.4 kB / 989 GB available

Get:1 http://deb.debian.org/debian-security trixie-security/main amd64 openssl-provider-legacy amd64 3.5.1-1+deb13u1 [307 kB]
Get:2 http://deb.debian.org/debian-security trixie-security/main amd64 libssl3t64 amd64 3.5.1-1+deb13u1 [2437 kB]
Get:3 http://deb.debian.org/debian-security trixie-security/main amd64 linux-libc-dev all 6.12.48-1 [2671 kB]
Get:4 http://deb.debian.org/debian-security trixie-security/main amd64 openssl amd64 3.5.1-1+deb13u1 [1494 kB]
Fetched 6909 kB in 0s (23.6 MB/s)
debconf: unable to initialize frontend: Dialog
debconf: (No usable dialog-like program is installed, so the dialog based frontend cannot be used. at /usr/share/perl5/Debconf/FrontEnd/Dialog.pm line 79, <STDIN> line 4.)
debconf: falling back to frontend: Readline
(Reading database ... 28243 files and directories currently installed.)
Preparing to unpack .../openssl-provider-legacy_3.5.1-1+deb13u1_amd64.deb ...
Unpacking openssl-provider-legacy (3.5.1-1+deb13u1) over (3.5.1-1) ...
Setting up openssl-provider-legacy (3.5.1-1+deb13u1) ...
(Reading database ... 28243 files and directories currently installed.)
Preparing to unpack .../libssl3t64_3.5.1-1+deb13u1_amd64.deb ...
Unpacking libssl3t64:amd64 (3.5.1-1+deb13u1) over (3.5.1-1) ...
Setting up libssl3t64:amd64 (3.5.1-1+deb13u1) ...
(Reading database ... 28243 files and directories currently installed.)
Preparing to unpack .../linux-libc-dev_6.12.48-1_all.deb ...
Unpacking linux-libc-dev (6.12.48-1) over (6.12.43-1) ...
Preparing to unpack .../openssl_3.5.1-1+deb13u1_amd64.deb ...
Unpacking openssl (3.5.1-1+deb13u1) over (3.5.1-1) ...
Setting up linux-libc-dev (6.12.48-1) ...
Setting up openssl (3.5.1-1+deb13u1) ...
Processing triggers for libc-bin (2.41-12) ...
root@97fc757e03d9:/home/ctf#`}
                    </p>
                </div>
            </div>
        </div>
    );
}
